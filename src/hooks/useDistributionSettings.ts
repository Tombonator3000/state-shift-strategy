import { useState, useEffect } from 'react';
import {
  DistributionSettings,
  DistributionMode,
  DEFAULT_DISTRIBUTION_SETTINGS,
  weightedDistribution,
} from '@/data/weightedCardDistribution';

const STORAGE_KEY = 'shadowgov-distribution-settings';

const sanitizeSettings = (incoming: DistributionSettings): DistributionSettings => {
  const coreWeight = incoming.setWeights?.core ?? DEFAULT_DISTRIBUTION_SETTINGS.setWeights.core;
  return {
    ...DEFAULT_DISTRIBUTION_SETTINGS,
    ...incoming,
    mode: 'core-only',
    setWeights: { core: coreWeight },
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

  const setMode = (_mode: DistributionMode) => {
    setSettings(prev => ({ ...prev, mode: 'core-only' }));
  };

  const setSetWeight = (setId: string, weight: number) => {
    if (setId !== 'core') return;
    const clampedWeight = Math.max(0, Math.min(3, weight));
    setSettings(prev => ({
      ...prev,
      setWeights: { core: clampedWeight },
    }));
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
