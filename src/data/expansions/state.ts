import type { GameCard } from '@/rules/mvp';
import { EXPANSION_MANIFEST, loadEnabledExpansions } from './index';

const STORAGE_KEY = 'sg:expansions';
const MANIFEST_IDS = new Set(EXPANSION_MANIFEST.map(pack => pack.id));

let enabledIdsCache: string[] = [];
let cachedCards: GameCard[] = [];
let loadingPromise: Promise<GameCard[]> | null = null;
const listeners = new Set<(payload: { ids: string[]; cards: GameCard[] }) => void>();

const readStoredIds = (): string[] => {
  if (typeof window === 'undefined') {
    return [...enabledIdsCache];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string');
    }
  } catch (error) {
    console.warn('[EXPANSIONS] Failed to read stored expansions', error);
  }

  return [];
};

const normalizeIds = (ids: string[]): string[] => {
  return Array.from(new Set(ids.filter(id => MANIFEST_IDS.has(id))));
};

const persistIds = (ids: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.warn('[EXPANSIONS] Failed to persist enabled expansions', error);
  }
};

const notify = () => {
  const snapshot = getExpansionCardsSnapshot();
  const ids = getEnabledExpansionIdsSnapshot();
  for (const listener of listeners) {
    try {
      listener({ ids, cards: snapshot });
    } catch (error) {
      console.warn('[EXPANSIONS] Listener error', error);
    }
  }
};

export const getEnabledExpansionIdsSnapshot = (): string[] => {
  return [...enabledIdsCache];
};

export const getExpansionCardsSnapshot = (): GameCard[] => {
  return [...cachedCards];
};

export const getStoredExpansionIds = (): string[] => {
  const stored = readStoredIds();
  enabledIdsCache = normalizeIds(stored);
  return getEnabledExpansionIdsSnapshot();
};

export const subscribeToExpansionChanges = (
  listener: (payload: { ids: string[]; cards: GameCard[] }) => void,
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const refreshExpansionCards = async (ids?: string[]): Promise<GameCard[]> => {
  const normalized = normalizeIds(ids ?? getStoredExpansionIds());
  enabledIdsCache = normalized;
  persistIds(enabledIdsCache);

  const loadPromise = loadEnabledExpansions(enabledIdsCache)
    .then(cards => {
      cachedCards = cards.map(card => ({ ...card }));
      notify();
      return cachedCards;
    })
    .catch(error => {
      console.warn('[EXPANSIONS] Failed to load expansions', error);
      cachedCards = [];
      notify();
      return cachedCards;
    })
    .finally(() => {
      loadingPromise = null;
    });

  loadingPromise = loadPromise;
  return loadPromise;
};

export const updateEnabledExpansions = async (ids: string[]): Promise<GameCard[]> => {
  const normalized = normalizeIds(ids);
  enabledIdsCache = normalized;
  persistIds(enabledIdsCache);
  if (loadingPromise) {
    try {
      await loadingPromise;
    } catch {
      // ignore errors from previous load
    }
  }
  return refreshExpansionCards(enabledIdsCache);
};

export const initializeExpansions = async (): Promise<void> => {
  enabledIdsCache = normalizeIds(readStoredIds());
  await refreshExpansionCards(enabledIdsCache);
};
