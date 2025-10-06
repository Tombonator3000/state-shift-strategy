import { beforeEach, describe, expect, it } from 'bun:test';
import type { GameEvent } from '@/data/eventDatabase';
import { hydrateExpansionFeatures } from '@/data/expansions/features';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import type {
  RelicIssueSnapshot,
  RelicRoundStartPayload,
  TabloidRelicRuntimeState,
} from '@/expansions/tabloidRelics/RelicTypes';

const loadRelicEngine = () => import('@/expansions/tabloidRelics/RelicEngine');

const createEvent = (id: string): GameEvent => ({
  id,
  title: `Event ${id}`,
  content: 'content',
  type: 'truth',
  rarity: 'common',
  weight: 1,
  effects: { truth: 9 },
});

const createMediaPlay = (round: number): CardPlayRecord => ({
  card: {
    id: `media-${round}`,
    name: `Media ${round}`,
    type: 'MEDIA',
    faction: 'truth',
    cost: 0,
  },
  player: 'human',
  faction: 'truth',
  targetState: null,
  truthDelta: 0,
  ipDelta: 0,
  aiIpDelta: 0,
  capturedStates: [],
  capturedStateIds: [],
  damageDealt: 0,
  round,
  turn: round,
  timestamp: Date.now(),
  logEntries: [],
});

const createSnapshot = (
  round: number,
  runtime: TabloidRelicRuntimeState | null,
): RelicIssueSnapshot => ({
  round,
  turn: round,
  truth: 40,
  ip: 10,
  aiIP: 30,
  comboTruthDelta: -6,
  faction: 'truth',
  events: [createEvent(`evt-${round}`)],
  plays: [createMediaPlay(round * 2 - 1), createMediaPlay(round * 2)],
  runtime,
  editorActive: false,
});

beforeEach(() => {
  hydrateExpansionFeatures({
    tabloidRelics: true,
    editors: false,
  });
});

describe('RelicEngine.ingestIssue rotation', () => {
  it('rotates through available relics when multiple candidates match', async () => {
    const { RelicEngine } = await loadRelicEngine();

    const first = RelicEngine.ingestIssue(createSnapshot(1, null));
    const firstQueued = first.runtime?.entries.at(-1)?.ruleId;

    const second = RelicEngine.ingestIssue(createSnapshot(2, first.runtime ?? null));
    const secondQueued = second.runtime?.entries.at(-1)?.ruleId;

    const third = RelicEngine.ingestIssue(createSnapshot(3, second.runtime ?? null));
    const thirdQueued = third.runtime?.entries.at(-1)?.ruleId;

    expect([firstQueued, secondQueued, thirdQueued]).toEqual([
      'black_budget_briefing',
      'red_string_reactor',
      'pressroom_lockdown',
    ]);
    expect(third.runtime?.selectionHistory.slice(0, 3)).toEqual([
      'pressroom_lockdown',
      'red_string_reactor',
      'black_budget_briefing',
    ]);
    expect(third.logEntries).toContain(
      'Tabloid Relic rotation (most recent first): pressroom_lockdown -> red_string_reactor -> black_budget_briefing',
    );
  });

  it('preserves selection history when relic queues empty so rotation resumes later', async () => {
    const { RelicEngine } = await loadRelicEngine();

    let result = RelicEngine.ingestIssue(createSnapshot(1, null));
    result = RelicEngine.ingestIssue(createSnapshot(2, result.runtime ?? null));
    result = RelicEngine.ingestIssue(createSnapshot(3, result.runtime ?? null));

    const firstHistory = result.runtime?.selectionHistory.slice(0, 3);
    expect(firstHistory).toEqual([
      'pressroom_lockdown',
      'red_string_reactor',
      'black_budget_briefing',
    ]);

    let roundState = RelicEngine.applyRoundStart({
      state: {
        faction: 'truth',
        truth: 10,
        ip: 0,
        aiIP: 0,
        round: 3,
        turn: 3,
        editorId: null,
        editorDef: null,
        tabloidRelicsRuntime: result.runtime ?? null,
      },
    });

    roundState = RelicEngine.applyRoundStart({
      state: {
        faction: 'truth',
        truth: roundState.truth,
        ip: roundState.ip,
        aiIP: roundState.aiIp,
        round: 4,
        turn: 4,
        editorId: null,
        editorDef: null,
        tabloidRelicsRuntime: roundState.runtime ?? null,
      },
    });

    roundState = RelicEngine.applyRoundStart({
      state: {
        faction: 'truth',
        truth: roundState.truth,
        ip: roundState.ip,
        aiIP: roundState.aiIp,
        round: 5,
        turn: 5,
        editorId: null,
        editorDef: null,
        tabloidRelicsRuntime: roundState.runtime ?? null,
      },
    });

    roundState = RelicEngine.applyRoundStart({
      state: {
        faction: 'truth',
        truth: roundState.truth,
        ip: roundState.ip,
        aiIP: roundState.aiIp,
        round: 6,
        turn: 6,
        editorId: null,
        editorDef: null,
        tabloidRelicsRuntime: roundState.runtime ?? null,
      },
    });

    expect(roundState.runtime?.entries).toHaveLength(0);
    expect(roundState.runtime?.selectionHistory.slice(0, 3)).toEqual([
      'pressroom_lockdown',
      'red_string_reactor',
      'black_budget_briefing',
    ]);

    const resumed = RelicEngine.ingestIssue(
      createSnapshot(7, roundState.runtime ?? null),
    );
    const resumedQueued = resumed.runtime?.entries.at(-1)?.ruleId;

    expect(resumedQueued).toBe('inkwell_of_intrigue');
    expect(resumed.runtime?.selectionHistory.slice(0, 4)).toEqual([
      'inkwell_of_intrigue',
      'pressroom_lockdown',
      'red_string_reactor',
      'black_budget_briefing',
    ]);
  });

  it('sanitizes malformed runtime data when applying round start', async () => {
    const { RelicEngine } = await loadRelicEngine();

    const corruptedState = {
      faction: 'truth' as const,
      truth: 45,
      ip: 12,
      aiIP: 18,
      round: 3,
      turn: 3,
      editorId: null,
      editorDef: null,
      tabloidRelicsRuntime: {
        entries: { bogus: true },
        lastIssueRound: '2',
        lastUpdatedTurn: '2',
        selectionHistory: ['pressroom_lockdown', 123, null],
      } as unknown,
    } satisfies RelicRoundStartPayload['state'];

    const result = RelicEngine.applyRoundStart({ state: corruptedState });

    expect(result.runtime).toBeNull();
    expect(result.truth).toBe(corruptedState.truth);
    expect(result.ip).toBe(corruptedState.ip);
    expect(result.aiIp).toBe(corruptedState.aiIP);
    expect(result.logEntries).toEqual([]);
  });
});
