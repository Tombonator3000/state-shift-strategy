import { getCardExtensionInfo } from '@/data/extensionIntegration';
import type { GameCard } from '@/rules/mvp';
import type { AssetProvider, AssetProviderResult } from '../types';

const OFFICIAL_SOURCE_ID = 'official';

function inferExtension(cardId: string): string | null {
  const info = getCardExtensionInfo(cardId);
  if (info) {
    return info.id;
  }
  if (cardId.toLowerCase().startsWith('hallo-')) {
    return 'halloween_spooktacular';
  }
  return null;
}

function buildOfficialUrl(cardId: string, preferredExtension: 'jpg' | 'png'): string {
  return `/card-art/${cardId}.${preferredExtension}`;
}

function isTemporaryArtId(card: GameCard, extension: string | null): boolean {
  if (!card.artId) {
    return false;
  }

  if (extension && card.artId === `${extension}-Temp-Image`) {
    return true;
  }

  return /temp/i.test(card.artId);
}

function buildCandidate(card: GameCard, artId: string) {
  return {
    id: `${OFFICIAL_SOURCE_ID}-${artId}`,
    url: buildOfficialUrl(artId, 'jpg'),
    provider: OFFICIAL_SOURCE_ID,
    credit: card.artAttribution,
    tags: card.artTags,
    locked: card.artPolicy === 'manual',
    metadata: { extensionFallback: buildOfficialUrl(artId, 'png') },
  };
}

type OfficialLookupResult = {
  url: string;
  provider: string;
  credit?: string;
  license?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

type OfficialProvider = AssetProvider & {
  lookup(card: GameCard): Promise<OfficialLookupResult | null>;
};

export const OfficialStore: OfficialProvider = {
  id: OFFICIAL_SOURCE_ID,
  priority: 0,
  shouldSkip: context => context.scope !== 'card' || !context.card,
  async fetchAssets(_query, context): Promise<AssetProviderResult> {
    const card = context.card;
    if (!card) {
      return { candidates: [] };
    }

    const extension = inferExtension(card.id);
    const hasTemporaryArtId = isTemporaryArtId(card, extension);

    if (!card.artId && !hasTemporaryArtId) {
      return { candidates: [] };
    }

    const idToUse = card.artId && !hasTemporaryArtId ? card.artId : card.id;

    return {
      candidates: [
        buildCandidate(card, idToUse),
      ],
    };
  },
  async lookup(card) {
    const extension = inferExtension(card.id);
    if (!card.artId || isTemporaryArtId(card, extension)) {
      return null;
    }

    const candidate = buildCandidate(card, card.artId);
    return {
      url: candidate.url,
      provider: candidate.provider,
      credit: candidate.credit,
      license: undefined,
      tags: candidate.tags,
      metadata: candidate.metadata,
    } satisfies OfficialLookupResult;
  },
};
