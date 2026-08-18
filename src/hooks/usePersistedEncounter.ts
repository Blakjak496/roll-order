import { useEffect, useRef, useState } from 'react';
import type { Combatant } from '../types/combatant';

const STORAGE_KEY = 'roll-order:encounter';
const DEBOUNCE_MS = 300;

interface EncounterState {
  combatants: Combatant[];
  activeId: string | null;
}

function loadEncounter(): EncounterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { combatants: [], activeId: null };
    const parsed = JSON.parse(raw);
    return {
      combatants: Array.isArray(parsed.combatants) ? parsed.combatants : [],
      activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null,
    };
  } catch {
    return { combatants: [], activeId: null };
  }
}

// Single boundary for swapping localStorage out for a real backend later -
// everything else just reads/writes combatants and activeId as normal state.
export function usePersistedEncounter() {
  const [combatants, setCombatants] = useState<Combatant[]>(() => loadEncounter().combatants);
  const [activeId, setActiveId] = useState<string | null>(() => loadEncounter().activeId);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ combatants, activeId }));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [combatants, activeId]);

  function newEncounter() {
    setCombatants([]);
    setActiveId(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { combatants, setCombatants, activeId, setActiveId, newEncounter };
}
