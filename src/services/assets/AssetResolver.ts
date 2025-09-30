import { featureFlags } from '@/state/featureFlags';
import { buildQuery } from './QueryBuilder';
import { rankCandidates } from './Ranker';
import { runStylePipeline } from './StylePipeline';
import { OfficialStore } from './providers/OfficialStore';
import { PackStore } from './providers/PackStore';
import { WikimediaProvider } from './providers/WikimediaProvider';
import { assetManifest } from './storage/AssetManifest';
import { CacheManager } from './storage/CacheManager';
import { hash } from './storage/Hash';
import { mergeCredit, normalizeCredit } from './storage/Credit';
import type {
  AssetCandidate,
  AssetContext,
  AssetProvider,
  AssetScope,
  ManifestEntry,
  ResolvedAsset,
} from './types';

const providers: AssetProvider[] = [OfficialStore, PackStore, WikimediaProvider].sort(
  (a, b) => a.priority - b.priority,
);

const ALLOWED =
  /\b(public\s*domain|cc[-\s]?(?:by(?:-sa)?|0)(?:[-\s]?\d(?:\.\d)?)?|creative\s+commons\s+attribution(?:[-\s]sharealike)?)\b/i;

export function filterLicensed(candidates: AssetCandidate[], providerId: string): AssetCandidate[] {
  if (providerId === 'official' || providerId === 'pack') {
    return candidates;
  }

  const filtered: AssetCandidate[] = [];

  for (const candidate of candidates) {
    const license = candidate.license?.trim();
    if (!license) {
      console.warn(
        '[AssetResolver] Dropping candidate without license metadata',
        providerId,
        candidate.id,
      );
      continue;
    }

    if (!ALLOWED.test(license)) {
      console.warn(
        '[AssetResolver] Dropping candidate with unsupported license',
        providerId,
        candidate.id,
        license,
      );
      continue;
    }

    filtered.push(candidate);
  }

  return filtered;
}

type ProviderSnapshot = {
  id: string;
  url: string;
  provider: string;
  credit?: string;
  license?: string;
  tags?: string[];
  locked?: boolean;
  metadata?: Record<string, unknown>;
  confidence?: number;
};

const providerCache = new CacheManager<ProviderSnapshot[]>('asset-provider-results');

function manifestKey(context: AssetContext): string | null {
  if (context.scope === 'card' && context.card) {
    return `card:${context.card.id}`;
  }
  if (context.scope === 'event' && context.event) {
    return `event:${context.event.id}`;
  }
  if (context.scope === 'article' && context.article) {
    return `article:${context.article.id}`;
  }
  return null;
}

export function getManifestKey(context: AssetContext): string | null {
  return manifestKey(context);
}

function manifestEntryToResolved(entry: ManifestEntry): ResolvedAsset {
  return {
    key: entry.key,
    url: entry.url,
    styledUrl: entry.styledUrl,
    provider: entry.provider,
    credit: entry.credit,
    license: entry.license,
    locked: entry.locked,
    updatedAt: entry.updatedAt,
    tags: entry.tags,
    metadata: entry.metadata,
    source: entry.source,
  };
}

async function resolveWithProviders(context: AssetContext) {
  const query = buildQuery(context);
  const cacheKey = await hash(JSON.stringify(query));
  const cached = providerCache.get(cacheKey);
  if (cached && Array.isArray(cached)) {
    return { query, providerSnapshots: cached };
  }

  const rankingContext = {
    scope: context.scope,
    desiredTags: query.includeTags,
    licensePreference: query.licensePreference,
    card: context.card,
    event: context.event,
    article: context.article,
  };

  const allCandidates = [];
  for (const provider of providers) {
    if (provider.shouldSkip(context)) {
      continue;
    }

    const result = await provider.fetchAssets(query, context);
    const licensed = filterLicensed(result.candidates, provider.id);
    if (licensed.length === 0) {
      continue;
    }

    const ranked = rankCandidates(licensed, rankingContext);
    allCandidates.push(
      ...ranked.map(candidate => ({
        candidate,
        providerId: provider.id,
      })),
    );

    if (ranked.some(candidate => candidate.locked)) {
      break;
    }
  }

  const providerSnapshots = allCandidates.map(({ candidate }) => ({
    id: candidate.id,
    url: candidate.url,
    provider: candidate.provider,
    credit: candidate.credit,
    license: candidate.license,
    tags: candidate.tags,
    locked: candidate.locked,
    metadata: candidate.metadata,
    confidence: candidate.confidence,
  }));

  providerCache.set(cacheKey, providerSnapshots, 1000 * 60 * 30);

  return { query, providerSnapshots };
}

interface ResolveOptions {
  forceRefresh?: boolean;
}

export async function resolveImage(
  context: AssetContext,
  options: ResolveOptions = {},
): Promise<ResolvedAsset | null> {
  const key = manifestKey(context);
  if (!key) {
    return null;
  }

  if (!featureFlags.autofillCardArt && context.scope === 'card') {
    const existing = assetManifest.getEntry(key);
    return existing ? manifestEntryToResolved(existing) : null;
  }

  const existing = assetManifest.getEntry(key);
  if (existing && (existing.locked || existing.source === 'official')) {
    return manifestEntryToResolved(existing);
  }

  if (existing && !options.forceRefresh) {
    return manifestEntryToResolved(existing);
  }

  try {
    if (context.scope === 'card' && context.card) {
      const official = await OfficialStore.lookup(context.card);
      if (official) {
        let styledUrl = official.url;
        try {
          styledUrl = await runStylePipeline(official.url);
        } catch (error) {
          console.warn('[AssetResolver] style pipeline failed for official art, using original url', error);
          styledUrl = official.url;
        }

        const manifestEntry: ManifestEntry = {
          key,
          scope: context.scope,
          url: official.url,
          styledUrl,
          provider: official.provider,
          credit: normalizeCredit(
            mergeCredit(existing?.credit, official.credit ?? undefined) ?? official.credit,
          ),
          license: official.license,
          locked: true,
          tags: official.tags ?? context.tags ?? [],
          metadata: official.metadata,
          updatedAt: Date.now(),
          source: 'official',
        };

        assetManifest.upsert(manifestEntry);
        return manifestEntryToResolved(manifestEntry);
      }
    }

    const { providerSnapshots, query } = await resolveWithProviders(context);
    if (providerSnapshots.length === 0) {
      if (context.fallbackUrl) {
        const entry: ManifestEntry = {
          key,
          scope: context.scope,
          url: context.fallbackUrl,
          styledUrl: context.fallbackUrl,
          provider: 'fallback',
          credit: undefined,
          license: undefined,
          locked: false,
          tags: context.tags ?? [],
          metadata: { query },
          updatedAt: Date.now(),
          source: 'download',
        };

        const latest = assetManifest.getEntry(key);
        if (latest && (latest.locked || latest.source === 'official')) {
          return manifestEntryToResolved(latest);
        }

        assetManifest.upsert(entry);
        return manifestEntryToResolved(entry);
      }
      return existing ? manifestEntryToResolved(existing) : null;
    }

    const bestCandidate = providerSnapshots.sort(
      (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0),
    )[0];

    if (!bestCandidate) {
      return existing ? manifestEntryToResolved(existing) : null;
    }

    let styledUrl = bestCandidate.url;
    try {
      styledUrl = await runStylePipeline(bestCandidate.url);
    } catch (error) {
      console.warn('[AssetResolver] style pipeline failed, using original url', error);
      styledUrl = bestCandidate.url;
    }

    const manifestEntry: ManifestEntry = {
      key,
      scope: context.scope,
      url: bestCandidate.url,
      styledUrl,
      provider: bestCandidate.provider,
      credit: normalizeCredit(
        mergeCredit(existing?.credit, bestCandidate.credit ?? undefined) ?? bestCandidate.credit,
      ),
      license: bestCandidate.license,
      locked: Boolean(bestCandidate.locked),
      tags: bestCandidate.tags ?? context.tags ?? [],
      metadata: { ...bestCandidate.metadata, query },
      updatedAt: Date.now(),
      source: 'download',
    };

    const latest = assetManifest.getEntry(key);
    if (latest && (latest.locked || latest.source === 'official')) {
      return manifestEntryToResolved(latest);
    }

    assetManifest.upsert(manifestEntry);
    return manifestEntryToResolved(manifestEntry);
  } catch (error) {
    console.warn('[AssetResolver] Failed to resolve image', error);
    return existing ? manifestEntryToResolved(existing) : null;
  }
}

export function subscribeToManifest(listener: (entries: ManifestEntry[]) => void) {
  return assetManifest.subscribe(listener);
}

export function getManifestEntry(context: AssetContext): ManifestEntry | undefined {
  const key = manifestKey(context);
  return key ? assetManifest.getEntry(key) : undefined;
}

export function updateManifestCredit(context: AssetContext, credit?: string) {
  const key = manifestKey(context);
  if (!key) return;
  assetManifest.updateCredit(key, credit);
}

export function toggleManifestLock(context: AssetContext, locked: boolean) {
  const key = manifestKey(context);
  if (!key) return;
  assetManifest.toggleLock(key, locked);
}

export function clearManifest(scope?: AssetScope) {
  assetManifest.clear(scope);
}
