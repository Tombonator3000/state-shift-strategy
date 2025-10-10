import { CARD_ARTICLE_DATABASE, type CardArticle } from '@/data/cardArticles/articleDatabase';
import RECURRING_CHARACTERS, { type RecurringCharacter } from './recurringCharacters';

export interface CharacterStageState {
  appearances: number;
  currentStage: number;
}

function normaliseState(
  character: RecurringCharacter,
  state?: CharacterStageState,
): CharacterStageState {
  if (state) {
    return {
      appearances: Math.max(0, state.appearances),
      currentStage: Math.max(0, state.currentStage),
    };
  }
  return { appearances: 0, currentStage: character.currentStage ?? 0 };
}

function findArticleVariant(cardId: string, variant: string): CardArticle | undefined {
  return CARD_ARTICLE_DATABASE.find(article => article.cardId === cardId && article.articleVariant === variant);
}

export function selectArticleForCharacter(
  cardId: string,
  characterId: string,
  characterState: Record<string, CharacterStageState>,
): CardArticle | null {
  const character = RECURRING_CHARACTERS[characterId];
  if (!character) {
    return null;
  }

  const maxStage = Math.max(0, character.storyArcs.length - 1);
  const state = normaliseState(character, characterState[characterId]);
  const targetStage = Math.min(state.currentStage, maxStage);

  let article: CardArticle | undefined;
  const variantForStage = `${characterId}_stage_${targetStage}`;
  article = findArticleVariant(cardId, variantForStage);

  if (!article) {
    for (let idx = Math.min(targetStage, maxStage); idx >= 0; idx -= 1) {
      const fallbackVariant = `${characterId}_stage_${idx}`;
      article = findArticleVariant(cardId, fallbackVariant);
      if (article) break;
    }
  }

  if (!article) {
    article = CARD_ARTICLE_DATABASE.find(
      entry => entry.cardId === cardId && entry.recurringCharacter?.toLowerCase() === character.name.toLowerCase(),
    );
  }

  if (article) {
    const nextAppearances = state.appearances + 1;
    const nextStage = Math.min(maxStage, targetStage + 1);
    characterState[characterId] = {
      appearances: nextAppearances,
      currentStage: nextStage,
    };
  } else if (!characterState[characterId]) {
    characterState[characterId] = state;
  }

  return article ?? null;
}

export default selectArticleForCharacter;
