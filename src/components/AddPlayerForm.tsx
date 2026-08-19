import { useState } from "react";
import type { FormEvent } from "react";
import type { PlayerFormValues } from "../data/combatantFactory";

interface AddPlayerFormProps {
  onAdd: (player: PlayerFormValues) => void;
}

const EMPTY = { name: "", armor_class: "", maxHP: "", initiativeBonus: "" };

export function AddPlayerForm({ onAdd }: AddPlayerFormProps) {
  const [values, setValues] = useState(EMPTY);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = values.name.trim();
    const armor_class = Number(values.armor_class);
    const maxHP = Number(values.maxHP);
    if (
      !name ||
      !Number.isFinite(armor_class) ||
      !Number.isFinite(maxHP) ||
      maxHP <= 0
    )
      return;

    onAdd({
      name,
      armor_class,
      maxHP,
      initiativeBonus:
        values.initiativeBonus === "" ? null : Number(values.initiativeBonus),
    });
    setValues(EMPTY);
  }

  return (
    <form className="add-player-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="AC"
        value={values.armor_class}
        onChange={(e) => setValues({ ...values, armor_class: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Max HP"
        value={values.maxHP}
        onChange={(e) => setValues({ ...values, maxHP: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="DEX modifier (optional)"
        value={values.initiativeBonus}
        onChange={(e) =>
          setValues({ ...values, initiativeBonus: e.target.value })
        }
      />
      <button type="submit">Add player</button>
    </form>
  );
}
