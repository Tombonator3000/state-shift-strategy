import React, { useEffect, useState, useMemo } from 'react';

interface BreakingNewsTickerProps {
  x: number;
  y: number;
  newsText: string;
  duration?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  x,
  y,
  newsText,
  duration = 4000,
  reducedMotion = false,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const tickerStyle = useMemo(() => ({
    '--ticker-x': `${x}px`,
    '--ticker-y': `${y}px`,
  }) as React.CSSProperties, [x, y]);

  const headlines = useMemo(() => [
    `🚨 BREAKING: ${newsText}`,
    `📰 EXCLUSIVE: ${newsText}`,
    `⚡ URGENT: ${newsText}`,
    `🔥 HOT STORY: ${newsText}`
  ], [newsText]);

  const selectedHeadline = useMemo(() => 
    headlines[Math.floor(Math.random() * headlines.length)], [headlines]);

  if (!isVisible) return null;

  return (
    <div
      className={`breaking-news-ticker ${reducedMotion ? 'reduced-motion' : ''}`}
      style={tickerStyle}
      role="alert"
      aria-live="assertive"
    >
      <div className="ticker-container">
        <div className="ticker-header">
          <span className="ticker-logo">📺 PARANOID TIMES</span>
          <div className="ticker-flash" />
        </div>
        <div className="ticker-content">
          <div className="ticker-scroll">
            <span className="ticker-text">{selectedHeadline}</span>
            <span className="ticker-separator">•••</span>
            <span className="ticker-text">{selectedHeadline}</span>
          </div>
        </div>
        <div className="ticker-border" />
      </div>
    </div>
  );
};

export default BreakingNewsTicker;