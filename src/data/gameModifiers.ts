// Game Modifiers System - Daily challenges and special rules

export interface GameModifier {
  id: string;
  name: string;
  description: string;
  category: 'cost' | 'cards' | 'truth' | 'territory' | 'special';
  
  // Modifier effects
  effects?: {
    // Cost modifiers
    allCardsCostDelta?: number;
    specificTypeCostDelta?: { type: string; delta: number }[];
    
    // Card draw modifiers
    handSizeModifier?: number;
    cardsPerTurnModifier?: number;
    startingHandSize?: number;
    
    // Truth modifiers
    truthChangesMultiplier?: number;
    truthCap?: number;
    truthFloor?: number;
    
    // Territory modifiers
    globalDefenseBonus?: number;
    captureThresholdDelta?: number;
    startingControlledStates?: number;
    
    // Income modifiers
    incomeMultiplier?: number;
    incomeBonus?: number;
    
    // Deck modifiers
    bannedCardTypes?: string[];
    requiredCardTypes?: string[];
    specificCardBoostedRate?: { cardId: string; multiplier: number }[];
  };
  
  // Visual
  icon?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}

export const GAME_MODIFIERS: Record<string, GameModifier> = {
  // Cost Modifiers
  budgetCrisis: {
    id: 'budget-crisis',
    name: 'Budget Crisis',
    description: 'All cards cost +2 IP',
    category: 'cost',
    difficulty: 'hard',
    icon: '💰',
    effects: {
      allCardsCostDelta: 2,
    },
  },

  economicBoom: {
    id: 'economic-boom',
    name: 'Economic Boom',
    description: 'All cards cost -1 IP (minimum 1)',
    category: 'cost',
    difficulty: 'easy',
    icon: '📈',
    effects: {
      allCardsCostDelta: -1,
    },
  },

  // Card Draw Modifiers
  mediaBlackout: {
    id: 'media-blackout',
    name: 'Media Blackout',
    description: 'No MEDIA cards in deck',
    category: 'cards',
    difficulty: 'hard',
    icon: '📺',
    effects: {
      bannedCardTypes: ['MEDIA'],
    },
  },

  informationOverload: {
    id: 'information-overload',
    name: 'Information Overload',
    description: 'Hand size is 7, can play 5 cards per turn',
    category: 'cards',
    difficulty: 'medium',
    icon: '🗂️',
    effects: {
      handSizeModifier: 2, // +2 from base 5
      cardsPerTurnModifier: 2, // +2 from base 3
    },
  },

  guerrillaWarfare: {
    id: 'guerrilla-warfare',
    name: 'Guerrilla Warfare',
    description: 'Start with 7 cards, can play 4 cards per turn',
    category: 'cards',
    difficulty: 'medium',
    icon: '⚔️',
    effects: {
      startingHandSize: 7,
      cardsPerTurnModifier: 1,
    },
  },

  // Truth Modifiers
  truthAmplified: {
    id: 'truth-amplified',
    name: 'Truth Amplified',
    description: 'All Truth changes are doubled',
    category: 'truth',
    difficulty: 'hard',
    icon: '📡',
    effects: {
      truthChangesMultiplier: 2.0,
    },
  },

  realityLocked: {
    id: 'reality-locked',
    name: 'Reality Locked',
    description: 'Truth cannot go below 40% or above 60%',
    category: 'truth',
    difficulty: 'extreme',
    icon: '🔒',
    effects: {
      truthCap: 60,
      truthFloor: 40,
    },
  },

  believersAndSkeptics: {
    id: 'believers-skeptics',
    name: 'Believers & Skeptics',
    description: 'Truth starts at 20% or 80% (random)',
    category: 'truth',
    difficulty: 'hard',
    icon: '⚖️',
    effects: {
      // Implemented in game initialization
    },
  },

  // Territory Modifiers
  fortifiedNation: {
    id: 'fortified-nation',
    name: 'Fortified Nation',
    description: 'All states have +2 Defense',
    category: 'territory',
    difficulty: 'hard',
    icon: '🏰',
    effects: {
      globalDefenseBonus: 2,
    },
  },

  coldWar: {
    id: 'cold-war',
    name: 'Cold War',
    description: 'Both players start with 10 states, all others neutral',
    category: 'territory',
    difficulty: 'extreme',
    icon: '❄️',
    effects: {
      startingControlledStates: 10,
    },
  },

  territorialDispute: {
    id: 'territorial-dispute',
    name: 'Territorial Dispute',
    description: 'States require -2 Pressure to capture',
    category: 'territory',
    difficulty: 'easy',
    icon: '🗺️',
    effects: {
      captureThresholdDelta: -2,
    },
  },

  // Special Modifiers
  paranormalSurge: {
    id: 'paranormal-surge',
    name: 'Paranormal Surge',
    description: 'Cryptid/UFO events 3x more frequent',
    category: 'special',
    difficulty: 'medium',
    icon: '👽',
    effects: {
      specificCardBoostedRate: [
        { cardId: 'truth-027', multiplier: 3 }, // Bigfoot
        { cardId: 'truth-028', multiplier: 3 }, // UFO
        { cardId: 'truth-029', multiplier: 3 }, // Loch Ness
      ],
    },
  },

  blitzkrieg: {
    id: 'blitzkrieg',
    name: 'Blitzkrieg',
    description: 'Game ends after 15 turns regardless of victory conditions',
    category: 'special',
    difficulty: 'extreme',
    icon: '⚡',
    effects: {
      // Implemented in victory condition check
    },
  },

  economicWarfare: {
    id: 'economic-warfare',
    name: 'Economic Warfare',
    description: 'Both players gain +3 IP per turn',
    category: 'special',
    difficulty: 'medium',
    icon: '💵',
    effects: {
      incomeBonus: 3,
    },
  },
};

// Daily Challenge System
export interface DailyChallenge {
  date: string; // YYYY-MM-DD format
  seed: number;
  modifiers: GameModifier[];
  description: string;
  rewardMultiplier: number; // Score multiplier for leaderboard
}

// Generate deterministic daily challenge from date
export const generateDailyChallenge = (date: Date = new Date()): DailyChallenge => {
  const dateStr = date.toISOString().split('T')[0];
  
  // Simple deterministic seed from date
  const dateParts = dateStr.split('-').map(Number);
  const seed = dateParts[0] * 10000 + dateParts[1] * 100 + dateParts[2];
  
  // Use seed to pick modifiers deterministically
  const modifierKeys = Object.keys(GAME_MODIFIERS);
  const rng = seededRandom(seed);
  
  // Pick 1-3 modifiers
  const modifierCount = Math.floor(rng() * 3) + 1;
  const selectedModifiers: GameModifier[] = [];
  
  for (let i = 0; i < modifierCount; i++) {
    const index = Math.floor(rng() * modifierKeys.length);
    const modifier = GAME_MODIFIERS[modifierKeys[index]];
    if (modifier && !selectedModifiers.includes(modifier)) {
      selectedModifiers.push(modifier);
    }
  }
  
  // Calculate reward multiplier based on difficulty
  const rewardMultiplier = selectedModifiers.reduce((mult, mod) => {
    const difficultyMult = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.5,
      extreme: 2.0,
    };
    return mult * (difficultyMult[mod.difficulty || 'medium'] || 1.0);
  }, 1.0);
  
  return {
    date: dateStr,
    seed,
    modifiers: selectedModifiers,
    description: `Today's Challenge: ${selectedModifiers.map(m => m.name).join(' + ')}`,
    rewardMultiplier: Math.round(rewardMultiplier * 100) / 100,
  };
};

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
}

// Apply modifiers to game state
export const applyModifiersToGameState = (
  gameState: any,
  modifiers: GameModifier[]
): any => {
  const modified = { ...gameState };
  
  modifiers.forEach(modifier => {
    if (!modifier.effects) return;
    
    const { effects } = modifier;
    
    // Apply effects based on type
    if (effects.allCardsCostDelta) {
      // Would be applied in card cost calculation
    }
    
    if (effects.handSizeModifier) {
      // Modify starting hand size
    }
    
    if (effects.truthChangesMultiplier) {
      // Would be applied in truth calculations
    }
    
    if (effects.globalDefenseBonus) {
      // Apply to all states
      modified.states = modified.states.map((state: any) => ({
        ...state,
        defense: state.defense + effects.globalDefenseBonus!,
      }));
    }
    
    // Additional modifier applications...
  });
  
  return modified;
};

export const getModifierById = (id: string): GameModifier | undefined => {
  return GAME_MODIFIERS[id];
};

export const getModifiersByCategory = (
  category: GameModifier['category']
): GameModifier[] => {
  return Object.values(GAME_MODIFIERS).filter(m => m.category === category);
};
