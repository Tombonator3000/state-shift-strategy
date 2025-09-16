// MVP Validator - Hard gate for build failures
// Ensures all cards follow MVP restrictions

import type { MVPCard, CardType, Rarity } from '@/types/mvp-types';

export interface ValidationError {
  cardId: string;
  error: string;
}

export function validateMVPCard(card: MVPCard): ValidationError[] {
  const errors: ValidationError[] = [];
  const { id, type, rarity, faction, effects } = card;

  // Check valid types
  if (!["ATTACK", "MEDIA", "ZONE"].includes(type)) {
    errors.push({ cardId: id, error: `Invalid type: ${type}. Must be ATTACK, MEDIA, or ZONE` });
  }

  // Check valid rarity
  if (!["common", "uncommon", "rare", "legendary"].includes(rarity)) {
    errors.push({ cardId: id, error: `Invalid rarity: ${rarity}` });
  }

  // Check lowercase faction
  if (!["truth", "government"].includes(faction)) {
    errors.push({ cardId: id, error: `Invalid faction: ${faction}. Must be lowercase "truth" or "government"` });
  }

  // Validate effects per type
  switch (type) {
    case "ATTACK":
      validateATTACKEffects(id, effects, errors);
      break;
    case "MEDIA":
      validateMEDIAEffects(id, effects, errors);
      break;
    case "ZONE":
      validateZONEEffects(id, effects, errors);
      break;
  }

  return errors;
}

function validateATTACKEffects(cardId: string, effects: any, errors: ValidationError[]) {
  const allowedKeys = ["ipDelta", "discardOpponent"];
  const actualKeys = Object.keys(effects);
  
  // Check for forbidden keys
  const forbiddenKeys = actualKeys.filter(key => !allowedKeys.includes(key));
  if (forbiddenKeys.length > 0) {
    errors.push({ 
      cardId, 
      error: `ATTACK card has forbidden effects: ${forbiddenKeys.join(", ")}. Only allowed: ${allowedKeys.join(", ")}` 
    });
  }

  // Must have ipDelta.opponent > 0
  if (!effects.ipDelta?.opponent || effects.ipDelta.opponent <= 0) {
    errors.push({ 
      cardId, 
      error: "ATTACK card must have ipDelta.opponent > 0" 
    });
  }

  // discardOpponent must be 0-2 if present
  if (effects.discardOpponent !== undefined) {
    if (typeof effects.discardOpponent !== "number" || effects.discardOpponent < 0 || effects.discardOpponent > 2) {
      errors.push({ 
        cardId, 
        error: "ATTACK card discardOpponent must be 0-2" 
      });
    }
  }
}

function validateMEDIAEffects(cardId: string, effects: any, errors: ValidationError[]) {
  const allowedKeys = ["truthDelta"];
  const actualKeys = Object.keys(effects);
  
  // Check for forbidden keys
  const forbiddenKeys = actualKeys.filter(key => !allowedKeys.includes(key));
  if (forbiddenKeys.length > 0) {
    errors.push({ 
      cardId, 
      error: `MEDIA card has forbidden effects: ${forbiddenKeys.join(", ")}. Only allowed: ${allowedKeys.join(", ")}` 
    });
  }

  // Must have truthDelta
  if (typeof effects.truthDelta !== "number") {
    errors.push({ 
      cardId, 
      error: "MEDIA card must have numeric truthDelta" 
    });
  }
}

function validateZONEEffects(cardId: string, effects: any, errors: ValidationError[]) {
  const allowedKeys = ["pressureDelta"];
  const actualKeys = Object.keys(effects);
  
  // Check for forbidden keys
  const forbiddenKeys = actualKeys.filter(key => !allowedKeys.includes(key));
  if (forbiddenKeys.length > 0) {
    errors.push({ 
      cardId, 
      error: `ZONE card has forbidden effects: ${forbiddenKeys.join(", ")}. Only allowed: ${allowedKeys.join(", ")}` 
    });
  }

  // Must have pressureDelta > 0
  if (typeof effects.pressureDelta !== "number" || effects.pressureDelta <= 0) {
    errors.push({ 
      cardId, 
      error: "ZONE card must have pressureDelta > 0" 
    });
  }
}

export function validateMVPDatabase(cards: MVPCard[]): ValidationError[] {
  const allErrors: ValidationError[] = [];
  
  for (const card of cards) {
    const cardErrors = validateMVPCard(card);
    allErrors.push(...cardErrors);
  }
  
  return allErrors;
}

// Build-time validation function
export function validateForBuild(cards: MVPCard[]): void {
  const errors = validateMVPDatabase(cards);
  
  if (errors.length > 0) {
    console.error("❌ MVP Validation Failed:");
    errors.forEach(error => {
      console.error(`  ${error.cardId}: ${error.error}`);
    });
    throw new Error(`MVP validation failed with ${errors.length} errors`);
  }
  
  console.log("✅ MVP validation passed");
}