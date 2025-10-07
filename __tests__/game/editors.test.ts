import { describe, expect, it } from 'bun:test';
import { describeEditorEffect } from '../../src/game/editors';

describe('describeEditorEffect', () => {
  it('returns an empty list for undefined input', () => {
    expect(describeEditorEffect(undefined)).toEqual([]);
  });

  it('returns an empty list for null input', () => {
    expect(describeEditorEffect(null)).toEqual([]);
  });
});
