import type { Card } from '@/types';

export type AgendaIssueId = 'ufo' | 'cryptid' | 'coverup';

type CardTone = Card['type'];

export interface AgendaIssueDefinition {
  id: AgendaIssueId;
  label: string;
  description: string;
  priorityThemes: string[];
  supportingThemes?: string[];
  fallbackWeight?: number;
  factionQuips: {
    truth: string[];
    government: string[];
    neutral?: string[];
  };
  newspaper?: {
    verbs?: Partial<Record<CardTone, string[]>>;
    subheads?: Partial<Record<'truth' | 'government', string[]>>;
    tags?: string[];
    heroKickers?: string[];
  };
}

export interface AgendaIssueState {
  id: AgendaIssueId;
  label: string;
  description: string;
  tags: string[];
}

const createIssueState = (issue: AgendaIssueDefinition): AgendaIssueState => ({
  id: issue.id,
  label: issue.label,
  description: issue.description,
  tags: issue.newspaper?.tags ?? [`#Issue-${issue.id.toUpperCase()}`],
});

const ISSUE_ROTATION_KEY = 'shadowgov.agendaIssueRotation';
const ISSUE_ACTIVE_KEY = 'shadowgov.activeAgendaIssue';

const baseIssues: AgendaIssueDefinition[] = [
  {
    id: 'ufo',
    label: 'Cosmic Cover Stories',
    description: 'Saucer sightings, crash cart buffets, and orbital bake-offs dominate the rumor mill.',
    priorityThemes: ['Desert Disclosure', 'Statewide Spectacle', 'Crash Site Compliance'],
    supportingThemes: ['Truth Momentum', 'Traveling Influence'],
    factionQuips: {
      truth: [
        'Truth kitchen radios hum in sympathy with the mothership.',
        'Operatives swap recipes for meteorite reduction glaze.',
        'Witness hotline interns keep binoculars next to the blenders.',
      ],
      government: [
        'Containment crews log every contrail as “decorative mist.”',
        'Briefing rooms circulate the phrase “optical swamp gas.”',
        'Audit squads requisition anti-gravity disclaimers by the crate.',
      ],
      neutral: [
        'Station gossip wonders if the cafeteria roof will open again tonight.',
        'Archivists arrange foil hats by alphabetical order, just in case.',
      ],
    },
    newspaper: {
      verbs: {
        ATTACK: [
          'CRACKS SECRET HANGAR',
          'BREACHES ORBITAL BUFFET',
          'OVERRIDES LAUNCH PAD LOCKDOWN',
        ],
        MEDIA: [
          'HIJACKS COSMIC FEED',
          'BEAMS TRANSMISSION FROM ORBIT',
          'LOOPS SAUCER TELEMETRY',
        ],
        ZONE: [
          'FORTIFIES LANDING STRIP',
          'GRIDLOCKS ABDUCTION CORRIDOR',
          'MAPS CONSTELLATION SUPPLY LINES',
        ],
      },
      subheads: {
        truth: [
          'Witness hotlines jam as neon contrails paint the sky over every safehouse.',
          'Field reporters swear the stars blink back in Morse code.',
        ],
        government: [
          'Containment desk distributes anti-gravity disclaimers and complimentary blindfolds.',
          'Officials insist the glowing crop circles are patriotic training exercises.',
        ],
      },
      tags: ['#IssueUFO', '#SaucerSeason'],
      heroKickers: [
        'This week’s tabloid focus: Saucer Season',
        'Cosmic Cover Stories headline the edition',
      ],
    },
  },
  {
    id: 'cryptid',
    label: 'Cryptid Culinary Summit',
    description: 'Mythic potlucks, creature diplomacy, and monster RSVP lists keep the presses running hot.',
    priorityThemes: ['Mythic Diplomacy', 'Cryptid Hospitality', 'Traveling Influence'],
    supportingThemes: ['Statewide Spectacle'],
    factionQuips: {
      truth: [
        'Scout teams leave gluten-free offerings for every hoofprint.',
        'Archivists label coolers “fang-friendly” and hope for the best.',
        'Potluck coordinators debate whether swamp gas counts as seasoning.',
      ],
      government: [
        'Containment liaisons practice smiling while holding tranquilizer darts.',
        'Logistics briefs rename cryptids as “unregistered catering staff.”',
        'Budget monitors request itemized receipts for every claw mark.',
      ],
      neutral: [
        'Local diners post “Cryptids Eat Free” chalkboards just to stay on theme.',
      ],
    },
    newspaper: {
      verbs: {
        ATTACK: [
          'DE-FANGS FOREST RUMORS',
          'TRAPS SWAMP LEGENDS',
          'AMBUSHES ROGUE HOWLERS',
        ],
        MEDIA: [
          'SPOTLIGHTS BEASTLY BUFFET',
          'STREAMS SASQUATCH SOIREE',
          'PRINTS CLAW-SIGNED REVIEWS',
        ],
        ZONE: [
          'CORDONS OFF CRYPTID CAMPSITE',
          'STAKES OUT HOOFPRINT HOTELS',
          'LINES TRAIL WITH OFFERING TABLES',
        ],
      },
      subheads: {
        truth: [
          'Conspiracy caterers swear the howling harmonizes with their playlist.',
          'Witnesses report potluck tables levitating to make room for scaled VIPs.',
        ],
        government: [
          'Containment crews release “Do Not Feed the Monster” pamphlets in six languages.',
          'Officials stress the claws on the guest list are purely decorative.',
        ],
      },
      tags: ['#IssueCryptid', '#MonsterMixer'],
      heroKickers: [
        'Weekly focus: Cryptid Catering Ops',
        'All eyes on the Cryptid Culinary Summit',
      ],
    },
  },
  {
    id: 'coverup',
    label: 'Coverup Control Grid',
    description: 'Budget smokescreens, narrative lockdowns, and classified casseroles set the tempo.',
    priorityThemes: ['Narrative Containment', 'Information Discipline', 'Fiscal Obfuscation'],
    supportingThemes: ['Narrative Fusion', 'Synergy Sustainment'],
    fallbackWeight: 0.85,
    factionQuips: {
      truth: [
        'Leaks division double-binds every memo with twine and conspiracy twinkle.',
        'Whistle chefs garnish casseroles with shredded nondisclosure agreements.',
        'Radio hosts practice whispering “follow the money” in seven octaves.',
      ],
      government: [
        'Spin rooms install emergency shredders next to every serving tray.',
        'Budget auditors label each ladle as a potential breach vector.',
        'Briefing captains assign code names to every casserole lid.',
      ],
      neutral: [
        'Interns rehearse plausible deniability between coffee runs.',
        'Archivists sort cover stories by degree of scorch marks.',
      ],
    },
    newspaper: {
      verbs: {
        ATTACK: [
          'SHREDS REDACTION WALL',
          'BREACHES COVER STORY VAULT',
          'DETACHES SPIN HUB',
        ],
        MEDIA: [
          'LEAKS THE PLAYBOOK',
          'PUBLISHES BUDGET GHOSTS',
          'TELEVISES REDACTION DRILLS',
        ],
        DEFENSIVE: [
          'SANDBAGS INFORMATION LEAKS',
          'PATCHES CLASSIFIED GASKETS',
          'LOCKS DOWN THE BRIEFING WING',
        ],
      },
      subheads: {
        truth: [
          'Leaks taskforce says the documents smell faintly of barbecue smoke.',
          'Sources insist the cover story tripped over its own budget line.',
        ],
        government: [
          'Containment desk adds extra binders to weigh down suspiciously buoyant files.',
          'Officials deny the smell of burnt ledger even as alarms blink politely.',
        ],
      },
      tags: ['#IssueCoverup', '#RedactionRodeo'],
      heroKickers: [
        'Special edition: Coverup Control Grid',
        'Narrative containment drills headline this issue',
      ],
    },
  },
];

export const AGENDA_ISSUES = baseIssues;

const ISSUE_MAP = new Map<AgendaIssueId, AgendaIssueDefinition>(
  baseIssues.map(issue => [issue.id, issue]),
);

export const getAgendaIssueById = (id?: string | null): AgendaIssueDefinition | undefined => {
  if (!id) {
    return undefined;
  }
  return ISSUE_MAP.get(id as AgendaIssueId);
};

const clampIndex = (index: number, length: number): number => {
  if (!Number.isFinite(index) || length <= 0) {
    return 0;
  }
  const normalized = index % length;
  return normalized < 0 ? normalized + length : normalized;
};

const withLocalStorage = <T,>(fallback: T, fn: (storage: Storage) => T): T => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    return fn(window.localStorage);
  } catch {
    return fallback;
  }
};

export const peekActiveAgendaIssue = (): AgendaIssueDefinition => {
  const fallback = AGENDA_ISSUES[0];
  return withLocalStorage(fallback, storage => {
    const activeId = storage.getItem(ISSUE_ACTIVE_KEY) as AgendaIssueId | null;
    const active = activeId ? getAgendaIssueById(activeId) : undefined;
    if (active) {
      return active;
    }
    const rotationIndex = parseInt(storage.getItem(ISSUE_ROTATION_KEY) ?? '0', 10);
    const index = clampIndex(rotationIndex, AGENDA_ISSUES.length);
    const issue = AGENDA_ISSUES[index] ?? fallback;
    storage.setItem(ISSUE_ACTIVE_KEY, issue.id);
    return issue;
  });
};

export const advanceAgendaIssue = (): AgendaIssueDefinition => {
  const fallback = AGENDA_ISSUES[0];
  return withLocalStorage(fallback, storage => {
    const rotationIndexRaw = parseInt(storage.getItem(ISSUE_ROTATION_KEY) ?? '0', 10);
    const rotationIndex = clampIndex(rotationIndexRaw, AGENDA_ISSUES.length);
    const issue = AGENDA_ISSUES[rotationIndex] ?? fallback;
    const nextIndex = clampIndex(rotationIndex + 1, AGENDA_ISSUES.length);
    storage.setItem(ISSUE_ROTATION_KEY, nextIndex.toString());
    storage.setItem(ISSUE_ACTIVE_KEY, issue.id);
    return issue;
  });
};

export const ensureAgendaIssueState = (issue?: AgendaIssueDefinition | null): AgendaIssueState => {
  return createIssueState(issue ?? peekActiveAgendaIssue());
};

export const resolveIssueStateById = (id?: string | null): AgendaIssueState => {
  const match = getAgendaIssueById(id);
  return ensureAgendaIssueState(match ?? null);
};

export const getIssueQuip = (
  issueId: string | undefined,
  faction: 'truth' | 'government',
  seed?: number,
): string | null => {
  const config = getAgendaIssueById(issueId);
  if (!config) {
    return null;
  }
  const pools = [config.factionQuips[faction] ?? [], config.factionQuips.neutral ?? []].filter(
    (pool): pool is string[] => Array.isArray(pool) && pool.length > 0,
  );
  if (!pools.length) {
    return null;
  }
  const merged = pools.flat();
  if (!merged.length) {
    return null;
  }
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    const index = Math.abs(seed) % merged.length;
    return merged[index] ?? null;
  }
  const index = Math.floor(Math.random() * merged.length);
  return merged[index] ?? null;
};

export const applyIssueVerbOverlay = (
  base: string[],
  issueId?: string,
  tone?: CardTone,
): string[] => {
  const config = getAgendaIssueById(issueId);
  const overlay = tone ? config?.newspaper?.verbs?.[tone] ?? [] : [];
  if (!overlay?.length) {
    return base;
  }
  const seen = new Set<string>();
  const combined: string[] = [];
  for (const item of overlay) {
    if (!seen.has(item)) {
      combined.push(item);
      seen.add(item);
    }
  }
  for (const item of base) {
    if (!seen.has(item)) {
      combined.push(item);
      seen.add(item);
    }
  }
  return combined;
};

export const applyIssueSubheadOverlay = (
  base: string[],
  issueId: string | undefined,
  faction: 'truth' | 'government',
): string[] => {
  const config = getAgendaIssueById(issueId);
  const overlay = config?.newspaper?.subheads?.[faction] ?? [];
  if (!overlay?.length) {
    return base;
  }
  const seen = new Set<string>();
  const combined: string[] = [];
  for (const item of overlay) {
    if (!seen.has(item)) {
      combined.push(item);
      seen.add(item);
    }
  }
  for (const item of base) {
    if (!seen.has(item)) {
      combined.push(item);
      seen.add(item);
    }
  }
  return combined;
};

export const getIssueTags = (issueId?: string | null): string[] => {
  const config = getAgendaIssueById(issueId ?? undefined);
  return config?.newspaper?.tags ?? [`#Issue-${(issueId ?? 'mystery').toUpperCase()}`];
};

export const getIssueHeroKicker = (issueId?: string | null): string | null => {
  const config = getAgendaIssueById(issueId ?? undefined);
  const pool = config?.newspaper?.heroKickers;
  if (!pool || pool.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
};

export const weightForIssue = (issueId: string | undefined, theme: string | undefined): number => {
  if (!issueId || !theme) {
    return 1;
  }
  const config = getAgendaIssueById(issueId);
  if (!config) {
    return 1;
  }
  if (config.priorityThemes.includes(theme)) {
    return 2.5;
  }
  if (config.supportingThemes?.includes(theme)) {
    return 1.6;
  }
  return typeof config.fallbackWeight === 'number' ? config.fallbackWeight : 1;
};

export const agendaIssueToState = (issue: AgendaIssueDefinition): AgendaIssueState => createIssueState(issue);

