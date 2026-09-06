import React, { useState, useRef, useMemo } from 'react';
import clsx from 'clsx';
import CardDetailOverlay from './CardDetailOverlay';
import BaseCard from '@/components/game/cards/BaseCard';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES } from '@/rules/mvp';
import { useAudioContext } from '@/contexts/AudioContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExtensionCardBadge } from './ExtensionCardBadge';
import { getArticleForCard } from '@/data/cardArticles/articleDatabase';

interface EnhancedGameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void | Promise<void>;
  disabled?: boolean;
  selectedCard?: string | null;
  onSelectCard?: (cardId: string) => void;
  currentIP: number;
  loadingCard?: string | null;
  onCardHover?: (card: (GameCard & { _hoverPosition?: { x: number; y: number } }) | null) => void;
  discardQueue?: string[];
  onToggleDiscard?: (cardId: string) => void;
  discardEnabled?: boolean;
  onCardDragStart?: (card: GameCard, position: { x: number; y: number; pointerType: string }) => void;
  onCardDragMove?: (card: GameCard, position: { x: number; y: number; pointerType: string }) => void;
  onCardDragEnd?: (
    card: GameCard,
    position: { x: number; y: number; pointerType: string; cancelled: boolean }
  ) => void;
  draggingCardId?: string | null;
  onPreviewArticle?: (card: GameCard) => void;
  isArticlePreviewOpen?: boolean;
}

const EnhancedGameHand: React.FC<EnhancedGameHandProps> = ({
  cards,
  onPlayCard,
  disabled,
  selectedCard,
  onSelectCard,
  currentIP,
  loadingCard,
  onCardHover,
  discardQueue = [],
  onToggleDiscard,
  discardEnabled = true,
  onCardDragStart,
  onCardDragMove,
  onCardDragEnd,
  draggingCardId,
  onPreviewArticle,
  isArticlePreviewOpen = false,
}) => {
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const [examinedCard, setExaminedCard] = useState<string | null>(null);
  const audio = useAudioContext();
  const { triggerHaptic } = useHapticFeedback();
  const isMobile = useIsMobile();
  const handRef = useRef<HTMLDivElement>(null);
  const articlePreviewLockedRef = useRef(isArticlePreviewOpen);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    card: GameCard;
    hasDragged: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const discardQueueSet = useMemo(() => new Set(discardQueue), [discardQueue]);
  const examinedCardData = examinedCard ? cards.find(c => c.id === examinedCard) ?? null : null;
  const examinedIsQueued = examinedCard ? discardQueueSet.has(examinedCard) : false;

  articlePreviewLockedRef.current = isArticlePreviewOpen;

  const clearHover = () => {
    if (articlePreviewLockedRef.current) {
      return;
    }
    onCardHover?.(null);
  };

  const normalizeCardType = (type: string): MVPCardType => {
    return MVP_CARD_TYPES.includes(type as MVPCardType) ? type as MVPCardType : 'MEDIA';
  };

  const handlePlayCard = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || disabled || playingCard || loadingCard) return;
    
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
      await onPlayCard(cardId);
      triggerHaptic('success');
    } catch {
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

  const handleCardPointerDown = (event: React.PointerEvent<HTMLButtonElement>, card: GameCard) => {
    // Touch scrolls the hand; tap a card to inspect and choose its target.
    if (disabled || event.pointerType === 'touch') return;
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      card,
      hasDragged: false,
    };
    suppressClickRef.current = false;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture failures (older browsers)
    }
  };

  const handleCardPointerMove = (event: React.PointerEvent<HTMLButtonElement>, card: GameCard) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const distance = Math.hypot(dx, dy);

    if (!dragState.hasDragged && distance > 8) {
      dragState.hasDragged = true;
      suppressClickRef.current = true;
      if (examinedCard === card.id) {
        setExaminedCard(null);
      }
      clearHover();
      onSelectCard?.(card.id);
      triggerHaptic('light');
      onCardDragStart?.(card, { x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    } else if (dragState.hasDragged) {
      event.preventDefault();
      onCardDragMove?.(card, { x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    }
  };

  const finalizeCardDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    card: GameCard,
    cancelled: boolean
  ) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore release failures
    }

    if (dragState.hasDragged) {
      event.preventDefault();
      onCardDragEnd?.(card, {
        x: event.clientX,
        y: event.clientY,
        pointerType: event.pointerType,
        cancelled,
      });
    }

    dragStateRef.current = null;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  // Only horizontal swipes change cards; vertical gestures scroll the dossier.
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: () => {
      if (examinedCard) {
        const currentIndex = cards.findIndex(c => c.id === examinedCard);
        if (currentIndex < 0 || cards.length < 2) return;
        const nextIndex = (currentIndex + 1) % cards.length;
        setExaminedCard(cards[nextIndex].id);
        triggerHaptic('selection');
      }
    },
    onSwipeRight: () => {
      if (examinedCard) {
        const currentIndex = cards.findIndex(c => c.id === examinedCard);
        if (currentIndex < 0 || cards.length < 2) return;
        const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
        setExaminedCard(cards[prevIndex].id);
        triggerHaptic('selection');
      }
    }
  });

  return (
    <div
      className="relative h-full"
      ref={handRef}
      onPointerLeave={clearHover}
    >
      {playingCard && (
        <div role="status" className="mb-3 flex items-center gap-2 rounded border border-white/30 bg-black/30 p-3 text-sm text-white">
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          Deploying asset…
        </div>
      )}
      <div className="newsroom-hand-grid w-full">
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
            const isQueuedForDiscard = discardQueueSet.has(card.id);
            const discardToggleDisabled = !discardEnabled || !onToggleDiscard || Boolean(loadingCard || playingCard);

            const overlay = (
              <>
                {(isLoading || isPlaying || isSelected) && (
                  <div
                    className={clsx(
                      'pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm',
                      isSelected && !isPlaying && !isLoading && 'bg-yellow-400/15 text-yellow-100',
                      isQueuedForDiscard && !isPlaying && !isLoading && !isSelected && 'bg-orange-500/15 text-orange-100'
                    )}
                    style={{ borderRadius: 'calc(var(--pt-radius) * var(--card-scale))' }}
                  >
                    <Loader2
                      className={clsx(
                        'mb-1 h-5 w-5',
                        isSelected
                          ? 'animate-pulse text-yellow-200'
                          : isQueuedForDiscard
                            ? 'animate-pulse text-orange-300'
                            : 'animate-spin text-primary'
                      )}
                    />
                    <span className="text-xs font-mono font-bold">
                      {isPlaying
                        ? 'DEPLOYING'
                        : isSelected && displayType === 'ZONE'
                          ? 'TARGETING'
                          : isQueuedForDiscard
                            ? 'QUEUED'
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

                {isQueuedForDiscard && !isSelected && !isPlaying && !isLoading && (
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-[calc(var(--pt-radius) * var(--card-scale))] border-2 border-orange-400/80" />
                )}

                {isQueuedForDiscard && (
                  <div className="absolute -top-1 -left-1 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[0.6rem] font-bold text-black shadow-lg">
                    <Trash2 className="h-3 w-3" />
                    <span>QUEUED</span>
                  </div>
                )}

                <div className="pointer-events-none">
                  <ExtensionCardBadge cardId={card.id} card={card} variant="overlay" />
                </div>
              </>
            );

            const isDraggingThisCard = draggingCardId === card.id;

            return (
              <div className="newsroom-card-slot relative" key={`${card.id}-${index}`}>
              <button
                type="button"
                aria-label={`Inspect ${card.name}, ${card.cost} IP`}
                className={clsx(
                  'newsroom-card-wrapper card-entrance group/card relative flex w-full items-start justify-center bg-transparent p-0 text-left transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 touch-auto',
                  !canAfford && !disabled && 'cursor-not-allowed opacity-60 saturate-50',
                  disabled && 'cursor-default'
                )}
                style={{
                  animationDelay: `${index * 0.03}s`,
                  touchAction: isDraggingThisCard ? 'none' : undefined,
                  WebkitTouchCallout: 'none',
                }}
                data-card-id={card.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  audio.playSFX('click');
                  triggerHaptic('selection');
                  setExaminedCard(prev => (prev === card.id ? null : card.id));
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                }}
                onPointerDown={(event) => handleCardPointerDown(event, card)}
                onPointerMove={(event) => handleCardPointerMove(event, card)}
                onPointerUp={(event) => finalizeCardDrag(event, card, false)}
                onPointerCancel={(event) => finalizeCardDrag(event, card, true)}
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
                  if (articlePreviewLockedRef.current) {
                    return;
                  }
                  onCardHover?.({
                    ...card,
                    _hoverPosition: { x: left, y: top }
                  });
                }}
                onPointerLeave={clearHover}
                aria-grabbed={isDraggingThisCard}
              >
                <BaseCard
                  card={card}
                  hideStamp
                  polaroidHover={false}
                  size="deskMini"
                  className="pointer-events-none select-none"
                  frameClassName={clsx(
                    'drop-shadow-[0_12px_22px_rgba(0,0,0,0.32)] transition-transform duration-200',
                    !disabled && canAfford && 'group-hover/card:-translate-y-1 group-hover/card:drop-shadow-[0_22px_30px_rgba(0,0,0,0.35)]',
                    (isPlaying || isLoading) && 'ring-2 ring-primary shadow-primary/40',
                    isSelected && 'ring-2 ring-yellow-400 shadow-yellow-400/40',
                    isQueuedForDiscard && !(isPlaying || isLoading) && !isSelected && 'ring-2 ring-orange-400 shadow-orange-400/40',
                    draggingCardId === card.id && 'scale-[0.97] opacity-80'
                  )}
                  overlay={overlay}
                />
              </button>
              <div className="mt-3 flex items-start justify-between gap-2">
                <p className="newsroom-card-caption text-sm font-semibold leading-snug text-white">{card.name}</p>
                <span className="shrink-0 text-sm font-bold text-amber-200">{card.cost} IP</span>
              </div>
                {onToggleDiscard && (
                  <button
                    type="button"
                    disabled={discardToggleDisabled}
                    aria-pressed={isQueuedForDiscard}
                    aria-label={isQueuedForDiscard ? 'Remove from discard queue' : 'Queue card for discard'}
                    className={clsx(
                      'mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded border border-white/30 bg-black/40 px-3 py-2 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
                      discardToggleDisabled && 'cursor-not-allowed opacity-40',
                      !discardToggleDisabled && 'cursor-pointer hover:bg-orange-400 hover:text-black'
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (discardToggleDisabled) {
                        return;
                      }
                      audio.playSFX('click');
                      triggerHaptic(isQueuedForDiscard ? 'light' : 'selection');
                      onToggleDiscard(card.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    {isQueuedForDiscard ? 'Undo discard' : 'Discard at turn end'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Card Detail Overlay - Redesigned */}
      {examinedCard && (
        <CardDetailOverlay
          card={examinedCardData}
          canAfford={examinedCardData ? canAffordCard(examinedCardData) : false}
          disabled={disabled}
          onClose={() => {
            setExaminedCard(null);
            triggerHaptic('light');
          }}
          onPlayCard={() => {
            const card = examinedCardData;
            if (!card || disabled || playingCard || loadingCard) return;

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
              audio.playSFX('click');
              triggerHaptic('medium');
              setExaminedCard(null);
              onSelectCard?.(card.id);

            } else {
              // For all other cards, deploy immediately
              audio.playSFX('click');
              triggerHaptic('success');
              setExaminedCard(null);
              handlePlayCard(card.id);
            }
          }}
          isDiscardQueued={examinedIsQueued}
          onToggleDiscard={() => {
            if (!onToggleDiscard || !examinedCardData || !discardEnabled || loadingCard || playingCard) {
              return;
            }
            audio.playSFX('click');
            triggerHaptic(examinedIsQueued ? 'light' : 'selection');
            onToggleDiscard(examinedCardData.id);
          }}
          discardEnabled={discardEnabled && !loadingCard && !playingCard}
          swipeHandlers={isMobile ? swipeHandlers : undefined}
          articleAvailable={Boolean(examinedCardData && getArticleForCard(examinedCardData.id))}
          onRequestArticle={() => {
            if (!examinedCardData) {
              return;
            }
            triggerHaptic('selection');
            audio.playSFX('lightClick');
            onPreviewArticle?.(examinedCardData);
            setExaminedCard(null);
          }}
        />
      )}

    </div>
  );
};

export default EnhancedGameHand;
