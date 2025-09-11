import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ActionPhasePopupProps {
  isVisible: boolean;
  truthLevel: number;
  onClose: () => void;
}

const ActionPhasePopup = ({ isVisible, truthLevel, onClose }: ActionPhasePopupProps) => {
  const [teaser, setTeaser] = useState('');

  useEffect(() => {
    if (isVisible) {
      setTeaser(getRandomTeaser());
    }
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onClose]);

  const getConspiracyLevel = () => {
    if (truthLevel >= 70) return 'MAXIMUM ALERT';
    if (truthLevel >= 40) return 'ELEVATED PANIC';
    return 'QUIET DESPERATION';
  };

  const getRandomTeaser = () => {
    const teasers = [
      "Moon beams nominal. Hat tinfoil at the ready.",
      "Bat Boy denies involvement — which only confirms it.",
      "Emergency horoscopes suggest 'spend IP irresponsibly'.",
      "Local grandmother's shortwave radio picks up alien shopping list.",
      "Three-headed chicken found voting in Ohio — twice.",
      "Government weather machine malfunctions: Cats raining dogs.",
      "Mysterious van spotted selling 'truth serum' energy drinks.",
      "Breaking: Pigeons confirmed as government drones, demand workers comp."
    ];
    return teasers[Math.floor(Math.random() * teasers.length)];
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <Card className="bg-newspaper-bg border-4 border-newspaper-border max-w-2xl mx-4 p-0 transform animate-scale-in shadow-2xl">
        <div className="relative">
          {/* Mini Masthead */}
          <div className="bg-newspaper-header p-4 border-b-4 border-newspaper-border text-center">
            <div className="text-xs font-bold tracking-widest opacity-60 mb-1">EST. 1947 • EYES ONLY</div>
            <h1 className="text-2xl font-black tracking-tight font-serif text-newspaper-text">
              THE WEEKLY PARANOID NEWS
            </h1>
            <div className="text-xs opacity-80 mt-1">SPECIAL BULLETIN</div>
          </div>

          {/* Action Phase Header */}
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-black text-newspaper-accent font-serif">ACTION PHASE</span>
              <span className="text-3xl text-truth-red animate-pulse">⚡</span>
            </div>
            <div className="border-b-2 border-newspaper-accent w-32 mx-auto mb-4"></div>
            
            <div className="mb-6">
              <div className="text-sm font-bold text-newspaper-text/80 mb-1">CONSPIRACY LEVEL:</div>
              <div className="text-xl font-black text-truth-red border-2 border-truth-red px-4 py-2 inline-block bg-truth-red/10">
                {getConspiracyLevel()}
              </div>
            </div>

            {/* Rotating Teaser */}
            <div className="bg-newspaper-header/30 p-4 border-l-4 border-newspaper-accent mb-6">
              <div className="text-sm font-bold text-newspaper-text/70 mb-2">📰 BREAKING WEIRD:</div>
              <div className="text-base italic text-newspaper-text leading-relaxed">
                {teaser}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-newspaper-text/60 border-t border-newspaper-border pt-4">
              <div className="font-mono">Click anywhere or press ESC to continue...</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActionPhasePopup;