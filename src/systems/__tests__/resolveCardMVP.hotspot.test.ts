import { describe, expect, it } from 'bun:test';

import type { PlayerStats } from '@/data/achievementSystem';
import type { GameCard } from '@/rules/mvp';

import {
  resolveCardMVP,
  type AchievementTracker,
  type CardActor,
  type GameSnapshot,
} from '../cardResolution';

const createTracker = (
  initial?: Partial<PlayerStats>,
): AchievementTracker & { updates: Array<Partial<PlayerStats>> } => {
  const updates: Array<Partial<PlayerStats>> = [];
  return {
    updates,
    stats: {
      total_states_controlled: 0,
      max_states_controlled_single_game: 0,
      max_ip_reached: 0,
      max_truth_reached: 50,
      min_truth_reached: 50,
      ...initial,
    },
    updateStats: update => {
      updates.push(update);
    },
  };
};

const createBaseSnapshot = (overrides: Partial<GameSnapshot> = {}): GameSnapshot => ({
  truth: 42,
  ip: 10,
  aiIP: 10,
  hand: [],
  aiHand: [],
  controlledStates: [],
  aiControlledStates: [],
  round: 1,
  turn: 1,
  faction: 'truth',
  states: [
    {
      id: 'NV',
      name: 'Nevada',
      abbreviation: 'NV',
      baseIP: 2,
      baseDefense: 1,
      defense: 1,
      pressure: 0,
      pressurePlayer: 0,
      pressureAi: 0,
      contested: false,
      owner: 'neutral',
    },
  ],
  ...overrides,
});

describe('resolveCardMVP hotspot handling', () => {
  const actor: CardActor = 'human';

  it('normalizes invalid hotspot truth rewards before applying them', () => {
    const tracker = createTracker();
    const gameState = createBaseSnapshot({
      states: [
        {
          id: 'NV',
          name: 'Nevada',
          abbreviation: 'NV',
          baseIP: 2,
          baseDefense: 1,
          defense: 1,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner: 'neutral',
          paranormalHotspot: {
            id: 'hotspot-1',
            eventId: 'event-1',
            label: 'Desert Rift',
            defenseBoost: 0,
            truthReward: Number.NaN,
            expiresOnTurn: 2,
            turnsRemaining: 2,
            source: 'neutral',
          },
        },
      ],
    });

    const card: GameCard = {
      id: 'zone-seizure',
      name: 'Silent Takeover',
      type: 'ZONE',
      faction: 'truth',
      rarity: 'common',
      cost: 2,
      target: { scope: 'state', count: 1 },
      effects: { pressureDelta: 2 },
    };

    const result = resolveCardMVP(gameState, card, 'NV', actor, tracker);

    expect(result.truth).toBe(42);
    expect(Number.isFinite(result.truth)).toBe(true);
    expect(result.resolvedHotspots).toEqual(['NV']);
    expect(result.logEntries.some(entry => entry.includes('👻 Desert Rift resolved in Nevada!'))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes('NaN'))).toBe(false);
  });
});

