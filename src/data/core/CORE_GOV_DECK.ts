import type { GameCard } from '../../types/cardTypes';

export const CORE_GOV_DECK: GameCard[] = [
  {
    id: 'gov-1',
    faction: 'government',
    name: 'Propaganda Broadcast',
    type: 'MEDIA',
    rarity: 'common',
    cost: 5,
    text: 'Opponent discards 1 card at random.',
    flavorTruth: 'They twist the truth again.',
    flavorGov: 'Maintaining public order.',
    target: { scope: 'global', count: 0 },
    effects: { discardRandom: 1 },
  },
  {
    id: 'gov-2',
    faction: 'government',
    name: 'Security Crackdown',
    type: 'ATTACK',
    rarity: 'uncommon',
    cost: 8,
    text: '-5% Truth.',
    flavorTruth: 'A dark day for free speech.',
    flavorGov: 'Stability restored.',
    target: { scope: 'global', count: 0 },
    effects: { truthDelta: -5 },
  },
];

