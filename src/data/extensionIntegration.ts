import { extensionManager } from './extensionSystem';

// Initialize extensions on app startup
export const initializeExtensionsOnStartup = async () => {
  try {
    await extensionManager.initializeExtensions();
    console.log('Extensions initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize extensions:', error);
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