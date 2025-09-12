import type { GameCard } from '@/types/cardTypes';
import { CARD_DATABASE } from './cardDatabase';
import { extensionManager } from './extensionSystem';

type RarityType = 'common' | 'uncommon' | 'rare' | 'legendary';

const isValidRarity = (rarity: string): rarity is RarityType => {
  return ['common', 'uncommon', 'rare', 'legendary'].includes(rarity);
};

const toRarityType = (rarity: string): RarityType => {
  if (isValidRarity(rarity)) {
    return rarity;
  }
  throw new Error(`Invalid rarity: ${rarity}`);
};

export interface PatchStep {
  step: number;
  costChange: number;
  newCost: number;
  rarityChange: 'unchanged' | 'promote' | 'demote';
  newRarity: RarityType;
  reason: string;
}

export interface PatchCard {
  cardId: string;
  cardName?: string;
  currentCost: number;
  currentRarity: RarityType;
  steps: PatchStep[];
  classification: string;
  alignment: string;
  severity: string;
  notes?: string;
}

export interface PatchHeader {
  patchVersion?: string;
  constraints?: string;
  profile?: string;
  date?: string;
}

export interface ParsedPatch {
  header: PatchHeader;
  cards: PatchCard[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PatchApplicationResult {
  success: boolean;
  appliedCards: number;
  skippedCards: number;
  errors: string[];
  changes: PatchApplicationChange[];
  backupPath?: string;
}

export interface PatchApplicationChange {
  cardId: string;
  cardName: string;
  oldCost: number;
  newCost: number;
  oldRarity: string;
  newRarity: string;
  steps: number;
  reason: string;
}

export class PatchParser {
  static parseTXT(content: string): ParsedPatch {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const header: PatchHeader = {};
    const cards: PatchCard[] = [];
    
    let currentCard: Partial<PatchCard> | null = null;
    let currentSteps: PatchStep[] = [];
    
    for (const line of lines) {
      // Parse header
      if (line.startsWith('PATCH-VERSION:')) {
        header.patchVersion = line.substring('PATCH-VERSION:'.length).trim();
      } else if (line.startsWith('CONSTRAINTS:')) {
        header.constraints = line.substring('CONSTRAINTS:'.length).trim();
      } else if (line.startsWith('PROFILE:')) {
        header.profile = line.substring('PROFILE:'.length).trim();
      } else if (line.startsWith('DATE:')) {
        header.date = line.substring('DATE:'.length).trim();
      } 
      // Parse card block
      else if (line.startsWith('CARD:')) {
        // Save previous card if exists
        if (currentCard) {
          currentCard.steps = currentSteps;
          cards.push(currentCard as PatchCard);
        }
        
        // Start new card
        const cardInfo = line.substring('CARD:'.length).trim();
        const parts = cardInfo.split('|').map(p => p.trim());
        currentCard = {
          cardId: parts[0],
          cardName: parts[1] || '',
          steps: [],
          classification: '',
          alignment: '',
          severity: ''
        };
        currentSteps = [];
      } else if (line.startsWith('CURRENT:') && currentCard) {
        const currentInfo = line.substring('CURRENT:'.length).trim();
        const costMatch = currentInfo.match(/cost=(\d+)/);
        const rarityMatch = currentInfo.match(/rarity=(common|uncommon|rare|legendary)/);
        
        if (costMatch) currentCard.currentCost = parseInt(costMatch[1]);
        if (rarityMatch) currentCard.currentRarity = toRarityType(rarityMatch[1]);
      } else if (line.startsWith('STEP ') && currentCard) {
        const stepMatch = line.match(/STEP (\d+):\s*cost\s*([+-]\d+)\s*->\s*(\d+),\s*rarity=(unchanged|promote|demote|same|\w+)\s*;\s*REASON:\s*(.+)/);
        
        if (stepMatch) {
          const stepNum = parseInt(stepMatch[1]);
          const costChange = parseInt(stepMatch[2]);
          const newCost = parseInt(stepMatch[3]);
          let rarityChange = stepMatch[4] as any;
          const reason = stepMatch[5];
          
          // Normalize rarity change
          if (rarityChange === 'same') rarityChange = 'unchanged';
          
          const newRarity = this.calculateNewRarity(currentCard.currentRarity, rarityChange, currentSteps.length);
          
          currentSteps.push({
            step: stepNum,
            costChange,
            newCost,
            rarityChange,
            newRarity,
            reason
          });
        }
      } else if (line.startsWith('CLASS:') && currentCard) {
        const classInfo = line.substring('CLASS:'.length).trim();
        const parts = classInfo.split(';').map(p => p.trim());
        
        for (const part of parts) {
          if (part.startsWith('ALIGNMENT:')) {
            currentCard.alignment = part.substring('ALIGNMENT:'.length).trim();
          } else if (part.startsWith('SEVERITY:')) {
            currentCard.severity = part.substring('SEVERITY:'.length).trim();
          } else {
            currentCard.classification = part;
          }
        }
      } else if (line.startsWith('NOTES:') && currentCard) {
        currentCard.notes = line.substring('NOTES:'.length).trim();
      }
    }
    
    // Save last card
    if (currentCard) {
      currentCard.steps = currentSteps;
      cards.push(currentCard as PatchCard);
    }
    
    return { header, cards };
  }
  
  static parseCSV(content: string): ParsedPatch {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) throw new Error('Empty CSV file');
    
    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Map expected columns to actual indices
    const getColumnIndex = (expectedName: string): number => {
      const variations = {
        'cardid': ['cardid', 'card_id', 'id'],
        'currentcost': ['currentcost', 'current_cost', 'cost'],
        'currentrarity': ['currentrarity', 'current_rarity', 'rarity'],
        'step': ['step'],
        'reccost': ['reccost', 'rec_cost', 'recommended_cost', 'newcost', 'new_cost'],
        'recrarity': ['recrarity', 'rec_rarity', 'recommended_rarity', 'newrarity', 'new_rarity'],
        'reason': ['reason', 'comment', 'notes']
      };
      
      const possibleNames = variations[expectedName as keyof typeof variations] || [expectedName];
      
      for (let i = 0; i < headers.length; i++) {
        if (possibleNames.some(name => headers[i].includes(name))) {
          return i;
        }
      }
      return -1;
    };
    
    const indices = {
      cardId: getColumnIndex('cardid'),
      currentCost: getColumnIndex('currentcost'),
      currentRarity: getColumnIndex('currentrarity'),
      step: getColumnIndex('step'),
      recCost: getColumnIndex('reccost'),
      recRarity: getColumnIndex('recrarity'),
      reason: getColumnIndex('reason')
    };
    
    // Check if we found the essential columns
    const missingColumns = Object.entries(indices)
      .filter(([key, index]) => index === -1)
      .map(([key]) => key);
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing columns: ${missingColumns.join(', ')}. Available columns: ${headers.join(', ')}`);
    }
    
    const cards: PatchCard[] = [];
    const cardMap = new Map<string, Partial<PatchCard>>();
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
        
        if (parts.length < Math.max(...Object.values(indices)) + 1) {
          console.warn(`Row ${i + 1}: Not enough columns, skipping`);
          continue;
        }
        
        const cardId = parts[indices.cardId];
        const currentCost = parseInt(parts[indices.currentCost]);
        const currentRarity = parts[indices.currentRarity];
        const step = parseInt(parts[indices.step]);
        const recCost = parseInt(parts[indices.recCost]);
        const recRarity = parts[indices.recRarity];
        const reason = parts[indices.reason] || 'No reason provided';
        
        // Validate numeric values
        if (isNaN(currentCost) || isNaN(step) || isNaN(recCost)) {
          throw new Error(`Row ${i + 1}: Invalid numeric values - currentCost: ${parts[indices.currentCost]}, step: ${parts[indices.step]}, recCost: ${parts[indices.recCost]}`);
        }
        
        // Convert numeric rarities to strings if needed
        const normalizeRarity = (rarity: string): string => {
          const numericRarity = parseInt(rarity);
          if (!isNaN(numericRarity)) {
            const rarityMap = ['common', 'uncommon', 'rare', 'legendary'];
            if (numericRarity >= 0 && numericRarity < rarityMap.length) {
              return rarityMap[numericRarity];
            }
          }
          return rarity.toLowerCase();
        };
        
        const normalizedCurrentRarity = normalizeRarity(currentRarity);
        const normalizedRecRarity = normalizeRarity(recRarity);
        
        if (!cardMap.has(cardId)) {
          cardMap.set(cardId, {
            cardId,
            currentCost,
            currentRarity: toRarityType(normalizedCurrentRarity),
            steps: [],
            classification: 'unknown',
            alignment: 'unknown',
            severity: 'medium'
          });
        }
        
        const card = cardMap.get(cardId)!;
        const costChange = recCost - (card.steps!.length === 0 ? currentCost : card.steps![card.steps!.length - 1].newCost);
        
        let rarityChange: 'unchanged' | 'promote' | 'demote' = 'unchanged';
        if (normalizedRecRarity !== normalizedCurrentRarity) {
          const rarityOrder: RarityType[] = ['common', 'uncommon', 'rare', 'legendary'];
          const currentIndex = rarityOrder.indexOf(toRarityType(normalizedCurrentRarity));
          const newIndex = rarityOrder.indexOf(toRarityType(normalizedRecRarity));
          rarityChange = newIndex > currentIndex ? 'promote' : 'demote';
        }
        
        card.steps!.push({
          step,
          costChange,
          newCost: recCost,
          rarityChange,
          newRarity: toRarityType(normalizedRecRarity),
          reason
        });
        
      } catch (error) {
        throw new Error(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    for (const card of cardMap.values()) {
      cards.push(card as PatchCard);
    }
    
    return {
      header: { patchVersion: 'CSV Import', profile: 'imported' },
      cards
    };
  }
  
  private static calculateNewRarity(currentRarity: RarityType, rarityChange: string, stepIndex: number): RarityType {
    if (rarityChange === 'unchanged') return currentRarity;
    
    const rarityOrder: RarityType[] = ['common', 'uncommon', 'rare', 'legendary'];
    const currentIndex = rarityOrder.indexOf(currentRarity);
    
    if (rarityChange === 'promote') {
      const newIndex = Math.min(currentIndex + 1, rarityOrder.length - 1);
      return rarityOrder[newIndex];
    } else if (rarityChange === 'demote') {
      const newIndex = Math.max(currentIndex - 1, 0);
      return rarityOrder[newIndex];
    }
    
    // Direct rarity specified
    if (isValidRarity(rarityChange)) {
      return rarityChange;
    }
    
    return currentRarity;
  }
}

export class PatchValidator {
  static validate(patch: ParsedPatch): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const card of patch.cards) {
      // Validate card exists
      const existingCard = CARD_DATABASE.find(c => c.id === card.cardId);
      const extensionCards = extensionManager.getAllExtensionCards();
      const extensionCard = extensionCards.find(c => c.id === card.cardId);
      
      if (!existingCard && !extensionCard) {
        errors.push(`Card ${card.cardId} not found in database`);
        continue;
      }
      
      let currentCost = card.currentCost;
      let currentRarity = card.currentRarity;
      
        // Validate each step
        for (const step of card.steps) {
          // Check step size constraint (±3)
          if (Math.abs(step.costChange) > 3) {
            errors.push(`Card ${card.cardId} Step ${step.step}: Cost change ${step.costChange} exceeds ±3 limit`);
          }
          
          // Check final cost constraint (≤15)
          if (step.newCost > 15) {
            errors.push(`Card ${card.cardId} Step ${step.step}: Final cost ${step.newCost} exceeds cap of 15`);
          }
          
          if (step.newCost < 0) {
            errors.push(`Card ${card.cardId} Step ${step.step}: Final cost ${step.newCost} is negative`);
          }
          
          // Check rarity change is valid
          if (step.rarityChange !== 'unchanged') {
            const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
            const currentIndex = rarityOrder.indexOf(currentRarity);
            const newIndex = rarityOrder.indexOf(step.newRarity);
            
            if (currentIndex === -1 || newIndex === -1) {
              errors.push(`Card ${card.cardId} Step ${step.step}: Invalid rarity values`);
            } else if (Math.abs(newIndex - currentIndex) > 1) {
              errors.push(`Card ${card.cardId} Step ${step.step}: Rarity change from ${currentRarity} to ${step.newRarity} exceeds one tier limit`);
            }
          }
          
          // Update for next step validation
          currentCost = step.newCost;
          currentRarity = step.newRarity;
        }
      
      // Warn about large total changes
      if (card.steps.length > 0) {
        const totalChange = card.steps[card.steps.length - 1].newCost - card.currentCost;
        if (Math.abs(totalChange) > 6) {
          warnings.push(`Card ${card.cardId}: Large total cost change of ${totalChange}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export class PatchApplicator {
  private static createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      timestamp,
      cards: CARD_DATABASE.map(card => ({ ...card })),
      extensions: extensionManager.getAllExtensionCards().map(card => ({ ...card }))
    };
    
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(backupBlob);
    
    // Auto-download backup
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowgov_backup_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return `shadowgov_backup_${timestamp}.json`;
  }
  
  static async applyPatch(patch: ParsedPatch): Promise<PatchApplicationResult> {
    // Validate first
    const validation = PatchValidator.validate(patch);
    if (!validation.isValid) {
      return {
        success: false,
        appliedCards: 0,
        skippedCards: patch.cards.length,
        errors: validation.errors,
        changes: []
      };
    }
    
    // Create backup
    const backupPath = this.createBackup();
    
    const changes: PatchApplicationChange[] = [];
    const errors: string[] = [];
    let appliedCards = 0;
    let skippedCards = 0;
    
    for (const patchCard of patch.cards) {
      try {
        // Find the card
        let targetCard: GameCard | undefined;
        let isExtensionCard = false;
        
        targetCard = CARD_DATABASE.find(c => c.id === patchCard.cardId);
        if (!targetCard) {
          const extensionCards = extensionManager.getAllExtensionCards();
          targetCard = extensionCards.find(c => c.id === patchCard.cardId);
          isExtensionCard = true;
        }
        
        if (!targetCard) {
          errors.push(`Card ${patchCard.cardId} not found`);
          skippedCards++;
          continue;
        }
        
        const originalCost = targetCard.cost;
        const originalRarity = targetCard.rarity;
        
        // Apply steps sequentially
        let finalCost = originalCost;
        let finalRarity = originalRarity;
        
        for (const step of patchCard.steps) {
          finalCost = step.newCost;
          finalRarity = step.newRarity;
        }
        
        // Update the card
        targetCard.cost = finalCost;
        targetCard.rarity = finalRarity;
        
        changes.push({
          cardId: patchCard.cardId,
          cardName: targetCard.name,
          oldCost: originalCost,
          newCost: finalCost,
          oldRarity: originalRarity,
          newRarity: finalRarity,
          steps: patchCard.steps.length,
          reason: patchCard.steps.map(s => s.reason).join('; ')
        });
        
        appliedCards++;
        
      } catch (error) {
        errors.push(`Failed to apply patch to ${patchCard.cardId}: ${error}`);
        skippedCards++;
      }
    }
    
    return {
      success: errors.length === 0,
      appliedCards,
      skippedCards,
      errors,
      changes,
      backupPath
    };
  }
  
  static generateReport(result: PatchApplicationResult, patch: ParsedPatch): string {
    const lines: string[] = [];
    
    lines.push('SHADOW GOVERNMENT - PATCH APPLICATION REPORT');
    lines.push('=' + '='.repeat(50));
    lines.push('');
    
    if (patch.header.patchVersion) lines.push(`Patch Version: ${patch.header.patchVersion}`);
    if (patch.header.profile) lines.push(`Profile: ${patch.header.profile}`);
    if (patch.header.date) lines.push(`Patch Date: ${patch.header.date}`);
    lines.push(`Applied On: ${new Date().toISOString()}`);
    lines.push('');
    
    lines.push('SUMMARY:');
    lines.push(`- Cards Successfully Updated: ${result.appliedCards}`);
    lines.push(`- Cards Skipped: ${result.skippedCards}`);
    lines.push(`- Total Changes: ${result.changes.length}`);
    if (result.backupPath) lines.push(`- Backup Created: ${result.backupPath}`);
    lines.push('');
    
    if (result.errors.length > 0) {
      lines.push('ERRORS:');
      for (const error of result.errors) {
        lines.push(`- ${error}`);
      }
      lines.push('');
    }
    
    lines.push('CHANGES APPLIED:');
    lines.push('-'.repeat(80));
    lines.push('Card ID | Name | Cost Change | Rarity Change | Steps | Reason');
    lines.push('-'.repeat(80));
    
    for (const change of result.changes) {
      const costChange = change.newCost - change.oldCost;
      const costChangeStr = costChange >= 0 ? `+${costChange}` : `${costChange}`;
      const rarityChange = change.oldRarity !== change.newRarity 
        ? `${change.oldRarity} → ${change.newRarity}`
        : 'unchanged';
      
      lines.push(
        `${change.cardId.padEnd(12)} | ${change.cardName.padEnd(25).substring(0, 25)} | ` +
        `${change.oldCost} → ${change.newCost} (${costChangeStr})`.padEnd(15) + ` | ` +
        `${rarityChange.padEnd(20)} | ${change.steps.toString().padEnd(5)} | ${change.reason.substring(0, 30)}`
      );
    }
    
    lines.push('');
    lines.push('End of Report');
    
    return lines.join('\n');
  }
  
  static exportPatchSummary(result: PatchApplicationResult, format: 'csv' | 'json' | 'txt' = 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        summary: {
          appliedCards: result.appliedCards,
          skippedCards: result.skippedCards,
          totalChanges: result.changes.length,
          timestamp: new Date().toISOString()
        },
        changes: result.changes,
        errors: result.errors
      }, null, 2);
    }
    
    if (format === 'txt') {
      return this.generateReport(result, { header: {}, cards: [] });
    }
    
    // CSV format
    const lines: string[] = [];
    lines.push('cardId,cardName,oldCost,newCost,costChange,oldRarity,newRarity,steps,reason');
    
    for (const change of result.changes) {
      const costChange = change.newCost - change.oldCost;
      lines.push(
        `"${change.cardId}","${change.cardName}",${change.oldCost},${change.newCost},${costChange},"${change.oldRarity}","${change.newRarity}",${change.steps},"${change.reason}"`
      );
    }
    
    return lines.join('\n');
  }
}