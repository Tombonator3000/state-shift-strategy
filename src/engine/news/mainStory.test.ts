import { expect, test } from 'bun:test';

import { generateMainStory, type PlayedCardMeta } from './mainStory';
import type { CardArticle } from './articleBank';

const mk = (id: string, name: string, type: PlayedCardMeta['type'], faction: PlayedCardMeta['faction']): PlayedCardMeta => ({
  id,
  name,
  type,
  faction,
});

const truthLookup = (id: string): CardArticle | null => ({
  id,
  tone: 'truth',
  tags: id === 'A' ? ['mothman', 'cryptid'] : ['cryptid'],
});

const govLookup = (id: string): CardArticle | null => ({
  id,
  tone: 'gov',
  tags: ['coverup'],
});

test('Truth: exact single headline, verbs per type, no separators', () => {
  const story = generateMainStory(
    [
      mk('A', 'Paranoia Rally', 'ZONE', 'TRUTH'),
      mk('B', 'Community Leak Drop', 'ATTACK', 'TRUTH'),
      mk('M', 'Mothman Public Warning', 'MEDIA', 'TRUTH'),
    ],
    truthLookup,
  );
  expect(story.headline).toMatch(/PARANOIA RALLY .* AS COMMUNITY LEAK DROP .* — MOTHMAN PUBLIC WARNING .*!/);
  expect(story.headline).not.toMatch(/[|✦]/);
  expect((story.headline.match(/—/g) ?? []).length).toBe(1);
  expect(story.subhead).toBeTruthy();
});

test('Gov: euphemism + per-type phrases, subject title-cased', () => {
  const story = generateMainStory(
    [
      mk('G1', 'Unmarked Evidence Locker', 'ZONE', 'GOV'),
      mk('G2', 'Continuity Signal Test', 'MEDIA', 'GOV'),
      mk('G3', 'Credible Source Program', 'MEDIA', 'GOV'),
    ],
    govLookup,
  );
  expect(story.headline).toMatch(/Unmarked Evidence Locker: .*; .*; .*/);
  expect(story.headline).not.toMatch(/[|✦]/);
  expect(story.subhead?.toLowerCase()).toContain('transparency achieved');
});

test('Deterministic output for identical triplet', () => {
  const played = [
    mk('T1', 'Alpha', 'ATTACK', 'TRUTH'),
    mk('T2', 'Beta', 'MEDIA', 'TRUTH'),
    mk('T3', 'Gamma', 'ZONE', 'TRUTH'),
  ];
  const one = generateMainStory(played, truthLookup);
  const two = generateMainStory(played, truthLookup);
  expect(one.headline).toBe(two.headline);
  expect(one.subhead).toBe(two.subhead);
});
