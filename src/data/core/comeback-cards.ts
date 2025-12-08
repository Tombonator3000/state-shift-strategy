// Comeback/Catch-up Cards - Help losing players make dramatic comebacks
// Simplified for MVP - complex conditionals need CardEffects extension
import type { GameCard } from '@/rules/mvp';

export const COMEBACK_CARDS: GameCard[] = [
  // Truth Faction - Basic comeback cards
  {
    id: 'comeback-truth-01',
    name: 'Underdog Rally',
    type: 'MEDIA',
    faction: 'truth',
    rarity: 'uncommon',
    cost: 3,
    text: '+3% Truth. Stronger when behind (conditionals TBD).',
    flavor: 'The people love a good comeback story.',
    effects: { truthDelta: 3, draw: 1 },
  },
  {
    id: 'comeback-truth-02',
    name: 'Grassroots Surge',
    type: 'ZONE',
    faction: 'truth',
    rarity: 'rare',
    cost: 4,
    text: '+3 Pressure to target.',
    flavor: 'When the establishment gets too strong, the people rise up.',
    effects: { pressureDelta: 3 },
  },

  // Government Faction - Basic comeback cards
  {
    id: 'comeback-gov-01',
    name: 'Emergency Powers',
    type: 'MEDIA',
    faction: 'government',
    rarity: 'uncommon',
    cost: 3,
    text: '-3% Truth and gain +3 IP.',
    flavor: 'Crisis requires extraordinary measures.',
    effects: { truthDelta: -3, ipDelta: { self: 3 } },
  },
  {
    id: 'comeback-gov-02',
    name: 'Contingency Protocol',
    type: 'ZONE',
    faction: 'government',
    rarity: 'rare',
    cost: 4,
    text: '+2 Defense to all your states.',
    flavor: 'Backup plans have backup plans.',
    effects: { defenseToAllStates: 2 },
  },
];
