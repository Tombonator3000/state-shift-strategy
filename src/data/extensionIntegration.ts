import { extensionManager } from './extensionSystem';

// Initialize extensions on app startup
export const initializeExtensionsOnStartup = async () => {
  try {
    console.log('🔄 Starting extension initialization...');
    await extensionManager.initializeExtensions();
    
    // Log the current state
    const enabledExtensions = extensionManager.getEnabledExtensions();
    const allCards = extensionManager.getAllExtensionCards();
    
    console.log(`✅ Extensions initialized successfully:`, {
      enabledExtensions: enabledExtensions.length,
      totalExtensionCards: allCards.length,
      extensionNames: enabledExtensions.map(e => e.name)
    });
    
    // Sample some cards for debugging
    if (allCards.length > 0) {
      console.log('📋 Sample extension cards:', allCards.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        faction: c.faction,
        hasFlavorTruth: !!c.flavorTruth,
        hasFlavorGov: !!c.flavorGov
      })));
    }
    
  } catch (error) {
    console.warn('❌ Failed to initialize extensions:', error);
  }
};

// Check if a card is from an extension
export const isExtensionCard = (cardId: string): boolean => {
  return extensionManager.getAllExtensionCards().some(card => card.id === cardId);
};

// Get extension info for a card
export const getCardExtensionInfo = (cardId: string) => {
  const extensionCard = extensionManager.getAllExtensionCards().find(card => card.id === cardId);
  if (!extensionCard?.extId) return null;
  
  const extension = extensionManager.getExtension(extensionCard.extId);
  return extension ? {
    id: extension.id,
    name: extension.name,
    version: extension.version
  } : null;
};