import { useEffect, useState } from 'react';
import { getUIStateSnapshot, subscribeUIState, type UIStateSnapshot } from '@/state/uiState';

export const useUIState = (): UIStateSnapshot => {
  const [snapshot, setSnapshot] = useState<UIStateSnapshot>(() => getUIStateSnapshot());

  useEffect(() => {
    const unsubscribe = subscribeUIState(() => {
      setSnapshot(getUIStateSnapshot());
    });

    return unsubscribe;
  }, []);

  return snapshot;
};
