import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import BaseCard from './cards/BaseCard';
import CardDetailOverlay from './CardDetailOverlay';
import { cn } from '@/lib/utils';
import { useAudioContext } from '@/contexts/AudioContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import type { GameCard } from '@/rules/mvp';

interface FixedPlayerHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  onEndTurn: () => void;
  selectedCard?: string | null;
  onSelectCard?: (cardId: string) => void;
  currentIP: number;
  loadingCard?: string | null;
  disabled?: boolean;
  onCardHover?: (card: (GameCard & { _hoverPosition?: { x: number; y: number } }) | null) => void;
}

export default function FixedPlayerHand({
  cards,
  onPlayCard,
  onEndTurn,
  selectedCard,
  onSelectCard,
  currentIP,
  loadingCard,
  disabled = false,
  onCardHover,
}: FixedPlayerHandProps) {
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const [examinedCard, setExaminedCard] = useState<GameCard | null>(null);
  const handRef = useRef<HTMLDivElement>(null);
  
  const { playSFX } = useAudioContext();
  const { triggerHaptic } = useHapticFeedback();

  const canAffordCard = (card: GameCard) => currentIP >= card.cost;

  const handlePlayCard = async (card: GameCard) => {
    if (!canAffordCard(card) || disabled) {
      playSFX('error');
      triggerHaptic('error');
      return;
    }

    setPlayingCard(card.id);
    playSFX('cardPlay');
    triggerHaptic('medium');
    
    try {
      await onPlayCard(card.id);
    } finally {
      setPlayingCard(null);
    }
  };

  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: () => {
      if (!examinedCard) return;
      const currentIndex = cards.findIndex(c => c.id === examinedCard.id);
      const nextIndex = (currentIndex + 1) % cards.length;
      setExaminedCard(cards[nextIndex]);
    },
    onSwipeRight: () => {
      if (!examinedCard) return;
      const currentIndex = cards.findIndex(c => c.id === examinedCard.id);
      const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
      setExaminedCard(cards[prevIndex]);
    },
  });

  return (
    <div className="fixed-player-hand flex h-full flex-col" ref={handRef}>
      {/* Hand Header */}
      <div className="hand-header shrink-0 border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono tracking-wider text-foreground/90">
            YOUR HAND ({cards.length}/5)
          </h3>
          <div className="text-xs font-mono text-muted-foreground">
            IP: {currentIP}
          </div>
        </div>
      </div>

      {/* Cards Grid - 3 Column Layout with Scrolling */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="hand-cards-grid p-4">
          {cards.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 auto-rows-min">
              {cards.map((card) => {
                const isAffordable = canAffordCard(card);
                const isLoading = loadingCard === card.id;
                const isPlaying = playingCard === card.id;
                const isSelected = selectedCard === card.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (examinedCard?.id === card.id) {
                        setExaminedCard(null);
                      } else {
                        setExaminedCard(card);
                      }
                    }}
                    disabled={disabled || isLoading || isPlaying}
                    onPointerEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const cardWithPosition = {
                        ...card,
                        _hoverPosition: {
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        },
                      };
                      onCardHover?.(cardWithPosition);
                    }}
                    onPointerLeave={() => {
                      onCardHover?.(null);
                    }}
                    className={cn(
                      "group relative transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      {
                        "cursor-not-allowed opacity-50": !isAffordable && !disabled,
                        "animate-pulse": isLoading,
                        "scale-105 ring-2 ring-primary/60": isSelected,
                        "brightness-110 scale-110": isPlaying,
                      }
                    )}
                  >
                    <BaseCard
                      card={card}
                      size="handMini"
                      scaleOverride={0.68}
                      className={cn(
                        "pointer-events-none select-none transition-all duration-200",
                        {
                          "saturate-50": !isAffordable,
                          "drop-shadow-lg": isAffordable,
                        }
                      )}
                    />
                    
                    {/* Affordability Indicator */}
                    {!isAffordable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-red-400 rounded">
                        Need {card.cost} IP
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
              <div>
                <div className="text-lg mb-2">🃏</div>
                <div>No cards in hand</div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* End Turn Button - Sticky at bottom */}
      <div className="hand-footer shrink-0 border-t border-border/60 bg-muted/30 p-4">
        <Button
          onClick={onEndTurn}
          disabled={disabled}
          size="lg"
          className="w-full font-mono font-bold tracking-wider"
        >
          END TURN
        </Button>
      </div>

      {/* Card Detail Overlay */}
      {examinedCard && (
        <CardDetailOverlay
          card={examinedCard}
          onClose={() => setExaminedCard(null)}
          onPlayCard={() => handlePlayCard(examinedCard)}
          canAfford={canAffordCard(examinedCard)}
          disabled={disabled || loadingCard === examinedCard.id}
          swipeHandlers={swipeHandlers}
        />
      )}

      {/* Card Playing Overlay */}
      {playingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="animate-pulse text-center text-white">
            <div className="text-2xl font-bold mb-2">Playing Card...</div>
            <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}