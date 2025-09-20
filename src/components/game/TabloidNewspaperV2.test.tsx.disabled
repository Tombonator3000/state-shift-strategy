import { describe, expect, it } from 'bun:test';
import { buildRoundContext, formatTruthDelta } from './tabloidRoundUtils';
import type { TabloidPlayedCard } from './TabloidNewspaperLegacy';

type PlayerType = TabloidPlayedCard['player'];

const makeCard = (id: string, player: PlayerType, truthDelta: number): TabloidPlayedCard => ({
  card: {
    id,
    name: id,
    type: 'MEDIA',
    faction: player === 'human' ? 'truth' : 'government',
    cost: 1,
  },
  player,
  truthDelta,
});

describe('TabloidNewspaperV2 truth delta summary', () => {
  it('returns a negative swing when the opposition suppresses truth', () => {
    const playerCards = [makeCard('player-boost', 'human', 4)];
    const opponentCards = [makeCard('opponent-suppress', 'ai', -6)];
    const eventTruth = 1;

    const context = buildRoundContext(playerCards, opponentCards, eventTruth);
    const expectedNet = 4 + -6 + 1;

    expect(context.truthDeltaTotal).toBe(expectedNet);
    expect(formatTruthDelta(context.truthDeltaTotal)).toBe('−1%');
  });

  it('returns a positive swing when the opposition boosts truth', () => {
    const playerCards = [makeCard('player-small', 'human', 2)];
    const opponentCards = [makeCard('opponent-boost', 'ai', 3)];
    const eventTruth = -1;

    const context = buildRoundContext(playerCards, opponentCards, eventTruth);
    const expectedNet = 2 + 3 - 1;

    expect(context.truthDeltaTotal).toBe(expectedNet);
    expect(formatTruthDelta(context.truthDeltaTotal)).toBe('+4%');
  });

  it('accounts for combo truth swings separately from card plays and events', () => {
    const playerCards = [makeCard('player-small', 'human', 2)];
    const opponentCards = [makeCard('opponent-boost', 'ai', -1)];
    const eventTruth = 0;
    const comboTruth = 5;

    const context = buildRoundContext(playerCards, opponentCards, eventTruth, comboTruth);
    const expectedNet = 2 - 1 + 0 + comboTruth;

    expect(context.truthDeltaTotal).toBe(expectedNet);
    expect(formatTruthDelta(context.truthDeltaTotal)).toBe('+6%');
  });
});
