import { describe, expect, it } from 'bun:test';
import { playCard, canPlay } from '@/mvp/engine';
import { resolveCardMVP, quoteZonePressure, type GameSnapshot } from '@/systems/cardResolution';
import type { GameState as EngineState } from '@/mvp';
import type { GameCard } from '@/rules/mvp';
function scenario(card: GameCard): { live: GameSnapshot; engine: EngineState } {
  const live: GameSnapshot = { truth: 50, ip: 12, aiIP: 10, hand: [card], aiHand: [], controlledStates: [], aiControlledStates: [], round: 1, turn: 1, faction: 'government', playerEditorId: 'editor_redactor', states: [{ id: 'texas', name: 'Texas', abbreviation: 'TX', baseIP: 2, baseDefense: 4, defense: 4, pressure: 1, pressurePlayer: 1, pressureAi: 0, contested: true, owner: 'neutral' }] };
  const engine: EngineState = { turn: 1, currentPlayer: 'P1', truth: 50, playsThisTurn: 0, turnPlays: [], turnBuffer: [], log: [], headlineLog: [], extraExtraFeed: [], traps: [], persistentEffects: [], pressureByState: { texas: { P1: 1, P2: 0 } }, stateDefense: { texas: 4 }, players: { P1: { id: 'P1', faction: 'government', ip: 12, states: [], hand: [card], deck: [], discard: [], activeEditorId: 'editor_redactor' }, P2: { id: 'P2', faction: 'truth', ip: 10, states: [], hand: [], deck: [], discard: [] } } };
  return { live, engine };
}
describe('pressure targeting parity', () => {
  for (const type of ['ZONE', 'HYBRID'] as const) it(`resolves ${type} pressure once in both live adapter and simulation`, () => {
    const card: GameCard = { id: 'pressure-proof', name: 'Field assignment', faction: 'government', type, cost: 5, effects: { pressureDelta: 2, ...(type === 'HYBRID' ? { truthDelta: -2 } : {}) } };
    const { live, engine } = scenario(card);
    expect(quoteZonePressure(live, card)).toBe(3);
    const a = resolveCardMVP(live, card, 'TX', 'human');
    const b = playCard(engine, card.id, 'texas');
    expect(a.states[0].owner).toBe('player'); expect(b.players.P1.states).toContain('texas');
    expect(a.states[0].pressurePlayer).toBe(0); expect(b.pressureByState.texas.P1).toBe(0);
    expect(a.ip).toBe(b.players.P1.ip); expect(a.truth).toBe(b.truth);
    expect(live.ip).toBe(12); expect(engine.players.P1.ip).toBe(12);
  });
  it('invalid or already-owned targets cannot spend simulation resources', () => {
    const card: GameCard = { id: 'pressure-proof', name: 'Field assignment', faction: 'government', type: 'ZONE', cost: 5, effects: { pressureDelta: 2 } };
    const { engine } = scenario(card);
    expect(canPlay(engine, card).ok).toBe(false); expect(canPlay(engine, card, 'missing').ok).toBe(false);
    engine.players.P1.states = ['texas']; expect(canPlay(engine, card, 'texas')).toEqual({ ok: false, reason: 'owned-target' }); expect(engine.players.P1.ip).toBe(12);
  });
});
