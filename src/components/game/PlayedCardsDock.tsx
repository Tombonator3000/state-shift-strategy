import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import BaseCard from '@/components/game/cards/BaseCard';

const BASE_CARD_WIDTH = 320;
const DEFAULT_CARD_SCALE = 0.45; // boardMini scale
const CARD_BASE_HEIGHT = 460;
const GRID_GAP = 12; // Tailwind gap-3

interface PlayedCardsDockProps {
  playedCards: CardPlayRecord[];
  onInspectCard?: (card: GameCard) => void;
}

interface CardsInPlayCardProps {
  card: GameCard;
  onInspect?: (card: GameCard) => void;
  scale: number;
}

const CardsInPlayCard = ({ card, onInspect, scale }: CardsInPlayCardProps) => (
  <button
    type="button"
    onClick={() => onInspect?.(card)}
    className="group relative flex w-full items-center justify-center p-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-newspaper-text"
  >
    <span className="sr-only">View {card.name}</span>
    <BaseCard
      card={card}
      hideStamp
      polaroidHover={false}
      size="boardMini"
      className="pointer-events-none select-none transition-transform duration-200 group-hover:scale-[1.04]"
      frameClassName="shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
      scaleOverride={scale}
    />
  </button>
);

interface SectionProps {
  title: string;
  toneClass: string;
  cards: CardPlayRecord[];
  emptyMessage: string;
  ariaLabel: string;
  onInspectCard?: (card: GameCard) => void;
}

const PlayedCardsSection: React.FC<SectionProps> = ({ title, toneClass, cards, emptyMessage, ariaLabel, onInspectCard }) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const node = gridContainerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setContainerSize((prev) => {
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const layout = useMemo(() => {
    const cardCount = cards.length;
    const { width, height } = containerSize;

    if (cardCount === 0) {
      return {
        scale: DEFAULT_CARD_SCALE,
        columns: 1,
      };
    }

    if (width <= 0 || height <= 0) {
      return {
        scale: DEFAULT_CARD_SCALE,
        columns: Math.min(cardCount, 2) || 1,
      };
    }

    let bestScale = 0;
    let bestColumns = 1;

    for (let columns = 1; columns <= cardCount; columns += 1) {
      const rows = Math.ceil(cardCount / columns);
      const horizontalGap = (columns - 1) * GRID_GAP;
      const verticalGap = (rows - 1) * GRID_GAP;

      const widthScale = (width - horizontalGap) / (columns * BASE_CARD_WIDTH);
      const heightScale = (height - verticalGap) / (rows * CARD_BASE_HEIGHT);
      const candidateScale = Math.min(DEFAULT_CARD_SCALE, widthScale, heightScale);

      if (
        candidateScale > bestScale + 0.0001 ||
        (Math.abs(candidateScale - bestScale) <= 0.0001 && columns > bestColumns)
      ) {
        bestScale = candidateScale;
        bestColumns = columns;
      }
    }

    if (bestScale <= 0) {
      return {
        scale: Math.max(0.25, Math.min(DEFAULT_CARD_SCALE, width / BASE_CARD_WIDTH)),
        columns: Math.min(cardCount, 2) || 1,
      };
    }

    return {
      scale: bestScale,
      columns: bestColumns,
    };
  }, [cards.length, containerSize]);

  const cardScale = layout.scale;
  const cardWidth = BASE_CARD_WIDTH * cardScale;
  const cardHeight = CARD_BASE_HEIGHT * cardScale;
  const gridColumns = Math.max(1, layout.columns);

  const gridStyle = useMemo(() => ({
    '--played-card-scale': `${cardScale}`,
    '--played-card-width': `${cardWidth}px`,
    '--played-card-height': `${cardHeight}px`,
    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, var(--played-card-width)))`,
    gridAutoRows: 'var(--played-card-height)',
  }) as CSSProperties, [cardScale, cardWidth, cardHeight, gridColumns]);

  const emptyStateStyle = useMemo(() => ({
    minHeight: `${Math.max(120, Math.round(cardHeight))}px`,
  }) as CSSProperties, [cardHeight]);

  return (
    <section
      aria-label={ariaLabel}
      className={cn('flex h-full min-h-0 flex-col rounded-md p-3 text-black', toneClass)}
    >
      <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-black/70">{title}</h4>
      <div ref={gridContainerRef} className="flex-1">
        {cards.length > 0 ? (
          <div
            className="grid h-full w-full items-start justify-items-center gap-3"
            style={gridStyle}
          >
            {cards.map((entry, index) => (
              <CardsInPlayCard
                key={`${entry.card.id}-${index}`}
                card={entry.card}
                onInspect={onInspectCard}
                scale={cardScale}
              />
            ))}
          </div>
        ) : (
          <div
            className="grid place-items-center rounded border border-dashed border-black/20 bg-white/40 p-4 text-center text-[11px] font-mono uppercase tracking-wide text-black/50"
            style={emptyStateStyle}
          >
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
};

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards, onInspectCard }) => {
  const humanCards = playedCards.filter(card => card.player === 'human');
  const aiCards = playedCards.filter(card => card.player === 'ai');

  return (
    <div className="flex h-full min-h-[220px] max-h-full flex-col overflow-hidden">
      <header className="border-b border-newspaper-border/60 bg-newspaper-text px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.35em] text-newspaper-bg">
        CARDS IN PLAY THIS ROUND
      </header>
      <div className="flex-1 overflow-y-auto p-2">
        <div
          className="grid h-full grid-cols-1 gap-2 lg:grid-cols-2"
          style={{ gridAutoRows: 'minmax(0, 1fr)' } as CSSProperties}
        >
          <PlayedCardsSection
            title="OPPONENT"
            ariaLabel="Opponent Cards"
            cards={aiCards}
            emptyMessage="Opponent has no cards in play."
            toneClass="bg-[image:var(--halftone-red)] bg-[length:8px_8px] bg-repeat bg-red-50/40"
            onInspectCard={onInspectCard}
          />
          <PlayedCardsSection
            title="YOU"
            ariaLabel="Your Cards"
            cards={humanCards}
            emptyMessage="No cards deployed this turn."
            toneClass="bg-[image:var(--halftone-blue)] bg-[length:8px_8px] bg-repeat bg-blue-50/40"
            onInspectCard={onInspectCard}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayedCardsDock;
