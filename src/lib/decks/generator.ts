import { getCoreCards } from '@/data/cardDatabase';
import { normalizeFaction } from '@/data/mvpAnalysisUtils';
import type { GameCard } from '@/rules/mvp';
import { buildDeck, buildSets, type Card, type MixMode, type SetInfo } from './expansions';
import { getCachedExpansions } from '@/lib/expansions/discover';
import { loadPrefs } from '@/lib/persist';

export interface DeckBuildResult {
  deck: Card[];
  weights: Record<string, number>;
  poolsRemaining: Record<string, number>;
  sets: SetInfo[];
  mode: MixMode;
  customWeights: Record<string, number>;
}

const toCard = (card: GameCard): Card => ({
  ...(card as Card),
  extId: (card as Card).extId ?? 'core',
  _setId: (card as Card)._setId ?? 'core',
  _setName: (card as Card)._setName ?? 'Core Deck',
});

const filterCardsForFaction = (cards: Card[], faction: 'truth' | 'government'): Card[] => {
  return cards.filter(card => {
    const normalized = normalizeFaction(card.faction as GameCard['faction']);
    if (normalized === 'neutral') {
      return true;
    }
    return normalized === faction;
  });
};

type StoredPrefs = {
  mode?: MixMode;
  enabled?: Record<string, boolean>;
  customWeights?: Record<string, number>;
};

const DEFAULT_MODE: MixMode = 'BALANCED_MIX';

export function generateMixedDeck({
  faction,
  deckSize = 40,
  rng,
}: {
  faction: 'truth' | 'government';
  deckSize?: number;
  rng?: () => number;
}): DeckBuildResult {
  const prefs = (loadPrefs<StoredPrefs>() ?? {}) as StoredPrefs;
  const enabled = prefs.enabled ?? {};
  const customWeights = prefs.customWeights ?? {};
  const mode = prefs.mode ?? DEFAULT_MODE;

  const coreCards = getCoreCards().map(toCard);
  const expansions = getCachedExpansions();

  const coreForFaction = filterCardsForFaction(coreCards, faction);
  const expansionSets = expansions.map(expansion => ({
    id: expansion.id,
    name: expansion.name,
    enabled: Boolean(enabled[expansion.id]),
    weight: customWeights[expansion.id],
    cards: filterCardsForFaction(expansion.cards, faction),
  }));

  const sets = buildSets(coreForFaction, expansionSets);
  const result = buildDeck({
    sets,
    mode,
    customWeights: customWeights,
    deckSize,
    rng,
  });

  return {
    deck: result.deck,
    weights: result.weights,
    poolsRemaining: result.poolsRemaining,
    sets,
    mode,
    customWeights,
  };
}
