import React from 'react';
import { cn } from '@/lib/utils';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import BaseCard from '@/components/game/cards/BaseCard';

interface PlayedCardsDockProps {
  playedCards: CardPlayRecord[];
  onInspectCard?: (card: GameCard) => void;
}

const CardsInPlayCard = ({ card, onInspect }: { card: GameCard; onInspect?: (card: GameCard) => void }) => (
  <button
    type="button"
    onClick={() => onInspect?.(card)}
    className="group relative flex w-full items-center justify-center rounded-lg border border-transparent bg-transparent p-0 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-yellow-200 focus-visible:ring-yellow-400"
    data-played-card
    data-played-card-id={card.id}
  >
    <span className="sr-only">View {card.name}</span>
    <BaseCard
      card={card}
      hideStamp
      polaroidHover={false}
      size="boardMini"
      className="pointer-events-none select-none transition-transform duration-200 group-hover:scale-[1.04]"
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
  containerId?: string;
}

const PlayedCardsSection: React.FC<SectionProps> = ({
  title,
  toneClass,
  cards,
  emptyMessage,
  ariaLabel,
  onInspectCard,
  containerId
}) => (
  <section
    aria-label={ariaLabel}
    className={cn('rounded-md p-3 text-black', toneClass)}
  >
    <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-black/70">{title}</h4>
    <div
      id={containerId}
      className={cn(
        'relative min-h-[120px] w-full',
        cards.length > 0 ? 'grid grid-cols-3 place-items-start gap-2' : 'flex'
      )}
    >
      {cards.length > 0 ? (
        cards.map((entry, index) => (
          <CardsInPlayCard
            key={`${entry.card.id}-${index}`}
            card={entry.card}
            onInspect={onInspectCard}
          />
        ))
      ) : (
        <div className="grid min-h-[120px] w-full place-items-center rounded border border-dashed border-black/20 bg-white/40 p-4 text-center text-[11px] font-mono uppercase tracking-wide text-black/50">
          {emptyMessage}
        </div>
      )}
    </div>
  </section>
);

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards, onInspectCard }) => {
  const humanCards = playedCards.filter(card => card.player === 'human');
  const aiCards = playedCards.filter(card => card.player === 'ai');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-black/20 bg-newspaper-bg bg-[image:var(--halftone-red)] bg-[length:6px_6px] bg-repeat px-3 py-2 text-[0.7rem] font-black uppercase tracking-[0.5em] text-newspaper-text shadow-[0_2px_0_rgba(0,0,0,0.25)]">
        FRONT PAGE LAYOUT
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
          containerId="played-pile"
        />
      </div>
    </div>
  );
};

export default PlayedCardsDock;
