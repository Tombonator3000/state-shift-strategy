import { useCallback, useMemo } from 'react';

import { parapediaAtlas, type ParapediaEntry, type ParapediaStateSummary } from '@/data/parapedia/paranormalAtlas';

export type ParapediaSearchFilters = {
  category?: string;
  stateId?: string;
};

export type ParapediaLandingData = {
  totalEntries: number;
  totalStates: number;
  datasetNotes: string;
  generatedAt: string;
  trendingCategories: { category: string; count: number }[];
  featuredQuotes: { entryId: string; quote: string; attribution?: string }[];
};

const normalize = (value: string) => value.normalize('NFKD').toLowerCase();

const matchesQuery = (entry: ParapediaEntry, query: string) => {
  if (!query) {
    return true;
  }

  const needle = normalize(query);
  return (
    normalize(entry.name).includes(needle) ||
    entry.tags.some(tag => normalize(tag).includes(needle)) ||
    entry.timeline.some(event => normalize(event.title).includes(needle) || normalize(event.description).includes(needle))
  );
};

const matchesFilters = (entry: ParapediaEntry, filters: ParapediaSearchFilters) => {
  if (filters.category && entry.category !== filters.category) {
    return false;
  }

  if (filters.stateId && entry.stateId !== filters.stateId) {
    return false;
  }

  return true;
};

const buildLandingData = (): ParapediaLandingData => {
  const categoryCounts = new Map<string, number>();

  parapediaAtlas.entries.forEach(entry => {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  });

  const trendingCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const featuredQuotes = parapediaAtlas.entries
    .filter(entry => entry.featuredQuote)
    .map(entry => ({ entryId: entry.id, quote: entry.featuredQuote!, attribution: entry.quoteAttribution }))
    .slice(0, 5);

  return {
    totalEntries: parapediaAtlas.entries.length,
    totalStates: Object.keys(parapediaAtlas.states).length,
    datasetNotes: parapediaAtlas.datasetNotes,
    generatedAt: parapediaAtlas.generatedAt,
    trendingCategories,
    featuredQuotes,
  };
};

const searchEntries = (query: string, filters: ParapediaSearchFilters): ParapediaEntry[] => {
  return parapediaAtlas.entries.filter(entry => matchesQuery(entry, query) && matchesFilters(entry, filters));
};

export const useParapediaEntries = () => {
  const landingData = useMemo(() => buildLandingData(), []);

  const entryIndex = useMemo(() => {
    const index = new Map<string, ParapediaEntry>();
    parapediaAtlas.entries.forEach(entry => {
      index.set(entry.id, entry);
    });
    return index;
  }, []);

  const stateIndex = useMemo(() => new Map<string, ParapediaStateSummary>(Object.entries(parapediaAtlas.states)), []);

  const getEntryById = useCallback((entryId: string) => entryIndex.get(entryId), [entryIndex]);

  const getEntriesByState = useCallback((stateId: string) => {
    return parapediaAtlas.entries.filter(entry => entry.stateId === stateId);
  }, []);

  const queryEntries = useCallback((query: string, filters: ParapediaSearchFilters = {}) => {
    return searchEntries(query, filters);
  }, []);

  const getStateSummary = useCallback((stateId: string) => stateIndex.get(stateId), [stateIndex]);

  return {
    landingData,
    entries: parapediaAtlas.entries,
    categories: parapediaAtlas.categories,
    states: parapediaAtlas.states,
    getEntryById,
    getEntriesByState,
    queryEntries,
    getStateSummary,
  } as const;
};

export const useParapediaCategories = () => {
  return useMemo(() => parapediaAtlas.categories.slice(), []);
};

export const useParapediaStatePayload = (stateId: string | null) => {
  return useMemo(() => {
    if (!stateId) {
      return null;
    }

    const summary = parapediaAtlas.states[stateId];
    if (!summary) {
      return null;
    }

    const entries = parapediaAtlas.entries.filter(entry => entry.stateId === stateId);
    return { summary, entries } as const;
  }, [stateId]);
};
