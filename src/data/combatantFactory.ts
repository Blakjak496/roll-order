import type { Combatant } from '../types/combatant';
import type { MonsterDetail } from '../types/monster';

// First of a name stays plain ("Goblin"); each further one gets numbered
// ("Goblin 2", "Goblin 3", ...) so the DM can tell multiple copies apart.
function nextEntityName(baseName: string, existing: Combatant[]): string {
  const escaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped}( \\d+)?$`);
  const occurrences = existing.filter((c) => pattern.test(c.name)).length;
  return occurrences === 0 ? baseName : `${baseName} ${occurrences + 1}`;
}

export function monsterToCombatant(monster: MonsterDetail, existing: Combatant[] = []): Combatant {
  const hp = monster.hit_points;
  return {
    id: crypto.randomUUID(),
    sourceType: 'monster',
    templateIndex: monster.index,
    name: nextEntityName(monster.name, existing),
    armor_class: monster.armor_class[0]?.value ?? 10,
    maxHP: hp,
    currentHP: hp,
    statuses: [],
    initiative: null,
    actions: monster.actions,
    srdMonster: monster,
  };
}

export interface PlayerFormValues {
  name: string;
  armor_class: number;
  maxHP: number;
  dexModifier: number | null;
}

export function playerToCombatant(player: PlayerFormValues): Combatant {
  return {
    id: crypto.randomUUID(),
    sourceType: 'player',
    name: player.name,
    armor_class: player.armor_class,
    maxHP: player.maxHP,
    currentHP: player.maxHP,
    statuses: [],
    // Set manually in the initiative panel, same as monsters - the DEX
    // modifier is display-only for now, not auto-applied to a roll
    initiative: null,
    dexModifier: player.dexModifier,
  };
}
