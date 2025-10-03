import relicRules from './relics.rules.json';
import { getTruthDelta } from '@/data/eventDatabase';
import { isTabloidRelicsFeatureEnabled } from '@/data/expansions/features';
import type {
  RelicIngestResult,
  RelicIssueSnapshot,
  RelicRuleDefinition,
  RelicRoundStartPayload,
  RelicRoundStartResult,
  RelicRulesFile,
  TabloidRelicRuntimeEntry,
  TabloidRelicRuntimeState,
} from './RelicTypes';

const RARITY_ORDER: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  legendary: 3,
};

const clampNumber = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.trunc(numeric));
};

const sanitizeRules = (raw: RelicRulesFile): RelicRuleDefinition[] => {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.relics)) {
    return [];
  }

  const rules: RelicRuleDefinition[] = [];
  for (const entry of raw.relics) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const { id, label, rarity, trigger, effects } = entry as RelicRuleDefinition;
    if (!id || !label || !trigger || !effects) {
      continue;
    }

    const duration = toPositiveInteger((entry as RelicRuleDefinition).duration, 1) || 1;
    const priority = toPositiveInteger((entry as RelicRuleDefinition).priority, 0);
    const normalizedRarity = RARITY_ORDER[rarity] !== undefined ? rarity : 'common';

    rules.push({
      ...entry,
      rarity: normalizedRarity,
      duration,
      priority,
    });
  }

  return rules.sort((a, b) => {
    const rarityDiff = (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
    if (rarityDiff !== 0) {
      return rarityDiff;
    }
    return (b.priority ?? 0) - (a.priority ?? 0);
  });
};

const RULES: RelicRuleDefinition[] = sanitizeRules(relicRules as RelicRulesFile);

const cloneRuntime = (runtime: TabloidRelicRuntimeState | null | undefined): TabloidRelicRuntimeState | null => {
  if (!runtime) {
    return { entries: [], lastIssueRound: 0 };
  }
  return {
    entries: runtime.entries.map(entry => ({ ...entry })),
    lastIssueRound: runtime.lastIssueRound,
    lastUpdatedTurn: runtime.lastUpdatedTurn,
  };
};

const sumEventTruth = (events: RelicIssueSnapshot['events']): number => {
  return events.reduce((total, event) => total + getTruthDelta(event), 0);
};

const countMatchingPlays = (
  plays: RelicIssueSnapshot['plays'],
  predicate: (play: RelicIssueSnapshot['plays'][number]) => boolean,
): number => {
  let total = 0;
  for (const play of plays) {
    if (predicate(play)) {
      total += 1;
    }
  }
  return total;
};

const evaluateTrigger = (rule: RelicRuleDefinition, snapshot: RelicIssueSnapshot): boolean => {
  const trigger = rule.trigger ?? {};
  const eventTruthTotal = sumEventTruth(snapshot.events);
  const truthLoss = snapshot.events.reduce((total, event) => {
    const delta = getTruthDelta(event);
    return delta < 0 ? total + Math.abs(delta) : total;
  }, 0);
  const truthGain = snapshot.events.reduce((total, event) => {
    const delta = getTruthDelta(event);
    return delta > 0 ? total + delta : total;
  }, 0);

  if (trigger.truthBelow !== undefined && !(snapshot.truth < trigger.truthBelow)) {
    return false;
  }
  if (trigger.truthAbove !== undefined && !(snapshot.truth > trigger.truthAbove)) {
    return false;
  }
  if (trigger.ipBelow !== undefined && !(snapshot.ip < trigger.ipBelow)) {
    return false;
  }
  if (trigger.ipAbove !== undefined && !(snapshot.ip > trigger.ipAbove)) {
    return false;
  }
  if (trigger.aiIpAbove !== undefined && !(snapshot.aiIP > trigger.aiIpAbove)) {
    return false;
  }
  if (
    trigger.comboTruthDeltaBelow !== undefined &&
    !(snapshot.comboTruthDelta < trigger.comboTruthDeltaBelow)
  ) {
    return false;
  }
  if (
    trigger.comboTruthDeltaAbove !== undefined &&
    !(snapshot.comboTruthDelta > trigger.comboTruthDeltaAbove)
  ) {
    return false;
  }
  if (
    trigger.eventTruthLossAtLeast !== undefined &&
    !(truthLoss >= trigger.eventTruthLossAtLeast)
  ) {
    return false;
  }
  if (
    trigger.eventTruthGainAtLeast !== undefined &&
    !(truthGain >= trigger.eventTruthGainAtLeast)
  ) {
    return false;
  }
  if (
    trigger.playerMediaPlaysAtLeast !== undefined &&
    !(countMatchingPlays(snapshot.plays, play => play.player === 'human' && play.card.type === 'MEDIA') >=
      trigger.playerMediaPlaysAtLeast)
  ) {
    return false;
  }
  if (
    trigger.aiAttackPlaysAtLeast !== undefined &&
    !(countMatchingPlays(snapshot.plays, play => play.player === 'ai' && play.card.type === 'ATTACK') >=
      trigger.aiAttackPlaysAtLeast)
  ) {
    return false;
  }
  if (trigger.requiresFaction && trigger.requiresFaction !== snapshot.faction) {
    return false;
  }
  if (trigger.requiresEditors && !snapshot.editorActive) {
    return false;
  }

  // Encourage relics when headline totals move dramatically regardless of sign when requested.
  if (trigger.eventTruthGainAtLeast === undefined && trigger.eventTruthLossAtLeast === undefined) {
    if (trigger.comboTruthDeltaBelow !== undefined || trigger.comboTruthDeltaAbove !== undefined) {
      return true;
    }
    return eventTruthTotal !== 0;
  }

  return true;
};

const amplifyEffects = (
  rule: RelicRuleDefinition,
  editorActive: boolean,
): RelicRuleDefinition['effects'] => {
  const multiplier = editorActive ? rule.amplify?.editorMultiplier ?? 1 : 1;
  if (multiplier === 1) {
    return { ...rule.effects };
  }
  return {
    truthPerRound:
      rule.effects.truthPerRound !== undefined
        ? rule.effects.truthPerRound * multiplier
        : undefined,
    ipPerRound:
      rule.effects.ipPerRound !== undefined ? rule.effects.ipPerRound * multiplier : undefined,
    aiIpPerRound:
      rule.effects.aiIpPerRound !== undefined
        ? rule.effects.aiIpPerRound * multiplier
        : undefined,
    cardDrawBonus: rule.effects.cardDrawBonus,
  };
};

const pruneExpiredEntries = (entries: TabloidRelicRuntimeEntry[]): TabloidRelicRuntimeEntry[] => {
  return entries.filter(entry => entry.remaining > 0);
};

export const RelicEngine = {
  ingestIssue(snapshot: RelicIssueSnapshot): RelicIngestResult {
    if (!isTabloidRelicsFeatureEnabled()) {
      return { runtime: null, logEntries: [] };
    }

    if (!RULES.length) {
      return { runtime: snapshot.runtime ?? null, logEntries: [] };
    }

    const runtime = cloneRuntime(snapshot.runtime);
    const logEntries: string[] = [];

    const candidates = RULES.filter(rule => evaluateTrigger(rule, snapshot));
    if (!candidates.length) {
      return { runtime: runtime && runtime.entries.length ? runtime : null, logEntries };
    }

    const selected = candidates[0];
    const amplifiedEffects = amplifyEffects(selected, snapshot.editorActive);
    const entry: TabloidRelicRuntimeEntry = {
      uid: `${selected.id}-${Date.now().toString(36)}`,
      ruleId: selected.id,
      label: selected.label,
      rarity: selected.rarity,
      summary: selected.summary,
      detail: selected.detail,
      duration: selected.duration,
      remaining: selected.duration,
      status: 'queued',
      triggeredOnRound: snapshot.round,
      clamp: selected.clamp,
      effects: amplifiedEffects,
    };

    const filtered = runtime?.entries.filter(existing => existing.ruleId !== selected.id) ?? [];
    filtered.push(entry);
    const sanitizedEntries = pruneExpiredEntries(filtered);

    const nextRuntime: TabloidRelicRuntimeState = {
      entries: sanitizedEntries,
      lastIssueRound: snapshot.round,
      lastUpdatedTurn: snapshot.turn,
    };

    logEntries.push(`Tabloid Relic queued: ${selected.label} (${selected.rarity})`);

    return {
      runtime: nextRuntime.entries.length ? nextRuntime : null,
      logEntries,
    };
  },

  applyRoundStart(payload: RelicRoundStartPayload): RelicRoundStartResult {
    const { state } = payload;
    const runtime = cloneRuntime(state.tabloidRelicsRuntime);

    if (!isTabloidRelicsFeatureEnabled() || !runtime || runtime.entries.length === 0) {
      return {
        runtime: null,
        truth: state.truth,
        ip: state.ip,
        aiIp: state.aiIP,
        bonusCardDraw: 0,
        logEntries: [],
        truthDelta: 0,
        ipDelta: 0,
        aiIpDelta: 0,
      };
    }

    const activeEntries: TabloidRelicRuntimeEntry[] = [];
    const logEntries: string[] = [];

    let truthDelta = 0;
    let ipDelta = 0;
    let aiIpDelta = 0;
    let bonusCardDraw = 0;

    let truthClampMin: number | undefined;
    let truthClampMax: number | undefined;
    let ipClampMin: number | undefined;
    let ipClampMax: number | undefined;
    let aiClampMin: number | undefined;
    let aiClampMax: number | undefined;

    for (const entry of runtime.entries) {
      const status = entry.status === 'queued' ? 'active' : entry.status;
      const remaining = status === 'queued' ? entry.remaining : entry.remaining - 1;
      const nextEntry: TabloidRelicRuntimeEntry = {
        ...entry,
        status: 'active',
        remaining,
      };

      if (entry.status === 'queued') {
        logEntries.push(`Tabloid Relic activates: ${entry.label}`);
      }

      if (nextEntry.remaining >= 0) {
        if (entry.effects.truthPerRound) {
          truthDelta += entry.effects.truthPerRound;
        }
        if (entry.effects.ipPerRound) {
          ipDelta += entry.effects.ipPerRound;
        }
        if (entry.effects.aiIpPerRound) {
          aiIpDelta += entry.effects.aiIpPerRound;
        }
        if (entry.effects.cardDrawBonus) {
          bonusCardDraw += entry.effects.cardDrawBonus;
        }
        if (entry.clamp?.truth) {
          if (entry.clamp.truth.min !== undefined) {
            truthClampMin = truthClampMin === undefined
              ? entry.clamp.truth.min
              : Math.max(truthClampMin, entry.clamp.truth.min);
          }
          if (entry.clamp.truth.max !== undefined) {
            truthClampMax = truthClampMax === undefined
              ? entry.clamp.truth.max
              : Math.min(truthClampMax, entry.clamp.truth.max);
          }
        }
        if (entry.clamp?.ip) {
          if (entry.clamp.ip.min !== undefined) {
            ipClampMin = ipClampMin === undefined
              ? entry.clamp.ip.min
              : Math.max(ipClampMin, entry.clamp.ip.min);
          }
          if (entry.clamp.ip.max !== undefined) {
            ipClampMax = ipClampMax === undefined
              ? entry.clamp.ip.max
              : Math.min(ipClampMax, entry.clamp.ip.max);
          }
        }
        if (entry.clamp?.aiIp) {
          if (entry.clamp.aiIp.min !== undefined) {
            aiClampMin = aiClampMin === undefined
              ? entry.clamp.aiIp.min
              : Math.max(aiClampMin, entry.clamp.aiIp.min);
          }
          if (entry.clamp.aiIp.max !== undefined) {
            aiClampMax = aiClampMax === undefined
              ? entry.clamp.aiIp.max
              : Math.min(aiClampMax, entry.clamp.aiIp.max);
          }
        }
      }

      if (nextEntry.remaining > 0) {
        activeEntries.push(nextEntry);
      } else {
        logEntries.push(`Tabloid Relic expires: ${entry.label}`);
      }
    }

    const nextRuntime: TabloidRelicRuntimeState | null = activeEntries.length
      ? { entries: activeEntries, lastIssueRound: runtime.lastIssueRound, lastUpdatedTurn: state.turn }
      : null;

    const resolvedTruthClampMin = truthClampMin ?? 0;
    const resolvedTruthClampMax = truthClampMax ?? 100;
    const resolvedIpClampMin = ipClampMin ?? 0;
    const resolvedIpClampMax = ipClampMax ?? Number.POSITIVE_INFINITY;
    const resolvedAiClampMin = aiClampMin ?? 0;
    const resolvedAiClampMax = aiClampMax ?? Number.POSITIVE_INFINITY;

    const nextTruth = clampNumber(state.truth + truthDelta, resolvedTruthClampMin, resolvedTruthClampMax);
    const nextIp = clampNumber(state.ip + ipDelta, resolvedIpClampMin, resolvedIpClampMax);
    const nextAiIp = clampNumber(state.aiIP + aiIpDelta, resolvedAiClampMin, resolvedAiClampMax);

    return {
      runtime: nextRuntime,
      truth: nextTruth,
      ip: nextIp,
      aiIp: nextAiIp,
      bonusCardDraw: Math.max(0, Math.round(bonusCardDraw)),
      logEntries,
      truthDelta: nextTruth - state.truth,
      ipDelta: nextIp - state.ip,
      aiIpDelta: nextAiIp - state.aiIP,
    };
  },
};
