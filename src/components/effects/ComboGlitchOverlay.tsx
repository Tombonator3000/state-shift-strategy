import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface ComboGlitchOverlayProps {
  x: number;
  y: number;
  comboNames: string[];
  intensity: 'minor' | 'major' | 'mega';
  magnitude?: number;
  fxMessages?: string[];
  reducedMotion?: boolean;
  onComplete: () => void;
  duration?: number;
  mode?: 'full' | 'minimal';
}

type ComboIntensity = ComboGlitchOverlayProps['intensity'];

const INTENSITY_TAGLINES: Record<ComboIntensity, readonly string[]> = {
  minor: [
    'Signal Drift Detected',
    'Channel Disruption',
    'Minor Data Echo',
    'Low-Level Frequency Warp',
  ],
  major: [
    'Timeline Fragmentation',
    'Spectral Cascade Event',
    'Channel 7 Break-In',
    'Major Reality Skew',
  ],
  mega: [
    'Catastrophic Anomaly Surge',
    'Full Spectrum Overwrite',
    'Reality Anchor Offline',
    'Prime Timeline Collapse',
  ],
};

const FALLBACK_TAGLINES: readonly string[] = [
  'Combo Glitch Detected',
  'Unauthorized Broadcast',
  'Broadcast Integrity Failure',
  'Signal Chain Reaction',
];

const INTENSITY_PRESETS: Record<ComboIntensity, {
  size: number;
  defaultDuration: number;
  coreClass: string;
  labelClass: string;
  accentClass: string;
  accentFallback: string;
  rewardPrefix: string;
  lineColor: string;
  lineOpacity: number;
  shardLayers: string[];
  shardOpacity: number;
}> = {
  minor: {
    size: 180,
    defaultDuration: 900,
    coreClass: 'border-cyan-400/70 bg-slate-900/25 shadow-[0_0_32px_rgba(56,189,248,0.45)] backdrop-blur-[2px]',
    labelClass: 'text-cyan-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]',
    accentClass: 'text-fuchsia-200/80',
    accentFallback: 'Signal Corruption',
    rewardPrefix: 'Reward Spike',
    lineColor: 'rgba(56, 189, 248, 0.28)',
    lineOpacity: 0.68,
    shardLayers: [
      'radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.35), transparent 55%)',
      'radial-gradient(circle at 80% 60%, rgba(129, 140, 248, 0.28), transparent 65%)',
      'linear-gradient(135deg, rgba(56, 189, 248, 0.25), transparent 60%)'
    ],
    shardOpacity: 0.78
  },
  major: {
    size: 220,
    defaultDuration: 1200,
    coreClass: 'border-indigo-400/80 bg-slate-900/30 shadow-[0_0_44px_rgba(129,140,248,0.6)] backdrop-blur-[3px]',
    labelClass: 'text-indigo-100 drop-shadow-[0_0_14px_rgba(129,140,248,0.75)]',
    accentClass: 'text-amber-200/80',
    accentFallback: 'Critical Distortion',
    rewardPrefix: 'Combo Surge',
    lineColor: 'rgba(129, 140, 248, 0.35)',
    lineOpacity: 0.75,
    shardLayers: [
      'radial-gradient(circle at 20% 20%, rgba(244, 114, 182, 0.48), transparent 52%)',
      'radial-gradient(circle at 80% 60%, rgba(251, 191, 36, 0.38), transparent 60%)',
      'linear-gradient(135deg, rgba(129, 140, 248, 0.45), transparent 55%)'
    ],
    shardOpacity: 0.84
  },
  mega: {
    size: 280,
    defaultDuration: 1500,
    coreClass: 'border-rose-400/80 bg-slate-900/40 shadow-[0_0_60px_rgba(244,63,94,0.65)] backdrop-blur-[4px]',
    labelClass: 'text-rose-100 drop-shadow-[0_0_18px_rgba(244,63,94,0.78)]',
    accentClass: 'text-amber-100/90',
    accentFallback: 'Reality Break',
    rewardPrefix: 'Anomaly Yield',
    lineColor: 'rgba(244, 63, 94, 0.4)',
    lineOpacity: 0.82,
    shardLayers: [
      'radial-gradient(circle at 20% 20%, rgba(244, 63, 94, 0.6), transparent 48%)',
      'radial-gradient(circle at 80% 60%, rgba(250, 204, 21, 0.5), transparent 54%)',
      'linear-gradient(135deg, rgba(34, 211, 238, 0.45), transparent 55%)'
    ],
    shardOpacity: 0.9
  }
};

const pickRandom = <T,>(list: readonly T[]): T | undefined => {
  if (!Array.isArray(list) || list.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

const ComboGlitchOverlay: React.FC<ComboGlitchOverlayProps> = ({
  x,
  y,
  comboNames,
  intensity,
  magnitude,
  fxMessages = [],
  reducedMotion = false,
  onComplete,
  duration,
  mode = 'full',
}) => {
  const preset = INTENSITY_PRESETS[intensity];
  const computedDuration = duration ?? preset.defaultDuration;
  const sanitizedMagnitude = typeof magnitude === 'number' && !Number.isNaN(magnitude)
    ? Math.max(0, magnitude)
    : 0;
  const formattedMagnitude = sanitizedMagnitude > 0
    ? (Number.isInteger(sanitizedMagnitude)
      ? sanitizedMagnitude.toString()
      : sanitizedMagnitude.toFixed(1))
    : null;

  const shouldAnimate = !reducedMotion && mode !== 'minimal';

  useEffect(() => {
    const timeout = window.setTimeout(onComplete, computedDuration);
    return () => window.clearTimeout(timeout);
  }, [computedDuration, onComplete]);

  const size = preset.size;
  const label = comboNames.length > 0 ? comboNames.join(' + ') : 'COMBO GLITCH';
  const accentLabel = formattedMagnitude
    ? `${preset.rewardPrefix} +${formattedMagnitude}`
    : preset.accentFallback;

  const sanitizedFxMessages = useMemo(
    () => fxMessages.map(message => message.trim()).filter(message => message.length > 0),
    [fxMessages]
  );

  const glitchTagline = useMemo(() => {
    const intensityPool = INTENSITY_TAGLINES[intensity];
    const comboHighlight = pickRandom(comboNames);
    const baseTagline = pickRandom([...(intensityPool ?? []), ...FALLBACK_TAGLINES])
      ?? FALLBACK_TAGLINES[0];

    return comboHighlight
      ? `${baseTagline} // ${comboHighlight.toUpperCase()}`
      : baseTagline;
  }, [comboNames, intensity]);

  const rewardCallout = useMemo(() => {
    const source = sanitizedFxMessages.length > 0 ? sanitizedFxMessages : [accentLabel];
    const selected = pickRandom(source) ?? accentLabel;
    return selected.toUpperCase();
  }, [accentLabel, sanitizedFxMessages]);

  const taglineAnimationClass = shouldAnimate ? 'combo-glitch-text-scramble' : '';
  const calloutAnimationClass = shouldAnimate ? 'combo-glitch-text-scanline' : '';
  const taglineClasses = [
    'text-[0.55rem]',
    'font-semibold',
    'uppercase',
    'tracking-[0.6em]',
    preset.labelClass,
    taglineAnimationClass,
  ].filter(Boolean).join(' ');
  const calloutClasses = [
    'text-[0.68rem]',
    'font-bold',
    'uppercase',
    'tracking-[0.48em]',
    preset.accentClass,
    calloutAnimationClass,
  ].filter(Boolean).join(' ');

  if (typeof document === 'undefined') {
    return null;
  }

  const containerClasses = [
    'pointer-events-none',
    'absolute',
    shouldAnimate ? 'combo-glitch-container' : '',
  ].filter(Boolean).join(' ');

  const overlay = (
    <div className="combo-glitch-layer">
      <div
        className={containerClasses}
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div
          className={`absolute inset-0 rounded-xl border ${preset.coreClass} ${shouldAnimate ? 'combo-glitch-core' : ''}`}
        />
        {shouldAnimate && (
          <>
            <div
              className="combo-glitch-lines absolute inset-0 rounded-xl"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, ${preset.lineColor} 0%, ${preset.lineColor} 2px, transparent 2px, transparent 8px)`,
                opacity: preset.lineOpacity
              }}
            />
            <div
              className="combo-glitch-shard absolute inset-4 rounded-lg"
              style={{
                background: preset.shardLayers.join(', '),
                opacity: preset.shardOpacity
              }}
            />
          </>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className={taglineClasses}>
              {glitchTagline}
            </div>
            <div className={calloutClasses}>
              {rewardCallout}
            </div>
          </div>
          <div className={`text-xs font-mono uppercase tracking-[0.32em] ${preset.labelClass}`}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default ComboGlitchOverlay;
