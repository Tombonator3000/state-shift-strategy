// Quick validation of the fixed effect system
import { CARD_DATABASE } from '@/data/cardDatabase';
import { CardTextGenerator } from '@/systems/CardTextGenerator';
import { applyEffectsMvp } from '@/engine/applyEffects-mvp';
import { cloneGameState, type Card as EngineCard, type GameState as EngineGameState } from '@/mvp';

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
    
    const log: string[] = [];
    const engineState: EngineGameState = {
      turn: 1,
      currentPlayer: 'P1',
      truth: 50,
      playsThisTurn: 0,
      turnPlays: [],
      log,
      players: {
        P1: {
          id: 'P1',
          faction: 'truth',
          deck: [],
          hand: [],
          discard: [],
          ip: 20,
          states: [],
        },
        P2: {
          id: 'P2',
          faction: 'government',
          deck: [],
          hand: [],
          discard: [],
          ip: 20,
          states: [],
        },
      },
      pressureByState: {
        CA: { P1: 0, P2: 0 },
      },
      stateDefense: {
        CA: 3,
      },
    };

    engineState.players.P1 = {
      ...engineState.players.P1,
      ip: Math.max(0, engineState.players.P1.ip - card.cost),
    };

    const before = cloneGameState(engineState);
    applyEffectsMvp(engineState, 'P1', card as EngineCard, card.type === 'ZONE' ? 'CA' : undefined);

    const truthDelta = engineState.truth - before.truth;
    const pressureDelta = engineState.pressureByState.CA.P1 - before.pressureByState.CA.P1;
    console.log(`  Processing result:`, {
      truthDelta,
      pressureDelta,
      logs: log,
    });
  }
  
  console.log('\n✅ Effect system validation complete!');
}

// Run validation if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).validateEffects = validateFixedEffectSystem;
}