import { trackCharacterAppearance, type RecurringCharacterState } from '../recurringCharacters';

describe('trackCharacterAppearance', () => {
  it('updates progress and returns stage data for matching cards', () => {
    const state: RecurringCharacterState = {};
    const result = trackCharacterAppearance('Pastor Rex Prophecy', ['pastor-rex'], 1, state);

    expect(result.character?.id).toBe('pastor_rex');
    expect(result.progress).toEqual({
      appearances: 1,
      lastRound: 1,
      currentStage: 0,
      lastArticleVariant: 'pastor_rex_stage_0',
      milestones: [],
    });
    expect(result.stageArc?.label).toBe('Broadcast Prophet');
    expect(result.bonus.truthDelta).toBe(1);
  });

  it('applies milestone bonuses and records milestone history', () => {
    const state: RecurringCharacterState = {};
    trackCharacterAppearance('Pastor Rex Rally', ['pastor-rex'], 1, state);
    trackCharacterAppearance('Pastor Rex Broadcast', ['pastor-rex'], 2, state);
    const result = trackCharacterAppearance('Pastor Rex Ascends', ['pastor-rex'], 3, state);

    expect(result.progress).toEqual({
      appearances: 3,
      lastRound: 3,
      currentStage: 2,
      lastArticleVariant: 'pastor_rex_stage_2',
      milestones: ["Rex's Prophecy Fulfilled"],
    });
    expect(result.bonus.truthDelta).toBe(5); // 3 from cumulative + 2 milestone
    expect(result.milestone?.label).toBe("Rex's Prophecy Fulfilled");
  });

  it('ignores non-matching cards', () => {
    const state: RecurringCharacterState = {};
    const result = trackCharacterAppearance('Generic Card', ['media'], 1, state);

    expect(result.character).toBeNull();
    expect(result.progress).toBeNull();
    expect(state).toEqual({});
  });
});
