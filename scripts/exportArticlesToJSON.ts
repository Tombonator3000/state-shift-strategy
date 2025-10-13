/**
 * Export all articles from TypeScript sources to JSON for article bank
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { ALL_CARD_ARTICLES } from '../src/data/cardArticles/allArticles';

// Convert CardArticle format to article bank format
const exportedArticles = ALL_CARD_ARTICLES.map(article => ({
  id: article.cardId,
  faction: article.faction,
  tags: article.tags || [],
  headline: article.headline,
  subhead: article.subhead,
  byline: article.byline,
  body: article.body,
  imagePrompt: article.imagePrompt,
  statesMentioned: article.statesMentioned || [],
  recurringCharacter: article.recurringCharacter || null,
  followUpHooks: article.followUpHooks || [],
  articleVariant: article.articleVariant || null,
  preferredTone: article.preferredTone || null
}));

const output = {
  articles: exportedArticles
};

// Write to public data directory for runtime loading
const publicPath = join(process.cwd(), 'public/data/paranoid_times_card_articles_ALL.json');
writeFileSync(publicPath, JSON.stringify(output, null, 2), 'utf-8');

// Also write to src for fallback
const srcPath = join(process.cwd(), 'src/paranoid_times_card_articles_ALL.json');
writeFileSync(srcPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`✅ Exported ${exportedArticles.length} articles`);
console.log(`   → ${publicPath}`);
console.log(`   → ${srcPath}`);
console.log('\nBreakdown:');
const truthCount = exportedArticles.filter(a => a.faction === 'truth').length;
const govCount = exportedArticles.filter(a => a.faction === 'government').length;
console.log(`   Truth: ${truthCount}`);
console.log(`   Government: ${govCount}`);
