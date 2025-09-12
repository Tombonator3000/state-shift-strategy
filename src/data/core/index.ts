import type { GameCard } from '../../types/cardTypes';

/**
 * Samler ALLE exports som er arrays (CORE_BATCH_TRUTH_1..4, CORE_BATCH_GOV_1..4, osv.)
 * fra src/data/core/** automatisk ved build.
 */
const modules = import.meta.glob('../core/**/*.{ts,tsx,js,json}', { eager: true }) as Record<string, any>;

function flattenBatches(): GameCard[] {
  const arrays: GameCard[] = [];
  
  for (const path in modules) {
    const module = modules[path];
    
    // Check for named exports that are arrays
    for (const key of Object.keys(module)) {
      const value = (module as any)[key];
      if (Array.isArray(value) && value.length && typeof value[0] === 'object' && ('id' in value[0])) {
        arrays.push(...value);
      }
    }
    
    // Check for JSON with {cards:[...]} structure
    if (Array.isArray(module?.cards)) {
      arrays.push(...module.cards);
    }
    
    // Check for default export that is an array
    if (Array.isArray(module?.default)) {
      arrays.push(...module.default);
    }
  }
  
  console.log(`[CORE COLLECTOR] Found ${arrays.length} cards from ${Object.keys(modules).length} batch files`);
  return arrays;
}

export const CARD_DATABASE_CORE: GameCard[] = flattenBatches();