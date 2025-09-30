import { describe, expect, it } from 'bun:test';
import {
  agendaIssueToState,
  applyIssueVerbOverlay,
  getAgendaIssueById,
  getIssueQuip,
  getIssueTags,
  weightForIssue,
} from '@/data/agendaIssues';

describe('agendaIssues helpers', () => {
  it('creates an agenda issue state with derived tags', () => {
    const issue = getAgendaIssueById('ufo');
    expect(issue).toBeTruthy();
    const state = agendaIssueToState(issue!);

    expect(state).toEqual({
      id: 'ufo',
      label: 'Cosmic Cover Stories',
      description: 'Saucer sightings, crash cart buffets, and orbital bake-offs dominate the rumor mill.',
      tags: ['#IssueUFO', '#SaucerSeason'],
    });
  });

  it('applies weighting based on the active issue', () => {
    expect(weightForIssue('ufo', 'Desert Disclosure')).toBe(2.5);
    expect(weightForIssue('ufo', 'Truth Momentum')).toBe(1.6);
    expect(weightForIssue('coverup', 'Nonexistent Theme')).toBeCloseTo(0.85);
    expect(weightForIssue(undefined, 'Desert Disclosure')).toBe(1);
    expect(weightForIssue('ufo', undefined)).toBe(1);
  });

  it('merges issue verbs ahead of base verbs without duplicates', () => {
    const merged = applyIssueVerbOverlay(['HIJACKS COSMIC FEED', 'BASE VERB'], 'ufo', 'MEDIA');

    expect(merged).toEqual([
      'HIJACKS COSMIC FEED',
      'BEAMS TRANSMISSION FROM ORBIT',
      'LOOPS SAUCER TELEMETRY',
      'BASE VERB',
    ]);
  });

  it('provides deterministic quips when seeded', () => {
    expect(getIssueQuip('ufo', 'truth', 0)).toBe('Truth kitchen radios hum in sympathy with the mothership.');
    expect(getIssueQuip('ufo', 'truth', 3)).toBe('Station gossip wonders if the cafeteria roof will open again tonight.');
    expect(getIssueQuip('ufo', 'government', -4)).toBe('Archivists arrange foil hats by alphabetical order, just in case.');
  });

  it('returns configured tags with fallback when unknown', () => {
    expect(getIssueTags('cryptid')).toEqual(['#IssueCryptid', '#MonsterMixer']);
    expect(getIssueTags('unknown')).toEqual(['#Issue-UNKNOWN']);
    expect(getIssueTags(undefined)).toEqual(['#Issue-MYSTERY']);
  });
});
