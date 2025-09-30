import { getCardExtensionInfo } from '@/data/extensionIntegration';
import type { AssetProvider, AssetProviderResult } from '../types';

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

export const OfficialStore: AssetProvider = {
  id: 'official',
  priority: 0,
  shouldSkip: context => context.scope !== 'card' || !context.card,
  async fetchAssets(_query, context): Promise<AssetProviderResult> {
    const card = context.card;
    if (!card) {
      return { candidates: [] };
    }

    const extension = inferExtension(card.id);
    const isTemp = Boolean(extension) && card.artPolicy !== 'manual';

    if (!card.artId && !isTemp) {
      return { candidates: [] };
    }

    const idToUse = card.artId ?? card.id;

    return {
      candidates: [
        {
          id: `official-${idToUse}`,
          url: buildOfficialUrl(idToUse, 'jpg'),
          provider: 'official',
          credit: card.artAttribution,
          tags: card.artTags,
          locked: card.artPolicy === 'manual',
          metadata: { extensionFallback: buildOfficialUrl(idToUse, 'png') },
        },
      ],
    };
  },
};
