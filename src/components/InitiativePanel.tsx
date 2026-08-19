import { useState } from "react";
import { formatModifier } from "../data/abilityScores";
import type { Combatant } from "../types/combatant";
import { CheckIcon, EditIcon } from "./icons";

interface InitiativePanelProps {
  sortedCombatants: Combatant[];
  activeId: string | null;
  onSetInitiative: (id: string, value: number | null) => void;
  onNextTurn: () => void;
}

export function InitiativePanel({
  sortedCombatants,
  activeId,
  onSetInitiative,
  onNextTurn,
}: InitiativePanelProps) {
  const [frozenIds, setFrozenIds] = useState<string[] | null>(null);
  const editing = frozenIds !== null;

  // While editing, keep row order stable (frozen at the moment edit mode was
  // entered) so rows don't jump around as values change - only re-sort on save.
  const displayList = editing
    ? (frozenIds
        .map((id) => sortedCombatants.find((c) => c.id === id))
        .filter(Boolean) as Combatant[])
    : sortedCombatants;

  return (
    <div className="initiative-panel">
      <div className="initiative-panel-actions">
        <button
          type="button"
          className="next-turn-button"
          onClick={onNextTurn}
          disabled={sortedCombatants.length === 0}
        >
          Next turn
        </button>
        <button
          type="button"
          className="edit-initiative-button"
          onClick={() =>
            setFrozenIds(editing ? null : sortedCombatants.map((c) => c.id))
          }
          aria-label={editing ? "Save initiative" : "Edit initiative"}
          title={editing ? "Save initiative" : "Edit initiative"}
        >
          {editing ? <CheckIcon /> : <EditIcon />}
        </button>
      </div>

      <ol className="initiative-list">
        {displayList.map((combatant) => (
          <li
            key={combatant.id}
            className={`initiative-item ${combatant.id === activeId ? "active" : ""}`}
          >
            {editing ? (
              <input
                className="initiative-value-input"
                type="number"
                value={combatant.initiative ?? ""}
                placeholder="-"
                onChange={(e) =>
                  onSetInitiative(
                    combatant.id,
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            ) : (
              <div
                className={`initiative-value ${combatant.id === activeId ? "active" : ""}`}
              >
                {combatant.initiative ?? "—"}
              </div>
            )}
            <div className="initiative-name-block">
              <span
                className={`initiative-name ${combatant.id === activeId ? "active" : ""}`}
              >
                {combatant.name}
              </span>
              {combatant.srdMonster && (
                <span className="initiative-dex">
                  (DEX {formatModifier(combatant.srdMonster.dexterity)})
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
