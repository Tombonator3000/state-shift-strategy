import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/game/GameHand';
import { useAudio } from '@/hooks/useAudio';
import { toast } from '@/hooks/use-toast';
import { Loader2, Zap, Shield, Target } from 'lucide-react';

interface EnhancedGameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
  selectedCard?: string | null;
  onSelectCard?: (cardId: string) => void;
  maxCards?: number;
  currentIP: number;
  loadingCard?: string | null;
}

const EnhancedGameHand: React.FC<EnhancedGameHandProps> = ({ 
  cards, 
  onPlayCard, 
  disabled, 
  selectedCard,
  onSelectCard,
  maxCards = 7,
  currentIP,
  loadingCard
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
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    if (!canAffordCard(card)) {
      audio.playSFX('lightClick'); // Error sound - light click
      toast({
        title: "❌ Insufficient IP",
        description: `Need ${card.cost} IP to deploy "${card.name}". You have ${currentIP} IP.`,
        variant: "destructive",
      });
      return;
    }
    
    audio.playSFX('cardPlay');
    setPlayingCard(cardId);
    
    toast({
      title: "🚀 Asset Deployed",
      description: `"${card.name}" is now active.`,
    });
    
    try {
      onPlayCard(cardId);
    } catch (error) {
      toast({
        title: "❌ Deployment Failed",
        description: "Asset deployment was interrupted. Try again.",
        variant: "destructive",
      });
    } finally {
      setPlayingCard(null);
    }
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
      <div className="space-y-1">
        {cards.map((card, index) => {
          const isSelected = selectedCard === card.id;
          const isPlaying = playingCard === card.id;
          const isLoading = loadingCard === card.id;
          const canAfford = canAffordCard(card);
          const faction = getCardFaction(card);
          
          return (
            <div 
              key={`${card.id}-${index}`}
              data-card-id={card.id}
              className={`
                enhanced-button card-hover-glow group relative p-2 cursor-pointer transition-all duration-300
                bg-card border-2 rounded-lg flex items-center gap-2
                ${isSelected ? 'ring-2 ring-warning scale-105 z-10 shadow-lg shadow-warning/50' : ''}
                ${isPlaying || isLoading ? 'animate-pulse scale-105 z-50 ring-2 ring-primary shadow-lg shadow-primary/50' : 'hover:scale-[1.03] hover:shadow-md'}
                ${!canAfford && !disabled ? 'opacity-60 saturate-50 cursor-not-allowed' : 'hover:bg-accent/20'}
                ${getRarityBorder(card.rarity)}
                ${getRarityGlow(card.rarity)}
                active:scale-95 hover:-translate-y-0.5
              `}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                transform: (isPlaying || isLoading) ? 'scale(1.05) translateY(-2px)' : undefined,
                zIndex: (isPlaying || isLoading) ? 1000 : undefined
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
                audio.playSFX('lightClick'); // Very quiet button sound
              }}
            >
               {/* Enhanced loading overlay */}
              {(isLoading || isPlaying) && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mb-1" />
                  <span className="text-xs font-mono text-primary font-bold">
                    {isPlaying ? 'DEPLOYING' : 'PROCESSING'}
                  </span>
                </div>
              )}
              
              {/* Enhanced Cost Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all duration-200 ${
                canAfford ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30' : 'bg-destructive text-destructive-foreground border-destructive shadow-md shadow-destructive/30 animate-pulse'
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
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{card.text}</div>
              </div>
              
              {/* Enhanced Type Badge */}
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 flex-shrink-0 flex items-center gap-1 transition-all duration-200 ${
                  card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth-red/20 border-truth-red text-truth-red shadow-sm' :
                  card.type === 'MEDIA' && faction === 'government' ? 'bg-government-blue/20 border-government-blue text-government-blue shadow-sm' :
                  card.type === 'ZONE' ? 'bg-warning/20 border-warning text-warning shadow-sm' :
                  card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive shadow-sm' :
                  'bg-muted/20 border-muted text-muted-foreground shadow-sm'
                }`}
              >
                {card.type === 'ZONE' && <Target className="w-3 h-3" />}
                {card.type === 'ATTACK' && <Zap className="w-3 h-3" />}
                {card.type === 'DEFENSIVE' && <Shield className="w-3 h-3" />}
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
            className={`bg-card border-2 rounded-lg p-3 w-full max-w-sm mx-auto h-[85vh] sm:h-[80vh] md:h-[75vh] lg:h-[70vh] transform animate-fade-in flex flex-col ${(() => {
              const card = cards.find(c => c.id === examinedCard);
              return card ? `${getRarityBorder(card.rarity)} ${getRarityGlow(card.rarity)}` : 'border-border';
            })()}`}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const card = cards.find(c => c.id === examinedCard);
              if (!card) return null;
              const faction = getCardFaction(card);
              
              return (
                <>
                  {/* Portrait card layout - Flexbox no scroll */}
                  <div className="flex flex-col h-full">
                    {/* Header - Fixed */}
                    <div className="flex justify-between items-start flex-shrink-0 mb-3">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold ${
                        canAffordCard(card) ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {card.cost}
                      </div>
                      <button 
                        onClick={() => {
                          audio.playSFX('click');
                          setExaminedCard(null);
                        }}
                        className="text-muted-foreground hover:text-foreground text-2xl font-bold w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Title and type - Fixed */}
                    <div className="text-center flex-shrink-0 mb-3">
                      <h3 className="text-base sm:text-lg font-bold mb-1 text-foreground leading-tight">{card.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs sm:text-sm px-2 py-1 ${
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
                    
      {/* Scrollable middle content - ENHANCED RESPONSIVENESS */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 min-h-0 pr-1">
        {/* Card art - RESPONSIVE */}
        <div className="h-16 sm:h-20 md:h-24 bg-muted/20 flex items-center justify-center text-xs sm:text-sm text-muted-foreground border rounded-lg flex-shrink-0">
          [CLASSIFIED IMAGE]
        </div>
        
        {/* Card effect - ENHANCED MOBILE TEXT */}
        <div>
          <h4 className="text-xs sm:text-sm font-bold mb-1 text-foreground">Effect</h4>
          <p className="text-xs sm:text-sm font-medium text-foreground bg-card/80 p-2 sm:p-3 rounded-lg border border-border leading-relaxed">{card.text}</p>
          
          <div className="mt-2 text-xs sm:text-sm text-foreground bg-accent/10 p-2 sm:p-3 rounded-lg border border-accent/20">
            <span className="font-bold text-accent">Type:</span> {
              card.type === 'MEDIA' && faction === 'truth' ? 'Increases Truth meter.' :
              card.type === 'MEDIA' && faction === 'government' ? 'Decreases Truth meter.' :
              card.type === 'ZONE' ? 'Adds pressure to target state.' :
              card.type === 'ATTACK' ? 'Deals IP damage.' :
              card.type === 'DEFENSIVE' ? 'Reduces pressure.' :
              'Special strategic ability.'
            }
          </div>
        </div>
        
        {/* Flavor text - RESPONSIVE */}
        <div>
          <h4 className="text-xs font-bold mb-1 text-muted-foreground">CLASSIFIED INTELLIGENCE</h4>
          <div className="text-xs sm:text-sm italic text-foreground border-l-4 border-truth-red pl-2 sm:pl-3 bg-truth-red/10 p-2 sm:p-3 rounded-r border border-truth-red/20 leading-relaxed">
            "{card.flavorTruth}"
          </div>
        </div>
      </div>
                    
                    {/* Deploy button - Fixed at bottom */}
                    <div className="flex-shrink-0 pt-3 border-t border-border">
                      <Button
                        onClick={() => {
                          if (!canAffordCard(card)) {
                            toast({
                              title: "❌ Insufficient IP",
                              description: `Need ${card.cost} IP to deploy this asset.`,
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          audio.playSFX('click');
                          setExaminedCard(null);
                          
                          // Direct deployment - no extra steps
                          if (card.type === 'ZONE') {
                            // For zone cards, immediately select and show targeting instructions
                            onSelectCard?.(card.id);
                            toast({
                              title: "🎯 Zone Card Active",
                              description: "Now click on a neutral or enemy state to deploy this zone asset!",
                            });
                          } else {
                            // For all other cards, deploy immediately
                            handlePlayCard(card.id);
                          }
                        }}
                        disabled={disabled}
                        className={`enhanced-button w-full text-sm py-2 font-mono relative overflow-hidden transition-all duration-300 ${
                          !canAffordCard(card) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                        }`}
                        size="sm"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-1">
                          {card.type === 'ZONE' && <Target className="w-3 h-3" />}
                          {card.type === 'ATTACK' && <Zap className="w-3 h-3" />}
                          {card.type === 'DEFENSIVE' && <Shield className="w-3 h-3" />}
                          {card.type === 'ZONE' ? 'SELECT & TARGET' : 'DEPLOY ASSET'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Enhanced Card playing overlay */}
      {playingCard && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <Card className="p-8 text-center bg-card/90 backdrop-blur-md border-primary shadow-2xl shadow-primary/50">
            <div className="space-y-6">
              <div className="text-3xl font-bold text-foreground mb-2 font-mono">
                🚀 DEPLOYING ASSET
              </div>
              <div className="text-lg text-muted-foreground font-mono">
                Operation in progress...
              </div>
              <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {(() => {
                  const card = cards.find(c => c.id === playingCard);
                  return card ? `"${card.name}"` : 'Unknown Asset';
                })()}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedGameHand;