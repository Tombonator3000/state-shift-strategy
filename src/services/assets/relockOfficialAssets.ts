import { assetManifest } from './storage/AssetManifest';
import { CacheManager } from './storage/CacheManager';
import { mergeCredit, normalizeCredit } from './storage/Credit';
import type { ManifestEntry } from './types';
import type { GameCard } from '@/rules/mvp';

type Logger = (message: string, context?: Record<string, unknown>) => void;

export interface RelockOfficialAssetsOptions {
  /**
   * When true, downloaded card entries that were not upgraded to official art
   * are dropped from the manifest. Defaults to false to avoid losing fallback art.
   */
  cleanupDownloads?: boolean;
  /**
   * Clear the provider cache so the next autofill run does not reuse stale lookups.
   * Defaults to true because cache state is cheap to rebuild.
   */
  clearAutofillCache?: boolean;
  /** Optional structured logger for progress updates. */
  logger?: Logger;
}

export interface RelockOfficialAssetsResult {
  processed: number;
  relocked: number;
  skipped: number;
  preserved: number;
  downloadEntriesRemoved: number;
  cacheCleared: boolean;
  durationMs: number;
  errors: { cardId: string; message: string }[];
  totalManifestEntries: number;
}

function log(logger: Logger | undefined, message: string, context?: Record<string, unknown>) {
  if (!logger) return;
  logger(message, context);
}

async function loadCards(): Promise<GameCard[]> {
  const module = await import('@/data/cardDatabase');
  return module.getAllCardsSnapshot();
}

async function getOfficialStore() {
  const module = await import('./providers/OfficialStore');
  return module.OfficialStore;
}

async function getStylePipeline() {
  const module = await import('./StylePipeline');
  return module.runStylePipeline;
}

function sanitizeTags(...sources: (string[] | undefined)[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const rawTag of source) {
      const tag = `${rawTag}`.trim();
      if (!tag || seen.has(tag.toLowerCase())) continue;
      seen.add(tag.toLowerCase());
      tags.push(tag);
    }
  }
  return tags;
}

function cloneEntry(entry: ManifestEntry): ManifestEntry {
  return { ...entry, tags: [...entry.tags], metadata: entry.metadata ? { ...entry.metadata } : undefined };
}

export async function relockOfficialAssets(
  options: RelockOfficialAssetsOptions = {},
): Promise<RelockOfficialAssetsResult> {
  const start = Date.now();
  const cleanupDownloads = options.cleanupDownloads ?? false;
  const clearAutofillCache = options.clearAutofillCache ?? true;

  const cards = await loadCards();
  const officialStore = await getOfficialStore();
  const runStylePipeline = await getStylePipeline();

  const existingEntries = assetManifest.getEntries();
  const preserved = new Map<string, ManifestEntry>();
  const existingCardEntries = new Map<string, ManifestEntry>();

  for (const entry of existingEntries) {
    if (entry.scope === 'card') {
      existingCardEntries.set(entry.key, cloneEntry(entry));
      continue;
    }
    preserved.set(entry.key, cloneEntry(entry));
  }

  const result: RelockOfficialAssetsResult = {
    processed: 0,
    relocked: 0,
    skipped: 0,
    preserved: 0,
    downloadEntriesRemoved: 0,
    cacheCleared: false,
    durationMs: 0,
    errors: [],
    totalManifestEntries: existingEntries.length,
  };

  const relockedKeys = new Set<string>();

  for (const card of cards) {
    result.processed += 1;
    const key = `card:${card.id}`;
    try {
      const official = await officialStore.lookup(card);
      if (!official) {
        result.skipped += 1;
        continue;
      }

      let styledUrl = official.url;
      try {
        styledUrl = await runStylePipeline(official.url);
      } catch (error) {
        log(options.logger, 'stylePipelineFailed', { cardId: card.id, error: error instanceof Error ? error.message : String(error) });
        styledUrl = official.url;
      }

      const previous = existingCardEntries.get(key);
      const credit = normalizeCredit(
        mergeCredit(previous?.credit, official.credit ?? undefined) ?? official.credit ?? previous?.credit,
      );
      const tags = sanitizeTags(official.tags, previous?.tags, card.artTags);
      const metadata = official.metadata
        ? { ...(previous?.metadata ?? {}), ...official.metadata }
        : previous?.metadata;

      const entry: ManifestEntry = {
        key,
        scope: 'card',
        url: official.url,
        styledUrl,
        provider: official.provider,
        credit,
        license: official.license ?? previous?.license,
        locked: true,
        tags,
        thumbnailUrl: previous?.thumbnailUrl,
        metadata,
        updatedAt: Date.now(),
        source: 'official',
      };

      preserved.set(key, entry);
      relockedKeys.add(key);
      result.relocked += 1;

      if (previous?.source === 'download') {
        result.downloadEntriesRemoved += 1;
      }
    } catch (error) {
      result.skipped += 1;
      result.errors.push({
        cardId: card.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const [key, entry] of existingCardEntries.entries()) {
    if (relockedKeys.has(key)) {
      continue;
    }

    if (cleanupDownloads && entry.source === 'download') {
      result.downloadEntriesRemoved += 1;
      continue;
    }

    preserved.set(key, entry);
    result.preserved += 1;
  }

  assetManifest.clear();
  for (const entry of preserved.values()) {
    assetManifest.upsert(entry);
  }

  if (clearAutofillCache) {
    const providerCache = new CacheManager('asset-provider-results');
    providerCache.clear();
    result.cacheCleared = true;
  }

  const finalEntries = assetManifest.getEntries();
  result.totalManifestEntries = finalEntries.length;
  result.durationMs = Date.now() - start;

  log(options.logger, 'relockComplete', {
    processed: result.processed,
    relocked: result.relocked,
    skipped: result.skipped,
    preserved: result.preserved,
    removedDownloads: result.downloadEntriesRemoved,
    durationMs: result.durationMs,
  });

  return result;
}
