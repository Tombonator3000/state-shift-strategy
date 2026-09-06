import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAudioContext } from '@/contexts/AudioContext';
interface NewspaperPageFlipProps { pages: React.ReactNode[]; onPageChange?: (page: number) => void; enableSound?: boolean }
export function NewspaperPageFlip({ pages, onPageChange, enableSound = true }: NewspaperPageFlipProps) {
  const [current, setCurrent] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const audio = useAudioContext();
  const goTo = (index: number) => {
    if (index < 0 || index >= pages.length || index === current) return;
    setCurrent(index); onPageChange?.(index);
    if (enableSound) void audio.playSFX('newspaper');
  };
  const goToRef = useRef(goTo); goToRef.current = goTo;
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,button,[contenteditable=true]'))) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); goToRef.current(current - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goToRef.current(current + 1); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [current]);
  return <div className="press-page-reader">
    <div className="press-page-scroll" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchCancel={() => { touch.current = null; }} onTouchEnd={event => {
      if (!touch.current) return;
      const dx = event.changedTouches[0].clientX - touch.current.x;
      const dy = event.changedTouches[0].clientY - touch.current.y;
      touch.current = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2) goTo(current + (dx < 0 ? 1 : -1));
    }}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={current} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: reduceMotion ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : .14 }}>{pages[current]}</motion.div></AnimatePresence>
    </div>
    <nav className="press-page-nav" aria-label="Newspaper pages"><button type="button" disabled={!current} onClick={() => goTo(current - 1)}>← Previous</button><label><span className="sr-only">Newspaper page</span><select value={current} onChange={e => goTo(Number(e.target.value))}>{pages.map((_, index) => <option key={index} value={index}>Page {index + 1} of {pages.length}</option>)}</select></label><button type="button" disabled={current === pages.length - 1} onClick={() => goTo(current + 1)}>Next →</button></nav>
  </div>;
}
