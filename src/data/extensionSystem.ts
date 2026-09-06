import type { GameCard } from '@/rules/mvp';
import { fetchAssetJson } from '@/lib/fetchAssetJson';
import { readExpansionCard } from '@/lib/expansions/cardValidation';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

export interface ExtensionCard extends GameCard {
  extId?: string; // Extension ID for tracking
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  factions: ('government' | 'truth')[];
  count: number;
  cards: ExtensionCard[];
  tempImageId?: string;
}

export interface EnabledExtension {
  id: string;
  name: string;
  version: string;
  source: 'cdn' | 'folder' | 'file';
  handleKey?: string;
}

const STORAGE_KEY = 'sg_enabled_extensions';
const PAYLOAD_STORAGE_KEY = 'sg_extension_payloads';
type RawExtension = Omit<Extension, 'cards' | 'count' | 'description' | 'factions'> & {
  cards: unknown[];
  description?: unknown;
  count?: unknown;
  factions?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isEnabledExtension = (value: unknown): value is EnabledExtension =>
  isRecord(value) && typeof value.id === 'string' && value.id.length > 0 && typeof value.name === 'string'
  && typeof value.version === 'string'
  && (value.handleKey === undefined || typeof value.handleKey === 'string')
  && (value.source === 'cdn' || value.source === 'file' || value.source === 'folder');

export class ExtensionManager {
  private extensions: Map<string, Extension> = new Map();
  private enabledExtensions: EnabledExtension[] = [];
  private persistedExtensions: Map<string, Extension> = new Map();

  constructor() {
    this.loadEnabledExtensions();
    this.loadPersistedExtensions();
  }

  private loadEnabledExtensions() {
    try {
      const stored = safeGetLocalStorageItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        this.enabledExtensions = Array.isArray(parsed) ? parsed.filter(isEnabledExtension) : [];
      }
    } catch (error) {
      console.warn('Failed to load enabled extensions:', error);
      this.enabledExtensions = [];
    }
  }

  private saveEnabledExtensions() {
    try {
      safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(this.enabledExtensions));
    } catch (error) {
      console.warn('Failed to save enabled extensions:', error);
    }
  }

  private loadPersistedExtensions() {
    this.persistedExtensions.clear();

    try {
      const stored = safeGetLocalStorageItem(PAYLOAD_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed: unknown = JSON.parse(stored);
      if (!isRecord(parsed)) return;
      let needsSave = false;

      for (const extension of Object.values(parsed)) {
        if (this.validateExtension(extension)) {
          const sanitized = this.sanitizeExtension(extension);
          this.persistedExtensions.set(sanitized.id, sanitized);
        } else {
          needsSave = true;
        }
      }

      if (needsSave) {
        this.savePersistedExtensions();
      }
    } catch (error) {
      console.warn('Failed to load persisted extensions:', error);
      this.persistedExtensions.clear();
    }
  }

  private savePersistedExtensions() {
    try {
      const serialized = JSON.stringify(Object.fromEntries(this.persistedExtensions.entries()));
      safeSetLocalStorageItem(PAYLOAD_STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Failed to save persisted extensions:', error);
    }
  }

  async scanCDNExtensions(): Promise<Extension[]> {
    let files = ['cryptids.json'];
    try {
      const manifest = await fetchAssetJson('/extensions/manifest.json');
      if (isRecord(manifest) && Array.isArray(manifest.files)) {
        files = manifest.files.filter((file): file is string => typeof file === 'string');
      }
    } catch (error) {
      console.warn('[Extensions] Manifest unavailable; checking known extensions', error);
    }

    const extensions = await Promise.all([...new Set(files)].map(async file => {
      try {
        const raw = await fetchAssetJson(`/extensions/${file}`);
        return this.validateExtension(raw) ? this.sanitizeExtension(raw) : null;
      } catch (error) {
        console.warn(`[Extensions] Failed to load ${file}`, error);
        return null;
      }
    }));
    return extensions.filter((extension): extension is Extension => extension !== null && extension.cards.length > 0);
  }

  async loadFromFolderPicker(): Promise<Extension[]> {
    return this.pickExtensions(true);
  }

  async loadFromFilePicker(): Promise<Extension[]> {
    return this.pickExtensions(false);
  }

  private pickExtensions(directory: boolean): Promise<Extension[]> {
    if (typeof document === 'undefined') return Promise.resolve([]);
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.json';
      input.webkitdirectory = directory;
      input.oncancel = () => resolve([]);
      input.onchange = async () => {
        const extensions: Extension[] = [];
        for (const file of Array.from(input.files ?? [])) {
          if (!file.name.toLowerCase().endsWith('.json')) continue;
          try {
            const raw: unknown = JSON.parse(await file.text());
            if (this.validateExtension(raw)) {
              const extension = this.sanitizeExtension(raw);
              if (extension.cards.length > 0) extensions.push(extension);
            }
          } catch (error) {
            console.warn(`Failed to parse ${file.name}:`, error);
          }
        }
        resolve(extensions);
      };
      input.click();
    });
  }

  private validateExtension(extension: unknown): extension is RawExtension {
    const valid = isRecord(extension)
      && typeof extension.id === 'string' && extension.id.length > 0
      && typeof extension.name === 'string'
      && typeof extension.version === 'string'
      && typeof extension.author === 'string'
      && (extension.factions === undefined || (Array.isArray(extension.factions)
        && extension.factions.every(faction => faction === 'truth' || faction === 'government')))
      && (extension.tempImageId === undefined || typeof extension.tempImageId === 'string')
      && Array.isArray(extension.cards)
      && extension.cards.every(card => isRecord(card)
        && typeof card.id === 'string' && card.id.length > 0
        && typeof card.faction === 'string'
        && typeof card.name === 'string' && typeof card.type === 'string'
        && card.cost !== undefined);
    if (!valid) console.warn('[Extensions] Invalid extension data');
    return valid;
  }

  private sanitizeExtensionCard(card: unknown, extensionId: string): ExtensionCard | null {
    const result = readExpansionCard(card);
    return result.card ? { ...result.card, extId: extensionId } : null;
  }

  private prepareExtensionCards(cards: unknown[], extensionId: string): ExtensionCard[] {
    return cards
      .map(card => this.sanitizeExtensionCard(card, extensionId))
      .filter((card): card is ExtensionCard => card !== null);
  }

  private sanitizeExtension(extension: RawExtension): Extension {
    const cards = this.prepareExtensionCards(extension.cards, extension.id);
    return {
      ...extension,
      description: typeof extension.description === 'string' ? extension.description : '',
      factions: [...new Set(cards.map(card => card.faction.toLowerCase())
        .filter((faction): faction is 'truth' | 'government' => faction === 'truth' || faction === 'government'))],
      count: cards.length,
      cards,
    };
  }

  registerExtension(extension: Extension, source: 'cdn' | 'folder' | 'file') {
    const sanitizedExtension = this.sanitizeExtension(extension);
    this.extensions.set(extension.id, sanitizedExtension);

    if (source === 'cdn') {
      if (this.persistedExtensions.delete(extension.id)) {
        this.savePersistedExtensions();
      }
      return;
    }

    this.persistedExtensions.set(extension.id, sanitizedExtension);
    this.savePersistedExtensions();
  }

  enableExtension(extension: Extension, source: 'cdn' | 'folder' | 'file') {
    this.registerExtension(extension, source);
    
    const existingIndex = this.enabledExtensions.findIndex(e => e.id === extension.id);
    const enabled: EnabledExtension = {
      id: extension.id,
      name: extension.name,
      version: extension.version,
      source
    };
    
    if (existingIndex >= 0) {
      this.enabledExtensions[existingIndex] = enabled;
    } else {
      this.enabledExtensions.push(enabled);
    }
    
    this.saveEnabledExtensions();
  }

  disableExtension(extensionId: string) {
    this.enabledExtensions = this.enabledExtensions.filter(e => e.id !== extensionId);
    this.extensions.delete(extensionId);
    if (this.persistedExtensions.delete(extensionId)) {
      this.savePersistedExtensions();
    }
    this.saveEnabledExtensions();
  }

  isExtensionEnabled(extensionId: string): boolean {
    return this.enabledExtensions.some(e => e.id === extensionId);
  }

  getEnabledExtensions(): EnabledExtension[] {
    return [...this.enabledExtensions];
  }

  getAllExtensionCards(): ExtensionCard[] {
    const cards: ExtensionCard[] = [];
    
    for (const enabled of this.enabledExtensions) {
      const extension = this.extensions.get(enabled.id);
      if (extension) {
        cards.push(...extension.cards.map(card => ({ ...card, extId: extension.id })));
      }
    }

    return cards;
  }

  getExtension(id: string): Extension | undefined {
    return this.extensions.get(id);
  }

  async initializeExtensions() {
    // Clear any cached extensions to force reload
    this.extensions.clear();

    // Try to reload all enabled extensions
    const cdnExtensions = await this.scanCDNExtensions();

    console.log(`🎮 Extension initialization: found ${cdnExtensions.length} CDN extensions`);

    for (const extension of cdnExtensions) {
      const enabled = this.enabledExtensions.find(
        e => e.id === extension.id && e.source === 'cdn'
      );
      if (enabled) {
        console.log(`✅ Re-registering enabled CDN extension: ${extension.name} v${extension.version}`);
        this.registerExtension(extension, enabled.source);
      }
    }

    const missingLocalExtensions: string[] = [];

    for (const enabled of this.enabledExtensions) {
      if (enabled.source === 'cdn') {
        continue;
      }

      const stored = this.persistedExtensions.get(enabled.id);
      if (stored) {
        console.log(`✅ Restoring persisted extension: ${stored.name} v${stored.version}`);
        this.registerExtension(stored, enabled.source);
      } else {
        console.warn(
          `⚠️ Unable to restore extension '${enabled.id}' from persisted data. Disabling.`
        );
        missingLocalExtensions.push(enabled.id);
      }
    }

    for (const extensionId of missingLocalExtensions) {
      this.disableExtension(extensionId);
    }

    const allExtensionCards = this.getAllExtensionCards();
    console.log(
      `🎯 Extension initialization complete: ${allExtensionCards.length} cards available from ${this.extensions.size} extensions`
    );
  }
}

export const extensionManager = new ExtensionManager();

export function getExtensionCardsSnapshot(): ExtensionCard[] {
  try {
    return extensionManager.getAllExtensionCards();
  } catch {
    return [];
  }
}
