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
