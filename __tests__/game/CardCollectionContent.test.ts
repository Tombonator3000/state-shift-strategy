import { describe, expect, it, mock } from 'bun:test';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import type { GameCard } from '../../src/rules/mvp';

const cardWithoutText: GameCard = {
  id: 'card-without-text',
  name: 'Silent Broadcast',
  type: 'MEDIA',
  faction: 'Truth',
  rarity: 'common',
  cost: 3,
};

mock.module('@/hooks/useCardCollection', () => ({
  useCardCollection: () => ({
    getDiscoveredCards: () => [cardWithoutText],
    getCardStats: () => ({ discovered: true, timesPlayed: 0 }),
    getCollectionStats: () => ({
      totalCards: 1,
      discoveredCards: 1,
      completionPercentage: 100,
      totalPlays: 0,
    }),
  }),
}));

const loadCardCollectionContent = async () => {
  const module = await import('../../src/components/game/CardCollection');
  return module.CardCollectionContent;
};

describe('CardCollectionContent', () => {
  it('renders without crashing when card text is missing', async () => {
    const CardCollectionContent = await loadCardCollectionContent();

    expect(() => {
      TestRenderer.create(React.createElement(CardCollectionContent));
    }).not.toThrow();
  });

  it('shows a fallback description when card text is missing', async () => {
    const CardCollectionContent = await loadCardCollectionContent();

    const renderer = TestRenderer.create(React.createElement(CardCollectionContent));
    const json = renderer.toJSON();

    expect(JSON.stringify(json)).toContain('No description available.');
  });
});
