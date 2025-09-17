import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameUiFeed } from '@/hooks/useGameUiFeed';
import { summarizeCardEffects } from './cardEffects';

export const ActionLogPanel = () => {
  const { actionLog, settings } = useGameUiFeed();
  const [open, setOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const entries = useMemo(() => actionLog.filter(entry => entry.event.type !== 'TRUTH_CHANGED' || entry.event.delta !== 0), [actionLog]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [entries, open]);

  if (!settings.showActionLogPanel) {
    return null;
  }

  return (
    <div className="relative" aria-live="polite">
      <button
        type="button"
        className="absolute -left-14 top-4 bg-newspaper-text text-newspaper-bg border-2 border-black px-2 py-1 text-xs font-bold uppercase tracking-[0.3em] shadow-md"
        onClick={() => setOpen(prev => !prev)}
      >
        Log
      </button>
      <AnimatePresence>
        {open && (
          <motion.aside
            key="action-log"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-64 bg-newspaper-text text-newspaper-bg border-l-4 border-black shadow-2xl h-full flex flex-col"
          >
            <div className="px-4 py-3 border-b border-black/30">
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">Opponent Feed</h2>
            </div>
            <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {entries.map(entry => {
                if (entry.event.type === 'OPP_PLAYED_CARD' && entry.card) {
                  const effects = summarizeCardEffects(entry.card);
                  return (
                    <div key={entry.id} className="border border-black/20 p-2 bg-white/90">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span>{entry.card.type}</span>
                        <span>Cost {entry.card.cost}</span>
                      </div>
                      <div className="text-sm font-black leading-tight">{entry.card.name}</div>
                      {effects.length > 0 && (
                        <ul className="mt-1 space-y-1 text-xs font-semibold">
                          {effects.map(effect => (
                            <li key={effect}>• {effect}</li>
                          ))}
                        </ul>
                      )}
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Turn {entry.turn ?? '—'}</div>
                    </div>
                  );
                }

                if (entry.event.type === 'STATE_CAPTURED') {
                  return (
                    <div key={entry.id} className="border border-black/20 p-2 bg-white/70">
                      <div className="text-xs font-semibold uppercase">State Captured</div>
                      <div className="text-sm font-black">{entry.event.stateId}</div>
                    </div>
                  );
                }

                if (entry.event.type === 'TRUTH_CHANGED') {
                  return (
                    <div key={entry.id} className="border border-black/20 p-2 bg-white/70">
                      <div className="text-xs font-semibold uppercase">Truth Shift</div>
                      <div className="text-sm font-bold">{entry.message}</div>
                    </div>
                  );
                }

                if (entry.event.type === 'IP_CHANGED') {
                  return (
                    <div key={entry.id} className="border border-black/20 p-2 bg-white/70">
                      <div className="text-xs font-semibold uppercase">IP Update</div>
                      <div className="text-sm font-bold">{entry.message}</div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionLogPanel;
