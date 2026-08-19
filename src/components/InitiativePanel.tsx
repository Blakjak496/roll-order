import { useState } from "react";
import { abilityModifier, formatSignedModifier } from "../data/abilityScores";
import type { Combatant } from "../types/combatant";
import { CheckIcon, EditIcon } from "./icons";

// Monsters carry a full ability score to derive this from; players just
// store the modifier directly since that's all the add-player form asks for
function getDexModifier(combatant: Combatant): number | null {
  if (combatant.srdMonster) return abilityModifier(combatant.srdMonster.dexterity);
  if (combatant.dexModifier != null) return combatant.dexModifier;
  return null;
}

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
        {displayList.map((combatant) => {
          const dexMod = getDexModifier(combatant);
          return (
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
                {dexMod !== null && (
                  <span className="initiative-dex">
                    (DEX {formatSignedModifier(dexMod)})
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
