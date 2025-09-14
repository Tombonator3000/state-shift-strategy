import React from 'react';
import clsx from 'clsx';
import type { CardRarity } from '@/types/cardTypes';

interface CardBaseProps {
  name: string;
  cost: number;
  rarity?: CardRarity;
  type: string;
  className?: string;
  showFooter?: boolean;
  showRarityLabel?: boolean;
  children?: React.ReactNode;
}

const CardBase: React.FC<CardBaseProps> = ({
  name,
  cost,
  rarity = 'common',
  type,
  className,
  showFooter = true,
  showRarityLabel = false,
  children
}) => {
  return (
    <div className={clsx('card-base', `rarity-${rarity}`, className)}>
      <div className="card-banner">
        <span className="truncate">{name}</span>
        <div className="flex items-center gap-1">
          {showRarityLabel && <span className="rarity-label">{rarity}</span>}
          <span className="card-cost">{cost} IP</span>
        </div>
      </div>
      {children}
      {showFooter && (
        <div className="card-footer">
          <span>{type}</span>
        </div>
      )}
    </div>
  );
};

export default CardBase;
