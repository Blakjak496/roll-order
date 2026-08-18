export interface Condition {
  key: string;
  name: string;
  effect: string;
}

// Standard 5e conditions - static, never change, so hardcoded rather than fetched
export const CONDITIONS: Condition[] = [
  { key: 'blinded', name: 'Blinded', effect: "Can't see and automatically fails sight-based checks. Attack rolls against it have advantage; its attack rolls have disadvantage." },
  { key: 'charmed', name: 'Charmed', effect: "Can't attack the charmer or target them with harmful abilities. The charmer has advantage on social ability checks against it." },
  { key: 'deafened', name: 'Deafened', effect: "Can't hear and automatically fails hearing-based checks." },
  { key: 'exhaustion', name: 'Exhaustion', effect: 'Cumulative levels impose escalating penalties, from disadvantage on ability checks up to death at the highest level.' },
  { key: 'frightened', name: 'Frightened', effect: "Disadvantage on ability checks and attack rolls while the source of fear is in sight; can't willingly move closer to it." },
  { key: 'grappled', name: 'Grappled', effect: "Speed becomes 0. Ends if the grappler is incapacitated or the target is moved out of the grappler's reach." },
  { key: 'incapacitated', name: 'Incapacitated', effect: "Can't take actions or reactions." },
  { key: 'invisible', name: 'Invisible', effect: 'Impossible to see without special senses. Attacks against it have disadvantage; its attacks have advantage.' },
  { key: 'paralyzed', name: 'Paralyzed', effect: 'Incapacitated, and cannot move or speak. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and any hit within 5 ft. is a critical.' },
  { key: 'petrified', name: 'Petrified', effect: 'Transformed to stone; incapacitated, cannot move or speak, unaware of surroundings. Resistant to all damage and immune to poison and disease.' },
  { key: 'poisoned', name: 'Poisoned', effect: 'Disadvantage on attack rolls and ability checks.' },
  { key: 'prone', name: 'Prone', effect: 'Disadvantage on attack rolls. Melee attacks against it have advantage; ranged attacks have disadvantage. Costs half its movement to stand up.' },
  { key: 'restrained', name: 'Restrained', effect: 'Speed becomes 0, disadvantage on Dexterity saves. Attacks against it have advantage; its attacks have disadvantage.' },
  { key: 'stunned', name: 'Stunned', effect: 'Incapacitated, cannot move, and can speak only falteringly. Automatically fails Strength and Dexterity saves. Attacks against it have advantage.' },
  { key: 'unconscious', name: 'Unconscious', effect: 'Incapacitated, cannot move or speak, unaware of surroundings. Drops what it is holding and falls prone. Automatically fails Strength and Dexterity saves. Attacks against it have advantage, and any hit within 5 ft. is a critical.' },
];
