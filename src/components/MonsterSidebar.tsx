import { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { searchMonsters } from '../api/srdClient';
import type { MonsterSummary } from '../types/monster';

interface MonsterListItemProps {
  monster: MonsterSummary;
  selected: boolean;
  onSelect: () => void;
}

function MonsterListItem({ monster, selected, onSelect }: MonsterListItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `monster-${monster.index}`,
    data: { type: 'monster', index: monster.index, name: monster.name },
  });

  return (
    <li
      ref={setNodeRef}
      className={`monster-result ${isDragging ? 'dragging' : ''} ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      {...listeners}
      {...attributes}
    >
      {monster.name}
    </li>
  );
}

interface MonsterSidebarProps {
  onAdd: (index: string) => void;
}

export function MonsterSidebar({ onAdd }: MonsterSidebarProps) {
  const [query, setQuery] = useState('');
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
    if (selectedIndex && !results.some((m) => m.index === selectedIndex)) setSelectedIndex(null);
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
