import { describe, expect, test } from 'bun:test';
import { DEFAULT_EVENT_TRIGGER_CHANCE } from '@/data/eventDatabase';
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

  test('newspaper events carry the shared trigger probability metadata', () => {
    const result = assignStateBonuses({
      states: mockStates,
      baseSeed: 1,
      round: 3,
      playerFaction: 'truth',
    });

    expect(result.newspaperEvents.length).toBeGreaterThan(0);

    for (const event of result.newspaperEvents) {
      expect(event.triggerChance).toBeCloseTo(DEFAULT_EVENT_TRIGGER_CHANCE);
      const normalizedWeight = Math.max(1, event.weight ?? 0);
      const expectedConditional = Math.min(1, DEFAULT_EVENT_TRIGGER_CHANCE / normalizedWeight);
      expect(event.conditionalChance).toBeCloseTo(expectedConditional);
    }
  });

  test('truth and IP totals split between human and AI controllers', () => {
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

    expect(result.playerTruthDelta).toBe(playerTruth);
    expect(result.playerIpDelta).toBe(playerIp);
    expect(result.aiTruthDelta).toBe(aiTruth);
    expect(result.aiIpDelta).toBe(aiIp);
    expect(result.playerTruthDelta + result.aiTruthDelta).toBe(playerTruth + aiTruth);
    expect(result.playerIpDelta + result.aiIpDelta).toBe(playerIp + aiIp);
  });

  test('government players invert truth adjustments for their controlled states', () => {
    const states = [
      { id: '32', abbreviation: 'NV', name: 'Nevada', owner: 'player' as const },
      { id: '56', abbreviation: 'WY', name: 'Wyoming', owner: 'player' as const },
      { id: '38', abbreviation: 'ND', name: 'North Dakota', owner: 'ai' as const },
      { id: '12', abbreviation: 'FL', name: 'Florida', owner: 'ai' as const },
    ];

    const truthFactionResult = assignStateBonuses({
      states,
      baseSeed: 2025,
      round: 4,
      playerFaction: 'truth',
      eventChance: 0,
    });

    const governmentFactionResult = assignStateBonuses({
      states,
      baseSeed: 2025,
      round: 4,
      playerFaction: 'government',
      eventChance: 0,
    });

    for (const state of states) {
      const truthDeltaTruthFaction = truthFactionResult.bonuses[state.abbreviation]?.truthDelta ?? 0;
      const truthDeltaGovernmentFaction = governmentFactionResult.bonuses[state.abbreviation]?.truthDelta ?? 0;
      expect(truthDeltaGovernmentFaction).toBe(-truthDeltaTruthFaction);

      if (state.owner === 'player') {
        expect(truthDeltaGovernmentFaction).toBeLessThanOrEqual(0);
      } else {
        expect(truthDeltaGovernmentFaction).toBeGreaterThanOrEqual(0);
      }
    }

    expect(governmentFactionResult.playerTruthDelta).toBe(-truthFactionResult.playerTruthDelta);
    expect(governmentFactionResult.aiTruthDelta).toBe(-truthFactionResult.aiTruthDelta);
    expect(governmentFactionResult.playerTruthDelta).toBeLessThanOrEqual(0);
    expect(governmentFactionResult.aiTruthDelta).toBeGreaterThanOrEqual(0);
  });

  test('pressure adjustments retain controller ownership', () => {
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

    const wyomingPressure =
      (result.bonuses['WY']?.pressureDelta ?? 0) +
      (result.roundEvents['WY'] ?? []).reduce((sum, event) => sum + (event.pressureDelta ?? 0), 0);
    const floridaPressure =
      (result.bonuses['FL']?.pressureDelta ?? 0) +
      (result.roundEvents['FL'] ?? []).reduce((sum, event) => sum + (event.pressureDelta ?? 0), 0);

    expect(result.pressureAdjustments['WY']?.player ?? 0).toBe(wyomingPressure);
    expect(result.pressureAdjustments['WY']?.ai ?? 0).toBe(0);
    expect(result.pressureAdjustments['FL']?.ai ?? 0).toBe(floridaPressure);
    expect(result.pressureAdjustments['FL']?.player ?? 0).toBe(0);
  });
});
