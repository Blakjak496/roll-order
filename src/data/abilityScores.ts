export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatSignedModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function formatModifier(score: number): string {
  return formatSignedModifier(abilityModifier(score));
}
