import fs from 'fs';
import path from 'path';

import type { ManifestEntry } from '@/services/assets/types';
import { assetManifest } from '@/services/assets/storage/AssetManifest';
import { relockOfficialAssets } from '@/services/assets/relockOfficialAssets';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'card-art-manifest.json');

interface StorageLike {
  readonly length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

class MemoryStorage implements StorageLike {
  private store: Record<string, string> = {};

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

function ensureStorage() {
  if (typeof globalThis.localStorage === 'undefined') {
    const storage = new MemoryStorage();
    (globalThis as any).localStorage = storage;
    if (typeof globalThis.window === 'undefined') {
      (globalThis as any).window = { localStorage: storage };
    } else if (typeof (globalThis as any).window.localStorage === 'undefined') {
      (globalThis as any).window.localStorage = storage;
    }
  }
}

function loadManifestFromDisk(filePath: string): ManifestEntry[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ManifestEntry[];
    if (!Array.isArray(parsed)) {
      throw new Error('Manifest payload is not an array');
    }
    return parsed;
  } catch (error) {
    console.warn('[relock-official-assets] Failed to parse existing manifest, starting from empty.', error);
    return [];
  }
}

function persistManifest(filePath: string, entries: ManifestEntry[]) {
  const serialized = `${JSON.stringify(entries, null, 2)}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, serialized, 'utf8');
}

async function main() {
  ensureStorage();

  const existing = loadManifestFromDisk(OUTPUT_PATH);
  if (existing.length > 0) {
    for (const entry of existing) {
      assetManifest.upsert(entry);
    }
  }

  const summary = await relockOfficialAssets({
    cleanupDownloads: true,
    clearAutofillCache: true,
    logger: (message, context) => {
      const payload = context ? ` ${JSON.stringify(context)}` : '';
      console.log(`[relock-official-assets] ${message}${payload}`);
    },
  });

  const entries = assetManifest.getEntries();
  persistManifest(OUTPUT_PATH, entries);

  console.log(
    `[relock-official-assets] Completed in ${summary.durationMs}ms ` +
      `(${summary.relocked}/${summary.processed} official entries, ${summary.downloadEntriesRemoved} downloads removed).`,
  );

  if (summary.errors.length > 0) {
    console.warn('[relock-official-assets] Encountered errors:');
    for (const issue of summary.errors) {
      console.warn(` - ${issue.cardId}: ${issue.message}`);
    }
  }
}

main().catch(error => {
  console.error('[relock-official-assets] Fatal error', error);
  process.exitCode = 1;
});
