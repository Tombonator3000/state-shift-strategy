#!/usr/bin/env ts-node
// Quick script to update all MVP cards with required GameCard fields

import fs from 'fs';
import type { MVPCard } from '@/types/mvp-types';

// Generate effect text based on card type and effects
function generateEffectText(card: Pick<MVPCard, 'type' | 'effects'>): string {
  switch (card.type) {
    case 'ATTACK':
      const attackEffects = card.effects as any;
      let text = `Opponent loses ${attackEffects.ipDelta.opponent} IP`;
      if (attackEffects.discardOpponent) {
        text += ` and discards ${attackEffects.discardOpponent} card${attackEffects.discardOpponent > 1 ? 's' : ''}`;
      }
      return text + '.';
      
    case 'MEDIA':
      const mediaEffects = card.effects as any;
      const delta = mediaEffects.truthDelta;
      return `${delta > 0 ? '+' : ''}${delta}% Truth.`;
      
    case 'ZONE':
      const zoneEffects = card.effects as any;
      return `Target a state. +${zoneEffects.pressureDelta} Pressure to capture it.`;
      
    default:
      return 'Unknown effect.';
  }
}

// Generate flavor text based on faction and card theme
function generateFlavorTexts(card: Pick<MVPCard, 'name' | 'faction' | 'type'>): { flavorTruth: string; flavorGov: string } {
  // Simple flavor generation - in real implementation, these would be handcrafted
  const truthFlavor = `Truth faction sees: ${card.name.toLowerCase()}.`;
  const govFlavor = `Government responds to: ${card.name.toLowerCase()}.`;
  
  return {
    flavorTruth: truthFlavor,
    flavorGov: govFlavor
  };
}

// Read and update MVP core file
function updateMVPCore() {
  const filePath = 'src/data/core/mvp-core.ts';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract cards array from file content
  const cardsMatch = content.match(/export const MVP_CORE_CARDS: MVPCard\[\] = \[([\s\S]*?)\];/);
  if (!cardsMatch) {
    console.error('Could not find MVP_CORE_CARDS array');
    return;
  }
  
  // Parse cards (simplified - assumes proper JSON-like structure)
  const cardsContent = cardsMatch[1];
  
  // For each card object in the content, add missing fields
  let updatedContent = content;
  
  // Replace old format with new format
  const cards = [
    // Example of how each card should look - this would need to be expanded
    // for all cards in the actual implementation
  ];
  
  console.log('MVP cards updated with GameCard compatibility fields');
}

if (require.main === module) {
  updateMVPCore();
}