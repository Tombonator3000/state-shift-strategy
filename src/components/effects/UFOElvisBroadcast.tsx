import React, { useEffect, useMemo } from 'react';

interface UFOElvisBroadcastProps {
  x: number;
  y: number;
  intensity: 'surge' | 'collapse';
  setList: string[];
  truthValue?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const UFOElvisBroadcast: React.FC<UFOElvisBroadcastProps> = ({
  x,
  y,
  intensity,
  setList,
  truthValue,
  reducedMotion = false,
  onComplete,
}) => {
  useEffect(() => {
    const duration = reducedMotion ? 2200 : 4200;
    const timeoutId = window.setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onComplete, reducedMotion]);

  const headline = intensity === 'surge'
    ? 'TRUTH MELTDOWN LIVE!'
    : 'BROADCAST BLACKOUT!';

  const displaySetList = useMemo(() => {
    if (!setList || setList.length === 0) {
      return ['Suspicious Minds (Loop)', 'Mystery Train Remix', 'Blue Moon Laser Solo'];
    }
    return setList.slice(0, 4);
  }, [setList]);

  const overlaySize = reducedMotion ? 220 : 280;
  const positionStyle: React.CSSProperties = {
    left: Math.max(0, x - overlaySize / 2),
    top: Math.max(0, y - overlaySize / 2),
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <div
        className={`ufo-broadcast ${reducedMotion ? 'reduced-motion' : ''} intensity-${intensity}`}
        style={positionStyle}
        role="status"
        aria-live="assertive"
      >
        <div className="ufo-ship" aria-hidden="true">
          <div className="ufo-dish" />
          <div className="ufo-cabin">
            <span className="ufo-icon" role="img" aria-label="UFO">🛸</span>
          </div>
        </div>
        <div className="ufo-beam" aria-hidden="true">
          <div className="beam-core" />
          <div className="beam-sparkles" />
        </div>
        <div className="elvis-hologram" aria-hidden="true">
          <div className="elvis-body">
            <span role="img" aria-label="Elvis hologram">🕺</span>
          </div>
          <div className="elvis-shadow" />
        </div>
        <div className="crt-banner" aria-hidden="true">
          <span className="crt-text">{headline}</span>
        </div>
        <div className="set-list" aria-label="Elvis UFO set list">
          <h4>SET LIST</h4>
          <ul>
            {displaySetList.map((track, index) => (
              <li key={`${track}-${index}`}>{track}</li>
            ))}
          </ul>
          {typeof truthValue === 'number' ? (
            <div className="truth-meter">TRUTH INDEX: {Math.round(truthValue)}%</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UFOElvisBroadcast;
