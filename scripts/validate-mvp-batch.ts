#!/usr/bin/env bun

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { repairToMVP, validateCardMVP } from '../src/mvp/validator';
import type { GameCard } from '../src/rules/mvp';

type CardSource = {
  id: string;
  label: string;
  origin: string;
  cards: unknown;
  warnings?: string[];
};

type CardIssue = {
  sourceId: string;
  origin: string;
  cardId: string;
  cardName: string;
  index: number;
  messages: string[];
};

type SourceSummary = {
  id: string;
  label: string;
  origin: string;
  total: number;
  valid: number;
};

const ROOT = process.cwd();
const CORE_ORIGIN = 'src/data/core/index.ts';
const EXTENSION_DIR = path.join(ROOT, 'public', 'extensions');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return null;
};

async function loadCoreSource(): Promise<CardSource[]> {
  try {
    const module = await import('../src/data/core/index.ts');
    const cards = module.CARD_DATABASE_CORE as GameCard[] | undefined;
    if (!Array.isArray(cards)) {
      return [
        {
          id: 'core',
          label: 'Core MVP batches',
          origin: CORE_ORIGIN,
          cards: cards ?? [],
          warnings: ['CARD_DATABASE_CORE did not export an array of cards.'],
        },
      ];
    }

    return [
      {
        id: 'core',
        label: `Core MVP batches (${cards.length} cards)`,
        origin: CORE_ORIGIN,
        cards,
      },
    ];
  } catch (error) {
    return [
      {
        id: 'core',
        label: 'Core MVP batches',
        origin: CORE_ORIGIN,
        cards: [],
        warnings: [`Failed to load core batches: ${(error as Error).message}`],
      },
    ];
  }
}

function loadExtensionSources(): CardSource[] {
  if (!fs.existsSync(EXTENSION_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(EXTENSION_DIR);
  const sources: CardSource[] = [];

  for (const entry of entries) {
    if (!entry.endsWith('.json') || entry === 'manifest.json') {
      continue;
    }

    const fullPath = path.join(EXTENSION_DIR, entry);
    const origin = path.relative(ROOT, fullPath);

    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = JSON.parse(raw) as { id?: string; name?: string; cards?: unknown };
      const id = parsed.id ?? entry.replace(/\.json$/u, '');
      const label = parsed.name ? `${parsed.name} (extension)` : `Extension ${id}`;

      sources.push({
        id: `extension:${id}`,
        label,
        origin,
        cards: parsed.cards ?? [],
        warnings: Array.isArray(parsed.cards)
          ? undefined
          : ['Extension JSON does not include a "cards" array.'],
      });
    } catch (error) {
      sources.push({
        id: `extension:${entry}`,
        label: `Extension ${entry}`,
        origin,
        cards: [],
        warnings: [`Failed to parse ${entry}: ${(error as Error).message}`],
      });
    }
  }

  return sources;
}

function validateCardsFromSource(source: CardSource): { summary: SourceSummary; issues: CardIssue[] } {
  const issues: CardIssue[] = [];
  const cards = Array.isArray(source.cards) ? source.cards : null;

  if (!cards) {
    issues.push({
      sourceId: source.id,
      origin: source.origin,
      cardId: source.id,
      cardName: source.label,
      index: -1,
      messages: ['Card source did not provide an array of cards.'],
    });

    return {
      summary: {
        id: source.id,
        label: source.label,
        origin: source.origin,
        total: 0,
        valid: 0,
      },
      issues,
    };
  }

  let valid = 0;

  cards.forEach((raw, index) => {
    const { card, errors } = repairToMVP(raw);
    const validation = validateCardMVP(card);
    const messages = [...errors];

    if (!validation.ok) {
      messages.push(...validation.errors);
    }

    if (messages.length === 0) {
      valid += 1;
      return;
    }

    const rawRecord = isRecord(raw) ? raw : undefined;
    const cardId = getString(rawRecord?.id) ?? card.id ?? `index ${index}`;
    const cardName = getString(rawRecord?.name) ?? card.name ?? '';

    issues.push({
      sourceId: source.id,
      origin: source.origin,
      cardId,
      cardName,
      index,
      messages,
    });
  });

  return {
    summary: {
      id: source.id,
      label: source.label,
      origin: source.origin,
      total: cards.length,
      valid,
    },
    issues,
  };
}

async function main() {
  const sources = [...(await loadCoreSource()), ...loadExtensionSources()];

  if (sources.length === 0) {
    console.warn('No MVP card sources were found.');
    return;
  }

  const summaries: SourceSummary[] = [];
  const issues: CardIssue[] = [];

  for (const source of sources) {
    if (source.warnings) {
      for (const warning of source.warnings) {
        console.warn(`⚠️  [${source.id}] ${warning}`);
      }
    }

    const result = validateCardsFromSource(source);
    summaries.push(result.summary);
    issues.push(...result.issues);
  }

  const totalCards = summaries.reduce((sum, entry) => sum + entry.total, 0);
  const totalValid = summaries.reduce((sum, entry) => sum + entry.valid, 0);

  console.log('\nMVP Batch Validation Summary');
  console.log('-----------------------------');
  summaries.forEach(entry => {
    const status = entry.total === entry.valid ? '✅' : '❌';
    console.log(
      `${status} ${entry.label} — ${entry.valid}/${entry.total} cards valid (source: ${entry.origin})`,
    );
  });
  console.log('-----------------------------');
  console.log(`Total cards checked: ${totalCards}`);
  console.log(`Total cards valid:   ${totalValid}`);

  if (issues.length > 0) {
    console.error('\nValidation issues found:');
    issues.forEach(issue => {
      const header = `${issue.cardId}${issue.cardName ? ` (${issue.cardName})` : ''}`;
      console.error(`- [${issue.sourceId}] ${header} — index ${issue.index}`);
      issue.messages.forEach(message => {
        console.error(`    • ${message}`);
      });
    });

    process.exitCode = 1;
    return;
  }

  console.log('\n✅ All MVP card batches passed validation.');
}

main().catch(error => {
  console.error('Unexpected error during MVP validation:', error);
  process.exit(1);
});
