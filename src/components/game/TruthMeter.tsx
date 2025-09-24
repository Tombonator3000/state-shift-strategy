import { useEffect, useRef, useState } from 'react';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';
import { areParanormalEffectsEnabled } from '@/state/settings';

interface TruthMeterProps {
  value: number; // 0-100
  faction?: "Truth" | "Government";
}

const TruthMeter = ({ value, faction = "Truth" }: TruthMeterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [meltdownActive, setMeltdownActive] = useState(false);
  const lastBroadcastRef = useRef<'surge' | 'collapse' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setMeltdownActive(false);
      return;
    }

    const isExtreme = value >= 95 || value <= 5;
    setMeltdownActive(isExtreme);
  }, [value, prefersReducedMotion]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const mode: 'surge' | 'collapse' | null = value >= 95 ? 'surge' : value <= 5 ? 'collapse' : null;

    if (!mode) {
      lastBroadcastRef.current = null;
      return;
    }

    if (lastBroadcastRef.current === mode) {
      return;
    }

    lastBroadcastRef.current = mode;

    const position = VisualEffectsCoordinator.getElementCenter(containerRef.current);
    const setList = mode === 'surge'
      ? [
        'Suspicious Minds (Disclosure Mix)',
        'All Shook Up (Close Encounter Edit)',
        'Blue Suede Tractor Beam',
      ]
      : [
        'Heartbreak Hotel (Signal Lost)',
        'Return to Sender (Government Edit)',
        'Can\'t Help Falling in Static',
      ];

    if (!areParanormalEffectsEnabled()) {
      return;
    }

    VisualEffectsCoordinator.triggerTruthMeltdownBroadcast({
      position,
      intensity: mode,
      setList,
      truthValue: value,
      reducedMotion: prefersReducedMotion,
      source: faction === 'Truth' ? 'truth' : 'government',
    });
  }, [value, faction, prefersReducedMotion]);
  const getColor = () => {
    if (value >= 95) return 'bg-truth-red';
    if (value <= 5) return 'bg-government-blue';
    return 'bg-gradient-to-r from-government-blue to-truth-red';
  };

  const getGlowEffect = () => {
    if (value >= 95 || value <= 5) {
      return 'animate-truth-pulse';
    }
    return '';
  };

  const getLabel = () => {
    if (faction === "Truth") {
      // Truth faction perspective - higher % = more enlightened
      if (value >= 95) return 'MAXIMUM WOKE';
      if (value >= 90) return 'FULLY AWAKENED';
      if (value >= 80) return 'REDPILLED';
      if (value >= 70) return 'QUESTIONING';
      if (value >= 60) return 'SUSPICIOUS';
      if (value >= 40) return 'SLEEPY';
      if (value >= 20) return 'SHEEPLE MODE';
      if (value >= 10) return 'COMATOSE';
      return 'BRAIN DEAD';
    } else {
      // Government faction perspective - higher % = more dangerous
      if (value >= 95) return 'MAXIMUM PANIC';
      if (value >= 90) return 'CODE RED';
      if (value >= 80) return 'CONTAINMENT BREACH';
      if (value >= 70) return 'CONSPIRACY DETECTED';
      if (value >= 60) return 'ELEVATED THREAT';
      if (value >= 40) return 'MONITORING';
      if (value >= 20) return 'DOCILE';
      if (value >= 10) return 'COMPLIANT';
      return 'PERFECT CITIZEN';
    }
  };

  const getStatusMessage = () => {
    if (faction === "Truth") {
      if (value >= 95) return '👁️ THE VEIL IS LIFTED 👁️';
      if (value <= 5) return '😴 THEY LIVE, WE SLEEP 😴';
    } else {
      if (value >= 95) return '🚨 NARRATIVE COLLAPSE 🚨';
      if (value <= 5) return '✅ OPERATION SUCCESS ✅';
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-secret-red/30"
    >
      <div className="text-sm font-mono font-bold text-secret-red">TRUTH-O-METER™</div>
      
      <div className={`relative w-40 ${getGlowEffect()}`}>
        <div className="relative h-4 bg-black rounded border border-secret-red/50 overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
              value >= 95 ? 'bg-truth-red' :
              value <= 5 ? 'bg-government-blue' :
              'bg-gradient-to-r from-government-blue via-yellow-500 to-truth-red'
            }`}
            style={{ width: `${value}%` }}
          />

          {/* Animated scanlines */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        </div>

        {meltdownActive && (
          <div className="truth-meltdown-overlay" aria-hidden="true">
            <div className="truth-meltdown-scanlines" />
            <div className="truth-meltdown-stripes" />
            <div className="truth-meltdown-sparks" />
            <div className="truth-meltdown-warning">
              <span>WE INTERRUPT THIS BROADCAST</span>
              <strong>{`TRUTH LEVEL ${value}%`}</strong>
            </div>
          </div>
        )}

        {/* Critical thresholds with labels */}
        <div className="absolute -bottom-2 left-[5%] transform -translate-x-1/2">
          <div className="w-0.5 h-2 bg-government-blue"></div>
          <div className="text-xs font-mono text-government-blue mt-1">5%</div>
        </div>
        <div className="absolute -bottom-2 left-[95%] transform -translate-x-1/2">
          <div className="w-0.5 h-2 bg-truth-red"></div>
          <div className="text-xs font-mono text-truth-red mt-1">95%</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-lg font-mono font-bold min-w-12 text-center">
          {value}%
        </div>
        <div className={`text-xs font-mono text-center ${
          value >= 95 ? 'text-truth-red' :
          value <= 5 ? 'text-government-blue' :
          'text-yellow-500'
        }`}>
          {getLabel()}
        </div>
      </div>
      
      {/* Status indicators with glitch effects */}
      {getStatusMessage() && (
        <div className={`text-xs font-mono animate-glitch ${
          value >= 95 ? 'text-truth-red' : 'text-government-blue'
        }`}>
          {getStatusMessage()}
        </div>
      )}
    </div>
  );
};

export default TruthMeter;
