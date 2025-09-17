import type { GameCard } from '@/types/cardTypes';

export type Phase = 'MAIN' | 'REVIEW' | 'RESOLVE' | 'NEWSPAPER';
export type InspectSource = 'playerTray' | 'opponentTray' | 'hand' | 'discard' | 'deckPreview';

export interface InspectMeta {
  round?: number;
  playedBy?: string;
  target?: string | null;
  summary?: string;
}

export interface InspectOptions {
  interactive?: boolean;
  source: InspectSource;
  meta?: InspectMeta;
}

export interface UIStateSnapshot {
  phase: Phase;
  inspectingCard: GameCard | null;
  inspectOptions: InspectOptions;
  boardFrozen: boolean;
  showReviewBanner: boolean;
}

const listeners = new Set<() => void>();

const trayCardRegistry = new Map<string, GameCard>();
const trayMetaRegistry = new Map<string, InspectMeta>();

export const UIState: UIStateSnapshot = {
  phase: 'MAIN',
  inspectingCard: null,
  inspectOptions: { interactive: false, source: 'playerTray' },
  boardFrozen: false,
  showReviewBanner: false,
};

function emit() {
  listeners.forEach(listener => listener());
}

export function subscribeUIState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUIStateSnapshot(): UIStateSnapshot {
  return {
    phase: UIState.phase,
    inspectingCard: UIState.inspectingCard,
    inspectOptions: { ...UIState.inspectOptions },
    boardFrozen: UIState.boardFrozen,
    showReviewBanner: UIState.showReviewBanner,
  };
}

export function setPhase(phase: Phase) {
  if (UIState.phase === phase) return;
  UIState.phase = phase;
  emit();
}

export function setInspectingCard(card: GameCard | null, options?: InspectOptions) {
  UIState.inspectingCard = card;
  if (options) {
    UIState.inspectOptions = {
      interactive: options.interactive ?? false,
      source: options.source,
      meta: options.meta,
    };
  } else {
    UIState.inspectOptions = { interactive: false, source: 'playerTray' };
  }
  emit();
}

export function setBoardFrozen(frozen: boolean) {
  if (UIState.boardFrozen === frozen) return;
  UIState.boardFrozen = frozen;
  emit();
}

export function setReviewBannerVisible(visible: boolean) {
  if (UIState.showReviewBanner === visible) return;
  UIState.showReviewBanner = visible;
  emit();
}

export function syncTrayRegistry(entries: Array<{ guid: string; card: GameCard; meta?: InspectMeta }>) {
  trayCardRegistry.clear();
  trayMetaRegistry.clear();
  entries.forEach(({ guid, card, meta }) => {
    trayCardRegistry.set(guid, card);
    if (meta) {
      trayMetaRegistry.set(guid, meta);
    }
  });
}

export function clearTrayRegistry() {
  trayCardRegistry.clear();
  trayMetaRegistry.clear();
}

export function getTrayCardByGuid(guid: string): GameCard | null {
  return trayCardRegistry.get(guid) ?? null;
}

export function getTrayMetaByGuid(guid: string): InspectMeta | undefined {
  return trayMetaRegistry.get(guid);
}
