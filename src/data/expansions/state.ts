import type { GameCard } from '@/rules/mvp';
import {
  EXPANSION_MANIFEST,
  ensureExpansionManifest,
  loadEnabledExpansions,
  refreshExpansionManifest,
} from './index';
import type { MixMode } from '@/lib/decks/expansions';
import { loadPrefs, savePrefs } from '@/lib/persist';
import {
  DEFAULT_DISTRIBUTION_SETTINGS,
  loadDistributionSettingsFromStorage,
  sanitizeDistributionSettings,
  weightedDistribution,
} from '../weightedCardDistribution';

type StoredPrefs = {
  mode?: MixMode;
  enabled?: Record<string, boolean>;
  customWeights?: Record<string, number>;
};

type Listener = (payload: { ids: string[]; cards: GameCard[] }) => void;

let prefs: StoredPrefs = { enabled: {}, customWeights: {}, mode: 'BALANCED_MIX' };
let enabledIdsCache: string[] = [];
let cachedCards: GameCard[] = [];
let loadingPromise: Promise<GameCard[]> | null = null;
const listeners = new Set<Listener>();

const getManifestIdSet = () => new Set(EXPANSION_MANIFEST.map(pack => pack.id));

const notify = () => {
  const snapshotCards = getExpansionCardsSnapshot();
  const snapshotIds = getEnabledExpansionIdsSnapshot();
  for (const listener of listeners) {
    try {
      listener({ ids: snapshotIds, cards: snapshotCards });
    } catch (error) {
      console.warn('[Expansions] listener error', error);
    }
  }
};

const sanitizeEnabledIds = (ids: string[]): string[] => {
  const manifestIds = getManifestIdSet();
  return Array.from(new Set(ids.filter(id => manifestIds.has(id))));
};

const persistPrefs = () => {
  savePrefs(prefs);
};

const rebuildEnabledMap = () => {
  const map: Record<string, boolean> = {};
  for (const id of enabledIdsCache) {
    map[id] = true;
  }
  prefs.enabled = map;
  persistPrefs();
};

const loadStoredPrefs = () => {
  const stored = loadPrefs<StoredPrefs>();
  if (stored && typeof stored === 'object') {
    prefs = {
      mode: stored.mode,
      enabled: stored.enabled ?? {},
      customWeights: stored.customWeights ?? {},
    };
  }
};

const ensureCardsLoaded = async () => {
  const ids = enabledIdsCache;
  const load = loadEnabledExpansions(ids)
    .then(cards => {
      cachedCards = cards.map(card => ({ ...card }));
      notify();
      return cachedCards;
    })
    .catch(error => {
      console.warn('[Expansions] failed to load cards', error);
      cachedCards = [];
      notify();
      return cachedCards;
    })
    .finally(() => {
      loadingPromise = null;
    });

  loadingPromise = load;
  return load;
};

export const getEnabledExpansionIdsSnapshot = (): string[] => [...enabledIdsCache];

export const getExpansionCardsSnapshot = (): GameCard[] => cachedCards.map(card => ({ ...card }));

export const getStoredExpansionIds = (): string[] => [...enabledIdsCache];

export const subscribeToExpansionChanges = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const refreshExpansionCards = async (ids?: string[]): Promise<GameCard[]> => {
  await ensureExpansionManifest();

  if (ids) {
    enabledIdsCache = sanitizeEnabledIds(ids);
  }

  rebuildEnabledMap();

  if (loadingPromise) {
    try {
      await loadingPromise;
    } catch {
      // ignore previous errors
    }
  }

  return ensureCardsLoaded();
};

export const updateEnabledExpansions = async (ids: string[]): Promise<GameCard[]> => {
  enabledIdsCache = sanitizeEnabledIds(ids);
  rebuildEnabledMap();

  if (loadingPromise) {
    try {
      await loadingPromise;
    } catch {
      // ignore
    }
  }

  return ensureCardsLoaded();
};

export const initializeExpansions = async (): Promise<void> => {
  await refreshExpansionManifest();
  loadStoredPrefs();

  enabledIdsCache = sanitizeEnabledIds(
    Object.entries(prefs.enabled ?? {})
      .filter(([, enabled]) => Boolean(enabled))
      .map(([id]) => id),
  );

  rebuildEnabledMap();
  const storedDistribution = loadDistributionSettingsFromStorage();
  const distributionSettings =
    storedDistribution ?? sanitizeDistributionSettings(DEFAULT_DISTRIBUTION_SETTINGS);
  weightedDistribution.updateSettings(distributionSettings);
  await ensureCardsLoaded();
};
