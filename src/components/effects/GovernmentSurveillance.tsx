import React, { useEffect, useState, useMemo } from 'react';

interface GovernmentSurveillanceProps {
  x: number;
  y: number;
  targetName?: string;
  threatLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CLASSIFIED';
  duration?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const GovernmentSurveillance: React.FC<GovernmentSurveillanceProps> = ({
  x,
  y,
  targetName = 'UNKNOWN SUBJECT',
  threatLevel = 'MEDIUM',
  duration = 3500,
  reducedMotion = false,
  onComplete
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }

    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          setIsScanning(false);
          clearInterval(scanInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(scanInterval);
  }, [reducedMotion, onComplete]);

  const overlayStyle = useMemo(() => ({
    '--surveillance-x': `${x}px`,
    '--surveillance-y': `${y}px`,
    '--threat-level': threatLevel.toLowerCase(),
  }) as React.CSSProperties, [x, y, threatLevel]);

  if (reducedMotion) return null;

  return (
    <div
      className={`government-surveillance threat-${threatLevel.toLowerCase()}`}
      style={overlayStyle}
      role="status"
      aria-live="polite"
      aria-label={`Government surveillance scanning ${targetName}`}
    >
      <div className="surveillance-frame">
        <div className="surveillance-redaction-overlay">
          <div className="redaction-header">
            <div className="redaction-label">CLEARANCE CHECK</div>
            <div className="redaction-target">{targetName}</div>
          </div>

          <div className="redaction-body">
            <div className="redaction-stripe redaction-stripe--primary" />
            <div className="redaction-stripe redaction-stripe--secondary" />
            <div className="redaction-stripe redaction-stripe--primary" />
            <div className="redaction-progress">
              <span className="redaction-label">SCANNING…</span>
              <div className="redaction-bar">
                <div className="redaction-bar-fill" style={{ width: `${scanProgress}%` }} />
              </div>
              <span className="redaction-progress-label">{scanProgress}%
              </span>
            </div>
            <div className={`redaction-status ${threatLevel === 'HIGH' ? 'redaction-status--alert' : ''}`}>
              <span>{threatLevel === 'HIGH' ? 'SUBJECT FLAGGED' : 'SCAN COMPLETE'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="surveillance-noise" />
      {isScanning && <div className="surveillance-pulse" />}
    </div>
  );
};

export default GovernmentSurveillance;