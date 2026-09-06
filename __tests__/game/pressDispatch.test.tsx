import React from 'react';
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as audioContext from '@/contexts/AudioContext';
import { PressDispatchTray } from '@/components/newsroom/PressDispatchTray';
import type { PressDispatch } from '@/systems/news/pressDispatch';
let spy: ReturnType<typeof spyOn>;
beforeEach(() => { spy = spyOn(audioContext, 'useAudioContext').mockReturnValue({ playSFX: () => {} } as ReturnType<typeof audioContext.useAudioContext>); });
afterEach(() => { cleanup(); spy.mockRestore(); });
const combo: PressDispatch = { id: 'combo:7:human:cryptids', kind: 'combo', title: 'Cryptid Summit', outcome: '+1 IP, +1 Truth', body: ['Bigfoot and Mothman jointly request a press pass.'], sources: [{ id: 'TRUTH-001', name: 'Bigfoot photo' }, { id: 'TRUTH-040', name: 'Mothman warning' }] };
const extra: PressDispatch = { ...combo, id: 'next', title: 'A second dispatch', kind: 'breaking' };
describe('one press queue', () => {
  it('deduplicates events, presents one clipping at a time, and keeps dismissed clippings readable', () => {
    render(<PressDispatchTray records={[]} />);
    act(() => { for (const item of [combo, combo, extra]) window.dispatchEvent(new CustomEvent('press-dispatch', { detail: item })); });
    expect(screen.getByRole('heading', { name: 'Cryptid Summit' })).toBeTruthy(); expect(screen.queryByRole('heading', { name: 'A second dispatch' })).toBeNull();
    expect(screen.getByText('+1 IP, +1 Truth')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss dispatch' })); expect(screen.getByRole('heading', { name: 'A second dispatch' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Dispatches/ })); expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Cryptid Summit/ })); expect(screen.getByText('Bigfoot and Mothman jointly request a press pass.')).toBeTruthy();
    expect(screen.getByText('Bigfoot photo')).toBeTruthy(); expect(screen.getByText('Mothman warning')).toBeTruthy();
  });
  it('holds presentation while the newspaper or target picker is open', () => {
    const { rerender } = render(<PressDispatchTray records={[]} suspended />);
    act(() => window.dispatchEvent(new CustomEvent('press-dispatch', { detail: combo })));
    expect(screen.queryByRole('complementary')).toBeNull();
    rerender(<PressDispatchTray records={[]} suspended={false} />); expect(screen.getByRole('heading', { name: 'Cryptid Summit' })).toBeTruthy();
  });
});

it('opens the persistent archive from the mobile menu event', () => {
  render(<PressDispatchTray records={[]} />);
  act(() => window.dispatchEvent(new Event('open-press-archive')));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'The dispatch archive' })).toBeTruthy();
});
