import type { CardArticle } from './articleDatabase';
import { truthArticles } from './truthArticles';
import { governmentArticles } from './governmentArticles';
import { expansionArticles } from './expansionArticles';
import { cryptidArticleVariants } from './cryptidVariants';

/**
 * Combined article database for all factions
 * Automatically merges Truth and Government articles
 */

export const ALL_CARD_ARTICLES: CardArticle[] = [
  ...truthArticles,
  ...governmentArticles,
  ...expansionArticles,
  ...cryptidArticleVariants
];

export function getArticleByCardId(cardId: string): CardArticle | null {
  return ALL_CARD_ARTICLES.find(article => article.cardId === cardId) ?? null;
}

export function getArticlesByFaction(faction: 'truth' | 'government'): CardArticle[] {
  return ALL_CARD_ARTICLES.filter(article => article.faction === faction);
}

export function getArticlesByTag(tag: string): CardArticle[] {
  return ALL_CARD_ARTICLES.filter(article => 
    article.tags?.includes(tag)
  );
}

export function getArticlesByState(state: string): CardArticle[] {
  const normalized = state.trim().toLowerCase();
  return ALL_CARD_ARTICLES.filter(article => 
    article.statesMentioned?.some(s => s.toLowerCase() === normalized)
  );
}

export function getArticlesByCharacter(character: string): CardArticle[] {
  const normalized = character.trim().toLowerCase();
  return ALL_CARD_ARTICLES.filter(article => 
    article.recurringCharacter?.toLowerCase() === normalized
  );
}
