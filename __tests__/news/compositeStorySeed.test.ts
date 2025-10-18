import { describe, it, expect } from 'bun:test';
import { composeCompositeStory } from '@/systems/news/absurdComposer';
import { computeCompositeStorySeed } from '@/utils/compositeStory';

describe('composite story seeding', () => {
  it('generates deterministic stories for the same turn and article set regardless of order', () => {
    const articleIds = ['TRUTH-001', 'TRUTH-002', 'TRUTH-003'];
    const shuffled = [...articleIds].reverse();

    const baseSeed = 0xdeadbeef;
    const round = 4;
    const turn = 2;
    const actor: 'human' | 'ai' = 'human';

    const seedA = computeCompositeStorySeed({ baseSeed, round, turn, actor, ids: articleIds });
    const seedB = computeCompositeStorySeed({ baseSeed, round, turn, actor, ids: shuffled });

    expect(seedA).toBe(seedB);

    const storyA = composeCompositeStory(articleIds, 'truth', seedA);
    const storyB = composeCompositeStory(shuffled, 'truth', seedB);

    expect(storyA).toEqual(storyB);
  });
});
