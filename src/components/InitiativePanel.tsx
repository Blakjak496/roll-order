import { useEffect, useRef, useState } from "react";
import { abilityModifier, formatSignedModifier } from "../data/abilityScores";
import type { Combatant } from "../types/combatant";
import { CheckIcon, DiceIcon, EditIcon } from "./icons";

// Monsters carry a full ability score to derive this from; players just
// store the modifier directly since that's all the add-player form asks for
function getDexModifier(combatant: Combatant): number | null {
  if (combatant.srdMonster) return abilityModifier(combatant.srdMonster.dexterity);
  if (combatant.dexModifier != null) return combatant.dexModifier;
  return null;
}

const ROLL_DURATION_MS = 900;
const ROLL_TICK_MS = 60;

interface InitiativePanelProps {
  sortedCombatants: Combatant[];
  activeId: string | null;
  onSetInitiative: (id: string, value: number | null) => void;
  onSelectActive: (id: string) => void;
  onNextTurn: () => void;
}

export function InitiativePanel({
  sortedCombatants,
  activeId,
  onSetInitiative,
  onSelectActive,
  onNextTurn,
}: InitiativePanelProps) {
  const [frozenIds, setFrozenIds] = useState<string[] | null>(null);
  const [rollingValue, setRollingValue] = useState<number | null>(null);
  const rollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const editing = frozenIds !== null;
  const rolling = rollingValue !== null;

  // Cancel any in-flight roll animation on unmount, so it doesn't try to
  // update state after the panel's gone.
  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearInterval(rollTimerRef.current);
    };
  }, []);

  // While editing, keep row order stable (frozen at the moment edit mode was
  // entered) so rows don't jump around as values change - only re-sort on save.
  const displayList = editing
    ? (frozenIds
        .map((id) => sortedCombatants.find((c) => c.id === id))
        .filter(Boolean) as Combatant[])
    : sortedCombatants;

  function handleRoll() {
    if (!activeId || rolling) return;
    const activeCombatant = sortedCombatants.find((c) => c.id === activeId);
    if (!activeCombatant) return;
    const dexMod = getDexModifier(activeCombatant) ?? 0;

    const start = Date.now();
    setRollingValue(1 + Math.floor(Math.random() * 20));
    rollTimerRef.current = setInterval(() => {
      if (Date.now() - start >= ROLL_DURATION_MS) {
        if (rollTimerRef.current) clearInterval(rollTimerRef.current);
        rollTimerRef.current = null;
        const roll = 1 + Math.floor(Math.random() * 20);
        onSetInitiative(activeId, roll + dexMod);
        setRollingValue(null);
        return;
      }
      setRollingValue(1 + Math.floor(Math.random() * 20));
    }, ROLL_TICK_MS);
  }

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
          const isActive = combatant.id === activeId;
          const displayInitiative =
            isActive && rolling ? rollingValue : combatant.initiative;
          return (
            <li
              key={combatant.id}
              className={`initiative-item ${isActive ? "active" : ""}`}
              onClick={editing ? undefined : () => onSelectActive(combatant.id)}
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
                <div className={`initiative-value ${isActive ? "active" : ""}`}>
                  {displayInitiative ?? "—"}
                </div>
              )}
              <div className="initiative-name-block">
                <span className={`initiative-name ${isActive ? "active" : ""}`}>
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

      <button
        type="button"
        className="roll-initiative-button"
        onClick={handleRoll}
        disabled={!activeId || rolling || editing}
        title={
          activeId ? "Roll d20 initiative for the active entity" : "Tap an entity to make it active first"
        }
      >
        <DiceIcon />
        {rolling ? "Rolling…" : "Roll initiative"}
      </button>
    </div>
  );
}
