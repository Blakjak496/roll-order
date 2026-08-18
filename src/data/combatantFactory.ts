import type { Combatant } from '../types/combatant';
import type { MonsterDetail } from '../types/monster';

export function monsterToCombatant(monster: MonsterDetail): Combatant {
  const hp = monster.hit_points;
  return {
    id: crypto.randomUUID(),
    sourceType: 'monster',
    templateIndex: monster.index,
    name: monster.name,
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
  initiativeBonus: number | null;
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
    initiative: player.initiativeBonus,
  };
}
