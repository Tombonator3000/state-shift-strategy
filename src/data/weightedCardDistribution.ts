import { GameCard } from '@/components/game/GameHand';
import { CARD_DATABASE, generateRandomDeck } from './cardDatabase';
import { extensionManager } from './extensionSystem';

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
  mode: 'balanced',
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
  
  // Get all available card sets (core + enabled extensions)
  private getAvailableCardSets(): CardSet[] {
    const sets: CardSet[] = [
      {
        id: 'core',
        name: 'Core Set',
        cards: CARD_DATABASE,
        isCore: true
      }
    ];

    // Add enabled extension sets
    const enabledExtensions = extensionManager.getEnabledExtensions();
    enabledExtensions.forEach(ext => {
      const extension = extensionManager.getExtension(ext.id);
      if (extension) {
        const extensionCards = extensionManager.getAllExtensionCards()
          .filter(card => card.extId === ext.id);
        
        sets.push({
          id: ext.id,
          name: ext.name,
          cards: extensionCards,
          isCore: false
        });
      }
    });

    return sets;
  }

  // v2.1E: Remove keyword heuristics - exact faction match only
  private filterCardsByFaction(cards: GameCard[], faction?: 'government' | 'truth'): GameCard[] {
    if (!faction) return cards;
    return cards.filter(card => card.faction === faction);
  }

  // Calculate effective weights based on mode
  private getEffectiveWeights(): SetWeights {
    const weights: SetWeights = { core: 0 };
    const availableSets = this.getAvailableCardSets();

    switch (this.settings.mode) {
      case 'core-only':
        weights.core = 1.0;
        break;
      
      case 'expansion-only':
        availableSets.forEach(set => {
          if (!set.isCore && set.cards.length > 0) {
            weights[set.id] = 1.0;
          }
        });
        break;
      
      case 'balanced':
        weights.core = 2.0;
        availableSets.forEach(set => {
          if (!set.isCore && set.cards.length > 0) {
            weights[set.id] = 1.0;
          }
        });
        break;
      
      case 'custom':
        Object.assign(weights, this.settings.setWeights);
        break;
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
    targetRarity: GameCard['rarity'],
    usedCards: Map<string, number>,
    typeCount: Map<GameCard['type'], number>
  ): GameCard | null {
    // Filter by rarity and duplicate limit
    let candidates = set.cards.filter(card => {
      const timesUsed = usedCards.get(card.id) || 0;
      return card.rarity === targetRarity && timesUsed < this.settings.duplicateLimit;
    });

    // Apply type balancing if enabled
    if (this.settings.typeBalancing.enabled && candidates.length > 0) {
      const totalCards = Array.from(typeCount.values()).reduce((sum, count) => sum + count, 0);
      
      candidates = candidates.filter(card => {
        const currentTypeCount = typeCount.get(card.type) || 0;
        const newRatio = (currentTypeCount + 1) / (totalCards + 1);
        return newRatio <= this.settings.typeBalancing.maxTypeRatio;
      });
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Get rarity based on targets and current distribution
  private selectTargetRarity(currentRarityCount: Map<GameCard['rarity'], number>, totalCards: number): GameCard['rarity'] {
    const rarities: GameCard['rarity'][] = ['common', 'uncommon', 'rare', 'legendary'];
    
    // Calculate current ratios
    const currentRatios = new Map<GameCard['rarity'], number>();
    rarities.forEach(rarity => {
      const count = currentRarityCount.get(rarity) || 0;
      currentRatios.set(rarity, totalCards > 0 ? count / totalCards : 0);
    });

    // Find rarity that's most under-represented
    let selectedRarity: GameCard['rarity'] = 'common';
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

  // Generate early game seed cards (resource/core cards)
  private generateSeedCards(availableSets: CardSet[]): GameCard[] {
    const seedCards: GameCard[] = [];
    const coreSet = availableSets.find(set => set.isCore);
    
    if (!coreSet) return seedCards;

    // Prefer resource and defensive cards for early game
    const resourceTypes: GameCard['type'][] = ['DEFENSIVE'];
    const seedCandidates = coreSet.cards.filter(card => 
      resourceTypes.includes(card.type) && 
      (card.rarity === 'common' || card.rarity === 'uncommon')
    );

    for (let i = 0; i < this.settings.earlySeedCount && seedCandidates.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * seedCandidates.length);
      const selectedCard = seedCandidates[randomIndex];
      seedCards.push(selectedCard);
      
      // Remove to prevent immediate duplicates in seed
      seedCandidates.splice(randomIndex, 1);
    }

    return seedCards;
  }

  // Main deck generation function with faction support
  generateWeightedDeck(size: number = 40, faction?: 'government' | 'truth'): GameCard[] {
    const deck: GameCard[] = [];
    const availableSets = this.getAvailableCardSets();
    
    if (availableSets.length === 0) {
      console.warn('No card sets available for deck generation');
      return [];
    }

    // Apply faction filtering to all sets
    const factionFilteredSets = availableSets.map(set => ({
      ...set,
      cards: this.filterCardsByFaction(set.cards, faction)
    })).filter(set => set.cards.length > 0);

    if (factionFilteredSets.length === 0) {
      console.warn(`No cards available for faction: ${faction}`);
      return [];
    }

    // Generate seed cards first
    const seedCards = this.generateSeedCards(factionFilteredSets);
    deck.push(...seedCards);

    // Track usage for balancing
    const usedCards = new Map<string, number>();
    const typeCount = new Map<GameCard['type'], number>();
    const rarityCount = new Map<GameCard['rarity'], number>();

    // Initialize counters with seed cards
    deck.forEach(card => {
      usedCards.set(card.id, (usedCards.get(card.id) || 0) + 1);
      typeCount.set(card.type, (typeCount.get(card.type) || 0) + 1);
      rarityCount.set(card.rarity, (rarityCount.get(card.rarity) || 0) + 1);
    });

    // Fill remaining deck slots
    for (let i = deck.length; i < size; i++) {
      // Select target rarity
      const targetRarity = this.selectTargetRarity(rarityCount, i);
      
      // Select weighted set from faction-filtered sets
      const selectedSet = this.selectWeightedSet(factionFilteredSets);
      if (!selectedSet) {
        console.warn(`No valid set selected for card ${i}`);
        break;
      }

      // Select card from set
      let selectedCard = this.selectCardFromSet(selectedSet, targetRarity, usedCards, typeCount);
      
      // Fallback: try other rarities in the same set
      if (!selectedCard) {
        const fallbackRarities: GameCard['rarity'][] = ['common', 'uncommon', 'rare', 'legendary'];
        for (const fallbackRarity of fallbackRarities) {
          if (fallbackRarity === targetRarity) continue;
          selectedCard = this.selectCardFromSet(selectedSet, fallbackRarity, usedCards, typeCount);
          if (selectedCard) break;
        }
      }

      // Last resort: try any faction-filtered set with target rarity
      if (!selectedCard) {
        for (const set of factionFilteredSets) {
          selectedCard = this.selectCardFromSet(set, targetRarity, usedCards, typeCount);
          if (selectedCard) break;
        }
      }

      if (selectedCard) {
        deck.push(selectedCard);
        usedCards.set(selectedCard.id, (usedCards.get(selectedCard.id) || 0) + 1);
        typeCount.set(selectedCard.type, (typeCount.get(selectedCard.type) || 0) + 1);
        rarityCount.set(selectedCard.rarity, (rarityCount.get(selectedCard.rarity) || 0) + 1);
      } else {
        console.warn(`Could not find suitable card for slot ${i}`);
      }
    }

    return deck;
  }

  // Simulate deck composition for preview
  simulateDeckComposition(trials: number = 1000): {
    setDistribution: Map<string, number>;
    rarityDistribution: Map<GameCard['rarity'], number>;
    typeDistribution: Map<GameCard['type'], number>;
  } {
    const setCount = new Map<string, number>();
    const rarityCount = new Map<GameCard['rarity'], number>();
    const typeCount = new Map<GameCard['type'], number>();

    for (let trial = 0; trial < trials; trial++) {
      const deck = this.generateWeightedDeck(40);
      
      deck.forEach(card => {
        // Determine card's set
        let cardSet = 'core';
        if ('extId' in card && card.extId) {
          cardSet = card.extId as string;
        }
        
        setCount.set(cardSet, (setCount.get(cardSet) || 0) + 1);
        rarityCount.set(card.rarity, (rarityCount.get(card.rarity) || 0) + 1);
        typeCount.set(card.type, (typeCount.get(card.type) || 0) + 1);
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