/**
 * Recurring Character Tracking System
 * Tracks character appearances across the game for narrative continuity
 * and escalating effects.
 */

export interface RecurringCharacter {
  id: string;
  name: string;
  cardPatterns: {
    nameIncludes?: string[];
    tagsAny?: string[];
  };
  appearances: number;
  lastAppearanceRound: number;
  effects: {
    perAppearance?: {
      truthDelta?: number;
      ipDelta?: number;
      costReduction?: number;
    };
    milestones?: Array<{
      appearanceCount: number;
      effect: {
        truthDelta?: number;
        ipDelta?: number;
        specialEvent?: string;
      };
      label: string;
    }>;
  };
  lore: string;
}

export const RECURRING_CHARACTERS: Record<string, RecurringCharacter> = {
  pastor_rex: {
    id: 'pastor_rex',
    name: 'Pastor Rex',
    cardPatterns: {
      nameIncludes: ['pastor rex', 'rex\'s'],
      tagsAny: ['pastor-rex'],
    },
    appearances: 0,
    lastAppearanceRound: 0,
    effects: {
      perAppearance: {
        truthDelta: 1,
      },
      milestones: [
        {
          appearanceCount: 3,
          effect: { truthDelta: 2, specialEvent: 'rex_prophecy_fulfilled' },
          label: 'Rex\'s Prophecy Fulfilled',
        },
        {
          appearanceCount: 5,
          effect: { truthDelta: 3, ipDelta: 2, specialEvent: 'rex_cult_following' },
          label: 'Rex Cult Following',
        },
      ],
    },
    lore: 'Local preacher whose doomsday predictions keep coming true.',
  },
  agent_smitherson: {
    id: 'agent_smitherson',
    name: 'Agent Smitherson',
    cardPatterns: {
      nameIncludes: ['agent smitherson', 'smitherson'],
      tagsAny: ['agent-smitherson', 'mib'],
    },
    appearances: 0,
    lastAppearanceRound: 0,
    effects: {
      perAppearance: {
        costReduction: 1,
      },
      milestones: [
        {
          appearanceCount: 3,
          effect: { ipDelta: 3, specialEvent: 'smitherson_network' },
          label: 'Smitherson Network Activated',
        },
      ],
    },
    lore: 'Man in Black who denies his own existence.',
  },
  florida_man: {
    id: 'florida_man',
    name: 'Florida Man',
    cardPatterns: {
      nameIncludes: ['florida man'],
      tagsAny: ['florida-man'],
    },
    appearances: 0,
    lastAppearanceRound: 0,
    effects: {
      perAppearance: {
        ipDelta: 1,
      },
      milestones: [
        {
          appearanceCount: 3,
          effect: { truthDelta: 3, specialEvent: 'florida_man_mayor' },
          label: 'Florida Man Runs for Office',
        },
        {
          appearanceCount: 5,
          effect: { truthDelta: 5, ipDelta: 3, specialEvent: 'florida_man_wins' },
          label: 'Florida Man Wins Election',
        },
      ],
    },
    lore: 'The legendary Florida Man whose exploits defy explanation.',
  },
  bat_boy: {
    id: 'bat_boy',
    name: 'Bat Boy',
    cardPatterns: {
      nameIncludes: ['bat boy'],
      tagsAny: ['bat-boy'],
    },
    appearances: 0,
    lastAppearanceRound: 0,
    effects: {
      perAppearance: {
        truthDelta: 1,
      },
      milestones: [
        {
          appearanceCount: 3,
          effect: { specialEvent: 'bat_boy_returns_cards' },
          label: 'Bat Boy Returns from Exile',
        },
      ],
    },
    lore: 'Mysterious cryptid who keeps showing up in unexpected places.',
  },
  maria_chen: {
    id: 'maria_chen',
    name: 'Maria Chen',
    cardPatterns: {
      nameIncludes: ['maria chen', 'tinfoil vendor'],
      tagsAny: ['maria-chen', 'vendor'],
    },
    appearances: 0,
    lastAppearanceRound: 0,
    effects: {
      perAppearance: {
        ipDelta: 1,
      },
      milestones: [
        {
          appearanceCount: 2,
          effect: { ipDelta: 2, specialEvent: 'chen_storefront' },
          label: 'Chen Opens Permanent Store',
        },
      ],
    },
    lore: 'Roswell tinfoil hat vendor whose business keeps growing.',
  },
  coach_hammond: {
    id: 'coach_hammond',
    name: 'Coach Terry Hammond',
    cardPatterns: {
      nameIncludes: ['coach hammond', 'terry hammond'],
      tagsAny: ['coach-hammond'],
    },
    appearances: 0,
    lastAppearanceRound: 0,
    effects: {
      perAppearance: {
        truthDelta: 1,
      },
      milestones: [
        {
          appearanceCount: 2,
          effect: { truthDelta: 2, specialEvent: 'hammond_support_group' },
          label: 'Hammond Starts UFO Support Group',
        },
      ],
    },
    lore: 'High school football coach who lost a game to a UFO.',
  },
};

/**
 * Track character appearance and return cumulative bonuses
 */
export function trackCharacterAppearance(
  cardName: string,
  cardTags: string[] = [],
  currentRound: number,
  characterState: Record<string, { appearances: number; lastRound: number }> = {},
): {
  character: RecurringCharacter | null;
  bonus: { truthDelta?: number; ipDelta?: number; costReduction?: number };
  milestone: { label: string; effect: unknown } | null;
} {
  const nameLower = cardName.toLowerCase();
  const tagsLower = cardTags.map(t => t.toLowerCase());

  for (const char of Object.values(RECURRING_CHARACTERS)) {
    const { nameIncludes, tagsAny } = char.cardPatterns;

    let matches = false;

    if (nameIncludes) {
      matches = nameIncludes.some(pattern => 
        nameLower.includes(pattern.toLowerCase())
      );
    }

    if (!matches && tagsAny) {
      matches = tagsAny.some(pattern => 
        tagsLower.includes(pattern.toLowerCase())
      );
    }

    if (matches) {
      // Get current state or initialize
      const state = characterState[char.id] || { appearances: 0, lastRound: 0 };
      state.appearances += 1;
      state.lastRound = currentRound;

      // Update character state
      characterState[char.id] = state;

      // Calculate cumulative bonus
      const bonus: { truthDelta?: number; ipDelta?: number; costReduction?: number } = {};
      
      if (char.effects.perAppearance) {
        if (char.effects.perAppearance.truthDelta) {
          bonus.truthDelta = char.effects.perAppearance.truthDelta * state.appearances;
        }
        if (char.effects.perAppearance.ipDelta) {
          bonus.ipDelta = char.effects.perAppearance.ipDelta * state.appearances;
        }
        if (char.effects.perAppearance.costReduction) {
          bonus.costReduction = char.effects.perAppearance.costReduction * state.appearances;
        }
      }

      // Check for milestone
      let milestone: { label: string; effect: unknown } | null = null;
      if (char.effects.milestones) {
        for (const ms of char.effects.milestones) {
          if (state.appearances === ms.appearanceCount) {
            milestone = { label: ms.label, effect: ms.effect };
            
            // Apply milestone bonus
            if (ms.effect.truthDelta) {
              bonus.truthDelta = (bonus.truthDelta || 0) + ms.effect.truthDelta;
            }
            if (ms.effect.ipDelta) {
              bonus.ipDelta = (bonus.ipDelta || 0) + ms.effect.ipDelta;
            }
          }
        }
      }

      return { character: char, bonus, milestone };
    }
  }

  return { character: null, bonus: {}, milestone: null };
}

export default RECURRING_CHARACTERS;
