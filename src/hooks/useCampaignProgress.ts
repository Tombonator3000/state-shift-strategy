import { useState, useEffect } from 'react';
import type { CampaignProgress } from '@/data/campaign';
import { getInitialCampaignProgress } from '@/data/campaign';

const STORAGE_KEY = 'paranoid-times-campaign-progress';

export function useCampaignProgress() {
  const [progress, setProgress] = useState<CampaignProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

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
