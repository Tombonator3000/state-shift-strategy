import { useState, useEffect } from 'react';
import {
  DistributionSettings,
  DistributionMode,
  DEFAULT_DISTRIBUTION_SETTINGS,
  weightedDistribution,
  sanitizeDistributionSettings,
  loadDistributionSettingsFromStorage,
  persistDistributionSettings,
} from '@/data/weightedCardDistribution';
import { getEnabledExpansionIdsSnapshot } from '@/data/expansions/state';

export const useDistributionSettings = () => {
  const [settings, setSettings] = useState<DistributionSettings>(
    sanitizeDistributionSettings(DEFAULT_DISTRIBUTION_SETTINGS),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = loadDistributionSettingsFromStorage();
        if (saved) {
          setSettings(saved);
          weightedDistribution.updateSettings(saved);
        } else {
          const defaults = sanitizeDistributionSettings(DEFAULT_DISTRIBUTION_SETTINGS);
          weightedDistribution.updateSettings(defaults);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const sanitized = persistDistributionSettings(settings);
      weightedDistribution.updateSettings(sanitized);
    }
  }, [settings, isLoading]);

  const setMode = (targetMode: DistributionMode) => {
    const enabledExpansions = getEnabledExpansionIdsSnapshot();
    const resolvedMode = enabledExpansions.length > 0 ? targetMode : 'core-only';

    setSettings(prev => sanitizeDistributionSettings({ ...prev, mode: resolvedMode }));
  };

  const setSetWeight = (setId: string, weight: number) => {
    const enabledExpansions = getEnabledExpansionIdsSnapshot();
    if (setId !== 'core' && !enabledExpansions.includes(setId)) {
      return;
    }

    setSettings(prev =>
      sanitizeDistributionSettings({
        ...prev,
        setWeights: {
          ...prev.setWeights,
          [setId]: weight,
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
    const defaults = sanitizeDistributionSettings(DEFAULT_DISTRIBUTION_SETTINGS);
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
