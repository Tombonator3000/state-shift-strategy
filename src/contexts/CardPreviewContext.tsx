import { createContext, useContext, useState, ReactNode } from 'react';
import { CARD_DATABASE } from '@/data/cardDatabase';
import type { GameCard } from '@/types/cardTypes';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';

export type SourceZone = 'hand' | 'board' | 'discard' | 'zone' | 'timeline';

type CardPreviewContextValue = {
  openCardPreview: (cardId: string, sourceZone?: SourceZone) => void;
};

const CardPreviewContext = createContext<CardPreviewContextValue | null>(null);

export const useCardPreview = () => {
  const ctx = useContext(CardPreviewContext);
  if (!ctx) throw new Error('useCardPreview must be used within CardPreviewProvider');
  return ctx;
};

export function CardPreviewProvider({ children }: { children: ReactNode }) {
  const [card, setCard] = useState<GameCard | null>(null);
  const [sourceZone, setSourceZone] = useState<SourceZone>('board');

  // Open read-only preview for any zone; only 'hand' is interactive/playable.
  const openCardPreview = (cardId: string, zone: SourceZone = 'board'): void => {
    const found = CARD_DATABASE.find((c) => c.id === cardId);
    if (!found) return;
    setCard(found);
    setSourceZone(zone);
  };

  const handleClose = () => setCard(null);

  return (
    <CardPreviewContext.Provider value={{ openCardPreview }}>
      {children}
      {card && (
        <CardDetailOverlay
          card={card}
          canAfford={true}
          disabled={sourceZone !== 'hand'} // read-only for board/discard/zone/timeline
          sourceZone={sourceZone}
          onClose={handleClose}
          onPlayCard={() => {}}
        />
      )}
    </CardPreviewContext.Provider>
  );
}

export default CardPreviewContext;
