import { CARD_ARTICLE_DATABASE, type CardArticle } from '@/data/cardArticles/articleDatabase';
import RECURRING_CHARACTERS, {
  type RecurringCharacter,
  type RecurringCharacterProgress,
} from './recurringCharacters';

export interface CharacterStageState extends Pick<RecurringCharacterProgress, 'appearances' | 'currentStage' | 'lastArticleVariant'> {}

function normaliseState(
  character: RecurringCharacter,
  state?: CharacterStageState,
): CharacterStageState {
  if (state) {
    return {
      appearances: Math.max(0, state.appearances),
      currentStage: Math.max(0, state.currentStage),
      lastArticleVariant: state.lastArticleVariant ?? null,
    };
  }
  const stage = character.currentStage ?? 0;
  const arc = character.storyArcs.find(entry => entry.stage === stage) ?? character.storyArcs[0];
  return {
    appearances: 0,
    currentStage: stage,
    lastArticleVariant: arc?.articleVariant ?? null,
  };
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
  const variantForStage = state.lastArticleVariant ?? `${characterId}_stage_${targetStage}`;
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

  if (!characterState[characterId]) {
    characterState[characterId] = state;
  }

  return article ?? null;
}

export default selectArticleForCharacter;
