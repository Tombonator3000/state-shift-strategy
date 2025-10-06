import rawNewspaperDataset from '@/data/newspaperData.json';

export type NewspaperData = {
  mastheads: string[];
  ads: string[];
  subheads?: {
    generic?: string[];
    attack?: string[];
    media?: string[];
    zone?: string[];
  };
  bylines?: string[];
  sources?: string[];
  conspiracyCorner?: string[];
  weather?: string[];
  attackVerbs?: string[];
  mediaVerbs?: string[];
  zoneVerbs?: string[];
  stamps?: {
    breaking?: string[];
    classified?: string[];
  };
};

const MINIMAL_DATA: NewspaperData = {
  mastheads: ['THE PARANOID TIMES'],
  ads: ['Classified ads temporarily unavailable.'],
  subheads: {
    generic: ['Officials refuse to comment.'],
  },
  bylines: ['By: Anonymous Insider'],
  sources: ['Source: Redacted'],
  conspiracyCorner: ['All rumors currently sealed in vault storage.'],
  weather: ['Forecast withheld pending clearance.'],
  attackVerbs: ['EXPOSED'],
  mediaVerbs: ['GOES VIRAL'],
  zoneVerbs: ['SURGE'],
  stamps: {
    breaking: ['BREAKING'],
    classified: ['CLASSIFIED'],
  },
};

let cache: NewspaperData | null = null;

const normalizeArray = (value: unknown, fallback: string[]): string[] => {
  return Array.isArray(value) && value.length > 0 ? value.map(String) : fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecordValue = (record: Record<string, unknown> | null, key: string): unknown =>
  record && key in record ? record[key] : undefined;

const normalizeData = (raw: unknown): NewspaperData => {
  const rootRecord = isRecord(raw) ? (raw as Record<string, unknown>) : null;
  const poolsRecordCandidate = isRecord(getRecordValue(rootRecord, 'pools'))
    ? (getRecordValue(rootRecord, 'pools') as Record<string, unknown>)
    : rootRecord;

  const getPoolValue = (key: string): unknown => {
    const valueFromPools = getRecordValue(poolsRecordCandidate, key);
    if (valueFromPools !== undefined) {
      return valueFromPools;
    }
    return getRecordValue(rootRecord, key);
  };

  const minimalGeneric = MINIMAL_DATA.subheads?.generic ?? [];
  const subheadsRecordRaw = getPoolValue('subheads') ?? getRecordValue(rootRecord, 'subheads');
  const subheadsRecord = isRecord(subheadsRecordRaw)
    ? (subheadsRecordRaw as Record<string, unknown>)
    : null;

  const generic = normalizeArray(getRecordValue(subheadsRecord, 'generic'), minimalGeneric);
  const genericFallback = generic.length > 0 ? generic : minimalGeneric;

  const normalizedSubheads = {
    generic,
    attack: normalizeArray(getRecordValue(subheadsRecord, 'attack'), genericFallback),
    media: normalizeArray(getRecordValue(subheadsRecord, 'media'), genericFallback),
    zone: normalizeArray(getRecordValue(subheadsRecord, 'zone'), genericFallback),
  };

  const stampsRecordRaw = getRecordValue(rootRecord, 'stamps');
  const stampsRecord = isRecord(stampsRecordRaw) ? (stampsRecordRaw as Record<string, unknown>) : null;

  const data: NewspaperData = {
    mastheads: normalizeArray(getPoolValue('mastheads'), MINIMAL_DATA.mastheads),
    ads: normalizeArray(getPoolValue('ads'), MINIMAL_DATA.ads),
    subheads: normalizedSubheads,
    bylines: normalizeArray(getPoolValue('bylines'), MINIMAL_DATA.bylines ?? []),
    sources: normalizeArray(getPoolValue('sources'), MINIMAL_DATA.sources ?? []),
    conspiracyCorner: normalizeArray(
      getRecordValue(rootRecord, 'conspiracyCorner'),
      MINIMAL_DATA.conspiracyCorner ?? [],
    ),
    weather: normalizeArray(getPoolValue('weather'), MINIMAL_DATA.weather ?? []),
    attackVerbs: normalizeArray(getPoolValue('attackVerbs'), MINIMAL_DATA.attackVerbs ?? []),
    mediaVerbs: normalizeArray(getPoolValue('mediaVerbs'), MINIMAL_DATA.mediaVerbs ?? []),
    zoneVerbs: normalizeArray(getPoolValue('zoneVerbs'), MINIMAL_DATA.zoneVerbs ?? []),
    stamps: {
      breaking: normalizeArray(
        getRecordValue(stampsRecord, 'breaking'),
        MINIMAL_DATA.stamps?.breaking ?? [],
      ),
      classified: normalizeArray(
        getRecordValue(stampsRecord, 'classified'),
        MINIMAL_DATA.stamps?.classified ?? [],
      ),
    },
  };

  return data;
};

const CANONICAL_DATA = normalizeData(rawNewspaperDataset as unknown);

export async function loadNewspaperData(): Promise<NewspaperData> {
  if (!cache) {
    cache = CANONICAL_DATA;
  }
  return cache;
}

export function pick<T>(arr: T[] | undefined, fallback?: T): T {
  if (Array.isArray(arr) && arr.length > 0) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error('Unable to pick from an empty array without fallback.');
}

type WeightedEntry<T> = { value: T; weight: number } | [T, number];

export function weightedPick<T>(items: Array<WeightedEntry<T>>, fallback?: T): T {
  const normalized = items
    .map(item => {
      if (Array.isArray(item)) {
        return { value: item[0], weight: item[1] };
      }
      return item;
    })
    .filter(entry => entry.weight > 0);

  if (normalized.length === 0) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error('Unable to perform weighted pick with no positive weights.');
  }

  const total = normalized.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = Math.random() * total;

  for (const entry of normalized) {
    threshold -= entry.weight;
    if (threshold <= 0) {
      return entry.value;
    }
  }

  return normalized[normalized.length - 1].value;
}

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
