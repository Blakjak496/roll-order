import type { Combatant } from '../types/combatant';

export const mockCombatants: Combatant[] = [
  {
    id: '1',
    sourceType: 'player',
    name: 'Kael',
    ac: 16,
    maxHP: 34,
    currentHP: 34,
    statuses: [],
    initiative: 18,
  },
  {
    id: '2',
    sourceType: 'monster',
    templateIndex: 'goblin',
    name: 'Goblin',
    ac: 15,
    maxHP: 7,
    currentHP: 7,
    statuses: ['prone'],
    initiative: 14,
    abilities: [
      { name: 'Nimble Escape', desc: 'The goblin can take the Disengage or Hide action as a bonus action.' },
      { name: 'Scimitar', desc: 'Melee weapon attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.' },
    ],
  },
  {
    id: '3',
    sourceType: 'monster',
    templateIndex: 'goblin',
    name: 'Goblin',
    ac: 15,
    maxHP: 7,
    currentHP: 3,
    statuses: [],
    initiative: 9,
    abilities: [
      { name: 'Nimble Escape', desc: 'The goblin can take the Disengage or Hide action as a bonus action.' },
      { name: 'Scimitar', desc: 'Melee weapon attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.' },
    ],
  },
  {
    id: '4',
    sourceType: 'player',
    name: 'Ysolde',
    ac: 13,
    maxHP: 28,
    currentHP: 20,
    statuses: ['blinded'],
    initiative: 6,
  },
];
