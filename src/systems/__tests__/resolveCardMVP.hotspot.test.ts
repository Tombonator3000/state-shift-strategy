import { describe, expect, it } from 'bun:test';

import type { PlayerStats } from '@/data/achievementSystem';
import type { GameCard } from '@/rules/mvp';
import { STATE_HOTSPOT_HISTORY_LIMIT } from '@/hooks/stateEventHistory';

import {
  resolveCardMVP,
  recordParanormalHotspotResolution,
  type AchievementTracker,
  type CardActor,
  type GameSnapshot,
  type StateForResolution,
} from '../cardResolution';
import { resolveHotspot } from '../paranormalHotspots';

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
      paranormalHotspotHistory: [],
    },
  ],
  ...overrides,
});

const createState = (overrides: Partial<StateForResolution> = {}): StateForResolution => ({
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
  owner: 'player',
  paranormalHotspotHistory: [],
  ...overrides,
});

describe('resolveCardMVP hotspot handling', () => {
  const actor: CardActor = 'human';

  it('normalizes invalid hotspot truth rewards before applying them', () => {
    const tracker = createTracker();
    const gameState = createBaseSnapshot({
      aiControlledStates: ['NV'],
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
          owner: 'ai',
          paranormalHotspotHistory: [],
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

    const truthDeltaFromHotspot = result.hotspotResolutions?.[0]?.truthDelta ?? 0;
    expect(result.truth).toBe(42 + truthDeltaFromHotspot);
    expect(Number.isFinite(result.truth)).toBe(true);
    expect(result.logEntries.some(entry => entry.includes('NaN'))).toBe(false);
    expect(result.hotspotResolutions).toBeDefined();
    expect(result.hotspotResolutions).toHaveLength(1);
    const [resolution] = result.hotspotResolutions ?? [];
    expect(resolution?.stateAbbreviation).toBe('NV');
    expect(Number.isFinite(resolution?.truthReward ?? Number.NaN)).toBe(true);
  });

  it('records hotspot history entries for truth and government captures', () => {
    const state = createState({ owner: 'player', paranormalHotspotHistory: [] });
    const truthSummary = {
      id: 'hotspot-1',
      label: 'Desert Rift',
      resolvedOnTurn: 3,
      faction: 'truth' as const,
      truthDelta: 12,
    };
    recordParanormalHotspotResolution(state, truthSummary);
    expect(state.paranormalHotspotHistory).toEqual([truthSummary]);

    const governmentSummary = {
      id: 'hotspot-2',
      label: 'Desert Rift',
      resolvedOnTurn: 4,
      faction: 'government' as const,
      truthDelta: -5,
    };
    recordParanormalHotspotResolution(state, governmentSummary);
    expect(state.paranormalHotspotHistory).toEqual([truthSummary, governmentSummary]);
  });

  it('trims hotspot history to the configured limit after resolution', () => {
    const existingHistory = Array.from({ length: STATE_HOTSPOT_HISTORY_LIMIT }, (_, index) => ({
      id: `old-${index}`,
      label: `Archive ${index}`,
      resolvedOnTurn: index + 1,
      faction: index % 2 === 0 ? 'truth' : 'government',
      truthDelta: index,
    }));

    const state = createState({ paranormalHotspotHistory: existingHistory });
    const newSummary = {
      id: 'hotspot-1',
      label: 'Desert Rift',
      resolvedOnTurn: 99,
      faction: 'truth' as const,
      truthDelta: 7,
    };

    recordParanormalHotspotResolution(state, newSummary);

    expect(state.paranormalHotspotHistory).toHaveLength(STATE_HOTSPOT_HISTORY_LIMIT);
    expect(state.paranormalHotspotHistory?.some(entry => entry.id === 'hotspot-1')).toBe(true);
    expect(state.paranormalHotspotHistory?.[0].id).toBe('old-1');
  });

  it('computes signed truth deltas based on winning faction', () => {
    const truthOutcome = resolveHotspot('OR', 'truth');
    const governmentOutcome = resolveHotspot('OR', 'government');

    expect(truthOutcome.finalReward).toBeGreaterThan(0);
    expect(truthOutcome.truthDelta).toBeGreaterThan(0);
    expect(governmentOutcome.finalReward).toBeGreaterThan(0);
    expect(governmentOutcome.truthDelta).toBeLessThanOrEqual(0);
    expect(Math.abs(governmentOutcome.truthDelta)).toBe(governmentOutcome.finalReward);
    expect(Math.abs(truthOutcome.truthDelta)).toBe(truthOutcome.finalReward);
  });
});

