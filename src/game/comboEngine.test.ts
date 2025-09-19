import { beforeEach, describe, expect, it } from 'bun:test';
import type { GameState, PlayerId, PlayerState } from '@/mvp/validator';
import type { ComboEvaluation, TurnPlay } from './combo.types';
import { applyComboRewards, evaluateCombos, getComboRng, setComboSettings } from './comboEngine';
import { COMBO_DEFINITIONS, DEFAULT_COMBO_SETTINGS } from './combo.config';

type MutableGameState = GameState & { players: Record<PlayerId, PlayerState> };

const basePlayer = (id: PlayerId): PlayerState => ({
  id,
  faction: id === 'P1' ? 'truth' : 'government',
  deck: [],
  hand: [],
  discard: [],
  ip: 10,
  states: [],
});

const createState = (
  plays: TurnPlay[],
  overrides: Partial<GameState> = {},
  playerOverrides: Partial<Record<PlayerId, Partial<PlayerState>>> = {},
): MutableGameState => {
  const players: Record<PlayerId, PlayerState> = {
    P1: { ...basePlayer('P1'), ...(playerOverrides.P1 ?? {}) },
    P2: { ...basePlayer('P2'), ...(playerOverrides.P2 ?? {}) },
  } as Record<PlayerId, PlayerState>;

  return {
    turn: 3,
    currentPlayer: 'P1',
    truth: 50,
    players,
    pressureByState: {},
    stateDefense: {},
    playsThisTurn: plays.length,
    turnPlays: plays,
    log: [],
    ...overrides,
    players: {
      P1: players.P1,
      P2: players.P2,
      ...((overrides.players as Record<PlayerId, PlayerState> | undefined) ?? {}),
    },
  } as MutableGameState;
};

let sequence = 0;
const makePlay = (
  partial: Partial<TurnPlay> & { cardType: TurnPlay['cardType']; cost: number },
): TurnPlay => {
  sequence += 1;
  return {
    sequence,
    stage: 'resolve',
    owner: partial.owner ?? 'P1',
    cardId: `card-${sequence}`,
    cardName: partial.cardType,
    cardType: partial.cardType,
    cardRarity: partial.cardRarity ?? 'common',
    cost: partial.cost,
    targetStateId: partial.targetStateId,
    metadata: partial.metadata,
  } satisfies TurnPlay;
};

const enableOnly = (ids: string[], extra?: Parameters<typeof evaluateCombos>[2]): Parameters<typeof evaluateCombos>[2] => {
  const toggles = Object.fromEntries(COMBO_DEFINITIONS.map(def => [def.id, ids.includes(def.id)]));
  return {
    enabled: true,
    fxEnabled: false,
    maxCombosPerTurn: DEFAULT_COMBO_SETTINGS.maxCombosPerTurn,
    comboToggles: toggles,
    ...extra,
  };
};

beforeEach(() => {
  sequence = 0;
  setComboSettings({
    ...DEFAULT_COMBO_SETTINGS,
    comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
  });
});

describe('comboEngine.evaluateCombos', () => {
  it('identifies sequence combos using resolved plays order', () => {
    const plays: TurnPlay[] = [
      makePlay({ cardType: 'MEDIA', cost: 2 }),
      makePlay({ cardType: 'MEDIA', cost: 3 }),
      makePlay({ cardType: 'MEDIA', cost: 1 }),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['sequence_media_wave']));

    expect(evaluation.results).toHaveLength(1);
    expect(evaluation.results[0].definition.id).toBe('sequence_media_wave');
    expect(evaluation.results[0].details.matchedPlays.map(play => play.cardType)).toEqual([
      'MEDIA',
      'MEDIA',
      'MEDIA',
    ]);
    expect(evaluation.totalReward.truth).toBe(4);
    expect(evaluation.logs).toEqual(['Media Wave (±4 Truth)']);
  });

  it('triggers count combos based on total plays regardless of type', () => {
    const plays: TurnPlay[] = [
      makePlay({ cardType: 'ATTACK', cost: 3 }),
      makePlay({ cardType: 'MEDIA', cost: 2 }),
      makePlay({ cardType: 'ZONE', cost: 3, targetStateId: 'CA' }),
      makePlay({ cardType: 'ATTACK', cost: 2 }),
      makePlay({ cardType: 'MEDIA', cost: 1 }),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['count_relentless']));

    expect(evaluation.results).toHaveLength(1);
    expect(evaluation.results[0].definition.id).toBe('count_relentless');
    expect(evaluation.totalReward.ip).toBe(3);
  });

  it('detects state-targeted combos when the same state is hit repeatedly', () => {
    const plays: TurnPlay[] = [
      makePlay({ cardType: 'ZONE', cost: 3, targetStateId: 'CA' }),
      makePlay({ cardType: 'ZONE', cost: 2, targetStateId: 'CA' }),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['state_double_down']));

    expect(evaluation.results).toHaveLength(1);
    expect(evaluation.results[0].definition.id).toBe('state_double_down');
    expect(evaluation.results[0].details.matchedPlays).toHaveLength(2);
    expect(evaluation.results[0].details.extra).toEqual({ state: 'CA' });
  });

  it('measures threshold metrics such as total IP spent', () => {
    const plays: TurnPlay[] = [
      makePlay({ cardType: 'ATTACK', cost: 5 }),
      makePlay({ cardType: 'MEDIA', cost: 4 }),
      makePlay({ cardType: 'ZONE', cost: 3, targetStateId: 'NY' }),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['threshold_total_spend_12']));

    expect(evaluation.results).toHaveLength(1);
    expect(evaluation.results[0].definition.id).toBe('threshold_total_spend_12');
    expect(evaluation.results[0].details.extra).toEqual({ value: 12 });
    expect(evaluation.totalReward.ip).toBe(4);
  });

  it('respects priority and caps rewards when max combos per turn is limited', () => {
    const plays: TurnPlay[] = [
      makePlay({ cardType: 'ATTACK', cost: 4 }),
      makePlay({ cardType: 'ATTACK', cost: 4 }),
      makePlay({ cardType: 'ATTACK', cost: 4 }),
    ];
    const state = createState(plays, {}, { P1: { ip: 10 } });

    const evaluation = evaluateCombos(
      state,
      'P1',
      enableOnly(['sequence_attack_blitz', 'count_attack_barrage'], { maxCombosPerTurn: 1 }),
    );

    expect(evaluation.results).toHaveLength(1);
    expect(evaluation.results[0].definition.id).toBe('sequence_attack_blitz');
    expect(evaluation.totalReward.ip).toBe(4);
    expect(evaluation.logs).toEqual(['Attack Blitz (+4 IP)']);

    const updated = applyComboRewards(state, 'P1', evaluation);
    expect(updated.players.P1.ip).toBe(14);
    expect(updated.log).toContain('+IP from attack blitz');
  });

  it('does not trigger state combos when zone plays lack targets', () => {
    const plays: TurnPlay[] = [
      makePlay({ cardType: 'ZONE', cost: 3 }),
      makePlay({ cardType: 'ZONE', cost: 4 }),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['state_capital_strike', 'state_double_down']));

    expect(evaluation.results).toHaveLength(0);
    expect(evaluation.totalReward).toEqual({});
  });

  it('tracks the provided rng for reuse across combo processing', () => {
    const plays: TurnPlay[] = [makePlay({ cardType: 'MEDIA', cost: 2 })];
    const state = createState(plays);
    const seededRng = () => 0.5;

    evaluateCombos(state, 'P1', enableOnly(['count_media_campaign'], { rng: seededRng }));

    expect(getComboRng()).toBe(seededRng);
  });
});

describe('comboEngine.applyComboRewards', () => {
  it('applies truth combo rewards as negative for government faction', () => {
    const plays: TurnPlay[] = [
      makePlay({ owner: 'P2', cardType: 'MEDIA', cost: 2 }),
      makePlay({ owner: 'P2', cardType: 'MEDIA', cost: 3 }),
      makePlay({ owner: 'P2', cardType: 'MEDIA', cost: 1 }),
    ];
    const state = createState(plays, { currentPlayer: 'P2' });

    const evaluation = evaluateCombos(state, 'P2', enableOnly(['sequence_media_wave']));

    expect(evaluation.totalReward.truth).toBe(4);

    const updated = applyComboRewards(state, 'P2', evaluation);

    expect(updated.truth).toBe(46);
    expect(updated.log).toContain('Truth manipulation ↓ (50% → 46%)');
  });

  it('propagates negative truth rewards based on faction alignment', () => {
    const penaltyDefinition = {
      ...COMBO_DEFINITIONS.find(def => def.id === 'sequence_media_wave')!,
      reward: { truth: -3, log: 'Truth penalty event' },
    };

    const penaltyEvaluation = {
      results: [
        {
          definition: penaltyDefinition,
          reward: penaltyDefinition.reward,
          appliedReward: penaltyDefinition.reward,
          details: { matchedPlays: [] },
        },
      ],
      totalReward: { truth: -3 },
      logs: [],
    } satisfies ComboEvaluation;

    const truthState = createState([]);
    const truthUpdated = applyComboRewards(truthState, 'P1', penaltyEvaluation);

    expect(truthUpdated.truth).toBe(47);
    expect(truthUpdated.log).toContain('Truth manipulation ↓ (50% → 47%)');
    expect(truthUpdated.log).toContain('Truth penalty event');

    const governmentState = createState([], { currentPlayer: 'P2' });
    const governmentUpdated = applyComboRewards(governmentState, 'P2', penaltyEvaluation);

    expect(governmentUpdated.truth).toBe(53);
    expect(governmentUpdated.log).toContain('Truth manipulation ↑ (50% → 53%)');
    expect(governmentUpdated.log).toContain('Truth penalty event');
  });
});
