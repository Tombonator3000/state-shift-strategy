import type { GameCard } from '../../types/cardTypes';

// TRUTH (4 × 50)
import { truthBatch1 } from './truth-batch-1';
import { truthBatch2 } from './truth-batch-2';
import { truthBatch3 } from './truth-batch-3';
import { truthBatch4 } from './truth-batch-4';

// GOVERNMENT (4 × 50)
import { governmentBatch1 } from './government-batch-1';
import { governmentBatch2 } from './government-batch-2';
import { governmentBatch3 } from './government-batch-3';
import { governmentBatch4 } from './government-batch-4';

export const CARD_DATABASE_CORE: GameCard[] = [
  ...truthBatch1,
  ...truthBatch2,
  ...truthBatch3,
  ...truthBatch4,
  ...governmentBatch1,
  ...governmentBatch2,
  ...governmentBatch3,
  ...governmentBatch4,
];

if (typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'production') {
  const total = CARD_DATABASE_CORE.length;
  const truth = CARD_DATABASE_CORE.filter((card) => card.faction === 'truth').length;
  const government = CARD_DATABASE_CORE.filter((card) => card.faction === 'government').length;

  if (total !== 400 || truth !== 200 || government !== 200) {
    console.warn('[CORE] Unexpected counts', { total, truth, government });
  } else {
    console.log('[CORE] OK', { total, truth, government });
  }
}

export default CARD_DATABASE_CORE;
