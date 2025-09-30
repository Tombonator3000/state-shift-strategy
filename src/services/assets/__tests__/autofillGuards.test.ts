import { describe, expect, test } from 'bun:test';
import { shouldAutofillAsset } from '../autofillGuards';

describe('shouldAutofillAsset', () => {
  test('returns false when an image is already provided', () => {
    expect(shouldAutofillAsset('https://example.test/already-set.png')).toBe(false);
  });

  test('returns true when the image is missing', () => {
    expect(shouldAutofillAsset(undefined)).toBe(true);
    expect(shouldAutofillAsset(null)).toBe(true);
  });

  test('treats blank image strings as missing', () => {
    expect(shouldAutofillAsset('   ')).toBe(true);
  });
});
