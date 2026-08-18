import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Combatant } from "../types/combatant";
import { DragHandleIcon } from "./icons";

interface EntityStatCardProps {
  combatant: Combatant;
  onRemove: (id: string) => void;
}

export function EntityStatCard({ combatant, onRemove }: EntityStatCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: combatant.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`entity-card ${isDragging ? "dragging" : ""}`}
    >
      <div className="entity-card-header">
        <button
          type="button"
          className="drag-handle"
          aria-label="Reorder"
          {...attributes}
          {...listeners}
        >
          <DragHandleIcon />
        </button>
        <div className="entity-card-title">
          <span className="entity-name">{combatant.name}</span>
          {combatant.srdMonster && (
            <span className="entity-detail">
              {combatant.srdMonster.size} {combatant.srdMonster.type},{" "}
              {combatant.srdMonster.alignment}
            </span>
          )}
        </div>
        <div className="entity-card-meta">
          <span className="entity-ac">AC {combatant.armor_class}</span>
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
      {combatant.actions && combatant.actions.length > 0 && (
        <ul className="entity-abilities">
          {combatant.actions.map((action) => (
            <li key={action.name}>
              <span className="ability-name">{action.name}.</span> {action.desc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
