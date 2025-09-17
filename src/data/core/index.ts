import type { GameCard } from '@/rules/mvp';

const coreModules = import.meta.glob<true, string, { default: GameCard[] }>(
  '/src/data/core/**/[!_]*.ts',
  { eager: true },
);

const SOURCE_COUNTS: Record<string, number> = {};
const SEEN_IDS = new Set<string>();

const moduleEntries = Object.entries(coreModules)
  .filter(([path]) => !path.includes('/_') && !path.endsWith('/index.ts'))
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB));

const CORE_CARDS: GameCard[] = [];

for (const [path, mod] of moduleEntries) {
  const cards = (mod as any).default ?? Object.values(mod)[0];
  if (!Array.isArray(cards)) continue;

  const before = CORE_CARDS.length;

  for (const card of cards as GameCard[]) {
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

if (typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'production') {
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

  if (total !== 400 || truth !== 200 || government !== 200) {
    console.warn('[CORE] Unexpected counts', { total, truth, government });
  } else {
    console.log('[CORE] OK', { total, truth, government });
  }
}

export const CARD_DATABASE_CORE: GameCard[] = CORE_CARDS;

export default CARD_DATABASE_CORE;
