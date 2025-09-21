import { Badge } from '@/components/ui/badge';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';
import { getExpansionManifest, EXPANSION_MANIFEST } from '@/data/expansions';
import type { GameCard } from '@/rules/mvp';

interface ExtensionCardBadgeProps {
  cardId: string;
  card?: GameCard;
  variant?: 'inline' | 'overlay';
}

type ExtendedGameCard = GameCard & {
  _setId?: string;
  _setName?: string;
};

type BadgeExtensionInfo = {
  id: string;
  name: string;
  version?: string;
};

// Determine faction from card properties
const getCardFaction = (card?: GameCard): 'government' | 'truth' => {
  if (!card) return 'government';
  
  if (card.faction) {
    return card.faction.toLowerCase() === 'truth' ? 'truth' : 'government';
  }
  
  // Fallback: determine from text/name
  const cardText = (card.text || '').toLowerCase();
  const cardName = (card.name || '').toLowerCase();
  
  const truthKeywords = ['truth', 'expose', 'reveal', 'witness', 'evidence', 'conspiracy', 'bigfoot', 'alien', 'ufo', 'cryptid', 'ghost', 'elvis'];
  const hasTruthKeywords = truthKeywords.some(keyword => cardText.includes(keyword) || cardName.includes(keyword));
  
  return hasTruthKeywords ? 'truth' : 'government';
};

export const ExtensionCardBadge = ({ cardId, card, variant = 'inline' }: ExtensionCardBadgeProps) => {
  const extendedCard = card as ExtendedGameCard | undefined;
  const hasExpansionMeta = Boolean(extendedCard?.extId || extendedCard?._setId);

  if (!isExtensionCard(cardId) && !hasExpansionMeta) {
    return null;
  }

  const extensionInfo = getCardExtensionInfo(cardId);
  const manifest = getExpansionManifest();
  const expansions = manifest.length ? manifest : EXPANSION_MANIFEST;

  const lookupExpansionInfo = (): BadgeExtensionInfo | null => {
    if (!expansions.length) {
      return null;
    }

    const candidateIds = [extendedCard?.extId, extendedCard?._setId]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(value => value.toLowerCase());

    const candidateNames = [extendedCard?._setName]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(value => value.toLowerCase());

    const matchExpansionById = () =>
      expansions.find(pack => {
        const packId = pack.id?.toLowerCase();
        const packTitle = pack.title?.toLowerCase();
        return candidateIds.some(id => id === packId || id === packTitle);
      });

    const matchExpansionByName = () =>
      expansions.find(pack => {
        const metadataName = pack.metadata?.name?.toLowerCase();
        const packTitle = pack.title?.toLowerCase();
        return candidateNames.some(name => name === metadataName || name === packTitle);
      });

    const matchExpansionByCardId = () =>
      expansions.find(pack => pack.cards?.some(expansionCard => expansionCard.id === cardId));

    const expansion = matchExpansionById() ?? matchExpansionByName() ?? matchExpansionByCardId();

    if (!expansion) {
      return null;
    }

    const displayName = expansion.metadata?.name || expansion.title || expansion.id;
    return {
      id: expansion.id,
      name: displayName,
      version: expansion.metadata?.version,
    };
  };

  const expansionInfo = extensionInfo ?? lookupExpansionInfo();
  const faction = getCardFaction(card);

  const normalizedSetId =
    extendedCard?.extId?.toLowerCase() || extendedCard?._setId?.toLowerCase() || expansionInfo?.id?.toLowerCase();
  const normalizedName = expansionInfo?.name?.toLowerCase();
  const isCryptidsExtension = Boolean(
    normalizedSetId?.includes('cryptid') || normalizedName?.includes('cryptid'),
  );
  const isHalloweenExtension = Boolean(
    normalizedSetId?.includes('halloween') || normalizedName?.includes('halloween') || normalizedName?.includes('spook'),
  );

  // Base faction styling + fallback labels
  const factionLabel = faction === 'truth' ? 'Truth Ext' : 'Gov Ext';
  const factionSymbol = faction === 'truth' ? '👁️' : '🦎';

  const badgeLabel = expansionInfo?.name || extendedCard?._setName || extendedCard?.extId || extendedCard?._setId || factionLabel;

  // Extension specific overrides
  const symbol = isCryptidsExtension
    ? '🦎'
    : isHalloweenExtension
      ? '🎃'
      : factionSymbol;

  const badgeText = badgeLabel.toUpperCase();

  const badgeTitle = expansionInfo
    ? `${expansionInfo.name} Expansion${expansionInfo.version ? ` v${expansionInfo.version}` : ''}`
    : `${badgeLabel} Card`;

  if (variant === 'overlay') {
    const scaledInset = 'calc(0.25rem * var(--card-scale, 1))';

    return (
      <div className="absolute z-10" style={{ top: scaledInset, right: scaledInset }}>
        <Badge className={`${faction === 'truth' ? 'bg-truth-blue/90 border-truth-blue' : 'bg-government-blue/90 border-government-blue'} text-white text-xs px-1 py-0.5 animate-fade-in`}>
          {symbol}
        </Badge>
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${faction === 'truth' ? 'bg-truth-blue/20 border-truth-blue text-truth-blue' : 'bg-government-blue/20 border-government-blue text-government-blue'} px-1.5 py-0.5`}
      title={badgeTitle}
    >
      {symbol} {badgeText}
    </Badge>
  );
};
