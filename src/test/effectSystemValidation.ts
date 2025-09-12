// Quick validation of the fixed effect system
import { CARD_DATABASE } from '@/data/cardDatabase';
import { CardTextGenerator } from '@/systems/CardTextGenerator';
import { CardEffectProcessor } from '@/systems/CardEffectProcessor';

// Test a few specific cards to verify they work correctly
export function validateFixedEffectSystem() {
  console.log('🔍 Testing fixed effect system...');
  
  // Test ZONE cards that should give 2 pressure
  const zoneCards = CARD_DATABASE.filter(card => card.type === 'ZONE').slice(0, 5);
  
  for (const card of zoneCards) {
    const generatedText = CardTextGenerator.generateRulesText(card.effects || {});
    
    console.log(`\n${card.name} (${card.id}):`);
    console.log(`  Original text: ${card.text}`);
    console.log(`  Generated text: ${generatedText}`);
    
    // Check if pressureDelta is working
    if (card.effects?.pressureDelta) {
      console.log(`  ✅ Pressure delta: ${card.effects.pressureDelta}`);
    }
    
    // Test with CardEffectProcessor
    const processor = new CardEffectProcessor({
      truth: 50,
      ip: 20,
      aiIP: 20,
      hand: [],
      aiHand: [],
      controlledStates: [],
      aiControlledStates: [],
      round: 1,
      turn: 1,
      faction: 'truth'
    });
    
    const result = processor.processCard(card as any, 'CA');
    console.log(`  Processing result:`, {
      truthDelta: result.truthDelta,
      pressureDelta: result.pressureDelta,
      zoneDefenseBonus: result.zoneDefenseBonus
    });
  }
  
  console.log('\n✅ Effect system validation complete!');
}

// Run validation if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).validateEffects = validateFixedEffectSystem;
}