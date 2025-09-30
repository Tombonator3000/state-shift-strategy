import type { ManifestEntry } from '../types';

export function normalizeCredit(credit?: string): string | undefined {
  if (!credit) return undefined;
  const trimmed = credit.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\s+/g, ' ');
}

export function formatCredit(entry: Pick<ManifestEntry, 'credit' | 'provider' | 'license'>): string {
  const parts: string[] = [];
  if (entry.credit) {
    parts.push(entry.credit);
  }
  if (entry.provider) {
    parts.push(`via ${entry.provider}`);
  }
  if (entry.license) {
    parts.push(`(${entry.license})`);
  }
  return parts.join(' ');
}

export function mergeCredit(existing: string | undefined, incoming: string | undefined): string | undefined {
  const normalizedExisting = normalizeCredit(existing);
  const normalizedIncoming = normalizeCredit(incoming);
  if (!normalizedExisting) return normalizedIncoming;
  if (!normalizedIncoming) return normalizedExisting;
  if (normalizedExisting.toLowerCase() === normalizedIncoming.toLowerCase()) {
    return normalizedExisting;
  }
  return `${normalizedExisting}; ${normalizedIncoming}`;
}
