import type { GameCard } from '@/rules/mvp';
import { COMEBACK_CARDS } from './comeback-cards';
import { governmentBatch1 } from './government-batch-1';
import { governmentBatch2 } from './government-batch-2';
import { governmentBatch3 } from './government-batch-3';
import { governmentBatch4 } from './government-batch-4';
import governmentSpecialCards from './government-special';
import { truthBatch1 } from './truth-batch-1';
import { truthBatch2 } from './truth-batch-2';
import { truthBatch3 } from './truth-batch-3';
import { truthBatch4 } from './truth-batch-4';
import truthSpecialCards from './truth-special';

// One explicit catalog works in both Vite and Bun. Keep the former sorted source
// order: the first occurrence of a duplicate ID remains authoritative.
export const CORE_CARD_SOURCES: Record<string, GameCard[]> = {
  'comeback-cards.ts': COMEBACK_CARDS,
  'government-batch-1.ts': governmentBatch1,
  'government-batch-2.ts': governmentBatch2,
  'government-batch-3.ts': governmentBatch3,
  'government-batch-4.ts': governmentBatch4,
  'government-special.ts': governmentSpecialCards,
  'truth-batch-1.ts': truthBatch1,
  'truth-batch-2.ts': truthBatch2,
  'truth-batch-3.ts': truthBatch3,
  'truth-batch-4.ts': truthBatch4,
  'truth-special.ts': truthSpecialCards,
};

const SOURCE_COUNTS: Record<string, number> = {};
const SEEN_IDS = new Set<string>();

const moduleEntries = Object.entries(CORE_CARD_SOURCES)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB));

const CORE_CARDS: GameCard[] = [];

for (const [path, cards] of moduleEntries) {
  const before = CORE_CARDS.length;

  for (const card of cards) {
    if (!card?.id || SEEN_IDS.has(card.id)) continue;
    SEEN_IDS.add(card.id);
    CORE_CARDS.push(card);
  }

  const added = CORE_CARDS.length - before;
  if (added > 0) {
    const displayPath = path.replace(/^.*\/src\/data\/core\//, '');
    SOURCE_COUNTS[displayPath] = added;
  }
}

if (import.meta.env?.DEV) {
  const total = CORE_CARDS.length;
  const truth = CORE_CARDS.filter(card => card.faction === 'truth').length;
  const government = CORE_CARDS.filter(card => card.faction === 'government').length;

  console.info('[CORE RECOVERY]', {
    files: moduleEntries.length,
    total,
    truth,
    government,
    sources: SOURCE_COUNTS,
  });

  // 400 base cards, 20 special cards and 4 comeback cards.
  if (total !== 424 || truth !== 212 || government !== 212) {
    console.warn('[CORE] Unexpected counts', { total, truth, government });
  } else {
    console.log('[CORE] OK', { total, truth, government });
  }
}

export const CARD_DATABASE_CORE: GameCard[] = CORE_CARDS;

export default CARD_DATABASE_CORE;
