import type { AssetScope, ManifestEntry, ManifestListener } from '../types';

const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';

const STORAGE_KEY = 'shadowgov:assets:manifest:v1';

type ManifestState = Record<string, ManifestEntry>;

const memoryState: { entries: ManifestState } = { entries: {} };

function canUseLocalStorage(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const key = '__shadowgov_manifest_test__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const useLocalStorage = canUseLocalStorage();

function loadFromStorage(): ManifestState {
  if (!useLocalStorage) {
    return { ...memoryState.entries };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as ManifestState;
    return parsed ?? {};
  } catch (error) {
    console.warn('[AssetManifest] Failed to parse manifest from storage', error);
    return {};
  }
}

function persist(state: ManifestState) {
  if (!useLocalStorage) {
    memoryState.entries = { ...state };
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[AssetManifest] Failed to persist manifest', error);
  }
}

function sortedEntries(state: ManifestState): ManifestEntry[] {
  return Object.values(state).sort((a, b) => b.updatedAt - a.updatedAt);
}

export class AssetManifest {
  private static instance: AssetManifest | null = null;

  static getInstance(): AssetManifest {
    if (!AssetManifest.instance) {
      AssetManifest.instance = new AssetManifest();
    }
    return AssetManifest.instance;
  }

  private state: ManifestState;
  private listeners = new Set<ManifestListener>();

  private constructor() {
    this.state = loadFromStorage();
  }

  getEntries(): ManifestEntry[] {
    return sortedEntries(this.state);
  }

  getEntry(key: string): ManifestEntry | undefined {
    return this.state[key];
  }

  upsert(entry: ManifestEntry): ManifestEntry {
    const next: ManifestState = {
      ...this.state,
      [entry.key]: { ...entry },
    };

    this.state = next;
    persist(this.state);
    this.emit();
    return entry;
  }

  updateCredit(key: string, credit: string | undefined): ManifestEntry | undefined {
    const existing = this.state[key];
    if (!existing) {
      return undefined;
    }

    const entry: ManifestEntry = {
      ...existing,
      credit: credit?.trim() || undefined,
      updatedAt: Date.now(),
    };

    this.state = {
      ...this.state,
      [key]: entry,
    };

    persist(this.state);
    this.emit();
    return entry;
  }

  toggleLock(key: string, locked: boolean): ManifestEntry | undefined {
    const existing = this.state[key];
    if (!existing) {
      return undefined;
    }

    const entry: ManifestEntry = {
      ...existing,
      locked,
      updatedAt: Date.now(),
    };

    this.state = {
      ...this.state,
      [key]: entry,
    };

    persist(this.state);
    this.emit();
    return entry;
  }

  clear(scope?: AssetScope) {
    if (!scope) {
      this.state = {};
    } else {
      const next: ManifestState = {};
      for (const entry of Object.values(this.state)) {
        if (entry.scope !== scope) {
          next[entry.key] = entry;
        }
      }
      this.state = next;
    }

    persist(this.state);
    this.emit();
  }

  subscribe(listener: ManifestListener): () => void {
    this.listeners.add(listener);
    listener(this.getEntries());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const entries = this.getEntries();
    for (const listener of this.listeners) {
      try {
        listener(entries);
      } catch (error) {
        console.warn('[AssetManifest] listener error', error);
      }
    }
  }
}

export const assetManifest = AssetManifest.getInstance();
