import React, { useEffect, useState } from 'react';
import {
  isSynergyEffectIdentifier,
  SYNERGY_EFFECT_PRESETS,
  type SynergyEffectIdentifier
} from '@/utils/synergyEffects';

type FloatingNumberType = 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain' | SynergyEffectIdentifier;

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  type: FloatingNumberType;
  timestamp: number;
}

interface FloatingNumbersProps {
  trigger?: {
    value: number;
    type: FloatingNumberType;
    x?: number;
    y?: number;
  };
}

interface FloatingNumberAppearance {
  textClass: string;
  shadow: string;
  fontSize: string;
  prefix?: string;
  filter?: string;
}

const DEFAULT_SHADOW = '2px 2px 4px rgba(0,0,0,0.8)';

const BASE_APPEARANCES: Record<Exclude<FloatingNumberType, SynergyEffectIdentifier>, FloatingNumberAppearance> = {
  ip: {
    textClass: 'text-truth-red',
    shadow: DEFAULT_SHADOW,
    fontSize: '1.5rem'
  },
  truth: {
    textClass: 'text-government-blue',
    shadow: DEFAULT_SHADOW,
    fontSize: '1.5rem'
  },
  damage: {
    textClass: 'text-destructive',
    shadow: DEFAULT_SHADOW,
    fontSize: '1.55rem'
  },
  synergy: {
    textClass: 'text-purple-400',
    shadow: '0 0 16px rgba(168, 85, 247, 0.55)',
    fontSize: '1.75rem',
    prefix: '🔗',
    filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.35))'
  },
  combo: {
    textClass: 'text-yellow-400',
    shadow: '0 0 16px rgba(252, 211, 77, 0.55)',
    fontSize: '1.75rem',
    prefix: '⚡',
    filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.35))'
  },
  chain: {
    textClass: 'text-cyan-400',
    shadow: '0 0 16px rgba(103, 232, 249, 0.55)',
    fontSize: '1.75rem',
    prefix: '🌊',
    filter: 'drop-shadow(0 0 10px rgba(103, 232, 249, 0.35))'
  }
};

const LONG_DURATION_TYPES = new Set<FloatingNumberType>([
  'synergy',
  'combo',
  'chain',
  ...(Object.keys(SYNERGY_EFFECT_PRESETS) as SynergyEffectIdentifier[])
]);

const FloatingNumbers = ({ trigger }: FloatingNumbersProps) => {
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

  const getAppearance = (type: FloatingNumberType): FloatingNumberAppearance => {
    if (isSynergyEffectIdentifier(type)) {
      const preset = SYNERGY_EFFECT_PRESETS[type];
      return {
        textClass: preset.floating.textClass,
        shadow: preset.floating.shadow,
        fontSize: preset.floating.fontSize,
        prefix: preset.floating.prefix,
        filter: preset.floating.filter
      };
    }

    return BASE_APPEARANCES[type] ?? {
      textClass: 'text-white',
      shadow: DEFAULT_SHADOW,
      fontSize: '1.5rem'
    };
  };

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

  useEffect(() => {
    if (trigger) {
      setNumbers(prev => {
        const position = getSmartPosition(prev);
        const newNumber: FloatingNumber = {
          id: `${Date.now()}-${Math.random()}`,
          value: trigger.value,
          x: position.x,
          y: position.y,
          type: trigger.type,
          timestamp: Date.now()
        };

        // Remove after animation completes (longer for special types)
        const duration = LONG_DURATION_TYPES.has(trigger.type) ? 3000 : 2000;
        setTimeout(() => {
          setNumbers(current => current.filter(n => n.id !== newNumber.id));
        }, duration);

        return [...prev, newNumber];
      });
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {numbers.map(number => {
        const appearance = getAppearance(number.type);
        return (
          <div
            key={number.id}
            className={`absolute font-mono font-bold text-2xl ${appearance.textClass} animate-[float-up_2s_ease-out_forwards]`}
            style={{
              left: `${number.x}px`,
              top: `${number.y}px`,
              textShadow: appearance.shadow || DEFAULT_SHADOW,
              fontSize: appearance.fontSize,
              filter: appearance.filter
            }}
          >
            {formatNumberDisplay(number.value, number.type, appearance.prefix)}
          </div>
        );
      })}
    </div>
  );

  function formatNumberDisplay(value: number, _type: FloatingNumberType, prefix?: string): string {
    const baseDisplay = value > 0 ? `+${value}` : `${value}`;
    return prefix ? `${prefix} ${baseDisplay}` : baseDisplay;
  }
};

export default FloatingNumbers;