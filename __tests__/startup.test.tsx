import React from 'react';
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { AppErrorBoundary, AppStartup } from '@/components/AppStartup';
import { PWAPrompt } from '@/components/pwa/PWAPrompt';
import { initializeUiScaleFromStorage } from '@/lib/startupSettings';
import { areMapVfxEnabled, areParanormalEffectsEnabled } from '@/state/settings';
import { safeSetSessionStorageItem } from '@/utils/storage';

const descriptors = {
  localStorage: Object.getOwnPropertyDescriptor(window, 'localStorage'),
  sessionStorage: Object.getOwnPropertyDescriptor(window, 'sessionStorage'),
};
const originalSettings = window.localStorage.getItem('gameSettings');
const originalScale = document.documentElement.style.getPropertyValue('--ui-scale');
const restores: (() => void)[] = [];

afterEach(() => {
  cleanup();
  restores.splice(0).reverse().forEach(restore => restore());
  for (const kind of ['localStorage', 'sessionStorage'] as const) {
    const descriptor = descriptors[kind];
    if (descriptor) Object.defineProperty(window, kind, descriptor);
    else Reflect.deleteProperty(window, kind);
  }
  if (originalSettings === null) window.localStorage.removeItem('gameSettings');
  else window.localStorage.setItem('gameSettings', originalSettings);
  document.documentElement.style.setProperty('--ui-scale', originalScale);
});

const silence = (method: 'warn' | 'error') => {
  const spy = spyOn(console, method).mockImplementation(() => {});
  restores.push(() => spy.mockRestore());
};

describe('startup recovery', () => {
  it('keeps loading visible until initialization finishes', async () => {
    let finish!: () => void;
    const initialize = mock(() => new Promise<void>(resolve => { finish = resolve; }));
    render(<AppStartup initialize={initialize}><p>Game ready</p></AppStartup>);
    expect(screen.getByRole('status').textContent).toContain('Loading');
    expect(screen.queryByText('Game ready')).toBeNull();
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
    await act(async () => { finish(); });
    expect(screen.getByText('Game ready')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('offers reload when initialization remains pending', async () => {
    const originalTimer = globalThis.setTimeout;
    let signalSlow: (() => void) | undefined;
    const timerSpy = spyOn(globalThis, 'setTimeout').mockImplementation((callback, delay, ...args) => {
      if (delay === 8000) signalSlow = callback as () => void;
      return originalTimer(callback, delay, ...args);
    });
    restores.push(() => timerSpy.mockRestore());
    render(<AppStartup initialize={() => new Promise(() => {})}><p>Game ready</p></AppStartup>);
    act(() => signalSlow?.());
    expect(screen.getByRole('status').textContent).toContain('longer than expected');
    expect(screen.getByRole('button', { name: 'Reload game' })).toBeTruthy();
  });

  for (const synchronous of [false, true]) {
    it(`shows a persistent recovery message for ${synchronous ? 'synchronous' : 'asynchronous'} initialization failure`, async () => {
      silence('error');
      const initialize = () => {
        if (synchronous) throw new Error('startup unavailable');
        return Promise.reject(new Error('startup unavailable'));
      };
      render(<AppStartup initialize={initialize}><p>Game ready</p></AppStartup>);
      await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not continue'));
      expect(screen.getByRole('button', { name: 'Reload game' })).toBeTruthy();
      expect(screen.queryByText('Game ready')).toBeNull();
    });
  }

  it('catches a rendering failure after startup', () => {
    silence('error');
    const BrokenGame = (): React.ReactNode => { throw new Error('render failed'); };
    render(<AppErrorBoundary><BrokenGame /></AppErrorBoundary>);
    expect(screen.getByRole('alert').textContent).toContain('could not continue');
  });

  it('continues with defaults when the localStorage getter throws', () => {
    silence('warn');
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    expect(() => initializeUiScaleFromStorage()).not.toThrow();
    expect(areMapVfxEnabled()).toBe(true);
    expect(areParanormalEffectsEnabled()).toBe(true);
  });

  it('ignores malformed settings and restores a valid display scale', () => {
    silence('warn');
    for (const bad of ['{bad json', 'null', '42', '[]']) {
      window.localStorage.setItem('gameSettings', bad);
      expect(() => initializeUiScaleFromStorage()).not.toThrow();
    }
    window.localStorage.setItem('gameSettings', JSON.stringify({ uiScale: 125 }));
    initializeUiScaleFromStorage();
    expect(document.documentElement.style.getPropertyValue('--ui-scale')).toBe('1.25');
  });

  it('does not crash the PWA prompt when session storage is denied', () => {
    silence('warn');
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    expect(() => render(<PWAPrompt />)).not.toThrow();
    expect(safeSetSessionStorageItem('pwa-install-dismissed', 'true')).toBe(false);
  });
});
