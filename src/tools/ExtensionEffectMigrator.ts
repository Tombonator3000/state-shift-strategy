// Extension Effect Migration Tool
// Converts extension cards from old array format to new CardEffects schema

import { CardEffects } from '@/types/cardEffects';

interface LegacyEffect {
  k: string;
  v?: number;
  who?: string;
  target?: string;
  name?: string;
  value?: any;
  type?: string;
  count?: number;
  cond?: string;
  then?: LegacyEffect[];
}

interface ExtensionCard {
  id: string;
  faction: string;
  name: string;
  type: string;
  rarity: string;
  cost: number;
  target?: string | null;
  text: string;
  flavor: string;
  effects: LegacyEffect[];
  imageId?: string;
}

export class ExtensionEffectMigrator {
  static migrateCard(extensionCard: ExtensionCard): any {
    const migratedCard = {
      id: extensionCard.id,
      faction: extensionCard.faction === 'government' ? 'Government' : 'Truth',
      name: extensionCard.name,
      type: extensionCard.type,
      rarity: extensionCard.rarity,
      cost: extensionCard.cost,
      text: extensionCard.text,
      flavorTruth: extensionCard.flavor,
      flavorGov: extensionCard.flavor,
      target: this.migrateTarget(extensionCard.target),
      effects: this.migrateEffects(extensionCard.effects)
    };

    return migratedCard;
  }

  private static migrateTarget(target: string | null): any {
    if (!target) return { scope: "global" };
    
    switch (target) {
      case "state": return { scope: "state" };
      case "zone": return { scope: "controlled" };
      case "ai": return { scope: "opponent" };
      default: return { scope: "global" };
    }
  }

  private static migrateEffects(legacyEffects: LegacyEffect[]): CardEffects {
    const effects: CardEffects = {};
    
    for (const effect of legacyEffects) {
      this.processLegacyEffect(effect, effects);
    }
    
    return effects;
  }

  private static processLegacyEffect(effect: LegacyEffect, effects: CardEffects): void {
    switch (effect.k) {
      case 'truth':
        effects.truthDelta = (effects.truthDelta || 0) + (effect.v || 0);
        break;
        
      case 'ip':
        if (!effects.ipDelta) effects.ipDelta = {};
        if (effect.who === 'player') {
          effects.ipDelta.self = (effects.ipDelta.self || 0) + (effect.v || 0);
        } else if (effect.who === 'ai') {
          effects.ipDelta.opponent = (effects.ipDelta.opponent || 0) + (effect.v || 0);
        }
        break;
        
      case 'pressure':
        if (effect.who === 'player') {
          const currentPressure = effects.pressureDelta || 0;
          const currentValue = typeof currentPressure === 'number' ? currentPressure : 0;
          effects.pressureDelta = currentValue + (effect.v || 0);
        }
        break;
        
      case 'flag':
        this.processFlagEffect(effect, effects);
        break;
        
      case 'development':
        // Development cards create ongoing effects
        effects.tags = effects.tags || [];
        effects.tags.push(`development:${effect.type}:${effect.value}`);
        effects.duration = "permanent";
        break;
        
      case 'conditional':
        this.processConditionalEffect(effect, effects);
        break;
    }
  }

  private static processFlagEffect(effect: LegacyEffect, effects: CardEffects): void {
    switch (effect.name) {
      case 'bonusDraw':
        effects.draw = (effects.draw || 0) + (effect.value || 1);
        break;
        
      case 'forceDiscard':
        if (effect.target === 'ai') {
          effects.discardOpponent = (effects.discardOpponent || 0) + (effect.value || 1);
        } else {
          effects.discardSelf = (effects.discardSelf || 0) + (effect.value || 1);
        }
        break;
        
      case 'skipAction':
        effects.tags = effects.tags || [];
        effects.tags.push('skipOpponentTurn');
        break;
        
      case 'immune':
      case 'blockAttack':
        effects.tags = effects.tags || [];
        effects.tags.push(`defense:${effect.name}:${effect.value}`);
        effects.duration = "thisTurn";
        break;
        
      case 'zoneCostReduction':
      case 'mediaCostReduction':
        effects.tags = effects.tags || [];
        effects.tags.push(`costReduction:${effect.name}:${effect.value}`);
        effects.duration = "nextTurn";
        break;
        
      case 'extraTurn':
        effects.tags = effects.tags || [];
        effects.tags.push('extraTurn');
        break;
    }
  }

  private static processConditionalEffect(effect: LegacyEffect, effects: CardEffects): void {
    if (!effect.cond || !effect.then) return;
    
    // Parse condition string like "gs.truthLevel>60"
    const condition: any = {};
    
    if (effect.cond.includes('truthLevel>')) {
      const value = parseInt(effect.cond.split('>')[1]);
      condition.ifTruthAtLeast = value;
    } else if (effect.cond.includes('truthLevel<')) {
      const value = parseInt(effect.cond.split('<')[1]);
      condition.ifTruthAtMost = value;
    }
    
    // Process "then" effects
    const thenEffects: CardEffects = {};
    for (const thenEffect of effect.then) {
      this.processLegacyEffect(thenEffect, thenEffects);
    }
    
    condition.then = thenEffects;
    
    if (!effects.conditional) {
      effects.conditional = condition;
    } else if (Array.isArray(effects.conditional)) {
      effects.conditional.push(condition);
    } else {
      effects.conditional = [effects.conditional, condition];
    }
  }

  static async loadAndMigrateExtension(extensionId: string): Promise<any[]> {
    try {
      const response = await fetch(`/extensions/${extensionId}.json`);
      const extensionData = await response.json();
      
      return extensionData.cards.map((card: ExtensionCard) => this.migrateCard(card));
    } catch (error) {
      console.error(`Failed to load extension ${extensionId}:`, error);
      return [];
    }
  }

  static generateMigrationReport(extensionCards: ExtensionCard[]): string {
    const report = ['Extension Migration Report', '='.repeat(50), ''];
    
    const factionCounts = extensionCards.reduce((acc, card) => {
      acc[card.faction] = (acc[card.faction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const typeCounts = extensionCards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    report.push(`Total Cards: ${extensionCards.length}`);
    report.push('');
    report.push('By Faction:');
    Object.entries(factionCounts).forEach(([faction, count]) => {
      report.push(`  ${faction}: ${count} cards`);
    });
    report.push('');
    report.push('By Type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      report.push(`  ${type}: ${count} cards`);
    });
    report.push('');
    
    // Sample migration examples
    report.push('Sample Migrations:');
    extensionCards.slice(0, 3).forEach(card => {
      const migrated = this.migrateCard(card);
      report.push(`\n${card.name} (${card.id}):`);
      report.push(`  Original: ${JSON.stringify(card.effects)}`);
      report.push(`  Migrated: ${JSON.stringify(migrated.effects)}`);
    });
    
    return report.join('\n');
  }
}