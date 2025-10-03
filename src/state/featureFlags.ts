import { FEATURE_EDITORS_MINIDRAFT } from '../expansions/editors/EditorsEngine';

export type FeatureFlags = {
  newspaperV2: boolean;
  aiVerboseStrategyLog: boolean;
  hotspotDirectorEnabled: boolean;
  editorsMiniDraft: boolean;
};

const DEFAULT_FLAGS: FeatureFlags = {
  newspaperV2: true,
  aiVerboseStrategyLog: false,
  hotspotDirectorEnabled: true,
  editorsMiniDraft: FEATURE_EDITORS_MINIDRAFT,
};

const readBoolean = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage?.getItem(key);
    if (stored === null || stored === undefined) {
      return fallback;
    }
    if (stored === 'true') {
      return true;
    }
    if (stored === 'false') {
      return false;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const overrides: Partial<FeatureFlags> =
  typeof window !== 'undefined' && (window as any)?.shadowgovFeatureFlags
    ? (window as any).shadowgovFeatureFlags
    : {};

export const featureFlags: FeatureFlags = {
  newspaperV2: overrides.newspaperV2 ?? readBoolean('shadowgov:flag:newspaperV2', DEFAULT_FLAGS.newspaperV2),
  aiVerboseStrategyLog:
    overrides.aiVerboseStrategyLog ?? readBoolean('shadowgov:flag:aiVerboseStrategyLog', DEFAULT_FLAGS.aiVerboseStrategyLog),
  hotspotDirectorEnabled:
    overrides.hotspotDirectorEnabled
      ?? readBoolean('shadowgov:flag:hotspotDirectorEnabled', DEFAULT_FLAGS.hotspotDirectorEnabled),
  editorsMiniDraft:
    overrides.editorsMiniDraft ?? readBoolean('shadowgov:flag:editorsMiniDraft', DEFAULT_FLAGS.editorsMiniDraft),
};
