import { describe, expect, test } from 'bun:test';

import { formatEffect } from '../cardUi';
import type { GameCard } from '@/rules/mvp';

describe('formatEffect', () => {
  const baseCard: Pick<GameCard, 'id' | 'name' | 'type' | 'faction' | 'cost' | 'effects'> = {
    id: 'test-card',
    name: 'Test Card',
    type: 'MEDIA',
    faction: 'truth',
    cost: 0,
    effects: {},
  };

  test('appends reveal text for ATTACK cards', () => {
    const card: GameCard = {
      ...baseCard,
      type: 'ATTACK',
      effects: {
        ipDelta: { opponent: -2 },
        revealSecretAgenda: true,
      },
    };

    expect(formatEffect(card)).toBe('Opponent loses 2 IP · Reveal enemy secret agenda');
  });

  test('appends reveal text for MEDIA cards', () => {
    const card: GameCard = {
      ...baseCard,
      type: 'MEDIA',
      effects: {
        truthDelta: 5,
        revealSecretAgenda: true,
      },
    };

    expect(formatEffect(card)).toBe('Truth +5% · Reveal enemy secret agenda');
  });

  test('appends reveal text for ZONE cards', () => {
    const card: GameCard = {
      ...baseCard,
      type: 'ZONE',
      effects: {
        pressureDelta: 3,
        revealSecretAgenda: true,
      },
    };

    expect(formatEffect(card)).toBe('+3 Pressure to a state · Reveal enemy secret agenda');
  });
});
