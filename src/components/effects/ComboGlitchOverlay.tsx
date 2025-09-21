import React, { useEffect } from 'react';

interface ComboGlitchOverlayProps {
  x: number;
  y: number;
  comboNames: string[];
  intensity: 'minor' | 'major' | 'mega';
  reducedMotion?: boolean;
  onComplete: () => void;
  duration?: number;
}

const INTENSITY_TO_SIZE: Record<ComboGlitchOverlayProps['intensity'], number> = {
  minor: 180,
  major: 220,
  mega: 260
};

const ComboGlitchOverlay: React.FC<ComboGlitchOverlayProps> = ({
  x,
  y,
  comboNames,
  intensity,
  reducedMotion = false,
  onComplete,
  duration = 900
}) => {
  useEffect(() => {
    const timeout = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onComplete]);

  const size = INTENSITY_TO_SIZE[intensity] ?? INTENSITY_TO_SIZE.minor;
  const label = comboNames.length > 0 ? comboNames.join(' + ') : 'COMBO GLITCH';

  return (
    <div
      className={`pointer-events-none fixed z-[970] ${reducedMotion ? '' : 'combo-glitch-container'}`}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="combo-glitch-core absolute inset-0 rounded-xl border border-cyan-400/70 bg-slate-900/25 shadow-[0_0_32px_rgba(56,189,248,0.45)] backdrop-blur-[2px]" />
      {!reducedMotion && (
        <>
          <div className="combo-glitch-lines absolute inset-0 rounded-xl" />
          <div className="combo-glitch-shard absolute inset-4 rounded-lg" />
        </>
      )}

      <div className="absolute inset-x-4 bottom-6 text-center text-xs font-mono uppercase tracking-[0.32em] text-cyan-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]">
        {label}
      </div>
      <div className="absolute inset-x-6 top-6 text-center text-[0.65rem] font-semibold uppercase tracking-[0.48em] text-fuchsia-200/80">
        signal corruption
      </div>
    </div>
  );
};

export default ComboGlitchOverlay;
