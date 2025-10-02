import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import {
  queueHotspotExpireToast,
  queueHotspotResolveToast,
  queueHotspotSpawnToast,
} from '../hotspots.toasts';
import type { Hotspot } from '@/systems/paranormalHotspots';

describe('hotspot toast formatting', () => {
  const emitted: string[] = [];
  const originalEmitter = typeof window !== 'undefined'
    ? (window as unknown as { uiComboToast?: (message: string) => void }).uiComboToast
    : undefined;

  beforeEach(() => {
    emitted.length = 0;
    if (typeof window === 'undefined') {
      (globalThis as unknown as { window: Window }).window = globalThis as unknown as Window;
    }
    (window as unknown as { uiComboToast?: (message: string) => void }).uiComboToast = (message: string) => {
      emitted.push(message);
    };
  });

  afterEach(() => {
    emitted.length = 0;
    if (originalEmitter) {
      (window as unknown as { uiComboToast?: (message: string) => void }).uiComboToast = originalEmitter;
    } else {
      delete (window as unknown as { uiComboToast?: (message: string) => void }).uiComboToast;
    }
  });

  const sampleHotspot: Hotspot = {
    id: 'test-hotspot',
    name: 'Cascade Rift',
    kind: 'normal',
    location: 'Washington',
    intensity: 5,
    status: 'spawning',
    tags: ['auto-spawn'],
    icon: '👻',
    expansionTag: undefined,
    stateId: '53',
    stateName: 'Washington',
    stateAbbreviation: 'WA',
    totalWeight: 1,
    weightBreakdown: { base: 1, catalog: 0, type: 0, expansion: 0, cryptid: 0 },
    truthDelta: 4,
  };

  it('emits spawn toast with UFO icon and intensity', () => {
    queueHotspotSpawnToast(sampleHotspot);
    expect(emitted).toEqual([
      '🛸 Hotspot detected: Cascade Rift — Washington (Intensity 5)',
    ]);
  });

  it('emits resolve toast with checkmark icon and truth delta', () => {
    queueHotspotResolveToast({ ...sampleHotspot, truthDelta: 6 });
    expect(emitted).toEqual([
      '✅ Hotspot neutralized: Cascade Rift — Washington (+6% Truth)',
    ]);
  });

  it('emits expire toast with cloud icon', () => {
    queueHotspotExpireToast({ ...sampleHotspot, truthDelta: -3 });
    expect(emitted).toEqual([
      '☁️ Hotspot dispersed: Cascade Rift — Washington (-3% Truth)',
    ]);
  });
});
