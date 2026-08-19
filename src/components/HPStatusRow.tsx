import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Combatant } from '../types/combatant';
import { CONDITIONS } from '../data/conditions';
import { StatusChip } from './StatusChip';
import { HeartIcon } from './icons';

interface HPStatusRowProps {
  combatant: Combatant;
  onAdjustHP: (id: string, delta: number) => void;
  onAdjustMaxHP: (id: string, delta: number) => void;
  onAddStatus: (id: string, status: string) => void;
  onRemoveStatus: (id: string, status: string) => void;
}

export function HPStatusRow({
  combatant,
  onAdjustHP,
  onAdjustMaxHP,
  onAddStatus,
  onRemoveStatus,
}: HPStatusRowProps) {
  const [amount, setAmount] = useState(1);
  const availableConditions = CONDITIONS.filter((c) => !combatant.statuses.includes(c.key));
  const { setNodeRef, isOver } = useDroppable({ id: `hp-row-${combatant.id}` });

  const hpRatio = combatant.maxHP > 0 ? combatant.currentHP / combatant.maxHP : 0;
  const hpState = hpRatio <= 0.25 ? 'danger' : hpRatio <= 0.5 ? 'warning' : 'good';

  return (
    <div ref={setNodeRef} className={`hp-row ${isOver ? 'drop-target' : ''}`}>
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
        <span className={`hp-value hp-${hpState}`}>
          <HeartIcon />
          {combatant.currentHP} / {combatant.maxHP}
        </span>
      </div>

      <div className="max-hp-controls">
        <span className="max-hp-label">Max HP</span>
        <button
          type="button"
          onClick={() => onAdjustMaxHP(combatant.id, -1)}
          aria-label="Decrease max HP"
        >
          -
        </button>
        <span className="max-hp-value">{combatant.maxHP}</span>
        <button
          type="button"
          onClick={() => onAdjustMaxHP(combatant.id, 1)}
          aria-label="Increase max HP"
        >
          +
        </button>
      </div>

      <div className="status-chips">
        {combatant.statuses.map((key) => {
          const condition = CONDITIONS.find((c) => c.key === key);
          return (
            <StatusChip
              key={key}
              name={condition?.name ?? key}
              effect={condition?.effect ?? ''}
              onRemove={() => onRemoveStatus(combatant.id, key)}
            />
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
