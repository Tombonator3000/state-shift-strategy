// MVP Core Cards - Direct import from batches (bypassing migration for now)
// This ensures cards load reliably without import-time migration issues

import type { MVPCard } from '@/types/mvp-types';
import type { GameCard } from '@/types/cardTypes';

// Import all card batches directly
import { CORE_BATCH_TRUTH_1 } from './truth-batch-1';
import { CORE_BATCH_TRUTH_2 } from './truth-batch-2';
import { CORE_BATCH_TRUTH_3 } from './truth-batch-3';
import { CORE_BATCH_TRUTH_4 } from './truth-batch-4';
import { CORE_BATCH_TRUTH_5 } from './truth-batch-5';
import { CORE_BATCH_TRUTH_6 } from './truth-batch-6';
import { CORE_BATCH_TRUTH_7 } from './truth-batch-7';
import { CORE_BATCH_GOV_1 } from './government-batch-1';
import { CORE_BATCH_GOV_2 } from './government-batch-2';
import { CORE_GOV_DECK } from './CORE_GOV_DECK';
import { CORE_TRUTH_DECK } from './CORE_TRUTH_DECK';

// Simple adapter to convert GameCard to MVPCard format
function adaptToMVP(card: GameCard): MVPCard {
  // Convert DEFENSIVE to MEDIA, keep others as is
  let type: 'ATTACK' | 'MEDIA' | 'ZONE';
  if (card.type === 'DEFENSIVE') {
    type = 'MEDIA';
  } else {
    type = card.type as 'ATTACK' | 'MEDIA' | 'ZONE';
  }

  return {
    id: card.id,
    name: card.name,
    faction: card.faction.toLowerCase() as 'truth' | 'government',
    type,
    rarity: card.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
    cost: card.cost,
    text: card.text,
    flavorTruth: card.flavorTruth,
    flavorGov: card.flavorGov,
    effects: card.effects || {},
    artId: (card as any).artId,
    tags: (card as any).tags,
  } as MVPCard;
}

// Collect all cards and convert to MVP format
const allCards: GameCard[] = [
  ...CORE_BATCH_TRUTH_1,
  ...CORE_BATCH_TRUTH_2,
  ...CORE_BATCH_TRUTH_3,
  ...CORE_BATCH_TRUTH_4,
  ...CORE_BATCH_TRUTH_5,
  ...CORE_BATCH_TRUTH_6,
  ...CORE_BATCH_TRUTH_7,
  ...CORE_BATCH_GOV_1,
  ...CORE_BATCH_GOV_2,
  ...CORE_GOV_DECK,
  ...CORE_TRUTH_DECK,
];

export const MVP_CORE_CARDS: MVPCard[] = allCards.map(adaptToMVP);

console.log(`✅ MVP Cards loaded: ${MVP_CORE_CARDS.length} cards`);

export default MVP_CORE_CARDS;