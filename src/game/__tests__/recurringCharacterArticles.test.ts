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
