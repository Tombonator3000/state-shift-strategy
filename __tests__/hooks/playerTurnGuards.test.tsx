import { afterEach, describe, expect, it } from 'bun:test';
import { act, cleanup, renderHook } from '@testing-library/react';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { useGameState } from '@/hooks/useGameState';
import type { GameCard } from '@/rules/mvp';
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
