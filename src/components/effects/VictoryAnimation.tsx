import React, { useEffect, useState } from 'react';

interface VictoryAnimationProps {
  isVictory: boolean;
  victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null;
  onComplete: () => void;
}

const VictoryAnimation = ({ isVictory, victoryType, onComplete }: VictoryAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVictory) {
      setIsVisible(true);
      
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2000
      }));
      setConfetti(particles);

      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVictory, onComplete]);

  if (!isVisible) return null;

  const victoryMessages = {
    states: {
      title: '🗺️ TERRITORIAL DOMINANCE',
      subtitle: 'You control the conspiracy network!',
      description: 'State control has reached critical mass'
    },
    ip: {
      title: '💰 INFLUENCE SUPREMACY',
      subtitle: 'Your power knows no bounds!',
      description: 'Influence Points exceed operational limits'
    },
    truth: {
      title: '🔍 TRUTH REVEALED',
      subtitle: 'The people know everything!',
      description: 'Truth meter has reached awakening threshold'
    },
    agenda: {
      title: '📋 MISSION ACCOMPLISHED',
      subtitle: 'Secret agenda complete!',
      description: 'Classified objectives achieved'
    }
  };

  const message = victoryMessages[victoryType as keyof typeof victoryMessages] || victoryMessages.states;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      {/* Confetti */}
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-truth-red animate-[confetti_3s_ease-out_infinite]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`
          }}
        />
      ))}

      <div className="bg-newspaper-text text-newspaper-bg p-12 border-8 border-truth-red font-mono text-center transform animate-[victory-bounce_5s_ease-out]">
        <div className="text-6xl font-bold mb-6 text-truth-red animate-pulse">
          [VICTORY]
        </div>
        
        <div className="text-4xl font-bold mb-4">
          {message.title}
        </div>
        
        <div className="text-2xl mb-4 text-government-blue">
          {message.subtitle}
        </div>
        
        <div className="text-lg opacity-80 mb-6">
          {message.description}
        </div>

        <div className="text-sm bg-black/20 p-4 rounded">
          OPERATION STATUS: ✅ COMPLETE
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <div className="w-4 h-4 bg-truth-red animate-ping"></div>
          <div className="w-4 h-4 bg-government-blue animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-4 h-4 bg-truth-red animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default VictoryAnimation;