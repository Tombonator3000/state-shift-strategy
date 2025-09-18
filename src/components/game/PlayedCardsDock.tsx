import React from 'react';
import type { GameCard } from '@/rules/mvp';
import { CardTextGenerator } from '@/systems/CardTextGenerator';
import { ExtensionCardBadge } from '@/components/game/ExtensionCardBadge';

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
}

interface PlayedCardsDockProps {
  playedCards: PlayedCard[];
}

const summarizeCard = (card: GameCard): string[] => {
  if (card.effects) {
    const summary = CardTextGenerator.renderEffects(card.effects);
    if (summary.length > 0) {
      return summary;
    }
    return [CardTextGenerator.generateRulesText(card.effects)];
  }

  if (card.text) {
    return card.text.split('\n');
  }

  return [];
};

const PlayedCardTile = ({ card }: { card: GameCard }) => {
  const displayType = (card.type || 'MEDIA').toString().toUpperCase();
  const rarityLabel = (card.rarity || 'common').toUpperCase();
  const flavorText = card.flavor ?? card.flavorTruth ?? card.flavorGov ?? '';
  const details = summarizeCard(card);

  return (
    <div className="relative flex h-full flex-col rounded-lg border border-neutral-700 bg-neutral-900 p-2 text-white shadow-sm">
      <div className="text-[11px] font-bold leading-tight line-clamp-2 pr-6">{card.name}</div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] uppercase tracking-wide opacity-70">
        <span className="truncate">{displayType} · {rarityLabel}</span>
        <span>IP {card.cost}</span>
      </div>
      <div className="mt-1 space-y-1 text-[10px] leading-snug">
        {(details.length > 0 ? details.slice(0, 3) : ['No effect data']).map((line, index) => (
          <p key={`${card.id}-detail-${index}`}>{line}</p>
        ))}
      </div>
      {flavorText && (
        <div className="mt-auto pt-1 text-[10px] italic opacity-70 line-clamp-2">
          “{flavorText}”
        </div>
      )}
      <ExtensionCardBadge cardId={card.id} card={card} variant="overlay" />
    </div>
  );
};

interface SectionProps {
  title: string;
  toneClass: string;
  cards: PlayedCard[];
  emptyMessage: string;
  ariaLabel: string;
}

const PlayedCardsSection: React.FC<SectionProps> = ({ title, toneClass, cards, emptyMessage, ariaLabel }) => {
  return (
    <section
      aria-label={ariaLabel}
      className={`rounded-md border border-black/10 p-3 text-black ${toneClass}`}
    >
      <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[0.2em] text-black/70">{title}</h4>
      {cards.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cards.map((entry, index) => (
            <PlayedCardTile key={`${entry.card.id}-${index}`} card={entry.card} />
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

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards }) => {
  const humanCards = playedCards.filter(card => card.player === 'human');
  const aiCards = playedCards.filter(card => card.player === 'ai');

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-newspaper-border/60 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-newspaper-text">
          CARDS IN PLAY THIS ROUND
        </h3>
      </header>
      <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2">
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
