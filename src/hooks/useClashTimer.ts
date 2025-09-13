import { useEffect, useRef } from "react";

interface ClashTimerProps {
  isOpen: boolean;
  expiresAt?: number;
  windowMs: number;
  onTimeout: () => void;
}

export function useClashTimer({ isOpen, expiresAt, windowMs, onTimeout }: ClashTimerProps) {
  const rafRef = useRef<number>(0);
  const hardTimeoutRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !expiresAt) {
      // Reset when closed
      hasTriggeredRef.current = false;
      return;
    }

    console.log(`[Clash] Timer starting - expiresAt: ${expiresAt}, windowMs: ${windowMs}`);
    hasTriggeredRef.current = false;

    // ✨ Hard safety timeout - absolute fallback
    hardTimeoutRef.current = window.setTimeout(() => {
      if (!hasTriggeredRef.current) {
        console.log("[Clash] HARD TIMEOUT - Force resolving after 6s");
        hasTriggeredRef.current = true;
        onTimeout();
      }
    }, windowMs + 2000);

    const tick = () => {
      if (!isOpen) {
        console.log("[Clash] Timer stopped - clash closed");
        return;
      }

      const now = Date.now();
      const timeLeft = expiresAt - now;
      console.log(`[Clash] Timer tick - timeLeft: ${timeLeft}ms`);
      
      if (timeLeft <= 0) {
        if (!hasTriggeredRef.current) {
          console.log("[Clash] Timer expired - resolving");
          hasTriggeredRef.current = true;
          onTimeout();
        }
        return;
      }
      
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      console.log("[Clash] Cleaning up timer");
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (hardTimeoutRef.current) {
        clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
    };
  }, [isOpen, expiresAt, windowMs, onTimeout]);

  // Return time left for UI
  return {
    msLeft: Math.max(0, (expiresAt ?? 0) - Date.now())
  };
}