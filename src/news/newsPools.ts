import { loadNewspaperData, type NewspaperData } from '@/lib/newspaperData';

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

type SubheadKey = keyof NewsPools['subheads'];

type JsonRecord = Record<string, unknown>;

let cachedPools: NewsPools | null = null;

const ensureArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => String(item));
};

const normaliseSubheads = (subheads: NewspaperData['subheads'] | undefined): NewsPools['subheads'] => {
  const record = (subheads ?? {}) as JsonRecord;

  const getList = (key: SubheadKey) => ensureArray(record[key as string]);

  return {
    generic: getList('generic'),
    attack: getList('attack'),
    media: getList('media'),
    zone: getList('zone'),
  };
};

export const loadNewsPools = async (): Promise<NewsPools> => {
  if (cachedPools) {
    return cachedPools;
  }

  const dataset = await loadNewspaperData();

  const pools: NewsPools = {
    mastheads: ensureArray(dataset.mastheads),
    ads: ensureArray(dataset.ads),
    subheads: normaliseSubheads(dataset.subheads),
    bylines: ensureArray(dataset.bylines),
    sources: ensureArray(dataset.sources),
    attackVerbs: ensureArray(dataset.attackVerbs),
    mediaVerbs: ensureArray(dataset.mediaVerbs),
    zoneVerbs: ensureArray(dataset.zoneVerbs),
    weather: ensureArray(dataset.weather),
  };

  cachedPools = pools;
  return pools;
};

export const getPools = (): NewsPools => {
  if (!cachedPools) {
    throw new Error('News pools have not been loaded yet. Call loadNewsPools() first.');
  }
  return cachedPools;
};

export const getPoolsIfReady = (): NewsPools | null => cachedPools ?? null;

export const areNewsPoolsReady = (): boolean => cachedPools != null;
