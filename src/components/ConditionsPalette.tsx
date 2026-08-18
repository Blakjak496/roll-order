import { useDraggable } from "@dnd-kit/core";
import { CONDITIONS } from "../data/conditions";
import type { Condition } from "../data/conditions";

import {
  GiEyeball,
  GiCharm,
  GiMute,
  GiTiredEye,
  GiDreadSkull,
  GiGrapple,
  GiStopSign,
  GiInvisible,
  GiBrokenBone,
  GiRock,
  GiPoison,
  GiHalfBodyCrawling,
  GiRopeCoil,
  GiKnockedOutStars,
  GiKnockout,
} from "react-icons/gi";

function getConditionIcon(condition: string) {
  switch (condition) {
    case "Blinded":
      return <GiEyeball />;
    case "Charmed":
      return <GiCharm />;
    case "Deafened":
      return <GiMute />;
    case "Exhaustion":
      return <GiTiredEye />;
    case "Frightened":
      return <GiDreadSkull />;
    case "Grappled":
      return <GiGrapple />;
    case "Incapacitated":
      return <GiStopSign />;
    case "Invisible":
      return <GiInvisible />;
    case "Paralyzed":
      return <GiBrokenBone />;
    case "Petrified":
      return <GiRock />;
    case "Poisoned":
      return <GiPoison />;
    case "Prone":
      return <GiHalfBodyCrawling />;
    case "Restrained":
      return <GiRopeCoil />;
    case "Stunned":
      return <GiKnockedOutStars />;
    case "Unconscious":
      return <GiKnockout />;
  }
}

function ConditionChip({ condition }: { condition: Condition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `condition-${condition.key}`,
    data: { type: "condition", key: condition.key, name: condition.name },
  });

  return (
    <div
      ref={setNodeRef}
      className={`condition-chip ${isDragging ? "dragging" : ""}`}
      title={condition.effect}
      {...listeners}
      {...attributes}
    >
      <div className="condition-icon">{getConditionIcon(condition.name)}</div>
      {condition.name}
    </div>
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
