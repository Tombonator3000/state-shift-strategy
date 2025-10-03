import { useState, useCallback } from 'react';
import { EventManager, GameEvent } from '@/data/eventDatabase';
import { toast as legacyToast } from '@/hooks/use-toast';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';
import type { GameState } from './gameStateTypes';

export interface StateEventTrigger {
  stateId: string;
  event: GameEvent;
  capturingFaction: 'truth' | 'government';
  triggeredOnTurn: number;
}

export const useStateEvents = () => {
  const [eventManager] = useState(() => new EventManager());
  const [breakingHelperWasAvailable] = useState(
    () => typeof window !== 'undefined' && typeof window.uiShowBreakingHeadline === 'function'
  );

  const triggerStateEvent = useCallback((
    stateId: string,
    capturingFaction: 'truth' | 'government',
    gameState: Pick<GameState, 'states' | 'turn'>,
    statePosition?: { x: number; y: number }
  ) => {
    const event = eventManager.selectStateEvent(stateId, capturingFaction, gameState);

    if (!event) return null;

    // Get state name for display
    const stateName = gameState.states?.find((s: any) => s.id === stateId)?.name || stateId;
    
    const showBreakingHeadline = typeof window !== 'undefined' ? window.uiShowBreakingHeadline : undefined;

    if (showBreakingHeadline) {
      showBreakingHeadline({
        type: 'headline',
        title: `🗞️ BREAKING: ${event.title}`,
        body: `${stateName}: ${event.content}`,
        duration: 6000,
      });
    } else if (!breakingHelperWasAvailable) {
      legacyToast({
        title: `🗞️ BREAKING: ${event.title}`,
        description: `${stateName}: ${event.content}`,
        duration: 6000,
      });
    }

    // Trigger visual effects if position is available
    if (statePosition) {
      VisualEffectsCoordinator.triggerStateEvent(event.type, stateId, statePosition);
    }

    return {
      stateId,
      event,
      capturingFaction,
      triggeredOnTurn: typeof gameState.turn === 'number' ? Math.max(1, gameState.turn) : 1,
    } satisfies StateEventTrigger;
  }, [breakingHelperWasAvailable, eventManager]);

  const triggerContestedStateEffects = useCallback((
    stateId: string,
    statePosition?: { x: number; y: number }
  ) => {
    if (statePosition) {
      VisualEffectsCoordinator.triggerContestedState(statePosition);
    }
  }, []);

  const updateEventManagerTurn = useCallback((turn: number) => {
    eventManager.updateTurn(turn);
  }, [eventManager]);

  const resetStateEvents = useCallback(() => {
    eventManager.reset();
  }, [eventManager]);

  return {
    triggerStateEvent,
    triggerContestedStateEffects,
    updateEventManagerTurn,
    resetStateEvents,
    eventManager
  };
};
