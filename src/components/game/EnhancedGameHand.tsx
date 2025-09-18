import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import CardDetailOverlay from './CardDetailOverlay';
import BaseCard from '@/components/game/cards/BaseCard';
import { Card } from '@/components/ui/card';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES } from '@/rules/mvp';
import { useAudioContext } from '@/contexts/AudioContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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

  const normalizeCardType = (type: string): MVPCardType => {
    return MVP_CARD_TYPES.includes(type as MVPCardType) ? type as MVPCardType : 'MEDIA';
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
    <div
      className="relative flex h-full flex-col"
      ref={handRef}
      onPointerLeave={() => onCardHover?.(null)}
    >
      <div className="grid grid-cols-3 items-start gap-4 overflow-y-auto p-3 max-h-[calc(100vh-220px)]">
        {cards.length === 0 ? (
          <div className="col-span-full flex min-h-[160px] items-center justify-center rounded border border-dashed border-neutral-700 bg-neutral-900/60 p-6 text-sm font-mono text-white/60">
            No assets available
          </div>
        ) : (
          cards.map((card, index) => {
            const isSelected = selectedCard === card.id;
            const isPlaying = playingCard === card.id;
            const isLoading = loadingCard === card.id;
            const canAfford = canAffordCard(card);
            const displayType = normalizeCardType(card.type);

            const overlay = (
              <>
                {(isLoading || isPlaying || isSelected) && (
                  <div
                    className={clsx(
                      'pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm',
                      isSelected && !isPlaying && !isLoading && 'bg-yellow-400/15 text-yellow-100'
                    )}
                    style={{ borderRadius: 'calc(var(--pt-radius) * var(--card-scale))' }}
                  >
                    <Loader2
                      className={clsx(
                        'mb-1 h-5 w-5',
                        isSelected ? 'animate-pulse text-yellow-200' : 'animate-spin text-primary'
                      )}
                    />
                    <span className="text-xs font-mono font-bold">
                      {isPlaying
                        ? 'DEPLOYING'
                        : isSelected && displayType === 'ZONE'
                          ? 'TARGETING'
                          : 'PROCESSING'}
                    </span>
                  </div>
                )}

                {isSelected && displayType === 'ZONE' && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black ring-2 ring-yellow-300 animate-pulse">
                    🎯
                  </div>
                )}

                {isSelected && displayType !== 'ZONE' && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-300 ring-2 ring-yellow-200" />
                )}

                <div className="pointer-events-none">
                  <ExtensionCardBadge cardId={card.id} card={card} variant="overlay" />
                </div>
              </>
            );

            return (
              <button
                key={`${card.id}-${index}`}
                type="button"
                className={clsx(
                  'group/card relative flex items-start justify-center bg-transparent p-0 text-left transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                  !canAfford && !disabled && 'cursor-not-allowed opacity-60 saturate-50',
                  disabled && 'cursor-default'
                )}
                style={{ animationDelay: `${index * 0.03}s` }}
                onClick={(e) => {
                  e.preventDefault();
                  audio.playSFX('click');
                  triggerHaptic('selection');
                  setExaminedCard(prev => (prev === card.id ? null : card.id));
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
                  const tooltipWidth = 300;
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
                <BaseCard
                  card={card}
                  hideStamp
                  polaroidHover={false}
                  size="handMini"
                  className="pointer-events-none select-none"
                  frameClassName={clsx(
                    'drop-shadow-[0_12px_22px_rgba(0,0,0,0.32)] transition-transform duration-200',
                    !disabled && canAfford && 'group-hover/card:-translate-y-1 group-hover/card:drop-shadow-[0_22px_30px_rgba(0,0,0,0.35)]',
                    (isPlaying || isLoading) && 'ring-2 ring-primary shadow-primary/40',
                    isSelected && 'ring-2 ring-yellow-400 shadow-yellow-400/40'
                  )}
                  overlay={overlay}
                />
              </button>
            );
          })
        )}
      </div>

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
            if (normalizeCardType(card.type) === 'ZONE') {
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