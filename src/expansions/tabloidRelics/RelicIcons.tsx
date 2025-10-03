import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { RelicRarity } from './RelicTypes';

const createIcon = (path: JSX.Element, props?: { viewBox?: string }) => (
  <svg
    viewBox={props?.viewBox ?? '0 0 24 24'}
    role="img"
    focusable="false"
    aria-hidden="true"
    className="h-full w-full"
  >
    {path}
  </svg>
);

export const RELIC_ICONS: Record<RelicRarity, JSX.Element> = {
  common: createIcon(
    <path
      fill="currentColor"
      d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
    />,
  ),
  uncommon: createIcon(
    <path
      fill="currentColor"
      d="M12 2.5 9.6 9.12l-6.6.48 5.16 3.88L6.8 19.9 12 15.98l5.2 3.92-1.36-6.42 5.16-3.88-6.6-.48Z"
    />,
  ),
  rare: createIcon(
    <path
      fill="currentColor"
      d="M12 2 21 11.98 12 22 3 11.98 12 2Zm0 4.4-5.02 5.58L12 17.54l5.02-5.56L12 6.4Z"
    />,
  ),
  legendary: createIcon(
    <path
      fill="currentColor"
      d="M4.5 9.5 7 5l4.1 3.2L12 3l.9 5.2L17 5l2.5 4.5L22 7l-1.6 9.3c-.3 1.66-1.74 2.92-3.42 2.92H7.02c-1.68 0-3.12-1.26-3.42-2.92L2 7l2.5 2.5Z"
    />,
    { viewBox: '0 0 24 24' },
  ),
};

export const getRelicIcon = (rarity: RelicRarity): JSX.Element => {
  return RELIC_ICONS[rarity] ?? RELIC_ICONS.common;
};

interface RelicBadgeProps {
  readonly rarity: RelicRarity;
  readonly className?: string;
  readonly label?: string;
}

export const RelicBadge = memo(({ rarity, className, label }: RelicBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80',
        className,
      )}
    >
      <span className="h-3.5 w-3.5" aria-hidden="true">
        {getRelicIcon(rarity)}
      </span>
      <span>{label ?? rarity.toUpperCase()}</span>
    </span>
  );
});
RelicBadge.displayName = 'RelicBadge';
