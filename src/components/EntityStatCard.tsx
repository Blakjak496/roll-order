import type { Combatant } from '../types/combatant';

interface EntityStatCardProps {
  combatant: Combatant;
  onRemove: (id: string) => void;
}

export function EntityStatCard({ combatant, onRemove }: EntityStatCardProps) {
  return (
    <div className="entity-card">
      <div className="entity-card-header">
        <span className="entity-name">{combatant.name}</span>
        <div className="entity-card-meta">
          <span className="entity-ac">AC {combatant.ac}</span>
          <button
            type="button"
            className="entity-remove"
            onClick={() => onRemove(combatant.id)}
            aria-label={`Remove ${combatant.name}`}
          >
            ×
          </button>
        </div>
      </div>
      {combatant.abilities && combatant.abilities.length > 0 && (
        <ul className="entity-abilities">
          {combatant.abilities.map((ability) => (
            <li key={ability.name}>
              <span className="ability-name">{ability.name}.</span> {ability.desc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
