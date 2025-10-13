/**
 * Script to find all cards missing news articles
 * Compares card IDs from all sources against existing articles
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load card databases
const coreTruthCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/core/core_truth_MVP_balanced.json'), 'utf-8'));
const coreGovCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/core/core_government_MVP_balanced.json'), 'utf-8'));
const expansionTruthCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/expansion/newTruthCards.json'), 'utf-8'));
const expansionGovCards = JSON.parse(readFileSync(join(process.cwd(), 'src/data/expansion/newGovernmentCards.json'), 'utf-8'));

// Load existing articles
const truthArticlesFile = readFileSync(join(process.cwd(), 'src/data/cardArticles/truthArticles.ts'), 'utf-8');
const govArticlesFile = readFileSync(join(process.cwd(), 'src/data/cardArticles/governmentArticles.ts'), 'utf-8');
const expansionArticlesFile = readFileSync(join(process.cwd(), 'src/data/cardArticles/expansionArticles.ts'), 'utf-8');

// Extract card IDs from articles
const extractCardIds = (content: string): Set<string> => {
  const ids = new Set<string>();
  const regex = /cardId:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return ids;
};

const existingTruthIds = extractCardIds(truthArticlesFile);
const existingGovIds = extractCardIds(govArticlesFile);
const existingExpansionIds = extractCardIds(expansionArticlesFile);
const allExistingIds = new Set([...existingTruthIds, ...existingGovIds, ...existingExpansionIds]);

// Gather all card IDs from sources
const allTruthCardIds = coreTruthCards.map((c: any) => c.id);
const allGovCardIds = coreGovCards.map((c: any) => c.id);
const allExpansionTruthIds = expansionTruthCards.map((c: any) => c.id);
const allExpansionGovIds = expansionGovCards.map((c: any) => c.id);

// Find missing IDs
const missingTruth = allTruthCardIds.filter((id: string) => !allExistingIds.has(id));
const missingGov = allGovCardIds.filter((id: string) => !allExistingIds.has(id));
const missingExpansionTruth = allExpansionTruthIds.filter((id: string) => !allExistingIds.has(id));
const missingExpansionGov = allExpansionGovIds.filter((id: string) => !allExistingIds.has(id));

// Create report
const report = {
  summary: {
    totalCards: allTruthCardIds.length + allGovCardIds.length + allExpansionTruthIds.length + allExpansionGovIds.length,
    totalArticles: allExistingIds.size,
    missingArticles: missingTruth.length + missingGov.length + missingExpansionTruth.length + missingExpansionGov.length
  },
  coreTruth: {
    total: allTruthCardIds.length,
    existing: allTruthCardIds.filter((id: string) => allExistingIds.has(id)).length,
    missing: missingTruth.length,
    missingIds: missingTruth
  },
  coreGov: {
    total: allGovCardIds.length,
    existing: allGovCardIds.filter((id: string) => allExistingIds.has(id)).length,
    missing: missingGov.length,
    missingIds: missingGov
  },
  expansionTruth: {
    total: allExpansionTruthIds.length,
    existing: allExpansionTruthIds.filter((id: string) => allExistingIds.has(id)).length,
    missing: missingExpansionTruth.length,
    missingIds: missingExpansionTruth
  },
  expansionGov: {
    total: allExpansionGovIds.length,
    existing: allExpansionGovIds.filter((id: string) => allExistingIds.has(id)).length,
    missing: missingExpansionGov.length,
    missingIds: missingExpansionGov
  }
};

// Write report
writeFileSync(
  join(process.cwd(), 'docs/missing-articles-report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log('Missing Articles Report:');
console.log('========================');
console.log(`Total Cards: ${report.summary.totalCards}`);
console.log(`Total Articles: ${report.summary.totalArticles}`);
console.log(`Missing Articles: ${report.summary.missingArticles}`);
console.log('\nBreakdown:');
console.log(`  Core Truth: ${report.coreTruth.missing}/${report.coreTruth.total} missing`);
console.log(`  Core Gov: ${report.coreGov.missing}/${report.coreGov.total} missing`);
console.log(`  Expansion Truth: ${report.expansionTruth.missing}/${report.expansionTruth.total} missing`);
console.log(`  Expansion Gov: ${report.expansionGov.missing}/${report.expansionGov.total} missing`);
console.log('\nReport written to: docs/missing-articles-report.json');
