import { describe, expect, it } from 'bun:test';

import { evaluateCombosForTurn } from '@/hooks/comboAdapter';
import type { GameState } from '@/hooks/gameStateTypes';
import type { AIDifficulty } from '@/data/aiStrategy';
import { createDefaultCombinationEffects, STATE_COMBINATIONS, aggregateStateCombinationEffects, calculateDynamicIpBonus, applyStateCombinationCostModifiers } from '@/data/stateCombinations';
import type { TurnPlay } from '@/game/combo.types';

const buildBaseGameState = (): GameState => ({
  faction: 'truth',
  phase: 'action',
  turn: 1,
  round: 1,
  currentPlayer: 'human',
  aiDifficulty: 'easy' as AIDifficulty,
  aiPersonality: undefined,
  truth: 50,
  ip: 10,
  aiIP: 10,
  hand: [],
  aiHand: [],
  isGameOver: false,
  deck: [],
  aiDeck: [],
  cardsPlayedThisTurn: 3,
  cardsPlayedThisRound: [],
  playHistory: [],
  turnPlays: [],
  comboTruthDeltaThisRound: 0,
  stateCombinationBonusIP: 0,
  activeStateCombinationIds: [],
  stateCombinationEffects: createDefaultCombinationEffects(),
  controlledStates: [],
  aiControlledStates: [],
  states: [],
  currentEvents: [],
  eventManager: undefined,
  showNewspaper: false,
  log: [],
  agenda: undefined,
  secretAgenda: undefined,
  aiSecretAgenda: undefined,
  animating: false,
  aiTurnInProgress: false,
  selectedCard: null,
  targetState: null,
  aiStrategist: undefined,
  pendingCardDraw: 0,
  newCards: [],
  showNewCardsPresentation: false,
  drawMode: 'standard',
  cardDrawState: { cardsPlayedLastTurn: 0, lastTurnWithoutPlay: false },
});

const makeTurnPlay = (index: number, cardType: TurnPlay['cardType'], cost: number): TurnPlay => ({
  sequence: index,
  stage: 'resolve',
  owner: 'P1',
  cardId: `card-${index}`,
  cardName: `${cardType}-${index}`,
  cardType,
  cardRarity: 'common',
  cost,
});

describe('combo and state synergy integration', () => {
  it('awards combo IP bonuses to the active player', () => {
    const state = buildBaseGameState();
    state.turnPlays = [
      makeTurnPlay(0, 'ATTACK', 3),
      makeTurnPlay(1, 'ATTACK', 3),
      makeTurnPlay(2, 'ATTACK', 3),
    ];

    const result = evaluateCombosForTurn(state, 'human');

    const comboIds = result.evaluation.results.map(entry => entry.definition.id);
    expect(comboIds).toContain('sequence_attack_blitz');
    expect(comboIds).toContain('count_attack_barrage');
    expect(result.evaluation.totalReward.ip).toBe(4);

    const blitzResult = result.evaluation.results.find(
      entry => entry.definition.id === 'sequence_attack_blitz',
    );
    expect(blitzResult?.appliedReward.nextAttackMultiplier).toBe(2);
    expect(result.updatedPlayerIp).toBe(state.ip + (result.evaluation.totalReward.ip ?? 0));
  });

  it('aggregates state combination effects for income, card draw, and cost modifiers', () => {
    const combos = STATE_COMBINATIONS.filter(combo =>
      ['silicon_valley_network', 'intel_web', 'oil_cartel', 'southern_border'].includes(combo.id),
    );

    const effects = aggregateStateCombinationEffects(combos);

    expect(effects.mediaCostModifier).toBe(-1);
    expect(effects.extraCardDraw).toBe(1);
    expect(effects.ipPerStateBonus).toBe(1);
    expect(effects.ipPerNeutralStateBonus).toBe(1);

    const dynamicBonus = calculateDynamicIpBonus(effects, 4, 10);
    expect(dynamicBonus).toBe(14);

    const reducedCost = applyStateCombinationCostModifiers(3, 'MEDIA', 'human', effects);
    expect(reducedCost).toBe(2);
  });
});
