import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { TabloidRelicRuntimeState } from './RelicTypes';
import { formatFalloutLine, summarizeEffects, stripLeadingLabel, type FalloutEffectSummary } from './FalloutText';

interface RelicUIProps {
  readonly runtime: TabloidRelicRuntimeState | null | undefined;
}

const rarityBadgeClass: Record<string, string> = {
  common: 'bg-gray-200 text-gray-800',
  uncommon: 'bg-emerald-100 text-emerald-800',
  rare: 'bg-indigo-100 text-indigo-800',
  legendary: 'bg-amber-200 text-amber-900',
};

const statusLabel: Record<TabloidRelicRuntimeState['entries'][number]['status'], string> = {
  queued: 'Queued',
  active: 'Active',
};

const effectToneClass: Record<FalloutEffectSummary['tone'], string> = {
  positive: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
  negative: 'border-rose-500/40 bg-rose-500/10 text-rose-700',
  neutral: 'border-slate-400/50 bg-slate-400/15 text-slate-700',
};

const RelicUIComponent = ({ runtime }: RelicUIProps) => {
  const entries = runtime?.entries ?? [];
  if (!entries.length) {
    return null;
  }

  const locale = typeof navigator !== 'undefined' ? navigator.language : undefined;

  return (
    <div className="pointer-events-none fixed top-24 right-6 z-[935] flex w-72 max-w-sm flex-col gap-3 text-xs text-black">
      <div className="pointer-events-auto rounded-lg border border-black/15 bg-white/90 p-3 shadow-xl backdrop-blur">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">
          Tabloid Relics
        </div>
        <div className="mt-2 space-y-2">
          {entries.map(entry => {
            const rarityClass = rarityBadgeClass[entry.rarity] ?? rarityBadgeClass.common;
            const remainingLabel = `${Math.max(0, entry.remaining)} / ${entry.duration}`;
            const formattedLine = formatFalloutLine(entry, { locale });
            const falloutSentence = stripLeadingLabel(entry.label, formattedLine);
            const effectSummaries = summarizeEffects(entry.effects, { locale });
            return (
              <div
                key={entry.uid}
                className="rounded-md border border-black/10 bg-white/85 p-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold leading-snug">{entry.label}</div>
                  <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold uppercase', rarityClass)}>
                    {entry.rarity}
                  </span>
                </div>
                <div className="mt-1 text-[11px] leading-snug text-black/70">{falloutSentence}</div>
                {effectSummaries.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {effectSummaries.map(effect => (
                      <span
                        key={effect.key}
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-semibold text-black/75',
                          effectToneClass[effect.tone],
                        )}
                      >
                        {effect.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between text-[10px] text-black/60">
                  <span>{statusLabel[entry.status]}</span>
                  <span className="font-semibold tracking-wide">{remainingLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RelicUI = memo(RelicUIComponent);

export default RelicUI;
