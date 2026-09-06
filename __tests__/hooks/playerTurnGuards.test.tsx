import { completedRoundNumber, composeRoundEdition } from '@/systems/news/roundEdition';
import { afterEach, describe, expect, it } from 'bun:test';
import { act, cleanup, renderHook } from '@testing-library/react';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { useGameState } from '@/hooks/useGameState';
import type { GameCard } from '@/rules/mvp';
import { quoteHumanCard } from '@/systems/cardPlayQuote';
import type { PlayResult } from '@/hooks/useCardAnimation';

afterEach(cleanup);
const card: GameCard = { id: 'guard-test', name: 'Routine Bulletin', type: 'MEDIA', faction: 'truth', rarity: 'common', cost: 3, effects: { truthDelta: 1 } };
const mount = () => renderHook(() => useGameState(), { wrapper: AchievementProvider });

describe('real hook turn guards', () => {
  it('rejects both play APIs during an opposing turn or newspaper and after game over', async () => {
    const { result } = mount();
    for (const blocked of [
      { currentPlayer: 'ai' as const, phase: 'ai_turn' as const },
      { currentPlayer: 'human' as const, phase: 'newspaper' as const },
      { currentPlayer: 'human' as const, phase: 'action' as const, isGameOver: true },
    ]) {
      act(() => result.current.setGameState(prev => ({ ...prev, ...blocked, hand: [card], ip: 10 })));
      const before = result.current.gameState;
      act(() => result.current.playCard(card.id));
      let animations = 0;
      await act(async () => {
        const response = await result.current.playCardAnimated(card.id, async () => { animations++; return { cancelled: false, countered: false }; });
        expect(response.cancelled).toBe(true);
      });
      expect(animations).toBe(0);
      expect(result.current.gameState).toBe(before);
    }
  });

  it('rejects concurrent plays and turn completion until the accepted animation finishes', async () => {
    const { result } = mount();
    act(() => result.current.setGameState(prev => ({ ...prev, hand: [card], ip: 10, phase: 'action', currentPlayer: 'human', editorRuntime: null, editorDef: null })));
    let finish!: (result: PlayResult) => void;
    const animation = new Promise<PlayResult>(resolve => { finish = resolve; });
    let pending!: Promise<PlayResult>;
    act(() => { pending = result.current.playCardAnimated(card.id, () => animation); });
    const afterResolution = result.current.gameState;
    await act(async () => {
      expect((await result.current.playCardAnimated(card.id, async () => ({ cancelled: false, countered: false }))).cancelled).toBe(true);
      result.current.endTurn();
    });
    expect(result.current.gameState).toBe(afterResolution);
    await act(async () => { finish({ cancelled: false, countered: false }); await pending; });
    expect(result.current.gameState.cardsPlayedThisTurn).toBe(1);
    expect(result.current.gameState.hand).toEqual([]);
    expect(result.current.gameState.ip).toBe(7);
  });

  it('keeps a rejected unaffordable play in hand without incrementing plays', async () => {
    const { result } = mount();
    act(() => result.current.setGameState(prev => ({ ...prev, hand: [card], ip: 0, editorRuntime: null, editorDef: null })));
    await act(async () => { expect((await result.current.playCardAnimated(card.id, async () => ({ cancelled: false, countered: false }))).cancelled).toBe(true); });
    expect(result.current.gameState.hand).toEqual([card]);
    expect(result.current.gameState.cardsPlayedThisTurn).toBe(0);
    expect(result.current.gameState.ip).toBe(0);
  });
  it('does not finish an old animation in a restarted game', async () => {
    const { result } = mount();
    act(() => result.current.setGameState(prev => ({ ...prev, hand: [card], ip: 10, editorRuntime: null, editorDef: null })));
    let finish!: (result: PlayResult) => void;
    let pending!: Promise<PlayResult>;
    const animation = new Promise<PlayResult>(resolve => { finish = resolve; });
    act(() => { pending = result.current.playCardAnimated(card.id, () => animation); });
    act(() => result.current.initGame('government'));
    const restarted = result.current.gameState;
    await act(async () => {
      finish({ cancelled: false, countered: false });
      expect((await pending).cancelled).toBe(true);
    });
    expect(result.current.gameState).toBe(restarted);
    expect(result.current.gameState.animating).toBe(false);
    expect(result.current.gameState.cardsPlayedThisTurn).toBe(0);
  });

  it('commits an accepted card once even if its presentation is interrupted', async () => {
    const { result } = mount();
    act(() => result.current.setGameState(prev => ({ ...prev, hand: [card], ip: 10, editorRuntime: null, editorDef: null })));
    await act(async () => {
      const response = await result.current.playCardAnimated(card.id, async () => ({ cancelled: true, countered: false }));
      expect(response.cancelled).toBe(false);
    });
    expect(result.current.gameState.hand).toEqual([]);
    expect(result.current.gameState.cardsPlayedThisTurn).toBe(1);
    expect(result.current.gameState.ip).toBe(7);
    expect(result.current.gameState.animating).toBe(false);
  });

});

describe('pressure cards through both live APIs', () => {
  for (const animated of [false, true]) {
    it(`uses the editor pressure once and captures at the previewed threshold (${animated ? 'animated' : 'direct'})`, async () => {
      const { result } = mount();
      const zone: GameCard = { ...card, id: 'pressure-proof', type: 'ZONE', faction: 'government', cost: 5, effects: { pressureDelta: 2 } };
      act(() => result.current.setGameState(prev => ({ ...prev, faction: 'government', hand: [zone], ip: 12, phase: 'action', currentPlayer: 'human', editorDef: null, editorRuntime: null, playerEditor: 'editor_redactor', playerEditorId: 'editor_redactor', editorId: 'editor_redactor', controlledStates: [], aiControlledStates: [], states: [{ ...prev.states[0], id: 'texas', abbreviation: 'TX', name: 'Texas', owner: 'neutral', pressurePlayer: 1, pressureAi: 0, pressure: 1, baseDefense: 4, defense: 4, paranormalHotspot: undefined }] })));
      expect(quoteHumanCard(result.current.gameState, zone)).toEqual({ cost: 5, pressure: 3 });
      await act(async () => {
        if (animated) await result.current.playCardAnimated(zone.id, async () => ({ cancelled: false, countered: false }), 'texas');
        else result.current.playCard(zone.id, 'TX');
      });
      expect(result.current.gameState.states[0].owner).toBe('player');
      expect(result.current.gameState.states[0].pressurePlayer).toBe(0);
      expect(result.current.gameState.hand).toEqual([]);
      expect(result.current.gameState.cardsPlayedThisTurn).toBe(1);
      expect(result.current.gameState.cardsPlayedThisRound[0].capturedStates).toContain('Texas');
    });
  }
  it('rejects missing, owned and invalid pressure targets before either API spends resources', async () => {
    const { result } = mount();
    const zone: GameCard = { ...card, type: 'ZONE', effects: { pressureDelta: 2 } };
    act(() => result.current.setGameState(prev => ({ ...prev, hand: [zone], ip: 12, targetState: null, phase: 'action', currentPlayer: 'human', states: [{ ...prev.states[0], id: 'texas', abbreviation: 'TX', name: 'Texas', owner: 'player' }] })));
    for (const target of [undefined, 'missing', 'texas']) {
      const before = result.current.gameState;
      act(() => result.current.playCard(zone.id, target));
      await act(async () => { expect((await result.current.playCardAnimated(zone.id, async () => ({ cancelled: false, countered: false }), target)).cancelled).toBe(true); });
      expect(result.current.gameState).toBe(before);
    }
  });
});

describe('live completed-round newspaper contract', () => {
  it('uses the resolved round even after the engine advances to the incoming round', () => {
    const { result } = mount();
    act(() => result.current.setGameState(prev => ({ ...prev, round: 7, hand: [card], ip: 10, truth: 50, phase: 'action', currentPlayer: 'human', editorRuntime: null, editorDef: null })));
    act(() => result.current.playCard(card.id));
    act(() => result.current.setGameState(prev => ({ ...prev, currentPlayer: 'ai', phase: 'ai_turn' })));
    act(() => result.current.endTurn());
    const state = result.current.gameState;
    expect(state.round).toBe(8);
    expect(state.phase).toBe('newspaper');
    const edition = composeRoundEdition(state.cardsPlayedThisRound, state.currentEvents, completedRoundNumber(state.round), state.faction);
    expect(edition.round).toBe(7);
    expect(edition.sources.map(source => source.id)).toContain(card.id);
    expect(edition.headline).not.toBe('NOTHING HAPPENED. OFFICIALLY.');
  });
});
