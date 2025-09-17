import { useMemo } from 'react';
import { useGameUiFeed } from '@/hooks/useGameUiFeed';
import CardHoverInspect from './CardHoverInspect';

const typeToBadge = (type?: string) => {
  if (!type) return '???';
  return type.slice(0, 3).toUpperCase();
};

export const OpponentActionStrip = () => {
  const { actionLog } = useGameUiFeed();

  const recentCards = useMemo(() => {
    return actionLog
      .filter(entry => entry.event.type === 'OPP_PLAYED_CARD')
      .slice(-3)
      .reverse();
  }, [actionLog]);

  if (recentCards.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-newspaper-text text-newspaper-bg border-2 border-black px-2 py-1 shadow-md">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Opponent</span>
      {recentCards.map(entry => (
        <CardHoverInspect key={entry.id} card={entry.card!}>
          <div className="relative group">
            <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black border border-white shadow-inner">
              {typeToBadge(entry.card?.type)}
            </div>
            <div className="absolute -bottom-1 right-0 text-[9px] font-bold bg-white text-black px-1 border border-black">
              {entry.card?.cost}
            </div>
          </div>
        </CardHoverInspect>
      ))}
    </div>
  );
};

export default OpponentActionStrip;
