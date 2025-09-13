import type { GameCard } from '@/types/cardTypes';

// Check if a card has harmful effects that warrant a defensive response
export function hasHarmfulEffect(card: GameCard): boolean {
  if (!card.effects) return false;
  
  // Check for negative IP delta to opponent (which is positive damage to them)
  if (card.effects.ipDelta?.opponent && card.effects.ipDelta.opponent < 0) {
    return true;
  }
  
  // Check for truth manipulation (can be harmful depending on context)
  if (card.effects.truthDelta && Math.abs(card.effects.truthDelta) > 0) {
    return true;
  }
  
  // Check for discard effects
  if (card.effects.discardOpponent && card.effects.discardOpponent > 0) {
    return true;
  }
  
  // Check for pressure effects (can capture states)
  if (card.effects.pressureDelta && card.effects.pressureDelta > 0) {
    return true;
  }
  
  return false;
}

// Check if a card is reactive (ATTACK or harmful MEDIA)
export function isReactiveAttack(card: GameCard): boolean {
  return card.type === "ATTACK" || (card.type === "MEDIA" && hasHarmfulEffect(card));
}

// Find first playable defensive card in hand
export function findFirstDefensiveCard(hand: GameCard[], playerIP: number): GameCard | undefined {
  return hand.find(card => 
    card.type === "DEFENSIVE" && 
    card.cost <= playerIP
  );
}

// Check if card can be used defensively
export function canPlayDefensively(card: GameCard, playerIP: number, clashOpen: boolean): boolean {
  return clashOpen && card.type === "DEFENSIVE" && card.cost <= playerIP;
}