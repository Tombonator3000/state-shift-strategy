import type { AIDifficulty } from './aiStrategy';
import { EnhancedAIStrategist, type EnhancedAiDifficultyProfile } from './enhancedAIStrategy';

// AI Difficulty presets
const AI_PRESETS = {
  EASY: {
    lookaheadDepth: 0,
    beamWidth: 1,
    rolloutsPerBranch: 0,
    randomness: 0.35,
    riskTolerance: 0.75,
    aggression: 0.30,
    denialPriority: 0.15,
    valueTruthSwing: 0.6,
    resourceValue: 0.4,
  },
  NORMAL: {
    lookaheadDepth: 1,
    beamWidth: 3,
    rolloutsPerBranch: 4,
    randomness: 0.12,
    riskTolerance: 0.45,
    aggression: 0.55,
    denialPriority: 0.45,
    valueTruthSwing: 1.0,
    resourceValue: 0.8,
  },
  HARD: {
    lookaheadDepth: 2,
    beamWidth: 6,
    rolloutsPerBranch: 16,
    randomness: 0.03,
    riskTolerance: 0.25,
    aggression: 0.75,
    denialPriority: 0.70,
    valueTruthSwing: 1.3,
    resourceValue: 1.1,
  },
  TOP_SECRET_PLUS: {
    lookaheadDepth: 3,
    beamWidth: 8,
    rolloutsPerBranch: 24,
    randomness: 0.01,
    riskTolerance: 0.15,
    aggression: 0.85,
    denialPriority: 0.90,
    valueTruthSwing: 1.5,
    resourceValue: 1.2,
  },
} as const;

type AiConfig = {
  lookaheadDepth: number;
  beamWidth: number;
  rolloutsPerBranch: number;
  randomness: number;
  riskTolerance: number;
  aggression: number;
  denialPriority: number;
  valueTruthSwing: number;
  resourceValue: number;
};

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
