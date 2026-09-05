import { describe, expect, it } from 'bun:test';
import type { GameCard } from '@/rules/mvp';
import { validateMvpCard } from '@/utils/validate-mvp';
import { formatEffect, normalizeCardType } from '@/lib/cardUi';

const base = { id: 'extended-test', name: 'Departmental Memo', faction: 'truth', rarity: 'common', cost: 3, effects: {} } as const;
const cards: GameCard[] = [
  { ...base, type: 'HYBRID', hybridConfig: { baseCost: 3, conditions: [{ type: 'truth', operator: '>=', value: 60, costModifier: -1 }] } },
  { ...base, type: 'TRAP', cost: 2, trapConfig: { triggerOn: 'opponent_attack', effects: { truthDelta: 1 } } },
  { ...base, type: 'PERSISTENT', persistentConfig: { duration: 2, perTurnEffect: { truthDelta: 1 } } },
];

describe('expansion validation and card presentation', () => {
  for (const card of cards) {
    it(`accepts configured ${card.type} without crashing expansion discovery`, () => {
      expect(validateMvpCard(card).ok).toBe(true);
      expect(normalizeCardType(card.type)).toBe(card.type);
      expect(validateMvpCard({ ...card, hybridConfig: undefined, trapConfig: undefined, persistentConfig: undefined }).ok).toBe(false);
      expect(validateMvpCard({ ...card, cost: -1 }).ok).toBe(false);
    });
  }
  it('rejects malformed configuration and keeps extended instructions intact', () => {
    expect(validateMvpCard({ ...cards[0], hybridConfig: { baseCost: 3 } } as GameCard).ok).toBe(false);
    expect(formatEffect({ ...cards[1], effects: { truthDelta: 1 }, text: 'Wait for the opposing attack.' })).toBe('Wait for the opposing attack.');
  });
});
