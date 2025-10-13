/**
 * Article Combiner System
 * Combines multiple card articles into a single cohesive news story
 */

import type { CardArticle } from '@/data/cardArticles/articleDatabase';
import { getArticleForCard } from '@/data/cardArticles/articleDatabase';

export interface CombinedArticle {
  id: string;
  headline: string;
  subhead: string;
  byline: string;
  body: string;
  sourceArticles: string[]; // Card IDs
  faction: 'truth' | 'government' | 'mixed';
  tags: string[];
  imagePrompt?: string;
}

export interface ArticleCombinationRequest {
  cardIds: string[];
  combineMethod?: 'ai' | 'template';
  tone?: 'urgent' | 'investigative' | 'exposé' | 'official' | 'dismissive';
}

/**
 * Combines multiple card articles into one cohesive story
 */
export async function combineArticles(
  request: ArticleCombinationRequest
): Promise<CombinedArticle | null> {
  const { cardIds, combineMethod = 'ai', tone } = request;

  if (cardIds.length < 2) {
    console.warn('ArticleCombiner: Need at least 2 articles to combine');
    return null;
  }

  // Fetch all articles
  const articles = cardIds
    .map(id => getArticleForCard(id))
    .filter((article): article is CardArticle => article !== null);

  if (articles.length < 2) {
    console.warn('ArticleCombiner: Could not find enough articles for card IDs:', cardIds);
    return null;
  }

  if (combineMethod === 'ai') {
    return await combineWithAI(articles, tone);
  } else {
    return combineWithTemplate(articles);
  }
}

/**
 * Template-based combination (fallback method)
 */
function combineWithTemplate(articles: CardArticle[]): CombinedArticle {
  const faction = determineFaction(articles);
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags || [])));

  // Create a composite headline
  const headline = articles.length === 2
    ? `${articles[0].headline} AS ${articles[1].headline}`
    : `MULTIPLE REVELATIONS SHAKE ${faction === 'truth' ? 'ESTABLISHMENT' : 'CONSPIRACY CIRCLES'}`;

  // Create composite subhead
  const subhead = `Connected events reveal larger pattern in ${articles.length} simultaneous developments`;

  // Combine bodies with connective tissue
  const bodyParts = articles.map((article, idx) => {
    const prefix = idx === 0 ? '' : idx === articles.length - 1 ? 'Furthermore, ' : 'Meanwhile, ';
    return `${prefix}${article.body}`;
  });

  const body = bodyParts.join('\n\n');

  // Use first article's byline with "and staff" if multiple
  const byline = articles[0].byline.includes('By:')
    ? `${articles[0].byline} and staff`
    : `By: Investigative Team`;

  return {
    id: `combined_${Date.now()}`,
    headline,
    subhead,
    byline,
    body,
    sourceArticles: articles.map(a => a.cardId),
    faction,
    tags: allTags,
    imagePrompt: articles[0].imagePrompt
  };
}

/**
 * AI-powered combination using Lovable AI
 */
async function combineWithAI(
  articles: CardArticle[],
  tone?: string
): Promise<CombinedArticle> {
  const faction = determineFaction(articles);
  
  try {
    // Call edge function to combine articles with AI
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/combine-articles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          articles: articles.map(a => ({
            headline: a.headline,
            subhead: a.subhead,
            body: a.body,
            faction: a.faction,
            tags: a.tags
          })),
          faction,
          tone: tone || (faction === 'truth' ? 'investigative' : 'dismissive')
        }),
      }
    );

    if (!response.ok) {
      console.warn('AI combination failed, falling back to template:', response.status);
      return combineWithTemplate(articles);
    }

    const result = await response.json();

    return {
      id: `combined_ai_${Date.now()}`,
      headline: result.headline,
      subhead: result.subhead,
      byline: result.byline || 'By: Editorial Staff',
      body: result.body,
      sourceArticles: articles.map(a => a.cardId),
      faction,
      tags: Array.from(new Set(articles.flatMap(a => a.tags || []))),
      imagePrompt: articles[0].imagePrompt
    };
  } catch (error) {
    console.error('ArticleCombiner AI error:', error);
    return combineWithTemplate(articles);
  }
}

/**
 * Determine the faction of combined articles
 */
function determineFaction(articles: CardArticle[]): 'truth' | 'government' | 'mixed' {
  const factions = new Set(articles.map(a => a.faction));
  if (factions.size === 1) {
    return articles[0].faction;
  }
  return 'mixed';
}

/**
 * Find related articles based on tags, states, or characters
 */
export function findRelatedArticles(
  baseArticle: CardArticle,
  allArticles: CardArticle[],
  maxResults: number = 3
): CardArticle[] {
  const scores = allArticles
    .filter(a => a.cardId !== baseArticle.cardId)
    .map(article => {
      let score = 0;

      // Tag overlap
      const tagOverlap = (article.tags || []).filter(tag =>
        baseArticle.tags?.includes(tag)
      ).length;
      score += tagOverlap * 3;

      // State overlap
      const stateOverlap = (article.statesMentioned || []).filter(state =>
        baseArticle.statesMentioned?.includes(state)
      ).length;
      score += stateOverlap * 2;

      // Character match
      if (
        article.recurringCharacter &&
        article.recurringCharacter === baseArticle.recurringCharacter
      ) {
        score += 5;
      }

      // Same faction
      if (article.faction === baseArticle.faction) {
        score += 1;
      }

      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scores.map(({ article }) => article);
}
