import { getCardExtensionInfo, isExtensionCard } from '@/data/extensionIntegration';
import type { AssetProvider } from '../types';

function getPackFallback(cardId: string): string | null {
  if (isExtensionCard(cardId)) {
    const extensionInfo = getCardExtensionInfo(cardId);
    if (extensionInfo?.id?.toLowerCase().includes('cryptids')) {
      return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
    }
    if (extensionInfo?.id?.toLowerCase().includes('halloween_spooktacular')) {
      return '/card-art/halloween_spooktacular-Temp-Image.png';
    }
  }

  const lower = cardId.toLowerCase();
  if (lower.startsWith('hallo-')) {
    return '/card-art/halloween_spooktacular-Temp-Image.png';
  }
  if (
    lower.includes('bigfoot') ||
    lower.includes('mothman') ||
    lower.includes('chupacabra') ||
    lower.includes('cryptid') ||
    lower.includes('men_in_black') ||
    lower.includes('area_51') ||
    lower.includes('roswell')
  ) {
    return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
  }

  return null;
}

export const PackStore: AssetProvider = {
  id: 'pack',
  priority: 1,
  shouldSkip: context => context.scope !== 'card' || !context.card,
  async fetchAssets(_query, context) {
    const card = context.card;
    if (!card) {
      return { candidates: [] };
    }

    const fallback = getPackFallback(card.id);
    if (!fallback) {
      return { candidates: [] };
    }

    return {
      candidates: [
        {
          id: `pack-${card.id}`,
          url: fallback,
          provider: 'pack',
          credit: card.artAttribution,
          tags: card.artTags,
          locked: true,
        },
      ],
    };
  },
};
