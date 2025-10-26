import { composeHeroFallback } from '../../src/components/game/heroFallback';

describe('composeHeroFallback', () => {
  it('threads captured states, truth swings, and combo rewards into narrative beats', () => {
    const result = composeHeroFallback({
      faction: 'truth',
      capturedStates: ['New York', 'Nevada'],
      truthDeltaTotal: 5,
      comboReport: {
        entries: [
          { name: 'Photon Lasso', reward: 'Hush Fund IOU' },
          { name: 'Red String Blitz', reward: null },
        ],
      },
      comboOwnerLabel: 'Hotline Hydra',
    });

    expect(result.body.length).toBeGreaterThanOrEqual(3);
    expect(result.body.some(paragraph => paragraph.includes('New York'))).toBe(true);
    expect(result.body.some(paragraph => paragraph.toLowerCase().includes('rumor'))).toBe(true);
    expect(result.body.some(paragraph => paragraph.includes('Hush Fund IOU'))).toBe(true);
  });

  it('keeps government tone snarky and memo-driven even without map shifts or combos', () => {
    const result = composeHeroFallback({
      faction: 'government',
      capturedStates: [],
      truthDeltaTotal: 0,
      comboReport: null,
    });

    expect(result.body.length).toBeGreaterThanOrEqual(3);
    expect(result.body.some(paragraph => /memo|redacted|insider quip/i.test(paragraph))).toBe(true);
    expect(result.body.some(paragraph => /combo|reward/i.test(paragraph))).toBe(true);
  });
});
