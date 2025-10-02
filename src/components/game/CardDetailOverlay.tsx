import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Target, Zap, Megaphone } from 'lucide-react';
import type { GameCard } from '@/rules/mvp';
import { MVP_CARD_TYPES, type MVPCardType } from '@/rules/mvp';
import CardImage from '@/components/game/CardImage';
import { ExtensionCardBadge } from '@/components/game/ExtensionCardBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { CardTextGenerator } from '@/systems/CardTextGenerator';
import BaseCard from '@/components/game/cards/BaseCard';
import { useUiTheme } from '@/hooks/useTheme';
import { getFlavorText, normalizeCardType as normalizeTabloidCardType } from '@/lib/cardUi';
import { cn } from '@/lib/utils';

interface CardDetailOverlayProps {
  card: GameCard | null;
  canAfford: boolean;
  disabled: boolean;
  onClose: () => void;
  onPlayCard: () => void;
  swipeHandlers?: any;
}

const TabloidCardDetail: React.FC<CardDetailOverlayProps> = ({
  card,
  canAfford,
  disabled,
  onClose,
  onPlayCard,
  swipeHandlers,
}) => {
  const isMobile = useIsMobile();
  if (!card) return null;

  const displayType = normalizeTabloidCardType(card.type);
  const ActionIcon = displayType === 'ZONE' ? Target : displayType === 'ATTACK' ? Zap : Megaphone;

  return (
    <div
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      {...(isMobile ? swipeHandlers : {})}
    >
      <div
        className="relative flex w-full max-w-[480px] flex-col items-center gap-4 sm:gap-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            aria-label="Close card details"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="modal-wrapper">
          <div className="modal-card" data-card-id={card.id}>
            <BaseCard card={card} polaroidHover={false} />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2 sm:gap-3">
          <Button
            onClick={onPlayCard}
            disabled={disabled || !canAfford}
            className={cn(
              'w-full sm:w-auto px-6 py-3 rounded-tabloid shadow-tabloid uppercase tracking-[0.35em] text-sm flex items-center gap-2 transition-transform duration-200',
              disabled || !canAfford
                ? 'bg-black/50 text-white/50 cursor-not-allowed'
                : 'bg-[color:var(--pt-ink)] text-white hover:bg-black hover:-translate-y-0.5'
            )}
          >
            <ActionIcon className="w-4 h-4" />
            {displayType === 'ZONE' ? 'SELECT & TARGET' : 'DEPLOY ASSET'}
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-widest text-white/80">
            <span>
              {canAfford ? 'CLEARED FOR DEPLOYMENT' : `NEED ${card.cost} IP`}
            </span>
            <ExtensionCardBadge cardId={card.id} card={card} />
          </div>
        </div>
      </div>
    </div>
  );
};

const LegacyCardDetail: React.FC<CardDetailOverlayProps> = ({
  card,
  canAfford,
  disabled,
  onClose,
  onPlayCard,
  swipeHandlers,
}) => {
  const isMobile = useIsMobile();
  if (!card) return null;

  const getLegacyFaction = (currentCard: GameCard): 'government' | 'truth' => {
    const cardFaction = currentCard.faction?.toLowerCase();
    if (cardFaction === 'truth' || cardFaction === 'government') {
      return cardFaction;
    }

    if (
      currentCard.name.toLowerCase().includes('surveillance') ||
      currentCard.name.toLowerCase().includes('classified') ||
      (currentCard.text && currentCard.text.toLowerCase().includes('classified'))
    ) {
      return 'government';
    }

    return 'truth';
  };

  const getLegacyRarityFrameClass = (rarity?: string) => {
    const rarityLevel = rarity?.toLowerCase() || 'common';
    const prefix = isMobile ? 'rarity-frame' : 'rarity-frame-maximized';
    return `${prefix}-${rarityLevel}`;
  };

  const getLegacyRarityGlowClass = (rarity?: string) => {
    const rarityLevel = rarity?.toLowerCase() || 'common';
    return `rarity-glow-${rarityLevel}`;
  };

  const normalizeLegacyCardType = (type: string): MVPCardType => {
    return MVP_CARD_TYPES.includes(type as MVPCardType) ? (type as MVPCardType) : 'MEDIA';
  };

  const getLegacyTypeColor = (type: MVPCardType, faction: 'government' | 'truth') => {
    switch (type) {
      case 'MEDIA':
        return faction === 'truth'
          ? 'bg-truth-red/20 border-truth-red text-truth-red'
          : 'bg-government-blue/20 border-government-blue text-government-blue';
      case 'ZONE':
        return 'bg-accent/20 border-accent text-accent-foreground';
      case 'ATTACK':
      default:
        return 'bg-destructive/20 border-destructive text-destructive';
    }
  };

  const getLegacyEffectDescription = (currentCard: GameCard) => {
    if (currentCard.effects && Object.keys(currentCard.effects).length > 0) {
      return CardTextGenerator.generateRulesText(currentCard.effects);
    }
    return currentCard.text || 'Special effect card with unique abilities.';
  };

  const faction = getLegacyFaction(card);
  const displayType = normalizeLegacyCardType(card.type);
  const flavorText = getFlavorText(card) ?? 'No intelligence available.';

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      {...(isMobile ? swipeHandlers : {})}
    >
      <div
        className={`bg-card transform animate-fade-in flex flex-col overflow-hidden ${
          isMobile ? 'w-full max-w-sm max-h-[90vh] rounded-xl' : 'w-full max-w-md h-[85vh] rounded-2xl'
        } ${getLegacyRarityFrameClass(card.rarity)} ${getLegacyRarityGlowClass(card.rarity)}`}
        onClick={(e) => e.stopPropagation()}
        data-card-id={card.id}
      >
        <div className="bg-card/95 backdrop-blur-sm border-b border-border p-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground leading-tight mb-2 truncate">{card.name}</h2>
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 ${getLegacyTypeColor(displayType, faction)}`}
              >
                {displayType}
              </Badge>
            </div>

            <div className="flex items-start gap-2 flex-shrink-0">
              <div
                className={`rounded-lg flex items-center justify-center font-bold text-sm px-3 py-2 ${
                  canAfford ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                }`}
              >
                {card.cost} IP
              </div>

              <ExtensionCardBadge cardId={card.id} variant="overlay" />

              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className={`flex-shrink-0 bg-muted overflow-hidden ${isMobile ? 'h-48' : 'h-64'}`}>
          <CardImage cardId={card.id} className="w-full h-full" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <div>
            <h4 className="text-sm font-bold mb-2 text-foreground">Effect</h4>
            <div className="bg-card/60 rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground leading-relaxed">{card.text}</p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                {getLegacyEffectDescription(card)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold mb-2 text-muted-foreground tracking-wider">
              CLASSIFIED INTELLIGENCE
            </h4>
            <div className="italic text-sm text-foreground border-l-4 border-truth-red bg-truth-red/10 rounded-r border border-truth-red/20 pl-3 pr-3 py-2 leading-relaxed">
              {flavorText}
            </div>
          </div>

          {card.rarity && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs capitalize ${getLegacyRarityFrameClass(card.rarity)}`}>
                {card.rarity}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-4 border-t border-border bg-card/95">
          <Button
            onClick={onPlayCard}
            disabled={disabled || !canAfford}
            className={`enhanced-button w-full font-mono relative overflow-hidden transition-all duration-300 ${
              isMobile ? 'text-base py-4' : 'text-sm py-3'
            } ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {displayType === 'ZONE' && <Target className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />}
              {displayType === 'ATTACK' && <Zap className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />}
              {displayType === 'MEDIA' && <Megaphone className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />}
              {displayType === 'ZONE' ? 'SELECT & TARGET' : 'DEPLOY ASSET'}
            </span>

            {!canAfford && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <span className="text-xs text-destructive font-medium">Need {card.cost} IP</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CardDetailOverlay: React.FC<CardDetailOverlayProps> = (props) => {
  const [uiTheme] = useUiTheme();
  if (!props.card) {
    return null;
  }

  if (uiTheme === 'tabloid_bw') {
    return <TabloidCardDetail {...props} />;
  }

  return <LegacyCardDetail {...props} />;
};

export default CardDetailOverlay;
