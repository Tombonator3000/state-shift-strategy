import { loadPrefs, savePrefs } from '@/lib/persist';

export const EDITORS_EXPANSION_ID = 'editors';
export const TABLOID_RELICS_EXPANSION_ID = 'tabloidRelics';

export interface ExpansionFeatureState {
  readonly editors: boolean;
  readonly tabloidRelics: boolean;
}

export type StoredExpansionFeaturePrefs = {
  features?: Partial<ExpansionFeatureState>;
};

type PersistedPrefs = Record<string, unknown> & StoredExpansionFeaturePrefs;

const sanitizeFeatureState = (value?: Partial<ExpansionFeatureState>): ExpansionFeatureState => ({
  editors: Boolean(value?.editors),
  tabloidRelics: Boolean(value?.tabloidRelics),
});

let featureState: ExpansionFeatureState = sanitizeFeatureState();

export const getExpansionFeaturesSnapshot = (): ExpansionFeatureState => ({
  ...featureState,
});

export const hydrateExpansionFeatures = (
  value?: Partial<ExpansionFeatureState>,
): ExpansionFeatureState => {
  featureState = sanitizeFeatureState(value);
  return getExpansionFeaturesSnapshot();
};

export const loadExpansionFeaturesFromStorage = (): ExpansionFeatureState => {
  const stored = loadPrefs<PersistedPrefs>();
  return hydrateExpansionFeatures(stored.features);
};

const persistExpansionFeatures = () => {
  const stored = loadPrefs<PersistedPrefs>();
  savePrefs({
    ...stored,
    features: {
      ...(stored.features ?? {}),
      ...featureState,
    },
  });
};

export const isEditorsFeatureEnabled = (): boolean => featureState.editors;

export const setEditorsFeatureEnabled = (enabled: boolean): ExpansionFeatureState => {
  featureState = sanitizeFeatureState({ ...featureState, editors: enabled });
  persistExpansionFeatures();
  return getExpansionFeaturesSnapshot();
};

export const isTabloidRelicsFeatureEnabled = (): boolean => featureState.tabloidRelics;

export const setTabloidRelicsFeatureEnabled = (enabled: boolean): ExpansionFeatureState => {
  featureState = sanitizeFeatureState({ ...featureState, tabloidRelics: enabled });
  persistExpansionFeatures();
  return getExpansionFeaturesSnapshot();
};
