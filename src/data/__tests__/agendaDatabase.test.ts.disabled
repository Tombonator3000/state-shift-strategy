import { describe, expect, it } from 'bun:test';

import { AGENDA_DATABASE, getRandomAgenda } from '../agendaDatabase';

const TRUTH_AURORA_ID = 'truth_aurora_truth_choir';
const GOV_SPIN_SHIELD_ID = 'gov_spin_shield_network';

describe('secret agenda database additions', () => {
  it('includes the Aurora Truth Choir agenda with streak-based progress', () => {
    const agenda = AGENDA_DATABASE.find(entry => entry.id === TRUTH_AURORA_ID);
    expect(agenda).toBeDefined();
    expect(agenda?.target).toBe(5);
    expect(agenda?.difficulty).toBe('legendary');

    const report = agenda?.checkProgress({ truthAbove80Streak: 4, timeBasedGoalCounters: {} });
    expect(report).toBeDefined();
    expect(report?.progress).toBe(4);
    expect(report?.stageId).toBe(`${TRUTH_AURORA_ID}-escalation`);
  });

  it('includes the Spin Shield Network agenda with defensive card tracking', () => {
    const agenda = AGENDA_DATABASE.find(entry => entry.id === GOV_SPIN_SHIELD_ID);
    expect(agenda).toBeDefined();
    expect(agenda?.target).toBe(5);
    expect(agenda?.difficulty).toBe('medium');

    const report = agenda?.checkProgress({
      factionPlayHistory: [
        { card: { type: 'DEFENSIVE' } },
        { card: { type: 'DEFENSIVE' } },
        { card: { type: 'DEFENSIVE' } },
        { card: { type: 'DEFENSIVE' } },
      ],
    });
    expect(report).toBeDefined();
    expect(report?.progress).toBe(4);
    expect(report?.stageId).toBe(`${GOV_SPIN_SHIELD_ID}-escalation`);
  });

  it('rotates the new agendas through the random selector when forced', () => {
    const truthExclusions = AGENDA_DATABASE
      .filter(agenda => (agenda.faction === 'truth' || agenda.faction === 'both') && agenda.id !== TRUTH_AURORA_ID)
      .map(agenda => agenda.id);
    const truthAgenda = getRandomAgenda('truth', { excludeIds: truthExclusions });
    expect(truthAgenda.id).toBe(TRUTH_AURORA_ID);

    const governmentExclusions = AGENDA_DATABASE
      .filter(agenda => (agenda.faction === 'government' || agenda.faction === 'both') && agenda.id !== GOV_SPIN_SHIELD_ID)
      .map(agenda => agenda.id);
    const governmentAgenda = getRandomAgenda('government', { excludeIds: governmentExclusions });
    expect(governmentAgenda.id).toBe(GOV_SPIN_SHIELD_ID);
  });
});
