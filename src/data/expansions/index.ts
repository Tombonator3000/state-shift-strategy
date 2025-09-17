import type { GameCard } from '@/rules/mvp';
import { validateMvpCard } from '@/utils/validate-mvp';

type RawExpansion = {
  cards?: unknown;
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  [key: string]: unknown;
};

export type ExpansionPack = {
  id: string;
  title: string;
  fileName: string;
  cardCount: number;
  cards: GameCard[];
  metadata?: Pick<RawExpansion, 'name' | 'description' | 'version' | 'author'>;
};

const formatTitleFromFile = (baseName: string): string => {
  if (!baseName) return 'Unnamed Expansion';
  return baseName
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
    .trim();
};

const expansionModules = import.meta.glob('../../../public/extensions/*.json', {
  eager: true,
}) as Record<string, unknown>;

const extractMetadata = (raw: unknown): ExpansionPack['metadata'] => {
  if (!raw || typeof raw !== 'object') return undefined;
  const source = raw as RawExpansion;
  const metadata = {
    name: typeof source.name === 'string' ? source.name : undefined,
    description: typeof source.description === 'string' ? source.description : undefined,
    version: typeof source.version === 'string' ? source.version : undefined,
    author: typeof source.author === 'string' ? source.author : undefined,
  };
  if (!metadata.name && !metadata.description && !metadata.version && !metadata.author) {
    return undefined;
  }
  return metadata;
};

const buildManifest = (): ExpansionPack[] => {
  const entries = Object.entries(expansionModules).sort(([a], [b]) => a.localeCompare(b));
  const manifest: ExpansionPack[] = [];

  for (const [path, mod] of entries) {
    const fileName = path.split('/').pop() ?? 'expansion.json';
    const id = fileName.replace(/\.json$/i, '');
    const title = formatTitleFromFile(id);
    const raw = (mod as any)?.default ?? mod;

    let cardSources: unknown = undefined;
    if (Array.isArray(raw)) {
      cardSources = raw;
    } else if (raw && typeof raw === 'object' && Array.isArray((raw as RawExpansion).cards)) {
      cardSources = (raw as RawExpansion).cards;
    }

    if (!Array.isArray(cardSources)) {
      console.warn('[EXPANSIONS] No cards found for expansion file', fileName);
      manifest.push({
        id,
        title,
        fileName,
        cardCount: 0,
        cards: [],
        metadata: extractMetadata(raw),
      });
      continue;
    }

    const cards: GameCard[] = [];
    const seen = new Set<string>();

    for (const source of cardSources) {
      if (!source || typeof source !== 'object') continue;
      const validation = validateMvpCard(source);
      if (!validation.ok) {
        console.warn('[EXPANSION INVALID]', id, validation.issues);
        continue;
      }

      const card = { ...(source as GameCard), extId: id };
      if (!card.id || seen.has(card.id)) {
        continue;
      }
      seen.add(card.id);
      cards.push(card);
    }

    manifest.push({
      id,
      title,
      fileName,
      cards,
      cardCount: cards.length,
      metadata: extractMetadata(raw),
    });
  }

  if (manifest.length === 0) {
    console.info('[EXPANSIONS] No expansion files found.');
  }

  return manifest;
};

export const EXPANSION_MANIFEST: ExpansionPack[] = buildManifest();

export async function loadEnabledExpansions(enabledIds: string[]): Promise<GameCard[]> {
  if (!enabledIds.length) {
    console.info('[EXPANSIONS]', { enabled: enabledIds, total: 0 });
    return [];
  }

  const cards: GameCard[] = [];
  const seen = new Set<string>();

  for (const pack of EXPANSION_MANIFEST) {
    if (!enabledIds.includes(pack.id)) continue;

    for (const card of pack.cards) {
      if (!card.id || seen.has(card.id)) continue;
      seen.add(card.id);
      cards.push({ ...card });
    }
  }

  console.info('[EXPANSIONS]', { enabled: enabledIds, total: cards.length });
  return cards;
}
