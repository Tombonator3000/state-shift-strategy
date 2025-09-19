import rawTuning from './aiWeights.json';

export interface AiTuningConfig {
  evaluateGameState: {
    territorialWeight: number;
    resourceWeight: number;
    handWeight: number;
    threatMitigationWeight: number;
    agendaWeight: number;
    pressureWeight: number;
    truthWeight: number;
    opponentEconomyWeight: number;
    opponentHandWeight: number;
  };
  dynamicWeights: {
    territorialBase: number;
    territorialPersonality: number;
    resourceBase: number;
    resourcePersonality: number;
    handBase: number;
    handPlanning: number;
    threatMitigationBase: number;
    threatDefensiveness: number;
    agendaBase: number;
    agendaPlanning: number;
    pressureBase: number;
    pressureTerritorial: number;
    truthBase: number;
    truthTerritorial: number;
    opponentEconomyBase: number;
    opponentEconomyDefensive: number;
    opponentHandBase: number;
    opponentHandPlanning: number;
  };
  cardPriority: {
    zone: {
      baseMultiplier: number;
      chainMultiplier: number;
      factionMultiplier: number;
      highValueMultiplier: number;
      locationMultiplier: number;
      specialBonusMultiplier: number;
      ownerAggressionMultiplier: number;
      signalCaptureMultiplier: number;
      dangerResponseMultiplier: number;
    };
    media: {
      baseMultiplier: number;
      chainMultiplier: number;
      factionMultiplier: number;
      truthObjectiveMultiplier: number;
      resourceSwingMultiplier: number;
      discardMultiplier: number;
      drawMultiplier: number;
    };
    attack: {
      baseMultiplier: number;
      chainMultiplier: number;
      factionMultiplier: number;
      comebackMultiplier: number;
      resourceThreatMultiplier: number;
      aggressionResponseMultiplier: number;
      ipDamageMultiplier: number;
      discardMultiplier: number;
      aheadPenaltyMultiplier: number;
    };
    defensive: {
      baseMultiplier: number;
      chainMultiplier: number;
      factionMultiplier: number;
      threatResponseMultiplier: number;
      truthCrisisMultiplier: number;
      recentAttackMultiplier: number;
      imminentLossMultiplier: number;
    };
  };
}

const BASE_TUNING: AiTuningConfig = {
  evaluateGameState: {
    territorialWeight: 1,
    resourceWeight: 1,
    handWeight: 1,
    threatMitigationWeight: 1,
    agendaWeight: 1,
    pressureWeight: 1,
    truthWeight: 1,
    opponentEconomyWeight: 1,
    opponentHandWeight: 1,
  },
  dynamicWeights: {
    territorialBase: 0.2,
    territorialPersonality: 0.25,
    resourceBase: 0.15,
    resourcePersonality: 0.25,
    handBase: 0.15,
    handPlanning: 0.2,
    threatMitigationBase: 0.18,
    threatDefensiveness: 0.3,
    agendaBase: 0.12,
    agendaPlanning: 0.25,
    pressureBase: 0.15,
    pressureTerritorial: 0.2,
    truthBase: 0.1,
    truthTerritorial: 0.2,
    opponentEconomyBase: 0.1,
    opponentEconomyDefensive: 0.15,
    opponentHandBase: 0.08,
    opponentHandPlanning: 0.15,
  },
  cardPriority: {
    zone: {
      baseMultiplier: 1,
      chainMultiplier: 1,
      factionMultiplier: 1,
      highValueMultiplier: 1,
      locationMultiplier: 1,
      specialBonusMultiplier: 1,
      ownerAggressionMultiplier: 1,
      signalCaptureMultiplier: 1,
      dangerResponseMultiplier: 1,
    },
    media: {
      baseMultiplier: 1,
      chainMultiplier: 1,
      factionMultiplier: 1,
      truthObjectiveMultiplier: 1,
      resourceSwingMultiplier: 1,
      discardMultiplier: 1,
      drawMultiplier: 1,
    },
    attack: {
      baseMultiplier: 1,
      chainMultiplier: 1,
      factionMultiplier: 1,
      comebackMultiplier: 1,
      resourceThreatMultiplier: 1,
      aggressionResponseMultiplier: 1,
      ipDamageMultiplier: 1,
      discardMultiplier: 1,
      aheadPenaltyMultiplier: 1,
    },
    defensive: {
      baseMultiplier: 1,
      chainMultiplier: 1,
      factionMultiplier: 1,
      threatResponseMultiplier: 1,
      truthCrisisMultiplier: 1,
      recentAttackMultiplier: 1,
      imminentLossMultiplier: 1,
    },
  },
};

type NestedNumberRecord = { [key: string]: number | NestedNumberRecord };

function isRecord(value: unknown): value is NestedNumberRecord {
  return typeof value === 'object' && value !== null;
}

function cloneConfig<T extends NestedNumberRecord>(config: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(config);
  }

  return JSON.parse(JSON.stringify(config));
}

function mergeConfigs<T extends NestedNumberRecord>(base: T, override: Partial<T> | undefined): T {
  const result: NestedNumberRecord = cloneConfig(base);

  if (!override) {
    return result as T;
  }

  for (const [key, baseValue] of Object.entries(base)) {
    const overrideValue = (override as NestedNumberRecord)[key];

    if (isRecord(baseValue)) {
      result[key] = mergeConfigs(
        baseValue as NestedNumberRecord,
        isRecord(overrideValue) ? (overrideValue as NestedNumberRecord) : undefined,
      );
    } else if (typeof overrideValue === 'number' && Number.isFinite(overrideValue)) {
      result[key] = overrideValue;
    } else {
      result[key] = baseValue;
    }
  }

  return result as T;
}

function sanitizeConfig(config: AiTuningConfig): AiTuningConfig {
  const merged = mergeConfigs(BASE_TUNING, config);

  const enforcePositive = (record: NestedNumberRecord): NestedNumberRecord => {
    const entries = Object.entries(record).map(([key, value]) => {
      if (isRecord(value)) {
        return [key, enforcePositive(value)];
      }

      const numeric = Number(value);
      const safeValue = Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
      return [key, safeValue];
    });

    return Object.fromEntries(entries);
  };

  return enforcePositive(merged) as AiTuningConfig;
}

export function normalizeAiTuningConfig(config: AiTuningConfig): AiTuningConfig {
  return sanitizeConfig(config);
}

export const DEFAULT_AI_TUNING: AiTuningConfig = sanitizeConfig(rawTuning as AiTuningConfig);

let activeTuning: AiTuningConfig = cloneConfig(DEFAULT_AI_TUNING);

export function getAiTuningConfig(): AiTuningConfig {
  return activeTuning;
}

export function setAiTuningConfig(config: AiTuningConfig): void {
  activeTuning = cloneConfig(sanitizeConfig(config));
}

export function mergeAiTuningConfig(config: Partial<AiTuningConfig>): AiTuningConfig {
  const merged = mergeConfigs(activeTuning, config as Partial<AiTuningConfig>);
  activeTuning = cloneConfig(sanitizeConfig(merged as AiTuningConfig));
  return activeTuning;
}
