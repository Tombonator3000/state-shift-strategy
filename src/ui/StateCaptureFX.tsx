import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameUiFeed } from '@/hooks/useGameUiFeed';
import type { UiEvent } from '@/hooks/useGameUiFeed';

interface Highlight {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  by: 'P1' | 'P2';
}

const COLOR_MAP: Record<'P1' | 'P2', { border: string; glow: string }> = {
  P1: { border: 'border-truth-red', glow: 'shadow-[0_0_24px_rgba(190,0,0,0.55)]' },
  P2: { border: 'border-government-blue', glow: 'shadow-[0_0_24px_rgba(14,98,253,0.55)]' },
};

const createId = () => `capture-${Math.random().toString(36).slice(2)}-${Date.now()}`;

export const StateCaptureFX = () => {
  const { subscribe, settings } = useGameUiFeed();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!settings.showStateCaptureEffects) {
      setHighlights([]);
      timers.current.forEach(id => window.clearTimeout(id));
      timers.current = [];
      return;
    }

    const handler = (event: UiEvent) => {
      if (!settings.showStateCaptureEffects || event.type !== 'STATE_CAPTURED') {
        return;
      }

      const selector = `[data-state-id="${event.stateId}"]`;
      const altSelector = `[data-state-abbr="${event.stateId}"]`;
      const node = document.querySelector<HTMLElement>(selector) || document.querySelector<HTMLElement>(altSelector);
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const id = createId();
      setHighlights(prev => [
        ...prev,
        {
          id,
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          by: event.by,
        },
      ]);

      const timer = window.setTimeout(() => {
        setHighlights(prev => prev.filter(item => item.id !== id));
        timers.current = timers.current.filter(entry => entry !== timer);
      }, 700);
      timers.current.push(timer);
    };

    const unsubscribe = subscribe(handler);
    return () => {
      unsubscribe();
      timers.current.forEach(id => window.clearTimeout(id));
      timers.current = [];
    };
  }, [settings.showStateCaptureEffects, subscribe]);

  if (!settings.showStateCaptureEffects || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {highlights.map(item => {
        const palette = COLOR_MAP[item.by];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`pointer-events-none fixed ${palette.border} ${palette.glow} rounded-full border-4 mix-blend-screen`}
            style={{
              top: item.top - item.height * 0.1,
              left: item.left - item.width * 0.1,
              width: item.width * 1.2,
              height: item.height * 1.2,
            }}
          />
        );
      })}
    </AnimatePresence>,
    document.body,
  );
};

export default StateCaptureFX;
