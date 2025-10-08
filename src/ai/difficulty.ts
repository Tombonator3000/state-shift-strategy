export type DifficultyTier = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';
export type Difficulty = DifficultyTier;

export interface BiasModifiers {
  combo: number;
  income: number;
  mediaWeight?: number;
  attackWeight?: number;
  zoneWeight?: number;
  targetOwnedStateBias?: number;
  targetNeutralStateBias?: number;
  targetEnemyStateBias?: number;
  comboAggression?: number;
}

export interface AiConfig {
  aggression: number;
  denialPriority: number;
  resourceValue: number;
  riskTolerance: number;
  randomness: number;
  valueTruthSwing: number;
  lookaheadDepth: number;
  rolloutsPerBranch: number;
  beamWidth: number;
  biasModifiers: BiasModifiers;
}

export const DIFFICULTY_MULT = {
  EASY:   { ipIncomeScalar:0.90, comboAggression:0.90, mediaWeightBias:1.00, attackWeightBias:0.95, zoneWeightBias:1.00 },
  NORMAL: { ipIncomeScalar:1.00, comboAggression:1.00, mediaWeightBias:1.00, attackWeightBias:1.00, zoneWeightBias:1.00 },
  HARD:   { ipIncomeScalar:1.10, comboAggression:1.15, mediaWeightBias:1.00, attackWeightBias:1.05, zoneWeightBias:1.05 },
  INSANE: { ipIncomeScalar:1.20, comboAggression:1.25, mediaWeightBias:1.00, attackWeightBias:1.10, zoneWeightBias:1.10 },
} as const satisfies Record<DifficultyTier, {
  ipIncomeScalar: number;
  comboAggression: number;
  mediaWeightBias: number;
  attackWeightBias: number;
  zoneWeightBias: number;
}>;

const DEFAULT_BIAS: BiasModifiers = {
  combo: 1,
  income: 1,
  mediaWeight: 1,
  attackWeight: 1,
  zoneWeight: 1,
  targetOwnedStateBias: 1,
  targetNeutralStateBias: 1,
  targetEnemyStateBias: 1,
  comboAggression: 1,
};

const applyMultipliers = (tier: DifficultyTier): BiasModifiers => {
  const mult = DIFFICULTY_MULT[tier];
  return {
    combo: mult.comboAggression,
    income: mult.ipIncomeScalar,
    mediaWeight: mult.mediaWeightBias,
    attackWeight: mult.attackWeightBias,
    zoneWeight: mult.zoneWeightBias,
    targetOwnedStateBias: 1,
    targetNeutralStateBias: 1,
    targetEnemyStateBias: 1,
    comboAggression: mult.comboAggression,
  };
};

const createConfig = (
  tier: DifficultyTier,
  overrides: Partial<Omit<AiConfig, 'biasModifiers'>> & { biasModifiers?: Partial<BiasModifiers> } = {},
): AiConfig => {
  const base: Omit<AiConfig, 'biasModifiers'> = {
    aggression: tier === 'EASY' ? 0.35 : tier === 'NORMAL' ? 0.55 : tier === 'HARD' ? 0.7 : 0.8,
    denialPriority: tier === 'EASY' ? 0.3 : tier === 'NORMAL' ? 0.5 : tier === 'HARD' ? 0.65 : 0.75,
    resourceValue: tier === 'EASY' ? 0.45 : tier === 'NORMAL' ? 0.55 : tier === 'HARD' ? 0.6 : 0.65,
    riskTolerance: tier === 'EASY' ? 0.25 : tier === 'NORMAL' ? 0.45 : tier === 'HARD' ? 0.6 : 0.7,
    randomness: tier === 'EASY' ? 0.15 : tier === 'NORMAL' ? 0.08 : tier === 'HARD' ? 0.05 : 0.03,
    valueTruthSwing: tier === 'EASY' ? 0.55 : tier === 'NORMAL' ? 0.65 : tier === 'HARD' ? 0.75 : 0.85,
    lookaheadDepth: tier === 'EASY' ? 1 : tier === 'NORMAL' ? 2 : tier === 'HARD' ? 2.5 : 3,
    rolloutsPerBranch: tier === 'EASY' ? 0 : tier === 'NORMAL' ? 1 : tier === 'HARD' ? 2 : 3,
    beamWidth: tier === 'EASY' ? 1 : tier === 'NORMAL' ? 2 : tier === 'HARD' ? 3 : 4,
  };

  const mergedBase = { ...base, ...overrides } satisfies Omit<AiConfig, 'biasModifiers'>;
  const mergedBias = mergeBiasModifiers(applyMultipliers(tier), overrides.biasModifiers);

  return { ...mergedBase, biasModifiers: mergedBias };
};

export const AI_PRESETS: Record<DifficultyTier, AiConfig> = {
  EASY: createConfig('EASY', {
    randomness: 0.18,
    riskTolerance: 0.2,
    valueTruthSwing: 0.5,
  }),
  NORMAL: createConfig('NORMAL'),
  HARD: createConfig('HARD', {
    rolloutsPerBranch: 2,
    randomness: 0.04,
  }),
  INSANE: createConfig('INSANE', {
    rolloutsPerBranch: 3,
    randomness: 0.02,
    beamWidth: 5,
  }),
};

function coerceMultiplier(value: unknown, fallback: number): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  if (!Number.isFinite(num)) return fallback;
  return Math.max(-4, Math.min(4, num));
}

export function mergeBiasModifiers(
  base: Partial<BiasModifiers> | undefined,
  overrides: Partial<BiasModifiers> | undefined,
): BiasModifiers {
  const initial: BiasModifiers = { ...DEFAULT_BIAS, ...(base ?? {}) };
  const result: BiasModifiers = { ...DEFAULT_BIAS, ...initial };

  const apply = (target: BiasModifiers, source: Partial<BiasModifiers> | undefined, multiply = false) => {
    if (!source) return;
    for (const key of Object.keys(source) as (keyof BiasModifiers)[]) {
      const value = source[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      const baseValue = typeof target[key] === 'number' ? target[key] as number : 1;
      target[key] = (multiply ? baseValue * value : value) as BiasModifiers[typeof key];
    }
  };

  // overrides should compound multiplicatively on top of base profile
  apply(result, overrides, true);

  result.combo = coerceMultiplier(result.combo, 1) || 1;
  result.income = coerceMultiplier(result.income, 1) || 1;

  return result;
}
