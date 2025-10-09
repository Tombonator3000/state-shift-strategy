import { describe, expect, it } from 'bun:test';

import { getBanterBank, listBanterLocales } from '@/ai/banter';
import { EDITOR_IDS } from '@/ai/editors';
import { createEmptyCooldownState, tryConsumeBanterTrigger } from '@/ai/banter/triggerController';

describe('AI banter banks', () => {
  it('loads every registered bank for each locale', () => {
    const locales = listBanterLocales();
    expect(locales.length).toBeGreaterThan(0);
    for (const locale of locales) {
      for (const editorId of EDITOR_IDS) {
        const bank = getBanterBank(editorId, locale);
        expect(bank).not.toBeNull();
        expect(bank?.editorId).toBe(editorId);
        expect(bank?.locale).toBe(locale);
        expect(bank?.schemaVersion).toBeGreaterThanOrEqual(1);
        const categories = bank?.categories ?? {};
        const entries = Object.entries(categories);
        expect(entries.length).toBeGreaterThan(0);
        for (const [category, lines] of entries) {
          expect(typeof category).toBe('string');
          expect(Array.isArray(lines)).toBe(true);
          expect(lines.length).toBeGreaterThan(0);
          for (const line of lines) {
            expect(typeof line).toBe('string');
            expect(line.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('enforces minTurnGap and maxPerTurn when emitting banter', () => {
    const cooldown = createEmptyCooldownState();
    const gapRequest = { category: 'victory', minTurnGap: 2 } as const;

    const first = tryConsumeBanterTrigger(cooldown, gapRequest, 5);
    expect(first.emitted).toBe(true);
    const blocked = tryConsumeBanterTrigger(cooldown, gapRequest, 6);
    expect(blocked.emitted).toBe(false);
    expect(blocked.reason).toBe('cooldown');
    const allowed = tryConsumeBanterTrigger(cooldown, gapRequest, 7);
    expect(allowed.emitted).toBe(true);

    const perTurnCooldown = createEmptyCooldownState();
    const perTurnRequest = { category: 'idle', maxPerTurn: 2 } as const;

    const firstIdle = tryConsumeBanterTrigger(perTurnCooldown, perTurnRequest, 3);
    expect(firstIdle.emitted).toBe(true);
    const secondIdle = tryConsumeBanterTrigger(perTurnCooldown, perTurnRequest, 3);
    expect(secondIdle.emitted).toBe(true);
    const thirdIdle = tryConsumeBanterTrigger(perTurnCooldown, perTurnRequest, 3);
    expect(thirdIdle.emitted).toBe(false);
    expect(thirdIdle.reason).toBe('perTurnLimit');

    // next turn resets the per-turn allowance
    const newTurn = tryConsumeBanterTrigger(perTurnCooldown, perTurnRequest, 4);
    expect(newTurn.emitted).toBe(true);
  });
});
