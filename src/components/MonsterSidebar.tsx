import { useEffect, useState } from 'react';
import { searchMonsters } from '../api/srdClient';
import type { MonsterSummary } from '../types/monster';

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
          <li key={monster.index}>{monster.name}</li>
        ))}
      </ul>
    </div>
  );
}
