import React from 'react';
import type { GameCard } from '@/types/cardTypes';
import CardBase from './CardBase';

const CardMinimized: React.FC<{ card: GameCard }> = ({ card }) => {
  return (
    <CardBase
      name={card.name}
      cost={card.cost}
      rarity={card.rarity ?? 'common'}
      type={card.type}
      showFooter={false}
      showRarityLabel
      className="w-24"
    />
  );
};

export default CardMinimized;
