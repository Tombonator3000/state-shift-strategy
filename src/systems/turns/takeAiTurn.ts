import { chooseTurnActions } from '@/ai';
import { endTurn, playCard, type GameState } from '@/mvp';
import { getDifficulty } from '@/state/settings';

type PlayCardAction = {
  type: 'play-card';
  cardId: string;
  targetStateId?: string;
};

type EndTurnAction = {
  type: 'end-turn';
  discards?: string[];
};

type Action = PlayCardAction | EndTurnAction;

function applyAction(state: GameState, action: Action): GameState {
  if (action.type === 'play-card') {
    return playCard(state, action.cardId, action.targetStateId);
  }
  if (action.type === 'end-turn') {
    return endTurn(state, action.discards ?? []);
  }
  return state;
}

export async function takeAiTurn(state: GameState): Promise<GameState> {
  const level = getDifficulty();
  const seq = chooseTurnActions(state, level) as Action[];
  for (const action of seq) {
    state = applyAction(state, action);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return state;
}
