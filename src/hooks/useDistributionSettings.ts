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
  const getEnabledExpansions = () => getEnabledExpansionIdsSnapshot();
  const initialEnabled = getEnabledExpansions();
  const [settings, setSettings] = useState<DistributionSettings>(
    sanitizeDistributionSettings(DEFAULT_DISTRIBUTION_SETTINGS, initialEnabled),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const enabledIds = getEnabledExpansions();
        const saved = loadDistributionSettingsFromStorage(enabledIds);
        if (saved) {
          setSettings(saved);
          weightedDistribution.updateSettings(saved, enabledIds);
        } else {
          const defaults = sanitizeDistributionSettings(
            DEFAULT_DISTRIBUTION_SETTINGS,
            enabledIds,
          );
          weightedDistribution.updateSettings(defaults, enabledIds);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const enabledIds = getEnabledExpansions();
      const sanitized = persistDistributionSettings(settings, enabledIds);
      weightedDistribution.updateSettings(sanitized, enabledIds);
    }
  }, [settings, isLoading]);

  const setMode = (targetMode: DistributionMode) => {
    const enabledExpansions = getEnabledExpansions();
    const resolvedMode = enabledExpansions.length > 0 ? targetMode : 'core-only';

    setSettings(prev =>
      sanitizeDistributionSettings({ ...prev, mode: resolvedMode }, enabledExpansions),
    );
  };

  const setSetWeight = (setId: string, weight: number) => {
    const enabledExpansions = getEnabledExpansions();
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
      }, enabledExpansions),
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
    const enabledExpansions = getEnabledExpansions();
    const defaults = sanitizeDistributionSettings(
      DEFAULT_DISTRIBUTION_SETTINGS,
      enabledExpansions,
    );
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
