// MVP Game Engine - Simplified mechanics for 3-type system
// Clean turn flow, no reactions, direct resolution

import type { MVPCard, MVPGameState, MVPPlayerState, CardType } from '@/types/mvp-types';
import { GAME_CONSTANTS, STATE_DEFENSE, VICTORY_CONDITIONS } from '@/rules/mvp-policy';

export type PlayResult = 
  | { success: true; message: string }
  | { success: false; reason: string };

export type DiscardResult = {
  success: boolean;
  costPaid: number;
  message: string;
};

export class MVPGameEngine {
  private state: MVPGameState;
  private log: (msg: string) => void;

  constructor(initialState: MVPGameState, logger?: (msg: string) => void) {
    this.state = initialState;
    this.log = logger || (() => {});
  }

  // Turn management
  startTurn(playerId: "P1" | "P2"): void {
    const player = this.state.players[playerId];
    
    // IP income: base + controlled states
    const ipIncome = GAME_CONSTANTS.BASE_IP_PER_TURN + 
                    (player.states.length * GAME_CONSTANTS.IP_PER_CONTROLLED_STATE);
    player.ip += ipIncome;
    
    // Draw to hand limit
    this.drawToHandLimit(playerId);
    
    // Reset turn counters
    this.state.playsThisTurn = 0;
    player.freeDiscardsLeft = GAME_CONSTANTS.FREE_DISCARDS_PER_TURN;
    
    this.log(`[TURN_START] ${playerId}: +${ipIncome} IP, drew to ${player.hand.length} cards`);
  }

  // Card playing
  canPlayCard(playerId: "P1" | "P2", card: MVPCard, targetStateId?: string): PlayResult {
    const player = this.state.players[playerId];

    // Turn check
    if (this.state.currentPlayer !== playerId) {
      return { success: false, reason: "Not your turn" };
    }

    // Play limit check
    if (this.state.playsThisTurn >= GAME_CONSTANTS.MAX_PLAYS_PER_TURN) {
      return { success: false, reason: `Play limit (${GAME_CONSTANTS.MAX_PLAYS_PER_TURN}) reached` };
    }

    // IP check
    if (player.ip < card.cost) {
      return { success: false, reason: `Not enough IP: need ${card.cost}, have ${player.ip}` };
    }

    // ZONE targeting check
    if (card.type === 'ZONE' && !targetStateId) {
      return { success: false, reason: "Choose a state (target required)" };
    }

    // Hand check
    if (!player.hand.find(c => c.id === card.id)) {
      return { success: false, reason: "Card not in hand" };
    }

    return { success: true, message: "Can play" };
  }

  playCard(playerId: "P1" | "P2", card: MVPCard, targetStateId?: string): PlayResult {
    const canPlay = this.canPlayCard(playerId, card, targetStateId);
    if (!canPlay.success) return canPlay;

    const player = this.state.players[playerId];
    const opponent = this.state.players[playerId === "P1" ? "P2" : "P1"];

    // Pay cost
    player.ip -= card.cost;

    // Remove from hand, add to discard
    player.hand = player.hand.filter(c => c.id !== card.id);
    player.discard.push(card);

    // Increment plays
    this.state.playsThisTurn++;

    // Apply effects immediately (no reactions in MVP)
    this.applyCardEffects(playerId, card, targetStateId);

    this.log(`[PLAY] ${playerId} played ${card.name} (${card.cost} IP)`);
    return { success: true, message: `Played ${card.name}` };
  }

  // Effect application
  private applyCardEffects(playerId: "P1" | "P2", card: MVPCard, targetStateId?: string): void {
    const player = this.state.players[playerId];
    const opponent = this.state.players[playerId === "P1" ? "P2" : "P1"];

    switch (card.type) {
      case 'ATTACK':
        const attackEffects = card.effects as any;
        
        // Drain opponent IP
        if (attackEffects.ipDelta?.opponent) {
          const drain = attackEffects.ipDelta.opponent;
          opponent.ip = Math.max(0, opponent.ip - drain);
          this.log(`[ATTACK] ${playerId} drained ${drain} IP from opponent`);
        }

        // Force discard
        if (attackEffects.discardOpponent) {
          const discardCount = Math.min(attackEffects.discardOpponent, opponent.hand.length);
          for (let i = 0; i < discardCount; i++) {
            if (opponent.hand.length > 0) {
              const randomIndex = Math.floor(Math.random() * opponent.hand.length);
              const discardedCard = opponent.hand.splice(randomIndex, 1)[0];
              opponent.discard.push(discardedCard);
            }
          }
          this.log(`[ATTACK] ${playerId} forced opponent to discard ${discardCount} cards`);
        }
        break;

      case 'MEDIA':
        const mediaEffects = card.effects as any;
        
        // Truth delta (player can choose sign in UI)
        if (typeof mediaEffects.truthDelta === 'number') {
          let delta = mediaEffects.truthDelta;
          
          // For government cards, default to negative truth
          if (card.faction === 'government' && delta > 0) {
            delta = -delta;
          }
          
          this.state.truth = Math.max(0, Math.min(100, this.state.truth + delta));
          this.log(`[MEDIA] ${playerId} changed Truth by ${delta}% (now ${this.state.truth}%)`);
        }
        break;

      case 'ZONE':
        const zoneEffects = card.effects as any;
        
        if (zoneEffects.pressureDelta && targetStateId) {
          const stateId = targetStateId.toUpperCase();
          
          // Initialize pressure tracking
          if (!this.state.pressureByState[stateId]) {
            this.state.pressureByState[stateId] = { P1: 0, P2: 0 };
          }

          // Add pressure
          const oldPressure = this.state.pressureByState[stateId][playerId];
          this.state.pressureByState[stateId][playerId] += zoneEffects.pressureDelta;
          
          this.log(`[ZONE] ${playerId} added ${zoneEffects.pressureDelta} pressure to ${stateId} (${oldPressure} -> ${this.state.pressureByState[stateId][playerId]})`);

          // Check for capture
          this.checkStateCapture(playerId, stateId);
        }
        break;
    }
  }

  // State capture mechanics
  private checkStateCapture(playerId: "P1" | "P2", stateId: string): void {
    const pressure = this.state.pressureByState[stateId]?.[playerId] || 0;
    const defense = STATE_DEFENSE[stateId] || 2;

    if (pressure >= defense) {
      // Capture the state
      const player = this.state.players[playerId];
      
      if (!player.states.includes(stateId)) {
        player.states.push(stateId);
        
        // Reset all pressure on this state
        this.state.pressureByState[stateId] = { P1: 0, P2: 0 };
        
        this.log(`[CAPTURE] ${playerId} captured ${stateId}! (${pressure} pressure vs ${defense} defense)`);
      }
    }
  }

  // Discard mechanics
  discardCards(playerId: "P1" | "P2", cardIds: string[]): DiscardResult {
    const player = this.state.players[playerId];
    let costPaid = 0;
    let discarded = 0;

    for (const cardId of cardIds) {
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      if (cardIndex >= 0) {
        const card = player.hand.splice(cardIndex, 1)[0];
        player.discard.push(card);
        discarded++;

        // Calculate cost
        if (player.freeDiscardsLeft > 0) {
          player.freeDiscardsLeft--;
        } else {
          costPaid += GAME_CONSTANTS.EXTRA_DISCARD_COST;
          player.ip = Math.max(0, player.ip - GAME_CONSTANTS.EXTRA_DISCARD_COST);
        }
      }
    }

    const message = costPaid > 0 
      ? `Discarded ${discarded} cards (${costPaid} IP cost)`
      : `Discarded ${discarded} cards (free)`;

    this.log(`[DISCARD] ${playerId}: ${message}`);

    return {
      success: true,
      costPaid,
      message
    };
  }

  // Victory conditions
  checkVictory(): { winner: "P1" | "P2" | null; reason?: string } {
    const p1 = this.state.players.P1;
    const p2 = this.state.players.P2;

    // States victory
    if (p1.states.length >= VICTORY_CONDITIONS.STATES_TO_WIN) {
      return { winner: "P1", reason: `Controlled ${p1.states.length} states` };
    }
    if (p2.states.length >= VICTORY_CONDITIONS.STATES_TO_WIN) {
      return { winner: "P2", reason: `Controlled ${p2.states.length} states` };
    }

    // Truth victory
    if (this.state.truth >= VICTORY_CONDITIONS.TRUTH_THRESHOLD.truth) {
      return { winner: p1.faction === 'truth' ? "P1" : "P2", reason: `Truth reached ${this.state.truth}%` };
    }
    if (this.state.truth <= VICTORY_CONDITIONS.TRUTH_THRESHOLD.government) {
      return { winner: p1.faction === 'government' ? "P1" : "P2", reason: `Truth dropped to ${this.state.truth}%` };
    }

    // IP victory
    if (p1.ip >= VICTORY_CONDITIONS.IP_THRESHOLD) {
      return { winner: "P1", reason: `Reached ${p1.ip} IP` };
    }
    if (p2.ip >= VICTORY_CONDITIONS.IP_THRESHOLD) {
      return { winner: "P2", reason: `Reached ${p2.ip} IP` };
    }

    return { winner: null };
  }

  // End turn
  endTurn(playerId: "P1" | "P2"): void {
    // Switch players
    this.state.currentPlayer = playerId === "P1" ? "P2" : "P1";
    this.state.turn++;
    
    this.log(`[TURN_END] ${playerId} ended turn, now ${this.state.currentPlayer}'s turn`);
  }

  // Utility methods
  private drawToHandLimit(playerId: "P1" | "P2"): void {
    const player = this.state.players[playerId];
    
    while (player.hand.length < GAME_CONSTANTS.HAND_SIZE_LIMIT && player.deck.length > 0) {
      const card = player.deck.shift();
      if (card) {
        player.hand.push(card);
      }
    }
  }

  // State access
  getState(): MVPGameState {
    return { ...this.state };
  }

  getCurrentPlayer(): "P1" | "P2" {
    return this.state.currentPlayer;
  }

  getPlayCount(): number {
    return this.state.playsThisTurn;
  }
}