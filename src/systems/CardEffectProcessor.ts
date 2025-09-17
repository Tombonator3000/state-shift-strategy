// Card Effect Processing Engine
// Converts card.effects into actual gameplay changes

import type { 
  Card, 
  CardEffects, 
  EffectConditional, 
  EffectResult, 
  OngoingEffect 
} from '@/types/cardEffects';

interface GameStateForEffects {
  truth: number;
  ip: number;
  aiIP: number;
  hand: any[];
  aiHand: any[];
  controlledStates: string[];
  aiControlledStates: string[];
  round: number;
  turn: number;
  faction: 'government' | 'truth';
  ongoingEffects?: OngoingEffect[];
}

export class CardEffectProcessor {
  private gameState: GameStateForEffects;
  private debug: boolean;
  
  constructor(gameState: GameStateForEffects, debug: boolean = false) {
    this.gameState = gameState;
    this.debug = debug;
  }

  // Main processing method
  processCard(card: Card, targetState?: string): EffectResult {
    if (!card.effects) {
      return this.createEmptyResult();
    }

    const result = this.createEmptyResult();
    result.logMessages.push(`Processing ${card.name}...`);
    
    // Process immediate effects
    this.processEffects(card.effects, result, card.name);
    
    // Handle targeting requirements (v2.1E - ZONE cards have explicit target property)
    if (card.type === 'ZONE') {
      result.requiresTarget = true;
    }
    
    if (this.debug) {
      console.log(`[CardEffectProcessor] ${card.name}:`, result);
    }
    
    return result;
  }

  // Process a CardEffects object
  protected processEffects(effects: CardEffects, result: EffectResult, cardName: string): void {
    // Basic resource effects
    if (effects.truthDelta !== undefined) {
      result.truthDelta += effects.truthDelta;
      result.logMessages.push(`Truth ${effects.truthDelta >= 0 ? '+' : ''}${effects.truthDelta}%`);
    }
    
    if (effects.ipDelta) {
      if (effects.ipDelta.self !== undefined) {
        result.ipDelta.self += effects.ipDelta.self;
        result.logMessages.push(`IP ${effects.ipDelta.self >= 0 ? '+' : ''}${effects.ipDelta.self}`);
      }

      if (effects.ipDelta.opponent !== undefined) {
        const amount = effects.ipDelta.opponent;
        result.ipDelta.self += amount;
        result.ipDelta.opponent -= amount;

        if (amount > 0) {
          result.logMessages.push(`Opponent loses ${amount} IP`);
          result.logMessages.push(`You gain ${amount} IP`);
        } else if (amount < 0) {
          const abs = Math.abs(amount);
          result.logMessages.push(`Opponent gains ${abs} IP`);
          result.logMessages.push(`You lose ${abs} IP`);
        } else {
          result.logMessages.push('No IP change');
        }
      }
    }
    
    // Card draw/discard
    if (effects.draw !== undefined) {
      result.cardsToDraw += effects.draw;
      result.logMessages.push(`Draw ${effects.draw} card${effects.draw !== 1 ? 's' : ''}`);
    }
    
    if (effects.discardSelf !== undefined) {
      result.cardsToDiscardSelf += effects.discardSelf;
      result.logMessages.push(`Discard ${effects.discardSelf} card${effects.discardSelf !== 1 ? 's' : ''}`);
    }
    
    if (effects.discardOpponent !== undefined) {
      result.cardsToDiscardOpponent += effects.discardOpponent;
      result.logMessages.push(`Opponent discards ${effects.discardOpponent} card${effects.discardOpponent !== 1 ? 's' : ''}`);
    }
    
    // Zone effects
    if (effects.pressureDelta !== undefined) {
      result.pressureDelta += effects.pressureDelta;
      result.logMessages.push(`+${effects.pressureDelta} Pressure to target`);
    }
    
    if (effects.zoneDefense !== undefined) {
      result.zoneDefenseBonus += effects.zoneDefense;
      result.logMessages.push(`+${effects.zoneDefense} Defense to controlled states`);
    }
    
    if (effects.captureBonus !== undefined) {
      result.captureBonus += effects.captureBonus;
      result.logMessages.push(`+${effects.captureBonus} IP when capturing states`);
    }
    
    // Damage effects
    if (effects.damage) {
      let damageAmount = 0;
      
      if (effects.damage.fixed !== undefined) {
        damageAmount = effects.damage.fixed;
      } else if (effects.damage.min !== undefined && effects.damage.max !== undefined) {
        damageAmount = effects.damage.min + Math.floor(Math.random() * (effects.damage.max - effects.damage.min + 1));
      } else if (effects.damage.min !== undefined) {
        damageAmount = effects.damage.min;
      } else if (effects.damage.max !== undefined) {
        damageAmount = Math.floor(Math.random() * (effects.damage.max + 1));
      }
      
      result.damage += damageAmount;
      result.logMessages.push(`Deal ${damageAmount} damage`);
    }
    
    // Income effects
    if (effects.incomeBonus) {
      if (effects.incomeBonus.ip && effects.incomeBonus.duration) {
        result.incomeEffects.push({
          type: 'ip',
          amount: effects.incomeBonus.ip,
          duration: effects.incomeBonus.duration
        });
        result.logMessages.push(`+${effects.incomeBonus.ip} IP per turn for ${effects.incomeBonus.duration} turns`);
      }
    }
    
    // Process conditional effects
    if (effects.conditional) {
      const conditionals = Array.isArray(effects.conditional) ? effects.conditional : [effects.conditional];
      
      for (const conditional of conditionals) {
        const conditionMet = this.evaluateCondition(conditional);
        const effectsToApply = conditionMet ? conditional.then : conditional.else;
        
        if (effectsToApply) {
          const conditionDesc = this.describeCondition(conditional);
          result.appliedConditionals.push(`${conditionDesc}: ${conditionMet ? 'TRUE' : 'FALSE'}`);
          
          if (conditionMet && conditional.then) {
            result.logMessages.push(`Condition met: ${conditionDesc}`);
            this.processEffects(conditional.then, result, cardName);
          } else if (!conditionMet && conditional.else) {
            result.logMessages.push(`Condition not met: ${conditionDesc}`);
            this.processEffects(conditional.else, result, cardName);
          }
        }
      }
    }
  }

  // Evaluate a single condition
  protected evaluateCondition(conditional: EffectConditional): boolean {
    const { gameState } = this;
    
    // Truth conditions
    if (conditional.ifTruthAtLeast !== undefined && gameState.truth < conditional.ifTruthAtLeast) {
      return false;
    }
    if (conditional.ifTruthAtMost !== undefined && gameState.truth > conditional.ifTruthAtMost) {
      return false;
    }
    
    // Zone control conditions
    if (conditional.ifZonesControlledAtLeast !== undefined && gameState.controlledStates.length < conditional.ifZonesControlledAtLeast) {
      return false;
    }
    if (conditional.ifZonesControlledAtMost !== undefined && gameState.controlledStates.length > conditional.ifZonesControlledAtMost) {
      return false;
    }
    
    // IP conditions
    if (conditional.ifIPAtLeast !== undefined && gameState.ip < conditional.ifIPAtLeast) {
      return false;
    }
    if (conditional.ifIPAtMost !== undefined && gameState.ip > conditional.ifIPAtMost) {
      return false;
    }
    
    // Opponent IP conditions
    if (conditional.ifOpponentIPAtLeast !== undefined && gameState.aiIP < conditional.ifOpponentIPAtLeast) {
      return false;
    }
    if (conditional.ifOpponentIPAtMost !== undefined && gameState.aiIP > conditional.ifOpponentIPAtMost) {
      return false;
    }
    
    // Hand size conditions
    if (conditional.ifHandSizeAtLeast !== undefined && gameState.hand.length < conditional.ifHandSizeAtLeast) {
      return false;
    }
    if (conditional.ifHandSizeAtMost !== undefined && gameState.hand.length > conditional.ifHandSizeAtMost) {
      return false;
    }
    
    // Round conditions
    if (conditional.ifRoundAtLeast !== undefined && gameState.round < conditional.ifRoundAtLeast) {
      return false;
    }
    
    return true;
  }

  // Create human-readable condition description
  private describeCondition(conditional: EffectConditional): string {
    const conditions: string[] = [];
    
    if (conditional.ifTruthAtLeast !== undefined) {
      conditions.push(`Truth ≥ ${conditional.ifTruthAtLeast}%`);
    }
    if (conditional.ifTruthAtMost !== undefined) {
      conditions.push(`Truth ≤ ${conditional.ifTruthAtMost}%`);
    }
    if (conditional.ifZonesControlledAtLeast !== undefined) {
      conditions.push(`Controlled zones ≥ ${conditional.ifZonesControlledAtLeast}`);
    }
    if (conditional.ifZonesControlledAtMost !== undefined) {
      conditions.push(`Controlled zones ≤ ${conditional.ifZonesControlledAtMost}`);
    }
    if (conditional.ifIPAtLeast !== undefined) {
      conditions.push(`IP ≥ ${conditional.ifIPAtLeast}`);
    }
    if (conditional.ifIPAtMost !== undefined) {
      conditions.push(`IP ≤ ${conditional.ifIPAtMost}`);
    }
    if (conditional.ifOpponentIPAtLeast !== undefined) {
      conditions.push(`Opponent IP ≥ ${conditional.ifOpponentIPAtLeast}`);
    }
    if (conditional.ifOpponentIPAtMost !== undefined) {
      conditions.push(`Opponent IP ≤ ${conditional.ifOpponentIPAtMost}`);
    }
    if (conditional.ifHandSizeAtLeast !== undefined) {
      conditions.push(`Hand size ≥ ${conditional.ifHandSizeAtLeast}`);
    }
    if (conditional.ifHandSizeAtMost !== undefined) {
      conditions.push(`Hand size ≤ ${conditional.ifHandSizeAtMost}`);
    }
    if (conditional.ifRoundAtLeast !== undefined) {
      conditions.push(`Round ≥ ${conditional.ifRoundAtLeast}`);
    }
    
    return conditions.join(' AND ');
  }

  // Create empty result template
  protected createEmptyResult(): EffectResult {
    return {
      truthDelta: 0,
      ipDelta: { self: 0, opponent: 0 },
      cardsToDraw: 0,
      cardsToDiscardSelf: 0,
      cardsToDiscardOpponent: 0,
      pressureDelta: 0,
      damage: 0,
      zoneDefenseBonus: 0,
      captureBonus: 0,
      incomeEffects: [],
      requiresTarget: false,
      appliedConditionals: [],
      logMessages: []
    };
  }

  // Generate debug summary
  toString(): string {
    return `CardEffectProcessor - Game State: Truth=${this.gameState.truth}%, IP=${this.gameState.ip}, Zones=${this.gameState.controlledStates.length}`;
  }
}