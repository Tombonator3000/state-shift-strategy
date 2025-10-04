import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type NewspaperTone = 'default' | 'victory';

export const NEWSPAPER_CARD_CLASS =
  'ink-smudge relative flex h-full max-h-[90vh] w-full max-w-[min(95vw,1280px)] flex-col overflow-hidden border-4 border-newspaper-border bg-newspaper-bg text-newspaper-text shadow-2xl';

export const NEWSPAPER_HEADER_CLASS =
  'relative border-b-4 border-double border-newspaper-border bg-newspaper-header/90 px-6 py-5';

export const NEWSPAPER_BODY_CLASS =
  'flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 xl:px-5 xl:py-5';

export const NEWSPAPER_SECTION_CLASS =
  'rounded-md border border-newspaper-border bg-white/80 shadow-sm';

const NEWSPAPER_SECTION_VICTORY_CLASS =
  'border-victory-foreground/35 bg-gradient-to-br from-victory-start/85 via-victory-mid/80 to-victory-end/85 text-victory-foreground shadow-[0_16px_40px_rgba(0,0,0,0.35)]';

export const NEWSPAPER_SECTION_HEADING_CLASS =
  'font-mono text-xs uppercase tracking-[0.32em] text-newspaper-text/70';

export const NEWSPAPER_META_CLASS =
  'text-[11px] font-semibold uppercase tracking-[0.45em] text-newspaper-text/60';

export const NEWSPAPER_BADGE_CLASS =
  'border border-newspaper-border bg-newspaper-header/70 text-[11px] font-semibold uppercase tracking-[0.28em] text-newspaper-headline';

const NEWSPAPER_BADGE_VICTORY_CLASS =
  'border-victory-foreground/50 bg-victory-foreground/10 text-victory-accent shadow-[0_4px_14px_rgba(0,0,0,0.25)]';

export const getNewspaperSectionClass = (tone: NewspaperTone = 'default') => {
  return tone === 'victory'
    ? cn(NEWSPAPER_SECTION_CLASS, NEWSPAPER_SECTION_VICTORY_CLASS)
    : NEWSPAPER_SECTION_CLASS;
};

export const getNewspaperBadgeClass = (tone: NewspaperTone = 'default') => {
  return tone === 'victory'
    ? cn(NEWSPAPER_BADGE_CLASS, NEWSPAPER_BADGE_VICTORY_CLASS)
    : NEWSPAPER_BADGE_CLASS;
};

export interface NewspaperSectionProps extends HTMLAttributes<HTMLElement> {
  tone?: NewspaperTone;
}

export const NewspaperSection = ({ className, tone = 'default', ...props }: NewspaperSectionProps) => {
  return <section className={cn(getNewspaperSectionClass(tone), className)} {...props} />;
};
