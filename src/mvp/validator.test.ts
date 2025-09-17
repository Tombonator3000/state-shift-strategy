import { describe, expect, it } from 'bun:test';
import { expectedCost } from '@/rules/mvp';
import { validateCardMVP, type MVPGameCard } from '@/mvp/validator';

describe('expectedCost', () => {
  it('returns the baseline IP cost for MVP attack commons', () => {
    expect(expectedCost('ATTACK', 'common')).toBe(2);
    expect(expectedCost('MEDIA', 'legendary')).toBe(6);
    expect(expectedCost('ZONE', 'rare')).toBe(6);
  });

  it('throws when an MVP table entry is missing', () => {
    expect(() => expectedCost('DEFENSIVE', 'common')).toThrow(
      'No MVP cost defined for card type: DEFENSIVE',
    );
  });
});

describe('validateCardMVP', () => {
  const baseCard: MVPGameCard = {
    id: 'mvp-test-card',
    name: 'Signal Boost',
    faction: 'truth',
    type: 'MEDIA',
    rarity: 'common',
    cost: expectedCost('MEDIA', 'common'),
    effects: { truthDelta: 3 },
  };

  it('accepts well-formed MVP card definitions', () => {
    const { ok, errors } = validateCardMVP(baseCard);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('flags cards whose printed cost disagrees with the MVP baseline', () => {
    const { ok, errors } = validateCardMVP({
      ...baseCard,
      id: 'mvp-cost-mismatch',
      cost: baseCard.cost + 1,
    });

    expect(ok).toBe(false);
    expect(errors).toContain('cost should be 3');
  });

  it('requires ZONE cards to declare a positive pressure target', () => {
    const zoneCard: MVPGameCard = {
      id: 'mvp-zone-invalid',
      name: 'Shadow Infiltration',
      faction: 'truth',
      type: 'ZONE',
      rarity: 'common',
      cost: expectedCost('ZONE', 'common'),
      effects: { pressureDelta: 0 },
    };

    const result = validateCardMVP(zoneCard);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('ZONE cards require pressureDelta > 0');
    expect(result.errors).toContain('ZONE cards require state target');
  });
});
