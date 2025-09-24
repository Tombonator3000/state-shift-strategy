import React, { useEffect, useState } from 'react';
import { useGameSettings } from '@/contexts/GameSettingsContext';

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface FloatingNumbersProps {
  trigger?: { 
    value: number; 
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain';
    x?: number;
    y?: number;
  };
}

const FloatingNumbers = ({ trigger }: FloatingNumbersProps) => {
  const { settings } = useGameSettings();
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

  const getSmartPosition = (existingNumbers: FloatingNumber[]): { x: number; y: number } => {
    const baseX = trigger?.x ?? Math.random() * 200;
    const baseY = trigger?.y ?? Math.random() * 100;
    
    // Avoid overlapping with existing numbers
    let x = baseX;
    let y = baseY;
    
    for (const existing of existingNumbers) {
      const distance = Math.sqrt((x - existing.x) ** 2 + (y - existing.y) ** 2);
      if (distance < 60) { // Too close, adjust position
        x = baseX + (Math.random() - 0.5) * 100;
        y = baseY + (Math.random() - 0.5) * 60;
      }
    }
    
    return { x: Math.max(10, Math.min(x, window.innerWidth - 100)), y: Math.max(10, Math.min(y, 200)) };
  };

  const getNumberColor = (type: string): string => {
    switch (type) {
      case 'ip': return 'text-truth-red';
      case 'truth': return 'text-government-blue';
      case 'damage': return 'text-destructive';
      case 'synergy': return 'text-purple-400';
      case 'combo': return 'text-yellow-400';
      case 'chain': return 'text-cyan-400';
      default: return 'text-foreground';
    }
  };

  useEffect(() => {
    if (!settings.enableAnimations || !trigger) {
      return;
    }

    if (trigger) {
      setNumbers(prev => {
        const position = getSmartPosition(prev);
        const newNumber: FloatingNumber = {
          id: `${Date.now()}-${Math.random()}`,
          value: trigger.value,
          x: position.x,
          y: position.y,
          color: getNumberColor(trigger.type),
          timestamp: Date.now()
        };

        // Remove after animation completes (longer for special types)
        const duration = ['synergy', 'combo', 'chain'].includes(trigger.type) ? 3000 : 2000;
        setTimeout(() => {
          setNumbers(current => current.filter(n => n.id !== newNumber.id));
        }, duration);

        return [...prev, newNumber];
      });
    }
  }, [trigger, settings.enableAnimations]);

  if (!settings.enableAnimations) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {numbers.map(number => (
        <div
          key={number.id}
          className={`absolute font-mono font-bold text-2xl ${number.color} animate-[float-up_2s_ease-out_forwards]`}
          style={{
            left: `${number.x}px`,
            top: `${number.y}px`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontSize: ['synergy', 'combo', 'chain'].includes(getTypeFromColor(number.color)) ? '1.75rem' : '1.5rem'
          }}
        >
          {formatNumberDisplay(number.value, getTypeFromColor(number.color))}
        </div>
      ))}
    </div>
  );

  function getTypeFromColor(color: string): string {
    switch (color) {
      case 'text-purple-400': return 'synergy';
      case 'text-yellow-400': return 'combo';
      case 'text-cyan-400': return 'chain';
      default: return 'normal';
    }
  }

  function formatNumberDisplay(value: number, type: string): string {
    const baseDisplay = value > 0 ? `+${value}` : `${value}`;
    switch (type) {
      case 'synergy': return `🔗 ${baseDisplay}`;
      case 'combo': return `⚡ ${baseDisplay}`;
      case 'chain': return `🌊 ${baseDisplay}`;
      default: return baseDisplay;
    }
  }
};

export default FloatingNumbers;