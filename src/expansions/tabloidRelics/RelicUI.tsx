import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabloidRelicRuntimeEntry, RelicRarity } from './RelicTypes';
import { RelicBadge, getRelicIcon } from './RelicIcons';

const rarityAccentClass: Record<RelicRarity, string> = {
  common: 'from-slate-400/40 via-slate-200/20 to-transparent text-slate-100',
  uncommon: 'from-emerald-400/50 via-emerald-300/20 to-transparent text-emerald-200',
  rare: 'from-indigo-400/60 via-indigo-300/20 to-transparent text-indigo-200',
  legendary: 'from-amber-400/70 via-amber-300/25 to-transparent text-amber-200',
};

const rarityHaloShadow: Record<RelicRarity, string> = {
  common: 'shadow-[0_0_25px_rgba(148,163,184,0.35)]',
  uncommon: 'shadow-[0_0_28px_rgba(16,185,129,0.35)]',
  rare: 'shadow-[0_0_28px_rgba(99,102,241,0.35)]',
  legendary: 'shadow-[0_0_32px_rgba(251,191,36,0.4)]',
};

export interface FalloutOverlayProps {
  readonly relic: TabloidRelicRuntimeEntry | null;
  readonly onClose?: () => void;
  readonly className?: string;
}

export const FalloutOverlay = ({ relic, onClose, className }: FalloutOverlayProps) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!relic) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose?.();
    }, 2400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [relic, onClose]);

  const initialState = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -12, scale: 0.96 };
  const animateState = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };
  const exitState = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.98 };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[935] flex justify-center px-4 sm:justify-end sm:px-6">
      <AnimatePresence mode="wait">
        {relic ? (
          <motion.section
            key={relic.uid}
            initial={initialState}
            animate={animateState}
            exit={exitState}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.28, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-950/85 p-4 text-sm text-slate-50 shadow-[0_18px_55px_-25px_rgba(0,0,0,0.7)] backdrop-blur',
              className,
            )}
            role="status"
            aria-live="polite"
          >
            <div
              className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                rarityAccentClass[relic.rarity],
              )}
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={() => onClose?.()}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 hover:bg-white/20 hover:text-white"
            >
              <span className="sr-only">Dismiss relic fallout</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg',
                  rarityHaloShadow[relic.rarity],
                )}
              >
                <span className="h-7 w-7" aria-hidden="true">
                  {getRelicIcon(relic.rarity)}
                </span>
                <span className="sr-only">{`${relic.rarity} relic icon`}</span>
                <div className="absolute inset-0 rounded-full border border-white/15" aria-hidden="true" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-300/80">
                    Fallout Detected
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-base font-semibold leading-tight text-white">{relic.label}</h3>
                    <RelicBadge rarity={relic.rarity} className="bg-white/10 text-white/90" />
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-200">{relic.summary}</p>
                {relic.detail ? (
                  <p className="text-[11px] leading-relaxed text-slate-300/90">{relic.detail}</p>
                ) : null}

                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-slate-400/80">
                  <span>
                    Remaining <span className="font-semibold text-white/90">{Math.max(0, relic.remaining)}</span>
                  </span>
                  <span>
                    Duration <span className="font-semibold text-white/90">{relic.duration}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default FalloutOverlay;
