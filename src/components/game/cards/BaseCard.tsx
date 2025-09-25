import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import CardImage from '@/components/game/CardImage';
import type { GameCard } from '@/rules/mvp';
import {
  formatEffect,
  getFlavorText,
  getRarityLabel,
  normalizeCardType,
  normalizeFaction,
} from '@/lib/cardUi';
import CardFrame from '@/ui/CardFrame';

export type CardFrameSize = 'modal' | 'boardMini' | 'handMini';

const SIZE_TO_SCALE: Record<CardFrameSize, number> = {
  modal: 1,
  boardMini: 0.56,
  handMini: 0.78,
};

interface BaseCardProps {
  card: GameCard;
  className?: string;
  stampText?: string;
  hideStamp?: boolean;
  polaroidHover?: boolean;
  size?: CardFrameSize;
  frameClassName?: string;
  overlay?: ReactNode;
}

export const BaseCard = ({
  card,
  className,
  stampText = 'CLASSIFIED',
  hideStamp = false,
  polaroidHover = false,
  size = 'modal',
  frameClassName,
  overlay,
}: BaseCardProps) => {
  const effectText = formatEffect(card);
  const flavor = getFlavorText(card);
  const rarityLabel = getRarityLabel(card.rarity);
  const typeLabel = normalizeCardType(card.type);
  const showCardText = card.text && card.text !== effectText;
  const factionLabel = normalizeFaction(card.faction) === 'government' ? 'GOVERNMENT FILE' : 'TRUTH DOSSIER';
  const deckLine = showCardText ? card.text! : effectText;
  const effectLines = effectText
    .split(' · ')
    .map(line => line.trim())
    .filter(Boolean);
  const effectItems = effectLines.length > 0 ? effectLines : [effectText];
  if (showCardText) {
    effectItems.push(card.text!);
  }
  const typeIcon = typeLabel === 'ATTACK' ? '⚡' : typeLabel === 'MEDIA' ? '🗞' : '📍';

  const wrapperStyle = { '--card-scale': String(SIZE_TO_SCALE[size]) } as CSSProperties;

  return (
    <div
      className={cn('card-frame-wrapper', polaroidHover && 'group', frameClassName, className)}
      style={wrapperStyle}
      data-testid="tabloid-card"
    >
      <CardFrame size={size}>
        <>
          <div className="card-header sg-card__header text-[color:var(--ink)]">
            <div className="sg-card__topline">
              <span className="sg-pill" data-card-type={typeLabel} tabIndex={0}>
                {typeLabel}
              </span>
              <span className="sg-sticker" data-rarity={rarityLabel}>
                {rarityLabel.toUpperCase()}
              </span>
              <span className="sg-ip" aria-label={`IP cost ${card.cost}`} tabIndex={0}>
                <span className="sg-ip__value">{card.cost}</span>
                <span className="sg-ip__label" aria-hidden>
                  IP
                </span>
              </span>
            </div>
            <div className="sg-card__kicker">{factionLabel}</div>
            <div className="sg-card__title">{card.name}</div>
            {deckLine && <div className="sg-card__deck">{deckLine}</div>}
          </div>

          <div
            className={cn(
              'card-art sg-card__art overflow-hidden transition-transform duration-200',
              polaroidHover && 'group-hover:-rotate-[0.75deg] group-hover:-translate-y-1',
            )}
          >
            <div className="aspect-[4/3] w-full sg-card__photo-frame">
              <CardImage cardId={card.id} className="sg-card__photo" />
            </div>
            <div className="sg-card__caption">AP WIRE — {card.name}</div>
          </div>

          <div className="card-effects sg-effect">
            <div className="sg-effect__title">{typeLabel}</div>
            <ul className="sg-effect__text" aria-label={`${typeLabel} effect`}>
              {effectItems.map((line, index) => (
                <li key={`${index}-${line}`} className="sg-effect__item">
                  {index === 0 && (
                    <span aria-hidden className="sg-effect__icon">
                      {typeIcon}
                    </span>
                  )}
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {flavor && (
            <div className="card-flavor sg-card__footer text-[12px]">
              <span className="sg-card__footer-label">CLASSIFIED INTELLIGENCE:</span>
              <span className="sg-card__footer-text">{flavor}</span>
            </div>
          )}

          {!hideStamp && <div className="sg-stamp select-none">{stampText}</div>}
        </>
      </CardFrame>
      {overlay ? <div className="card-frame-overlay">{overlay}</div> : null}
    </div>
  );
};

export default BaseCard;
