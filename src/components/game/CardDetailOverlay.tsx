import React from 'react';
import type { GameCard } from '@/types/cardTypes';
import CardBase from './CardBase';
import CardImage from './CardImage';

interface CardDetailOverlayProps {
  card: GameCard | null;
  canAfford: boolean;
  disabled: boolean;
  onClose: () => void;
  onPlayCard: () => void;
  swipeHandlers?: any;
  mode?: 'play' | 'inspect';
}

const CardDetailOverlay: React.FC<CardDetailOverlayProps> = ({
  card,
  canAfford,
  disabled,
  onClose,
  onPlayCard,
  swipeHandlers,
  mode = 'play'
}) => {
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 grid place-items-center p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      {...swipeHandlers}
    >
      <div
        className="w-[min(80vw,820px)] md:w-[min(86vw,640px)] sm:w-[min(92vw,420px)]"
        style={{ aspectRatio: '63 / 88' }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardBase
          name={card.name}
          cost={card.cost}
          rarity={card.rarity ?? 'common'}
          type={card.type}
          className="h-full"
        >
          <div className="p-2 flex-1 overflow-y-auto flex flex-col">
            <CardImage cardId={card.id} className="w-full h-48 object-cover mb-2" />
            {card.text && <div className="card-effect mb-2">{card.text}</div>}
            {card.flavorTruth && (
              <div className="card-flavor">“{card.flavorTruth}”</div>
            )}
          </div>
          {mode !== 'inspect' && (
            <div className="p-2">
              <button
                onClick={onPlayCard}
                disabled={!canAfford || disabled}
                className="w-full bg-cost-red text-white py-1 rounded font-headline disabled:opacity-50"
              >
                Play Card
              </button>
            </div>
          )}
        </CardBase>
      </div>
    </div>
  );
};

export default CardDetailOverlay;
