// src/ai/difficulty.ts

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';

export interface BiasModifiers {
  combo: number;
  income: number;
}

export type AiConfig = {
  lookaheadDepth: number;
  beamWidth: number;
  rolloutsPerBranch: number;
  randomness: number;      // 0..1
  riskTolerance: number;   // 0..1
  aggression: number;      // 0..1
  denialPriority: number;  // 0..1
  valueTruthSwing: number; // weight scaler
  resourceValue: number;   // weight scaler
  biasModifiers: BiasModifiers;
  metaCheatPeekTopCard?: boolean;
};

const clampBiasScalar = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(1.75, Math.max(0.5, value));
};

export const mergeBiasModifiers = (
  base: BiasModifiers,
  overrides?: Partial<BiasModifiers>,
): BiasModifiers => ({
  combo: clampBiasScalar(overrides?.combo ?? base.combo, base.combo),
  income: clampBiasScalar(overrides?.income ?? base.income, base.income),
});

export const AI_PRESETS: Record<Difficulty, AiConfig> = {
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
    biasModifiers: { combo: 0.85, income: 0.9 },
    metaCheatPeekTopCard: false,
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
    biasModifiers: { combo: 1.0, income: 1.0 },
    metaCheatPeekTopCard: false,
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
    biasModifiers: { combo: 1.2, income: 1.15 },
    metaCheatPeekTopCard: false,
  },
  INSANE: {
    lookaheadDepth: 3,
    beamWidth: 8,
    rolloutsPerBranch: 24,
    randomness: 0.01,
    riskTolerance: 0.15,
    aggression: 0.85,
    denialPriority: 0.90,
    valueTruthSwing: 1.5,
    resourceValue: 1.2,
    biasModifiers: { combo: 1.35, income: 1.25 },
    metaCheatPeekTopCard: true,
  },
};
