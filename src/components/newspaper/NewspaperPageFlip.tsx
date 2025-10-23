import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewspaperPageFlipProps {
  pages: React.ReactNode[];
  onPageChange?: (page: number) => void;
  enableSound?: boolean;
}

export const NewspaperPageFlip = ({ pages, onPageChange, enableSound = true }: NewspaperPageFlipProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const playPageFlipSound = () => {
    if (!enableSound) return;
    
    // Create a quick paper rustle sound effect
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= pages.length) return;
    
    setDirection(pageIndex > currentPage ? 'right' : 'left');
    setCurrentPage(pageIndex);
    onPageChange?.(pageIndex);
    playPageFlipSound();
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const pageVariants = {
    enter: (direction: 'left' | 'right') => ({
      rotateY: direction === 'right' ? 90 : -90,
      opacity: 0,
      transformOrigin: direction === 'right' ? 'left' : 'right',
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      transformOrigin: 'center',
    },
    exit: (direction: 'left' | 'right') => ({
      rotateY: direction === 'right' ? -90 : 90,
      opacity: 0,
      transformOrigin: direction === 'right' ? 'right' : 'left',
    }),
  };

  return (
    <div className="relative w-full h-full perspective-1000">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentPage}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            rotateY: { type: 'spring', stiffness: 100, damping: 20 },
            opacity: { duration: 0.3 },
          }}
          className="w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {pages[currentPage]}
        </motion.div>
      </AnimatePresence>

      {/* Page Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-background/90 backdrop-blur"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentPage
                  ? "bg-foreground w-8"
                  : "bg-foreground/30 hover:bg-foreground/60"
              )}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="bg-background/90 backdrop-blur"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Page Number */}
      <div className="absolute top-4 right-4 text-sm font-mono text-muted-foreground">
        Page {currentPage + 1} of {pages.length}
      </div>
    </div>
  );
};
