import { Card, GameState, Context } from './types';
import { playCard, resolveReaction } from './flow';
import { pickDefenseForAI } from './simpleAI';

// Demo cards with different effect formats to test the engine
export const DEMO_CARDS: Card[] = [
  // Flat v2.1E format
  {
    id: "demo-attack-1",
    name: "Truth Bomb",
    type: "ATTACK",
    cost: 5,
    faction: "truth",
    rarity: "common",
    effects: {
      truthDelta: 10,
      ipDelta: { opponent: -3 },
      discardOpponent: 1
    }
  },
  
  // List-based mini-language format (JSON string)
  {
    id: "demo-defense-1", 
    name: "Counter Intelligence",
    type: "DEFENSIVE",
    cost: 3,
    faction: "government",
    rarity: "uncommon",
    effects: JSON.stringify([
      { k: "flag", name: "blockAttack", value: true },
      { k: "ip", who: "self", v: 2 },
      { k: "truth", v: -5 }
    ])
  },
  
  // Mixed effects with conditionals
  {
    id: "demo-zone-1",
    name: "Media Hub", 
    type: "ZONE",
    cost: 8,
    faction: "truth",
    rarity: "rare",
    effects: {
      zoneDefense: 2,
      conditional: {
        ifTruthAtLeast: 60,
        then: { draw: 2, ipDelta: { self: 5 } },
        else: { draw: 1 }
      }
    }
  },
  
  // Development card with passive income
  {
    id: "demo-dev-1",
    name: "Information Network",
    type: "MEDIA",
    cost: 4,
    faction: "truth", 
    rarity: "common",
    effects: JSON.stringify([
      { k: "development", type: "income", value: 2 },
      { k: "flag", name: "bonusDraw", value: 1 }
    ])
  }
];

// Demo game state for testing
export function createDemoGameState(): GameState {
  return {
    turn: 1,
    truth: 45,
    currentPlayer: "P1",
    players: {
      "P1": {
        id: "P1",
        faction: "truth",
        deck: [...DEMO_CARDS],
        hand: [DEMO_CARDS[0], DEMO_CARDS[2]], // Attack + Zone
        discard: [],
        ip: 15,
        zones: [],
        zoneDefenseBonus: 0,
        pressureTotal: 0
      },
      "P2": {
        id: "P2",
        faction: "government", 
        deck: [...DEMO_CARDS],
        hand: [DEMO_CARDS[1], DEMO_CARDS[3]], // Defense + Development
        discard: [],
        ip: 10,
        zones: [],
        zoneDefenseBonus: 0,
        pressureTotal: 0
      }
    },
    pressureByState: {},
    stateAliases: {}
  };
}

// Demo function to test the complete flow
export function runEngineDemo(): string {
  const gameState = createDemoGameState();
  const log: string[] = [];
  
    const context: Context = {
      state: gameState,
      log: (msg) => log.push(msg),
      turnFlags: {},
      openReaction: (attackCard, attacker, defender, targetStateId) => {
        log.push(`🚨 Reaction window opened: ${attacker} played ${attackCard.name}, ${defender} can defend`);

        // Simulate AI defense selection
        const defense = pickDefenseForAI(context, defender, attackCard);
        if (defense) {
          log.push(`🛡️ ${defender} chooses to defend with: ${defense.name}`);
        } else {
          log.push(`❌ ${defender} has no defensive options`);
        }

        // Resolve reaction
        const outcome = resolveReaction(context, { card: attackCard, attacker, targetStateId }, defense);
        log.push(`⚔️ Reaction resolved: ${outcome}`);
      }
    };
  
  log.push("=== ENGINE DEMO START ===");
  log.push(`Initial state: Truth=${gameState.truth}%, P1 IP=${gameState.players.P1.ip}, P2 IP=${gameState.players.P2.ip}`);
  
  // Test 1: Play a non-reactive card (ZONE)
  log.push("\n--- Test 1: Play Zone Card ---");
  const zoneCard = gameState.players.P1.hand[1]; // Media Hub
  const outcome1 = playCard(context, "P1", zoneCard, "California");
  log.push(`Played ${zoneCard.name}: ${outcome1}`);
  log.push(`After zone: Truth=${gameState.truth}%, P1 IP=${gameState.players.P1.ip}, P1 zones=${gameState.players.P1.zones.length}`);
  
  // Test 2: Play an attack card (should trigger reaction)
  log.push("\n--- Test 2: Play Attack Card ---");
  const attackCard = gameState.players.P1.hand[0]; // Truth Bomb
  const outcome2 = playCard(context, "P1", attackCard);
  log.push(`Played ${attackCard.name}: ${outcome2}`);
  log.push(`After attack: Truth=${gameState.truth}%, P1 IP=${gameState.players.P1.ip}, P2 IP=${gameState.players.P2.ip}`);
  
  log.push("\n=== ENGINE DEMO END ===");
  
  return log.join('\n');
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).runEngineDemo = runEngineDemo;
  (window as any).DEMO_CARDS = DEMO_CARDS;
}