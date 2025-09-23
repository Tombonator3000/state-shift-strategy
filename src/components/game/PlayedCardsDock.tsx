import React from 'react';
import { cn } from '@/lib/utils';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import BaseCard from '@/components/game/cards/BaseCard';

const BASE_CARD_WIDTH = 320;
const DEFAULT_CARD_SCALE = 0.45; // boardMini scale
const BOARD_MINI_CARD_WIDTH = BASE_CARD_WIDTH * DEFAULT_CARD_SCALE;

interface PlayedCardsDockProps {
  playedCards: CardPlayRecord[];
  onInspectCard?: (card: GameCard) => void;
}

interface CardsInPlayCardProps {
  card: GameCard;
  onInspect?: (card: GameCard) => void;
}

const CardsInPlayCard = ({ card, onInspect }: CardsInPlayCardProps) => (
  <button
    type="button"
    onClick={() => onInspect?.(card)}
    className="group relative flex w-full items-center justify-center rounded-lg border border-transparent bg-transparent p-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-yellow-200 focus-visible:ring-yellow-400"
  >
    <span className="sr-only">View {card.name}</span>
    <BaseCard
      card={card}
      hideStamp
      polaroidHover={false}
      size="boardMini"
      className="pointer-events-none select-none transition-transform duration-200 group-hover:scale-[1.04]"
      scaleOverride={DEFAULT_CARD_SCALE}
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
  return (
    <section
      aria-label={ariaLabel}
      className={cn('rounded-md p-3 text-black', toneClass)}
    >
      <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-black/70">{title}</h4>
      {cards.length > 0 ? (
        <div
          className="grid items-start justify-items-center gap-2"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${BOARD_MINI_CARD_WIDTH}px, 1fr))`,
          }}
        >
          {cards.map((entry, index) => (
            <CardsInPlayCard
              key={`${entry.card.id}-${index}`}
              card={entry.card}
              onInspect={onInspectCard}
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
