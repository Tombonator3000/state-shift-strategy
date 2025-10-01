import type { ParanormalSighting } from '@/types/paranormal';

const MAX_PARANORMAL_SIGHTINGS = 12;

export const upsertParanormalSighting = (
  sightings: ParanormalSighting[],
  entry: ParanormalSighting,
  maxEntries: number = MAX_PARANORMAL_SIGHTINGS,
): ParanormalSighting[] => {
  const index = sightings.findIndex(existing => existing.id === entry.id);

  if (index !== -1) {
    const existing = sightings[index];
    const hasMetadata = existing.metadata !== undefined || entry.metadata !== undefined;
    const metadata = hasMetadata ? { ...existing.metadata, ...entry.metadata } : undefined;
    const merged: ParanormalSighting = {
      ...existing,
      ...entry,
      metadata,
    };
    const next = sightings.slice();
    next[index] = merged;
    return next;
  }

  const next = [...sightings, entry];
  if (next.length > maxEntries) {
    return next.slice(next.length - maxEntries);
  }
  return next;
};
