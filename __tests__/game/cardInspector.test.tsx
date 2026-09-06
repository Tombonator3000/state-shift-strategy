import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import * as audioContext from '@/contexts/AudioContext';
import type { GameCard } from '@/rules/mvp';

const card: GameCard = {
  id: 'inspector-test', name: 'Inspector test asset', type: 'MEDIA', faction: 'truth',
  rarity: 'common', cost: 3, effects: { truthDelta: 4 },
  text: 'Complete rules text remains available, including the last sentence.',
  flavor: 'The final line of this test dossier must remain readable.',
};

const originalWidth = window.innerWidth;
let audioSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  audioSpy = spyOn(audioContext, 'useAudioContext').mockReturnValue({
    playSFX: () => {},
  } as ReturnType<typeof audioContext.useAudioContext>);
});

afterEach(() => {
  cleanup();
  audioSpy.mockRestore();
  localStorage.removeItem('sg_ui_theme');
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
});

function InspectorHarness() {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)}>Inspect asset</button>
    <button>Background action</button>
    {open && <CardDetailOverlay card={card} canAfford disabled={false} onClose={() => setOpen(false)} onPlayCard={() => {}} articleAvailable onRequestArticle={() => {}} />}
  </>;
}

describe('card inspection and hand flow', () => {
  for (const theme of ['tabloid_bw', 'government_classic']) {
    it(`keeps full rules and intelligence in a labelled ${theme} dialog`, () => {
      localStorage.setItem('sg_ui_theme', theme);
      render(<CardDetailOverlay card={card} canAfford disabled={false} onClose={() => {}} onPlayCard={() => {}} />);
      const dialog = screen.getByRole('dialog', { name: card.name });
      expect(within(dialog).getByText(card.text!)).toBeTruthy();
      expect(within(dialog).getByText(card.flavor!)).toBeTruthy();
      expect(within(dialog).getByRole('region', { name: 'Card effect and intelligence' })).toBeTruthy();
    });
  }

  it('moves focus into the inspector, traps Tab, and restores the opener after Escape', async () => {
    render(<InspectorHarness />);
    const opener = screen.getByRole('button', { name: 'Inspect asset' });
    opener.focus();
    fireEvent.click(opener);
    const close = screen.getByRole('button', { name: 'Close card details' });
    await waitFor(() => expect(document.activeElement).toBe(close));
    const lastAction = screen.getByRole('button', { name: 'Read article' });
    lastAction.focus();
    fireEvent.keyDown(lastAction, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastAction);
    fireEvent.keyDown(lastAction, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it('can queue a discard through the real hand inspector after deployment is locked', () => {
    const discards: string[] = [];
    render(<EnhancedGameHand cards={[card]} currentIP={10} disabled discardEnabled onToggleDiscard={id => discards.push(id)} onPlayCard={() => { throw new Error('Must not deploy'); }} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${card.name}, 3 IP` }));
    const dialog = within(screen.getByRole('dialog', { name: card.name }));
    expect((dialog.getByRole('button', { name: 'Deploy asset' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(dialog.getByRole('button', { name: 'Discard at turn end' }));
    expect(discards).toEqual([card.id]);
  });

  it('respects the separate discard lock during an opposing turn', () => {
    const discards: string[] = [];
    render(<EnhancedGameHand cards={[card]} currentIP={10} disabled discardEnabled={false} onToggleDiscard={id => discards.push(id)} onPlayCard={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${card.name}, 3 IP` }));
    const discard = within(screen.getByRole('dialog')).getByRole('button', { name: 'Discard at turn end' }) as HTMLButtonElement;
    expect(discard.disabled).toBe(true);
    fireEvent.click(discard);
    expect(discards).toEqual([]);
  });

  it('does not deploy an unaffordable card but still allows its free discard', () => {
    const discards: string[] = [];
    render(<EnhancedGameHand cards={[card]} currentIP={0} discardEnabled onToggleDiscard={id => discards.push(id)} onPlayCard={() => { throw new Error('Must not deploy'); }} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${card.name}, 3 IP` }));
    const dialog = within(screen.getByRole('dialog'));
    expect((dialog.getByRole('button', { name: 'Deploy asset' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(dialog.getByRole('button', { name: 'Discard at turn end' }));
    expect(discards).toEqual([card.id]);
  });

  it('keeps the mobile inspector open on vertical gestures and browses horizontally', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const second: GameCard = { ...card, id: 'inspector-second', name: 'Second asset' };
    render(<EnhancedGameHand cards={[card, second]} currentIP={10} onPlayCard={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${card.name}, 3 IP` }));
    const art = within(screen.getByRole('dialog')).getByRole('img');
    fireEvent.touchStart(art, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(art, { changedTouches: [{ clientX: 200, clientY: 200 }] });
    expect(screen.getByRole('dialog', { name: card.name })).toBeTruthy();
    fireEvent.touchStart(art, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(art, { changedTouches: [{ clientX: 80, clientY: 100 }] });
    expect(screen.getByRole('dialog', { name: second.name })).toBeTruthy();
  });

  it('closes the inspector immediately when selecting a ZONE target', () => {
    const zone: GameCard = { ...card, type: 'ZONE', effects: { pressureDelta: 2 } };
    const selected: string[] = [];
    render(<EnhancedGameHand cards={[zone]} currentIP={10} onSelectCard={id => selected.push(id)} onPlayCard={() => { throw new Error('Target required'); }} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${card.name}, 3 IP` }));
    fireEvent.click(screen.getByRole('button', { name: 'Select & target' }));
    expect(selected).toEqual([card.id]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
