import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AchievementManager, type Achievement, type PlayerStats } from '@/data/achievementSystem';
import { useToast } from '@/hooks/use-toast';

interface AchievementContextType {
  manager: AchievementManager;
  stats: PlayerStats;
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
  updateStats: (updates: Partial<PlayerStats>) => void;
  onGameStart: (faction: 'truth' | 'government', aiDifficulty: string) => void;
  onGameEnd: (won: boolean, victoryType: string, gameData: any) => void;
  onCardPlayed: (cardId: string, cardType: string) => void;
  exportData: () => any;
  importData: (data: any) => boolean;
  resetProgress: () => void;
  clearNewlyUnlocked: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [manager] = useState(() => {
    console.log('Creating AchievementManager singleton');
    return new AchievementManager();
  });
  const [stats, setStats] = useState<PlayerStats>(() => manager.getStats());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const { toast } = useToast();

  // Update stats when manager changes
  const refreshStats = useCallback(() => {
    console.log('Refreshing achievement stats');
    const newStats = manager.getStats();
    setStats(newStats);
    
    // Check for newly unlocked achievements
    const newUnlocked = manager.getNewlyUnlocked();
    if (newUnlocked.length > 0) {
      console.log('New achievements unlocked:', newUnlocked.map(a => a.name));
      setNewlyUnlocked(prev => [...prev, ...newUnlocked]);
      
      // Show toast notifications
      newUnlocked.forEach(achievement => {
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.name} - ${achievement.points} points`,
          duration: 5000,
        });
      });
    }
  }, [manager, toast]);

  const updateStats = useCallback((updates: Partial<PlayerStats>) => {
    console.log('Updating achievement stats:', updates);
    manager.updateStats(updates);
    refreshStats();
  }, [manager, refreshStats]);

  const onGameStart = useCallback((faction: 'truth' | 'government', aiDifficulty: string) => {
    console.log('Achievement: Game started', { faction, aiDifficulty });
    manager.onGameStart(faction, aiDifficulty);
    refreshStats();
  }, [manager, refreshStats]);

  const onGameEnd = useCallback((won: boolean, victoryType: string, gameData: any) => {
    console.log('Achievement: Game ended', { won, victoryType, gameData });
    manager.onGameEnd(won, victoryType, gameData.turns || 0, gameData.finalIP || 0, gameData.finalTruth || 0, gameData.statesControlled || 0);
    refreshStats();
  }, [manager, refreshStats]);

  const onCardPlayed = useCallback((cardId: string, cardType: string) => {
    console.log('Achievement: Card played', { cardId, cardType });
    manager.onCardPlayed(cardId, cardType);
    refreshStats();
  }, [manager, refreshStats]);

  const exportData = useCallback(() => {
    return manager.exportData();
  }, [manager]);

  const importData = useCallback((data: any) => {
    try {
      // Validate data structure
      if (!data.stats || !data.unlockedAchievements) {
        console.error('Invalid achievement data format');
        return false;
      }
      
      // Import data to manager
      const success = manager.importData(data);
      if (success) {
        refreshStats();
        toast({
          title: "Import Successful",
          description: "Your achievement progress has been restored",
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to import achievement data:', error);
      toast({
        title: "Import Failed",
        description: "Could not restore achievement progress",
        variant: "destructive",
      });
      return false;
    }
  }, [manager, refreshStats, toast]);

  const resetProgress = useCallback(() => {
    console.log('Resetting achievement progress');
    manager.resetProgress();
    setNewlyUnlocked([]);
    refreshStats();
    toast({
      title: "Progress Reset",
      description: "All achievements and statistics have been reset",
    });
  }, [manager, refreshStats, toast]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  // Load initial data on mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const value: AchievementContextType = {
    manager,
    stats,
    unlockedAchievements: manager.getUnlockedAchievements(),
    lockedAchievements: manager.getLockedAchievements(),
    newlyUnlocked,
    updateStats,
    onGameStart,
    onGameEnd,
    onCardPlayed,
    exportData,
    importData,
    resetProgress,
    clearNewlyUnlocked,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};