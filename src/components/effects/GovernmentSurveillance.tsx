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

  const agencyCode = useMemo(() => {
    const codes = ['NSA', 'CIA', 'FBI', 'DHS', 'DOD', '███'];
    return codes[Math.floor(Math.random() * codes.length)];
  }, []);

  const classificationLevel = useMemo(() => {
    const levels = ['CONFIDENTIAL', 'SECRET', 'TOP SECRET', '█████████'];
    return levels[Math.floor(Math.random() * levels.length)];
  }, []);

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
        <div className="surveillance-crosshair" />
        <div className="surveillance-grid" />
        <div className="surveillance-scanline" 
             style={{ transform: `translateY(${scanProgress * 2}px)` }} />
        
        <div className="surveillance-hud">
          <div className="hud-corner hud-corner--tl" />
          <div className="hud-corner hud-corner--tr" />
          <div className="hud-corner hud-corner--bl" />
          <div className="hud-corner hud-corner--br" />
        </div>

        <div className="surveillance-data">
          <div className="data-header">
            <span className="agency-code">{agencyCode}</span>
            <span className="classification">{classificationLevel}</span>
          </div>
          
          <div className="data-body">
            <div className="data-row">
              <span className="label">TARGET:</span>
              <span className="value">{targetName}</span>
            </div>
            <div className="data-row">
              <span className="label">THREAT:</span>
              <span className={`value threat-${threatLevel.toLowerCase()}`}>
                {threatLevel}
              </span>
            </div>
            <div className="data-row">
              <span className="label">SCAN:</span>
              <span className="value">{scanProgress}%</span>
            </div>
          </div>

          {scanProgress >= 100 && (
            <div className="scan-complete">
              <span className="status-text">
                {threatLevel === 'HIGH' ? '⚠️ SUBJECT FLAGGED' : '✓ SCAN COMPLETE'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="surveillance-noise" />
      {isScanning && <div className="surveillance-pulse" />}
    </div>
  );
};

export default GovernmentSurveillance;