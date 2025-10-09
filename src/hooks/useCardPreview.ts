import { useState, useCallback } from 'react';

interface CardPreviewState {
  cardId: string | null;
  cardName: string;
  isOpen: boolean;
}

/**
 * Hook for managing card preview overlay state
 */
export function useCardPreview() {
  const [previewState, setPreviewState] = useState<CardPreviewState>({
    cardId: null,
    cardName: '',
    isOpen: false,
  });

  const openPreview = useCallback((cardId: string, cardName: string) => {
    setPreviewState({
      cardId,
      cardName,
      isOpen: true,
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewState({
      cardId: null,
      cardName: '',
      isOpen: false,
    });
  }, []);

  return {
    previewState,
    openPreview,
    closePreview,
  };
}
