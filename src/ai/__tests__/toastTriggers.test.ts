import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

import { applyTruthDelta } from '@/utils/truth';
import type { GameState } from '@/mvp/validator';

type WindowWithToasts = typeof window & {
  uiToastTruth?: (delta: number) => void;
  uiComboToast?: (message: string) => void;
};

type FnMock<Args extends unknown[], Return> = ((...args: Args) => Return) & {
  calls: Args[];
  reset: () => void;
};

const createFnMock = <Args extends unknown[], Return>(
  impl: (...args: Args) => Return,
): FnMock<Args, Return> => {
  const fn = ((...args: Args): Return => {
    fn.calls.push(args);
    return impl(...args);
  }) as FnMock<Args, Return>;
  fn.calls = [] as Args[];
  fn.reset = () => {
    fn.calls.length = 0;
  };
  return fn;
};

const truthToastMock = createFnMock((delta: number) => {
  void delta;
});
const comboToastMock = createFnMock((message: string) => {
  void message;
});

let originalWindow: WindowWithToasts | undefined;

beforeEach(() => {
  originalWindow = globalThis.window as WindowWithToasts | undefined;
  const nextWindow: WindowWithToasts = {
    ...(originalWindow ?? ({} as WindowWithToasts)),
    uiToastTruth: truthToastMock,
    uiComboToast: comboToastMock,
  };
  globalThis.window = nextWindow as unknown as Window;
  truthToastMock.reset();
  comboToastMock.reset();
});

afterEach(() => {
  if (originalWindow) {
    globalThis.window = originalWindow as unknown as Window;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
  }
});

describe('truth and combo toast triggers', () => {
  it('emits a truth toast when crossing the victory threshold', () => {
    const state = { truth: 94, log: [] as string[] };
    const updated = applyTruthDelta(state, 7, 'human');

    expect(updated.truth).toBe(100);
    expect(truthToastMock.calls.length).toBe(1);
    expect(truthToastMock.calls[0][0]).toBe(6);
    expect(state.log[state.log.length - 1]).toContain('Truth manipulation ↑ (94% → 100%)');
  });

  it('emits combo toast payloads when combo FX are enabled', async () => {
    const formatComboRewardMock = createFnMock(() => '(+5 IP)');
    const evaluateCombosMock = createFnMock(() => ({
      results: [
        {
          definition: {
            id: 'threshold_high_cost_2',
            name: 'High Roller',
            description: 'Play two high-cost cards.',
            category: 'threshold',
            priority: 90,
            trigger: { kind: 'threshold', metric: 'highCostCount', value: 2 },
            reward: { ip: 5 },
            fxText: 'High rollers crash the market.',
          },
          reward: { ip: 5 },
          appliedReward: { ip: 5 },
          details: { matchedPlays: [] },
        },
      ],
      totalReward: { ip: 5 },
      logs: ['High Roller activated'],
    }));
    const applyComboRewardsMock = createFnMock((state: GameState) => state);
    const getComboSettingsMock = createFnMock(() => ({
      enabled: true,
      fxEnabled: true,
      comboToggles: {},
      maxCombosPerTurn: 0,
    }));

    mock.module('@/game/comboEngine', () => ({
      evaluateCombos: evaluateCombosMock,
      applyComboRewards: applyComboRewardsMock,
      getComboSettings: getComboSettingsMock,
      formatComboReward: formatComboRewardMock,
    }));

    const { endTurn } = await import('@/mvp/engine');

    const baseState: GameState = {
      turn: 1,
      currentPlayer: 'P1',
      truth: 50,
      players: {
        P1: {
          id: 'P1',
          faction: 'truth',
          deck: [],
          hand: [],
          discard: [],
          ip: 12,
          states: [],
        },
        P2: {
          id: 'P2',
          faction: 'government',
          deck: [],
          hand: [],
          discard: [],
          ip: 12,
          states: [],
        },
      },
      pressureByState: {},
      stateDefense: {},
      playsThisTurn: 0,
      turnPlays: [],
      log: [],
      headlineLog: [],
      extraExtraFeed: [],
      turnBuffer: [],
      winner: null,
      victoryType: null,
      finalEdition: null,
      tabloidRelicsRuntime: null,
    };

    endTurn(baseState, []);

    expect(comboToastMock.calls.length).toBe(1);
    expect(comboToastMock.calls[0][0]).toBe('High Roller (+5 IP)');
    expect(evaluateCombosMock.calls.length).toBeGreaterThan(0);
  });
});
