import React, { useEffect, useState } from 'react';

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface FloatingNumbersProps {
  trigger?: { value: number; type: 'ip' | 'truth' | 'damage' };
}

const FloatingNumbers = ({ trigger }: FloatingNumbersProps) => {
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

  useEffect(() => {
    if (trigger) {
      const newNumber: FloatingNumber = {
        id: `${Date.now()}-${Math.random()}`,
        value: trigger.value,
        x: Math.random() * 200,
        y: Math.random() * 100,
        color: trigger.type === 'ip' ? 'text-truth-red' : trigger.type === 'truth' ? 'text-government-blue' : 'text-destructive',
        timestamp: Date.now()
      };

      setNumbers(prev => [...prev, newNumber]);

      // Remove after animation completes
      setTimeout(() => {
        setNumbers(prev => prev.filter(n => n.id !== newNumber.id));
      }, 2000);
    }
  }, [trigger]);

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
          }}
        >
          {number.value > 0 ? `+${number.value}` : number.value}
        </div>
      ))}
    </div>
  );
};

export default FloatingNumbers;