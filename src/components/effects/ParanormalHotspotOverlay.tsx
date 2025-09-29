import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

interface ParanormalHotspotOverlayProps {
  x: number;
  y: number;
  icon: string;
  label: string;
  stateName: string;
  source: 'truth' | 'government' | 'neutral';
  defenseBoost: number;
  truthReward: number;
  onComplete?: () => void;
}

const SOURCE_STYLES: Record<ParanormalHotspotOverlayProps['source'], string> = {
  truth: 'border-sky-400/70 bg-sky-500/20 text-sky-50',
  government: 'border-rose-400/70 bg-rose-500/20 text-rose-50',
  neutral: 'border-purple-400/70 bg-purple-500/20 text-purple-50',
};

const UFO_FLIGHT_DURATION = 2200;
const PANEL_FADE_DELAY = UFO_FLIGHT_DURATION + 200;
const OVERLAY_TIMEOUT = UFO_FLIGHT_DURATION + 4200;

const ParanormalHotspotOverlay: React.FC<ParanormalHotspotOverlayProps> = ({
  x,
  y,
  icon,
  label,
  stateName,
  source,
  defenseBoost,
  truthReward,
  onComplete,
}) => {
  const [hasLanded, setHasLanded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    setPrefersReducedMotion(Boolean(reduceMotion));
    setHasLanded(Boolean(reduceMotion));

    const landTimer = reduceMotion
      ? null
      : window.setTimeout(() => {
          setHasLanded(true);
        }, PANEL_FADE_DELAY);

    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, OVERLAY_TIMEOUT);

    return () => {
      if (landTimer) {
        window.clearTimeout(landTimer);
      }
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const overlayStyle = useMemo(() => {
    const startOffsetX = Math.max(36, x - 240);
    const startOffsetY = Math.max(24, y - 220);

    return {
      '--hotspot-x': `${x}px`,
      '--hotspot-y': `${y}px`,
      '--ufo-start-x': `${startOffsetX}px`,
      '--ufo-start-y': `${startOffsetY}px`,
      '--ufo-flight-duration': prefersReducedMotion ? '0ms' : `${UFO_FLIGHT_DURATION}ms`,
    } as React.CSSProperties;
  }, [prefersReducedMotion, x, y]);

  return (
    <div className="paranormal-hotspot-overlay" style={overlayStyle}>
      <div className={clsx('paranormal-hotspot-ufo', hasLanded && 'landed')} aria-hidden="true">
        <span className="paranormal-hotspot-ufo-body">🛸</span>
        <span className="paranormal-hotspot-ufo-beam" />
      </div>
      <div
        className={clsx(
          'paranormal-hotspot-panel min-w-[220px] max-w-xs rounded-2xl border px-4 py-3',
          'shadow-[0_0_35px_rgba(74,222,128,0.28)] backdrop-blur-xl',
          'bg-gradient-to-br from-black/70 via-black/60 to-black/70 ring-1 ring-white/10',
          'animate-[pulse_3s_ease-in-out_infinite]',
          SOURCE_STYLES[source],
          hasLanded ? 'paranormal-hotspot-panel--visible' : 'paranormal-hotspot-panel--hidden',
        )}
      >
        <div className="flex items-center gap-3 text-lg font-extrabold tracking-wide">
          <span aria-hidden="true" className="text-2xl">
            {icon}
          </span>
          <span className="uppercase drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]">{label}</span>
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/60">{stateName}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-mono">
          <div className="rounded border border-white/10 bg-black/30 px-2 py-1 text-white/80">
            DEF +{defenseBoost}
          </div>
          <div className="rounded border border-white/10 bg-black/30 px-2 py-1 text-white/80">
            TRUTH ±{truthReward}%
          </div>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
          Source: {source.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default ParanormalHotspotOverlay;
