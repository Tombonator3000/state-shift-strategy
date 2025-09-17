export type Card = {
  id: string;
  name: string;
  faction?: 'truth' | 'government' | string;
  type: 'ATTACK' | 'MEDIA' | 'ZONE';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cost: number;
  effects: unknown;
  extId?: string;
  _setId?: string;
  _setName?: string;
};

export type SetInfo = {
  id: string;
  name: string;
  enabled: boolean;
  weight?: number;
  cards: Card[];
};

export type MixMode =
  | 'CORE_ONLY'
  | 'BALANCED_MIX'
  | 'EXPANSION_ONLY'
  | 'CUSTOM_MIX';

const CORE_SET_ID = 'core';
const CORE_SET_NAME = 'Core Deck';
const CORE_FLOOR = 0.5; // TODO: expose via settings if playtesting demands a different baseline.

type WeightMap = Record<string, number>;

type BuildDeckOptions = {
  sets: SetInfo[];
  mode: MixMode;
  customWeights?: Record<string, number>;
  deckSize?: number;
  rng?: () => number;
};

type BuildDeckResult = {
  deck: Card[];
  weights: Record<string, number>;
  poolsRemaining: Record<string, number>;
};

const cloneCards = (cards: Card[]): Card[] => cards.map(card => ({ ...card }));

const decorateCoreCard = (card: Card): Card => ({
  ...card,
  _setId: card._setId ?? CORE_SET_ID,
  _setName: card._setName ?? CORE_SET_NAME,
  extId: card.extId ?? CORE_SET_ID,
});

const decorateExpansionCard = (card: Card, setId: string, setName: string): Card => ({
  ...card,
  _setId: card._setId ?? setId,
  _setName: card._setName ?? setName,
  extId: card.extId ?? setId,
});

const normalizeWeight = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return 0;
};

export function buildSets(
  core: Card[],
  expansions: Array<Omit<SetInfo, 'cards'> & { cards: Card[] }>,
): SetInfo[] {
  const coreSet: SetInfo = {
    id: CORE_SET_ID,
    name: CORE_SET_NAME,
    enabled: true,
    cards: core.map(decorateCoreCard),
  };

  const normalizedExpansions = expansions.map(expansion => ({
    ...expansion,
    cards: expansion.cards.map(card => decorateExpansionCard(card, expansion.id, expansion.name)),
  }));

  return [coreSet, ...normalizedExpansions];
}

const selectWeightedSet = (
  availableSets: SetInfo[],
  weights: WeightMap,
  rng: () => number,
): SetInfo | null => {
  const weighted = availableSets.filter(set => weights[set.id] > 0 && set.cards.length > 0);
  if (weighted.length === 0) {
    return null;
  }

  const totalWeight = weighted.reduce((sum, set) => sum + weights[set.id], 0);
  if (totalWeight <= 0) {
    return null;
  }

  let roll = rng() * totalWeight;
  let chosen: SetInfo | null = null;
  for (const set of weighted) {
    roll -= weights[set.id];
    if (roll <= 0) {
      chosen = set;
      break;
    }
  }

  return chosen ?? weighted[weighted.length - 1];
};

const buildWeightMap = (
  sets: SetInfo[],
  mode: MixMode,
  customWeights?: Record<string, number>,
): { selected: SetInfo[]; weights: WeightMap } => {
  const weights: WeightMap = {};
  const core = sets.find(set => set.id === CORE_SET_ID);
  const expansions = sets.filter(set => set.id !== CORE_SET_ID && set.enabled);

  const activeExpansions = expansions.filter(set => set.cards.length > 0);
  const hasActiveExpansions = activeExpansions.length > 0;

  const addSet = (set: SetInfo, weight: number) => {
    if (set.cards.length === 0 || weight <= 0) {
      return;
    }
    weights[set.id] = weight;
  };

  switch (mode) {
    case 'CORE_ONLY': {
      if (core) {
        addSet(core, 1);
        return { selected: [core], weights };
      }
      return { selected: [], weights };
    }

    case 'EXPANSION_ONLY': {
      if (hasActiveExpansions) {
        for (const set of activeExpansions) {
          addSet(set, 1);
        }
        return { selected: activeExpansions, weights };
      }
      if (core) {
        addSet(core, 1);
        return { selected: [core], weights };
      }
      return { selected: [], weights };
    }

    case 'CUSTOM_MIX': {
      const selections: SetInfo[] = [];
      if (core) {
        const weight = normalizeWeight(customWeights?.[CORE_SET_ID] ?? core.weight ?? 0);
        if (weight > 0 && core.cards.length > 0) {
          addSet(core, weight);
          selections.push(core);
        }
      }
      for (const set of expansions) {
        const weight = normalizeWeight(customWeights?.[set.id] ?? set.weight ?? 0);
        if (weight > 0 && set.cards.length > 0) {
          addSet(set, weight);
          selections.push(set);
        }
      }
      if (selections.length === 0 && core) {
        addSet(core, 1);
        selections.push(core);
      }
      return { selected: selections, weights };
    }

    case 'BALANCED_MIX':
    default: {
      const selections: SetInfo[] = [];
      if (core && core.cards.length > 0) {
        selections.push(core);
      }
      selections.push(...activeExpansions);

      if (selections.length === 0) {
        return { selected: [], weights };
      }

      if (core && core.cards.length > 0) {
        weights[core.id] = 1;
      }
      for (const set of activeExpansions) {
        weights[set.id] = 1;
      }

      if (core && hasActiveExpansions) {
        const expansionSum = activeExpansions.reduce((sum, set) => sum + weights[set.id], 0);
        const requiredCoreWeight = (CORE_FLOOR * expansionSum) / (1 - CORE_FLOOR);
        weights[core.id] = Math.max(weights[core.id], requiredCoreWeight);
      }

      if (!hasActiveExpansions && core && core.cards.length > 0) {
        weights[core.id] = 1;
      }

      return { selected: selections, weights };
    }
  }
};

const normalizeWeights = (weights: WeightMap, sets: SetInfo[]): Record<string, number> => {
  const relevant = sets.filter(set => weights[set.id] && weights[set.id] > 0 && set.cards.length > 0);
  const total = relevant.reduce((sum, set) => sum + weights[set.id], 0);
  if (total <= 0) {
    return {};
  }

  return Object.fromEntries(
    relevant.map(set => [set.id, weights[set.id] / total]),
  );
};

export function buildDeck(options: BuildDeckOptions): BuildDeckResult {
  const { sets, mode, customWeights, deckSize = 40, rng = Math.random } = options;
  const { selected, weights } = buildWeightMap(sets, mode, customWeights);

  if (selected.length === 0) {
    return { deck: [], weights: {}, poolsRemaining: {} };
  }

  const workingSets = selected.map(set => ({
    ...set,
    cards: cloneCards(set.cards),
  }));

  const deck: Card[] = [];

  for (let i = 0; i < deckSize; i++) {
    const candidateSets = workingSets.filter(set => weights[set.id] > 0 && set.cards.length > 0);
    if (candidateSets.length === 0) {
      break;
    }

    const chosenSet = selectWeightedSet(candidateSets, weights, rng);
    if (!chosenSet) {
      break;
    }

    const pool = chosenSet.cards;
    if (pool.length === 0) {
      continue;
    }

    const cardIndex = Math.floor(rng() * pool.length);
    const [card] = pool.splice(cardIndex, 1);
    if (card) {
      deck.push(card);
    }
  }

  const poolsRemaining = Object.fromEntries(
    workingSets.map(set => [set.id, set.cards.length]),
  );

  return {
    deck,
    weights: normalizeWeights(weights, workingSets),
    poolsRemaining,
  };
}
