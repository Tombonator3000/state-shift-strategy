import type { Card } from '@/lib/decks/expansions';
import type { GameCard } from '@/rules/mvp';
import { validateMvpCard } from '@/utils/validate-mvp';

const INDEX_PATH = '/extensions/index.json';
const MANIFEST_PATH = '/extensions/manifest.json';
const CACHE_BYPASS_PARAM = () => `t=${Date.now()}`;

const FALLBACK_FILES = ['cryptids.json', 'halloween_spooktacular_with_temp_image.json'];

interface RawExpansion {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  version?: string;
  author?: string;
  cards?: unknown;
  [key: string]: unknown;
}

export interface DiscoveredExpansion {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  fileName: string;
  cards: Card[];
}

let cachedExpansions: DiscoveredExpansion[] | null = null;
let inflight: Promise<DiscoveredExpansion[]> | null = null;

const cloneCard = (card: Card): Card => ({ ...card });

const cloneExpansion = (expansion: DiscoveredExpansion): DiscoveredExpansion => ({
  ...expansion,
  cards: expansion.cards.map(cloneCard),
});

const formatNameFromId = (id: string): string =>
  id
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const sanitizeId = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

const toCardArray = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as RawExpansion).cards)) {
    return (raw as RawExpansion).cards as unknown[];
  }
  return [];
};

const decorateCard = (card: GameCard, setId: string, setName: string): Card => ({
  ...(card as Card),
  extId: (card as Card).extId ?? setId,
  _setId: (card as Card)._setId ?? setId,
  _setName: (card as Card)._setName ?? setName,
});

const readJsonList = async (url: string): Promise<string[]> => {
  try {
    const response = await fetch(`${url}?${CACHE_BYPASS_PARAM()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.filter((item): item is string => typeof item === 'string');
    }
    if (data && typeof data === 'object' && Array.isArray((data as { files?: unknown }).files)) {
      return ((data as { files?: unknown }).files as unknown[])
        .filter((item): item is string => typeof item === 'string');
    }
    return [];
  } catch (error) {
    console.warn('[ExpansionDiscovery] Failed to fetch list from', url, error);
    return [];
  }
};

const loadFileList = async (): Promise<string[]> => {
  const fromIndex = await readJsonList(INDEX_PATH);
  if (fromIndex.length > 0) {
    return fromIndex;
  }

  const fromManifest = await readJsonList(MANIFEST_PATH);
  if (fromManifest.length > 0) {
    return fromManifest;
  }

  return [...FALLBACK_FILES];
};

const parseExpansionFile = async (fileName: string): Promise<DiscoveredExpansion | null> => {
  try {
    const response = await fetch(`/extensions/${fileName}?${CACHE_BYPASS_PARAM()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      console.warn(`[ExpansionDiscovery] Skipping ${fileName}, response: ${response.status}`);
      return null;
    }

    const raw = (await response.json()) as RawExpansion | RawExpansion['cards'];
    const cardSources = toCardArray(raw);

    const baseName = fileName.replace(/\.json$/i, '');
    const setId = sanitizeId((raw as RawExpansion)?.id, baseName);
    const nameCandidate =
      (raw as RawExpansion)?.name ||
      (raw as RawExpansion)?.title ||
      formatNameFromId(setId);

    const cards: Card[] = [];
    const seen = new Set<string>();

    for (const entry of cardSources) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }

      const card = { ...(entry as GameCard) };
      const validation = validateMvpCard(card);
      if (!validation.ok) {
        console.warn(`[ExpansionDiscovery] Invalid card in ${fileName}:`, validation.issues);
        continue;
      }

      if (!card.id || seen.has(card.id)) {
        continue;
      }

      seen.add(card.id);
      cards.push(decorateCard(card, setId, nameCandidate));
    }

    if (cards.length === 0) {
      console.warn(`[ExpansionDiscovery] No valid cards found in ${fileName}`);
      return null;
    }

    const metadata = raw as RawExpansion;

    return {
      id: setId,
      name: nameCandidate,
      description: typeof metadata?.description === 'string' ? metadata.description : undefined,
      version: typeof metadata?.version === 'string' ? metadata.version : undefined,
      author: typeof metadata?.author === 'string' ? metadata.author : undefined,
      fileName,
      cards,
    };
  } catch (error) {
    console.warn(`[ExpansionDiscovery] Failed to parse ${fileName}:`, error);
    return null;
  }
};

const discoverInternal = async (): Promise<DiscoveredExpansion[]> => {
  const files = await loadFileList();
  const uniqueFiles = Array.from(
    new Set(
      files
        .filter(name => name.toLowerCase().endsWith('.json'))
        .filter(name => name !== 'manifest.json' && name !== 'index.json'),
    ),
  );

  const discovered: DiscoveredExpansion[] = [];
  for (const fileName of uniqueFiles) {
    const expansion = await parseExpansionFile(fileName);
    if (expansion) {
      discovered.push(expansion);
    }
  }

  discovered.sort((a, b) => a.name.localeCompare(b.name));
  return discovered;
};

export async function discoverExpansions(force = false): Promise<DiscoveredExpansion[]> {
  if (cachedExpansions && !force) {
    return cachedExpansions.map(cloneExpansion);
  }

  if (inflight && !force) {
    return inflight.then(expansions => expansions.map(cloneExpansion));
  }

  inflight = discoverInternal().then(expansions => {
    cachedExpansions = expansions;
    inflight = null;
    return expansions;
  });

  try {
    const result = await inflight;
    return result.map(cloneExpansion);
  } finally {
    inflight = null;
  }
}

export function getCachedExpansions(): DiscoveredExpansion[] {
  if (!cachedExpansions) {
    return [];
  }
  return cachedExpansions.map(cloneExpansion);
}
