import { describe, expect, test } from 'bun:test';
import { assignStateBonuses, computeRoundSeed } from '../stateBonuses';

describe('stateBonuses deterministic selection', () => {
  const mockStates = [
    { id: '56', abbreviation: 'WY', name: 'Wyoming' },
    { id: '38', abbreviation: 'ND', name: 'North Dakota' },
    { id: '12', abbreviation: 'Florida', name: 'Florida' },
    { id: '32', abbreviation: 'NV', name: 'Nevada' },
  ];

  test('assignments stay stable for identical seed/round', () => {
    const baseSeed = computeRoundSeed(123456789, 1);
    const resultA = assignStateBonuses({
      states: mockStates,
      baseSeed,
      round: 5,
      playerFaction: 'truth',
    });
    const resultB = assignStateBonuses({
      states: mockStates,
      baseSeed,
      round: 5,
      playerFaction: 'truth',
    });

    expect(resultA.debug.seed).toBe(resultB.debug.seed);
    expect(resultA.bonuses).toEqual(resultB.bonuses);
    expect(resultA.roundEvents).toEqual(resultB.roundEvents);
    expect(resultA.pressureAdjustments).toEqual(resultB.pressureAdjustments);
  });

  test('different rounds produce different roll signatures', () => {
    const baseSeed = 987654321;
    const roundFive = assignStateBonuses({
      states: mockStates,
      baseSeed,
      round: 5,
      playerFaction: 'truth',
    });
    const roundSix = assignStateBonuses({
      states: mockStates,
      baseSeed,
      round: 6,
      playerFaction: 'truth',
    });

    expect(roundFive.debug.seed).not.toBe(roundSix.debug.seed);
  });

  test('event chance can be disabled entirely', () => {
    const result = assignStateBonuses({
      states: mockStates,
      baseSeed: 42,
      round: 3,
      playerFaction: 'truth',
      eventChance: 0,
    });

    for (const events of Object.values(result.roundEvents)) {
      expect(events.length).toBe(0);
    }
    expect(result.newspaperEvents.length).toBe(0);
  });

  test('only player-controlled states contribute to truth and IP totals', () => {
    const states = [
      { id: '32', abbreviation: 'NV', name: 'Nevada', owner: 'player' as const },
      { id: '56', abbreviation: 'WY', name: 'Wyoming', owner: 'player' as const },
      { id: '38', abbreviation: 'ND', name: 'North Dakota', owner: 'ai' as const },
      { id: '12', abbreviation: 'FL', name: 'Florida', owner: 'ai' as const },
    ];

    const result = assignStateBonuses({
      states,
      baseSeed: 9999,
      round: 3,
      playerFaction: 'truth',
      eventChance: 0,
    });

    const playerTruth = states
      .filter(state => state.owner === 'player')
      .reduce((sum, state) => sum + (result.bonuses[state.abbreviation]?.truthDelta ?? 0), 0);

    const playerIp = states
      .filter(state => state.owner === 'player')
      .reduce((sum, state) => sum + (result.bonuses[state.abbreviation]?.ipDelta ?? 0), 0);

    const aiTruth = states
      .filter(state => state.owner === 'ai')
      .reduce((sum, state) => sum + (result.bonuses[state.abbreviation]?.truthDelta ?? 0), 0);

    const aiIp = states
      .filter(state => state.owner === 'ai')
      .reduce((sum, state) => sum + (result.bonuses[state.abbreviation]?.ipDelta ?? 0), 0);

    expect(aiTruth).not.toBe(0);
    expect(aiIp).not.toBe(0);
    expect(result.truthDelta).toBe(playerTruth);
    expect(result.ipDelta).toBe(playerIp);
    expect(result.truthDelta).not.toBe(playerTruth + aiTruth);
    expect(result.ipDelta).not.toBe(playerIp + aiIp);
  });

  test('pressure adjustments exclude AI-controlled states', () => {
    const result = assignStateBonuses({
      states: [
        { id: '12', abbreviation: 'FL', name: 'Florida', owner: 'ai' },
        { id: '56', abbreviation: 'WY', name: 'Wyoming', owner: 'player' },
      ],
      baseSeed: 123456,
      round: 3,
      playerFaction: 'truth',
      eventChance: 0,
    });

    expect(result.bonuses['FL']?.pressureDelta ?? 0).not.toBe(0);
    expect(result.pressureAdjustments).toEqual({});
  });
});
