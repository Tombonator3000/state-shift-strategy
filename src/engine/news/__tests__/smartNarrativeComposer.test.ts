/**
 * Tests for SmartNarrativeComposer
 *
 * Demonstrates how the system generates coherent narratives
 * when multiple cards are played together.
 */

import { describe, it, expect } from 'bun:test';
import {
  composeSmartNarrative,
  detectThematicCombo,
  type CardPlayContext,
} from '../smartNarrativeComposer';
import type { Card } from '@/types';

const createMockCard = (overrides: Partial<Card> & { id: string; name: string }): Card => ({
  id: overrides.id,
  name: overrides.name,
  type: overrides.type ?? 'MEDIA',
  faction: overrides.faction ?? 'truth',
  cost: overrides.cost ?? 3,
  rarity: overrides.rarity ?? 'common',
  effects: overrides.effects ?? {},
  ...overrides,
} as Card);

describe('SmartNarrativeComposer', () => {
  describe('composeSmartNarrative', () => {
    it('generates narrative for 2 truth cards', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TEST-TRUTH-UFO-001',
            name: 'UFO Sighting',
            type: 'MEDIA',
            faction: 'truth',
            tags: ['ufo', 'alien'],
          } as any),
          player: 'human',
          truthDelta: 5,
        },
        {
          card: createMockCard({
            id: 'TEST-TRUTH-WIT-002',
            name: 'Witness Report',
            type: 'ATTACK',
            faction: 'truth',
            tags: ['disclosure', 'whistleblower'],
          } as any),
          player: 'human',
          truthDelta: 3,
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).not.toBeNull();
      expect(result!.tone).toBe('truth');
      expect(result!.headline).toContain('UFO SIGHTING');
      expect(result!.headline).toContain('WITNESS REPORT');
      expect(result!.body.length).toBeGreaterThan(0);
      expect(result!.byline).toContain('By:');
    });

    it('generates narrative for 2 government cards', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TEST-GOV-BLACK-001',
            name: 'Press Blackout',
            type: 'MEDIA',
            faction: 'government',
            tags: ['coverup', 'redaction'],
          } as any),
          player: 'ai',
          truthDelta: -3,
        },
        {
          card: createMockCard({
            id: 'TEST-GOV-DENIAL-002',
            name: 'Official Denial',
            type: 'ATTACK',
            faction: 'government',
            tags: ['bureaucracy', 'containment'],
          } as any),
          player: 'ai',
          truthDelta: -2,
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).not.toBeNull();
      expect(result!.tone).toBe('government');
      expect(result!.headline.toUpperCase()).toContain('PRESS BLACKOUT');
    });

    it('generates mixed narrative for truth vs government cards', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TEST-TRUTH-LEAK-001',
            name: 'Leaked Documents',
            type: 'ATTACK',
            faction: 'truth',
            tags: ['disclosure', 'leak'],
          } as any),
          player: 'human',
          truthDelta: 4,
        },
        {
          card: createMockCard({
            id: 'TEST-GOV-DAMAGE-001',
            name: 'Damage Control',
            type: 'MEDIA',
            faction: 'government',
            tags: ['coverup', 'spin'],
          } as any),
          player: 'ai',
          truthDelta: -2,
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).not.toBeNull();
      expect(result!.tone).toBe('mixed');
      // The headline should contain some form of clash/conflict language
      const headlineLower = result!.headline.toLowerCase();
      const hasClash = headlineLower.includes('vs') ||
                       headlineLower.includes('clash') ||
                       headlineLower.includes('battle') ||
                       headlineLower.includes('confront') ||
                       headlineLower.includes('duel') ||
                       headlineLower.includes('standoff') ||
                       headlineLower.includes('contradicts') ||
                       headlineLower.includes('exposes') ||
                       headlineLower.includes('chaos');
      expect(hasClash).toBe(true);
    });

    it('generates narrative for 3 cards with full story arc', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'Bigfoot Sighting',
            type: 'MEDIA',
            faction: 'truth',
            tags: ['bigfoot', 'cryptid'],
          } as any),
          player: 'human',
          truthDelta: 3,
        },
        {
          card: createMockCard({
            id: 'TRUTH-002',
            name: 'Mothman Warning',
            type: 'ZONE',
            faction: 'truth',
            tags: ['mothman', 'cryptid'],
          } as any),
          player: 'human',
          truthDelta: 2,
          targetState: 'WV',
        },
        {
          card: createMockCard({
            id: 'TRUTH-003',
            name: 'Cryptid Evidence',
            type: 'ATTACK',
            faction: 'truth',
            tags: ['cryptid', 'evidence'],
          } as any),
          player: 'human',
          truthDelta: 4,
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).not.toBeNull();
      expect(result!.tone).toBe('truth');
      expect(result!.body.length).toBeGreaterThanOrEqual(4); // Opening, middle, climax, closing
      expect(result!.imagePrompt).toContain('grainy');
    });

    it('returns null for single card', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'UFO Sighting',
            type: 'MEDIA',
            faction: 'truth',
          }),
          player: 'human',
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).toBeNull();
    });
  });

  describe('detectThematicCombo', () => {
    it('detects Elvis-UFO combo', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'Elvis Lives',
            type: 'MEDIA',
            faction: 'truth',
            tags: ['elvis'],
          } as any),
          player: 'human',
        },
        {
          card: createMockCard({
            id: 'TRUTH-002',
            name: 'UFO Landing',
            type: 'MEDIA',
            faction: 'truth',
            tags: ['ufo'],
          } as any),
          player: 'human',
        },
      ];

      const result = detectThematicCombo(cards);

      expect(result.hasCombo).toBe(true);
      expect(result.comboName).toBe('Elvis-UFO Encounter');
      expect(result.bonusTags).toContain('diner');
    });

    it('detects Bigfoot-Mothman summit', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'Bigfoot Trail',
            type: 'ZONE',
            faction: 'truth',
            tags: ['bigfoot'],
          } as any),
          player: 'human',
        },
        {
          card: createMockCard({
            id: 'TRUTH-002',
            name: 'Mothman Signal',
            type: 'MEDIA',
            faction: 'truth',
            tags: ['mothman'],
          } as any),
          player: 'human',
        },
      ];

      const result = detectThematicCombo(cards);

      expect(result.hasCombo).toBe(true);
      expect(result.comboName).toBe('Cryptid Summit');
    });

    it('detects Cover-up Exposed combo', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'FOIA Request',
            type: 'ATTACK',
            faction: 'truth',
            tags: ['disclosure'],
          } as any),
          player: 'human',
        },
        {
          card: createMockCard({
            id: 'GOV-001',
            name: 'Redacted Files',
            type: 'MEDIA',
            faction: 'government',
            tags: ['coverup'],
          } as any),
          player: 'ai',
        },
      ];

      const result = detectThematicCombo(cards);

      expect(result.hasCombo).toBe(true);
      expect(result.comboName).toBe('Cover-up Exposed');
    });

    it('returns no combo for unrelated cards', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'Random Card 1',
            type: 'MEDIA',
            faction: 'truth',
            tags: ['random'],
          } as any),
          player: 'human',
        },
        {
          card: createMockCard({
            id: 'TRUTH-002',
            name: 'Random Card 2',
            type: 'ZONE',
            faction: 'truth',
            tags: ['other'],
          } as any),
          player: 'human',
        },
      ];

      const result = detectThematicCombo(cards);

      expect(result.hasCombo).toBe(false);
      expect(result.comboName).toBeNull();
    });
  });

  describe('effect descriptions', () => {
    it('includes truth meter changes in body', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TEST-TRUTH-BIG-001',
            name: 'Big Reveal',
            type: 'MEDIA',
            faction: 'truth',
          }),
          player: 'human',
          truthDelta: 10,
        },
        {
          card: createMockCard({
            id: 'TEST-TRUTH-MORE-002',
            name: 'Another Reveal',
            type: 'ATTACK',
            faction: 'truth',
          }),
          player: 'human',
          truthDelta: 5,
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).not.toBeNull();
      const bodyText = result!.body.join(' ').toLowerCase();
      expect(bodyText).toContain('truth');
    });

    it('includes captured states in body', () => {
      const cards: CardPlayContext[] = [
        {
          card: createMockCard({
            id: 'TRUTH-001',
            name: 'State Takeover',
            type: 'ZONE',
            faction: 'truth',
          }),
          player: 'human',
          truthDelta: 2,
          capturedStates: ['California', 'Nevada'],
        },
        {
          card: createMockCard({
            id: 'TRUTH-002',
            name: 'More Takeover',
            type: 'ZONE',
            faction: 'truth',
          }),
          player: 'human',
          truthDelta: 2,
        },
      ];

      const result = composeSmartNarrative(cards);

      expect(result).not.toBeNull();
      const bodyText = result!.body.join(' ');
      expect(bodyText).toContain('California');
    });
  });
});
