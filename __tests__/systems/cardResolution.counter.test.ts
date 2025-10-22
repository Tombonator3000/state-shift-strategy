import { resolveCardMVP, type GameSnapshot } from '@/systems/cardResolution';
import type { GameCard } from '@/rules/mvp';

describe('card resolution counter detection', () => {
  it('marks the resolution as countered and preserves state when clash blocks the play', () => {
    const card: GameCard = {
      id: 'test-media-card',
      name: 'Signal Boost',
      type: 'MEDIA',
      faction: 'truth',
      cost: 2,
      effects: { truthDelta: 3 },
    };

    const snapshot: (GameSnapshot & { matchContext?: Record<string, unknown> }) = {
      truth: 50,
      ip: 8,
      aiIP: 10,
      hand: [card],
      aiHand: [],
      controlledStates: [],
      aiControlledStates: [],
      round: 1,
      turn: 1,
      faction: 'truth',
      states: [
        {
          id: 'state-1',
          name: 'Test State',
          abbreviation: 'TS',
          baseIP: 0,
          baseDefense: 1,
          defense: 1,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner: 'neutral',
          paranormalHotspotHistory: [],
          stateEventHistory: [],
        },
      ],
      matchContext: {
        clash: {
          targetCardId: 'test-media-card',
          outcome: 'countered',
          message: 'Intercepted by counter-broadcasters.',
        },
      },
    };

    const resolution = resolveCardMVP(snapshot, card, null, 'human');

    expect(resolution.countered).toBe(true);
    expect(resolution.truth).toBe(snapshot.truth);
    expect(resolution.ip).toBe(snapshot.ip);
    expect(resolution.aiIP).toBe(snapshot.aiIP);
    expect(resolution.capturedStateIds).toHaveLength(0);
    expect(resolution.logEntries).toContain('Intercepted by counter-broadcasters.');
  });
});
