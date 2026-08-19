import type { MonsterAction, MonsterDetail } from './monster';

export type SourceType = 'monster' | 'player' | 'custom';

export interface Combatant {
  id: string;
  sourceType: SourceType;
  templateIndex?: string;
  name: string;
  armor_class: number;
  maxHP: number;
  currentHP: number;
  statuses: string[];
  initiative: number | null;
  // Display-only DEX modifier for player combatants (monsters read theirs
  // from srdMonster.dexterity instead) - not applied to initiative automatically
  dexModifier?: number | null;
  // Snapshot at creation time, named to match the SRD's "actions" field it's copied from
  actions?: MonsterAction[];
  // Full raw SRD response, kept only for monster-sourced combatants so any
  // field (challenge_rating, senses, speed, ...) is available without
  // re-fetching or widening this type later
  srdMonster?: MonsterDetail;
}
