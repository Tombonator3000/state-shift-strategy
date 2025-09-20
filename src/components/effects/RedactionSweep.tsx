import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface RedactionSweepProps {
  onComplete?: () => void;
}

interface RedactionBarDescriptor {
  delay: number;
  tilt: number;
  width: number;
}

const BAR_COUNT = 7;
const STATIC_DURATION_MS = 1000;

const RedactionSweep: React.FC<RedactionSweepProps> = ({ onComplete }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if ('addEventListener' in mediaQuery && typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers - use any to bypass type issues
    const legacyMQ = mediaQuery as any;
    if (typeof legacyMQ.addListener === 'function') {
      legacyMQ.addListener(handleChange);
      return () => legacyMQ.removeListener && legacyMQ.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onComplete?.();
    }, STATIC_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion, onComplete]);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && !prefersReducedMotion) {
        onComplete?.();
      }
    },
    [onComplete, prefersReducedMotion]
  );

  const bars = useMemo<RedactionBarDescriptor[]>(() => {
    const midpoint = (BAR_COUNT - 1) / 2;

    return Array.from({ length: BAR_COUNT }, (_, index) => {
      const distanceFromCenter = Math.abs(index - midpoint);
      const tilt = (index % 2 === 0 ? -1 : 1) * (1.2 + distanceFromCenter * 0.35);
      const width = 82 - distanceFromCenter * 8;
      const delay = index * 0.08;

      return { delay, tilt, width };
    });
  }, []);

  return (
    <div
      className="redaction-overlay"
      aria-hidden="true"
      role="presentation"
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="redaction-overlay__content">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="redaction-bar"
            style={
              {
                '--bar-delay': `${bar.delay}s`,
                '--bar-tilt': `${bar.tilt}deg`,
                '--bar-width': `${bar.width}%`
              } as React.CSSProperties
            }
          >
            <span className="redaction-bar__label">REDACTED</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RedactionSweep;
