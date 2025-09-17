import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';
import {
  UIState,
  setInspectingCard,
  type InspectOptions,
} from '@/state/uiState';
import { useUIState } from '@/hooks/useUIState';

export function openInspector(card: NonNullable<typeof UIState.inspectingCard>, opts: InspectOptions) {
  setInspectingCard(card, { interactive: false, ...opts });
  if (typeof document !== 'undefined') {
    document.body.classList.add('modal-open');
  }
  console.log(`UI: Inspect open (source=${opts.source}, id=${card.id})`);
}

export function closeInspector() {
  setInspectingCard(null);
  if (typeof document !== 'undefined') {
    document.body.classList.remove('modal-open');
  }
}

export const InspectorOverlay = () => {
  const uiState = useUIState();
  const { inspectingCard, inspectOptions } = uiState;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!inspectingCard) {
      document.body.classList.remove('modal-open');
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeInspector();
      }
    };

    document.body.classList.add('modal-open');
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [inspectingCard]);

  if (!inspectingCard) return null;

  const interactive = inspectOptions.interactive === true;

  return createPortal(
    <CardDetailOverlay
      card={inspectingCard}
      canAfford
      disabled={!interactive}
      interactive={interactive}
      playedMeta={inspectOptions.meta}
      onClose={closeInspector}
      onPlayCard={() => {}}
    />,
    document.body
  );
};
