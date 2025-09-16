// Script to fix all ZONE cards from complex pressure structure to simple pressureDelta
// This is a one-time migration script

import { CARD_DATABASE } from '@/data/cardDatabase';

export function convertZoneCardEffects() {
  const fixes = [];
  
  for (const card of CARD_DATABASE) {
    if (card.type === 'ZONE' && card.effects) {
      const effects = card.effects as any;
      
      // Convert complex pressure structure to simple pressureDelta
      if (effects.pressure?.state === 'target' && effects.pressure?.amount) {
        const pressureAmount = effects.pressure.amount;
        const zoneEffects = effects.zone || {};
        
        // Build new simplified effects
        const newEffects: any = {
          pressureDelta: pressureAmount
        };
        
        // Convert zone defense (both defense and defenseDelta patterns)
        if (zoneEffects.defense !== undefined) {
          newEffects.zoneDefense = zoneEffects.defense;
        } else if (zoneEffects.defenseDelta !== undefined) {
          newEffects.zoneDefense = zoneEffects.defenseDelta;
        }
        
        // Handle onCreate effects
        if (zoneEffects.onCreate?.draw) {
          newEffects.draw = zoneEffects.onCreate.draw;
        }
        if (zoneEffects.onCreate?.ipDelta?.self) {
          newEffects.ipDelta = { self: zoneEffects.onCreate.ipDelta.self };
        }
        
        // Handle perTurn IP income
        if (zoneEffects.perTurn?.ip?.self) {
          newEffects.incomeBonus = {
            ip: zoneEffects.perTurn.ip.self,
            duration: 999 // Permanent while zone exists
          };
        }
        
        // Copy other top-level effects
        if (effects.truthDelta !== undefined) {
          newEffects.truthDelta = effects.truthDelta;
        }
        if (effects.ipDelta) {
          newEffects.ipDelta = effects.ipDelta;
        }
        if (effects.draw) {
          newEffects.draw = effects.draw;
        }
        
        // Handle conditional effects
        if (effects.conditional) {
          newEffects.conditional = effects.conditional;
        }
        
        fixes.push({
          cardId: card.id,
          cardName: card.name,
          oldEffects: JSON.stringify(effects),
          newEffects: JSON.stringify(newEffects)
        });
      }
    }
  }
  
  return fixes;
}

// Generate replacement patterns for manual application
export function generateReplacementPatterns() {
  const patterns = [
    // Simple patterns
    {
      find: /pressure: \{ state: "target", amount: 1 \}, zone: \{ defense: \+(\d+) \}/g,
      replace: 'pressureDelta: 1, zoneDefense: $1'
    },
    {
      find: /pressure: \{ state: "target", amount: (\d+) \}, zone: \{ defense: \+(\d+) \}/g,
      replace: 'pressureDelta: $1, zoneDefense: $2'
    },
    {
      find: /pressure: \{ state: "target", amount: 1 \}, zone: \{ defenseDelta: (\d+) \}/g,
      replace: 'pressureDelta: 1, zoneDefense: $1'
    },
    {
      find: /pressure: \{ state: "target", amount: (\d+) \}, zone: \{ defenseDelta: (\d+) \}/g,
      replace: 'pressureDelta: $1, zoneDefense: $2'
    }
  ];
  
  return patterns;
}