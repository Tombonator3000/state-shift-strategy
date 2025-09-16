// Enhanced Card Effect Processor - Handles Complex Card Interactions
// Processes the extended effect system with triggers, movement, and advanced conditions

import { CardEffectProcessor } from './CardEffectProcessor';
import { EffectResult } from '@/types/cardEffects';
import { EnhancedCardEffects, EnhancedGameContext, TriggerCondition, MovementEffect } from '@/types/enhancedCardEffects';
import { CardEffects } from '@/types/cardEffects';

export class EnhancedCardEffectProcessor extends CardEffectProcessor {
  private context: EnhancedGameContext;
  
  constructor(gameContext: EnhancedGameContext, debug: boolean = false) {
    super(gameContext, debug);
    this.context = gameContext;
  }
  
  processEnhancedCard(card: { name?: string; effects?: EnhancedCardEffects }, targetState?: string): EffectResult {
    if (!card.effects) {
      return this.createEmptyResult();
    }
    
    const result = this.createEmptyResult();
    this.context.targetState = targetState;
    
    // Process base effects first
    this.processEffects(card.effects as CardEffects, result, card.name || 'Unknown Card');
    
    // Process enhanced effects
    this.processEnhancedEffects(card.effects, result, card.name || 'Unknown Card');
    
    return result;
  }
  
  private processEnhancedEffects(effects: EnhancedCardEffects, result: EffectResult, cardName: string): void {
    // Process triggers
    if (effects.triggers) {
      this.processTriggers(effects.triggers, result, cardName);
    }
    
    // Process movement effects
    if (effects.movement) {
      this.processMovementEffects(effects.movement, result, cardName);
    }
    
    // Process state targeting effects
    if (effects.stateTargeting) {
      this.processStateTargetingEffects(effects.stateTargeting, result, cardName);
    }
    
    // Process replacement effects
    if (effects.replacement) {
      this.processReplacementEffects(effects.replacement, result, cardName);
    }
    
    // Process deck manipulation
    if (effects.deckManipulation) {
      this.processDeckManipulation(effects.deckManipulation, result, cardName);
    }
    
    // Process hand size effects
    if (effects.handSize) {
      this.processHandSizeEffects(effects.handSize, result, cardName);
    }
    
    // Process enhanced conditionals
    if (effects.enhancedConditional) {
      this.processEnhancedConditionals(effects.enhancedConditional, result, cardName);
    }
    
    // Process percentage truth changes
    if (effects.truthPercentDelta) {
      result.truthDelta += effects.truthPercentDelta;
      result.logMessages.push(`${cardName}: Truth ${effects.truthPercentDelta > 0 ? '+' : ''}${effects.truthPercentDelta}%`);
    }
  }
  
  private processTriggers(triggers: any[], result: EffectResult, cardName: string): void {
    // Triggers are stored for later processing when conditions are met
    // For now, we log them as potential effects
    for (const trigger of triggers) {
      if (this.evaluateTriggerCondition(trigger.condition)) {
        this.processEffects(trigger.effect, result, `${cardName} (Triggered)`);
      }
    }
  }
  
  private evaluateTriggerCondition(condition: TriggerCondition): boolean {
    // Evaluate trigger conditions based on current context
    if (condition.opponentPlaysMedia) {
      // This would be evaluated when an opponent plays media
      // For now, return false as this requires game event system
      return false;
    }
    
    if (condition.playedOnThisState && this.context.targetState) {
      return true;
    }
    
    if (condition.startOfTurn) {
      // This would be evaluated at turn start
      return false;
    }
    
    return false;
  }
  
  private processMovementEffects(movement: MovementEffect, result: EffectResult, cardName: string): void {
    if (movement.moveDefense) {
      const { from, to, amount } = movement.moveDefense;
      
      // For now, we'll convert this to zone defense bonus
      // In a full implementation, this would require state-specific tracking
      result.zoneDefenseBonus += amount;
      result.logMessages.push(`${cardName}: Move ${amount} Defense from ${from} to ${to}`);
    }
    
    if (movement.relocateCard) {
      const { from, to } = movement.relocateCard;
      result.logMessages.push(`${cardName}: Relocate card from ${from} to ${to}`);
    }
  }
  
  private processStateTargetingEffects(stateTargeting: any, result: EffectResult, cardName: string): void {
    if (stateTargeting.adjacentStates && this.context.targetState) {
      // Apply effects to adjacent states
      this.processEffects(stateTargeting.adjacentStates.effect, result, `${cardName} (Adjacent)`);
      result.logMessages.push(`${cardName}: Effect applied to adjacent states`);
    }
    
    if (stateTargeting.connectedStates) {
      this.processEffects(stateTargeting.connectedStates.effect, result, `${cardName} (Connected)`);
      result.logMessages.push(`${cardName}: Effect applied to connected states`);
    }
    
    if (stateTargeting.allControlledStates) {
      const controlledCount = this.context.controlledStates.length;
      if (controlledCount > 0) {
        // Apply effect once per controlled state
        for (let i = 0; i < controlledCount; i++) {
          this.processEffects(stateTargeting.allControlledStates.effect, result, `${cardName} (Controlled)`);
        }
        result.logMessages.push(`${cardName}: Effect applied to ${controlledCount} controlled states`);
      }
    }
  }
  
  private processReplacementEffects(replacement: any, result: EffectResult, cardName: string): void {
    if (replacement.replaces) {
      result.logMessages.push(`${cardName}: Replacement effect - ${replacement.replaces.trigger}`);
    }
    
    if (replacement.modifyCosts) {
      const { cardType, costDelta } = replacement.modifyCosts;
      result.logMessages.push(`${cardName}: ${cardType || 'All'} cards cost ${costDelta > 0 ? '+' : ''}${costDelta} IP`);
    }
  }
  
  private processDeckManipulation(deckManip: any, result: EffectResult, cardName: string): void {
    if (deckManip.searchDeck) {
      const { cardType, count, putInHand } = deckManip.searchDeck;
      if (putInHand) {
        result.cardsToDraw += count;
      }
      result.logMessages.push(`${cardName}: Search deck for ${count} ${cardType || 'any'} card(s)`);
    }
    
    if (deckManip.shuffleDeck) {
      result.logMessages.push(`${cardName}: Shuffle deck`);
    }
  }
  
  private processHandSizeEffects(handSize: any, result: EffectResult, cardName: string): void {
    if (handSize.modifyHandSize) {
      const { delta } = handSize.modifyHandSize;
      result.logMessages.push(`${cardName}: Hand size ${delta > 0 ? '+' : ''}${delta}`);
    }
    
    if (handSize.maxHandSize) {
      const { value } = handSize.maxHandSize;
      result.logMessages.push(`${cardName}: Maximum hand size ${value}`);
    }
  }
  
  private processEnhancedConditionals(conditionals: any[], result: EffectResult, cardName: string): void {
    for (const conditional of conditionals) {
      if (this.evaluateEnhancedCondition(conditional.condition)) {
        this.processEnhancedEffects(conditional.then, result, `${cardName} (Condition Met)`);
      } else if (conditional.else) {
        this.processEnhancedEffects(conditional.else, result, `${cardName} (Condition Failed)`);
      }
    }
  }
  
  private evaluateEnhancedCondition(condition: any): boolean {
    // Enhanced condition evaluation
    if (condition.opponentControls) {
      const opponentCount = this.context.aiControlledStates.length;
      const { min, max } = condition.opponentControls;
      if (min !== undefined && opponentCount < min) return false;
      if (max !== undefined && opponentCount > max) return false;
    }
    
    if (condition.playerControls) {
      const playerCount = this.context.controlledStates.length;
      const { min, max } = condition.playerControls;
      if (min !== undefined && playerCount < min) return false;
      if (max !== undefined && playerCount > max) return false;
    }
    
    if (condition.truthInRange) {
      const { min, max } = condition.truthInRange;
      return this.context.truth >= min && this.context.truth <= max;
    }
    
    // Fall back to base condition evaluation
    return this.evaluateCondition(condition);
  }
}