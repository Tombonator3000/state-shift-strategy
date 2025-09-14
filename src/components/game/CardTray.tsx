import React from 'react';
import type { GameCard } from '@/types/cardTypes';
import CardBase from './CardBase';
import CardImage from './CardImage';

const CardTray: React.FC<{ card: GameCard }> = ({ card }) => {
  return (
    <CardBase
      name={card.name}
      cost={card.cost}
      rarity={card.rarity ?? 'common'}
      type={card.type}
    >
      <div className="p-2 flex flex-col">
        <CardImage cardId={card.id} className="w-full h-24 object-cover mb-2" />
        {card.text && (
          <div className="card-effect">
            {card.text.length > 60 ? `${card.text.slice(0, 60)}...` : card.text}
          </div>
        )}
        {card.flavorTruth && (
          <div className="card-flavor">“{card.flavorTruth}”</div>
        )}
      </div>
    </CardBase>
  );
};

export default CardTray;
