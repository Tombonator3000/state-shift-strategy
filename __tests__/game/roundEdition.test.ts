import { describe, it, expect } from 'bun:test';
import { composeRoundEdition, type EditionPlay } from '@/systems/news/roundEdition';
const make = (id: string, name: string, round = 7): EditionPlay => ({ card: { id, name, cost: 5, type: 'MEDIA', faction: 'truth' }, player: 'human', round, truthDelta: 2 });
const bigfoot = make('TRUTH-001', 'Bigfoot photo');
const mothman = make('TRUTH-040', 'Mothman warning');
const ufo = make('TRUTH-007', 'UFO over high school');
describe('current round edition', () => {
  it('prints a quiet edition with zero cards and never borrows an older story', () => {
    const edition = composeRoundEdition([make('old', 'Old UFO', 6)], [], 7, 'truth');
    expect(edition.sources).toEqual([]); expect(edition.headline).toBe('NOTHING HAPPENED. OFFICIALLY.'); expect(edition.body.join(' ')).not.toContain('Old UFO');
  });
  it('builds readable stories from one, two, or three cards with complete source references', () => {
    for (let n = 1; n <= 3; n++) {
      const plays = [bigfoot, mothman, ufo].slice(0, n);
      const edition = composeRoundEdition(plays, [], 7, 'truth');
      expect(edition.sources.map(s => s.id)).toEqual(plays.map(p => p.card.id));
      expect(edition.body.length).toBeGreaterThanOrEqual(3);
      expect(edition.body.join(' ')).not.toContain('Bigfoot photo was');
      expect(edition.outcome).toContain(`+${2 * n}%`);
    }
  });
  it('connects the cryptids and UFO into one causal story without concatenated card titles', () => {
    const edition = composeRoundEdition([bigfoot, mothman, ufo], [], 7, 'truth');
    expect(edition.headline).toBe('BIGFOOT HIRES MOTHMAN AS PRESS SECRETARY');
    expect(edition.body.join(' ')).toContain('saucer interrupted');
    expect(edition.body.join(' ')).toContain('No anomalies detected');
    expect(composeRoundEdition([bigfoot, mothman], [], 7, 'truth').body.join(' ')).not.toContain('saucer');
  });
  it('keeps government voice and both actors’ actual effects separate from fictional reporting', () => {
    const plays: EditionPlay[] = [bigfoot, { ...mothman, player: 'ai', truthDelta: -5, capturedStates: ['Texas'] }];
    const edition = composeRoundEdition(plays, [], 7, 'government');
    expect(edition.tone).toBe('government'); expect(edition.headline).toContain('ROUTINE'); expect(edition.outcome).toContain('-3%'); expect(edition.outcome).toContain('1 state capture'); expect(edition.records).toHaveLength(2);
  });
});

it('uses witness names and readable state names instead of engine IDs in article copy', () => {
  const edition = composeRoundEdition([{ ...make('TRUTH-192', "Maria's Copier Jam of Destiny"), targetState: '48' }], [], 7, 'truth');
  expect(edition.headline).toContain('MARIA');
  expect(edition.subhead).toContain('Texas');
  expect(edition.subhead).not.toContain('48');
  expect(edition.body[2]).not.toContain('correct their recollection');
});
