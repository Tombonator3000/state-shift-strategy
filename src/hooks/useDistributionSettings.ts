import { useState, useEffect } from 'react';
import {
  DistributionSettings,
  DistributionMode,
  DEFAULT_DISTRIBUTION_SETTINGS,
  weightedDistribution,
} from '@/data/weightedCardDistribution';
import { getEnabledExpansionIdsSnapshot } from '@/data/expansions/state';

const STORAGE_KEY = 'shadowgov-distribution-settings';

const DEFAULT_EXPANSION_WEIGHT = 1;
const MIN_WEIGHT = 0;
const MAX_WEIGHT = 3;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const toValidWeight = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clamp(value, MIN_WEIGHT, MAX_WEIGHT);
  }

  return clamp(fallback, MIN_WEIGHT, MAX_WEIGHT);
};

const sanitizeSettings = (incoming: DistributionSettings): DistributionSettings => {
  const enabledExpansions = getEnabledExpansionIdsSnapshot();
  const hasEnabledExpansions = enabledExpansions.length > 0;

  const requestedMode = incoming.mode ?? DEFAULT_DISTRIBUTION_SETTINGS.mode;
  const mode = hasEnabledExpansions ? requestedMode : 'core-only';

  const sourceWeights = incoming.setWeights ?? DEFAULT_DISTRIBUTION_SETTINGS.setWeights;
  const sanitizedSetWeights: DistributionSettings['setWeights'] = {
    core: toValidWeight(
      sourceWeights.core,
      DEFAULT_DISTRIBUTION_SETTINGS.setWeights.core,
    ),
  };

  for (const expansionId of enabledExpansions) {
    const fallback =
      typeof DEFAULT_DISTRIBUTION_SETTINGS.setWeights[expansionId] === 'number'
        ? DEFAULT_DISTRIBUTION_SETTINGS.setWeights[expansionId]
        : DEFAULT_EXPANSION_WEIGHT;

    sanitizedSetWeights[expansionId] = toValidWeight(sourceWeights[expansionId], fallback);
  }

  return {
    ...DEFAULT_DISTRIBUTION_SETTINGS,
    ...incoming,
    mode,
    setWeights: sanitizedSetWeights,
  };
};

export const useDistributionSettings = () => {
  const [settings, setSettings] = useState<DistributionSettings>(sanitizeSettings(DEFAULT_DISTRIBUTION_SETTINGS));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedSettings = JSON.parse(saved) as DistributionSettings;
          const merged = sanitizeSettings(savedSettings);
          setSettings(merged);
          weightedDistribution.updateSettings(merged);
        }
      } catch (error) {
        console.error('Failed to load distribution settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        const sanitized = sanitizeSettings(settings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        weightedDistribution.updateSettings(sanitized);
      } catch (error) {
        console.error('Failed to save distribution settings:', error);
      }
    }
  }, [settings, isLoading]);

  const setMode = (targetMode: DistributionMode) => {
    const enabledExpansions = getEnabledExpansionIdsSnapshot();
    const resolvedMode = enabledExpansions.length > 0 ? targetMode : 'core-only';

    setSettings(prev => sanitizeSettings({ ...prev, mode: resolvedMode }));
  };

  const setSetWeight = (setId: string, weight: number) => {
    const enabledExpansions = getEnabledExpansionIdsSnapshot();
    if (setId !== 'core' && !enabledExpansions.includes(setId)) {
      return;
    }

    const clampedWeight = clamp(weight, MIN_WEIGHT, MAX_WEIGHT);

    setSettings(prev =>
      sanitizeSettings({
        ...prev,
        setWeights: {
          ...prev.setWeights,
          [setId]: clampedWeight,
        },
      }),
    );
  };

  const setRarityTarget = (
    rarity: keyof DistributionSettings['rarityTargets'],
    value: number,
  ) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setSettings(prev => ({
      ...prev,
      rarityTargets: {
        ...prev.rarityTargets,
        [rarity]: clampedValue,
      },
    }));
  };

  const toggleTypeBalancing = () => {
    setSettings(prev => ({
      ...prev,
      typeBalancing: {
        ...prev.typeBalancing,
        enabled: !prev.typeBalancing.enabled,
      },
    }));
  };

  const setDuplicateLimit = (limit: number) => {
    const clampedLimit = Math.max(1, Math.min(5, limit));
    setSettings(prev => ({ ...prev, duplicateLimit: clampedLimit }));
  };

  const setEarlySeedCount = (count: number) => {
    const clampedCount = Math.max(0, Math.min(10, count));
    setSettings(prev => ({ ...prev, earlySeedCount: clampedCount }));
  };

  const resetToDefaults = () => {
    const defaults = sanitizeSettings(DEFAULT_DISTRIBUTION_SETTINGS);
    setSettings(defaults);
  };

  const getSimulation = (trials: number = 1000) => {
    return weightedDistribution.simulateDeckComposition(trials);
  };

  return {
    settings,
    isLoading,
    setMode,
    setSetWeight,
    setRarityTarget,
    toggleTypeBalancing,
    setDuplicateLimit,
    setEarlySeedCount,
    resetToDefaults,
    getSimulation,
  };
};
