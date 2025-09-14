import React, { useState, useRef } from 'react';
import CardImage from './CardImage';
import CardDetailOverlay from './CardDetailOverlay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GameCard } from '@/types/cardTypes';
import { useAudioContext } from '@/contexts/AudioContext';
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
  onCardHover?: (card: (GameCard & { _hoverPosition?: { x: number; y: number } }) | null) => void;
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
  const audio = useAudioContext();
  const { triggerHaptic } = useHapticFeedback();
  const isMobile = useIsMobile();
  const handRef = useRef<HTMLDivElement>(null);

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
    // First check if card has a direct faction property (for extension cards)
    if (card.faction) {
      return card.faction.toLowerCase();
    }
    
    // Fallback to determining faction based on card text effects (for base game cards)
    if (card.text && typeof card.text === 'string') {
      if (card.text.includes('Truth +')) return 'truth';
      if (card.text.includes('Truth -')) return 'government';
    }
    
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
    <div className="space-y-2" ref={handRef} onPointerLeave={() => onCardHover?.(null)}>
      
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
              aria-describedby={`hand-tooltip-${card.id}`}
              className={`
                enhanced-button card-hover-glow group relative cursor-pointer transition-all duration-300
                bg-card border-2 rounded-lg flex items-center gap-2 overflow-visible
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
                zIndex: (isPlaying || isLoading) ? 1000 : undefined,
                overflow: 'visible'
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
              onPointerEnter={(e) => {
                const handEl = handRef.current;
                if (handEl) {
                  const hb = handEl.getBoundingClientRect();
                  const mx = e.clientX;
                  const my = e.clientY;
                  if (mx < hb.left || mx > hb.right || my < hb.top || my > hb.bottom) {
                    return;
                  }
                }
                audio.playSFX('lightClick');
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const tooltipWidth = 300; // ~max-w-xs incl. padding
                let left = rect.right + 10;
                if (left + tooltipWidth > window.innerWidth) {
                  left = Math.max(16, rect.left - tooltipWidth - 10);
                }
                let top = rect.top + rect.height / 2;
                top = Math.min(window.innerHeight - 16, Math.max(16, top));
                onCardHover?.({
                  ...card,
                  _hoverPosition: { x: left, y: top }
                });
              }}
              onPointerLeave={() => {
                onCardHover?.(null);
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
                    <ExtensionCardBadge cardId={card.id} card={card} variant="inline" />
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
                <ExtensionCardBadge cardId={card.id} card={card} variant="overlay" />

               {/* Inline hover tooltip right of the card */}
               <div
                 id={`hand-tooltip-${card.id}`}
                 role="tooltip"
                 className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[99999] pointer-events-none"
               >
                 <div className="bg-popover border border-border rounded-lg p-3 shadow-xl max-w-xs">
                   <div className="font-bold text-sm text-foreground mb-1">{card.name}</div>
                   <div className="text-xs text-muted-foreground mb-2">{card.type} • Cost: {card.cost}</div>
                   <div className="text-xs text-foreground">{card.text}</div>
                 </div>
               </div>

               {/* Hover info button */}
               <button
                 type="button"
                 className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-accent text-accent-foreground border border-accent/30 rounded-full p-1.5 shadow-sm hover:scale-105"
                 onClick={(e) => {
                   e.stopPropagation();
                   audio.playSFX('click');
                   setExaminedCard(card.id);
                 }}
                 aria-label="Vis kortdetaljer"
               >
                 <Eye className="w-4 h-4" />
               </button>

            </div>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground text-sm font-mono py-8 border border-dashed border-muted rounded-lg">
          No assets available
        </div>
      )}

      {/* Card Detail Overlay - Redesigned */}
      {examinedCard && (
        <CardDetailOverlay
          card={cards.find(c => c.id === examinedCard) || null}
          canAfford={cards.find(c => c.id === examinedCard) ? canAffordCard(cards.find(c => c.id === examinedCard)!) : false}
          disabled={disabled}
          onClose={() => {
            setExaminedCard(null);
            triggerHaptic('light');
          }}
          onPlayCard={() => {
            const card = cards.find(c => c.id === examinedCard);
            if (!card) return;
            
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
              
            } else {
              // For all other cards, deploy immediately
              audio.playSFX('click');
              triggerHaptic('success');
              setExaminedCard(null);
              handlePlayCard(card.id);
            }
          }}
          swipeHandlers={isMobile ? swipeHandlers : undefined}
        />
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