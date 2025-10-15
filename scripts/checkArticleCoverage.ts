/**
 * Check article coverage for all cards
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load all card databases
const coreTruthCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/core/core_truth_MVP_balanced.json'), 'utf-8'));
const coreGovCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/core/core_government_MVP_balanced.json'), 'utf-8'));
const expansionTruthCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/expansion/newTruthCards.json'), 'utf-8'));
const expansionGovCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/expansion/newGovernmentCards.json'), 'utf-8'));

// Load article files
const truthArticlesFile = readFileSync(join(process.cwd(), 'src/data/cardArticles/truthArticles.ts'), 'utf-8');
const govArticlesFile = readFileSync(join(process.cwd(), 'src/data/cardArticles/governmentArticles.ts'), 'utf-8');
const expansionArticlesFile = readFileSync(join(process.cwd(), 'src/data/cardArticles/expansionArticles.ts'), 'utf-8');

// Extract card IDs from article files
const extractCardIds = (content: string): Set<string> => {
  const ids = new Set<string>();
  const regex = /cardId:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return ids;
};

const truthArticleIds = extractCardIds(truthArticlesFile);
const govArticleIds = extractCardIds(govArticlesFile);
const expansionArticleIds = extractCardIds(expansionArticlesFile);

// Get all card IDs
const coreTruthCardIds = new Set(coreTruthCards.map((c: any) => c.id as string));
const coreGovCardIds = new Set(coreGovCards.map((c: any) => c.id as string));
const expansionTruthCardIds = new Set(expansionTruthCards.map((c: any) => c.id as string));
const expansionGovCardIds = new Set(expansionGovCards.map((c: any) => c.id as string));

// Find missing articles
const missingCoreTruth = Array.from(coreTruthCardIds).filter((id): id is string => typeof id === 'string' && !truthArticleIds.has(id));
const missingCoreGov = Array.from(coreGovCardIds).filter((id): id is string => typeof id === 'string' && !govArticleIds.has(id));
const missingExpansionTruth = Array.from(expansionTruthCardIds).filter((id): id is string => typeof id === 'string' && !expansionArticleIds.has(id));
const missingExpansionGov = Array.from(expansionGovCardIds).filter((id): id is string => typeof id === 'string' && !expansionArticleIds.has(id));

console.log('Article Coverage Report');
console.log('======================\n');
console.log(`Core Truth Cards: ${coreTruthCardIds.size} cards, ${truthArticleIds.size} articles`);
console.log(`  Missing: ${missingCoreTruth.length}`);
if (missingCoreTruth.length > 0 && missingCoreTruth.length <= 20) {
  console.log(`  IDs: ${missingCoreTruth.join(', ')}`);
}

console.log(`\nCore Government Cards: ${coreGovCardIds.size} cards, ${govArticleIds.size} articles`);
console.log(`  Missing: ${missingCoreGov.length}`);
if (missingCoreGov.length > 0 && missingCoreGov.length <= 20) {
  console.log(`  IDs: ${missingCoreGov.join(', ')}`);
}

console.log(`\nExpansion Truth Cards: ${expansionTruthCardIds.size} cards, ${expansionArticleIds.size} expansion truth articles`);
console.log(`  Missing: ${missingExpansionTruth.length}`);
if (missingExpansionTruth.length > 0) {
  console.log(`  IDs: ${missingExpansionTruth.join(', ')}`);
}

console.log(`\nExpansion Government Cards: ${expansionGovCardIds.size} cards, ${expansionArticleIds.size} expansion gov articles`);
console.log(`  Missing: ${missingExpansionGov.length}`);
if (missingExpansionGov.length > 0) {
  console.log(`  IDs: ${missingExpansionGov.join(', ')}`);
}

console.log(`\n\nTOTAL CARDS: ${coreTruthCardIds.size + coreGovCardIds.size + expansionTruthCardIds.size + expansionGovCardIds.size}`);
console.log(`TOTAL MISSING: ${missingCoreTruth.length + missingCoreGov.length + missingExpansionTruth.length + missingExpansionGov.length}`);

// Also check for duplicate article IDs
const allArticleIds = new Set([...truthArticleIds, ...govArticleIds, ...expansionArticleIds]);
const totalArticleCount = truthArticleIds.size + govArticleIds.size + expansionArticleIds.size;
if (totalArticleCount !== allArticleIds.size) {
  console.log(`\n⚠️  WARNING: Found duplicate article IDs!`);
  console.log(`  Total article entries: ${totalArticleCount}`);
  console.log(`  Unique article IDs: ${allArticleIds.size}`);
  console.log(`  Duplicates: ${totalArticleCount - allArticleIds.size}`);
}
