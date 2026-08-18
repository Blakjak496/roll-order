import type { MonsterDetail, MonsterSearchResponse } from '../types/monster';

const BASE_URL = import.meta.env.VITE_SRD_API_URL ?? 'http://localhost:3000/api/2014';

export async function searchMonsters(name: string): Promise<MonsterSearchResponse> {
  const url = name ? `${BASE_URL}/monsters?name=${encodeURIComponent(name)}` : `${BASE_URL}/monsters`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`SRD API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchMonster(index: string): Promise<MonsterDetail> {
  const res = await fetch(`${BASE_URL}/monsters/${index}`);
  if (!res.ok) {
    throw new Error(`SRD API error: ${res.status}`);
  }
  return res.json();
}
