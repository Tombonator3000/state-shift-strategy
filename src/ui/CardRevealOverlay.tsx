import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { OpponentCardQueueItem } from '@/hooks/useGameUiFeed';
import { useGameUiFeed } from '@/hooks/useGameUiFeed';
import { summarizeCardEffects } from './cardEffects';
import { toast } from '@/hooks/use-toast';

const HOLD_MIN = 1200;
const HOLD_MAX = 1600;
const EXIT_DURATION = 200;
const GAP_MIN = 600;
const GAP_MAX = 800;

const getHoldDuration = () => Math.floor(HOLD_MIN + Math.random() * (HOLD_MAX - HOLD_MIN));
const getGapDuration = () => Math.floor(GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN));

export const CardRevealOverlay = () => {
  const { opponentQueue, consumeOpponentCard, settings } = useGameUiFeed();
  const [activeItem, setActiveItem] = useState<OpponentCardQueueItem | null>(null);
  const [visible, setVisible] = useState(false);
  const cooldownRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const currentCard = activeItem?.event.card;
  const effectLines = useMemo(() => (currentCard ? summarizeCardEffects(currentCard) : []), [currentCard]);

  const announce = useMemo(() => {
    if (!currentCard) return '';
    const summary = effectLines.length > 0 ? effectLines.join(', ') : 'No immediate effect summary';
    return `Opponent played ${currentCard.name}: ${summary}`;
  }, [currentCard, effectLines]);

  const clearTimers = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (cooldownRef.current) {
      window.clearTimeout(cooldownRef.current);
      cooldownRef.current = null;
    }
  };

  const flushQueue = useCallback(() => {
    if (opponentQueue.length === 0) return;
    const skipToasts = settings.skipOpponentAnimations;
    const showReveal = settings.showOpponentCardReveal;

    for (const item of opponentQueue) {
      if ((skipToasts || !showReveal) && item.event?.card) {
        toast({
          title: 'Opponent Play',
          description: item.event.card.name,
          duration: 1600,
        });
      }
      consumeOpponentCard(item.id);
    }
    clearTimers();
    setActiveItem(null);
    setVisible(false);
  }, [consumeOpponentCard, opponentQueue, settings.showOpponentCardReveal, settings.skipOpponentAnimations]);

  useEffect(() => {
    if (settings.skipOpponentAnimations || !settings.showOpponentCardReveal) {
      flushQueue();
      return;
    }

    if (!activeItem && opponentQueue.length > 0 && !cooldownRef.current) {
      cooldownRef.current = window.setTimeout(() => {
        setActiveItem(opponentQueue[0]);
        cooldownRef.current = null;
      }, getGapDuration());
    }
  }, [activeItem, opponentQueue, settings.showOpponentCardReveal, settings.skipOpponentAnimations, flushQueue]);

  useEffect(() => {
    if (!activeItem) {
      setVisible(false);
      return;
    }

    setVisible(true);
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, getHoldDuration());
  }, [activeItem]);

  useEffect(() => {
    if (!activeItem || visible) return;

    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
    }

    exitTimerRef.current = window.setTimeout(() => {
      consumeOpponentCard(activeItem.id);
      setActiveItem(null);
    }, EXIT_DURATION + 20);
  }, [activeItem, consumeOpponentCard, visible]);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!visible || !activeItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVisible(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, activeItem]);

  const handleDismiss = () => setVisible(false);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && activeItem && currentCard && (
        <motion.div
          key={activeItem.id}
          className="fixed inset-0 z-[90] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          role="status"
          aria-live="assertive"
          aria-label={announce}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={handleDismiss} />
          <motion.div
            className="relative z-10 pointer-events-auto"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="bg-newspaper-text text-newspaper-bg border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,0.6)] w-[320px] max-w-[80vw]">
              <div className="bg-black text-white text-xs uppercase tracking-[0.4em] px-4 py-1">BREAKING</div>
              <div className="p-5 space-y-3">
                <h2 className="text-2xl font-black leading-tight uppercase">{currentCard.name}</h2>
                <div className="flex items-center justify-between text-xs font-mono uppercase">
                  <span>{currentCard.type}</span>
                  <span>Cost: {currentCard.cost}</span>
                  <span>{currentCard.rarity}</span>
                </div>
                {effectLines.length > 0 ? (
                  <div className="space-y-1 text-sm font-semibold">
                    {effectLines.map(line => (
                      <div key={line} className="border-l-4 border-black pl-3">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : currentCard.text ? (
                  <p className="text-sm font-medium leading-snug">{currentCard.text}</p>
                ) : (
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">No dossier on file</p>
                )}
                {currentCard.flavor && (
                  <p className="text-xs italic text-muted-foreground">“{currentCard.flavor}”</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full text-xs uppercase tracking-[0.3em] bg-black text-white py-2"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CardRevealOverlay;
