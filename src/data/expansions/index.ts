import type { GameCard } from '@/rules/mvp';
import { discoverExpansions, getCachedExpansions } from '@/lib/expansions/discover';

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

const cloneCard = (card: GameCard): GameCard => ({ ...card });

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
  cards: expansion.cards.map(cloneCard),
  cardCount: expansion.cards.length,
  metadata: {
    name: expansion.name,
    description: expansion.description,
    version: expansion.version,
    author: expansion.author,
  },
});

const updateManifest = (packs: ExpansionPack[]) => {
  manifest.splice(0, manifest.length, ...packs);
};

export const getExpansionManifest = (): ExpansionPack[] => [...manifest];

export const refreshExpansionManifest = async (): Promise<ExpansionPack[]> => {
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

  updateManifest(normalized);
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
  const expansions = getCachedExpansions();
  return expansions.flatMap(expansion => expansion.cards.map(card => ({ ...(card as GameCard) })));
};
