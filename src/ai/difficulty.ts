// src/ai/difficulty.ts
export type Difficulty = "EASY" | "NORMAL" | "HARD" | "TOP_SECRET_PLUS";

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
  metaCheatPeekTopCard?: boolean;
};

export const AI_PRESETS: Record<Difficulty, AiConfig> = {
  EASY: {
    lookaheadDepth: 0, beamWidth: 1, rolloutsPerBranch: 0,
    randomness: 0.35, riskTolerance: 0.75, aggression: 0.30,
    denialPriority: 0.15, valueTruthSwing: 0.6, resourceValue: 0.4,
    metaCheatPeekTopCard: false
  },
  NORMAL: {
    lookaheadDepth: 1, beamWidth: 3, rolloutsPerBranch: 4,
    randomness: 0.12, riskTolerance: 0.45, aggression: 0.55,
    denialPriority: 0.45, valueTruthSwing: 1.0, resourceValue: 0.8,
    metaCheatPeekTopCard: false
  },
  HARD: {
    lookaheadDepth: 2, beamWidth: 6, rolloutsPerBranch: 16,
    randomness: 0.03, riskTolerance: 0.25, aggression: 0.75,
    denialPriority: 0.70, valueTruthSwing: 1.3, resourceValue: 1.1,
    metaCheatPeekTopCard: false
  },
  TOP_SECRET_PLUS: {
    lookaheadDepth: 3, beamWidth: 8, rolloutsPerBranch: 24,
    randomness: 0.01, riskTolerance: 0.15, aggression: 0.85,
    denialPriority: 0.90, valueTruthSwing: 1.5, resourceValue: 1.2,
    metaCheatPeekTopCard: true
  }
};
