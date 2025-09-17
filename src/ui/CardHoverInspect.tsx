import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { GameCard } from '@/rules/mvp';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { summarizeCardEffects } from './cardEffects';

interface CardHoverInspectProps {
  card: GameCard;
  children: ReactNode;
}

const tabloidFont = 'font-mono';

export const CardHoverInspect = ({ card, children }: CardHoverInspectProps) => {
  const effectLines = summarizeCardEffects(card);

  return (
    <HoverCard openDelay={80} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="top" align="center" sideOffset={16} className="bg-newspaper-text text-newspaper-bg border-2 border-black shadow-2xl w-72 p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.1),_transparent_65%)] pointer-events-none" />
          <div className="px-4 pt-4 pb-3 space-y-2 relative z-10">
            <div className={`${tabloidFont} text-xs uppercase tracking-[0.3em] text-muted-foreground`}>BREAKING</div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-black uppercase leading-tight text-black">
                {card.name}
              </h3>
              <div className="text-right">
                <div className="text-xs font-semibold text-muted-foreground">COST</div>
                <div className="text-lg font-black text-black">{card.cost}</div>
              </div>
            </div>
            <div className="flex items-center justify-between border-y border-black/20 py-1">
              <span className={`${tabloidFont} text-xs tracking-wide font-semibold`}>{card.type}</span>
              <span className={`${tabloidFont} text-xs uppercase tracking-widest`}>{card.rarity}</span>
            </div>
            {effectLines.length > 0 ? (
              <ul className="space-y-1">
                {effectLines.map(line => (
                  <li key={line} className="text-sm font-semibold text-black">
                    • {line}
                  </li>
                ))}
              </ul>
            ) : card.text ? (
              <p className="text-sm text-black font-medium leading-snug">{card.text}</p>
            ) : null}
            {card.flavor && (
              <blockquote className="text-xs italic text-muted-foreground border-l-2 border-black/30 pl-2">
                “{card.flavor}”
              </blockquote>
            )}
          </div>
          <div className="bg-black text-white text-[10px] tracking-[0.35em] uppercase px-4 py-1 text-center">
            Tabloid Leak // Classified Eyes Only
          </div>
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CardHoverInspect;
