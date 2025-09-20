import React, { useEffect, useMemo, useState } from 'react';

interface ConspiracyCorkboardProps {
  x: number;
  y: number;
  comboName?: string;
  bonusIP?: number;
  onComplete?: () => void;
}

interface ThreadSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

const CORKBOARD_DURATION = 2600;

const ConspiracyCorkboard: React.FC<ConspiracyCorkboardProps> = ({
  x,
  y,
  comboName,
  bonusIP,
  onComplete
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    const duration = prefersReducedMotion ? CORKBOARD_DURATION * 0.6 : CORKBOARD_DURATION;

    const timeout = window.setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion, onComplete]);

  const overlayStyle = useMemo(() => ({
    '--corkboard-x': `${x}px`,
    '--corkboard-y': `${y}px`
  }) as React.CSSProperties, [x, y]);

  const threadSegments = useMemo<ThreadSegment[]>(() => (
    Array.from({ length: 5 }, (_, index) => ({
      id: `thread-${index}-${Math.random().toString(36).slice(2, 7)}`,
      x1: 20 + Math.random() * 60,
      y1: 18 + Math.random() * 64,
      x2: 20 + Math.random() * 60,
      y2: 18 + Math.random() * 64,
      delay: 80 * index + Math.random() * 180
    }))
  ), []);

  return (
    <div
      className={`conspiracy-corkboard-overlay${prefersReducedMotion ? ' conspiracy-corkboard-overlay--reduced' : ''}`}
      style={overlayStyle}
      aria-hidden="true"
    >
      <div className="conspiracy-corkboard-shadow" />
      <div className="conspiracy-corkboard-panel">
        <div className="conspiracy-corkboard-backdrop" />
        <svg
          className="conspiracy-threadmap"
          viewBox="0 0 200 200"
          role="presentation"
        >
          {threadSegments.map(segment => (
            <line
              key={segment.id}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              className="conspiracy-thread"
              style={{
                '--thread-delay': `${segment.delay}ms`
              } as React.CSSProperties}
            />
          ))}
        </svg>

        <div className="conspiracy-pin conspiracy-pin--north" />
        <div className="conspiracy-pin conspiracy-pin--east" />
        <div className="conspiracy-pin conspiracy-pin--south" />
        <div className="conspiracy-pin conspiracy-pin--west" />

        <div className="conspiracy-note">
          <span className="conspiracy-note-label">SYNERGY CASCADE</span>
          <span className="conspiracy-note-title">{comboName ?? 'UNKNOWN LEADS'}</span>
          {typeof bonusIP === 'number' && (
            <span className="conspiracy-note-metric">+{bonusIP} IP ROUTED</span>
          )}
          <span className="conspiracy-note-footer">CONNECTING RED STRINGS...</span>
        </div>
      </div>
    </div>
  );
};

export default ConspiracyCorkboard;
