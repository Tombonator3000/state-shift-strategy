import React, { useState, type ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MobileBattleLayout } from '@/components/game/mobile/MobileBattleLayout';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import * as audioContext from '@/contexts/AudioContext';
import type { GameCard } from '@/rules/mvp';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';

const media: GameCard = { id: 'mobile-media', name: 'Newsroom source', type: 'MEDIA', faction: 'truth', rarity: 'common', cost: 3, effects: { truthDelta: 4 }, text: 'Full rules remain available in the card dossier.' };
const zone: GameCard = { ...media, id: 'mobile-zone', name: 'Field report', type: 'ZONE', effects: { pressureDelta: 2 } };
const states: ComponentProps<typeof MobileBattleLayout>['states'] = [
  { id: 'california', abbreviation: 'CA', name: 'California', owner: 'player', defense: 5, pressurePlayer: 5, pressureAi: 0, baseIP: 3 },
  { id: 'texas', abbreviation: 'TX', name: 'Texas', owner: 'ai', defense: 4, pressurePlayer: 1, pressureAi: 4, baseIP: 2 },
  { id: 'maine', abbreviation: 'ME', name: 'Maine', owner: 'neutral', defense: 2, pressurePlayer: 0, pressureAi: 0, baseIP: 1 },
];
const record: CardPlayRecord = { card: media, player: 'human', faction: 'truth', targetState: null, truthDelta: 4, ipDelta: -3, aiIpDelta: 0, capturedStates: [], capturedStateIds: [], damageDealt: 0, round: 1, turn: 1, timestamp: 1, logEntries: [] };
let audioSpy: ReturnType<typeof spyOn>;
beforeEach(() => { audioSpy = spyOn(audioContext, 'useAudioContext').mockReturnValue({ playSFX: () => {} } as ReturnType<typeof audioContext.useAudioContext>); });
afterEach(() => { cleanup(); audioSpy.mockRestore(); });

function Battle({ playsUsed = 0, locked = false, playedCards = [], onTarget = () => {}, onEndTurn = () => {}, onInspect = () => {} }: {
  playsUsed?: number; locked?: boolean; playedCards?: CardPlayRecord[];
  onTarget?: (id: string) => void; onEndTurn?: () => void; onInspect?: (card: GameCard) => void;
}) {
  const [target, setTarget] = useState<string | null>(null);
  const [discards, setDiscards] = useState<string[]>([]);
  return <MobileBattleLayout round={1} faction="truth" ip={10} rivalIP={12} truth={50}
    states={states} playsUsed={playsUsed} handCount={2} discardCount={discards.length} discardCost={0}
    aiTurn={locked} locked={locked} resolving={false} targetCard={target ? zone : null} playedCards={playedCards}
    board={<div>Map remains available</div>} briefing={<p>Victory objectives</p>}
    menu={close => <button onClick={close}>Game settings</button>}
    hand={<EnhancedGameHand compact cards={[media, zone]} currentIP={10} selectedCard={target}
      disabled={locked || playsUsed >= 3} discardEnabled={!locked} discardQueue={discards}
      onToggleDiscard={id => setDiscards(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id])}
      onSelectCard={setTarget} onPlayCard={() => {}} />}
    onStateClick={onTarget} onCancelTarget={() => setTarget(null)} onInspectPlayed={onInspect} onEndTurn={onEndTurn} />;
}

describe('mobile battle actions', () => {
  it('opens large searchable targets from the real card inspector and rejects owned states', async () => {
    const targets: string[] = [];
    render(<Battle onTarget={id => targets.push(id)} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${zone.name}, 3 IP` }));
    expect(within(screen.getByRole('dialog')).getByText(zone.text!)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Select & target' }));
    await waitFor(() => expect(screen.getByRole('tab', { name: 'States' }).getAttribute('aria-selected')).toBe('true'));
    expect(screen.queryByRole('dialog')).toBeNull();
    const owned = screen.getByRole('button', { name: 'California, already yours' }) as HTMLButtonElement;
    expect(owned.disabled).toBe(true);
    fireEvent.click(owned);
    expect(targets).toEqual([]);
    expect((screen.getByRole('button', { name: /End turn/ }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Find a state' }), { target: { value: 'TX' } });
    fireEvent.click(screen.getByRole('button', { name: 'Target Texas' }));
    expect(targets).toEqual(['texas']);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect((screen.getByRole('button', { name: /End turn/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('keeps discard available after all three plays and shows its turn-end cost', () => {
    render(<Battle playsUsed={3} />);
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${media.name}, 3 IP` }));
    const dialog = within(screen.getByRole('dialog'));
    expect((dialog.getByRole('button', { name: 'Deploy asset' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(dialog.getByRole('button', { name: 'Discard at turn end' }));
    expect(screen.getByText('1 queued to discard · free at turn end')).toBeTruthy();
    expect(screen.getByText('Ready to print')).toBeTruthy();
    expect(screen.getByLabelText('0 of 3 card plays remaining')).toBeTruthy();
  });

  it('prevents turn end and discard during the rival turn', () => {
    let ended = 0;
    render(<Battle locked onEndTurn={() => ended++} />);
    const end = screen.getByRole('button', { name: 'Please wait' }) as HTMLButtonElement;
    expect(end.disabled).toBe(true);
    fireEvent.click(end);
    expect(ended).toBe(0);
    expect(screen.getByText('Rival turn')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: `Inspect ${media.name}, 3 IP` }));
    expect((screen.getByRole('button', { name: 'Discard at turn end' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('offers state details without playing a card and one working end-turn action', async () => {
    let ended = 0;
    render(<Battle onEndTurn={() => ended++} />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'States' }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole('button', { name: 'Inspect Texas' }));
    expect(screen.getByText(/Your pressure: 1 · Rival pressure: 4 · Defense: 4/)).toBeTruthy();
    const end = screen.getAllByRole('button', { name: /End turn/ });
    expect(end).toHaveLength(1);
    fireEvent.click(end[0]);
    expect(ended).toBe(1);
  });

  it('keeps actual results in the receipt and opens played cards for inspection', async () => {
    const inspected: string[] = [];
    render(<Battle playedCards={[record]} onInspect={card => inspected.push(card.id)} />);
    expect(screen.getByText('+4% truth')).toBeTruthy();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Played/ }), { button: 0, ctrlKey: false });
    const history = await screen.findByRole('tabpanel');
    fireEvent.click(within(history).getByRole('button', { name: /Newsroom source/ }));
    expect(inspected).toEqual([media.id]);
    expect(screen.getByText(/Truth \+4 · Your IP -3 · Nationwide/)).toBeTruthy();
  });

  it('opens labelled briefing and menu panels and closes on a menu action', async () => {
    render(<Battle />);
    const briefingButton = screen.getByRole('button', { name: 'Truth 50 percent. View objectives' });
    briefingButton.focus();
    fireEvent.click(briefingButton);
    expect(screen.getByRole('dialog', { name: 'Your briefing' })).toBeTruthy();
    expect(screen.getByText('Victory objectives')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(briefingButton));
    fireEvent.click(screen.getByRole('button', { name: 'Open game menu' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Newsroom menu' })).getByRole('button', { name: 'Game settings' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
