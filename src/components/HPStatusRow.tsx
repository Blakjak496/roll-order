import type { Combatant } from '../types/combatant';

interface HPStatusRowProps {
  combatant: Combatant;
}

export function HPStatusRow({ combatant }: HPStatusRowProps) {
  return (
    <div className="hp-row">
      <span className="hp-row-name">{combatant.name}</span>
      <span className="hp-value">
        {combatant.currentHP} / {combatant.maxHP}
      </span>
      <div className="status-chips">
        {combatant.statuses.map((status) => (
          <span key={status} className="status-chip">
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}
