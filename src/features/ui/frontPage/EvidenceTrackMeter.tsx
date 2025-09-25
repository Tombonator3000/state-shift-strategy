import type { EvidenceTrackState } from '@/hooks/gameStateTypes';

interface EvidenceTrackMeterProps {
  truth: number;
  evidence: EvidenceTrackState;
  faction: 'truth' | 'government';
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const ThresholdMarker = ({ value, label }: { value: number; label: string }) => (
  <div
    className="absolute top-0 h-full"
    style={{ left: `${value}%` }}
  >
    <div className="h-full w-[2px] bg-black/30" />
    <div className="mt-1 text-[10px] font-mono text-black/60 -translate-x-1/2">{label}</div>
  </div>
);

export const EvidenceTrackMeter = ({ truth, evidence, faction }: EvidenceTrackMeterProps) => {
  const normalized = clamp(truth, 0, 100);
  const exposeOwner = evidence.exposeOwner;
  const obfuscateOwner = evidence.obfuscateOwner;
  const exposeReady = evidence.exposeReady;
  const obfuscateReady = evidence.obfuscateReady;

  const exposeLabel = exposeReady
    ? exposeOwner === 'human'
      ? 'Expose! Ready for you'
      : 'Expose! Ready for rival'
    : 'Expose! idle';

  const obfuscateLabel = obfuscateReady
    ? obfuscateOwner === 'human'
      ? 'Obfuscate primed for you'
      : 'Obfuscate primed for rival'
    : 'Obfuscate dormant';

  const alignmentLabel = faction === 'truth' ? 'Truth coalition' : 'Government division';

  return (
    <div className="w-full rounded-xl border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000]">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-black/60">Evidence vs. Red Tape</div>
          <div className="text-[10px] uppercase text-black/50">{alignmentLabel}</div>
        </div>
        <div className="text-sm font-mono font-black text-black">{normalized}% TRUTH</div>
      </div>
      <div className="relative mt-3 h-5 overflow-hidden rounded-full border border-black/30 bg-gradient-to-r from-slate-200 via-white to-amber-100">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-sky-400 transition-all"
          style={{ width: `${normalized}%` }}
        />
        <ThresholdMarker value={10} label="CLASSIFIED" />
        <ThresholdMarker value={30} label="Red Tape" />
        <ThresholdMarker value={70} label="Expose" />
        <ThresholdMarker value={90} label="Smoking Gun" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono uppercase">
        <div
          className={`rounded border px-2 py-1 text-center ${
            exposeReady
              ? 'border-red-500 text-red-600 shadow-[2px_2px_0_rgba(220,38,38,0.4)]'
              : 'border-black/20 text-black/60'
          }`}
        >
          {exposeLabel}
        </div>
        <div
          className={`rounded border px-2 py-1 text-center ${
            obfuscateReady
              ? 'border-blue-600 text-blue-700 shadow-[2px_2px_0_rgba(37,99,235,0.35)]'
              : 'border-black/20 text-black/60'
          }`}
        >
          {obfuscateLabel}
        </div>
      </div>
    </div>
  );
};

export default EvidenceTrackMeter;
