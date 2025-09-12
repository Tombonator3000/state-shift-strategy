import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Target, Zap, Shield } from 'lucide-react';
import { GameCard } from '@/components/game/GameHand';
import CardImage from '@/components/game/CardImage';
import { ExtensionCardBadge } from '@/components/game/ExtensionCardBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { CardTextGenerator } from '@/systems/CardTextGenerator';

interface CardDetailOverlayProps {
  card: GameCard | null;
  canAfford: boolean;
  disabled: boolean;
  onClose: () => void;
  onPlayCard: () => void;
  swipeHandlers?: any;
}

const CardDetailOverlay: React.FC<CardDetailOverlayProps> = ({
  card,
  canAfford,
  disabled,
  onClose,
  onPlayCard,
  swipeHandlers
}) => {
  const isMobile = useIsMobile();
  
  if (!card) return null;

  const getCardFaction = (card: GameCard): 'government' | 'truth' => {
    // First check if card has a direct faction property (for extension cards)
    if (card.faction) {
      return card.faction.toLowerCase() as 'government' | 'truth';
    }
    
    // Fallback to determining faction based on card text and name (for base game cards)
    if (card.name.toLowerCase().includes('surveillance') || 
        card.name.toLowerCase().includes('classified') ||
        (card.text && card.text.toLowerCase().includes('classified'))) {
      return 'government';
    }
    
    return 'truth';
  };

  const getRarityFrameClass = (rarity?: string) => {
    const rarityLevel = rarity?.toLowerCase() || 'common';
    const prefix = isMobile ? 'rarity-frame' : 'rarity-frame-maximized';
    return `${prefix}-${rarityLevel}`;
  };

  const getRarityGlowClass = (rarity?: string) => {
    const rarityLevel = rarity?.toLowerCase() || 'common';
    return `rarity-glow-${rarityLevel}`;
  };

  const getTypeColor = (type: string, faction: 'government' | 'truth') => {
    switch (type) {
      case 'MEDIA':
        return faction === 'truth' 
          ? 'bg-truth-red/20 border-truth-red text-truth-red'
          : 'bg-government-blue/20 border-government-blue text-government-blue';
      case 'ZONE':
        return 'bg-accent/20 border-accent text-accent-foreground';
      case 'ATTACK':
        return 'bg-destructive/20 border-destructive text-destructive';
      case 'DEFENSIVE':
        return 'bg-success/20 border-success text-success-foreground';
      case 'TECH':
        return 'bg-primary/20 border-primary text-primary';
      case 'DEVELOPMENT':
        return 'bg-secondary/20 border-secondary text-secondary-foreground';
      case 'INSTANT':
        return 'bg-warning/20 border-warning text-warning-foreground';
      default:
        return 'bg-muted/20 border-muted text-muted-foreground';
    }
  };

  const getEffectDescription = (card: GameCard) => {
    // Use the card's effects to generate description, fallback to card text
    if (card.effects && Object.keys(card.effects).length > 0) {
      return CardTextGenerator.generateRulesText(card.effects);
    }
    return card.text || 'Special effect card with unique abilities.';
  };

  const faction = getCardFaction(card);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      {...(isMobile ? swipeHandlers : {})}
    >
      <div 
        className={`bg-card transform animate-fade-in flex flex-col overflow-hidden ${
          isMobile 
            ? 'w-full max-w-sm max-h-[90vh] rounded-xl' 
            : 'w-full max-w-md h-[85vh] rounded-2xl'
        } ${getRarityFrameClass(card.rarity)} ${getRarityGlowClass(card.rarity)}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar - Sticky */}
        <div className="bg-card/95 backdrop-blur-sm border-b border-border p-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h2 className="font-bold text-foreground leading-tight mb-2 truncate">
                {card.name}
              </h2>
              
              {/* Type Badge */}
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0.5 ${getTypeColor(card.type, faction)}`}
              >
                {card.type}
              </Badge>
            </div>
            
            <div className="flex items-start gap-2 flex-shrink-0">
              {/* Cost */}
              <div className={`rounded-lg flex items-center justify-center font-bold text-sm px-3 py-2 ${
                canAfford ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {card.cost} IP
              </div>
              
              {/* Extension Badge */}
              <ExtensionCardBadge cardId={card.id} variant="overlay" />
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Art Area - Full width */}
        <div className={`flex-shrink-0 bg-muted overflow-hidden ${
          isMobile ? 'h-48' : 'h-64'
        }`}>
          <CardImage cardId={card.id} className="w-full h-full" />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Rules / Effect */}
          <div>
            <h4 className="text-sm font-bold mb-2 text-foreground">Effect</h4>
            <div className="bg-card/60 rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {card.text}
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                {getEffectDescription(card)}
              </div>
            </div>
          </div>

          {/* Flavor Text */}
          <div>
            <h4 className="text-xs font-bold mb-2 text-muted-foreground tracking-wider">
              CLASSIFIED INTELLIGENCE
            </h4>
            <div className="italic text-sm text-foreground border-l-4 border-truth-red bg-truth-red/10 rounded-r border border-truth-red/20 pl-3 pr-3 py-2 leading-relaxed">
              "{faction === 'truth' ? card.flavorTruth : card.flavorGov}"
            </div>
          </div>

          {/* Rarity Display */}
          {card.rarity && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs capitalize ${getRarityFrameClass(card.rarity)}`}
              >
                {card.rarity}
              </Badge>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card/95">
          <Button
            onClick={onPlayCard}
            disabled={disabled || !canAfford}
            className={`enhanced-button w-full font-mono relative overflow-hidden transition-all duration-300 ${
              isMobile ? 'text-base py-4' : 'text-sm py-3'
            } ${
              !canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {card.type === 'ZONE' && <Target className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />}
              {card.type === 'ATTACK' && <Zap className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />}
              {card.type === 'DEFENSIVE' && <Shield className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />}
              {card.type === 'ZONE' ? 'SELECT & TARGET' : 'DEPLOY ASSET'}
            </span>
            
            {!canAfford && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <span className="text-xs text-destructive font-medium">
                  Need {card.cost} IP
                </span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailOverlay;