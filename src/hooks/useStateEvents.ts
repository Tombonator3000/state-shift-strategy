import { useState, useCallback } from 'react';
import { EventManager, GameEvent } from '@/data/eventDatabase';
import { useToast } from '@/hooks/use-toast';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';

export interface StateEventTrigger {
  stateId: string;
  event: GameEvent;
  capturingFaction: string;
}

export const useStateEvents = () => {
  const [eventManager] = useState(() => new EventManager());
  const { toast } = useToast();

  const triggerStateEvent = useCallback((
    stateId: string, 
    capturingFaction: string, 
    gameState: any,
    statePosition?: { x: number; y: number }
  ) => {
    const event = eventManager.selectStateEvent(stateId, capturingFaction, gameState);
    
    if (!event) return null;

    // Get state name for display
    const stateName = gameState.states?.find((s: any) => s.id === stateId)?.name || stateId;
    
    // Show toast notification with wacky tabloid style
    toast({
      title: `🗞️ BREAKING: ${event.title}`,
      description: `${stateName}: ${event.content}`,
      duration: 6000,
    });

    // Trigger visual effects if position is available
    if (statePosition) {
      VisualEffectsCoordinator.triggerStateEvent(event.type, stateId, statePosition);
      VisualEffectsCoordinator.triggerParticleEffect('stateevent', statePosition);
    }

    return {
      stateId,
      event,
      capturingFaction
    } as StateEventTrigger;
  }, [eventManager, toast]);

  const triggerContestedStateEffects = useCallback((
    stateId: string,
    statePosition?: { x: number; y: number }
  ) => {
    if (statePosition) {
      VisualEffectsCoordinator.triggerContestedState(statePosition);
      VisualEffectsCoordinator.triggerParticleEffect('contested', statePosition);
    }
  }, []);

  const updateEventManagerTurn = useCallback((turn: number) => {
    eventManager.updateTurn(turn);
  }, [eventManager]);

  return {
    triggerStateEvent,
    triggerContestedStateEffects,
    updateEventManagerTurn,
    eventManager
  };
};