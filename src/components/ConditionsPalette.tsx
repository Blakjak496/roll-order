import { useDraggable } from '@dnd-kit/core';
import { CONDITIONS } from '../data/conditions';
import type { Condition } from '../data/conditions';

function ConditionChip({ condition }: { condition: Condition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `condition-${condition.key}`,
    data: { type: 'condition', key: condition.key, name: condition.name },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`condition-chip ${isDragging ? 'dragging' : ''}`}
      title={condition.effect}
      {...listeners}
      {...attributes}
    >
      {condition.name}
    </button>
  );
}

// Drag one of these onto a combatant's HP row to apply it
export function ConditionsPalette() {
  return (
    <div className="conditions-palette">
      <h3 className="conditions-title">Conditions</h3>
      <div className="conditions-grid">
        {CONDITIONS.map((condition) => (
          <ConditionChip key={condition.key} condition={condition} />
        ))}
      </div>
    </div>
  );
}
