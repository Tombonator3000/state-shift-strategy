import React, { useEffect, useRef, useState } from 'react';

interface PhaseTransitionProps {
  phase: string;
  previousPhase: string;
  onComplete: () => void;
}

const PhaseTransition = ({ phase, previousPhase, onComplete }: PhaseTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');

  // Guarded dismiss to avoid double-calls
  const completedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const failSafeRef = useRef<number | null>(null);

  const dismiss = (source: 'auto' | 'click' | 'esc' | 'failsafe') => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsVisible(false);
    console.debug('[PhaseTransition] dismiss', { source, phase, previousPhase });
    try {
      onComplete?.();
    } catch (e) {
      console.error('[PhaseTransition] onComplete error', e);
    }
  };

  useEffect(() => {
    if (phase !== previousPhase) {
      setIsVisible(true);

      const phaseTexts: Record<string, string> = {
        'income': '💰 INCOME PHASE',
        'action': '⚡ ACTION PHASE', 
        'ai_turn': '🤖 DEEP STATE TURN',
        'event': '📰 EVENT PHASE',
        'newspaper': '📰 BREAKING NEWS',
        'capture': '🎯 CAPTURE PHASE'
      };

      setCurrentText(phaseTexts[phase] || `${phase.toUpperCase()} PHASE`);

      // Clear any previous timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (failSafeRef.current) clearTimeout(failSafeRef.current);
      completedRef.current = false;

      // Auto hide after animation
      timerRef.current = window.setTimeout(() => dismiss('auto'), 2500);
      // Extra failsafe in case something blocks the first timeout
      failSafeRef.current = window.setTimeout(() => dismiss('failsafe'), 4000);

      console.debug('[PhaseTransition] show', { from: previousPhase, to: phase });

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (failSafeRef.current) clearTimeout(failSafeRef.current);
      };
    }
  }, [phase, previousPhase, onComplete]);

  // ESC to dismiss when visible
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss('esc');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={() => dismiss('click')}
    >
      <div className="bg-newspaper-text text-newspaper-bg p-8 border-4 border-truth-red font-mono text-center transform animate-[phase-enter_2.5s_ease-out] shadow-xl">
        <div className="text-4xl font-bold mb-4">[CLASSIFIED INTEL]</div>
        <div className="text-2xl mb-2">{currentText}</div>
        <div className="text-sm opacity-70">Conspiracy Level: MAXIMUM</div>
        <div className="mt-4 w-32 h-1 bg-truth-red animate-pulse mx-auto"></div>
        <div className="mt-3 text-xs opacity-60">Klikk eller trykk ESC for å fortsette</div>
      </div>
    </div>
  );
};

export default PhaseTransition;