// Migration Script: Convert all existing cards to MVP format
// DEFENSIVE → MEDIA, preserve ATTACK/MEDIA/ZONE, convert to new schema

import type { GameCard } from '@/types/cardTypes';
import type { MVPCard, CardType, Rarity } from '@/types/mvp-types';
import { getMVPCost, getBaselineEffects } from '@/rules/mvp-policy';

export interface MigrationReport {
  totalCards: number;
  cardsByType: Record<CardType, number>;
  cardsByRarity: Record<Rarity, number>;
  droppedEffectKeys: string[];
  conversionLog: string[];
}

export class CardMigrator {
  private report: MigrationReport = {
    totalCards: 0,
    cardsByType: { ATTACK: 0, MEDIA: 0, ZONE: 0 },
    cardsByRarity: { common: 0, uncommon: 0, rare: 0, legendary: 0 },
    droppedEffectKeys: [],
    conversionLog: []
  };

  migrateCard(oldCard: GameCard): MVPCard {
    // Normalize faction to lowercase
    const faction = oldCard.faction.toLowerCase() as "truth" | "government";
    
    // Convert card type - DEFENSIVE becomes MEDIA
    let type: CardType;
    switch (oldCard.type) {
      case "DEFENSIVE":
        type = "MEDIA";
        this.report.conversionLog.push(`${oldCard.id}: DEFENSIVE → MEDIA`);
        break;
      case "ATTACK":
      case "MEDIA":
      case "ZONE":
        type = oldCard.type;
        break;
      default:
        type = "MEDIA"; // Safe default for unknown types
        this.report.conversionLog.push(`${oldCard.id}: ${oldCard.type} → MEDIA (unknown type)`);
    }
    
    // Normalize rarity
    const rarity = (oldCard.rarity || "common") as Rarity;
    
    // Get MVP cost and baseline effects
    const cost = getMVPCost(type, rarity);
    const baselineEffects = getBaselineEffects(type, rarity);
    
    // Clean effects - only keep MVP-allowed keys
    const cleanEffects = this.cleanEffects(oldCard, type, baselineEffects);
    
    // Count for report
    this.report.totalCards++;
    this.report.cardsByType[type]++;
    this.report.cardsByRarity[rarity]++;
    
    const mvpCard: MVPCard = {
      id: oldCard.id,
      name: oldCard.name,
      faction,
      type,
      rarity,
      cost,
      effects: cleanEffects,
      text: oldCard.text || this.generateCardText(type, cleanEffects),
      flavorTruth: oldCard.flavorTruth || "CLASSIFIED INTELLIGENCE",
      flavorGov: oldCard.flavorGov || "CLASSIFIED INTELLIGENCE"
    };
    
    return mvpCard;
  }
  
  private cleanEffects(oldCard: GameCard, type: CardType, baseline: any): any {
    const oldEffects = oldCard.effects || {};
    const allowedKeys = this.getAllowedEffectKeys(type);
    
    // Track dropped keys
    const oldKeys = Object.keys(oldEffects);
    const droppedKeys = oldKeys.filter(key => !allowedKeys.includes(key));
    for (const key of droppedKeys) {
      if (!this.report.droppedEffectKeys.includes(key)) {
        this.report.droppedEffectKeys.push(key);
      }
    }
    
    if (droppedKeys.length > 0) {
      this.report.conversionLog.push(`${oldCard.id}: dropped effects [${droppedKeys.join(", ")}]`);
    }
    
    // Build clean effects based on type
    switch (type) {
      case "ATTACK":
        return this.cleanATTACKEffects(oldEffects, baseline);
      case "MEDIA":
        return this.cleanMEDIAEffects(oldEffects, baseline);
      case "ZONE":
        return this.cleanZONEEffects(oldEffects, baseline);
      default:
        return baseline;
    }
  }
  
  private cleanATTACKEffects(oldEffects: any, baseline: any): any {
    const effects: any = { ...baseline };
    
    // Preserve discardOpponent if valid (0-2)
    if (oldEffects.discardOpponent && 
        typeof oldEffects.discardOpponent === "number" && 
        oldEffects.discardOpponent >= 0 && 
        oldEffects.discardOpponent <= 2) {
      effects.discardOpponent = oldEffects.discardOpponent;
    }
    
    // Try to extract IP damage from various legacy formats
    if (oldEffects.ipDelta?.opponent && oldEffects.ipDelta.opponent < 0) {
      effects.ipDelta.opponent = -oldEffects.ipDelta.opponent; // Convert negative to positive
    }
    
    return effects;
  }
  
  private cleanMEDIAEffects(oldEffects: any, baseline: any): any {
    const effects: any = { ...baseline };
    
    // Try to preserve truthDelta if valid
    if (typeof oldEffects.truthDelta === "number") {
      effects.truthDelta = Math.abs(oldEffects.truthDelta); // Use absolute value, player chooses sign
    }
    
    return effects;
  }
  
  private cleanZONEEffects(oldEffects: any, baseline: any): any {
    const effects: any = { ...baseline };
    
    // Try to extract pressure from various legacy formats
    if (typeof oldEffects.pressureDelta === "number" && oldEffects.pressureDelta > 0) {
      effects.pressureDelta = oldEffects.pressureDelta;
    } else if (typeof oldEffects.pressureDelta === "object" && oldEffects.pressureDelta.v > 0) {
      effects.pressureDelta = oldEffects.pressureDelta.v;
    }
    
    return effects;
  }
  
  private getAllowedEffectKeys(type: CardType): string[] {
    switch (type) {
      case "ATTACK": return ["ipDelta", "discardOpponent"];
      case "MEDIA": return ["truthDelta"];  
      case "ZONE": return ["pressureDelta"];
      default: return [];
    }
  }
  
  private generateCardText(type: CardType, effects: any): string {
    switch (type) {
      case "ATTACK":
        let text = `Opponent loses ${effects.ipDelta.opponent} IP.`;
        if (effects.discardOpponent) {
          text += ` Opponent discards ${effects.discardOpponent} card(s).`;
        }
        return text;
      case "MEDIA":
        return `${effects.truthDelta > 0 ? "+" : ""}${effects.truthDelta}% Truth.`;
      case "ZONE":
        return `+${effects.pressureDelta} Pressure on target state.`;
      default:
        return "Effect unknown.";
    }
  }
  
  migrateDatabase(cards: GameCard[]): { mvpCards: MVPCard[]; report: MigrationReport } {
    this.report = {
      totalCards: 0,
      cardsByType: { ATTACK: 0, MEDIA: 0, ZONE: 0 },
      cardsByRarity: { common: 0, uncommon: 0, rare: 0, legendary: 0 },
      droppedEffectKeys: [],
      conversionLog: []
    };
    
    const mvpCards = cards.map(card => this.migrateCard(card));
    
    return { mvpCards, report: this.report };
  }
  
  generateReport(report: MigrationReport): string {
    const lines = [
      "# MVP Migration Report",
      `Generated: ${new Date().toISOString()}`,
      "",
      "## Summary",
      `Total cards migrated: ${report.totalCards}`,
      "",
      "## Cards by Type",
      `ATTACK: ${report.cardsByType.ATTACK}`,
      `MEDIA: ${report.cardsByType.MEDIA}`,
      `ZONE: ${report.cardsByType.ZONE}`,
      "",
      "## Cards by Rarity", 
      `Common: ${report.cardsByRarity.common}`,
      `Uncommon: ${report.cardsByRarity.uncommon}`,
      `Rare: ${report.cardsByRarity.rare}`,
      `Legendary: ${report.cardsByRarity.legendary}`,
      "",
      "## Dropped Effect Keys",
      ...report.droppedEffectKeys.map(key => `- ${key}`),
      "",
      "## Conversion Log",
      ...report.conversionLog.map(log => `- ${log}`)
    ];
    
    return lines.join("\n");
  }
}
