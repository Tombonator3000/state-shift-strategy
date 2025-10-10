import selectArticleForCharacter, {
  type CharacterStageState,
} from '../recurringCharacterArticles';

describe('selectArticleForCharacter', () => {
  it('returns stage-specific article without mutating existing progression', () => {
    const state: Record<string, CharacterStageState> = {
      pastor_rex: { appearances: 3, currentStage: 2, lastArticleVariant: 'pastor_rex_stage_2' },
    };

    const article = selectArticleForCharacter('TRUTH-NEW-017', 'pastor_rex', state);
    expect(article?.articleVariant).toBe('pastor_rex_stage_2');
    expect(state.pastor_rex).toEqual({
      appearances: 3,
      currentStage: 2,
      lastArticleVariant: 'pastor_rex_stage_2',
    });
  });

  it('falls back to the closest available variant when the target stage is missing for a card', () => {
    const state: Record<string, CharacterStageState> = {
      pastor_rex: { appearances: 4, currentStage: 7, lastArticleVariant: 'pastor_rex_stage_7' },
    };

    const article = selectArticleForCharacter('TRUTH-019', 'pastor_rex', state);
    expect(article?.articleVariant).toBe('pastor_rex_stage_1');
    expect(state.pastor_rex).toEqual({
      appearances: 4,
      currentStage: 7,
      lastArticleVariant: 'pastor_rex_stage_7',
    });
  });

  it('initialises state when first encountering a character', () => {
    const state: Record<string, CharacterStageState> = {};

    const stage0 = selectArticleForCharacter('TRUTH-015', 'florida_man', state);
    expect(stage0?.articleVariant).toBe('florida_man_stage_0');

    state.florida_man.appearances = 1;
    state.florida_man.currentStage = 1;
    state.florida_man.lastArticleVariant = 'florida_man_stage_1';

    const stage1 = selectArticleForCharacter('TRUTH-NEW-007', 'florida_man', state);
    expect(stage1?.articleVariant).toBe('florida_man_stage_1');

    state.florida_man.appearances = 2;
    state.florida_man.currentStage = 2;
    state.florida_man.lastArticleVariant = 'florida_man_stage_2';

    const stage2 = selectArticleForCharacter('TRUTH-NEW-007', 'florida_man', state);
    expect(stage2?.articleVariant).toBe('florida_man_stage_2');
    expect(state.florida_man).toEqual({
      appearances: 2,
      currentStage: 2,
      lastArticleVariant: 'florida_man_stage_2',
    });
    const first = selectArticleForCharacter('TRUTH-003', 'pastor_rex', state);
    expect(first?.articleVariant).toBe('pastor_rex_stage_0');
    expect(state.pastor_rex).toEqual({
      appearances: 0,
      currentStage: 0,
      lastArticleVariant: 'pastor_rex_stage_0',
    });
  });

  it('returns null when the character is unknown and leaves state untouched', () => {
    const state: Record<string, CharacterStageState> = {};
    const article = selectArticleForCharacter('TRUTH-003', 'unknown_hero', state);
    expect(article).toBeNull();
    expect(state).toEqual({});
  });
});
