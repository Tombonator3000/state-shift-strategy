import type { GameCard } from '../../types/cardTypes';

export const CORE_TRUTH_DECK: GameCard[] = [
  {
    id: 'truth-1',
    faction: 'truth',
    name: 'Leaked Documents',
    type: 'MEDIA',
    rarity: 'common',
    cost: 6,
    text: '+5% Truth. Draw 1 card.',
    flavorTruth: 'The people have a right to know.',
    flavorGov: 'Unauthorized disclosure detected.',
    target: { scope: 'global', count: 0 },
    effects: { truthDelta: 5, draw: 1 },
  },
  {
    id: 'truth-2',
    faction: 'truth',
    name: 'Investigative Report',
    type: 'MEDIA',
    rarity: 'common',
    cost: 5,
    text: '+4% Truth.',
    flavorTruth: 'Facts speak louder than fiction.',
    flavorGov: 'Misinformation campaign detected.',
    target: { scope: 'global', count: 0 },
    effects: { truthDelta: 4 },
  },
];

