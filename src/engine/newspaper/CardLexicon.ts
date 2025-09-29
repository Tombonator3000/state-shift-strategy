import type { Card } from '@/types';

type NumericLike = number | null | undefined;

export interface NarrativeEffectProfile {
  truthDelta: number | null;
  ipOpponent: number | null;
  pressureDelta: number | null;
}

export interface RawNarrativeCardRecord {
  id: string;
  name: string;
  faction: Card['faction'];
  type: Card['type'];
  rarity?: Card['rarity'];
  cost?: number;
  setId: string;
  setName: string;
  tags?: string[];
  effects: Partial<NarrativeEffectProfile> | null;
}

export interface NarrativeDatabase {
  generatedAt: string;
  cardCount: number;
  sets?: Record<string, { id: string; name: string; count: number }>;
  cards: Record<string, RawNarrativeCardRecord>;
}

export interface CardLexiconEntry {
  id: string;
  name: string;
  type: Card['type'];
  faction: Card['faction'];
  rarity?: Card['rarity'];
  cost?: number;
  setId: string;
  setName: string;
  baseTags: string[];
  gagTags: string[];
  artHint: string;
  effects: NarrativeEffectProfile;
}

export type CardLexicon = Record<string, CardLexiconEntry>;

const NARRATIVE_DB_URL = '/data/NarrativeDB.json';

const normalizeNumber = (value: NumericLike): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return null;
};

const sanitizeTag = (value: string): string => {
  const trimmed = value.trim();
  const dashed = trimmed.replace(/\s+/g, '-');
  const cleaned = dashed.replace(/[^a-z0-9-]/gi, '');
  const collapsed = cleaned.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
  return collapsed.toLowerCase();
};

const ensureHashTag = (value: string): string => {
  if (!value) {
    return value;
  }
  return value.startsWith('#') ? value : `#${value}`;
};

const BASE_FACTION_TAGS: Record<string, string> = {
  truth: '#TruthSignal',
  Truth: '#TruthSignal',
  government: '#ContainmentBureau',
  Government: '#ContainmentBureau',
};

const BASE_TYPE_TAGS: Record<Card['type'], string> = {
  ATTACK: '#DirectAction',
  MEDIA: '#BroadcastSpin',
  ZONE: '#GroundSurge',
};

type TagPattern = {
  test: RegExp;
  tags: string[];
};

const NAME_TAG_PATTERNS: TagPattern[] = [
  { test: /(cryptid|mothman|bigfoot|ness|sasquatch|chupacabra|yeti|merman)/i, tags: ['#CryptidWatch', '#MonsterDisclosure'] },
  { test: /(pumpkin|haunt|ghost|spirit|grave|spooky|witch|candy|lantern|specter|ghoul|boo)/i, tags: ['#PumpkinSpicePanic', '#HauntAlert'] },
  { test: /(ufo|alien|abduction|extraterrestrial|probe|saucer|galactic)/i, tags: ['#ContactProtocol', '#SkyAnomaly'] },
  { test: /(zombie|vampire|werewolf|mummy|monster|crypt)/i, tags: ['#MonsterMashup', '#NightShift'] },
  { test: /(operation|protocol|briefing|classified|redacted|surveillance|counter|division)/i, tags: ['#RedactedOps', '#BureauBuzz'] },
  { test: /(podcast|stream|viral|broadcast|feed|network|channel|press|headline)/i, tags: ['#SignalBoost', '#NarrativeFlood'] },
  { test: /(expedition|field|campaign|march|rally|canvass|precinct|district)/i, tags: ['#FieldWorkFrenzy', '#BootsOnTheGround'] },
];

const SET_TAG_OVERRIDES: Record<string, string[]> = {
  cryptids: ['#CryptidParade', '#MothmanMoments'],
  halloween_spooktacular_with_temp_image: ['#HauntedBriefing', '#SpooktacularLeak'],
};

const pick = <T,>(source: T[], fallback: T): T => {
  if (source.length === 0) {
    return fallback;
  }
  const index = Math.floor(Math.random() * source.length);
  return source[index] ?? fallback;
};

const buildArtHint = (entry: RawNarrativeCardRecord, gagTags: string[]): string => {
  const factionPalette =
    entry.faction === 'truth' || entry.faction === 'Truth'
      ? 'chaotic tabloid collage'
      : 'sterile surveillance dossier';

  const tone =
    entry.type === 'ATTACK'
      ? 'frozen mid-confrontation with motion blur typography'
      : entry.type === 'MEDIA'
        ? 'studio lights, glowing monitors and headline ticker tape'
        : 'map-table war room cluttered with pushpins and coffee rings';

  const effectFragments: string[] = [];
  const truth = normalizeNumber(entry.effects?.truthDelta);
  const ip = normalizeNumber(entry.effects?.ipOpponent);
  const pressure = normalizeNumber(entry.effects?.pressureDelta);

  if (truth) {
    effectFragments.push(`truth meter at ${truth > 0 ? '+' : ''}${truth}`);
  }
  if (ip) {
    effectFragments.push(`IP swing ${ip > 0 ? '+' : ''}${ip}`);
  }
  if (pressure) {
    effectFragments.push(`pressure surge ${pressure}`);
  }

  const effectLine = effectFragments.length
    ? `data callouts for ${effectFragments.join(', ')}`
    : 'subtle redacted numerology worked into the margins';

  const tagLine = gagTags.length ? `easter eggs nodding to ${gagTags.slice(0, 2).join(' & ')}` : 'paranoid marginalia';

  return `${factionPalette} depicting "${entry.name}" with ${tone}, ${effectLine}, ${tagLine}.`;
};

const enrichRecord = (record: RawNarrativeCardRecord): CardLexiconEntry => {
  const baseTags = new Set<string>();
  const gagTags = new Set<string>();

  if (Array.isArray(record.tags)) {
    for (const tag of record.tags) {
      if (!tag) continue;
      baseTags.add(ensureHashTag(sanitizeTag(String(tag))));
    }
  }

  const factionTag = BASE_FACTION_TAGS[record.faction] ?? null;
  if (factionTag) {
    gagTags.add(factionTag);
  }

  const typeTag = BASE_TYPE_TAGS[record.type] ?? null;
  if (typeTag) {
    gagTags.add(typeTag);
  }

  for (const pattern of NAME_TAG_PATTERNS) {
    if (pattern.test.test(record.name)) {
      for (const tag of pattern.tags) {
        gagTags.add(tag);
      }
    }
  }

  const setTags = SET_TAG_OVERRIDES[record.setId];
  if (setTags) {
    for (const tag of setTags) {
      gagTags.add(tag);
    }
  } else if (record.setId && record.setId !== 'core-truth' && record.setId !== 'core-government') {
    gagTags.add(`#${sanitizeTag(record.setName || record.setId)}`);
  }

  const mandatory = record.faction === 'truth' || record.faction === 'Truth' ? '#LeakSeason' : '#NarrativeContainment';
  gagTags.add(mandatory);

  if (gagTags.size === 0) {
    gagTags.add('#ParanoidPress');
  }

  const artHint = buildArtHint(record, Array.from(gagTags));

  return {
    id: record.id,
    name: record.name,
    type: record.type,
    faction: record.faction,
    rarity: record.rarity,
    cost: record.cost,
    setId: record.setId,
    setName: record.setName,
    baseTags: Array.from(baseTags),
    gagTags: Array.from(gagTags),
    artHint,
    effects: {
      truthDelta: normalizeNumber(record.effects?.truthDelta),
      ipOpponent: normalizeNumber((record.effects as any)?.ipOpponent ?? (record.effects as any)?.ipDelta?.opponent),
      pressureDelta: normalizeNumber(record.effects?.pressureDelta),
    },
  } satisfies CardLexiconEntry;
};

let cache: CardLexicon | null = null;
let loadPromise: Promise<CardLexicon> | null = null;

const parseDatabase = (value: unknown): NarrativeDatabase | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as NarrativeDatabase;
  if (!record.cards || typeof record.cards !== 'object') {
    return null;
  }
  return record;
};

export async function loadCardLexicon(): Promise<CardLexicon> {
  if (cache) {
    return cache;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const response = await fetch(NARRATIVE_DB_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load narrative database: ${response.status}`);
      }
      const json = await response.json();
      const parsed = parseDatabase(json);
      if (!parsed) {
        throw new Error('Invalid narrative database shape.');
      }
      const entries: CardLexicon = {};
      for (const raw of Object.values(parsed.cards)) {
        if (!raw?.id) {
          continue;
        }
        entries[raw.id] = enrichRecord(raw);
      }
      cache = entries;
    } catch (error) {
      console.warn('[NarrativeDB] load failed, synthesizing minimal lexicon', error);
      cache = {};
    } finally {
      loadPromise = null;
    }
    return cache ?? {};
  })();

  return loadPromise;
}

export function getCardLexiconSync(): CardLexicon | null {
  return cache;
}

export function rememberCardLexicon(entries: CardLexicon): void {
  cache = entries;
}

export function randomGagTag(entry: CardLexiconEntry): string {
  const selection = [...entry.gagTags, ...entry.baseTags.filter(Boolean)];
  if (!selection.length) {
    return '#ParanoidPress';
  }
  return pick(selection, selection[0]);
}
