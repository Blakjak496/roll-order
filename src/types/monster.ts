// Shape comes from the SRD API response - reference only, never mutated.
// Field names and nesting match the live API exactly (verified against
// /api/2014/monsters/{index} responses), not renamed/simplified for the app.

export interface MonsterSummary {
  index: string;
  name: string;
  url: string;
}

export interface MonsterSearchResponse {
  count: number;
  results: MonsterSummary[];
}

export interface ApiRef {
  index: string;
  name: string;
  url: string;
}

export interface ProficiencyEntry {
  value: number;
  proficiency: ApiRef;
}

export interface ArmorClassEntry {
  type: string; // "armor" | "natural" | "dex" | "spell" | "condition" | ...
  value: number;
  desc?: string;
  armor?: ApiRef[];
}

export interface Speed {
  walk?: string;
  fly?: string;
  swim?: string;
  climb?: string;
  burrow?: string;
  hover?: boolean;
}

export interface Senses {
  passive_perception: number;
  darkvision?: string;
  blindsight?: string;
  tremorsense?: string;
  truesight?: string;
}

export interface DamageEntry {
  damage_type: ApiRef;
  damage_dice: string;
}

export interface DifficultyClass {
  dc_type: ApiRef;
  dc_value: number;
  success_type: string;
}

export interface Usage {
  type: string;
  times?: number;
  dice?: string;
  min_value?: number;
  rest_types?: string[];
}

export interface SubAction {
  action_name: string;
  count: string | number;
  type: string;
}

export interface SpellRef {
  name: string;
  level: number;
  url: string;
}

export interface Spellcasting {
  level: number;
  ability: ApiRef;
  dc: number;
  modifier: number;
  components_required: string[];
  school: string;
  slots?: Record<string, number>;
  spells: SpellRef[];
}

// Shared by actions, legendary_actions, and reactions
export interface MonsterAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: DamageEntry[];
  dc?: DifficultyClass;
  usage?: Usage;
  multiattack_type?: string;
  actions?: SubAction[];
  spellcasting?: Spellcasting;
}

export interface SpecialAbility {
  name: string;
  desc: string;
  damage?: DamageEntry[];
  dc?: DifficultyClass;
  usage?: Usage;
  spellcasting?: Spellcasting;
}

export interface MonsterDetail {
  index: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: ArmorClassEntry[];
  hit_points: number;
  hit_dice: string;
  hit_points_roll: string;
  speed: Speed;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: ProficiencyEntry[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: ApiRef[];
  senses: Senses;
  languages: string;
  challenge_rating: number;
  proficiency_bonus: number;
  xp: number;
  special_abilities: SpecialAbility[];
  actions: MonsterAction[];
  legendary_actions: MonsterAction[];
  reactions: MonsterAction[];
  image?: string;
  url: string;
}
