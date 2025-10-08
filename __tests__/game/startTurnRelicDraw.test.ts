import { startTurn } from '@/mvp/engine';
import type { Card, GameState, PlayerState } from '@/mvp/validator';
import type { PlayerId } from '@/engine/applyEffects-mvp';
import type { TabloidRelicRuntimeState } from '@/expansions/tabloidRelics/RelicTypes';
import {
  getExpansionFeaturesSnapshot,
  hydrateExpansionFeatures,
} from '@/data/expansions/features';

describe('startTurn relic card draw bonuses', () => {
  const originalFeatures = getExpansionFeaturesSnapshot();

  beforeEach(() => {
    hydrateExpansionFeatures({
      editors: originalFeatures.editors,
      tabloidRelics: true,
    });
  });

  afterEach(() => {
    hydrateExpansionFeatures(originalFeatures);
  });

  const createCard = (id: string): Card => ({
    id,
    name: `Mock Card ${id}`,
    type: 'MEDIA',
    faction: 'truth',
    rarity: 'common',
    cost: 1,
    effects: { truthDelta: 1 },
  });

  const createPlayer = (playerId: PlayerId, overrides: Partial<PlayerState> = {}): PlayerState => ({
    id: playerId,
    faction: 'truth',
    deck: Array.from({ length: 12 }, (_, index) => createCard(`${playerId}-deck-${index}`)),
    hand: [],
    discard: [],
    ip: 10,
    states: [],
    activeEditorId: null,
    ...overrides,
  });

  it('draws additional cards from relic bonus at turn start', () => {
    const runtime: TabloidRelicRuntimeState = {
      entries: [
        {
          uid: 'mock-relic',
          ruleId: 'mock-relic',
          label: 'Mock Relic',
          rarity: 'common',
          summary: 'Unit test relic',
          duration: 1,
          remaining: 1,
          status: 'active',
          triggeredOnRound: 1,
          effects: {
            cardDrawBonus: 2,
          },
        },
      ],
      lastIssueRound: 1,
      lastUpdatedTurn: 1,
      selectionHistory: [],
    };

    const gameState: GameState = {
      turn: 1,
      currentPlayer: 'P1',
      truth: 50,
      players: {
        P1: createPlayer('P1'),
        P2: createPlayer('P2'),
      },
      pressureByState: {},
      stateDefense: {},
      playsThisTurn: 0,
      turnPlays: [],
      log: [],
      headlineLog: [],
      extraExtraFeed: [],
      turnBuffer: [],
      winner: null,
      victoryType: null,
      tabloidRelicsRuntime: runtime,
    };

    const result = startTurn(gameState);
    const updatedPlayer = result.players.P1;

    expect(updatedPlayer.hand).toHaveLength(7);
    expect(result.log.some(entry => entry.includes('includes +2 relic bonus'))).toBe(true);
  });
});
