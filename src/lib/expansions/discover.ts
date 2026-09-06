import type { Card } from '@/lib/decks/expansions';
import type { GameCard } from '@/rules/mvp';
import { readExpansionCard } from './cardValidation';
import { BUILTIN_EXPANSION_SOURCES } from '@/data/expansions/builtin';
import { fetchAssetJson } from '@/lib/fetchAssetJson';

const INDEX_PATH = '/extensions/index.json';
const MANIFEST_PATH = '/extensions/manifest.json';

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
  rejectedCardCount?: number;
  unavailableReason?: string;
}

let cachedExpansions: DiscoveredExpansion[] | null = null;
let inflight: Promise<DiscoveredExpansion[]> | null = null;

const cloneCard = (card: Card): Card => ({ ...card });

const cloneExpansion = (expansion: DiscoveredExpansion): DiscoveredExpansion => ({
  ...expansion,
  cards: expansion.cards.map(cloneCard),
});

const builtinToDiscovered = (): DiscoveredExpansion[] =>
  BUILTIN_EXPANSION_SOURCES.map(source => ({
    id: source.id,
    name: source.name,
    description: source.description,
    version: source.version,
    author: source.author,
    fileName: source.fileName,
    cards: source.cards.map(card => ({ ...(card as Card) })),
  }));

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
    const data = await fetchAssetJson(url);
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
    const raw = await fetchAssetJson(`/extensions/${fileName}`);
    const cardSources = toCardArray(raw);

    const baseName = fileName.replace(/\.json$/i, '');
    const setId = sanitizeId((raw as RawExpansion)?.id, baseName);
    const nameCandidate =
      (raw as RawExpansion)?.name ||
      (raw as RawExpansion)?.title ||
      formatNameFromId(setId);

    const cards: Card[] = [];
    const seen = new Set<string>();
    let rejectedCardCount = 0;
    let unsupportedCards = 0;

    for (const entry of cardSources) {
      const result = readExpansionCard(entry);
      const card = result.card;
      if (!card) {
        rejectedCardCount++;
        if (result.unsupported) unsupportedCards++;
        continue;
      }

      if (!card.id || seen.has(card.id)) {
        continue;
      }

      seen.add(card.id);
      cards.push(decorateCard(card, setId, nameCandidate));
    }

    const unavailableReason = cards.length === 0
      ? unsupportedCards > 0
        ? `${rejectedCardCount} cards need effects that this game version does not support yet.`
        : 'No playable cards found. This pack needs updated card definitions.'
      : undefined;

    const metadata = raw as RawExpansion;

    return {
      id: setId,
      name: nameCandidate,
      description: typeof metadata?.description === 'string' ? metadata.description : undefined,
      version: typeof metadata?.version === 'string' ? metadata.version : undefined,
      author: typeof metadata?.author === 'string' ? metadata.author : undefined,
      fileName,
      cards,
      rejectedCardCount,
      unavailableReason,
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

  const loaded = await Promise.all(uniqueFiles.map(parseExpansionFile));
  const discovered = loaded.filter((pack): pack is DiscoveredExpansion => pack !== null);

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
    const builtin = builtinToDiscovered();
    const byId = new Map<string, DiscoveredExpansion>();
    for (const pack of builtin) {
      byId.set(pack.id, pack);
    }
    for (const pack of expansions) {
      if (!byId.has(pack.id)) {
        byId.set(pack.id, pack);
      }
    }
    const merged = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
    cachedExpansions = merged;
    inflight = null;
    return merged;
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
