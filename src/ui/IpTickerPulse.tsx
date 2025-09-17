import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameUiFeed } from '@/hooks/useGameUiFeed';
import type { UiEvent } from '@/hooks/useGameUiFeed';

interface IpTickerPulseProps {
  playerId: 'P1' | 'P2';
  children: ReactNode;
  align?: 'left' | 'right';
}

interface IpTag {
  id: string;
  delta: number;
}

const createId = () => `ip-${Math.random().toString(36).slice(2)}-${Date.now()}`;

export const IpTickerPulse = ({ playerId, children, align = 'right' }: IpTickerPulseProps) => {
  const { subscribe, settings } = useGameUiFeed();
  const [shake, setShake] = useState(false);
  const [tags, setTags] = useState<IpTag[]>([]);
  const pendingRef = useRef<{ delta: number; timeout: number | null }>({ delta: 0, timeout: null });
  const removalTimers = useRef<number[]>([]);
  const shakeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!settings.showResourceAnimations) {
      setTags([]);
      setShake(false);
      return;
    }

    const flush = () => {
      const pending = pendingRef.current;
      if (pending.delta === 0) return;
      const id = createId();
      setTags(prev => [...prev, { id, delta: pending.delta }]);
      const timer = window.setTimeout(() => {
        setTags(prev => prev.filter(tag => tag.id !== id));
        removalTimers.current = removalTimers.current.filter(entry => entry !== timer);
      }, 650);
      removalTimers.current.push(timer);
      pending.delta = 0;
      if (pending.timeout) {
        window.clearTimeout(pending.timeout);
        pending.timeout = null;
      }
      setShake(true);
      if (shakeTimer.current) {
        window.clearTimeout(shakeTimer.current);
      }
      shakeTimer.current = window.setTimeout(() => {
        setShake(false);
        shakeTimer.current = null;
      }, 360);
    };

    const handler = (event: UiEvent) => {
      if (!settings.showResourceAnimations || event.type !== 'IP_CHANGED' || event.playerId !== playerId) {
        return;
      }

      const pending = pendingRef.current;
      pending.delta += event.delta;
      if (pending.timeout) {
        window.clearTimeout(pending.timeout);
      }
      pending.timeout = window.setTimeout(flush, 200);
    };

    const unsubscribe = subscribe(handler);
    return () => {
      unsubscribe();
      const pending = pendingRef.current;
      if (pending.timeout) {
        window.clearTimeout(pending.timeout);
        pending.timeout = null;
      }
      removalTimers.current.forEach(timer => window.clearTimeout(timer));
      removalTimers.current = [];
      if (shakeTimer.current) {
        window.clearTimeout(shakeTimer.current);
        shakeTimer.current = null;
      }
    };
  }, [playerId, settings.showResourceAnimations, subscribe]);

  return (
    <motion.div
      animate={shake ? { x: 2 } : { x: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative"
    >
      {children}
      {settings.showResourceAnimations && (
        <div
          className={`absolute ${align === 'right' ? 'right-0 items-end pr-1' : 'left-0 items-start pl-1'} top-full flex flex-col gap-1 pointer-events-none`}
        >
          <AnimatePresence>
            {tags.map(tag => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -10 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded bg-black text-white shadow-md"
              >
                {tag.delta > 0 ? `+${tag.delta}` : tag.delta} IP
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default IpTickerPulse;
