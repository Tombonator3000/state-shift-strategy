import type { AIDifficulty } from './aiStrategy';
import { AIStrategist } from './aiStrategy';
import { EnhancedAIStrategist } from './enhancedAIStrategy';

export class AIFactory {
  // Factory method to create appropriate AI strategist based on difficulty
  public static createStrategist(difficulty: AIDifficulty): AIStrategist {
    // Use enhanced AI for hard+ difficulties
    if (difficulty === 'hard' || difficulty === 'legendary') {
      return new EnhancedAIStrategist(difficulty);
    }
    return new AIStrategist(difficulty);
  }
}