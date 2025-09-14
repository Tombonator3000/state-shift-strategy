import { loadCore } from './core/loadCore';
import { buildDeckFromIds } from './deck/build';

// Placeholder registries
const library: any[] = [];
const coreDecks: any[] = [];

function registerCoreLibrary(cards: any[], deck: any[]) {
  library.push(...cards);
  coreDecks.push(...deck);
}

async function loadExpansions() {
  // expansions would be loaded here
}

export async function initGame() {
  const { coreLibrary, decklist } = await loadCore();

  const index = new Map(coreLibrary.map((c: any) => [c.id, c]));
  const coreDeck = buildDeckFromIds(decklist.ids, index);

  registerCoreLibrary(coreLibrary, coreDeck);

  await loadExpansions();
}

