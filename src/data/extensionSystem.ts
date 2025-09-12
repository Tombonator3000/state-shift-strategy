import type { GameCard } from '@/components/game/GameHand';

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

class ExtensionManager {
  private extensions: Map<string, Extension> = new Map();
  private enabledExtensions: EnabledExtension[] = [];

  constructor() {
    this.loadEnabledExtensions();
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
                extension.cards = extension.cards.map((card: ExtensionCard) => ({
                  ...card,
                  // Map single flavor field to faction-specific flavor fields
                  flavorGov: (card as any).flavor || '',
                  flavorTruth: (card as any).flavor || '',
                  extId: extension.id
                }));
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
                extension.cards = extension.cards.map((card: ExtensionCard) => ({
                  ...card,
                  // Map single flavor field to faction-specific flavor fields
                  flavorGov: (card as any).flavor || '',
                  flavorTruth: (card as any).flavor || '',
                  extId: extension.id
                }));
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
                extension.cards = extension.cards.map((card: ExtensionCard) => ({
                  ...card,
                  // Map single flavor field to faction-specific flavor fields
                  flavorGov: (card as any).flavor || '',
                  flavorTruth: (card as any).flavor || '',
                  extId: extension.id
                }));
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
              extension.cards = extension.cards.map((card: ExtensionCard) => ({
                ...card,
                // Map single flavor field to faction-specific flavor fields
                flavorGov: (card as any).flavor || '',
                flavorTruth: (card as any).flavor || '',
                extId: extension.id
              }));
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

  registerExtension(extension: Extension, source: 'cdn' | 'folder' | 'file') {
    this.extensions.set(extension.id, extension);
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
        // Map extension cards to match GameCard interface
        const mappedCards = extension.cards.map(card => ({
          ...card,
          // Map single flavor field to faction-specific flavor fields
          flavorGov: (card as any).flavor || '',
          flavorTruth: (card as any).flavor || '',
          extId: extension.id
        }));
        cards.push(...mappedCards);
      }
    }
    
    return cards;
  }

  getExtension(id: string): Extension | undefined {
    return this.extensions.get(id);
  }

  async initializeExtensions() {
    // Try to reload all enabled extensions
    const cdnExtensions = await this.scanCDNExtensions();
    
    for (const extension of cdnExtensions) {
      const enabled = this.enabledExtensions.find(e => e.id === extension.id);
      if (enabled) {
        this.registerExtension(extension, enabled.source);
      }
    }
  }
}

export const extensionManager = new ExtensionManager();