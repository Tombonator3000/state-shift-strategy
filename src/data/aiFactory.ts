import { AI_PRESETS, mergeBiasModifiers, type AiConfig, type BiasModifiers } from '@/ai/difficulty';
import { AI_EDITORS, type EditorId } from '@/ai/editors';
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
  insane: AI_PRESETS.INSANE,
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

export interface CreateStrategistOptions {
  editorId?: EditorId | null;
  biasModifiers?: Partial<BiasModifiers>;
}

export class AIFactory {
  // Factory method to create appropriate AI strategist based on difficulty
  public static createStrategist(
    difficulty: AIDifficulty,
    options: CreateStrategistOptions = {},
  ): EnhancedAIStrategist {
    const preset = PRESET_BY_DIFFICULTY[difficulty] ?? AI_PRESETS.NORMAL;
    const profile = toEnhancedProfile(preset);
    let mergedBias = mergeBiasModifiers(preset.biasModifiers, undefined);

    if (options.editorId) {
      const editorProfile = AI_EDITORS[options.editorId];
      if (editorProfile) {
        mergedBias = mergeBiasModifiers(mergedBias, editorProfile.biasModifiers);
      }
    }

    if (options.biasModifiers) {
      mergedBias = mergeBiasModifiers(mergedBias, options.biasModifiers);
    }

    return new EnhancedAIStrategist(difficulty, undefined, profile, mergedBias);
  }
}
