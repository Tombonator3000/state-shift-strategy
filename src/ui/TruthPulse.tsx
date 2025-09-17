import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameUiFeed } from '@/hooks/useGameUiFeed';
import type { UiEvent } from '@/hooks/useGameUiFeed';

interface TruthPulseTag {
  id: string;
  delta: number;
  newValue: number;
}

const createId = () => `truth-${Math.random().toString(36).slice(2)}-${Date.now()}`;

export const TruthPulse = () => {
  const { subscribe, settings } = useGameUiFeed();
  const [pulse, setPulse] = useState(false);
  const [tags, setTags] = useState<TruthPulseTag[]>([]);
  const pendingRef = useRef<{ delta: number; newValue: number; timeout: number | null }>({ delta: 0, newValue: 0, timeout: null });
  const tagTimers = useRef<number[]>([]);
  const pulseTimerRef = useRef<number | null>(null);

  const triggerPulse = useMemo(
    () => () => {
      setPulse(true);
      if (pulseTimerRef.current) {
        window.clearTimeout(pulseTimerRef.current);
      }
      pulseTimerRef.current = window.setTimeout(() => {
        setPulse(false);
        pulseTimerRef.current = null;
      }, 420);
    },
    [],
  );

  useEffect(() => {
    if (!settings.showResourceAnimations) {
      setTags([]);
      setPulse(false);
      return;
    }

    const flushPending = () => {
      const pending = pendingRef.current;
      if (!pending || pending.delta === 0) return;
      const id = createId();
      setTags(prev => [...prev, { id, delta: pending.delta, newValue: pending.newValue }]);
      const removalTimer = window.setTimeout(() => {
        setTags(prev => prev.filter(tag => tag.id !== id));
        tagTimers.current = tagTimers.current.filter(handle => handle !== removalTimer);
      }, 700);
      tagTimers.current.push(removalTimer);
      triggerPulse();
      pending.delta = 0;
      pending.newValue = 0;
      if (pending.timeout) {
        window.clearTimeout(pending.timeout);
        pending.timeout = null;
      }
    };

    const handler = (event: UiEvent) => {
      if (!settings.showResourceAnimations || event.type !== 'TRUTH_CHANGED') {
        return;
      }

      const pending = pendingRef.current;
      pending.delta += event.delta;
      pending.newValue = event.newValue;
      if (pending.timeout) {
        window.clearTimeout(pending.timeout);
      }
      pending.timeout = window.setTimeout(flushPending, 200);
    };

    const unsubscribe = subscribe(handler);
    return () => {
      unsubscribe();
      const pending = pendingRef.current;
      if (pending.timeout) {
        window.clearTimeout(pending.timeout);
        pending.timeout = null;
      }
      tagTimers.current.forEach(timer => window.clearTimeout(timer));
      tagTimers.current = [];
      if (pulseTimerRef.current) {
        window.clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, [settings.showResourceAnimations, subscribe, triggerPulse]);

  if (!settings.showResourceAnimations) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {pulse && (
          <motion.div
            key="truth-pulse"
            className="absolute inset-0 rounded-md border border-black/20 bg-white/10"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.4, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
      <div className="absolute right-0 bottom-full flex flex-col gap-1 items-end pr-1">
        <AnimatePresence>
          {tags.map(tag => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -12 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded bg-black text-white shadow-md`}
            >
              Truth {tag.delta > 0 ? `+${tag.delta}` : tag.delta}%
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TruthPulse;
