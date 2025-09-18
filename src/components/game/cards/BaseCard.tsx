import type { ReactNode } from 'react';
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
import { CardFrame, type CardFrameSize } from '@/ui/CardFrame';

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

  return (
    <CardFrame size={size} className={frameClassName}>
      <div
        className={cn(
          'card-shell relative w-cardW h-cardH pt-card-surface shadow-tabloid rounded-tabloid border overflow-hidden pt-card-wrap',
          polaroidHover && 'group',
          className,
        )}
        style={{ borderColor: 'var(--pt-border)' }}
        data-testid="tabloid-card"
      >
        <div className="card-header px-3 pt-3 text-[color:var(--pt-ink)]">
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
            'card-art mt-3 mx-3 pt-polaroid transition-transform duration-200',
            polaroidHover && 'group-hover:-rotate-[0.75deg] group-hover:-translate-y-1',
          )}
        >
          <div className="aspect-[4/3] w-full overflow-hidden">
            <CardImage cardId={card.id} className="h-full w-full grayscale" />
          </div>
        </div>

        <div
          className="card-effects m-3 space-y-2 rounded border bg-black/80 p-3 text-sm leading-snug text-white"
          style={{ borderColor: 'var(--pt-border-soft)' }}
        >
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">{typeLabel}</div>
          <div className="font-semibold">{effectText}</div>
          {showCardText && <div className="text-xs leading-snug text-white/80">{card.text}</div>}
        </div>

        {flavor && (
          <div className="card-flavor mx-3 mb-3 text-[12px] italic text-[color:var(--pt-ink)] opacity-80">
            <span className="mr-1 font-mono not-italic uppercase tracking-wide opacity-70 text-[color:var(--pt-ink)]">
              CLASSIFIED INTELLIGENCE:
            </span>
            {flavor}
          </div>
        )}

        {!hideStamp && <div className="pt-stamp select-none">{stampText}</div>}
      </div>
      {overlay}
    </CardFrame>
  );
};

export default BaseCard;
