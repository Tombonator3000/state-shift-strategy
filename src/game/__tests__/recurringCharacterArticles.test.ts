import selectArticleForCharacter, {
  type CharacterStageState,
} from '../recurringCharacterArticles';

describe('selectArticleForCharacter', () => {
  it('advances character stage after each successful article selection', () => {
    const state: Record<string, CharacterStageState> = {};

    const first = selectArticleForCharacter('TRUTH-003', 'pastor_rex', state);
    expect(first).not.toBeNull();
    expect(first?.articleVariant).toBe('pastor_rex_stage_0');
    expect(state.pastor_rex).toEqual({ appearances: 1, currentStage: 1 });

    const second = selectArticleForCharacter('TRUTH-019', 'pastor_rex', state);
    expect(second?.articleVariant).toBe('pastor_rex_stage_1');
    expect(state.pastor_rex).toEqual({ appearances: 2, currentStage: 2 });

    const third = selectArticleForCharacter('TRUTH-NEW-017', 'pastor_rex', state);
    expect(third?.articleVariant).toBe('pastor_rex_stage_2');
    expect(state.pastor_rex).toEqual({ appearances: 3, currentStage: 2 });
  });

  it('falls back to the closest available variant when the target stage is missing for a card', () => {
    const state: Record<string, CharacterStageState> = {
      pastor_rex: { appearances: 4, currentStage: 7 },
    };

    const article = selectArticleForCharacter('TRUTH-019', 'pastor_rex', state);
    expect(article?.articleVariant).toBe('pastor_rex_stage_1');
    expect(state.pastor_rex).toEqual({ appearances: 5, currentStage: 2 });
  });

  it('supports Florida Man progression through three stages', () => {
    const state: Record<string, CharacterStageState> = {};

    const stage0 = selectArticleForCharacter('TRUTH-015', 'florida_man', state);
    expect(stage0?.articleVariant).toBe('florida_man_stage_0');

    const stage1 = selectArticleForCharacter('TRUTH-NEW-007', 'florida_man', state);
    expect(stage1?.articleVariant).toBe('florida_man_stage_1');

    const stage2 = selectArticleForCharacter('TRUTH-NEW-007', 'florida_man', state);
    expect(stage2?.articleVariant).toBe('florida_man_stage_2');
    expect(state.florida_man).toEqual({ appearances: 3, currentStage: 2 });
  });

  it('returns null when the character is unknown and leaves state untouched', () => {
    const state: Record<string, CharacterStageState> = {};
    const article = selectArticleForCharacter('TRUTH-003', 'unknown_hero', state);
    expect(article).toBeNull();
    expect(state).toEqual({});
  });
});
