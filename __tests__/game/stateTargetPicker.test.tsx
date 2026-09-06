import React, { useState } from 'react';
import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StateTargetPicker } from '@/components/newsroom/StateTargetPicker';
import { requiresStateTarget, validStateTarget } from '@/game/stateTargeting';
const card = { id: 'TRUTH-007', name: 'UFO over high school', type: 'ZONE' as const, faction: 'truth' as const, cost: 5, effects: { pressureDelta: 2 } };
const states = [{ id: 'texas', name: 'Texas', abbreviation: 'TX', owner: 'ai' as const, defense: 4, pressurePlayer: 1 }, { id: 'maine', name: 'Maine', abbreviation: 'ME', owner: 'player' as const, defense: 2, pressurePlayer: 0 }];
afterEach(cleanup);
function Picker({ confirm, cancel = () => {}, ip = 12, locked = false }: { confirm: (id: string) => Promise<void>; cancel?: () => void; ip?: number; locked?: boolean }) {
  const [target, setTarget] = useState<string | null>(null);
  return <StateTargetPicker open card={card} states={states} ip={ip} cost={5} pressure={2} locked={locked} targetId={target} onTarget={setTarget} onConfirm={confirm} onCancel={cancel} onMap={() => {}} />;
}
describe('state targeting intent', () => {
  it('accepts canonical IDs, names and abbreviations and rejects owned or nonexistent states', () => {
    for (const id of ['texas', 'TX', ' Texas ']) expect(validStateTarget(states, id)?.id).toBe('texas');
    expect(validStateTarget(states, 'ME')).toBeNull(); expect(validStateTarget(states, 'missing')).toBeNull();
    expect(requiresStateTarget({ ...card, type: 'HYBRID' })).toBe(true);
  });
  it('only confirms after a valid selection and reports pressure below defense correctly', async () => {
    const played: string[] = []; render(<Picker confirm={async id => { played.push(id); }} />);
    const confirm = screen.getByRole('button', { name: 'Confirm · 5 IP' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Find a state' }), { target: { value: 'TX' } });
    fireEvent.click(screen.getByRole('button', { name: /Texas/ })); expect(played).toEqual([]);
    expect(screen.getByText('Texas: 1 → 3 pressure')).toBeTruthy(); expect(screen.getByText(/1 more pressure needed/)).toBeTruthy(); expect(screen.getByText('Your IP: 12 → 7')).toBeTruthy();
    fireEvent.click(confirm); expect(played).toEqual(['texas']);
  });
  it('cancel, insufficient funds and locked turns never deploy', () => {
    let played = 0; let cancelled = 0;
    render(<Picker ip={4} confirm={async () => { played++; }} cancel={() => cancelled++} />);
    fireEvent.click(screen.getByRole('button', { name: /Texas/ })); fireEvent.click(screen.getByRole('button', { name: 'Confirm · 5 IP' })); fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(played).toBe(0); expect(cancelled).toBe(1);
    cleanup(); render(<Picker locked confirm={async () => { played++; }} />); expect((screen.getByRole('button', { name: /Texas/ }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('deduplicates rapid confirmations while resolution is pending', () => {
    let played = 0; render(<Picker confirm={() => { played++; return new Promise(() => {}); }} />);
    fireEvent.click(screen.getByRole('button', { name: /Texas/ }));
    const confirm = screen.getByRole('button', { name: 'Confirm · 5 IP' }); fireEvent.click(confirm); fireEvent.click(confirm); expect(played).toBe(1);
  });
});
