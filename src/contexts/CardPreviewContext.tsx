import { createContext, useContext, useState, ReactNode } from 'react';
import { CARD_DATABASE } from '@/data/cardDatabase';
import type { GameCard } from '@/types/cardTypes';
import CardPreviewModal from '@/components/game/CardPreviewModal';

export type SourceZone = 'hand' | 'board' | 'discard' | 'zone' | 'timeline';

type Ctx = { openCardPreview: (cardId: string, sourceZone?: SourceZone) => void; };
const CardPreviewContext = createContext<Ctx | null>(null);

export const useCardPreview = () => {
  const ctx = useContext(CardPreviewContext);
  if (!ctx) throw new Error('useCardPreview must be used within CardPreviewProvider');
  return ctx;
};

export function CardPreviewProvider({ children }: { children: ReactNode }) {
  const [card, setCard] = useState<GameCard | null>(null);
  const [sourceZone, setSourceZone] = useState<SourceZone>('board');

  const openCardPreview = (cardId: string, zone: SourceZone = 'board') => {
    const found = CARD_DATABASE.find(c => c.id === cardId);
    if (!found) return;
    setCard(found);
    setSourceZone(zone);
  };

  const handleClose = () => setCard(null);

  return (
    <CardPreviewContext.Provider value={{ openCardPreview }}>
      {children}
      {card && (
        <CardPreviewModal
          card={card}
          sourceZone={sourceZone}
          onClose={handleClose}
        />
      )}
    </CardPreviewContext.Provider>
  );
}

