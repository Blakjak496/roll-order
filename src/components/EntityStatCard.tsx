import type { Combatant } from '../types/combatant';

interface EntityStatCardProps {
  combatant: Combatant;
}

export function EntityStatCard({ combatant }: EntityStatCardProps) {
  return (
    <div className="entity-card">
      <div className="entity-card-header">
        <span className="entity-name">{combatant.name}</span>
        <span className="entity-ac">AC {combatant.ac}</span>
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
