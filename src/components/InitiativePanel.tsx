import type { Combatant } from '../types/combatant';

interface InitiativePanelProps {
  combatants: Combatant[];
  activeId: string | null;
}

export function InitiativePanel({ combatants, activeId }: InitiativePanelProps) {
  const sorted = [...combatants].sort((a, b) => (b.initiative ?? -1) - (a.initiative ?? -1));

  return (
    <ol className="initiative-list">
      {sorted.map((combatant) => (
        <li
          key={combatant.id}
          className={`initiative-item ${combatant.id === activeId ? 'active' : ''}`}
        >
          <span className="initiative-value">{combatant.initiative ?? '-'}</span>
          <span className="initiative-name">{combatant.name}</span>
        </li>
      ))}
    </ol>
  );
}
