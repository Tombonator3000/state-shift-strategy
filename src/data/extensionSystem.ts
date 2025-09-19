import type { GameCard } from '@/rules/mvp';
import { repairToMVP, validateCardMVP } from '@/mvp/validator';

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
const DEV = typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV;

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
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.enabledExtensions = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load enabled extensions:', error);
      this.enabledExtensions = [];
    }
  }

  private saveEnabledExtensions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.enabledExtensions));
    } catch (error) {
      console.warn('Failed to save enabled extensions:', error);
    }
  }

  private loadPersistedExtensions() {
    this.persistedExtensions.clear();

    try {
      const stored = localStorage.getItem(PAYLOAD_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Record<string, Extension>;
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
      localStorage.setItem(PAYLOAD_STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Failed to save persisted extensions:', error);
    }
  }

  async scanCDNExtensions(): Promise<Extension[]> {
    const extensions: Extension[] = [];
    const timestamp = Date.now();
    
    try {
      console.log(`🔄 Scanning CDN extensions with timestamp: ${timestamp}`);
      
      // Try to load manifest first with cache-busting
      const manifestResponse = await fetch(`/extensions/manifest.json?t=${timestamp}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        console.log(`📋 CDN Manifest loaded:`, manifest);
        
        for (const file of manifest.files || []) {
          try {
            console.log(`📥 Loading CDN extension: ${file}`);
            const extensionResponse = await fetch(`/extensions/${file}?t=${timestamp}`, { 
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (extensionResponse.ok) {
              const extension = await extensionResponse.json();
              console.log(`✅ CDN Extension loaded:`, extension.name, extension.version);
              
              if (this.validateExtension(extension)) {
                extension.cards = this.prepareExtensionCards(extension.cards, extension.id);
                extensions.push(extension);
              }
            } else {
              console.warn(`❌ Failed to load CDN extension ${file}: ${extensionResponse.status}`);
            }
          } catch (error) {
            console.warn(`💥 Failed to load CDN extension ${file}:`, error);
          }
        }
      } else {
        console.warn('⚠️ CDN Manifest not found, trying fallback extensions');
        // Try known extensions if no manifest
        const knownExtensions = ['cryptids.json'];
        for (const file of knownExtensions) {
          try {
            const response = await fetch(`/extensions/${file}?t=${timestamp}`, { 
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            });
            if (response.ok) {
              const extension = await response.json();
              if (this.validateExtension(extension)) {
                extension.cards = this.prepareExtensionCards(extension.cards, extension.id);
                extensions.push(extension);
              }
            }
          } catch (error) {
            // Silently ignore missing files
          }
        }
      }
    } catch (error) {
      console.warn('💥 CDN extension scan failed:', error);
    }
    
    console.log(`🎮 CDN scan complete: ${extensions.length} extensions found`);
    return extensions;
  }

  async loadFromFolderPicker(): Promise<Extension[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files) return resolve([]);
        
        const extensions: Extension[] = [];
        
        for (const file of Array.from(files)) {
          if (file.name.endsWith('.json')) {
            try {
              const text = await file.text();
              const extension = JSON.parse(text);
              if (this.validateExtension(extension)) {
                extension.cards = this.prepareExtensionCards(extension.cards, extension.id);
                extensions.push(extension);
              }
            } catch (error) {
              console.warn(`Failed to parse ${file.name}:`, error);
            }
          }
        }
        
        resolve(extensions);
      };
      
      input.click();
    });
  }

  async loadFromFilePicker(): Promise<Extension[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files) return resolve([]);
        
        const extensions: Extension[] = [];
        
        for (const file of Array.from(files)) {
          try {
            const text = await file.text();
            const extension = JSON.parse(text);
            if (this.validateExtension(extension)) {
              extension.cards = this.prepareExtensionCards(extension.cards, extension.id);
              extensions.push(extension);
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

  private validateExtension(extension: any): boolean {
    const isValid = (
      extension &&
      typeof extension.id === 'string' &&
      typeof extension.name === 'string' &&
      typeof extension.version === 'string' &&
      typeof extension.author === 'string' &&
      Array.isArray(extension.factions) &&
      Array.isArray(extension.cards) &&
      extension.cards.every((card: any) => 
        card.id && card.faction && card.name && card.type && card.cost !== undefined
      )
    );
    
    if (!isValid) {
      console.warn('❌ Extension validation failed:', {
        hasId: !!extension?.id,
        hasName: !!extension?.name,
        hasVersion: !!extension?.version,
        hasAuthor: !!extension?.author,
        hasFactions: Array.isArray(extension?.factions),
        hasCards: Array.isArray(extension?.cards),
        cardCount: extension?.cards?.length || 0,
        firstCardValid: extension?.cards?.[0] ? {
          hasId: !!extension.cards[0].id,
          hasFaction: !!extension.cards[0].faction,
          hasName: !!extension.cards[0].name,
          hasType: !!extension.cards[0].type,
          hasCost: extension.cards[0].cost !== undefined
        } : 'no cards'
      });
    }
    
    return isValid;
  }

  private sanitizeExtensionCard(card: any, extensionId: string): ExtensionCard | null {
    const source = { ...card, extId: extensionId };
    const { card: repaired, errors, changes } = repairToMVP(source);
    const validation = validateCardMVP(repaired);

    if (DEV) {
      if (changes.length > 0) {
        console.info(`[EXTENSION:${extensionId}] ${repaired.id}: ${changes.join('; ')}`);
      }
      if (errors.length > 0) {
        console.warn(`[EXTENSION:${extensionId}] ${repaired.id}: ${errors.join('; ')}`);
      }
      if (!validation.ok) {
        console.warn(
          `[EXTENSION:${extensionId}] ${repaired.id}: ${validation.errors.join('; ')}`,
        );
      }
    }

    if (!validation.ok) {
      return null;
    }

    return { ...repaired, extId: extensionId };
  }

  private prepareExtensionCards(cards: ExtensionCard[], extensionId: string): ExtensionCard[] {
    return cards
      .map(card => this.sanitizeExtensionCard(card, extensionId))
      .filter((card): card is ExtensionCard => card !== null);
  }

  private sanitizeExtension(extension: Extension): Extension {
    return {
      ...extension,
      cards: this.prepareExtensionCards(extension.cards, extension.id)
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