import { describe, expect, it } from 'bun:test';

import VictoryManager, { BASE_VICTORY_CONDITIONS } from '@/data/victoryConditions';

describe('VictoryManager overtime protocol', () => {
  it('awards the Truth Seekers when momentum leads at the turn cap', () => {
    const manager = new VictoryManager(BASE_VICTORY_CONDITIONS);
    const result = manager.checkVictoryConditions({
      turn: 12,
      maxTurns: 12,
      startingTruth: 50,
      truth: 62,
      faction: 'truth',
      ip: 120,
      aiIP: 120,
      controlledStates: ['CA', 'NY', 'WA'],
      aiControlledStates: ['TX', 'FL'],
    });

    expect(result.hasWinner).toBe(true);
    expect(result.winner).toBe('truth');
    expect(result.victoryType).toBe('overtime_protocol');
    expect(result.message).toContain('Continuity Overtime Protocol');
  });

  it('falls back to territorial control when momentum is neutral', () => {
    const manager = new VictoryManager(BASE_VICTORY_CONDITIONS);
    const result = manager.checkVictoryConditions({
      turn: 20,
      maxTurns: 20,
      startingTruth: 50,
      truth: 50,
      faction: 'truth',
      ip: 90,
      aiIP: 90,
      controlledStates: ['CA', 'NY'],
      aiControlledStates: ['TX', 'FL', 'NV', 'AZ'],
    });

    expect(result.hasWinner).toBe(true);
    expect(result.winner).toBe('government');
    expect(result.victoryType).toBe('overtime_protocol');
    expect(result.message).toContain('Continuity Overtime Protocol');
  });
});
