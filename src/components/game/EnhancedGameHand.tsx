import React, { useState } from 'react';
import CardImage from './CardImage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/game/GameHand';
import { useAudio } from '@/hooks/useAudio';
import { toast } from '@/hooks/use-toast';
import { Loader2, Zap, Shield, Target, X, Eye } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExtensionCardBadge } from './ExtensionCardBadge';

interface EnhancedGameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
  selectedCard?: string | null;
  onSelectCard?: (cardId: string) => void;
  maxCards?: number;
  currentIP: number;
  loadingCard?: string | null;
  onCardHover?: (card: GameCard | null) => void;
}

const EnhancedGameHand: React.FC<EnhancedGameHandProps> = ({ 
  cards, 
  onPlayCard, 
  disabled, 
  selectedCard,
  onSelectCard,
  maxCards = 7,
  currentIP,
  loadingCard,
  onCardHover
}) => {
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const [examinedCard, setExaminedCard] = useState<string | null>(null);
  const audio = useAudio();
  const { triggerHaptic } = useHapticFeedback();
  const isMobile = useIsMobile();

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
      triggerHaptic('error');
      toast({
        title: "❌ Insufficient IP",
        description: `Need ${card.cost} IP to deploy "${card.name}". You have ${currentIP} IP.`,
        variant: "destructive",
      });
      return;
    }
    
    audio.playSFX('cardPlay');
    triggerHaptic('medium');
    setPlayingCard(cardId);
    
    toast({
      title: "🚀 Asset Deployed",
      description: `"${card.name}" is now active.`,
    });
    
    try {
      onPlayCard(cardId);
      triggerHaptic('success');
    } catch (error) {
      triggerHaptic('error');
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

  // Swipe handlers for card examination
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: () => {
      if (examinedCard) {
        const currentIndex = cards.findIndex(c => c.id === examinedCard);
        const nextIndex = (currentIndex + 1) % cards.length;
        setExaminedCard(cards[nextIndex].id);
        triggerHaptic('selection');
      }
    },
    onSwipeRight: () => {
      if (examinedCard) {
        const currentIndex = cards.findIndex(c => c.id === examinedCard);
        const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
        setExaminedCard(cards[prevIndex].id);
        triggerHaptic('selection');
      }
    },
    onSwipeDown: () => {
      if (examinedCard) {
        setExaminedCard(null);
        triggerHaptic('light');
      }
    }
  });

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
                enhanced-button card-hover-glow group relative cursor-pointer transition-all duration-300
                bg-card border-2 rounded-lg flex items-center gap-2
                ${isMobile ? 'p-4 min-h-[80px]' : 'p-2'}
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
                // Only open examination modal, don't select for targeting
                audio.playSFX('click');
                triggerHaptic('selection');
                if (examinedCard === card.id) {
                  setExaminedCard(null);
                } else {
                  setExaminedCard(card.id);
                  // Don't auto-select the card for targeting when opening modal
                }
              }}
              onMouseEnter={() => {
                if (!isMobile) {
                  audio.playSFX('lightClick'); // Very quiet button sound
                  onCardHover?.(card);
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  onCardHover?.(null);
                }
              }}
            >
               {/* Enhanced loading/targeting overlay */}
               {(isLoading || isPlaying || isSelected) && (
                 <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20">
                   <Loader2 className={`w-5 h-5 ${isSelected ? 'animate-pulse' : 'animate-spin'} text-primary mb-1`} />
                   <span className="text-xs font-mono text-primary font-bold">
                     {isPlaying ? 'DEPLOYING' : isSelected && card.type === 'ZONE' ? 'TARGETING' : 'PROCESSING'}
                   </span>
                 </div>
               )}
              
               {/* Enhanced Cost Badge */}
               <div className={`rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all duration-200 ${
                 isMobile ? 'w-12 h-12 text-sm' : 'w-8 h-8'
               } ${
                 canAfford ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30' : 'bg-destructive text-destructive-foreground border-destructive shadow-md shadow-destructive/30 animate-pulse'
               }`}>
                 {card.cost}
               </div>
               
               {/* Card Name and Rarity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-foreground truncate ${isMobile ? 'text-base' : 'text-sm'}`}>{card.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full ${isMobile ? 'text-xs' : 'text-xs'} ${getRarityAccent(card.rarity)}`}>
                      {card.rarity.toUpperCase()}
                    </span>
                    <ExtensionCardBadge cardId={card.id} />
                  </div>
                  <div className={`text-muted-foreground truncate max-w-[200px] ${isMobile ? 'text-sm' : 'text-xs'}`}>{card.text}</div>
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

               {/* Selection indicator for zone targeting */}
               {isSelected && card.type === 'ZONE' && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning text-warning-foreground text-xs font-bold flex items-center justify-center ring-2 ring-warning/50 animate-pulse">
                   🎯
                 </div>
               )}
               {/* Regular selection indicator */}
               {isSelected && card.type !== 'ZONE' && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/50" />
               )}
               
               {/* Extension badge overlay */}
               <ExtensionCardBadge cardId={card.id} variant="overlay" />
            </div>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground text-sm font-mono py-8 border border-dashed border-muted rounded-lg">
          No assets available
        </div>
      )}

      {/* Card examination overlay - Mobile optimized */}
      {examinedCard && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => {
            setExaminedCard(null);
            triggerHaptic('light');
          }}
          {...(isMobile ? swipeHandlers : {})}
        >
          <div 
            className={`bg-card border-2 rounded-lg transform animate-fade-in flex flex-col ${
              isMobile 
                ? 'w-full max-w-sm h-[90vh]' 
                : 'w-full max-w-sm h-[85vh] sm:h-[80vh] md:h-[75vh] lg:h-[70vh]'
            } ${(() => {
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
                  {/* Portrait card layout - Enhanced mobile */}
                  <div className="flex flex-col h-full p-4">
                    {/* Header - Fixed */}
                    <div className="flex justify-between items-start flex-shrink-0 mb-4">
                      <div className={`rounded-full flex items-center justify-center font-bold ${
                        isMobile ? 'w-16 h-16 text-2xl' : 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl'
                      } ${
                        canAffordCard(card) ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {card.cost}
                      </div>
                      <Button
                        variant="ghost"
                        size={isMobile ? "default" : "sm"}
                        onClick={() => {
                          audio.playSFX('click');
                          triggerHaptic('light');
                          setExaminedCard(null);
                        }}
                        className={isMobile ? 'p-3' : 'p-2'}
                      >
                        <X className={isMobile ? 'w-6 h-6' : 'w-4 h-4'} />
                      </Button>
                    </div>
                    
                    {/* Title and type - Fixed */}
                    <div className="text-center flex-shrink-0 mb-4">
                      <h3 className={`font-bold mb-2 text-foreground leading-tight ${
                        isMobile ? 'text-xl' : 'text-base sm:text-lg'
                      }`}>
                        {card.name}
                        {isMobile && cards.length > 1 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Swipe to browse other cards
                          </div>
                        )}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`${isMobile ? 'text-sm px-3 py-2' : 'text-xs sm:text-sm px-2 py-1'} ${
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
        <div className="h-16 sm:h-20 md:h-24 border rounded-lg flex-shrink-0 overflow-hidden">
          <CardImage cardId={examinedCard} className="w-full h-full" />
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
                    
                    {/* Deploy button - Enhanced mobile */}
                    <div className="flex-shrink-0 pt-4 border-t border-border">
                      <Button
                        onClick={() => {
                          if (!canAffordCard(card)) {
                            triggerHaptic('error');
                            toast({
                              title: "❌ Insufficient IP",
                              description: `Need ${card.cost} IP to deploy this asset.`,
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // Zone card targeting - direct activation
                          if (card.type === 'ZONE') {
                            // Immediately activate targeting without closing modal
                            audio.playSFX('click');
                            triggerHaptic('medium');
                            onSelectCard?.(card.id);
                            
                            // Close modal after setting up targeting
                            setTimeout(() => {
                              setExaminedCard(null);
                            }, 100);
                            
                            toast({
                              title: "🎯 Zone Targeting Active",
                              description: "Click on a neutral or enemy state to deploy!",
                            });
                          } else {
                            // For all other cards, deploy immediately
                            audio.playSFX('click');
                            triggerHaptic('success');
                            setExaminedCard(null);
                            handlePlayCard(card.id);
                          }
                        }}
                        disabled={disabled}
                        className={`enhanced-button w-full font-mono relative overflow-hidden transition-all duration-300 ${
                          isMobile ? 'text-base py-4' : 'text-sm py-2'
                        } ${
                          !canAffordCard(card) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                        }`}
                        size={isMobile ? "default" : "sm"}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {card.type === 'ZONE' && <Target className={isMobile ? 'w-5 h-5' : 'w-3 h-3'} />}
                          {card.type === 'ATTACK' && <Zap className={isMobile ? 'w-5 h-5' : 'w-3 h-3'} />}
                          {card.type === 'DEFENSIVE' && <Shield className={isMobile ? 'w-5 h-5' : 'w-3 h-3'} />}
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