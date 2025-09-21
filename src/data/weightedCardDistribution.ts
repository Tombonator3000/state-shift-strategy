import type { GameCard } from '@/rules/mvp';
import { CORE_FLOOR } from '@/lib/decks/expansions';
import { ensureMvpCosts, getCoreCards, isMvpCard } from './cardDatabase';
import { EXPANSION_MANIFEST } from './expansions';
import {
  getEnabledExpansionIdsSnapshot,
  getExpansionCardsSnapshot,
} from './expansions/state';

export const MVP_TYPE_WEIGHTS: Record<'ATTACK' | 'MEDIA' | 'ZONE', number> = {
  ATTACK: 0.33,
  MEDIA: 0.34,
  ZONE: 0.33
};

type Rarity = NonNullable<GameCard['rarity']>;
type MVPType = 'ATTACK' | 'MEDIA' | 'ZONE';
type Pred = (card: GameCard) => boolean;

const MVP_TYPES: MVPType[] = ['ATTACK', 'MEDIA', 'ZONE'];

const DEV = typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE !== 'production';
function dbg(...args: any[]) {
  if (DEV) {
    console.warn(...args);
  }
}

const sanitizeSetCards = (cards: GameCard[], setId: string): GameCard[] => {
  return cards
    .map(ensureMvpCosts)
    .filter(card => {
      if (!isMvpCard(card)) {
        if (DEV) {
          console.warn(`[WEIGHTED DISTRIBUTION][${setId}] dropped non-MVP card ${card.id}`);
        }
        return false;
      }
      return true;
    });
};

const byFaction = (faction: 'truth' | 'government'): Pred => card => {
  if (!card.faction) return false;
  return card.faction.toString().toLowerCase() === faction.toLowerCase();
};

const byType = (type: MVPType): Pred => card => card.type === type;
const byRarity = (rarity: Rarity): Pred => card => (card.rarity ?? 'common') === rarity;

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickCardMVP(
  pool: GameCard[],
  faction?: 'truth' | 'government',
  wantType?: MVPType,
  wantRarity?: Rarity
): GameCard | undefined {
  const factionPool = faction ? pool.filter(byFaction(faction)) : [...pool];

  let candidates = factionPool.filter(card => {
    return (!wantType || byType(wantType)(card)) && (!wantRarity || byRarity(wantRarity)(card));
  });

  if (candidates.length) {
    return pickRandom(candidates);
  }

  if (wantRarity) {
    dbg('MVP fallback: dropping rarity requirement', { faction, wantType, wantRarity });
    candidates = factionPool.filter(card => !wantType || byType(wantType)(card));
    if (candidates.length) {
      return pickRandom(candidates);
    }
  }

  if (wantType) {
    dbg('MVP fallback: dropping type requirement', { faction, wantType, wantRarity });
    candidates = factionPool.filter(card => !wantRarity || byRarity(wantRarity)(card));
    if (candidates.length) {
      return pickRandom(candidates);
    }
  }

  if (!factionPool.length) {
    dbg('MVP fallback: no cards available for faction in pool', { faction });
    return undefined;
  }

  dbg('MVP fallback: selecting any card for faction', { faction });
  return pickRandom(factionPool);
}

const isMVPType = (type: GameCard['type']): type is MVPType => MVP_TYPES.includes(type as MVPType);

// Distribution modes
export type DistributionMode = 'core-only' | 'expansion-only' | 'balanced' | 'custom';

// Set weights configuration
export interface SetWeights {
  core: number;
  [extensionId: string]: number;
}

// Distribution settings with safeguards
export interface DistributionSettings {
  mode: DistributionMode;
  setWeights: SetWeights;
  rarityTargets: {
    common: number;
    uncommon: number;
    rare: number;
    legendary: number;
  };
  typeBalancing: {
    enabled: boolean;
    maxTypeRatio: number; // e.g., 0.35 = max 35% of any type
  };
  duplicateLimit: number; // max copies of same card
  earlySeedCount: number; // number of early cards that should be resource/core cards
}

// Default settings
export const DEFAULT_DISTRIBUTION_SETTINGS: DistributionSettings = {
  mode: 'core-only',
  setWeights: {
    core: 2.0
  },
  rarityTargets: {
    common: 0.65,
    uncommon: 0.25,
    rare: 0.08,
    legendary: 0.02
  },
  typeBalancing: {
    enabled: true,
    maxTypeRatio: 0.35
  },
  duplicateLimit: 2,
  earlySeedCount: 4
};

// Card set information
interface CardSet {
  id: string;
  name: string;
  cards: GameCard[];
  isCore: boolean;
}

class WeightedCardDistribution {
  private settings: DistributionSettings = { ...DEFAULT_DISTRIBUTION_SETTINGS };
  
  // Get available card sets (core only in MVP)
  private getAvailableCardSets(): CardSet[] {
    const sets: CardSet[] = [
      {
        id: 'core',
        name: 'Core Set',
        cards: sanitizeSetCards(getCoreCards(), 'core'),
        isCore: true,
      },
    ];

    const expansionCards = getExpansionCardsSnapshot();
    if (expansionCards.length === 0) {
      return sets;
    }

    const cardsByExpansion = new Map<string, GameCard[]>();
    for (const card of expansionCards) {
      const extId = card.extId;
      if (!extId) continue;
      if (!cardsByExpansion.has(extId)) {
        cardsByExpansion.set(extId, []);
      }
      cardsByExpansion.get(extId)!.push(card);
    }

    const enabledIds = getEnabledExpansionIdsSnapshot();

    for (const expansionId of enabledIds) {
      const cards = cardsByExpansion.get(expansionId);
      if (!cards || cards.length === 0) {
        continue;
      }

      const manifest = EXPANSION_MANIFEST.find(pack => pack.id === expansionId);
      sets.push({
        id: expansionId,
        name: manifest?.title ?? expansionId,
        cards: sanitizeSetCards(cards, expansionId),
        isCore: false,
      });
    }

    return sets;
  }

  // MVP: Remove keyword heuristics - exact faction match only
  private filterCardsByFaction(cards: GameCard[], faction?: 'government' | 'truth'): GameCard[] {
    if (!faction) return cards;
    
    // Case-insensitive faction matching for safety
    const filtered = cards.filter(card => {
      if (!card.faction) return false;
      return card.faction.toLowerCase() === faction.toLowerCase();
    });
    
    // If no cards found for faction, return all cards as fallback to prevent empty decks
    if (filtered.length === 0) {
      console.warn(`⚠️ No cards found for faction: ${faction}, using all cards as fallback`);
      return cards;
    }
    
    return filtered;
  }

  // Calculate effective weights based on mode
  private getEffectiveWeights(): SetWeights {
    const weights: SetWeights = { core: 0 };
    const availableSets = this.getAvailableCardSets();
    const coreSet = availableSets.find(set => set.isCore && set.cards.length > 0);
    const activeExpansions = availableSets.filter(set => !set.isCore && set.cards.length > 0);

    const setWeight = (setId: string, weight: number) => {
      if (setId === 'core') {
        weights.core = Math.max(0, weight);
        return;
      }

      if (weight > 0) {
        weights[setId] = weight;
      }
    };

    switch (this.settings.mode) {
      case 'core-only': {
        if (coreSet) {
          setWeight('core', 1);
        }
        break;
      }

      case 'expansion-only': {
        if (activeExpansions.length === 0) {
          if (coreSet) {
            setWeight('core', 1);
          }
          break;
        }

        setWeight('core', 0);
        activeExpansions.forEach(set => setWeight(set.id, 1));
        break;
      }

      case 'balanced': {
        if (coreSet) {
          setWeight('core', 1);
        }

        activeExpansions.forEach(set => setWeight(set.id, 1));

        if (coreSet && activeExpansions.length > 0) {
          const expansionSum = activeExpansions.reduce(
            (sum, set) => sum + (weights[set.id] ?? 0),
            0,
          );
          const requiredCoreWeight = (CORE_FLOOR * expansionSum) / (1 - CORE_FLOOR);
          setWeight('core', Math.max(weights.core ?? 0, requiredCoreWeight));
        } else if (coreSet) {
          setWeight('core', Math.max(weights.core ?? 0, 1));
        }

        break;
      }

      case 'custom': {
        const normalize = (value?: number) =>
          typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;

        setWeight('core', normalize(this.settings.setWeights.core));

        activeExpansions.forEach(set => {
          const weight = normalize(this.settings.setWeights[set.id]);
          if (weight > 0) {
            setWeight(set.id, weight);
          }
        });

        break;
      }
    }

    const totalActiveWeight = Object.entries(weights)
      .filter(([setId]) => setId === 'core' || activeExpansions.some(set => set.id === setId))
      .reduce((sum, [, value]) => sum + (Number.isFinite(value) ? value : 0), 0);

    if (totalActiveWeight <= 0 && coreSet) {
      setWeight('core', 1);
    }

    return weights;
  }

  // Select a card set based on weights
  private selectWeightedSet(availableSets: CardSet[]): CardSet | null {
    const weights = this.getEffectiveWeights();
    const weightedSets = availableSets.filter(set => (weights[set.id] || 0) > 0);
    
    if (weightedSets.length === 0) return null;

    const totalWeight = weightedSets.reduce((sum, set) => sum + (weights[set.id] || 0), 0);
    if (totalWeight === 0) return null;

    let random = Math.random() * totalWeight;
    for (const set of weightedSets) {
      random -= (weights[set.id] || 0);
      if (random <= 0) return set;
    }

    return weightedSets[weightedSets.length - 1];
  }

  // Select card from set with rarity constraints
  private selectCardFromSet(
    set: CardSet,
    targetRarity: Rarity,
    usedCards: Map<string, number>,
    typeCount: Map<MVPType, number>
  ): GameCard | null {
    // Filter by rarity and duplicate limit
    let candidates = set.cards.filter(card => {
      const timesUsed = usedCards.get(card.id) || 0;
      const cardRarity = (card.rarity ?? 'common') as Rarity;
      return cardRarity === targetRarity && timesUsed < this.settings.duplicateLimit;
    });

    // Apply type balancing if enabled
    if (this.settings.typeBalancing.enabled && candidates.length > 0) {
      const totalCards = Array.from(typeCount.values()).reduce((sum, count) => sum + count, 0);

      candidates = candidates.filter(card => {
        if (!isMVPType(card.type)) {
          return false;
        }
        const currentTypeCount = typeCount.get(card.type) || 0;
        const newRatio = (currentTypeCount + 1) / (totalCards + 1);
        return newRatio <= this.settings.typeBalancing.maxTypeRatio;
      });
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Get rarity based on targets and current distribution
  private selectTargetRarity(currentRarityCount: Map<Rarity, number>, totalCards: number): Rarity {
    const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];
    
    // Calculate current ratios
    const currentRatios = new Map<Rarity, number>();
    rarities.forEach(rarity => {
      const count = currentRarityCount.get(rarity) || 0;
      currentRatios.set(rarity, totalCards > 0 ? count / totalCards : 0);
    });

    // Find rarity that's most under-represented
    let selectedRarity: Rarity = 'common';
    let maxDeficit = -1;

    rarities.forEach(rarity => {
      const currentRatio = currentRatios.get(rarity) || 0;
      const targetRatio = this.settings.rarityTargets[rarity];
      const deficit = targetRatio - currentRatio;
      
      if (deficit > maxDeficit) {
        maxDeficit = deficit;
        selectedRarity = rarity;
      }
    });

    return selectedRarity;
  }

  private selectTargetType(currentTypeCount: Map<MVPType, number>, totalCards: number): MVPType {
    let selected: MVPType = 'MEDIA';
    let maxDeficit = Number.NEGATIVE_INFINITY;

    MVP_TYPES.forEach(type => {
      const count = currentTypeCount.get(type) || 0;
      const currentRatio = totalCards > 0 ? count / totalCards : 0;
      const targetRatio = MVP_TYPE_WEIGHTS[type];
      const deficit = targetRatio - currentRatio;

      if (deficit > maxDeficit) {
        maxDeficit = deficit;
        selected = type;
      }
    });

    return selected;
  }

  private generateMVPDeck(size: number, faction?: 'government' | 'truth'): GameCard[] {
    const deck: GameCard[] = [];
    const availableSets = this.getAvailableCardSets();

    if (availableSets.length === 0) {
      console.warn('No card sets available for deck generation');
      return deck;
    }

    const normalizedFaction = faction ? (faction.toLowerCase() as 'truth' | 'government') : undefined;

    const factionFilteredSets = availableSets
      .map(set => ({
        ...set,
        cards: this.filterCardsByFaction(set.cards, normalizedFaction)
      }))
      .filter(set => set.cards.length > 0);

    if (factionFilteredSets.length === 0) {
      console.warn(`No cards available for faction: ${normalizedFaction}, using all sets as fallback`);
      factionFilteredSets.push(...availableSets);
    }

    const usedCards = new Map<string, number>();
    const rarityCount = new Map<Rarity, number>();
    const typeCount = new Map<MVPType, number>();

    const filterByDuplicateLimit = (cards: GameCard[]) =>
      cards.filter(card => (usedCards.get(card.id) || 0) < this.settings.duplicateLimit);

    const allFactionCards = factionFilteredSets.flatMap(set => set.cards);

    for (let slot = 0; slot < size; slot++) {
      const currentTotal = deck.length;
      const targetRarity = this.selectTargetRarity(rarityCount, currentTotal);
      const targetType = this.selectTargetType(typeCount, currentTotal);

      let chosen: GameCard | undefined;

      const selectedSet = this.selectWeightedSet(factionFilteredSets);
      if (selectedSet) {
        chosen = pickCardMVP(filterByDuplicateLimit(selectedSet.cards), normalizedFaction, targetType, targetRarity);
      }

      if (!chosen) {
        chosen = pickCardMVP(filterByDuplicateLimit(allFactionCards), normalizedFaction, targetType, targetRarity);
      }

      if (!chosen) {
        chosen = pickCardMVP(allFactionCards, normalizedFaction, targetType, targetRarity);
      }

      if (!chosen) {
        dbg('⚠️ Could not find ANY card for faction', normalizedFaction);
        break;
      }

      deck.push(chosen);

      const usage = (usedCards.get(chosen.id) || 0) + 1;
      usedCards.set(chosen.id, usage);
      if (usage > this.settings.duplicateLimit) {
        dbg('MVP fallback: duplicate limit exceeded', { id: chosen.id, copies: usage });
      }

      const rarity = (chosen.rarity ?? 'common') as Rarity;
      rarityCount.set(rarity, (rarityCount.get(rarity) || 0) + 1);

      if (isMVPType(chosen.type)) {
        typeCount.set(chosen.type, (typeCount.get(chosen.type) || 0) + 1);
      }

      dbg('🂠 Slot filled', {
        slot,
        id: chosen.id,
        type: chosen.type,
        rarity: chosen.rarity
      });
    }

    return deck;
  }

  // Main deck generation function with faction support
  generateWeightedDeck(size: number = 40, faction?: 'government' | 'truth'): GameCard[] {
    return this.generateMVPDeck(size, faction);
  }

  // Simulate deck composition for preview
  simulateDeckComposition(trials: number = 1000): {
    setDistribution: Map<string, number>;
    rarityDistribution: Map<Rarity, number>;
    typeDistribution: Map<MVPType, number>;
  } {
    const setCount = new Map<string, number>();
    const rarityCount = new Map<Rarity, number>();
    const typeCount = new Map<MVPType, number>();

    for (let trial = 0; trial < trials; trial++) {
      const deck = this.generateWeightedDeck(40);
      
      deck.forEach(card => {
        // Determine card's set
        let cardSet = 'core';
        if ('extId' in card && card.extId) {
          cardSet = card.extId as string;
        }

        setCount.set(cardSet, (setCount.get(cardSet) || 0) + 1);
        const rarity = (card.rarity ?? 'common') as Rarity;
        rarityCount.set(rarity, (rarityCount.get(rarity) || 0) + 1);
        if (isMVPType(card.type)) {
          typeCount.set(card.type, (typeCount.get(card.type) || 0) + 1);
        }
      });
    }

    return {
      setDistribution: setCount,
      rarityDistribution: rarityCount,
      typeDistribution: typeCount
    };
  }

  // Configuration methods
  updateSettings(newSettings: Partial<DistributionSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): DistributionSettings {
    return { ...this.settings };
  }

  getCurrentSetWeights(): SetWeights {
    return { ...this.getEffectiveWeights() };
  }

  setMode(mode: DistributionMode): void {
    this.settings.mode = mode;
  }

  setSetWeight(setId: string, weight: number): void {
    this.settings.setWeights[setId] = Math.max(0, Math.min(3, weight));
  }
}

// Export singleton instance
export const weightedDistribution = new WeightedCardDistribution();

// Helper function for backward compatibility
export const generateWeightedDeck = (size: number = 40, faction?: 'government' | 'truth'): GameCard[] => {
  return weightedDistribution.generateWeightedDeck(size, faction);
};