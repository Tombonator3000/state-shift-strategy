import { beforeAll, describe, expect, it } from 'vitest';

import { composeTripleHeadline, type NewsCardLite } from '../composeTriple';
import { initNewsPools } from '../newsPools';

const createCard = (overrides: Partial<NewsCardLite> = {}): NewsCardLite => ({
  id: 'CARD-001',
  name: 'Placeholder Card',
  faction: 'truth',
  type: 'MEDIA',
  tags: [],
  ...overrides,
});

describe('composeTripleHeadline', () => {
  beforeAll(async () => {
    await initNewsPools();
  });

  it('uses the Elvis/UFO combo when tags match', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'TRUTH-801', name: 'Rhinestone Broadcast', tags: ['elvis'], type: 'MEDIA' }),
      createCard({ id: 'TRUTH-802', name: 'Saucer Flyover', tags: ['ufo'], type: 'ZONE' }),
      createCard({ id: 'TRUTH-803', name: 'Neon Witness', tags: [], type: 'ATTACK' }),
    ];

    const article = composeTripleHeadline(played, null, { seed: 42 });

    expect(article).not.toBeNull();
    expect(article?.comboId).toBe('cmb-elvis-ufo');
    expect(article?.hed).toContain('ELVIS');
    expect(article?.dek).toContain('control tower');
  });

  it('prefers combo headline for Bat Boy and Bigfoot summit', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'TRUTH-017', name: 'Bat Boy Stunt', tags: ['bat-boy'], type: 'MEDIA' }),
      createCard({ id: 'TRUTH-120', name: 'Bigfoot Rally', tags: ['bigfoot'], type: 'ZONE' }),
      createCard({ id: 'TRUTH-121', name: 'Coalition Snacks', tags: [], type: 'ATTACK' }),
    ];

    const article = composeTripleHeadline(played, null, { seed: 7 });

    expect(article).not.toBeNull();
    expect(article?.comboId).toBe('cmb-batboy-bigfoot-summit');
    expect(article?.hed).toContain('BAT BOY & BIGFOOT HOLD SECRET SUMMIT');
    expect(article?.tone).toBe('truth');
  });

  it('selects FOIA versus coverup combo when opponent cards match', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'TRUTH-039', name: 'FOIA Blitz', tags: ['coverup'], type: 'MEDIA' }),
      createCard({ id: 'TRUTH-086', name: 'FOIA Lawsuit', tags: ['bureaucracy'], type: 'ATTACK' }),
      createCard({ id: 'TRUTH-122', name: 'Sunshine Request', tags: [], type: 'ZONE' }),
    ];
    const opponent: NewsCardLite[] = [
      createCard({
        id: 'GOV-002',
        name: 'Directorate Cover Story',
        faction: 'government',
        type: 'MEDIA',
        tags: ['coverup', 'bureaucracy'],
      }),
    ];

    const article = composeTripleHeadline(played, opponent, { seed: 13 });

    expect(article).not.toBeNull();
    expect(article?.comboId).toBe('cmb-foia-vs-coverup');
    expect(article?.templateId).toBeUndefined();
    expect(article?.tone).toBe('draw');
    expect(article?.hed).toContain('FOIA BLITZ');
  });

  it('matches the zone chain template when all cards are zones', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'GOV-201', name: 'Perimeter Fence', faction: 'government', type: 'ZONE' }),
      createCard({ id: 'GOV-202', name: 'Containment Grid', faction: 'government', type: 'ZONE' }),
      createCard({ id: 'GOV-203', name: 'Lockdown Sweep', faction: 'government', type: 'ZONE' }),
    ];

    const article = composeTripleHeadline(played, null, { seed: 91 });

    expect(article).not.toBeNull();
    expect(article?.templateId).toBe('mix_all_gov:gov_triple_generic');
    expect(article?.hed).toContain('OFFICIAL STORY');
    expect(article?.tone).toBe('government');
  });

  it('uses the Halloween bucket when ghost tags dominate', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'TRUTH-301', name: 'Haunted Hotline', tags: ['ghost'], type: 'MEDIA' }),
      createCard({ id: 'TRUTH-302', name: 'Graveyard Vigil', tags: ['haunted'], type: 'ZONE' }),
      createCard({ id: 'TRUTH-303', name: 'Ectoplasm Sample', tags: [], type: 'ATTACK' }),
    ];

    const article = composeTripleHeadline(played, null, { seed: 5 });

    expect(article).not.toBeNull();
    expect(article?.templateId).toBe('theme_halloween_cluster:ghost_stack_combo');
    expect(article?.hed).toContain('HAUNTED TRIPLE-HEADER');
  });

  it('produces a government triple template for all-government plays', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'GOV-401', name: 'Briefing Bulletin', faction: 'government', type: 'MEDIA' }),
      createCard({ id: 'GOV-402', name: 'Containment Sweep', faction: 'government', type: 'ATTACK' }),
      createCard({ id: 'GOV-403', name: 'Logistics Memo', faction: 'government', type: 'ZONE' }),
    ];

    const article = composeTripleHeadline(played, null, { seed: 27 });

    expect(article).not.toBeNull();
    expect(article?.templateId).toBe('mix_all_gov:gov_triple_generic');
    expect(article?.tone).toBe('government');
  });

  it('falls back to the generic template when factions mix with no special tags', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'TRUTH-901', name: 'Obscure Lead', tags: ['oddity'], type: 'MEDIA' }),
      createCard({ id: 'GOV-902', name: 'Containment Clarifier', faction: 'government', tags: ['clerical'], type: 'ATTACK' }),
      createCard({ id: 'TRUTH-903', name: 'Late Night Call', tags: ['phone'], type: 'ZONE' }),
    ];

    const article = composeTripleHeadline(played, null, { seed: 3 });

    expect(article).not.toBeNull();
    expect(article?.templateId).toBe('generic:fallback_generic');
    expect(article?.hed).toBeTruthy();
  });

  it('is deterministic for identical seeds and inputs', () => {
    const played: NewsCardLite[] = [
      createCard({ id: 'TRUTH-751', name: 'Signal Flare', tags: ['ghost'], type: 'MEDIA' }),
      createCard({ id: 'TRUTH-752', name: 'Cemetery Watch', tags: ['haunted'], type: 'ZONE' }),
      createCard({ id: 'TRUTH-753', name: 'Nocturne March', tags: [], type: 'ATTACK' }),
    ];

    const first = composeTripleHeadline(played, null, { seed: 123 });
    const second = composeTripleHeadline(played, null, { seed: 123 });

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first?.hed).toBe(second?.hed);
    expect(first?.dek).toBe(second?.dek);
    expect(first?.bullets).toEqual(second?.bullets);
  });
});
