import { useGameSettings } from '@/contexts/GameSettingsContext';

interface ScreenShakeProps {
  active: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  onComplete?: () => void;
}

export const useScreenShake = () => {
  const { settings } = useGameSettings();
  const shake = ({
    intensity = 'medium',
    duration = 300,
    onComplete
  }: {
    intensity?: 'light' | 'medium' | 'heavy';
    duration?: number;
    onComplete?: () => void;
  }) => {
    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !settings.screenShake) {
      onComplete?.();
      return;
    }

    const body = document.body;
    const originalTransform = body.style.transform;
    
    const intensityMap = {
      light: 2,
      medium: 4,
      heavy: 8
    };
    
    const shakeAmount = intensityMap[intensity];
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        body.style.transform = originalTransform;
        onComplete?.();
        return;
      }
      
      // Decrease shake intensity over time
      const currentIntensity = shakeAmount * (1 - progress);
      const offsetX = (Math.random() - 0.5) * currentIntensity;
      const offsetY = (Math.random() - 0.5) * currentIntensity;
      
      body.style.transform = `${originalTransform} translate(${offsetX}px, ${offsetY}px)`;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  };

  return { shake };
};