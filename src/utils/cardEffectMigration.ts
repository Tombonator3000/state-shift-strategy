// Card Effect Migration Utilities
// Handles legacy card format compatibility

import type {
  Card as LegacyCard,
  CardEffects as LegacyCardEffects,
  CardEffects,
} from '@/types/cardEffects';
import type { GameCard, Faction } from '@/rules/mvp';

export class CardEffectMigrator {
  
  // Migrate legacy card format to new unified format
  static migrateCard(legacyCard: GameCard): GameCard {
    // Normalize faction to lowercase
    const faction = (legacyCard.faction as string)?.toLowerCase() as Faction;
    
    const migratedCard: GameCard = {
      id: legacyCard.id,
      name: legacyCard.name,
      type: legacyCard.type,
      faction,
      rarity: legacyCard.rarity || 'common',
      cost: legacyCard.cost,
      text: legacyCard.text,
      flavorTruth: legacyCard.flavorTruth || '',
      flavorGov: legacyCard.flavorGov || '',
      effects: legacyCard.effects || this.inferEffectsFromText(legacyCard),
      target: legacyCard.target
    };

    
    return migratedCard;
  }

  // Infer effects from card text for cards without effects data
  private static inferEffectsFromText(card: GameCard): CardEffects | undefined {
    const text = card.text || '';
    const effects: CardEffects = {};
    
    // Parse truth changes
    const truthMatch = text.match(/([+-]?\d+)%?\s*Truth/i);
    if (truthMatch) {
      effects.truthDelta = parseInt(truthMatch[1]);
    }
    
    // Parse IP changes
    const ipGainMatch = text.match(/(?:Gain|Get|\+)\s*([+-]?\d+)\s*IP/i);
    if (ipGainMatch) {
      effects.ipDelta = { self: parseInt(ipGainMatch[1]) };
    }
    
    const ipLossMatch = text.match(/(?:loses?|costs?)\s*(\d+)\s*IP/i);
    if (ipLossMatch) {
      if (!effects.ipDelta) effects.ipDelta = {};
      effects.ipDelta.opponent = -parseInt(ipLossMatch[1]);
    }
    
    // Parse card draw
    const drawMatch = text.match(/Draw\s*(\d+)\s*cards?/i);
    if (drawMatch) {
      effects.draw = parseInt(drawMatch[1]);
    }
    
    // Parse pressure
    const pressureMatch = text.match(/([+-]?\d+)\s*Pressure/i);
    if (pressureMatch) {
      effects.pressureDelta = parseInt(pressureMatch[1]);
    }
    
    // Parse damage (not in v2.1E whitelist, skip)
    // const damageMatch = text.match(/(?:Deal|Deals?)\s*(\d+)(?:-(\d+))?\s*damage/i);
    
    // Parse conditionals - basic truth threshold detection
    const truthConditionMatch = text.match(/If\s*Truth\s*[≥>=]\s*(\d+)%?[,:]\s*(.+)/i);
    if (truthConditionMatch) {
      const threshold = parseInt(truthConditionMatch[1]);
      const thenText = truthConditionMatch[2];
      
      // Try to parse the conditional effect
      const conditionalEffects = this.parseSimpleEffect(thenText);
      if (conditionalEffects) {
        effects.conditional = {
          ifTruthAtLeast: threshold,
          then: conditionalEffects
        };
      }
    }
    
    // Add targeting requirement for ZONE cards (remove requiresTarget as it's not in v2.1E)
    // ZONE cards have explicit target in card definition
    
    return Object.keys(effects).length > 0 ? effects : undefined;
  }
  
  // Parse simple effect strings for conditional effects
  private static parseSimpleEffect(text: string): CardEffects | undefined {
    const effects: CardEffects = {};
    
    const ipMatch = text.match(/([+-]?\d+)\s*IP/i);
    if (ipMatch) {
      effects.ipDelta = { self: parseInt(ipMatch[1]) };
    }
    
    const truthMatch = text.match(/([+-]?\d+)%?\s*Truth/i);
    if (truthMatch) {
      effects.truthDelta = parseInt(truthMatch[1]);
    }
    
    return Object.keys(effects).length > 0 ? effects : undefined;
  }

  // Normalize legacy effect properties to new schema
  static normalizeEffects(effects: any): CardEffects {
    const normalized: CardEffects = {};
    
    // Handle legacy property names
    if (effects.truth !== undefined) {
      normalized.truthDelta = effects.truth;
    }
    if (effects.truthDelta !== undefined) {
      normalized.truthDelta = effects.truthDelta;
    }
    
    if (effects.ip !== undefined) {
      normalized.ipDelta = { self: effects.ip };
    }
    if (effects.ipDelta !== undefined) {
      normalized.ipDelta = effects.ipDelta;
    }
    
    if (effects.pressure !== undefined) {
      normalized.pressureDelta = effects.pressure;
    }
    if (effects.pressureDelta !== undefined) {
      normalized.pressureDelta = effects.pressureDelta;
    }
    
    // Copy over valid v2.1E properties only
    const validProps = [
      'draw', 'discardOpponent', 'zoneDefense', 'conditional'
    ];
    
    for (const prop of validProps) {
      if (effects[prop] !== undefined) {
        (normalized as any)[prop] = effects[prop];
      }
    }
    
    return normalized;
  }

  // Batch migrate all cards in a database
  static migrateCardDatabase(cards: GameCard[]): GameCard[] {
    return cards.map(card => this.migrateCard(card));
  }
}