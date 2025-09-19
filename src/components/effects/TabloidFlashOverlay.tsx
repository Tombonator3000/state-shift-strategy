import React, { useEffect, useMemo, useState } from 'react';

interface TabloidFlashOverlayProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

interface RadialBurst {
  id: string;
  rotation: string;
  delay: string;
  scale: string;
}

interface StarBurst {
  id: string;
  delay: string;
  offsetX: string;
  offsetY: string;
  scale: string;
}

interface PolaroidFragment {
  id: string;
  src: string;
  delay: string;
  offsetX: string;
  startY: string;
  midY: string;
  finalY: string;
  rotationStart: string;
  rotationMid: string;
  rotationEnd: string;
  scale: string;
}

const FLASH_DURATION = 1600;
const polaroidSources = [
  '/placeholder-event.png',
  '/card-art/GOV-006.jpg',
  '/card-art/GOV-011.jpg'
];

const TabloidFlashOverlay: React.FC<TabloidFlashOverlayProps> = ({ x, y, onComplete }) => {
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
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    const timeout = window.setTimeout(() => {
      onComplete?.();
    }, FLASH_DURATION);

    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion, onComplete]);

  const overlayStyle = useMemo(() => ({
    '--flash-x': `${x}px`,
    '--flash-y': `${y}px`
  }) as React.CSSProperties, [x, y]);

  const radials: RadialBurst[] = useMemo(() => (
    Array.from({ length: 8 }, (_, index) => ({
      id: `radial-${index}`,
      rotation: `${Math.random() * 360}deg`,
      delay: `${index * 35 + Math.random() * 80}ms`,
      scale: (0.85 + Math.random() * 0.7).toFixed(2)
    }))
  ), []);

  const stars: StarBurst[] = useMemo(() => (
    Array.from({ length: 6 }, (_, index) => ({
      id: `star-${index}`,
      delay: `${180 + index * 60 + Math.random() * 110}ms`,
      offsetX: `${(Math.random() - 0.5) * 220}px`,
      offsetY: `${(Math.random() - 0.35) * 200}px`,
      scale: (0.75 + Math.random() * 0.9).toFixed(2)
    }))
  ), []);

  const polaroids: PolaroidFragment[] = useMemo(() => {
    if (Math.random() < 0.45) {
      return [];
    }

    const count = 1 + Math.floor(Math.random() * 2);
    const sources = [...polaroidSources].sort(() => Math.random() - 0.5).slice(0, count);

    return sources.map((src, index) => {
      const finalY = 36 + Math.random() * 32;
      const midY = finalY - (50 + Math.random() * 20);
      const startY = finalY - (110 + Math.random() * 40);
      const baseRotation = (Math.random() - 0.5) * 18;

      return {
        id: `polaroid-${index}`,
        src,
        delay: `${260 + index * 140 + Math.random() * 120}ms`,
        offsetX: `${(Math.random() - 0.5) * 260}px`,
        startY: `${startY}px`,
        midY: `${midY}px`,
        finalY: `${finalY}px`,
        rotationStart: `${baseRotation - 12}deg`,
        rotationMid: `${baseRotation + 6}deg`,
        rotationEnd: `${baseRotation}deg`,
        scale: (0.85 + Math.random() * 0.2).toFixed(2)
      };
    });
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="tabloid-flash-overlay"
      style={overlayStyle}
      aria-hidden="true"
    >
      <div className="tabloid-flash-ambient" />
      <div
        className="tabloid-flash-center"
        style={{ left: x, top: y }}
      >
        <div className="tabloid-flash-core" />
        <div className="tabloid-flash-ring" />
        {radials.map(radial => (
          <span
            key={radial.id}
            className="tabloid-flash-radial"
            style={{
              '--flash-delay': radial.delay,
              '--flash-burst-rotation': radial.rotation,
              '--flash-burst-scale': radial.scale
            } as React.CSSProperties}
          />
        ))}
        {stars.map(star => (
          <span
            key={star.id}
            className="tabloid-flash-star"
            style={{
              '--flash-delay': star.delay,
              '--flash-star-x': star.offsetX,
              '--flash-star-y': star.offsetY,
              '--flash-star-scale': star.scale
            } as React.CSSProperties}
          />
        ))}
        {polaroids.map(polaroid => (
          <span
            key={polaroid.id}
            className="tabloid-flash-polaroid"
            style={{
              '--flash-delay': polaroid.delay,
              '--flash-polaroid-x': polaroid.offsetX,
              '--flash-polaroid-start-y': polaroid.startY,
              '--flash-polaroid-mid-y': polaroid.midY,
              '--flash-polaroid-y': polaroid.finalY,
              '--flash-polaroid-rotation-start': polaroid.rotationStart,
              '--flash-polaroid-rotation-mid': polaroid.rotationMid,
              '--flash-polaroid-rotation-end': polaroid.rotationEnd,
              '--flash-polaroid-scale': polaroid.scale,
              '--polaroid-image': `url(${polaroid.src})`
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default TabloidFlashOverlay;
