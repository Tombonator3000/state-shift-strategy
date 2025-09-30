import type { GameCard } from '@/rules/mvp';
import type { GameEvent } from '@/data/eventDatabase';
import type { NewsArticle } from '@/types';

export type AssetScope = 'card' | 'event' | 'article';

export interface AssetContext {
  scope: AssetScope;
  card?: GameCard;
  event?: GameEvent;
  article?: NewsArticle;
  /** Optional override for image tags */
  tags?: string[];
  /** Optional fallback URL when providers fail */
  fallbackUrl?: string;
}

export interface AssetCandidate {
  id: string;
  url: string;
  provider: string;
  credit?: string;
  license?: string;
  tags?: string[];
  locked?: boolean;
  thumbnailUrl?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface ResolvedAsset {
  key: string;
  url: string;
  styledUrl: string;
  provider: string;
  credit?: string;
  license?: string;
  locked: boolean;
  updatedAt: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface AssetProviderResult {
  candidates: AssetCandidate[];
  licenseHint?: string;
}

export interface AssetProvider {
  id: string;
  /** Providers with lower priority run first */
  priority: number;
  /**
   * Returns true when the provider should be skipped for the given context.
   */
  shouldSkip(context: AssetContext): boolean;
  /**
   * Attempt to fetch assets that match the query and context.
   */
  fetchAssets(query: QueryPlan, context: AssetContext): Promise<AssetProviderResult>;
}

export interface QueryPlan {
  terms: string[];
  includeTags: string[];
  excludeTerms: string[];
  licensePreference?: 'cc' | 'public-domain' | 'any';
}

export interface RankingContext {
  scope: AssetScope;
  desiredTags: string[];
  licensePreference?: QueryPlan['licensePreference'];
  card?: GameCard;
  event?: GameEvent;
  article?: NewsArticle;
}

export interface ManifestEntry {
  key: string;
  scope: AssetScope;
  url: string;
  styledUrl: string;
  provider: string;
  credit?: string;
  license?: string;
  locked: boolean;
  tags: string[];
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
  updatedAt: number;
}

export type ManifestListener = (entries: ManifestEntry[]) => void;
