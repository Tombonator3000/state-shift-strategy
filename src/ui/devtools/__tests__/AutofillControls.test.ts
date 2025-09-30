import { describe, expect, test } from 'bun:test';
import { isLockedOrOfficial } from '../AutofillControls';
import type { ManifestEntry } from '@/services/assets/types';

describe('isLockedOrOfficial', () => {
  const buildEntry = (overrides: Partial<ManifestEntry> = {}): ManifestEntry => ({
    key: overrides.key ?? 'card-1',
    scope: overrides.scope ?? 'card',
    url: overrides.url ?? 'https://example.test/image.png',
    styledUrl: overrides.styledUrl ?? 'https://example.test/styled.png',
    provider: overrides.provider ?? 'wikimedia',
    credit: overrides.credit,
    license: overrides.license,
    locked: overrides.locked ?? false,
    tags: overrides.tags ?? [],
    thumbnailUrl: overrides.thumbnailUrl,
    metadata: overrides.metadata,
    updatedAt: overrides.updatedAt ?? 0,
    source: overrides.source ?? 'download',
  });

  test('returns false when entry is missing', () => {
    expect(isLockedOrOfficial(null)).toBe(false);
    expect(isLockedOrOfficial(undefined)).toBe(false);
  });

  test('returns true when entry is locked', () => {
    const entry = buildEntry({ locked: true });
    expect(isLockedOrOfficial(entry)).toBe(true);
  });

  test('returns true when entry comes from the official source', () => {
    const entry = buildEntry({ source: 'official' });
    expect(isLockedOrOfficial(entry)).toBe(true);
  });

  test('returns true when entry is provided by the official provider', () => {
    const entry = buildEntry({ provider: 'official' });
    expect(isLockedOrOfficial(entry)).toBe(true);
  });

  test('returns false when entry is unlocked and unofficial', () => {
    const entry = buildEntry({ locked: false, source: 'download', provider: 'wikimedia' });
    expect(isLockedOrOfficial(entry)).toBe(false);
  });
});
