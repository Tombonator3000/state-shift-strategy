import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { GameCard } from '@/rules/mvp';

export type UiEvent =
  | { type: 'OPP_PLAYED_CARD'; card: GameCard; turn: number }
  | { type: 'TRUTH_CHANGED'; delta: number; newValue: number }
  | { type: 'IP_CHANGED'; playerId: 'P1' | 'P2'; delta: number; newValue: number }
  | { type: 'STATE_CAPTURED'; stateId: string; by: 'P1' | 'P2' };

export interface UiFeedSettings {
  showOpponentCardReveal: boolean;
  showResourceAnimations: boolean;
  showStateCaptureEffects: boolean;
  showActionLogPanel: boolean;
  skipOpponentAnimations: boolean;
}

export interface OpponentCardQueueItem {
  id: string;
  event: Extract<UiEvent, { type: 'OPP_PLAYED_CARD' }>;
  timestamp: number;
}

export interface ActionLogEntry {
  id: string;
  event: UiEvent;
  message: string;
  turn?: number;
  card?: GameCard;
  createdAt: number;
}

type UiEventListener = (event: UiEvent) => void;

interface GameUiFeedContextValue {
  settings: UiFeedSettings;
  updateSettings: (patch: Partial<UiFeedSettings>) => void;
  subscribe: (listener: UiEventListener) => () => void;
  dispatchUiEvent: (event: UiEvent) => void;
  opponentQueue: OpponentCardQueueItem[];
  consumeOpponentCard: (id: string) => void;
  actionLog: ActionLogEntry[];
  clearActionLog: () => void;
  latestAnnouncement: string | null;
}

const DEFAULT_SETTINGS: UiFeedSettings = {
  showOpponentCardReveal: true,
  showResourceAnimations: true,
  showStateCaptureEffects: true,
  showActionLogPanel: true,
  skipOpponentAnimations: false,
};

const STORAGE_KEY = 'shadowgov-ui-feed-settings';

const GameUiFeedContext = createContext<GameUiFeedContextValue | null>(null);

function isDebuggingEnabled() {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).DEBUG_UI_FEED || (window as any).localStorage?.getItem('DEBUG_UI_FEED') === 'true');
}

function describeEvent(event: UiEvent): string {
  switch (event.type) {
    case 'OPP_PLAYED_CARD':
      return `Opponent played ${event.card.name}`;
    case 'TRUTH_CHANGED':
      return `Truth ${event.delta > 0 ? '+' : ''}${event.delta}% (now ${Math.round(event.newValue)}%)`;
    case 'IP_CHANGED':
      return `${event.playerId === 'P1' ? 'Your' : 'Opponent'} IP ${event.delta > 0 ? '+' : ''}${event.delta}`;
    case 'STATE_CAPTURED':
      return `${event.by === 'P1' ? 'You captured' : 'Opponent captured'} ${event.stateId}`;
    default:
      return 'Game update';
  }
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
}

export const GameUiFeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const listenersRef = useRef(new Set<UiEventListener>());
  const [settings, setSettings] = useState<UiFeedSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(stored) as Partial<UiFeedSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (error) {
      console.warn('Failed to read UI feed settings, using defaults', error);
      return DEFAULT_SETTINGS;
    }
  });
  const [opponentQueue, setOpponentQueue] = useState<OpponentCardQueueItem[]>([]);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to persist UI feed settings', error);
    }
  }, [settings]);

  const subscribe = useCallback((listener: UiEventListener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const clearActionLog = useCallback(() => {
    setActionLog([]);
  }, []);

  const consumeOpponentCard = useCallback((id: string) => {
    setOpponentQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<UiFeedSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const dispatchUiEvent = useCallback((event: UiEvent) => {
    if (isDebuggingEnabled()) {
      console.debug('[UI FEED]', event);
    }

    if (event.type === 'OPP_PLAYED_CARD') {
      setOpponentQueue(prev => [
        ...prev,
        {
          id: createId('opp-card'),
          event,
          timestamp: Date.now(),
        },
      ]);
    }

    setActionLog(prev => {
      const entry: ActionLogEntry = {
        id: createId('log-entry'),
        event,
        message: describeEvent(event),
        turn: 'turn' in event ? (event as any).turn : undefined,
        card: event.type === 'OPP_PLAYED_CARD' ? event.card : undefined,
        createdAt: Date.now(),
      };
      const next = [...prev, entry];
      return next.slice(-40);
    });

    setLatestAnnouncement(describeEvent(event));

    listenersRef.current.forEach(listener => listener(event));
  }, []);

  const value = useMemo<GameUiFeedContextValue>(() => ({
    settings,
    updateSettings,
    subscribe,
    dispatchUiEvent,
    opponentQueue,
    consumeOpponentCard,
    actionLog,
    clearActionLog,
    latestAnnouncement,
  }), [settings, updateSettings, subscribe, dispatchUiEvent, opponentQueue, consumeOpponentCard, actionLog, clearActionLog, latestAnnouncement]);

  return (
    <GameUiFeedContext.Provider value={value}>
      {children}
    </GameUiFeedContext.Provider>
  );
};

export function useGameUiFeed() {
  const context = useContext(GameUiFeedContext);
  if (!context) {
    throw new Error('useGameUiFeed must be used within a GameUiFeedProvider');
  }
  return context;
}

export function useUiEventSubscription(handler: UiEventListener) {
  const { subscribe } = useGameUiFeed();
  useEffect(() => subscribe(handler), [subscribe, handler]);
}
