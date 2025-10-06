export interface NewsPools {
  mastheads: string[];
  ads: string[];
  subheads: {
    generic: string[];
    attack: string[];
    media: string[];
    zone: string[];
  };
  bylines: string[];
  sources: string[];
  attackVerbs: string[];
  mediaVerbs: string[];
  zoneVerbs: string[];
  weather: string[];
}

type JsonRecord = Record<string, unknown>;

type SubheadKey = keyof NewsPools['subheads'];

type NonSubheadKey = Exclude<keyof NewsPools, 'subheads'>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Expected "${label}" to be an array in newspaperData.json`);
  }
  return value.map(item => String(item));
};

const REQUIRED_TOP_LEVEL_KEYS: NonSubheadKey[] = [
  'mastheads',
  'ads',
  'bylines',
  'sources',
  'attackVerbs',
  'mediaVerbs',
  'zoneVerbs',
  'weather',
];

let cachedPools: NewsPools | null = null;
let loadingPromise: Promise<NewsPools> | null = null;

const extractPools = (raw: unknown): JsonRecord => {
  if (!isRecord(raw)) {
    throw new Error('Invalid newspaper data: expected an object at the root level.');
  }

  const candidate: unknown = 'pools' in raw ? (raw as { pools?: unknown }).pools : raw;

  if (!isRecord(candidate)) {
    throw new Error('Invalid newspaper data: expected a "pools" object.');
  }

  return candidate;
};

const parseSubheads = (value: unknown): NewsPools['subheads'] => {
  if (!isRecord(value)) {
    throw new Error('Invalid newspaper data: expected "subheads" to be an object.');
  }

  const record = value as JsonRecord;

  const requireSubArray = (key: SubheadKey) =>
    toStringArray(record[key as string], `subheads.${key}`);

  return {
    generic: requireSubArray('generic'),
    attack: requireSubArray('attack'),
    media: requireSubArray('media'),
    zone: requireSubArray('zone'),
  };
};

const parsePools = (record: JsonRecord): NewsPools => {
  const result: Partial<NewsPools> = {};

  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (!(key in record)) {
      throw new Error(`Invalid newspaper data: missing "${key}" pool.`);
    }
    const rawValue = record[key as string];
    result[key] = toStringArray(rawValue, key) as NewsPools[typeof key];
  }

  if (!('subheads' in record)) {
    throw new Error('Invalid newspaper data: missing "subheads" pool.');
  }

  result.subheads = parseSubheads(record['subheads']);

  return result as NewsPools;
};

export const loadNewsPools = async (): Promise<NewsPools> => {
  if (cachedPools) {
    return cachedPools;
  }

  if (!loadingPromise) {
    loadingPromise = fetch('./newspaperData.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load newspaper pools: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(raw => {
        const poolsRecord = extractPools(raw);
        const pools = parsePools(poolsRecord);
        cachedPools = pools;
        return pools;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }

  return loadingPromise;
};

export const getPools = (): NewsPools => {
  if (!cachedPools) {
    throw new Error('News pools have not been loaded yet. Call loadNewsPools() first.');
  }
  return cachedPools;
};

export const getPoolsIfReady = (): NewsPools | null => cachedPools ?? null;

export const areNewsPoolsReady = (): boolean => cachedPools != null;
