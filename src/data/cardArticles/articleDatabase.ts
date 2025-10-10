/**
 * Card-Specific Article Database
 * Detailed, coherent newspaper articles for each card in the game.
 * These articles provide narrative depth and humor while referencing actual card mechanics.
 */

// Import comprehensive article databases from centralized system
import { ALL_CARD_ARTICLES, getArticleByCardId, getArticlesByFaction as getByFaction, getArticlesByState as getByState, getArticlesByCharacter as getByCharacter } from './allArticles';
import type { ArticleTone } from '@/engine/newspaper/articleTones';

export interface CardArticle {
  cardId: string;
  faction: 'truth' | 'government';
  headline: string;
  subhead: string;
  byline: string;
  body: string;
  imagePrompt?: string;
  statesMentioned?: string[] | null;
  recurringCharacter?: string | null;
  followUpHooks?: string[];
  tags?: string[];
  articleVariant?: string;
  preferredTone?: ArticleTone | null;
}

export type CardArticleCacheEntry = CardArticle | null;

export type CardArticleLookup = (cardId: string) => CardArticle | null;

const articleCache = new Map<string, CardArticleCacheEntry>();

export const CARD_ARTICLE_DATABASE: CardArticle[] = ALL_CARD_ARTICLES;

/**
 * Get article for a specific card
 */
export function getArticleForCard(cardId: string): CardArticle | null {
  const normalized = typeof cardId === 'string' ? cardId.trim() : '';
  if (!normalized) {
    return null;
  }

  if (articleCache.has(normalized)) {
    return articleCache.get(normalized) ?? null;
  }

  const article = getArticleByCardId(normalized);
  articleCache.set(normalized, article ?? null);

  return article;
}

export function clearArticleCache(): void {
  articleCache.clear();
}

/**
 * Get articles by faction
 */
export function getArticlesByFaction(faction: 'truth' | 'government'): CardArticle[] {
  return getByFaction(faction);
}

/**
 * Get articles mentioning a state
 */
export function getArticlesByState(stateName: string): CardArticle[] {
  return getByState(stateName);
}

/**
 * Get articles featuring a recurring character
 */
export function getArticlesByCharacter(characterName: string): CardArticle[] {
  return getByCharacter(characterName);
}

export default CARD_ARTICLE_DATABASE;
