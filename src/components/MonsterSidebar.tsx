import { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { searchMonsters } from '../api/srdClient';
import type { MonsterSummary } from '../types/monster';

function MonsterListItem({ monster }: { monster: MonsterSummary }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `monster-${monster.index}`,
    data: { type: 'monster', index: monster.index, name: monster.name },
  });

  return (
    <li
      ref={setNodeRef}
      className={`monster-result ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      {monster.name}
    </li>
  );
}

export function MonsterSidebar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MonsterSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

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
          <MonsterListItem key={monster.index} monster={monster} />
        ))}
      </ul>
    </div>
  );
}
