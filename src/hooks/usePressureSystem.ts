import { useState, useCallback } from 'react';

interface PressureState {
  [stateId: string]: {
    playerPressure: number;
    aiPressure: number;
    contested: boolean;
  };
}

export const usePressureSystem = () => {
  const [pressureStates, setPressureStates] = useState<PressureState>({});

  const addPressure = useCallback((stateId: string, amount: number, faction: 'player' | 'ai') => {
    setPressureStates(prev => {
      const current = prev[stateId] || { playerPressure: 0, aiPressure: 0, contested: false };
      const updated = { ...current };
      
      if (faction === 'player') {
        updated.playerPressure += amount;
      } else {
        updated.aiPressure += amount;
      }
      
      // Mark as contested if both sides have pressure
      updated.contested = updated.playerPressure > 0 && updated.aiPressure > 0;
      
      return {
        ...prev,
        [stateId]: updated
      };
    });
  }, []);

  const capturableStates = useCallback((states: any[], defense: number) => {
    return states.filter(state => {
      const pressure = pressureStates[state.id];
      if (!pressure) return false;
      
      const totalPressure = Math.max(pressure.playerPressure - pressure.aiPressure, 0);
      return totalPressure >= defense;
    });
  }, [pressureStates]);

  const captureState = useCallback((stateId: string) => {
    setPressureStates(prev => ({
      ...prev,
      [stateId]: { playerPressure: 0, aiPressure: 0, contested: false }
    }));
  }, []);

  return {
    pressureStates,
    addPressure,
    capturableStates,
    captureState
  };
};