import { describe, expect, test } from 'bun:test';
import { filterLicensed } from '../AssetResolver';
import type { AssetCandidate } from '../types';

describe('filterLicensed', () => {
  const buildCandidate = (overrides: Partial<AssetCandidate> = {}): AssetCandidate => ({
    id: overrides.id ?? 'id',
    url: overrides.url ?? 'https://example.test/image.png',
    provider: overrides.provider ?? 'wikimedia',
    license: overrides.license,
    credit: overrides.credit,
    tags: overrides.tags,
    locked: overrides.locked,
    confidence: overrides.confidence,
    metadata: overrides.metadata,
  });

  test('retains official assets without license metadata', () => {
    const candidates = [
      buildCandidate({ id: 'official-1', provider: 'official', license: undefined }),
    ];

    const result = filterLicensed(candidates, 'official');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('official-1');
  });

  test('removes unlicensed third-party assets', () => {
    const originalWarn = console.warn;
    const messages: unknown[] = [];
    console.warn = (...args: unknown[]) => {
      messages.push(args);
    };

    try {
      const candidates = [
        buildCandidate({ id: 'missing-license', provider: 'wikimedia', license: undefined }),
      ];

      const result = filterLicensed(candidates, 'wikimedia');
      expect(result).toHaveLength(0);
      expect(messages.length).toBeGreaterThan(0);
    } finally {
      console.warn = originalWarn;
    }
  });

  test('keeps assets whose licenses match the allowlist', () => {
    const candidates = [
      buildCandidate({
        id: 'cc-by',
        provider: 'wikimedia',
        license: 'Creative Commons Attribution-ShareAlike 4.0 International',
      }),
      buildCandidate({ id: 'restricted', provider: 'wikimedia', license: 'All Rights Reserved' }),
    ];

    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const result = filterLicensed(candidates, 'wikimedia');
      expect(result.map(candidate => candidate.id)).toEqual(['cc-by']);
      expect(result[0]?.license).toContain('Creative Commons');
    } finally {
      console.warn = originalWarn;
    }
  });
});
