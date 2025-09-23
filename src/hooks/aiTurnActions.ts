import type { GameCard } from '@/rules/mvp';
import type { GameState } from './gameStateTypes';
import type { AiCardPlayParams } from './aiHelpers';

export interface ProcessAiActionsOptions {
  actions: Array<{
    cardId: string;
    card?: GameCard;
    targetState?: string;
    reasoning?: string;
    strategyDetails?: string[];
  }>;
  sequenceDetails: string[];
  readLatestState: () => Promise<GameState>;
  playCard: (params: AiCardPlayParams) => Promise<GameState>;
  waitBetweenActions: () => Promise<void>;
}

export const processAiActions = async ({
  actions,
  sequenceDetails,
  readLatestState,
  playCard,
  waitBetweenActions,
}: ProcessAiActionsOptions): Promise<{ gameOver: boolean }> => {
  for (let index = 0; index < actions.length; index++) {
    const latestBeforeAction = await readLatestState();
    if (latestBeforeAction.isGameOver) {
      return { gameOver: true };
    }

    const action = actions[index];
    const detailEntries = [
      ...(index === 0 ? sequenceDetails : []),
      ...(action.strategyDetails ?? []),
    ];

    const stateAfterPlay = await playCard({
      cardId: action.cardId,
      card: action.card,
      targetState: action.targetState,
      reasoning: action.reasoning,
      strategyDetails: detailEntries.length ? detailEntries : undefined,
    });

    if (stateAfterPlay.isGameOver) {
      return { gameOver: true };
    }

    const latestAfterAction = await readLatestState();
    if (latestAfterAction.isGameOver) {
      return { gameOver: true };
    }

    if (index < actions.length - 1) {
      await waitBetweenActions();
    }
  }

  return { gameOver: false };
};
