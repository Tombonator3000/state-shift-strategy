import { useCallback, useRef } from 'react';
import { StateCombinationManager, StateCombination } from '@/data/stateCombinations';
import { getSynergyEffectIdentifier } from '@/utils/synergyEffects';
import { useScreenShake } from '@/components/effects/ScreenShake';
import { useHapticFeedback } from './useHapticFeedback';

export const useSynergyDetection = () => {
  const combinationManagerRef = useRef(new StateCombinationManager());
  const { shake } = useScreenShake();
  const { triggerHaptic } = useHapticFeedback();

  const checkSynergies = useCallback((
    controlledStates: string[], 
    onSynergyActivated?: (combo: StateCombination, position?: { x: number; y: number }) => void,
    onParticleEffect?: (type: string, x: number, y: number) => void,
    onFloatingNumber?: (value: number, type: string, x?: number, y?: number) => void
  ): StateCombination[] => {
    const newCombinations = combinationManagerRef.current.checkCombinations(controlledStates);
    
    if (newCombinations.length > 0) {
      // Calculate intensity based on number and value of combinations
      const totalBonus = newCombinations.reduce((sum, combo) => sum + combo.bonusIP, 0);
      const intensity = totalBonus >= 10 ? 'heavy' : totalBonus >= 5 ? 'medium' : 'light';
      
      // Trigger coordinated effects for each new combination
      newCombinations.forEach((combo, index) => {
        const delay = index * 200; // Stagger multiple combo activations
        
        setTimeout(() => {
          const effectIdentifier = getSynergyEffectIdentifier(combo.category);
          const effectType = effectIdentifier ?? 'synergy';

          // Screen shake based on combo value
          if (combo.bonusIP >= 5) {
            shake({ intensity, duration: 400 });
          }
          
          // Haptic feedback with progressive intensity
          const hapticType = combo.bonusIP >= 6 ? 'success' : combo.bonusIP >= 4 ? 'medium' : 'light';
          triggerHaptic(hapticType);
          
          // Calculate position for visual effects (center of screen with slight randomization)
          const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
          const centerY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
          
          // Trigger particle effects using category-specific identifier
          onParticleEffect?.(effectType, centerX, centerY);

          // Show floating number for bonus IP with themed styling
          onFloatingNumber?.(combo.bonusIP, effectType, centerX, centerY - 50);
          
          // Notify parent component
          onSynergyActivated?.(combo, { x: centerX, y: centerY });
          
          // Trigger chain effects for multi-combo activations
          if (newCombinations.length > 1) {
            setTimeout(() => {
              onParticleEffect?.('chain', centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 100);
            }, 300);
          }
        }, delay);
      });
      
      // Special effects for big combo chains
      if (newCombinations.length >= 3) {
        setTimeout(() => {
          onParticleEffect?.('bigwin', window.innerWidth / 2, window.innerHeight / 2);
          onFloatingNumber?.(totalBonus, 'combo', window.innerWidth / 2, window.innerHeight / 3);
        }, newCombinations.length * 200 + 500);
      }
    }
    
    return newCombinations;
  }, [shake, triggerHaptic]);

  const getActiveCombinations = useCallback(() => {
    return combinationManagerRef.current.getActiveCombinations();
  }, []);

  const getTotalBonusIP = useCallback(() => {
    return combinationManagerRef.current.getTotalBonusIP();
  }, []);

  const getPotentialCombinations = useCallback((controlledStates: string[]) => {
    return combinationManagerRef.current.getPotentialCombinations(controlledStates);
  }, []);

  const reset = useCallback(() => {
    combinationManagerRef.current.reset();
  }, []);

  return {
    checkSynergies,
    getActiveCombinations,
    getTotalBonusIP,
    getPotentialCombinations,
    reset
  };
};