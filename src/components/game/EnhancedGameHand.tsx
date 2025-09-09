import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/game/GameHand';
import { useAudio } from '@/hooks/useAudio';

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
  const audio = useAudio();

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-md';
      case 'uncommon': return 'shadow-md shadow-emerald-400/40';
      case 'rare': return 'shadow-lg shadow-blue-400/50';
      case 'legendary': return 'shadow-xl shadow-amber-400/60 animate-pulse';
      default: return 'shadow-md';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-zinc-600';
      case 'uncommon': return 'border-emerald-400';
      case 'rare': return 'border-blue-400';
      case 'legendary': return 'border-amber-400';
      default: return 'border-zinc-600';
    }
  };

  const getRarityAccent = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-zinc-100 text-zinc-800';
      case 'uncommon': return 'bg-emerald-100 text-emerald-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'legendary': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-bold';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getCardFaction = (card: GameCard) => {
    // Determine faction based on card text effects
    if (card.text.includes('Truth +')) return 'truth';
    if (card.text.includes('Truth -')) return 'government';
    return 'neutral';
  };

  const handlePlayCard = async (cardId: string) => {
    audio.playSFX('cardPlay');
    setPlayingCard(cardId);
    onPlayCard(cardId);
    setPlayingCard(null);
  };

  const canAffordCard = (card: GameCard) => currentIP >= card.cost;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm font-mono text-foreground">
          YOUR HAND
        </h3>
        <div className="text-xs font-mono text-muted-foreground">
          IP: {currentIP}
        </div>
      </div>
      
      {/* Minimized hand cards - Compact List */}
      <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
                group relative p-2 cursor-pointer transition-all duration-200
                bg-card border-2 rounded-lg flex items-center gap-2
                ${isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10' : ''}
                ${isPlaying ? 'animate-pulse scale-105 z-50' : 'hover:scale-[1.02]'}
                ${!canAfford && !disabled ? 'opacity-60 saturate-50' : ''}
                ${getRarityBorder(card.rarity)}
                ${getRarityGlow(card.rarity)}
                hover:bg-accent/20 active:scale-95
              `}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                transform: isPlaying ? 'scale(1.05) translateY(-2px)' : undefined,
                zIndex: isPlaying ? 1000 : undefined
              }}
              onClick={(e) => {
                e.preventDefault();
                audio.playSFX('click');
                if (examinedCard === card.id) {
                  setExaminedCard(null);
                } else {
                  setExaminedCard(card.id);
                  onSelectCard?.(card.id);
                }
              }}
              onMouseEnter={() => {
                audio.playSFX('hover');
              }}
            >
              {/* Cost Badge */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 ${
                canAfford ? 'bg-primary text-primary-foreground border-primary' : 'bg-destructive text-destructive-foreground border-destructive'
              }`}>
                {card.cost}
              </div>
              
              {/* Card Name and Rarity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground truncate">{card.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRarityAccent(card.rarity)}`}>
                    {card.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{card.text}</div>
              </div>
              
              {/* Type Badge */}
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0 flex-shrink-0 ${
                  card.type === 'MEDIA' && faction === 'truth' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700' :
                  card.type === 'MEDIA' && faction === 'government' ? 'bg-blue-500/20 border-blue-500 text-blue-700' :
                  card.type === 'ZONE' ? 'bg-amber-500/20 border-amber-500 text-amber-700' :
                  card.type === 'ATTACK' ? 'bg-red-500/20 border-red-500 text-red-700' :
                  'bg-zinc-500/20 border-zinc-500 text-zinc-700'
                }`}
              >
                {card.type}
              </Badge>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/50" />
              )}
            </div>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground text-sm font-mono py-8 border border-dashed border-muted rounded-lg">
          No assets available
        </div>
      )}

      {/* Card examination overlay - Landscape format */}
      {examinedCard && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => setExaminedCard(null)}
        >
          <div 
            className="bg-card border-2 border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto transform scale-110 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const card = cards.find(c => c.id === examinedCard);
              if (!card) return null;
              const faction = getCardFaction(card);
              
              return (
                <>
                  {/* Landscape card layout */}
                  <div className="flex gap-6">
                    {/* Left side - Card art and info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                          canAffordCard(card) ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                        }`}>
                          {card.cost}
                        </div>
                        <button 
                          onClick={() => {
                            audio.playSFX('click');
                            setExaminedCard(null);
                          }}
                          className="text-muted-foreground hover:text-foreground text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold mb-2 text-foreground">{card.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-sm px-3 py-1 ${
                            card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth-red/20 border-truth-red text-truth-red' :
                            card.type === 'MEDIA' && faction === 'government' ? 'bg-government-blue/20 border-government-blue text-government-blue' :
                            card.type === 'ZONE' ? 'bg-accent/20 border-accent text-accent-foreground' :
                            card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive' :
                            'bg-muted/20 border-muted text-muted-foreground'
                          }`}
                        >
                          {card.type}
                        </Badge>
                      </div>
                      
                      <div className="h-40 bg-muted/20 flex items-center justify-center text-lg text-muted-foreground border rounded mb-4">
                        [CLASSIFIED IMAGE]
                      </div>
                    </div>
                    
                    {/* Right side - Card details */}
                    <div className="flex-1">
                  
                      <div className="space-y-6">
                        {/* Card effect */}
                        <div>
                          <h4 className="text-lg font-bold mb-3 text-foreground">Effect</h4>
                          <p className="text-base font-medium text-foreground bg-muted/20 p-3 rounded border">{card.text}</p>
                          
                          {/* Enhanced card effect description */}
                          <div className="mt-3 text-sm text-muted-foreground bg-accent/10 p-3 rounded">
                            <span className="font-medium">Gameplay:</span> {
                              card.type === 'MEDIA' && faction === 'truth' ? 'Increases Truth meter by exposing lies and corruption.' :
                              card.type === 'MEDIA' && faction === 'government' ? 'Decreases Truth meter through disinformation campaigns.' :
                              card.type === 'ZONE' ? 'Adds pressure to target state. States with pressure ≥ defense are captured.' :
                              card.type === 'ATTACK' ? 'Deals direct IP damage to enemy operations and resources.' :
                              card.type === 'DEFENSIVE' ? 'Reduces pressure on your controlled states to prevent capture.' :
                              'Special effect card with unique strategic abilities.'
                            }
                            {card.type === 'ZONE' && (
                              <div className="mt-2 text-warning font-medium">
                                ⚠️ Requires target selection on the map
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Flavor text */}
                        <div>
                          <h4 className="text-sm font-bold mb-2 text-muted-foreground">CLASSIFIED INTELLIGENCE</h4>
                          <div className="text-sm italic text-muted-foreground border-l-4 border-truth-red pl-4">
                            "{card.flavorTruth}"
                          </div>
                        </div>
                        
                        {/* Deploy button */}
                        <Button
                          onClick={() => {
                            audio.playSFX('click');
                            setExaminedCard(null);
                            handlePlayCard(card.id);
                          }}
                          disabled={disabled || !canAffordCard(card)}
                          className="w-full text-lg py-3"
                          size="lg"
                        >
                          {card.type === 'ZONE' ? 'SELECT & TARGET STATE' : 'DEPLOY ASSET'}
                        </Button>
                      </div>
                    </div>
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