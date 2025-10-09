export interface GameStateContext {
  statesControlled: number;
  totalStates: number;
  truthPercentage: number;
  ipRemaining: number;
  turnNumber: number;
  capturedThisTurn: string[];
  playerFaction: 'truth' | 'government';
  cardsPlayedCount: number;
  currentScore: number;
}

export function substituteArticleVariables(
  template: string,
  context: GameStateContext,
): string {
  return template
    .replace(/{STATES_CONTROLLED}/g, `${context.statesControlled} states`)
    .replace(/{TOTAL_STATES}/g, `${context.totalStates}`)
    .replace(/{TRUTH_PERCENTAGE}/g, `${context.truthPercentage}%`)
    .replace(/{IP_REMAINING}/g, `${context.ipRemaining} IP`)
    .replace(/{TURN_NUMBER}/g, `Round ${context.turnNumber}`)
    .replace(/{CAPTURED_THIS_TURN}/g, context.capturedThisTurn.join(', '))
    .replace(
      /{PLAYER_FACTION}/g,
      context.playerFaction === 'truth' ? 'Truth Network' : 'Government Machine',
    )
    .replace(
      /{OPPONENT_FACTION}/g,
      context.playerFaction === 'truth' ? 'Government Machine' : 'Truth Network',
    )
    .replace(/{CARDS_PLAYED_COUNT}/g, `${context.cardsPlayedCount}`)
    .replace(/{CURRENT_SCORE}/g, `${context.currentScore} truth points`);
}
