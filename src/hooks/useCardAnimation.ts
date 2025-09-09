import { useCallback, useRef } from 'react';
import type { GameCard } from '@/components/game/GameHand';
import { useScreenShake } from '@/components/effects/ScreenShake';

interface AnimationRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlayResult {
  cancelled: boolean;
  countered: boolean;
}

interface AnimationOptions {
  targetState?: string;
  onResolve?: (card: GameCard) => Promise<void>;
  onComplete?: () => void;
}

export const useCardAnimation = () => {
  const animatingRef = useRef(false);
  const { shake } = useScreenShake();

  const getBoundingRect = (element: Element): AnimationRect => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  };

  const centerRect = (containerRect: DOMRect, size: { width: number; height: number }): AnimationRect => {
    return {
      x: containerRect.left + (containerRect.width - size.width) / 2,
      y: containerRect.top + (containerRect.height - size.height) / 2,
      width: size.width,
      height: size.height
    };
  };

  const positionElementFromRect = (element: HTMLElement, rect: AnimationRect) => {
    element.style.position = 'absolute';
    element.style.left = `${rect.x}px`;
    element.style.top = `${rect.y}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.transform = 'translate3d(0, 0, 0)';
  };

  const createTrailEffect = (element: HTMLElement, fromRect: AnimationRect, toRect: AnimationRect) => {
    const trail = document.createElement('div');
    trail.className = 'fixed pointer-events-none z-[1500]';
    trail.style.cssText = `
      position: fixed;
      left: ${fromRect.x + fromRect.width / 2}px;
      top: ${fromRect.y + fromRect.height / 2}px;
      width: 4px;
      height: 4px;
      background: linear-gradient(45deg, hsl(var(--primary)), transparent);
      border-radius: 50%;
      box-shadow: 0 0 10px hsl(var(--primary) / 0.8);
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(trail);
    
    // Animate trail to target
    const animate = () => {
      const targetX = toRect.x + toRect.width / 2;
      const targetY = toRect.y + toRect.height / 2;
      
      trail.style.left = `${targetX}px`;
      trail.style.top = `${targetY}px`;
      trail.style.transition = 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      
      setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => trail.remove(), 200);
      }, 300);
    };
    
    requestAnimationFrame(animate);
  };

  const tweenTransform = (
    element: HTMLElement, 
    fromRect: AnimationRect, 
    toRect: AnimationRect, 
    options: { duration: number; withTrail?: boolean }
  ): Promise<void> => {
    return new Promise((resolve) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        positionElementFromRect(element, toRect);
        resolve();
        return;
      }

      // Add trail effect for dramatic card movement
      if (options.withTrail) {
        createTrailEffect(element, fromRect, toRect);
      }

      const startTime = performance.now();
      const scaleX = toRect.width / fromRect.width;
      const scaleY = toRect.height / fromRect.height;
      const translateX = toRect.x - fromRect.x;
      const translateY = toRect.y - fromRect.y;

      // Enhanced shadow and glow during animation
      const originalFilter = element.style.filter;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / options.duration, 1);
        
        // Enhanced easing with bounce effect
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentTranslateX = translateX * easeProgress;
        const currentTranslateY = translateY * easeProgress;
        const currentScaleX = 1 + (scaleX - 1) * easeProgress;
        const currentScaleY = 1 + (scaleY - 1) * easeProgress;

        // Dynamic glow intensity
        const glowIntensity = Math.sin(progress * Math.PI) * 30;
        element.style.transform = `translate3d(${currentTranslateX}px, ${currentTranslateY}px, 0) scale(${currentScaleX}, ${currentScaleY})`;
        element.style.filter = `drop-shadow(0 ${8 + glowIntensity}px ${24 + glowIntensity}px rgba(0,0,0,0.35)) drop-shadow(0 0 ${10 + glowIntensity}px hsl(var(--primary) / 0.4))`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.filter = originalFilter;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  const smallShake = (element: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        resolve();
        return;
      }

      const originalTransform = element.style.transform;
      let shakeCount = 0;
      const maxShakes = 6;
      const shakeDistance = 8;

      const shake = () => {
        if (shakeCount >= maxShakes) {
          element.style.transform = originalTransform;
          resolve();
          return;
        }

        const direction = shakeCount % 2 === 0 ? shakeDistance : -shakeDistance;
        element.style.transform = `${originalTransform} translateX(${direction}px)`;
        shakeCount++;
        
        setTimeout(shake, 80);
      };

      shake();
    });
  };

  const flyToPlayedPile = async (element: HTMLElement): Promise<void> => {
    const playedPile = document.getElementById('played-pile');
    if (!playedPile) return;

    const pileRect = playedPile.getBoundingClientRect();
    const pileCards = playedPile.children.length;
    const cardWidth = 200;
    const cardHeight = 280;
    const cols = 5;
    
    const col = pileCards % cols;
    const row = Math.floor(pileCards / cols);
    
    const destRect: AnimationRect = {
      x: pileRect.left + col * (cardWidth + 4),
      y: pileRect.top + row * (cardHeight + 4),
      width: cardWidth,
      height: cardHeight
    };

    const currentRect = getBoundingRect(element);
    await tweenTransform(element, currentRect, destRect, { duration: 400 });

    // Create permanent large played card element with full details
    const playedCard = document.createElement('div');
    playedCard.className = 'played-card bg-card border-2 border-border rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform';
    playedCard.style.width = `${cardWidth}px`;
    playedCard.style.height = `${cardHeight}px`;
    
    // Enhanced played card with full details
    const cardData = JSON.parse(element.dataset.cardData || '{}');
    playedCard.innerHTML = `
      <div class="relative h-full">
        <div class="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold z-10">
          ${cardData.cost || '?'}
        </div>
        <div class="p-3 pb-2 bg-gradient-to-r from-card to-card/80">
          <h4 class="font-bold text-sm font-mono text-center">${cardData.name || 'Unknown'}</h4>
        </div>
        <div class="h-32 border-y overflow-hidden">
          <img src="/lovable-uploads/e7c952a9-333a-4f6b-b1b5-f5aeb6c3d9c1.png" alt="Card art" class="w-full h-full object-cover" />
        </div>
        <div class="p-3 space-y-2">
          <div class="flex justify-center">
            <span class="text-xs font-mono px-2 py-1 bg-accent/20 border border-accent rounded">${cardData.type || 'UNKNOWN'}</span>
          </div>
          <div class="text-xs text-center font-medium min-h-8 flex items-center justify-center">
            ${cardData.text || 'Effect unknown'}
          </div>
          <div class="text-xs italic text-muted-foreground text-center min-h-6 border-t border-border pt-2">
            "${cardData.flavorTruth || 'No flavor text'}"
          </div>
          <div class="text-xs text-center font-bold text-primary">
            DEPLOYED
          </div>
        </div>
      </div>
    `;
    
    playedPile.appendChild(playedCard);
  };

  const highlightState = (stateId?: string) => {
    // Remove existing highlights
    document.querySelectorAll('.state-highlight').forEach(el => {
      el.classList.remove('state-highlight');
    });

    if (stateId) {
      const stateElement = document.querySelector(`[data-state-id="${stateId}"]`);
      if (stateElement) {
        stateElement.classList.add('state-highlight');
      }
    }
  };

  const animatePlayCard = useCallback(async (
    cardUid: string, 
    card: GameCard,
    options: AnimationOptions = {}
  ): Promise<PlayResult> => {
    if (animatingRef.current) {
      return { cancelled: true, countered: false };
    }

    animatingRef.current = true;

    try {
      // Find the card element in the hand
      const cardElement = document.querySelector(`[data-card-id="${cardUid}"]`) as HTMLElement;
      if (!cardElement) {
        return { cancelled: true, countered: false };
      }

      const startRect = getBoundingRect(cardElement);
      const layer = document.getElementById('card-play-layer');
      if (!layer) {
        return { cancelled: true, countered: false };
      }

      // Create clone for animation and store card data
      const clone = cardElement.cloneNode(true) as HTMLElement;
      clone.classList.add('play-card-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.style.willChange = 'transform, opacity, filter';
      clone.style.filter = 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))';
      clone.style.transition = 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), opacity 150ms linear';
      
      // Store card data for played pile display
      clone.dataset.cardData = JSON.stringify(card);
      
      layer.appendChild(clone);
      positionElementFromRect(clone, startRect);

      // Calculate destination (center of map container)
      const mapContainer = document.getElementById('map-container') || document.querySelector('.flex-1');
      if (!mapContainer) {
        clone.remove();
        return { cancelled: true, countered: false };
      }

      const mapRect = mapContainer.getBoundingClientRect();
      const fullsizeWidth = Math.min(420, window.innerWidth * 0.8);
      const fullsizeHeight = Math.min(620, window.innerHeight * 0.9);
      const destRect = centerRect(mapRect, { width: fullsizeWidth, height: fullsizeHeight });

      // Animate to full size with dramatic trail
      await tweenTransform(clone, startRect, destRect, { duration: 220, withTrail: true });
      
      // Add fullsize styling
      clone.classList.add('play-card-fullsize');
      clone.style.filter = 'drop-shadow(0 16px 40px rgba(0,0,0,0.5))';
      clone.style.borderWidth = '3px';

      // Highlight target state if needed
      if (options.targetState) {
        highlightState(options.targetState);
      }

      // Simulate reaction window (simplified for now)
      const countered = false; // TODO: Implement actual counter logic

      if (countered) {
        await smallShake(clone);
        await flyToPlayedPile(clone);
        clone.remove();
        highlightState(); // Remove highlight
        return { cancelled: false, countered: true };
      }

      // Resolve card effects with screen shake for zone cards
      if (options.onResolve) {
        if (card.type === 'ZONE') {
          shake({ intensity: 'medium', duration: 200 });
        }
        await options.onResolve(card);
      }

      // Fly to played pile with particle effect
      await flyToPlayedPile(clone);
      
      // Trigger particle effect at final position
      const event = new CustomEvent('cardDeployed', {
        detail: {
          x: destRect.x + destRect.width / 2,
          y: destRect.y + destRect.height / 2,
          type: 'deploy'
        }
      });
      window.dispatchEvent(event);
      clone.remove();
      highlightState(); // Remove highlight

      // Announce to screen readers
      const playedPile = document.getElementById('played-pile');
      if (playedPile) {
        playedPile.setAttribute('aria-label', `Played cards - ${card.name} was just played`);
      }

      return { cancelled: false, countered: false };

    } finally {
      animatingRef.current = false;
      if (options.onComplete) {
        options.onComplete();
      }
    }
  }, []);

  const isAnimating = () => animatingRef.current;

  return {
    animatePlayCard,
    isAnimating
  };
};