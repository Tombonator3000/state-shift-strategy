// MVP Game Engine - Simple turn flow and effect execution
// No reactions, no tech/instant, no cost-mods

import type { 
  MVPCard, 
  MVPGameState, 
  MVPPlayerState
} from '@/types/mvp-types';
import { 
  isATTACKCard, 
  isMEDIACard, 
  isZONECard 
} from '@/types/mvp-types';
import { STATE_DEFENSE, MVP_VICTORY_CONDITIONS } from '@/rules/mvp-policy';

export interface PlayResult {
  success: boolean;
  reason?: string;
  updatedState?: MVPGameState;
}

export interface DiscardResult {
  success: boolean;
  ipCost: number;
  updatedState?: MVPGameState;
}

export class MVPEngine {
  
  // Start turn: +5 IP + #states, draw to 5, reset plays
  static startTurn(state: MVPGameState): MVPGameState {
    const newState = { ...state };
    const currentPlayer = newState.players[newState.currentPlayer];
    
    // IP income: base 5 + controlled states
    currentPlayer.ip += 5 + currentPlayer.states.length;
    
    // Draw to 5 cards
    this.drawToHandSize(newState, newState.currentPlayer, 5);
    
    // Reset plays this turn
    currentPlayer.playsThisTurn = 0;
    
    return newState;
  }
  
  // Check if card can be played
  static canPlay(state: MVPGameState, cardId: string, targetStateId?: string): { canPlay: boolean; reason?: string } {
    const currentPlayer = state.players[state.currentPlayer];
    const card = currentPlayer.hand.find(c => c.id === cardId);
    
    if (!card) {
      return { canPlay: false, reason: "Card not in hand" };
    }
    
    // Check turn
    if (state.currentPlayer !== state.currentPlayer) {
      return { canPlay: false, reason: "Not your turn" };
    }
    
    // Check play limit (3 cards max)
    if (currentPlayer.playsThisTurn >= 3) {
      return { canPlay: false, reason: "Play limit (3) reached" };
    }
    
    // Check IP cost
    if (currentPlayer.ip < card.cost) {
      return { canPlay: false, reason: `Not enough IP: need ${card.cost}, have ${currentPlayer.ip}` };
    }
    
    // ZONE cards require target
    if (card.type === "ZONE" && !targetStateId) {
      return { canPlay: false, reason: "Choose a state (target required)" };
    }
    
    return { canPlay: true };
  }
  
  // Play card - resolve immediately (no reactions in MVP)
  static playCard(state: MVPGameState, cardId: string, targetStateId?: string): PlayResult {
    const canPlayResult = this.canPlay(state, cardId, targetStateId);
    if (!canPlayResult.canPlay) {
      return { success: false, reason: canPlayResult.reason };
    }
    
    const newState = { ...state };
    const currentPlayer = newState.players[newState.currentPlayer];
    const opponent = newState.players[newState.currentPlayer === "P1" ? "P2" : "P1"];
    const card = currentPlayer.hand.find(c => c.id === cardId)!;
    
    // Pay cost
    currentPlayer.ip -= card.cost;
    
    // Remove from hand, add to discard
    currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== cardId);
    currentPlayer.discard.push(card);
    
    // Increment plays
    currentPlayer.playsThisTurn++;
    
    // Resolve effects based on card type
    if (isATTACKCard(card)) {
      this.resolveATTACK(newState, card, opponent);
    } else if (isMEDIACard(card)) {
      this.resolveMEDIA(newState, card);
    } else if (isZONECard(card)) {
      this.resolveZONE(newState, card, targetStateId!, newState.currentPlayer);
    }
    
    return { success: true, updatedState: newState };
  }
  
  // ATTACK: reduce opponent IP, optional discard
  private static resolveATTACK(state: MVPGameState, card: MVPCard & { effects: { ipDelta: { opponent: number }; discardOpponent?: number } }, opponent: MVPPlayerState) {
    // Reduce opponent IP
    opponent.ip = Math.max(0, opponent.ip - card.effects.ipDelta.opponent);
    
    // Optional discard
    if (card.effects.discardOpponent && opponent.hand.length > 0) {
      for (let i = 0; i < card.effects.discardOpponent && opponent.hand.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * opponent.hand.length);
        const discardedCard = opponent.hand.splice(randomIndex, 1)[0];
        opponent.discard.push(discardedCard);
      }
    }
  }
  
  // MEDIA: change truth (player chooses sign when playing)
  private static resolveMEDIA(state: MVPGameState, card: MVPCard & { effects: { truthDelta: number } }) {
    // For now, use the sign as-is from card. UI should allow player to choose + or - when playing
    state.truth = Math.max(0, Math.min(100, state.truth + card.effects.truthDelta));
  }
  
  // ZONE: add pressure, check capture
  private static resolveZONE(state: MVPGameState, card: MVPCard & { effects: { pressureDelta: number } }, targetStateId: string, owner: "P1" | "P2") {
    // Initialize pressure tracking if needed
    if (!state.pressureByState[targetStateId]) {
      state.pressureByState[targetStateId] = { P1: 0, P2: 0 };
    }
    
    // Add pressure
    state.pressureByState[targetStateId][owner] += card.effects.pressureDelta;
    
    // Check capture
    const stateDefense = STATE_DEFENSE[targetStateId] || 3; // Default defense 3
    if (state.pressureByState[targetStateId][owner] >= stateDefense) {
      this.captureState(state, targetStateId, owner);
    }
  }
  
  // Capture state
  private static captureState(state: MVPGameState, stateId: string, owner: "P1" | "P2") {
    const player = state.players[owner];
    
    // Add to controlled states if not already controlled
    if (!player.states.includes(stateId)) {
      player.states.push(stateId);
    }
    
    // Reset pressure
    state.pressureByState[stateId] = { P1: 0, P2: 0 };
  }
  
  // End turn: optional discard (1 free, extras cost 1 IP each)
  static endTurn(state: MVPGameState): MVPGameState {
    const newState = { ...state };
    
    // Switch player
    newState.currentPlayer = newState.currentPlayer === "P1" ? "P2" : "P1";
    newState.turn++;
    
    return newState;
  }
  
  // Discard from hand (1 free per turn, extras cost 1 IP)
  static discardFromHand(state: MVPGameState, cardId: string, isFreeDiscard: boolean = false): DiscardResult {
    const currentPlayer = state.players[state.currentPlayer];
    const card = currentPlayer.hand.find(c => c.id === cardId);
    
    if (!card) {
      return { success: false, ipCost: 0 };
    }
    
    const ipCost = isFreeDiscard ? 0 : 1;
    
    // Check if player can afford extra discard
    if (!isFreeDiscard && currentPlayer.ip < ipCost) {
      return { success: false, ipCost };
    }
    
    const newState = { ...state };
    const newCurrentPlayer = newState.players[newState.currentPlayer];
    
    // Pay cost if not free
    if (!isFreeDiscard) {
      newCurrentPlayer.ip -= ipCost;
    }
    
    // Move card from hand to discard
    newCurrentPlayer.hand = newCurrentPlayer.hand.filter(c => c.id !== cardId);
    newCurrentPlayer.discard.push(card);
    
    return { success: true, ipCost, updatedState: newState };
  }
  
  // Draw cards to specific hand size
  private static drawToHandSize(state: MVPGameState, playerId: "P1" | "P2", targetSize: number) {
    const player = state.players[playerId];
    
    while (player.hand.length < targetSize && player.deck.length > 0) {
      const card = player.deck.pop()!;
      player.hand.push(card);
    }
    
    // Reshuffle discard if deck empty and still need cards
    if (player.hand.length < targetSize && player.discard.length > 0) {
      this.reshuffleDiscard(player);
      while (player.hand.length < targetSize && player.deck.length > 0) {
        const card = player.deck.pop()!;
        player.hand.push(card);
      }
    }
  }
  
  // Reshuffle discard pile into deck
  private static reshuffleDiscard(player: MVPPlayerState) {
    while (player.discard.length > 0) {
      player.deck.push(player.discard.pop()!);
    }
    
    // Simple shuffle
    for (let i = player.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [player.deck[i], player.deck[j]] = [player.deck[j], player.deck[i]];
    }
  }
  
  // Check victory conditions
  static checkVictory(state: MVPGameState): { winner?: "P1" | "P2"; reason?: string } {
    const p1 = state.players.P1;
    const p2 = state.players.P2;
    
    // Check state control (10 states to win)
    if (p1.states.length >= MVP_VICTORY_CONDITIONS.STATES_TO_WIN) {
      return { winner: "P1", reason: "Controlled 10 states" };
    }
    if (p2.states.length >= MVP_VICTORY_CONDITIONS.STATES_TO_WIN) {
      return { winner: "P2", reason: "Controlled 10 states" };
    }
    
    // Check truth thresholds
    if (state.truth >= MVP_VICTORY_CONDITIONS.TRUTH_WIN_THRESHOLD) {
      // Truth faction wins
      const truthPlayer = p1.faction === "truth" ? "P1" : "P2";
      return { winner: truthPlayer, reason: "Truth ≥ 90%" };
    }
    if (state.truth <= MVP_VICTORY_CONDITIONS.GOVERNMENT_WIN_THRESHOLD) {
      // Government faction wins
      const govPlayer = p1.faction === "government" ? "P1" : "P2";
      return { winner: govPlayer, reason: "Truth ≤ 10%" };
    }
    
    // Check IP threshold (200 IP to win)
    if (p1.ip >= MVP_VICTORY_CONDITIONS.IP_WIN_THRESHOLD) {
      return { winner: "P1", reason: "Reached 200 IP" };
    }
    if (p2.ip >= MVP_VICTORY_CONDITIONS.IP_WIN_THRESHOLD) {
      return { winner: "P2", reason: "Reached 200 IP" };
    }
    
    return {};
  }
}