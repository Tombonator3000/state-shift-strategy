import React from 'react';
import type { GameCard } from '@/types/cardTypes';
import { CardTextGenerator } from '@/systems/CardTextGenerator';

interface CardEffectTooltipProps {
  card: GameCard;
}

export const getCardEffectDescription = (card: GameCard): string => {
  // Use the card's effects to generate description, fallback to card text
  if (card.effects && Object.keys(card.effects).length > 0) {
    return CardTextGenerator.generateRulesText(card.effects);
  }
  return card.text || 'Special effect card with unique abilities.';
};

const CardEffectTooltip: React.FC<CardEffectTooltipProps> = ({ card }) => {
  const description = getCardEffectDescription(card);
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
      <div className="font-bold text-sm mb-2">{card.name}</div>
      <div className="text-xs text-muted-foreground mb-2">{description}</div>
      <div className="text-xs font-mono">
        Cost: {card.cost} IP
        {card.type === 'ZONE' && (
          <div className="mt-1 text-yellow-600 dark:text-yellow-400">
            ⚠️ Requires target selection
          </div>
        )}
      </div>
    </div>
  );
};

export default CardEffectTooltip;