import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { fetchMonster, searchMonsters } from "../api/srdClient";
import type { MonsterSummary } from "../types/monster";

// The search/list endpoint only returns index/name/url - challenge rating
// lives on the per-monster detail response, so each row fetches its own.
// A default (empty) search lists all ~330 monsters at once, well past the
// API's request budget (observed: ~50 requests before it starts 429ing), so
// fetches go through a small concurrency-limited queue that retries 429s
// with backoff, and resolved CRs are cached to localStorage so that budget
// is only ever spent once per monster, not once per session.
const CR_STORAGE_KEY = "roll-order:monster-cr-cache";

function loadCrCache(): Map<string, number> {
  try {
    const raw = localStorage.getItem(CR_STORAGE_KEY);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw) as Record<string, number>));
  } catch {
    return new Map();
  }
}

const crCache = loadCrCache();

function saveCrCache() {
  try {
    localStorage.setItem(
      CR_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(crCache)),
    );
  } catch {
    // ignore quota errors - CR is a nice-to-have, not persisted data
  }
}

const CR_MAX_CONCURRENT = 2;
const CR_MAX_RETRIES = 5;
let crActiveCount = 0;
const crQueue: (() => void)[] = [];

function runNextCrFetch() {
  if (crActiveCount >= CR_MAX_CONCURRENT || crQueue.length === 0) return;
  crActiveCount++;
  crQueue.shift()!();
}

function fetchCrWithRetry(index: string, attempt = 0): Promise<number> {
  return fetchMonster(index)
    .then((detail) => detail.challenge_rating)
    .catch((err: Error) => {
      if (err.message.includes("429") && attempt < CR_MAX_RETRIES) {
        const delay = 1000 * 2 ** attempt;
        return new Promise<void>((resolve) => setTimeout(resolve, delay)).then(
          () => fetchCrWithRetry(index, attempt + 1),
        );
      }
      throw err;
    });
}

function enqueueCrFetch(index: string): Promise<number> {
  return new Promise((resolve, reject) => {
    crQueue.push(() => {
      fetchCrWithRetry(index)
        .then((cr) => {
          crCache.set(index, cr);
          saveCrCache();
          resolve(cr);
        })
        .catch(reject)
        .finally(() => {
          crActiveCount--;
          runNextCrFetch();
        });
    });
    runNextCrFetch();
  });
}

function formatChallengeRating(cr: number) {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

interface MonsterListItemProps {
  monster: MonsterSummary;
  selected: boolean;
  onSelect: () => void;
}

function MonsterListItem({
  monster,
  selected,
  onSelect,
}: MonsterListItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `monster-${monster.index}`,
    data: { type: "monster", index: monster.index, name: monster.name },
  });
  const [cr, setCr] = useState<number | undefined>(() =>
    crCache.get(monster.index),
  );

  useEffect(() => {
    if (crCache.has(monster.index)) return;
    let cancelled = false;
    enqueueCrFetch(monster.index)
      .then((challengeRating) => {
        if (!cancelled) setCr(challengeRating);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [monster.index]);

  return (
    <li
      ref={setNodeRef}
      className={`monster-result ${isDragging ? "dragging" : ""} ${selected ? "selected" : ""}`}
      onClick={onSelect}
      {...listeners}
      {...attributes}
    >
      <span className="monster-result-name">{monster.name}</span>
      {cr !== undefined && (
        <span className="monster-result-cr">CR {formatChallengeRating(cr)}</span>
      )}
    </li>
  );
}

interface MonsterSidebarProps {
  onAdd: (index: string) => void;
}

export function MonsterSidebar({ onAdd }: MonsterSidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MonsterSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      searchMonsters(query)
        .then((res) => {
          setResults(res.results);
          setError(null);
        })
        .catch((err: Error) => setError(err.message));
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  // Results changed under the selection - drop a stale pick rather than adding the wrong thing
  useEffect(() => {
    if (selectedIndex && !results.some((m) => m.index === selectedIndex))
      setSelectedIndex(null);
  }, [results, selectedIndex]);

  const selectedMonster = results.find((m) => m.index === selectedIndex);

  return (
    <div className="monster-sidebar">
      <input
        className="monster-search"
        type="text"
        placeholder="Search monsters..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error && <p className="monster-search-error">{error}</p>}
      <ul className="monster-results">
        {results.map((monster) => (
          <MonsterListItem
            key={monster.index}
            monster={monster}
            selected={monster.index === selectedIndex}
            onSelect={() => setSelectedIndex(monster.index)}
          />
        ))}
      </ul>
      {selectedMonster && (
        <button
          type="button"
          className="add-selected-monster"
          onClick={() => {
            onAdd(selectedMonster.index);
            setSelectedIndex(null);
          }}
        >
          Add {selectedMonster.name}
        </button>
      )}
    </div>
  );
}
