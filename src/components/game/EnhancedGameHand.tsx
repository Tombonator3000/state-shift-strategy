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
    
    // Magic-style animation delay
    setTimeout(() => {
      onPlayCard(cardId);
      setPlayingCard(null);
    }, 800);
  };

  const canAffordCard = (card: GameCard) => currentIP >= card.cost;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm font-mono text-foreground">
          Hand ({cards.length}/{maxCards})
        </h3>
        <div className="text-sm font-mono text-muted-foreground">
          IP: {currentIP}
        </div>
      </div>
      
      <div className="grid gap-2 max-h-[70vh] overflow-y-auto">
        {cards.map((card, index) => {
          const isSelected = selectedCard === card.id;
          const isPlaying = playingCard === card.id;
          const canAfford = canAffordCard(card);
          const faction = getCardFaction(card);
          
          return (
            <Card 
              key={card.id}
              className={`
                relative p-0 cursor-pointer transition-all duration-300 
                ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                ${isPlaying ? 'animate-pulse scale-110 z-50' : 'hover:scale-105'}
                ${!canAfford && !disabled ? 'opacity-50' : ''}
                ${getRarityGlow(card.rarity)}
                ${getRarityBorder(card.rarity)}
                border-2 overflow-hidden
                animate-fade-in
              `}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                transform: isPlaying ? 'scale(1.2) translateY(-20px)' : undefined,
                zIndex: isPlaying ? 1000 : undefined
              }}
              onClick={() => onSelectCard?.(card.id)}
            >
              {/* Rarity foil effect */}
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${
                card.rarity === 'legendary' ? 'from-orange-400 to-yellow-400' :
                card.rarity === 'rare' ? 'from-blue-400 to-purple-400' :
                card.rarity === 'uncommon' ? 'from-green-400 to-teal-400' :
                'from-gray-400 to-gray-500'
              }`} />
              
              {/* Cost gem */}
              <div className={`absolute top-2 right-2 w-8 h-8 rounded-full z-10 flex items-center justify-center text-xs font-bold ${
                canAfford ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {card.cost}
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-yellow-600" />
                </div>
              )}
              
              <div className="relative">
                {/* Card header with faction styling */}
                <div className={`p-3 pb-2 ${
                  faction === 'truth' ? 'bg-gradient-to-r from-truth/20 to-truth/10' :
                  faction === 'government' ? 'bg-gradient-to-r from-government/20 to-government/10' :
                  'bg-gradient-to-r from-muted/20 to-muted/10'
                }`}>
                  <h4 className="font-bold text-sm font-mono text-center text-foreground">
                    {card.name}
                  </h4>
                </div>
                
                {/* Art placeholder with faction theming */}
                <div className={`h-20 flex items-center justify-center text-xs border-y relative ${
                  faction === 'truth' ? 'bg-truth/5 border-truth/20' :
                  faction === 'government' ? 'bg-government/5 border-government/20' :
                  'bg-muted/5 border-muted/20'
                }`}>
                  <div className="text-muted-foreground font-mono">[CLASSIFIED]</div>
                  
                  {/* Playing animation overlay */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  )}
                </div>
                
                {/* Card content */}
                <div className="p-3 space-y-2">
                  <div className="flex justify-center">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-mono ${
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
                  
                  <div className="text-xs text-center font-medium text-foreground min-h-8 flex items-center justify-center">
                    {card.text}
                  </div>
                  
                  <div className="text-xs italic text-muted-foreground text-center min-h-6 border-t border-border pt-2">
                    "{card.flavorTruth}"
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayCard(card.id);
                    }}
                    disabled={disabled || !canAfford || isPlaying}
                    className={`w-full text-xs transition-all ${
                      isPlaying ? 'animate-pulse' : 'hover:scale-105'
                    }`}
                  >
                    {isPlaying ? 'DEPLOYING...' : 'DEPLOY ASSET'}
                  </Button>
                </div>
              </div>
            </Card>
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