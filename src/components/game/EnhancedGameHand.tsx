import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/game/GameHand';

interface EnhancedGameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
  selectedCard?: string | null;
  onSelectCard?: (cardId: string) => void;
  maxCards?: number;
  currentIP: number;
}

const EnhancedGameHand: React.FC<EnhancedGameHandProps> = ({ 
  cards, 
  onPlayCard, 
  disabled, 
  selectedCard,
  onSelectCard,
  maxCards = 7,
  currentIP
}) => {
  const [playingCard, setPlayingCard] = useState<string | null>(null);

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-lg';
      case 'uncommon': return 'shadow-lg shadow-green-500/20';
      case 'rare': return 'shadow-lg shadow-blue-500/20';
      case 'legendary': return 'shadow-lg shadow-orange-500/30';
      default: return 'shadow-lg';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-muted';
      case 'uncommon': return 'border-green-500';
      case 'rare': return 'border-blue-500';
      case 'legendary': return 'border-orange-500';
      default: return 'border-muted';
    }
  };

  const getCardFaction = (card: GameCard) => {
    // Determine faction based on card text effects
    if (card.text.includes('Truth +')) return 'truth';
    if (card.text.includes('Truth -')) return 'government';
    return 'neutral';
  };

  const handlePlayCard = async (cardId: string) => {
    setPlayingCard(cardId);
    onPlayCard(cardId);
    setPlayingCard(null);
  };

  const canAffordCard = (card: GameCard) => currentIP >= card.cost;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs font-mono text-foreground">
          Hand ({cards.length}/{maxCards})
        </h3>
        <div className="text-xs font-mono text-muted-foreground">
          IP: {currentIP}
        </div>
      </div>
      
      {/* Minimized hand cards */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {cards.map((card, index) => {
          const isSelected = selectedCard === card.id;
          const isPlaying = playingCard === card.id;
          const canAfford = canAffordCard(card);
          const faction = getCardFaction(card);
          
          return (
            <div 
              key={card.id}
              data-card-id={card.id}
              className={`
                relative p-2 cursor-pointer transition-all duration-300 
                bg-card border rounded-md flex items-center gap-2
                ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                ${isPlaying ? 'animate-pulse scale-105 z-50' : 'hover:scale-102'}
                ${!canAfford && !disabled ? 'opacity-50' : ''}
                ${getRarityBorder(card.rarity)}
                border overflow-hidden text-xs
                animate-fade-in
              `}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                transform: isPlaying ? 'scale(1.05) translateY(-2px)' : undefined,
                zIndex: isPlaying ? 1000 : undefined
              }}
              onClick={() => onSelectCard?.(card.id)}
            >
              {/* Cost */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                canAfford ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {card.cost}
              </div>
              
              {/* Card info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs truncate">{card.name}</div>
                <div className="text-xs text-muted-foreground truncate">{card.text}</div>
              </div>
              
              {/* Type badge */}
              <Badge 
                variant="outline" 
                className={`text-xs py-0 px-1 flex-shrink-0 ${
                  card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth/20 border-truth text-truth' :
                  card.type === 'MEDIA' && faction === 'government' ? 'bg-government/20 border-government text-government' :
                  card.type === 'ZONE' ? 'bg-accent/20 border-accent text-accent-foreground' :
                  card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive' :
                  'bg-muted/20 border-muted text-muted-foreground'
                }`}
              >
                {card.type}
              </Badge>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400" />
              )}
              
              {/* Deploy button */}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayCard(card.id);
                }}
                disabled={disabled || !canAfford || isPlaying}
                className={`text-xs px-2 py-1 h-6 flex-shrink-0 ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
              >
                {isPlaying ? '...' : 'DEPLOY'}
              </Button>
            </div>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground text-sm font-mono py-8 border border-dashed border-muted rounded-lg">
          No assets available
        </div>
      )}

      {/* Card playing overlay */}
      {playingCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4 animate-pulse">
              DEPLOYING ASSET
            </div>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGameHand;