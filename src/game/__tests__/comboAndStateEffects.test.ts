import { beforeEach, describe, expect, it } from 'bun:test';
import type { GameState } from '@/hooks/gameStateTypes';
import type { AIDifficulty } from '@/data/aiStrategy';
import { createDefaultCombinationEffects, STATE_COMBINATIONS, aggregateStateCombinationEffects, calculateDynamicIpBonus, applyStateCombinationCostModifiers, applyDefenseBonusToStates } from '@/data/stateCombinations';
import type { TurnPlay } from '@/game/combo.types';
import { resolveCardMVP } from '@/systems/cardResolution';
import type { GameCard } from '@/rules/mvp';
import { applyComboRewards, evaluateCombos, setComboSettings } from '@/game/comboEngine';
import { DEFAULT_COMBO_SETTINGS } from '@/game/combo.config';
import type { GameState as EngineGameState, PlayerId, PlayerState as EnginePlayerState } from '@/mvp/validator';

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
  truthAbove80Streak: 0,
  truthBelow20Streak: 0,
  timeBasedGoalCounters: { truthAbove80Streak: 0, truthBelow20Streak: 0 },
  paranormalHotspots: {},
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
  beforeEach(() => {
    setComboSettings({
      ...DEFAULT_COMBO_SETTINGS,
      comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
    });
  });

  it('awards combo IP bonuses to the active player', () => {
    const state = buildBaseGameState();
    state.turnPlays = [
      makeTurnPlay(0, 'ATTACK', 3),
      makeTurnPlay(1, 'ATTACK', 3),
      makeTurnPlay(2, 'ATTACK', 3),
    ];

    const engineState: EngineGameState = {
      turn: state.turn,
      currentPlayer: 'P1',
      truth: state.truth,
      players: {
        P1: {
          id: 'P1',
          faction: state.faction,
          deck: [],
          hand: [],
          discard: [],
          ip: state.ip,
          states: [],
        } satisfies EnginePlayerState,
        P2: {
          id: 'P2',
          faction: state.faction === 'truth' ? 'government' : 'truth',
          deck: [],
          hand: [],
          discard: [],
          ip: state.aiIP,
          states: [],
        } satisfies EnginePlayerState,
      },
      pressureByState: {},
      stateDefense: {},
      playsThisTurn: state.turnPlays.length,
      turnPlays: state.turnPlays.map(play => ({ ...play })),
      log: [],
    } satisfies EngineGameState;

    const player: PlayerId = 'P1';
    const evaluation = evaluateCombos(engineState, player);
    applyComboRewards(engineState, player, evaluation);

    const comboIds = evaluation.results.map(entry => entry.definition.id);
    expect(comboIds).toContain('sequence_attack_blitz');
    expect(comboIds).toContain('count_attack_barrage');
    expect(evaluation.totalReward.ip).toBe(4);

    const blitzResult = evaluation.results.find(
      entry => entry.definition.id === 'sequence_attack_blitz',
    );
    expect(blitzResult?.appliedReward.nextAttackMultiplier).toBe(2);
    expect(engineState.players[player].ip).toBe(state.ip + (evaluation.totalReward.ip ?? 0));
  });

  it('aggregates state combination effects for income, card draw, and cost modifiers', () => {
    const combos = STATE_COMBINATIONS.filter(combo =>
      [
        'silicon_valley_network',
        'intel_web',
        'oil_cartel',
        'southern_border',
        'wall_street_empire',
        'military_triangle',
        'nuclear_triad',
        'midwest_backbone',
      ].includes(combo.id),
    );

    const effects = aggregateStateCombinationEffects(combos);

    expect(effects.mediaCostModifier).toBe(-1);
    expect(effects.extraCardDraw).toBe(1);
    expect(effects.ipPerStateBonus).toBe(1);
    expect(effects.ipPerNeutralStateBonus).toBe(1);
    expect(effects.flatTurnIpBonus).toBe(2);
    expect(effects.attackIpBonus).toBe(1);
    expect(effects.stateDefenseBonus).toBe(1);
    expect(effects.incomingPressureReduction).toBe(1);
    expect(effects.truthSwingMultiplier).toBe(1);

    const dynamicBonus = calculateDynamicIpBonus(effects, 4, 10);
    expect(dynamicBonus).toBe(16);

    const reducedCost = applyStateCombinationCostModifiers(3, 'MEDIA', 'human', effects);
    expect(reducedCost).toBe(2);
  });

  it('applies a truth swing multiplier when Academic Elite is active', () => {
    const combo = STATE_COMBINATIONS.find(entry => entry.id === 'academic_elite');
    expect(combo).toBeTruthy();

    const effects = aggregateStateCombinationEffects(combo ? [combo] : []);
    expect(effects.truthSwingMultiplier).toBeGreaterThan(1);
  });

  it('applies defense modifiers only to player-held states', () => {
    const states = [
      { defense: 3, owner: 'player' as const, comboDefenseBonus: 0 },
      { defense: 4, owner: 'ai' as const, comboDefenseBonus: 1 },
    ];

    const buffed = applyDefenseBonusToStates(states, 2);

    expect(buffed[0].defense).toBe(5);
    expect(buffed[0].comboDefenseBonus).toBe(2);
    expect(buffed[1].defense).toBe(3);
    expect(buffed[1].comboDefenseBonus).toBe(0);
  });

  it('boosts attack card damage when combinations grant bonuses', () => {
    const state = buildBaseGameState();
    state.stateCombinationEffects = { ...createDefaultCombinationEffects(), attackIpBonus: 2 };
    state.states = [];

    const card: GameCard = {
      id: 'attack-bonus',
      name: 'Precision Strike',
      type: 'ATTACK',
      faction: 'truth',
      cost: 2,
      effects: { ipDelta: { opponent: 3 } },
    };

    const result = resolveCardMVP(state, card, null, 'human');
    expect(result.aiIP).toBe(state.aiIP - 5);
    expect(result.damageDealt).toBe(5);
  });

  it('reduces incoming pressure when the AI targets fortified states', () => {
    const state = buildBaseGameState();
    state.stateCombinationEffects = { ...createDefaultCombinationEffects(), incomingPressureReduction: 1 };
    state.controlledStates = ['NV'];
    state.states = [{
      id: '32',
      name: 'Nevada',
      abbreviation: 'NV',
      baseIP: 2,
      baseDefense: 2,
      defense: 2,
      comboDefenseBonus: 0,
      pressure: 0,
      pressurePlayer: 0,
      pressureAi: 0,
      contested: false,
      owner: 'player' as const,
      specialBonus: undefined,
      bonusValue: undefined,
      paranormalHotspot: undefined,
    }];

    const zoneCard: GameCard = {
      id: 'zone-pressure',
      name: 'Siege Column',
      type: 'ZONE',
      faction: 'government',
      cost: 3,
      effects: { pressureDelta: 2 },
      target: { scope: 'state', count: 1 },
    };

    const result = resolveCardMVP(state, zoneCard, 'NV', 'ai');
    const target = result.states.find(entry => entry.abbreviation === 'NV');
    expect(target?.pressureAi).toBe(1);
    expect(target?.pressure).toBe(1);
  });

  it('normalizes zone card targets before applying pressure', () => {
    const state = buildBaseGameState();
    state.stateCombinationEffects = { ...createDefaultCombinationEffects(), incomingPressureReduction: 1 };
    state.controlledStates = ['NV'];
    state.states = [{
      id: '32',
      name: 'Nevada',
      abbreviation: 'NV',
      baseIP: 2,
      baseDefense: 2,
      defense: 2,
      comboDefenseBonus: 0,
      pressure: 0,
      pressurePlayer: 0,
      pressureAi: 0,
      contested: false,
      owner: 'player' as const,
      specialBonus: undefined,
      bonusValue: undefined,
      paranormalHotspot: undefined,
    }];

    const zoneCard: GameCard = {
      id: 'zone-pressure',
      name: 'Siege Column',
      type: 'ZONE',
      faction: 'government',
      cost: 3,
      effects: { pressureDelta: 2 },
      target: { scope: 'state', count: 1 },
    };

    const result = resolveCardMVP(state, zoneCard, 'nv', 'ai');
    const target = result.states.find(entry => entry.abbreviation === 'NV');
    expect(target?.pressureAi).toBe(1);
    expect(target?.pressure).toBe(1);
  });

  it('reapplies defense bonuses to controlled states after card resolution', () => {
    const state = buildBaseGameState();
    state.stateCombinationEffects = { ...createDefaultCombinationEffects(), stateDefenseBonus: 1 };
    state.controlledStates = ['CA'];
    state.states = [{
      id: '06',
      name: 'California',
      abbreviation: 'CA',
      baseIP: 4,
      baseDefense: 4,
      defense: 4,
      comboDefenseBonus: 0,
      pressure: 0,
      pressurePlayer: 0,
      pressureAi: 0,
      contested: false,
      owner: 'player' as const,
      specialBonus: undefined,
      bonusValue: undefined,
      paranormalHotspot: undefined,
    }];

    const mediaCard: GameCard = {
      id: 'media-broadcast',
      name: 'Breaking Bulletin',
      type: 'MEDIA',
      faction: 'truth',
      cost: 3,
      effects: { truthDelta: 5 },
    };

    const result = resolveCardMVP(state, mediaCard, null, 'human');
    const california = result.states.find(entry => entry.abbreviation === 'CA');
    expect(california?.defense).toBe(5);
    expect(california?.comboDefenseBonus).toBe(1);
  });

  it('boosts media truth swings when Academic Elite is active', () => {
    const state = buildBaseGameState();
    state.truth = 40;
    state.stateCombinationEffects = {
      ...createDefaultCombinationEffects(),
      truthSwingMultiplier: 1.5,
    };

    const mediaCard: GameCard = {
      id: 'media-broadcast',
      name: 'Academic Spotlight',
      type: 'MEDIA',
      faction: 'truth',
      cost: 3,
      effects: { truthDelta: 4 },
    };

    const result = resolveCardMVP(state, mediaCard, null, 'human');
    expect(result.truth).toBe(46);
    expect(result.logEntries.some(entry => entry.includes('Academic Elite'))).toBe(true);
  });

  it('allows discounted media cards to match available IP', () => {
    const effects = {
      ...createDefaultCombinationEffects(),
      mediaCostModifier: -2,
    };

    const baseCost = 5;
    const discountedCost = applyStateCombinationCostModifiers(baseCost, 'MEDIA', 'human', effects);
    const availableIp = 3;

    expect(discountedCost).toBe(3);
    expect(availableIp).toBeLessThan(baseCost);
    expect(availableIp).toBeGreaterThanOrEqual(discountedCost);
  });

  it('still blocks cards when combination effects raise the cost', () => {
    const effects = {
      ...createDefaultCombinationEffects(),
      mediaCostModifier: 2,
    };

    const baseCost = 4;
    const increasedCost = applyStateCombinationCostModifiers(baseCost, 'MEDIA', 'human', effects);
    const availableIp = 5;

    expect(increasedCost).toBe(6);
    expect(availableIp).toBeGreaterThan(baseCost);
    expect(availableIp).toBeLessThan(increasedCost);
  });
});
