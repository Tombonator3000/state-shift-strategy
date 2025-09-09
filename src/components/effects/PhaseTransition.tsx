import React, { useEffect, useState } from 'react';

interface PhaseTransitionProps {
  phase: string;
  previousPhase: string;
  onComplete: () => void;
}

const PhaseTransition = ({ phase, previousPhase, onComplete }: PhaseTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');

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

      // Hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [phase, previousPhase, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-newspaper-text text-newspaper-bg p-8 border-4 border-truth-red font-mono text-center transform animate-[phase-enter_2.5s_ease-out]">
        <div className="text-4xl font-bold mb-4">[CLASSIFIED INTEL]</div>
        <div className="text-2xl mb-2">{currentText}</div>
        <div className="text-sm opacity-70">Conspiracy Level: MAXIMUM</div>
        <div className="mt-4 w-32 h-1 bg-truth-red animate-pulse mx-auto"></div>
      </div>
    </div>
  );
};

export default PhaseTransition;