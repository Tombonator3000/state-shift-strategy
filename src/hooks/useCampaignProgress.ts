import { useState, useEffect } from 'react';
import type { CampaignProgress } from '@/data/campaign';
import { getInitialCampaignProgress } from '@/data/campaign';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

const STORAGE_KEY = 'paranoid-times-campaign-progress';

export function useCampaignProgress() {
  const [progress, setProgress] = useState<CampaignProgress>(() => {
    const saved = safeGetLocalStorageItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialCampaignProgress();
      }
    }
    return getInitialCampaignProgress();
  });

  useEffect(() => {
    safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completeMission = (missionId: string, victory: boolean) => {
    setProgress(prev => {
      const completedMissions = [...prev.completedMissions];
      if (victory && !completedMissions.includes(missionId)) {
        completedMissions.push(missionId);
      }

      const unlockedCards = [...prev.unlockedCards];
      const unlockedPersonas = [...prev.unlockedPersonas];

      const victoryCount = victory ? prev.victoryCount + 1 : prev.victoryCount;
      const defeatCount = victory ? prev.defeatCount : prev.defeatCount + 1;
      const currentMission = victory
        ? Math.max(prev.currentMission, completedMissions.length + 1)
        : prev.currentMission;

      const newProgress: CampaignProgress = {
        completedMissions,
        unlockedCards,
        unlockedPersonas,
        victoryCount,
        defeatCount,
        currentMission,
      };

      return newProgress;
    });
  };

  const unlockRewards = (cards: string[] = [], personas: string[] = []) => {
    setProgress(prev => ({
      ...prev,
      unlockedCards: [...new Set([...prev.unlockedCards, ...cards])],
      unlockedPersonas: [...new Set([...prev.unlockedPersonas, ...personas])],
    }));
  };

  const resetProgress = () => {
    setProgress(getInitialCampaignProgress());
  };

  return {
    progress,
    completeMission,
    unlockRewards,
    resetProgress,
  };
}
