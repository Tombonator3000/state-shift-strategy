import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if device supports haptic feedback
    if (!('vibrate' in navigator) || !navigator.vibrate) {
      return;
    }

    // Different vibration patterns for different feedback types
    const patterns = {
      light: [10],
      medium: [25],
      heavy: [50],
      success: [10, 50, 10],
      error: [50, 100, 50],
      selection: [5]
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      // Silently fail if vibration is not supported
      console.debug('Haptic feedback not available');
    }
  }, []);

  return { triggerHaptic };
};