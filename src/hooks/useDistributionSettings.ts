import { useState, useEffect } from 'react';
import { 
  DistributionSettings, 
  DistributionMode, 
  DEFAULT_DISTRIBUTION_SETTINGS,
  weightedDistribution
} from '@/data/weightedCardDistribution';
import { extensionManager } from '@/data/extensionSystem';

const STORAGE_KEY = 'shadowgov-distribution-settings';

export const useDistributionSettings = () => {
  const [settings, setSettings] = useState<DistributionSettings>(DEFAULT_DISTRIBUTION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedSettings = JSON.parse(saved);
          
          // Ensure enabled extensions have weights
          const enabledExtensions = extensionManager.getEnabledExtensions();
          const updatedWeights = { ...savedSettings.setWeights };
          
          enabledExtensions.forEach(ext => {
            if (!(ext.id in updatedWeights)) {
              updatedWeights[ext.id] = 1.0; // Default weight for new extensions
            }
          });

          const mergedSettings = {
            ...DEFAULT_DISTRIBUTION_SETTINGS,
            ...savedSettings,
            setWeights: updatedWeights
          };
          
          setSettings(mergedSettings);
          weightedDistribution.updateSettings(mergedSettings);
        }
      } catch (error) {
        console.error('Failed to load distribution settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        weightedDistribution.updateSettings(settings);
      } catch (error) {
        console.error('Failed to save distribution settings:', error);
      }
    }
  }, [settings, isLoading]);

  // Update mode
  const setMode = (mode: DistributionMode) => {
    setSettings(prev => ({ ...prev, mode }));
  };

  // Update set weight
  const setSetWeight = (setId: string, weight: number) => {
    const clampedWeight = Math.max(0, Math.min(3, weight));
    setSettings(prev => ({
      ...prev,
      setWeights: {
        ...prev.setWeights,
        [setId]: clampedWeight
      }
    }));
  };

  // Update rarity targets
  const setRarityTarget = (rarity: keyof DistributionSettings['rarityTargets'], value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setSettings(prev => ({
      ...prev,
      rarityTargets: {
        ...prev.rarityTargets,
        [rarity]: clampedValue
      }
    }));
  };

  // Toggle type balancing
  const toggleTypeBalancing = () => {
    setSettings(prev => ({
      ...prev,
      typeBalancing: {
        ...prev.typeBalancing,
        enabled: !prev.typeBalancing.enabled
      }
    }));
  };

  // Set duplicate limit
  const setDuplicateLimit = (limit: number) => {
    const clampedLimit = Math.max(1, Math.min(5, limit));
    setSettings(prev => ({ ...prev, duplicateLimit: clampedLimit }));
  };

  // Set early seed count
  const setEarlySeedCount = (count: number) => {
    const clampedCount = Math.max(0, Math.min(10, count));
    setSettings(prev => ({ ...prev, earlySeedCount: clampedCount }));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(DEFAULT_DISTRIBUTION_SETTINGS);
  };

  // Get simulation results
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
    getSimulation
  };
};