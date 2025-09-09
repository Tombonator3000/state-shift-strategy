import React from 'react';
import { GameCard } from '@/components/game/GameHand';

interface CardEffectTooltipProps {
  card: GameCard;
  faction: 'government' | 'truth';
}

export const getCardEffectDescription = (card: GameCard, faction: 'government' | 'truth'): string => {
  switch (card.type) {
    case 'MEDIA':
      if (faction === 'truth') {
        return 'Exposes lies and corruption. +12% Truth meter.';
      } else {
        return 'Spreads disinformation and propaganda. -10% Truth meter.';
      }
    case 'ZONE':
      return 'Adds +2 pressure to target state. States with pressure ≥ defense are captured and generate IP.';
    case 'ATTACK':
      return 'Deals 8-13 IP damage directly to enemy operations.';
    case 'DEFENSIVE':
      return 'Reduces pressure (-1) on your controlled states to prevent enemy capture.';
    default:
      return 'Special effect card with unique abilities.';
  }
};

const CardEffectTooltip: React.FC<CardEffectTooltipProps> = ({ card, faction }) => {
  const description = getCardEffectDescription(card, faction);
  
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