import React from 'react';
import { cn } from '@/lib/utils';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import BaseCard from '@/components/game/cards/BaseCard';

const BOARD_MINI_CARD_WIDTH = 160; // 320px base width * 0.5 boardMini scale
const BASE_CARD_WIDTH = 320;
const GRID_GAP_PX = 8; // Tailwind gap-2 spacing
const DEFAULT_CARD_SCALE = BOARD_MINI_CARD_WIDTH / BASE_CARD_WIDTH;

interface PlayedCardsDockProps {
  playedCards: CardPlayRecord[];
  onInspectCard?: (card: GameCard) => void;
}

interface CardsInPlayCardProps {
  card: GameCard;
  onInspect?: (card: GameCard) => void;
  cardWidth: number;
  cardScale: number;
}

const CardsInPlayCard = ({ card, onInspect, cardWidth, cardScale }: CardsInPlayCardProps) => (
  <button
    type="button"
    onClick={() => onInspect?.(card)}
    className="group relative flex items-center justify-center rounded-lg border border-transparent bg-transparent p-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-yellow-200 focus-visible:ring-yellow-400"
    style={{ width: cardWidth }}
  >
    <span className="sr-only">View {card.name}</span>
    <BaseCard
      card={card}
      hideStamp
      polaroidHover={false}
      size="boardMini"
      className="pointer-events-none select-none transition-transform duration-200 group-hover:scale-[1.04]"
      scaleOverride={cardScale}
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
  const [gridNode, setGridNode] = React.useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    if (!gridNode) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = gridNode.getBoundingClientRect().width;
      setContainerWidth(prev => (prev !== nextWidth ? nextWidth : prev));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updateWidth);
        return () => {
          window.removeEventListener('resize', updateWidth);
        };
      }

      return;
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const nextWidth = entry.contentRect.width;
        setContainerWidth(prev => (prev !== nextWidth ? nextWidth : prev));
      }
    });

    observer.observe(gridNode);

    return () => {
      observer.disconnect();
    };
  }, [gridNode]);

  const layout = React.useMemo(() => {
    if (containerWidth <= 0) {
      const cardWidth = BASE_CARD_WIDTH * DEFAULT_CARD_SCALE;
      return {
        columnCount: 1,
        cardWidth,
        cardScale: DEFAULT_CARD_SCALE,
      };
    }

    const maxColumns = Math.max(
      1,
      Math.floor((containerWidth + GRID_GAP_PX) / (BOARD_MINI_CARD_WIDTH + GRID_GAP_PX)),
    );
    const columnCount = Math.min(maxColumns, Math.max(cards.length, 1));
    const totalGapWidth = GRID_GAP_PX * (columnCount - 1);
    const availableForColumns = Math.max(containerWidth - totalGapWidth, 0);
    const rawColumnWidth = availableForColumns / columnCount;
    const safeColumnWidth = Math.max(rawColumnWidth, 0);
    const cardScale = Math.min(safeColumnWidth / BASE_CARD_WIDTH, 1);
    const finalScale = cardScale > 0 ? cardScale : DEFAULT_CARD_SCALE;
    const cardWidth = Math.max(BASE_CARD_WIDTH * finalScale, 0);

    return {
      columnCount,
      cardWidth,
      cardScale: finalScale,
    };
  }, [cards.length, containerWidth]);

  return (
    <section
      aria-label={ariaLabel}
      className={cn('rounded-md p-3 text-black', toneClass)}
    >
      <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-black/70">{title}</h4>
      {cards.length > 0 ? (
        <div
          ref={setGridNode}
          className="grid items-start justify-center justify-items-center gap-2"
          style={{ gridTemplateColumns: `repeat(${layout.columnCount}, ${layout.cardWidth}px)` }}
        >
          {cards.map((entry, index) => (
            <CardsInPlayCard
              key={`${entry.card.id}-${index}`}
              card={entry.card}
              onInspect={onInspectCard}
              cardWidth={layout.cardWidth}
              cardScale={layout.cardScale}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[120px] place-items-center rounded border border-dashed border-black/20 bg-white/40 p-4 text-center text-[11px] font-mono uppercase tracking-wide text-black/50">
          {emptyMessage}
        </div>
      )}
    </section>
  );
};

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards, onInspectCard }) => {
  const humanCards = playedCards.filter(card => card.player === 'human');
  const aiCards = playedCards.filter(card => card.player === 'ai');

  return (
    <div className="flex h-full min-h-[220px] flex-col">
      <header className="border-b border-newspaper-border/60 bg-newspaper-text px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.35em] text-newspaper-bg">
        CARDS IN PLAY THIS ROUND
      </header>
      <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2">
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
  );
};

export default PlayedCardsDock;
