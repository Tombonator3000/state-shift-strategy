import { useCallback, useRef, TouchEvent } from 'react';

export interface SwipeGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const useSwipeGestures = (handlers: SwipeGestureHandlers) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;
  const maxSwipeTime = 300;
  const swipeStartTimeRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    swipeStartTimeRef.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY
    };

    const swipeTime = Date.now() - swipeStartTimeRef.current;
    
    // Only process quick swipes
    if (swipeTime > maxSwipeTime) {
      touchStartRef.current = null;
      return;
    }

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine swipe direction (horizontal takes precedence if both are significant)
    if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }

    touchStartRef.current = null;
  }, [handlers]);

  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel
  };
};