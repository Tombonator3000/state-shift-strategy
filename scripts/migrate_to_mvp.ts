#!/usr/bin/env bun
import { glob } from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import process from 'node:process';
import { sanitizeCard, validateCard } from '../src/mvp/validator';

const DEFAULT_PATTERNS = ['src/**/*.json', 'public/**/*.json', 'assets/**/*.json'];
const GLOB_OPTIONS = {
  ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**'],
  absolute: true,
};

type ProcessResult = {
  file: string;
  status: 'ok' | 'fixed' | 'failed';
  messages: string[];
};

type CardExtraction = {
  cards: unknown[];
  type: 'array' | 'object';
  key?: string;
  source: unknown;
};

const looksLikeCard = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'rarity' in value &&
    'faction' in value
  );
};

const extractCardArray = (data: unknown): CardExtraction | null => {
  if (Array.isArray(data) && data.every(looksLikeCard)) {
    return { cards: data, type: 'array', source: data };
  }
  if (typeof data === 'object' && data !== null) {
    const value = (data as Record<string, unknown>).cards;
    if (Array.isArray(value) && value.every(looksLikeCard)) {
      return { cards: value, type: 'object', key: 'cards', source: data };
    }
  }
  return null;
};

const ensureTrailingNewline = (value: string): string => (value.endsWith('\n') ? value : `${value}\n`);

async function gatherFiles(patterns: string[]): Promise<string[]> {
  const files = new Set<string>();
  for (const pattern of patterns) {
    const matches = await glob(pattern, GLOB_OPTIONS);
    for (const file of matches) {
      files.add(file);
    }
  }
  return Array.from(files).sort();
}

async function processFile(file: string): Promise<ProcessResult | null> {
  const originalContent = await readFile(file, 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(originalContent);
  } catch (error) {
    return {
      file,
      status: 'failed',
      messages: [`invalid JSON: ${(error as Error).message}`],
    };
  }

  const extraction = extractCardArray(parsed);
  if (!extraction) {
    return null;
  }

  const sanitizedCards: unknown[] = [];
  const messages: string[] = [];
  let hasErrors = false;

  extraction.cards.forEach((raw, index) => {
    const { card, errors, changes } = sanitizeCard(raw);
    const hasId =
      typeof raw === 'object' && raw !== null && 'id' in raw && (raw as { id?: unknown }).id != null;
    const label = hasId ? String((raw as { id: unknown }).id) : `index ${index}`;

    if (!card || errors.length > 0) {
      hasErrors = true;
      messages.push(`${label}: ${errors.join('; ')}`);
      return;
    }

    const validation = validateCard(card);
    if (!validation.ok) {
      hasErrors = true;
      messages.push(`${label}: ${validation.errors.join('; ')}`);
    }

    if (changes.length > 0) {
      messages.push(`${card.id}: ${changes.join('; ')}`);
    }

    sanitizedCards.push(card);
  });

  if (hasErrors) {
    return { file, status: 'failed', messages };
  }

  const outputData =
    extraction.type === 'array'
      ? sanitizedCards
      : { ...(extraction.source as Record<string, unknown>), [extraction.key as string]: sanitizedCards };

  const newContent = JSON.stringify(outputData, null, 2) + '\n';
  const changed = newContent !== ensureTrailingNewline(originalContent);

  if (changed) {
    await writeFile(file, newContent, 'utf8');
  }

  return {
    file,
    status: changed ? 'fixed' : 'ok',
    messages,
  };
}

async function main() {
  const patterns = process.argv.slice(2);
  const files = await gatherFiles(patterns.length > 0 ? patterns : DEFAULT_PATTERNS);

  if (files.length === 0) {
    console.warn('No JSON files matched the provided patterns.');
    return;
  }

  const reports: ProcessResult[] = [];
  for (const file of files) {
    const result = await processFile(file);
    if (result) {
      reports.push(result);
    }
  }

  const cwd = process.cwd();
  let hasFailures = false;

  for (const report of reports) {
    if (report.status === 'failed') {
      hasFailures = true;
    }
    const relPath = relative(cwd, report.file);
    console.log(`\n${relPath}: ${report.status.toUpperCase()}`);
    if (report.messages.length > 0) {
      for (const message of report.messages) {
        console.log(`  - ${message}`);
      }
    }
  }

  if (reports.length === 0) {
    console.log('No card JSON files found.');
  }

  if (hasFailures) {
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  main().catch(error => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  });
}
