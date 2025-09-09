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
  const [examinedCard, setExaminedCard] = useState<string | null>(null);

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
              key={`${card.id}-${index}`}
              data-card-id={card.id}
              className={`
                group relative p-2 cursor-pointer transition-all duration-300 
                bg-card border rounded-md flex items-center gap-2
                ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2 shadow-lg shadow-yellow-400/25' : ''}
                ${isPlaying ? 'animate-pulse scale-105 z-50 ring-2 ring-primary ring-offset-2' : 'hover:scale-[1.02] hover:shadow-lg hover:border-primary/50'}
                ${!canAfford && !disabled ? 'opacity-50 saturate-50' : ''}
                ${getRarityBorder(card.rarity)}
                ${getRarityGlow(card.rarity)}
                border overflow-hidden text-xs
                animate-fade-in hover:bg-card/90
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
                before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
              `}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                transform: isPlaying ? 'scale(1.05) translateY(-2px)' : undefined,
                zIndex: isPlaying ? 1000 : undefined
              }}
              onClick={() => {
                if (examinedCard === card.id) {
                  setExaminedCard(null);
                } else {
                  setExaminedCard(card.id);
                  onSelectCard?.(card.id);
                }
              }}
              onMouseEnter={() => {
                // Add subtle hover sound effect here if needed
              }}
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
              
              {/* Type badge and targeting info */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Badge 
                  variant="outline" 
                  className={`text-xs py-0 px-1 ${
                    card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth/20 border-truth text-truth' :
                    card.type === 'MEDIA' && faction === 'government' ? 'bg-government/20 border-government text-government' :
                    card.type === 'ZONE' ? 'bg-accent/20 border-accent text-accent-foreground' :
                    card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive' :
                    'bg-muted/20 border-muted text-muted-foreground'
                  }`}
                >
                  {card.type}
                </Badge>
                {card.type === 'ZONE' && (
                  <div className="text-xs text-muted-foreground">
                    {isSelected ? 'Click state' : 'Target req.'}
                  </div>
                )}
              </div>
              
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
                disabled={disabled || !canAfford || isPlaying || (card.type === 'ZONE' && !isSelected)}
                className={`text-xs px-2 py-1 h-6 flex-shrink-0 transition-all duration-200 ${
                  isPlaying ? 'animate-pulse bg-primary/80' : 
                  (card.type === 'ZONE' && !isSelected) ? 'bg-muted text-muted-foreground cursor-default' :
                  canAfford ? 'hover:bg-primary hover:scale-105 hover:shadow-md group-hover:bg-primary/90' : 
                  'cursor-not-allowed'
                }`}
                title={card.type === 'ZONE' ? 'Select card first, then click a state on the map' : 'Deploy this card immediately'}
              >
                {isPlaying ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-ping"></div>
                    <span>...</span>
                  </div>
                ) : card.type === 'ZONE' && !isSelected ? 'SELECT' : 'DEPLOY'}
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

      {/* Card examination overlay */}
      {examinedCard && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => setExaminedCard(null)}
        >
          <div 
            className="bg-card border-2 border-border rounded-lg p-6 max-w-md w-full transform scale-110 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const card = cards.find(c => c.id === examinedCard);
              if (!card) return null;
              const faction = getCardFaction(card);
              
              return (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      canAffordCard(card) ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {card.cost}
                    </div>
                    <button 
                      onClick={() => setExaminedCard(null)}
                      className="text-muted-foreground hover:text-foreground text-xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2">{card.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`${
                        card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth/20 border-truth text-truth' :
                        card.type === 'MEDIA' && faction === 'government' ? 'bg-government/20 border-government text-government' :
                        card.type === 'ZONE' ? 'bg-accent/20 border-accent text-accent-foreground' :
                        card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive' :
                        'bg-muted/20 border-muted text-muted-foreground'
                      }`}
                    >
                      {card.type}
                    </Badge>
                  </div>
                  
                  <div className="h-32 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground border rounded mb-4">
                    [CLASSIFIED IMAGE]
                  </div>
                  
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{card.text}</p>
                        
                        {/* Enhanced card effect description */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          {card.type === 'MEDIA' && faction === 'truth' && 'Increases Truth meter by exposing lies'}
                          {card.type === 'MEDIA' && faction === 'government' && 'Decreases Truth meter through disinformation'}
                          {card.type === 'ZONE' && 'Adds pressure to target state. High enough pressure captures the state.'}
                          {card.type === 'ATTACK' && 'Deals direct IP damage to enemy operations'}
                          {card.type === 'DEFENSIVE' && 'Reduces pressure on your controlled states'}
                        </div>
                      </div>
                      
                      <div className="text-center text-xs italic text-muted-foreground border-t border-border pt-4">
                        "{card.flavorTruth}"
                      </div>
                      
                      <Button
                        onClick={() => {
                          setExaminedCard(null);
                          handlePlayCard(card.id);
                        }}
                        disabled={disabled || !canAffordCard(card)}
                        className="w-full"
                      >
                        {card.type === 'ZONE' ? 'SELECT & TARGET' : 'DEPLOY ASSET'}
                      </Button>
                    </div>
                </>
              );
            })()}
          </div>
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