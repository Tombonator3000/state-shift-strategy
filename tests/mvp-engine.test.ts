// MVP Engine Tests - 6 required test cases
// Test the core MVP game mechanics

import { MVPEngine } from '@/engine/mvp-engine';
import type { MVPGameState, MVPCard } from '@/types/mvp-types';

// Test helper to create minimal game state
function createTestState(): MVPGameState {
  const attackCard: MVPCard = {
    id: "test-attack",
    name: "Test Attack",
    faction: "government",
    type: "ATTACK", 
    rarity: "uncommon",
    cost: 3,
    effects: { ipDelta: { opponent: 2 } }
  };
  
  const mediaCard: MVPCard = {
    id: "test-media",
    name: "Test Media",
    faction: "truth",
    type: "MEDIA",
    rarity: "rare", 
    cost: 5,
    effects: { truthDelta: 3 }
  };
  
  const zoneCard: MVPCard = {
    id: "test-zone",
    name: "Test Zone",
    faction: "truth", 
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 }
  };

  return {
    turn: 1,
    truth: 50,
    currentPlayer: "P1",
    players: {
      P1: {
        id: "P1",
        faction: "truth",
        deck: [],
        hand: [attackCard, mediaCard, zoneCard],
        discard: [],
        ip: 10,
        states: [],
        playsThisTurn: 0
      },
      P2: {
        id: "P2", 
        faction: "government",
        deck: [],
        hand: [],
        discard: [],
        ip: 10,
        states: [],
        playsThisTurn: 0
      }
    },
    pressureByState: {},
    stateDefense: { "OH": 3, "CA": 4, "TX": 4 }
  };
}

describe('MVP Engine Tests', () => {
  
  // Test 1: ATTACK reduces IP
  test('ATTACK card reduces opponent IP and moves to discard', () => {
    const state = createTestState();
    const initialIP = state.players.P2.ip;
    
    const result = MVPEngine.playCard(state, "test-attack");
    
    expect(result.success).toBe(true);
    expect(result.updatedState!.players.P2.ip).toBe(initialIP - 2); // Lost 2 IP
    expect(result.updatedState!.players.P1.discard).toHaveLength(1); // Card moved to discard
    expect(result.updatedState!.players.P1.hand).toHaveLength(2); // Card removed from hand
    expect(result.updatedState!.players.P1.playsThisTurn).toBe(1); // Play count increased
  });
  
  // Test 2: MEDIA changes Truth
  test('MEDIA card changes Truth percentage', () => {
    const state = createTestState();
    const initialTruth = state.truth;
    
    const result = MVPEngine.playCard(state, "test-media");
    
    expect(result.success).toBe(true);
    expect(result.updatedState!.truth).toBe(initialTruth + 3); // Truth increased by 3
  });
  
  // Test 3: ZONE adds pressure and captures state
  test('ZONE card adds pressure and captures state when threshold met', () => {
    const state = createTestState();
    
    const result = MVPEngine.playCard(state, "test-zone", "OH");
    
    expect(result.success).toBe(true);
    expect(result.updatedState!.pressureByState["OH"]["P1"]).toBe(3); // Pressure added
    expect(result.updatedState!.players.P1.states).toContain("OH"); // State captured (3 pressure ≥ 3 defense)
    expect(result.updatedState!.pressureByState["OH"]["P1"]).toBe(0); // Pressure reset after capture
  });
  
  // Test 4: Play limit (3 cards max)
  test('Fourth card play fails with play limit reached', () => {
    const state = createTestState();
    state.players.P1.playsThisTurn = 3; // Already played 3 cards
    
    const result = MVPEngine.playCard(state, "test-attack");
    
    expect(result.success).toBe(false);
    expect(result.reason).toBe("Play limit (3) reached");
  });
  
  // Test 5: Discard rules (1 free, extras cost IP)
  test('Discard from hand - 1 free, extras cost 1 IP each', () => {
    const state = createTestState();
    const initialIP = state.players.P1.ip;
    
    // Free discard
    const freeResult = MVPEngine.discardFromHand(state, "test-attack", true);
    expect(freeResult.success).toBe(true);
    expect(freeResult.ipCost).toBe(0);
    expect(freeResult.updatedState!.players.P1.ip).toBe(initialIP); // No cost
    
    // Paid discard
    const paidResult = MVPEngine.discardFromHand(freeResult.updatedState!, "test-media", false);
    expect(paidResult.success).toBe(true);
    expect(paidResult.ipCost).toBe(1);
    expect(paidResult.updatedState!.players.P1.ip).toBe(initialIP - 1); // Cost 1 IP
  });
  
  // Test 6: WhyNotPlayable - various blocking reasons
  test('Card play validation shows correct blocking reasons', () => {
    const state = createTestState();
    
    // Not enough IP
    state.players.P1.ip = 1; // Less than card cost (3)
    let check = MVPEngine.canPlay(state, "test-attack");
    expect(check.canPlay).toBe(false);
    expect(check.reason).toContain("Not enough IP");
    
    // ZONE without target
    state.players.P1.ip = 10; // Restore IP
    check = MVPEngine.canPlay(state, "test-zone"); // No targetStateId
    expect(check.canPlay).toBe(false);
    expect(check.reason).toBe("Choose a state (target required)");
    
    // Play limit reached
    state.players.P1.playsThisTurn = 3;
    check = MVPEngine.canPlay(state, "test-attack");
    expect(check.canPlay).toBe(false);
    expect(check.reason).toBe("Play limit (3) reached");
  });
  
});