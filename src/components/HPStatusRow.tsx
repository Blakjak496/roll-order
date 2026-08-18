import { useState } from 'react';
import type { Combatant } from '../types/combatant';
import { CONDITIONS } from '../data/conditions';

interface HPStatusRowProps {
  combatant: Combatant;
  onAdjustHP: (id: string, delta: number) => void;
  onAddStatus: (id: string, status: string) => void;
  onRemoveStatus: (id: string, status: string) => void;
}

export function HPStatusRow({ combatant, onAdjustHP, onAddStatus, onRemoveStatus }: HPStatusRowProps) {
  const [amount, setAmount] = useState(1);
  const availableConditions = CONDITIONS.filter((c) => !combatant.statuses.includes(c.key));

  return (
    <div className="hp-row">
      <span className="hp-row-name">{combatant.name}</span>

      <div className="hp-controls">
        <button type="button" onClick={() => onAdjustHP(combatant.id, -amount)} aria-label="Damage">
          -
        </button>
        <input
          className="hp-amount"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
        />
        <button type="button" onClick={() => onAdjustHP(combatant.id, amount)} aria-label="Heal">
          +
        </button>
        <span className="hp-value">
          {combatant.currentHP} / {combatant.maxHP}
        </span>
      </div>

      <div className="status-chips">
        {combatant.statuses.map((key) => {
          const condition = CONDITIONS.find((c) => c.key === key);
          return (
            <span key={key} className="status-chip" title={condition?.effect ?? ''}>
              {condition?.name ?? key}
              <button
                type="button"
                className="status-chip-remove"
                onClick={() => onRemoveStatus(combatant.id, key)}
                aria-label={`Remove ${condition?.name ?? key}`}
              >
                ×
              </button>
            </span>
          );
        })}
        {availableConditions.length > 0 && (
          <select
            className="add-status"
            value=""
            onChange={(e) => {
              if (e.target.value) onAddStatus(combatant.id, e.target.value);
            }}
          >
            <option value="">+ status</option>
            {availableConditions.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
