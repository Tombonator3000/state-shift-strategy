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
let loadingPromise: Promise<NewspaperData> | null = null;

const normalizeArray = (value: unknown, fallback: string[]): string[] => {
  return Array.isArray(value) && value.length > 0 ? value.map(String) : fallback;
};

const normalizeData = (raw: Partial<NewspaperData> | undefined | null): NewspaperData => {
  const mastheads = normalizeArray(raw?.mastheads, MINIMAL_DATA.mastheads);
  const ads = normalizeArray(raw?.ads, MINIMAL_DATA.ads);
  const subheads = raw?.subheads ?? {};
  const normalizedSubheads = {
    generic: normalizeArray(subheads?.generic, MINIMAL_DATA.subheads?.generic ?? []),
    attack: normalizeArray(subheads?.attack, subheads?.generic ?? MINIMAL_DATA.subheads?.generic ?? []),
    media: normalizeArray(subheads?.media, subheads?.generic ?? MINIMAL_DATA.subheads?.generic ?? []),
    zone: normalizeArray(subheads?.zone, subheads?.generic ?? MINIMAL_DATA.subheads?.generic ?? []),
  };

  const data: NewspaperData = {
    mastheads,
    ads,
    subheads: normalizedSubheads,
    bylines: normalizeArray(raw?.bylines, MINIMAL_DATA.bylines ?? []),
    sources: normalizeArray(raw?.sources, MINIMAL_DATA.sources ?? []),
    conspiracyCorner: normalizeArray(raw?.conspiracyCorner, MINIMAL_DATA.conspiracyCorner ?? []),
    weather: normalizeArray(raw?.weather, MINIMAL_DATA.weather ?? []),
    attackVerbs: normalizeArray(raw?.attackVerbs, MINIMAL_DATA.attackVerbs ?? []),
    mediaVerbs: normalizeArray(raw?.mediaVerbs, MINIMAL_DATA.mediaVerbs ?? []),
    zoneVerbs: normalizeArray(raw?.zoneVerbs, MINIMAL_DATA.zoneVerbs ?? []),
    stamps: {
      breaking: normalizeArray(raw?.stamps?.breaking, MINIMAL_DATA.stamps?.breaking ?? []),
      classified: normalizeArray(raw?.stamps?.classified, MINIMAL_DATA.stamps?.classified ?? []),
    },
  };

  return data;
};

export async function loadNewspaperData(): Promise<NewspaperData> {
  if (cache) {
    return cache;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const response = await fetch('/data/newspaperData.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load newspaper data: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      cache = normalizeData(json);
    } catch (error) {
      console.warn('Falling back to minimal newspaper data set', error);
      cache = MINIMAL_DATA;
    } finally {
      loadingPromise = null;
    }

    return cache;
  })();

  return loadingPromise;
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
