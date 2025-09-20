import { Badge } from '@/components/ui/badge';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';
import type { GameCard } from '@/rules/mvp';

interface ExtensionCardBadgeProps {
  cardId: string;
  card?: GameCard;
  variant?: 'inline' | 'overlay';
}

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
  if (!isExtensionCard(cardId)) {
    return null;
  }

  const extensionInfo = getCardExtensionInfo(cardId);
  const faction = getCardFaction(card);

  const extensionId = extensionInfo?.id?.toLowerCase();
  const isCryptidsExtension = extensionId?.includes('cryptid');
  const isHalloweenExtension = extensionId?.includes('halloween');

  // Base faction styling + fallback labels
  const factionLabel = faction === 'truth' ? 'Truth Ext' : 'Gov Ext';
  const factionSymbol = faction === 'truth' ? '👁️' : '🦎';

  // Extension specific overrides
  const symbol = isCryptidsExtension
    ? '🦎'
    : isHalloweenExtension
      ? '🎃'
      : factionSymbol;

  const badgeText = isCryptidsExtension
    ? 'CRYPTIDS'
    : isHalloweenExtension
      ? 'HALLOWEEN'
      : factionLabel.split(' ')[0].toUpperCase();

  const badgeTitle = extensionInfo
    ? `${extensionInfo.name} Extension v${extensionInfo.version}`
    : `${factionLabel} Card`;
  
  if (variant === 'overlay') {
    return (
      <div className="absolute top-1 right-1 z-10">
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
