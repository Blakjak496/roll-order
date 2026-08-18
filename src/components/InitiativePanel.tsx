import type { Combatant } from '../types/combatant';

interface InitiativePanelProps {
  sortedCombatants: Combatant[];
  activeId: string | null;
  onSetInitiative: (id: string, value: number | null) => void;
  onNextTurn: () => void;
}

export function InitiativePanel({ sortedCombatants, activeId, onSetInitiative, onNextTurn }: InitiativePanelProps) {
  return (
    <div className="initiative-panel">
      <button
        type="button"
        className="next-turn-button"
        onClick={onNextTurn}
        disabled={sortedCombatants.length === 0}
      >
        Next turn
      </button>

      <ol className="initiative-list">
        {sortedCombatants.map((combatant) => (
          <li key={combatant.id} className={`initiative-item ${combatant.id === activeId ? 'active' : ''}`}>
            <input
              className="initiative-value-input"
              type="number"
              value={combatant.initiative ?? ''}
              placeholder="-"
              onChange={(e) =>
                onSetInitiative(combatant.id, e.target.value === '' ? null : Number(e.target.value))
              }
            />
            <span className="initiative-name">{combatant.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
