import type { GameCard } from '@/rules/mvp';
import { discoverExpansions, getCachedExpansions } from '@/lib/expansions/discover';
import { repairToMVP, validateCardMVP } from '@/mvp/validator';
import { BUILTIN_EXPANSION_SOURCES } from './builtin';

export type ExpansionPack = {
  id: string;
  title: string;
  fileName: string;
  cardCount: number;
  cards: GameCard[];
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
    author?: string;
  };
};

const manifest: ExpansionPack[] = [];
export const EXPANSION_MANIFEST = manifest;

const DEV = typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV;

const normalizeCard = (card: GameCard, tag: string): GameCard => {
  const { card: repaired, errors, changes } = repairToMVP(card);
  const validation = validateCardMVP(repaired);

  if (DEV && (errors.length > 0 || changes.length > 0)) {
    console.info(`[EXPANSION:${tag}] ${card.id} normalized`, { errors, changes });
  }

  if (DEV && !validation.ok) {
    console.warn(`[EXPANSION:${tag}] ${card.id} validation issues`, validation.errors);
  }

  return { ...repaired };
};

const normalizeExpansion = (expansion: {
  id: string;
  name: string;
  fileName: string;
  description?: string;
  version?: string;
  author?: string;
  cards: GameCard[];
}): ExpansionPack => ({
  id: expansion.id,
  title: expansion.name,
  fileName: expansion.fileName,
  cards: expansion.cards.map(card => normalizeCard(card, expansion.id)),
  cardCount: expansion.cards.length,
  metadata: {
    name: expansion.name,
    description: expansion.description,
    version: expansion.version,
    author: expansion.author,
  },
});

const getBuiltinManifest = (): ExpansionPack[] =>
  BUILTIN_EXPANSION_SOURCES.map(source =>
    normalizeExpansion({
      id: source.id,
      name: source.name,
      fileName: source.fileName,
      description: source.description,
      version: source.version,
      author: source.author,
      cards: source.cards,
    }),
  );

const updateManifest = (packs: ExpansionPack[]) => {
  manifest.splice(0, manifest.length, ...packs);
};

export const getExpansionManifest = (): ExpansionPack[] => [...manifest];

const mergeManifests = (builtin: ExpansionPack[], discovered: ExpansionPack[]): ExpansionPack[] => {
  const merged = new Map<string, ExpansionPack>();
  for (const pack of builtin) {
    merged.set(pack.id, pack);
  }
  for (const pack of discovered) {
    if (!merged.has(pack.id)) {
      merged.set(pack.id, pack);
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.title.localeCompare(b.title));
};

export const refreshExpansionManifest = async (): Promise<ExpansionPack[]> => {
  const builtin = getBuiltinManifest();
  const expansions = await discoverExpansions();
  const normalized = expansions.map(expansion =>
    normalizeExpansion({
      id: expansion.id,
      name: expansion.name,
      fileName: expansion.fileName,
      description: expansion.description,
      version: expansion.version,
      author: expansion.author,
      cards: expansion.cards as GameCard[],
    }),
  );

  const merged = mergeManifests(builtin, normalized);
  updateManifest(merged);
  return manifest;
};

export async function ensureExpansionManifest(): Promise<ExpansionPack[]> {
  if (manifest.length > 0) {
    return manifest;
  }
  return refreshExpansionManifest();
}

export async function loadEnabledExpansions(enabledIds: string[]): Promise<GameCard[]> {
  if (!manifest.length) {
    await ensureExpansionManifest();
  }

  if (!enabledIds.length) {
    return [];
  }

  const enabledSet = new Set(enabledIds);
  const cards: GameCard[] = [];
  const seen = new Set<string>();

  for (const pack of manifest) {
    if (!enabledSet.has(pack.id)) {
      continue;
    }
    for (const card of pack.cards) {
      if (!card.id || seen.has(card.id)) {
        continue;
      }
      seen.add(card.id);
      cards.push({ ...card });
    }
  }

  return cards;
}

export const getCachedExpansionCards = (): GameCard[] => {
  const builtin = getBuiltinManifest();
  const expansions = getCachedExpansions();
  const builtinCards = builtin.flatMap(expansion => expansion.cards.map(card => ({ ...card })));
  if (!expansions.length) {
    return builtinCards;
  }

  const builtinIds = new Set(builtin.map(pack => pack.id));
  const discoveredCards = expansions
    .filter(expansion => !builtinIds.has(expansion.id))
    .flatMap(expansion => expansion.cards.map(card => ({ ...(card as GameCard) })));
  return [...builtinCards, ...discoveredCards];
};
