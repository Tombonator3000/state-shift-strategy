import React, { useEffect, useState, useMemo } from 'react';

interface StaticInterferenceProps {
  x: number;
  y: number;
  intensity: 'light' | 'medium' | 'heavy' | 'signal-lost';
  message?: string;
  duration?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const StaticInterference: React.FC<StaticInterferenceProps> = ({
  x,
  y,
  intensity,
  message = 'SIGNAL INTERFERENCE DETECTED',
  duration = 3000,
  reducedMotion = false,
  onComplete
}) => {
  const [staticPattern, setStaticPattern] = useState('');
  const [signalStrength, setSignalStrength] = useState(100);

  useEffect(() => {
    if (reducedMotion) {
      setTimeout(onComplete, 1000);
      return;
    }

    // Generate random static pattern
    const generateStatic = () => {
      const chars = ['█', '▓', '▒', '░', '▬', '▭', '▮', '▯'];
      let pattern = '';
      for (let i = 0; i < 200; i++) {
        pattern += chars[Math.floor(Math.random() * chars.length)];
      }
      return pattern;
    };

    // Update static pattern periodically
    const staticInterval = setInterval(() => {
      setStaticPattern(generateStatic());
    }, 100);

    // Simulate signal degradation
    const signalInterval = setInterval(() => {
      setSignalStrength(prev => {
        const newStrength = prev - Math.random() * 10;
        return Math.max(0, newStrength);
      });
    }, 200);

    // Complete effect after duration
    const completeTimer = setTimeout(() => {
      clearInterval(staticInterval);
      clearInterval(signalInterval);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(staticInterval);
      clearInterval(signalInterval);
      clearTimeout(completeTimer);
    };
  }, [duration, reducedMotion, onComplete]);

  const interferenceStyle = useMemo(() => ({
    '--interference-x': `${x}px`,
    '--interference-y': `${y}px`,
    '--signal-strength': `${signalStrength}%`,
  }) as React.CSSProperties, [x, y, signalStrength]);

  const getIntensityClass = () => {
    switch (intensity) {
      case 'light': return 'static-light';
      case 'medium': return 'static-medium';
      case 'heavy': return 'static-heavy';
      case 'signal-lost': return 'static-lost';
      default: return 'static-medium';
    }
  };

  const getEmergencyFrequencies = () => [
    '102.5 FM - EMERGENCY BROADCAST',
    '87.9 FM - GOVERNMENT FREQUENCY',
    '156.8 MHz - CLASSIFIED CHANNEL',
    '███.█ MHz - [REDACTED]'
  ];

  if (reducedMotion) {
    return (
      <div
        className="static-interference-simple"
        style={interferenceStyle}
        role="alert"
        aria-live="assertive"
      >
        <div className="simple-message">{message}</div>
      </div>
    );
  }

  return (
    <div
      className={`static-interference ${getIntensityClass()}`}
      style={interferenceStyle}
      role="alert"
      aria-live="assertive"
    >
      <div className="tv-screen">
        <div className="static-overlay">
          <div className="static-pattern">{staticPattern}</div>
          <div className="scan-lines" />
          <div className="signal-bars">
            {[1, 2, 3, 4, 5].map(bar => (
              <div
                key={bar}
                className={`signal-bar ${signalStrength > bar * 20 ? 'active' : 'inactive'}`}
              />
            ))}
          </div>
        </div>

        <div className="interference-content">
          <div className="emergency-header">
            <span className="emergency-icon">📡</span>
            <span className="emergency-text">SIGNAL DISRUPTION</span>
          </div>

          <div className="message-display">
            <div className="message-text">{message}</div>
            <div className="signal-strength">
              STRENGTH: {Math.round(signalStrength)}%
            </div>
          </div>

          <div className="frequency-scan">
            <div className="scan-header">SCANNING FREQUENCIES...</div>
            {getEmergencyFrequencies().map((freq, index) => (
              <div
                key={index}
                className={`frequency-line ${Math.random() > 0.5 ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {freq}
              </div>
            ))}
          </div>
        </div>

        <div className="interference-noise" />
      </div>
    </div>
  );
};

export default StaticInterference;