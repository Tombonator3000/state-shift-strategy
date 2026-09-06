import { describe, it, expect } from 'bun:test';
import { applyPwaUpdate } from '@/utils/pwaUpdate';

describe('PWA update activation', () => {
  it('reloads when autoUpdate already activated the worker', async () => {
    let reloads = 0;
    await applyPwaUpdate({ waiting: null }, new EventTarget(), () => reloads++);
    expect(reloads).toBe(1);
  });
  it('waits for activation before reloading and ignores duplicate activation events', async () => {
    let reloads = 0;
    const workers = new EventTarget();
    const messages: unknown[] = [];
    const waiting = { postMessage: (message: unknown) => messages.push(message) } as ServiceWorker;
    const pending = applyPwaUpdate({ waiting }, workers, () => reloads++);
    expect(reloads).toBe(0);
    expect(messages).toEqual([{ type: 'SKIP_WAITING' }]);
    workers.dispatchEvent(new Event('controllerchange'));
    await pending;
    workers.dispatchEvent(new Event('controllerchange'));
    expect(reloads).toBe(1);
  });
});
