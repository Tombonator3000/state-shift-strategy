import React from 'react';
import { cn } from '@/lib/utils';
import type { GameCard } from '@/rules/mvp';
import BaseCard from '@/components/game/cards/BaseCard';

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
  targetState?: string | null;
  truthDelta?: number;
  capturedStates?: string[];
}

interface PlayedCardsDockProps {
  playedCards: PlayedCard[];
}

const CardsInPlayCard = ({ card }: { card: GameCard }) => (
  <BaseCard
    card={card}
    hideStamp
    polaroidHover={false}
    size="boardMini"
    className="pointer-events-none select-none"
  />
);

interface SectionProps {
  title: string;
  toneClass: string;
  cards: PlayedCard[];
  emptyMessage: string;
  ariaLabel: string;
}

const PlayedCardsSection: React.FC<SectionProps> = ({ title, toneClass, cards, emptyMessage, ariaLabel }) => (
  <section
    aria-label={ariaLabel}
    className={cn('rounded-md p-3 text-black', toneClass)}
  >
    <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-black/70">{title}</h4>
    {cards.length > 0 ? (
      <div className="grid grid-cols-3 gap-2 place-items-start">
        {cards.map((entry, index) => (
          <CardsInPlayCard key={`${entry.card.id}-${index}`} card={entry.card} />
        ))}
      </div>
    ) : (
      <div className="grid min-h-[120px] place-items-center rounded border border-dashed border-black/20 bg-white/40 p-4 text-center text-[11px] font-mono uppercase tracking-wide text-black/50">
        {emptyMessage}
      </div>
    )}
  </section>
);

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards }) => {
  const humanCards = playedCards.filter(card => card.player === 'human');
  const aiCards = playedCards.filter(card => card.player === 'ai');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-black/10 px-3 py-2 text-sm font-extrabold tracking-wide text-newspaper-text">
        CARDS IN PLAY THIS ROUND
      </header>
      <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2">
        <PlayedCardsSection
          title="OPPONENT"
          ariaLabel="Opponent Cards"
          cards={aiCards}
          emptyMessage="Opponent has no cards in play."
          toneClass="bg-[image:var(--halftone-red)] bg-[length:8px_8px] bg-repeat bg-red-50/40"
        />
        <PlayedCardsSection
          title="YOU"
          ariaLabel="Your Cards"
          cards={humanCards}
          emptyMessage="No cards deployed this turn."
          toneClass="bg-[image:var(--halftone-blue)] bg-[length:8px_8px] bg-repeat bg-blue-50/40"
        />
      </div>
    </div>
  );
};

export default PlayedCardsDock;
