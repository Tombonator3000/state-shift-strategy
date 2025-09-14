import { createContext, useContext, useState, ReactNode } from 'react';
import { CARD_DATABASE } from '@/data/cardDatabase';
import type { GameCard } from '@/types/cardTypes';
import CardPreview from '@/components/game/CardPreview';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';

export type SourceZone = 'hand' | 'board' | 'discard' | 'zone' | 'timeline';

interface CardPreviewContextValue {
  openCardPreview: (cardId: string, sourceZone?: SourceZone) => void;
}

const CardPreviewContext = createContext<CardPreviewContextValue | undefined>(undefined);

export const CardPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [card, setCard] = useState<GameCard | null>(null);
  const [sourceZone, setSourceZone] = useState<SourceZone>('board');

  const openCardPreview = (cardId: string, zone: SourceZone = 'board'): void => {
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
        sourceZone === 'hand' ? (
          <CardDetailOverlay
            card={card}
            canAfford
            disabled={false}
            sourceZone={sourceZone}
            onClose={handleClose}
            onPlayCard={() => {}}
          />
        ) : (
          <CardPreview card={card} sourceZone={sourceZone} onClose={handleClose} />
        )
      )}
    </CardPreviewContext.Provider>
  );
};

export const useCardPreview = () => {
  const ctx = useContext(CardPreviewContext);
  if (!ctx) {
    throw new Error('useCardPreview must be used within CardPreviewProvider');
  }
  return ctx;
};

