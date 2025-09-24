import type { PublicFrenzyState } from '@/hooks/gameStateTypes';
import { resolveStateIdentity } from '@/data/usaStates';

interface PublicFrenzyMeterProps {
  frenzy: PublicFrenzyState;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const PublicFrenzyMeter = ({ frenzy }: PublicFrenzyMeterProps) => {
  const normalized = clamp(frenzy.value, 0, 100);
  const bonusActive = frenzy.bonusHeadlineActiveFor;
  const initiativeActive = frenzy.governmentInitiativeActiveFor;
  const underReview = frenzy.underReviewState ?? null;

  const underReviewLabel = resolveStateIdentity(underReview)?.label ?? underReview;
  const underReviewActive = Boolean(initiativeActive && underReview);

  return (
    <div className="rounded-xl border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000]">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-black/60">Public Frenzy Meter</div>
          <div className="text-[10px] uppercase text-black/50">Tabloid hysteria vs. government calm</div>
        </div>
        <div className="text-sm font-mono font-black text-black">{normalized}%</div>
      </div>
      <div className="relative mt-3 h-4 overflow-hidden rounded-full border border-black/30 bg-gradient-to-r from-blue-200 via-white to-rose-200">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-purple-400 to-rose-600 transition-all"
          style={{ width: `${normalized}%` }}
        />
        <div className="absolute inset-y-0 left-[60%] w-[2px] bg-black/30" />
        <div className="absolute inset-y-0 left-[40%] w-[2px] bg-black/20" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono uppercase">
        <div
          className={`rounded border px-2 py-1 text-center ${
            bonusActive
              ? 'border-rose-500 text-rose-600 shadow-[2px_2px_0_rgba(244,63,94,0.35)]'
              : 'border-black/20 text-black/60'
          }`}
        >
          {bonusActive
            ? `Bonus headline slot held by ${bonusActive === 'human' ? 'you' : 'AI'}`
            : 'No bonus headline slot'}
        </div>
        <div
          className={`rounded border px-2 py-1 text-center ${
            initiativeActive
              ? 'border-blue-500 text-blue-600 shadow-[2px_2px_0_rgba(59,130,246,0.35)]'
              : 'border-black/20 text-black/60'
          }`}
        >
          {initiativeActive
            ? `Initiative claimed by ${initiativeActive === 'human' ? 'you' : 'AI'}`
            : 'Initiative neutral'}
        </div>
      </div>
      <div
        className={`mt-2 rounded border px-2 py-1 text-center text-[11px] font-mono uppercase ${
          underReviewActive
            ? 'border-amber-500 text-amber-600 shadow-[2px_2px_0_rgba(245,158,11,0.35)]'
            : 'border-black/20 text-black/60'
        }`}
      >
        {underReviewActive
          ? `Under Review: ${underReviewLabel ?? 'Unknown Target'}`
          : 'No state under review'}
      </div>
    </div>
  );
};

export default PublicFrenzyMeter;
