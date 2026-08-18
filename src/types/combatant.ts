export interface Ability {
  name: string;
  desc: string;
}

// Shape comes from the SRD API response - reference only, never mutated
export interface MonsterTemplate {
  index: string;
  name: string;
  armor_class: number;
  hit_points: number;
  actions: Ability[];
}

export type SourceType = 'monster' | 'player' | 'custom';

export interface Combatant {
  id: string;
  sourceType: SourceType;
  templateIndex?: string;
  name: string;
  ac: number;
  maxHP: number;
  currentHP: number;
  statuses: string[];
  initiative: number | null;
  abilities?: Ability[];
}
