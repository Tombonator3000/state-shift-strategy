/**
 * Recurring Character Tracking System
 * Tracks character appearances across the game for narrative continuity
 * and escalating effects.
 */

export interface CharacterArc {
  stage: number;
  label: string;
  description: string;
  articleVariant: string;
}

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
  storyArcs: CharacterArc[];
  currentStage: number;
}

export interface RecurringCharacterProgress {
  appearances: number;
  lastRound: number;
  currentStage: number;
  lastArticleVariant: string | null;
  milestones: string[];
}

export type RecurringCharacterState = Record<string, RecurringCharacterProgress>;

export interface CharacterAppearanceResult {
  character: RecurringCharacter | null;
  bonus: { truthDelta?: number; ipDelta?: number; costReduction?: number };
  milestone: { label: string; effect: unknown } | null;
  progress: RecurringCharacterProgress | null;
  stageArc: CharacterArc | null;
  stageJustAdvanced: boolean;
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
    storyArcs: [
      {
        stage: 0,
        label: 'Broadcast Prophet',
        description:
          'Rex’s bunker studio sermons break into the mainstream while he hustles survival swag between prophecies.',
        articleVariant: 'pastor_rex_stage_0',
      },
      {
        stage: 1,
        label: 'Miracle Revivalist',
        description:
          'Tent revivals levitate over heartland cornfields as Rex forecasts bumper crops with unnerving accuracy.',
        articleVariant: 'pastor_rex_stage_1',
      },
      {
        stage: 2,
        label: 'Airborne Border Preacher',
        description:
          'Rex floats sermons along state lines, sparring mid-air with federal paperwork while promising brisket-flavored salvation.',
        articleVariant: 'pastor_rex_stage_2',
      },
    ],
    currentStage: 0,
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
    storyArcs: [
      {
        stage: 0,
        label: 'Reflection Liaison',
        description:
          'Smitherson waves away crystal-clear UFO footage with mirrored sunglasses and voluntary consent forms.',
        articleVariant: 'agent_smitherson_stage_0',
      },
      {
        stage: 1,
        label: 'Historic Dampener',
        description:
          'He weaponizes patriotic paperwork, forcing tourists to whisper NDA oaths inside Independence Hall.',
        articleVariant: 'agent_smitherson_stage_1',
      },
      {
        stage: 2,
        label: 'Quiet Booth Architect',
        description:
          'Smitherson seeds national parks with listening kiosks that recycle secrets under the guise of mindfulness.',
        articleVariant: 'agent_smitherson_stage_2',
      },
    ],
    currentStage: 0,
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
    storyArcs: [
      {
        stage: 0,
        label: 'Storm Courier',
        description:
          'Florida Man treats hurricanes like mail routes, surfing chaos to deliver perfectly sorted envelopes.',
        articleVariant: 'florida_man_stage_0',
      },
      {
        stage: 1,
        label: 'Great Lakes Liberator',
        description:
          'He ice-surfs the Midwest, carving hotline sigils that thaw freighters and embarrass the Coast Guard.',
        articleVariant: 'florida_man_stage_1',
      },
      {
        stage: 2,
        label: 'Skywriting Ringmaster',
        description:
          'Florida Man hijacks small-town airshows to broadcast resistance timetables in contrails and citrus fog.',
        articleVariant: 'florida_man_stage_2',
      },
    ],
    currentStage: 0,
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
    storyArcs: [
      {
        stage: 0,
        label: 'Transparency Candidate',
        description:
          'Bat Boy dives into politics, demanding curtain-free governance with sonar-backed sincerity.',
        articleVariant: 'bat_boy_stage_0',
      },
      {
        stage: 1,
        label: 'Night School Provocateur',
        description:
          'He hosts upside-down civics seminars in national monuments, tutoring insomniac lawmakers.',
        articleVariant: 'bat_boy_stage_1',
      },
      {
        stage: 2,
        label: 'Conspiracy Maestro',
        description:
          'Bat Boy remixes classified setlists into campaign anthems, teaming with fellow weirdos to declassify the groove.',
        articleVariant: 'bat_boy_stage_2',
      },
    ],
    currentStage: 0,
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
    storyArcs: [
      {
        stage: 0,
        label: 'Aurora Quartermaster',
        description:
          'Chen answers celestial shopping lists, upgrading her paranoia kiosk for polar clientele.',
        articleVariant: 'maria_chen_stage_0',
      },
      {
        stage: 1,
        label: 'Ley Line Retailer',
        description:
          'Times Square billboards beam her foil couture while tourists eavesdrop through resonant crowns.',
        articleVariant: 'maria_chen_stage_1',
      },
      {
        stage: 2,
        label: 'Cryptid Supply Chain Chief',
        description:
          'Chen co-manages convention merch tables with Bat Boy, plotting multi-state paranoia franchises.',
        articleVariant: 'maria_chen_stage_2',
      },
    ],
    currentStage: 0,
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
    storyArcs: [
      {
        stage: 0,
        label: 'Friday Night Watcher',
        description:
          'Hammond rebuilds his high school defense with anti-abduction drills and midnight sky audits.',
        articleVariant: 'coach_hammond_stage_0',
      },
      {
        stage: 1,
        label: 'Bluegrass Analyst',
        description:
          'He exports UFO playbooks to Churchill Downs, coaching jockeys on how to blitz tractor beams.',
        articleVariant: 'coach_hammond_stage_1',
      },
      {
        stage: 2,
        label: 'National Counterplay Director',
        description:
          'Hammond leads interstate clinics, diagramming zone coverage for storm fronts and orbital scrimmages.',
        articleVariant: 'coach_hammond_stage_2',
      },
    ],
    currentStage: 0,
  },
};

/**
 * Track character appearance and return cumulative bonuses
 */
const NORMALIZED_NAME_CACHE = new Map<string, string>();

const normaliseIdentifier = (value: string): string => {
  const cached = NORMALIZED_NAME_CACHE.get(value);
  if (cached) {
    return cached;
  }
  const normalized = value.trim().toLowerCase();
  NORMALIZED_NAME_CACHE.set(value, normalized);
  return normalized;
};

const NAME_TO_ID = Object.values(RECURRING_CHARACTERS).reduce<Map<string, string>>((map, character) => {
  map.set(normaliseIdentifier(character.id), character.id);
  map.set(normaliseIdentifier(character.name), character.id);
  return map;
}, new Map());

export const resolveRecurringCharacterId = (identifier: string): string | null => {
  if (!identifier) {
    return null;
  }
  const normalized = normaliseIdentifier(identifier);
  return NAME_TO_ID.get(normalized) ?? null;
};

const createDefaultProgress = (character: RecurringCharacter): RecurringCharacterProgress => {
  const stageArc = character.storyArcs.find(arc => arc.stage === 0) ?? character.storyArcs[0];
  return {
    appearances: 0,
    lastRound: 0,
    currentStage: stageArc?.stage ?? 0,
    lastArticleVariant: stageArc?.articleVariant ?? null,
    milestones: [],
  };
};

export function trackCharacterAppearance(
  cardName: string,
  cardTags: string[] = [],
  currentRound: number,
  characterState: RecurringCharacterState = {},
): CharacterAppearanceResult {
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

    if (!matches) {
      continue;
    }

    const previous = characterState[char.id] ?? createDefaultProgress(char);
    const appearances = previous.appearances + 1;
    const maxStage = Math.max(0, char.storyArcs.length - 1);
    const stageIndex = Math.min(maxStage, appearances - 1);
    const stageArc =
      char.storyArcs.find(arc => arc.stage === stageIndex) ??
      char.storyArcs.find(arc => arc.stage === previous.currentStage) ??
      char.storyArcs[maxStage] ??
      null;
    const nextVariant = stageArc?.articleVariant ?? previous.lastArticleVariant ?? null;
    const stageJustAdvanced = stageIndex !== previous.currentStage;

    const bonus: { truthDelta?: number; ipDelta?: number; costReduction?: number } = {};

    if (char.effects.perAppearance) {
      if (typeof char.effects.perAppearance.truthDelta === 'number') {
        bonus.truthDelta = char.effects.perAppearance.truthDelta * appearances;
      }
      if (typeof char.effects.perAppearance.ipDelta === 'number') {
        bonus.ipDelta = char.effects.perAppearance.ipDelta * appearances;
      }
      if (typeof char.effects.perAppearance.costReduction === 'number') {
        bonus.costReduction = char.effects.perAppearance.costReduction * appearances;
      }
    }

    let milestone: { label: string; effect: unknown } | null = null;
    let milestoneLabels = previous.milestones;
    if (char.effects.milestones) {
      for (const ms of char.effects.milestones) {
        if (appearances === ms.appearanceCount) {
          milestone = { label: ms.label, effect: ms.effect };
          milestoneLabels = Array.from(new Set([...(milestoneLabels ?? []), ms.label]));
          if (typeof (ms.effect as { truthDelta?: number }).truthDelta === 'number') {
            bonus.truthDelta = (bonus.truthDelta ?? 0) + (ms.effect as { truthDelta: number }).truthDelta;
          }
          if (typeof (ms.effect as { ipDelta?: number }).ipDelta === 'number') {
            bonus.ipDelta = (bonus.ipDelta ?? 0) + (ms.effect as { ipDelta: number }).ipDelta;
          }
        }
      }
    }

    const progress: RecurringCharacterProgress = {
      appearances,
      lastRound: currentRound,
      currentStage: stageIndex,
      lastArticleVariant: nextVariant,
      milestones: milestoneLabels ?? [],
    };

    characterState[char.id] = progress;

    return { character: char, bonus, milestone, progress, stageArc: stageArc ?? null, stageJustAdvanced };
  }

  return { character: null, bonus: {}, milestone: null, progress: null, stageArc: null, stageJustAdvanced: false };
}

export default RECURRING_CHARACTERS;
