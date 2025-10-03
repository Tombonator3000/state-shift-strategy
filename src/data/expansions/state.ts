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
import {
  EDITORS_EXPANSION_ID,
  type ExpansionFeatureState,
  getExpansionFeaturesSnapshot,
  hydrateExpansionFeatures,
  isEditorsFeatureEnabled,
  setEditorsFeatureEnabled as persistEditorsFeatureEnabled,
  setTabloidRelicsFeatureEnabled as persistTabloidRelicsFeatureEnabled,
} from './features';

type StoredPrefs = {
  mode?: MixMode;
  enabled?: Record<string, boolean>;
  customWeights?: Record<string, number>;
  features?: Partial<ExpansionFeatureState>;
};

type Listener = (payload: { ids: string[]; cards: GameCard[] }) => void;

let prefs: StoredPrefs = { enabled: {}, customWeights: {}, mode: 'BALANCED_MIX', features: {} };
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
  const featureSnapshot = getExpansionFeaturesSnapshot();
  prefs.features = featureSnapshot;
  savePrefs({
    ...prefs,
    features: featureSnapshot,
  });
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
    const features = hydrateExpansionFeatures(stored.features);
    prefs = {
      mode: stored.mode,
      enabled: stored.enabled ?? {},
      customWeights: stored.customWeights ?? {},
      features,
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

export const getEnabledExpansionIdsSnapshot = (): string[] => {
  const ids = [...enabledIdsCache];
  if (isEditorsFeatureEnabled() && !ids.includes(EDITORS_EXPANSION_ID)) {
    ids.push(EDITORS_EXPANSION_ID);
  }
  return ids;
};

export const getExpansionCardsSnapshot = (): GameCard[] => cachedCards.map(card => ({ ...card }));

export const getStoredExpansionIds = (): string[] => [...enabledIdsCache];

export const setEditorsExpansionEnabled = (enabled: boolean): void => {
  const nextFeatures = persistEditorsFeatureEnabled(enabled);
  prefs.features = nextFeatures;
  notify();
};

export const setTabloidRelicsExpansionEnabled = (enabled: boolean): void => {
  const nextFeatures = persistTabloidRelicsFeatureEnabled(enabled);
  prefs.features = nextFeatures;
  notify();
};

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
