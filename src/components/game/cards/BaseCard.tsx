import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import CardImage from '@/components/game/CardImage';
import type { GameCard } from '@/rules/mvp';
import {
  formatEffect,
  getFactionLabel,
  getFactionVar,
  getFlavorText,
  getRarityLabel,
  getRarityVar,
  normalizeCardType,
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
  const headerIcon = (() => {
    const extId = card.extId?.toLowerCase();
    if (!extId) return null;

    if (extId.includes('halloween')) {
      return { icon: '🎃', label: 'Halloween Event' } as const;
    }

    if (extId.includes('cryptid')) {
      return { icon: '🦎', label: 'Cryptid Event' } as const;
    }

    return null;
  })();
  const showCardText = card.text && card.text !== effectText;

  const wrapperStyle = { '--card-scale': String(SIZE_TO_SCALE[size]) } as CSSProperties;

  return (
    <div
      className={cn('card-frame-wrapper', polaroidHover && 'group', frameClassName, className)}
      style={wrapperStyle}
      data-testid="tabloid-card"
    >
      <CardFrame size={size}>
        <>
          <div className="card-header text-[color:var(--ink)]">
            <div className="text-3xl leading-none uppercase font-headline">
              {card.name}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="px-2 py-0.5 text-[11px] uppercase tracking-wide text-white rounded font-tabloid"
                style={{ background: getFactionVar(card.faction) }}
              >
                {getFactionLabel(card.faction)}
              </span>
              <span
                className="px-2 py-0.5 text-[11px] uppercase tracking-wide text-white rounded font-tabloid"
                style={{ background: getRarityVar(card.rarity) }}
              >
                {rarityLabel}
              </span>
              {headerIcon ? (
                <span
                  className="px-2 py-0.5 text-[11px] uppercase tracking-wide text-white rounded font-tabloid"
                  aria-label={headerIcon.label}
                  title={headerIcon.label}
                  style={{ background: 'var(--pt-ink)', color: 'var(--pt-paper)' }}
                >
                  {headerIcon.icon}
                </span>
              ) : null}
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: 'var(--pt-ink)', color: 'var(--pt-paper)' }}
              >
                IP {card.cost}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'card-art overflow-hidden transition-transform duration-200',
              polaroidHover && 'group-hover:-rotate-[0.75deg] group-hover:-translate-y-1',
            )}
          >
            <div className="aspect-[4/3] w-full">
              <CardImage cardId={card.id} className="h-full w-full grayscale" />
            </div>
          </div>

          <div className="card-effects space-y-2 text-sm leading-snug">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">{typeLabel}</div>
            <div className="font-semibold">{effectText}</div>
            {showCardText && <div className="text-xs leading-snug text-white/80">{card.text}</div>}
          </div>

          {flavor && (
            <div className="card-flavor text-[12px]">
              <span className="mr-1 font-mono not-italic uppercase tracking-wide opacity-70 text-[color:var(--ink)]">
                CLASSIFIED INTELLIGENCE:
              </span>
              {flavor}
            </div>
          )}

          {!hideStamp && <div className="pt-stamp select-none">{stampText}</div>}
        </>
      </CardFrame>
      {overlay ? <div className="card-frame-overlay">{overlay}</div> : null}
    </div>
  );
};

export default BaseCard;
