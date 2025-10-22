import { useState, useEffect } from 'react';
import type { CampaignProgress } from '@/data/campaign';
import { getInitialCampaignProgress } from '@/data/campaign';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

const STORAGE_KEY = 'paranoid-times-campaign-progress';

export function useCampaignProgress() {
  const [progress, setProgress] = useState<CampaignProgress>(getInitialCampaignProgress);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const saved = safeGetLocalStorageItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch {
        setProgress(getInitialCampaignProgress());
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hasHydrated, progress]);

  const completeMission = (missionId: string, victory: boolean) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      if (victory) {
        if (!newProgress.completedMissions.includes(missionId)) {
          newProgress.completedMissions.push(missionId);
        }
        newProgress.victoryCount += 1;
        
        // Unlock next mission
        newProgress.currentMission = Math.max(
          newProgress.currentMission,
          newProgress.completedMissions.length + 1
        );
      } else {
        newProgress.defeatCount += 1;
      }
      
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
