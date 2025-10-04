import { describe, expect, test } from 'bun:test';

import { generateMainStory, type PlayedCardMeta } from '../mainStory';
import type { CardArticle } from '../articleBank';

const mkCard = (id: string, name: string, type: PlayedCardMeta['type'], faction: PlayedCardMeta['faction']): PlayedCardMeta => ({
  id,
  name,
  type,
  faction,
});

describe('generateMainStory', () => {
  test('Truth: én samlet headline med verb per type', () => {
    const played = [
      mkCard('T1', 'Paranoia Rally', 'ZONE', 'TRUTH'),
      mkCard('T2', 'Community Leak Drop', 'ATTACK', 'TRUTH'),
      mkCard('T3', 'Mothman Public Warning', 'MEDIA', 'TRUTH'),
    ];
    const lookup = (id: string): CardArticle | null => ({
      id,
      tone: 'truth',
      tags: id === 'T3' ? ['mothman', 'cryptid'] : ['cryptid'],
    });

    const story = generateMainStory(played, lookup);

    expect(story.headline).toMatch(/PARANOIA RALLY .* AS COMMUNITY LEAK DROP .* — MOTHMAN PUBLIC WARNING .*!/);
    expect((story.headline.match(/—/g) ?? []).length).toBe(1);
    expect(story.subhead).toContain('cryptid');
    expect(story.debug?.subject).toBe('PARANOIA RALLY');
  });

  test('Gov: eufemisme + fraser; ikke limte deloverskrifter', () => {
    const played = [
      mkCard('G1', 'Council in the Smoke', 'MEDIA', 'GOV'),
      mkCard('G2', 'Psychological Operations Cell', 'ATTACK', 'GOV'),
      mkCard('G3', 'Compliance Audit', 'ZONE', 'GOV'),
    ];
    const lookup = (_id: string): CardArticle | null => ({ id: _id, tone: 'gov', tags: ['coverup'] });

    const story = generateMainStory(played, lookup);

    expect(story.headline).toMatch(/COUNCIL IN THE SMOKE: .*; .*; .*/);
    expect(story.headline).not.toMatch(/✦|\|/);
    expect(story.subhead).toMatch(/Transparency achieved via prudent opacity/);
    expect(story.debug?.parts?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  test('subhead references up to two shared tags', () => {
    const played = [
      mkCard('S1', 'Skywatch Network', 'MEDIA', 'TRUTH'),
      mkCard('S2', 'Orbital Watch', 'ZONE', 'TRUTH'),
      mkCard('S3', 'Signal Uplink', 'ATTACK', 'TRUTH'),
    ];
    const lookup = (_id: string): CardArticle | null => ({
      id: _id,
      tone: 'truth',
      tags: ['ufo', 'alien', 'attack'],
    });

    const story = generateMainStory(played, lookup);

    expect(story.subhead).toMatch(/ufo, alien/);
    expect(story.debug?.commonTags).toEqual(['ufo', 'alien']);
  });

  test('deterministic headline regardless of card order', () => {
    const cards = [
      mkCard('A1', 'First Contact', 'MEDIA', 'TRUTH'),
      mkCard('A2', 'Deep Vault Breach', 'ATTACK', 'TRUTH'),
      mkCard('A3', 'Rally of Witnesses', 'ZONE', 'TRUTH'),
    ];
    const lookup = (_id: string): CardArticle | null => ({ id: _id, tone: 'truth', tags: ['witness'] });

    const storyA = generateMainStory(cards, lookup);
    const storyB = generateMainStory([...cards].reverse(), lookup);

    expect(storyB.headline).toBe(storyA.headline);
    expect(storyB.subhead).toBe(storyA.subhead);
    expect(storyB.debug?.templateId).toBe(storyA.debug?.templateId);
  });

  test('falls back to subject-based selection when mythic tags absent', () => {
    const played = [
      mkCard('F1', 'Zone Sweep', 'ZONE', 'TRUTH'),
      mkCard('F2', 'Media Blitz', 'MEDIA', 'TRUTH'),
      mkCard('F3', 'Attack Vector', 'ATTACK', 'TRUTH'),
    ];
    const lookup = (_id: string): CardArticle | null => ({ id: _id, tone: 'truth', tags: ['analysis'] });

    const story = generateMainStory(played, lookup);

    expect(story.debug?.subject).toBe('ZONE SWEEP');
    expect(story.debug?.templateId).toMatch(/truth/);
  });
});
