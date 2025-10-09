import { describe, expect, it } from 'bun:test';

import { computeMediaTruthDelta_MVP } from '../media';
import type { Card } from '../validator';

describe('computeMediaTruthDelta_MVP media polarity safeguards', () => {
  const mediaCard: Pick<Card, 'id' | 'type' | 'effects'> = {
    id: 'media-spin-lab',
    type: 'MEDIA',
    effects: { truthDelta: 5 },
  };

  it('boosts truth for truth-faction broadcasters', () => {
    const delta = computeMediaTruthDelta_MVP({ faction: 'truth' }, mediaCard);

    expect(delta).toBe(5);
  });

  it('mirrors the magnitude for government propagandists', () => {
    const delta = computeMediaTruthDelta_MVP({ faction: 'government' }, mediaCard);

    expect(delta).toBe(-5);
  });
});
