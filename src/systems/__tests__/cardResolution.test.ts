import { describe, expect, it } from 'bun:test';
import type { GameCard } from '@/rules/mvp';
import { expectedCost } from '@/rules/mvp';
import type { PlayerStats } from '@/data/achievementSystem';
import {
  resolveCardMVP,
  type AchievementTracker,
  type CardActor,
  type GameSnapshot,
} from '../cardResolution';

const createBaseSnapshot = (overrides: Partial<GameSnapshot> = {}): GameSnapshot => ({
  truth: 60,
  ip: 12,
  aiIP: 20,
  hand: [],
  aiHand: [],
  controlledStates: [],
  aiControlledStates: [],
  round: 1,
  turn: 1,
  faction: 'truth',
  targetState: null,
  states: [
    {
      id: 'CA',
      name: 'California',
      abbreviation: 'CA',
      baseIP: 5,
      defense: 2,
      pressure: 0,
      contested: false,
      owner: 'neutral',
    },
  ],
  ...overrides,
});

const createTracker = (initial?: Partial<PlayerStats>): AchievementTracker & { updates: Array<Partial<PlayerStats>> } => {
  const updates: Array<Partial<PlayerStats>> = [];
  return {
    updates,
    stats: {
      total_states_controlled: 0,
      max_states_controlled_single_game: 0,
      max_ip_reached: 0,
      max_truth_reached: 60,
      min_truth_reached: 60,
      ...initial,
    },
    updateStats: update => {
      updates.push(update);
    },
  };
};

describe('resolveCardMVP', () => {
  const actor: CardActor = 'human';

  it('applies attack effects, IP costs, and achievement updates', () => {
    const gameState = createBaseSnapshot();
    const tracker = createTracker();
    const card: GameCard = {
      id: 'attack-direct',
      name: 'Coordinated Strike',
      type: 'ATTACK',
      faction: 'truth',
      rarity: 'common',
      cost: expectedCost('ATTACK', 'common'),
      effects: { ipDelta: { opponent: 4 } },
    };

    const result = resolveCardMVP(gameState, card, null, actor, tracker);

    expect(result.aiIP).toBe(16);
    expect(result.ip).toBe(10);
    expect(result.damageDealt).toBe(4);
    expect(result.logEntries[0]).toContain('Coordinated Strike');
    expect(result.logEntries[0]).toContain('Opponent loses 4 IP');
    expect(tracker.updates).toHaveLength(1);
    expect(tracker.updates[0]).toMatchObject({
      max_ip_reached: 10,
      max_truth_reached: 60,
      min_truth_reached: 60,
    });
  });

  it('propagates media truth gains to the global track', () => {
    const gameState = createBaseSnapshot({ truth: 50, ip: 8 });
    const tracker = createTracker();
    const card: GameCard = {
      id: 'media-broadcast',
      name: 'Signal Flood',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: expectedCost('MEDIA', 'common'),
      effects: { truthDelta: 6 },
    };

    const result = resolveCardMVP(gameState, card, null, actor, tracker);

    expect(result.truth).toBe(56);
    expect(result.ip).toBe(5);
    expect(result.logEntries.some(entry => entry.includes('Truth manipulation'))).toBe(true);
    expect(result.damageDealt).toBe(0);
  });

  it('captures contested states when zone pressure meets the defense threshold', () => {
    const gameState = createBaseSnapshot({
      ip: 10,
      states: [
        {
          id: 'NV',
          name: 'Nevada',
          abbreviation: 'NV',
          baseIP: 2,
          defense: 1,
          pressure: 0,
          contested: false,
          owner: 'neutral',
        },
      ],
    });
    const tracker = createTracker();
    const card: GameCard = {
      id: 'zone-seizure',
      name: 'Silent Takeover',
      type: 'ZONE',
      faction: 'truth',
      rarity: 'common',
      cost: expectedCost('ZONE', 'common'),
      target: { scope: 'state', count: 1 },
      effects: { pressureDelta: 2 },
    };

    const result = resolveCardMVP(gameState, card, 'NV', actor, tracker);

    expect(result.ip).toBe(6);
    expect(result.states[0]?.owner).toBe('player');
    expect(result.controlledStates).toContain('NV');
    expect(result.aiControlledStates).not.toContain('NV');
    expect(result.targetState).toBeNull();
    expect(result.logEntries.some(entry => entry.includes('captured'))).toBe(true);
    expect(tracker.updates.at(-1)).toMatchObject({
      total_states_controlled: 1,
      max_states_controlled_single_game: 1,
    });
  });
});
