// Shape comes from the SRD API response - reference only, never mutated
export interface MonsterSummary {
  index: string;
  name: string;
  url: string;
}

export interface MonsterSearchResponse {
  count: number;
  results: MonsterSummary[];
}

export interface MonsterDetail {
  index: string;
  name: string;
  armor_class: { value: number }[];
  hit_points: number;
  actions: { name: string; desc: string }[];
}
