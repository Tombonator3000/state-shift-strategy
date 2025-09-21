import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ComboTheme } from '@/data/combos/themes';

interface ComboGlitchOverlayProps {
  x: number;
  y: number;
  comboNames: string[];
  intensity: 'minor' | 'major' | 'mega';
  magnitude: number;
  fxMessages?: string[];
  reducedMotion?: boolean;
  onComplete: () => void;
  duration: number;
  mode: 'full' | 'minimal';
  theme: ComboTheme;
  ipGain: number;
  truthGain: number;
  totalReward: number;
  uniqueTypes: number;
  totalCards: number;
  affectedStates: string[];
  seed: number;
}

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let result = Math.imul(t ^ (t >>> 15), 1 | t);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const formatSigned = (value: number): string => {
  const magnitude = Math.abs(value);
  const decimals = magnitude !== 0 && !Number.isInteger(magnitude) && magnitude < 10 ? 1 : 0;
  return `${value >= 0 ? '+' : '-'}${magnitude.toFixed(decimals)}`;
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
  mode,
  theme,
  ipGain,
  truthGain,
  totalReward,
  uniqueTypes,
  totalCards,
  affectedStates,
  seed,
}) => {
  useEffect(() => {
    const timeout = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onComplete]);

  const rng = useMemo(() => mulberry32(seed || Date.now()), [seed]);

  const subtitle = useMemo(() => {
    const pool = theme.calloutSubtitlePool.length > 0
      ? theme.calloutSubtitlePool
      : ['Signal variance noted'];
    const index = Math.floor(rng() * pool.length) % pool.length;
    return pool[index];
  }, [rng, theme.calloutSubtitlePool]);

  const tickerText = useMemo(() => {
    const source = fxMessages.length > 0 ? fxMessages : comboNames;
    if (source.length === 0) {
      return theme.label.toUpperCase();
    }
    return source.map(entry => entry.toUpperCase()).join(' · ');
  }, [comboNames, fxMessages, theme.label]);

  const ipSegment = `${formatSigned(ipGain)} IP`;
  const truthSegment = `${formatSigned(truthGain)}% Truth`;
  const rewardMeter = `Reward Spike: ${ipSegment} / ${truthSegment}`;
  const ariaReward = `Reward Spike ${ipSegment}, ${truthSegment}`;
  const ariaAnnouncement = `${theme.calloutTitle} — ${ariaReward}`;
  const overlayClassNames = [
    'combo-glitch-overlay',
    reducedMotion ? 'combo-glitch-overlay--reduced' : '',
    mode === 'minimal' ? 'combo-glitch-overlay--minimal' : '',
    `combo-glitch-overlay--${theme.glyph}`,
  ].filter(Boolean).join(' ');

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={overlayClassNames}
      data-testid="combo-glitch-overlay"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      role="presentation"
    >
      <div className="combo-glitch-overlay__inner" data-theme={theme.id}>
        <div className="combo-glitch-overlay__glyph" aria-hidden="true">
          {theme.glyph === 'ticker' ? (
            <div className="combo-glitch-overlay__ticker" data-text={tickerText}>
              <span>{tickerText}</span>
              <span aria-hidden="true">{tickerText}</span>
            </div>
          ) : null}
          {theme.glyph === 'map-blink' && affectedStates.length > 0 ? (
            <div className="combo-glitch-overlay__states">
              {affectedStates.map(state => (
                <span key={state}>{state}</span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="combo-glitch-overlay__content" aria-live="polite" aria-label={ariaAnnouncement}>
          <div className="combo-glitch-overlay__title">{theme.calloutTitle}</div>
          <div className="combo-glitch-overlay__subtitle">{subtitle}</div>
          <div className="combo-glitch-overlay__meter" aria-label={ariaReward}>
            {rewardMeter}
          </div>
          <div className="combo-glitch-overlay__stats">
            <div>{`Total Yield: ${totalReward.toFixed(totalReward < 1 ? 1 : 0)}`}</div>
            <div>{`Unique Types: ${uniqueTypes}`}</div>
            <div>{`Cards In Sequence: ${totalCards}`}</div>
          </div>
          {comboNames.length > 0 ? (
            <div className="combo-glitch-overlay__combos">
              {comboNames.map(name => (
                <span key={name}>{name.toUpperCase()}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ComboGlitchOverlay;
