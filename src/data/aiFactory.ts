import { AI_PRESETS, type AiConfig } from '@/ai/difficulty';
import type { AIDifficulty } from './aiStrategy';
import { EnhancedAIStrategist, type EnhancedAiDifficultyProfile } from './enhancedAIStrategy';

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

const PRESET_BY_DIFFICULTY: Record<AIDifficulty, AiConfig> = {
  easy: AI_PRESETS.EASY,
  medium: AI_PRESETS.NORMAL,
  hard: AI_PRESETS.HARD,
  legendary: AI_PRESETS.TOP_SECRET_PLUS,
};

const toEnhancedProfile = (preset: AiConfig): EnhancedAiDifficultyProfile => {
  const planningDepth = Math.max(1, Math.min(4, Math.round(preset.lookaheadDepth + 1)));
  const rollouts = preset.rolloutsPerBranch > 0
    ? Math.max(0, Math.round(preset.rolloutsPerBranch * Math.max(1, preset.beamWidth) * 8))
    : 0;

  return {
    planningDepth,
    randomness: clamp(preset.randomness, 0, 1),
    aggression: clamp(preset.aggression, 0, 1),
    riskTolerance: clamp(preset.riskTolerance, 0, 1),
    rollouts,
  };
};

export class AIFactory {
  // Factory method to create appropriate AI strategist based on difficulty
  public static createStrategist(difficulty: AIDifficulty): EnhancedAIStrategist {
    const preset = PRESET_BY_DIFFICULTY[difficulty] ?? AI_PRESETS.NORMAL;
    const profile = toEnhancedProfile(preset);
    return new EnhancedAIStrategist(difficulty, undefined, profile);
  }
}
