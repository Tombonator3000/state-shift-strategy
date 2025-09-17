import { useSyncExternalStore } from 'react';
import { getUIStateSnapshot, subscribeUIState, type UIStateSnapshot } from '@/state/uiState';

export const useUIState = (): UIStateSnapshot => {
  return useSyncExternalStore(subscribeUIState, getUIStateSnapshot, getUIStateSnapshot);
};
