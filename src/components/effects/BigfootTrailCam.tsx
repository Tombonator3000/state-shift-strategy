import React, { useEffect, useMemo } from 'react';

interface BigfootTrailCamProps {
  x: number;
  y: number;
  stateName?: string;
  footageQuality: string;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const BigfootTrailCam: React.FC<BigfootTrailCamProps> = ({
  x,
  y,
  stateName,
  footageQuality,
  reducedMotion = false,
  onComplete,
}) => {
  useEffect(() => {
    const duration = reducedMotion ? 2000 : 3600;
    const timeoutId = window.setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onComplete, reducedMotion]);

  const timestampLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date());
    } catch {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    }
  }, []);

  const overlayWidth = 260;
  const overlayHeight = 200;
  const positionStyle: React.CSSProperties = {
    left: Math.max(0, x - overlayWidth / 2),
    top: Math.max(0, y - overlayHeight / 2),
  };

  const locationLabel = stateName ?? 'UNKNOWN LOCATION';
  const qualityLabel = footageQuality.toUpperCase();

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]">
      <div
        className={`bigfoot-trailcam ${reducedMotion ? 'reduced-motion' : ''} quality-${qualityLabel.toLowerCase()}`}
        style={positionStyle}
        role="status"
        aria-live="polite"
      >
        <header className="trailcam-header">
          <span className="trailcam-title">TRAIL CAM ALERT</span>
          <span className="trailcam-timestamp">{timestampLabel}</span>
        </header>
        <div className="trailcam-body">
          <div className="trailcam-noise" aria-hidden="true" />
          <div className="trailcam-thermal" aria-hidden="true" />
          <div className="bigfoot-silhouette" aria-hidden="true">
            <span role="img" aria-label="Bigfoot silhouette">🦶</span>
          </div>
          <div className="trailcam-reticle" aria-hidden="true" />
        </div>
        <footer className="trailcam-footer">
          <div className="trailcam-meta">
            <span className="trailcam-label">STATE</span>
            <span className="trailcam-value">{locationLabel}</span>
          </div>
          <div className="trailcam-meta">
            <span className="trailcam-label">FOOTAGE</span>
            <span className="trailcam-value">{qualityLabel}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BigfootTrailCam;
