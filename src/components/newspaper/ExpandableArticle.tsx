import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableArticleProps {
  headline: string;
  subhead?: string;
  preview: string;
  fullContent: string;
  image?: React.ReactNode;
  byline?: string;
  className?: string;
  onExpand?: (expanded: boolean) => void;
}

export const ExpandableArticle = ({
  headline,
  subhead,
  preview,
  fullContent,
  image,
  byline,
  className,
  onExpand,
}: ExpandableArticleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpand?.(newState);

    // Typewriter click sound
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  };

  return (
    <motion.article
      layout
      className={cn(
        "border-2 border-foreground/20 bg-background p-4 cursor-pointer transition-all hover:shadow-lg hover:border-foreground/40",
        isExpanded && "shadow-xl border-foreground/60",
        className
      )}
      onClick={toggleExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <motion.h3
            layout
            className="font-black text-xl mb-2 leading-tight uppercase"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {headline}
          </motion.h3>

          {subhead && (
            <motion.p layout className="text-sm font-semibold mb-2 text-muted-foreground">
              {subhead}
            </motion.p>
          )}

          {byline && (
            <motion.p layout className="text-xs italic mb-3 text-muted-foreground">
              {byline}
            </motion.p>
          )}

          <motion.div layout className="text-sm leading-relaxed">
            <p className="mb-2">{preview}</p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 border-t border-foreground/20 mt-2">
                    {fullContent.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            layout
            className="flex items-center gap-2 mt-3 text-xs font-bold text-primary"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Read Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Read Full Story
              </>
            )}
          </motion.div>
        </div>

        {image && (
          <motion.div layout className="flex-shrink-0">
            {image}
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};
