import { emitBanter, defaultBanterUi, getCardPlayTrigger } from '@/ai/banter/banterEngine';
import type { TurnPlay } from '@/game/combo.types';
import { trackCharacterAppearance, type RecurringCharacterState } from '@/game/recurringCharacters';
import type { PlayerId } from '@/mvp/validator';
import type { PlayedLite } from '@/news/types';
import type { GameCard, Rarity } from '@/rules/mvp';
import { featureFlags } from '@/state/featureFlags';
import {
  resolveCardMVP,
  type AchievementTracker,
  type CardPlayResolution,
  type CardHotspotResolution,
} from '@/systems/cardResolution';
import type { WeightedHotspotCandidate } from '@/systems/paranormalHotspots';
import { applyTruthDelta } from '@/utils/truth';

import type { CardPlayRecord, GameState } from './gameStateTypes';
import { mergeStateEventHistories } from './stateEventHistory';

const CAPTURE_REGEX = /(captured|seized)\s+([^!]+)!/i;

const normalizeCardCategory = (value: GameCard['type']): 'ATTACK' | 'MEDIA' | 'ZONE' => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized.includes('ZONE')) {
    return 'ZONE';
  }
  if (normalized.includes('MEDIA')) {
    return 'MEDIA';
  }
  return 'ATTACK';
};

const matchesResolvedHotspot = (
  active: WeightedHotspotCandidate | null,
  resolution: CardHotspotResolution,
): boolean => {
  if (!active) {
    return false;
  }

  const activeId = active.stateId ?? active.stateAbbreviation ?? '';
  const activeAbbr = active.stateAbbreviation?.toUpperCase?.();
  const resolutionAbbr = resolution.stateAbbreviation?.toUpperCase?.();

  if (resolutionAbbr && activeAbbr && resolutionAbbr === activeAbbr) {
    return true;
  }

  if (resolution.stateId && activeId && resolution.stateId === activeId) {
    return true;
  }

  return false;
};

export const extractCapturedStates = (logEntries: string[]): string[] => {
  const states: string[] = [];
  for (const entry of logEntries) {
    const match = entry.match(CAPTURE_REGEX);
    if (match) {
      states.push(match[2]);
    }
  }
  return states;
};

export const createPlayedCardRecord = (params: {
  card: GameCard;
  player: 'human' | 'ai';
  faction: 'government' | 'truth';
  targetState?: string | null;
  resolution: CardPlayResolution;
  previousTruth: number;
  previousIp: number;
  previousAiIP: number;
  round: number;
  turn: number;
}): CardPlayRecord => {
  const logEntries = params.resolution.logEntries ?? [];
  const truthDelta = params.resolution.truth - params.previousTruth;
  const ipDelta = params.resolution.ip - params.previousIp;
  const aiIpDelta = params.resolution.aiIP - params.previousAiIP;
  const capturedStateIds = params.resolution.capturedStateIds ?? [];
  const capturedStatesFromResolution = capturedStateIds
    .map(stateId => {
      const resolvedState = params.resolution.states.find(state => state.id === stateId);
      if (!resolvedState) {
        return stateId;
      }
      return resolvedState.name ?? resolvedState.abbreviation ?? stateId;
    })
    .filter((value): value is string => Boolean(value));
  const capturedStates = capturedStatesFromResolution.length > 0
    ? capturedStatesFromResolution
    : extractCapturedStates(logEntries);

  return {
    card: params.card,
    player: params.player,
    faction: params.faction,
    targetState: params.targetState ?? null,
    truthDelta,
    ipDelta,
    aiIpDelta,
    capturedStates,
    capturedStateIds,
    damageDealt: params.resolution.damageDealt ?? 0,
    round: params.round,
    turn: params.turn,
    timestamp: Date.now(),
    logEntries: [...logEntries],
  };
};

const TURN_PLAY_OWNER: Record<'human' | 'ai', PlayerId> = {
  human: 'P1',
  ai: 'P2',
};

const resolveTargetStateId = (state: GameState, target?: string | null): string | undefined => {
  if (!target) {
    return undefined;
  }

  const normalized = String(target).trim();
  if (!normalized.length) {
    return undefined;
  }

  const match = state.states.find(candidate =>
    candidate.id === normalized ||
    candidate.abbreviation === normalized ||
    candidate.name === normalized,
  );

  return match?.id ?? normalized;
};

const computeZoneCaptures = (
  owner: 'human' | 'ai',
  state: GameState,
  resolution: CardPlayResolution,
): string[] => {
  const previous = new Set(owner === 'human' ? state.controlledStates : state.aiControlledStates);
  const next = owner === 'human' ? resolution.controlledStates : resolution.aiControlledStates;
  return next.filter(entry => !previous.has(entry));
};

const buildResolveMetadata = (
  params: {
    owner: 'human' | 'ai';
    state: GameState;
    card: GameCard;
    resolution: CardPlayResolution;
    targetStateId?: string;
  },
): Record<string, number | string | undefined> | undefined => {
  const { owner, state, card, resolution, targetStateId } = params;

  if (card.type !== 'ATTACK' && card.type !== 'MEDIA' && card.type !== 'ZONE') {
    return undefined;
  }

  const metadata: Record<string, number | string | undefined> = {};
  const capturedStateIds = resolution.capturedStateIds ?? [];
  if (capturedStateIds.length > 0) {
    const capturedAbbreviations = capturedStateIds.map(stateId => {
      const resolvedState = resolution.states.find(state => state.id === stateId);
      if (resolvedState?.abbreviation) {
        return resolvedState.abbreviation;
      }
      const previousState = state.states.find(candidate => candidate.id === stateId);
      return previousState?.abbreviation ?? stateId;
    });
    metadata.capturedIds = capturedStateIds.join(',');
    metadata.captured = capturedAbbreviations.join(',');
  }

  if (card.type === 'ATTACK') {
    if (resolution.damageDealt > 0) {
      metadata.damage = resolution.damageDealt;
    }
    const discardValue = (card.effects as { discardOpponent?: number } | undefined)?.discardOpponent;
    if (typeof discardValue === 'number' && discardValue > 0) {
      metadata.discard = discardValue;
    }
  }

  if (card.type === 'MEDIA') {
    const truthDelta = resolution.truth - state.truth;
    if (truthDelta !== 0) {
      metadata.truth = truthDelta;
    }
  }

  if (card.type === 'ZONE') {
    const pressureDelta = (card.effects as { pressureDelta?: number } | undefined)?.pressureDelta;
    if (typeof pressureDelta === 'number' && pressureDelta !== 0) {
      metadata.pressure = pressureDelta;
    }

    if (targetStateId) {
      metadata.target = targetStateId;
    }

    if (capturedStateIds.length === 0) {
      const captured = computeZoneCaptures(owner, state, resolution);
      if (captured.length > 0) {
        metadata.captured = captured.join(',');
      }
    }
  }

  const definedEntries = Object.entries(metadata).filter(([, value]) => value !== undefined);
  if (definedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(definedEntries);
};

export const createTurnPlayEntries = (params: {
  state: GameState;
  card: GameCard;
  owner: 'human' | 'ai';
  targetState?: string | null;
  resolution: CardPlayResolution;
  sequenceStart?: number;
}): TurnPlay[] => {
  const { state, card, owner, targetState, resolution } = params;
  if (card.type !== 'ATTACK' && card.type !== 'MEDIA' && card.type !== 'ZONE') {
    return [];
  }

  const playerId = TURN_PLAY_OWNER[owner];
  const rarity = (card.rarity ?? 'common') as Rarity;
  const targetStateId = resolveTargetStateId(state, targetState ?? resolution.targetState);
  const startSequence =
    typeof params.sequenceStart === 'number' ? params.sequenceStart : state.turnPlays.length;

  const rawFaction = typeof card.faction === 'string' ? card.faction.toLowerCase() : '';
  const cardFaction = rawFaction.includes('gov')
    ? 'government'
    : rawFaction.includes('truth')
      ? 'truth'
      : undefined;
  const cardTags = Array.isArray((card as { tags?: string[] }).tags)
    ? (card as { tags: string[] }).tags
        .map(tag => tag.toLowerCase().trim())
        .filter(tag => tag.length > 0)
    : [];

  const baseEntry = {
    owner: playerId,
    cardId: card.id,
    cardName: card.name,
    cardType: card.type,
    cardRarity: rarity,
    cost: card.cost,
    targetStateId,
    cardFaction,
    cardTags,
  } as const;

  const resolveMetadata = buildResolveMetadata({ owner, state, card, resolution, targetStateId });

  return [
    {
      sequence: startSequence,
      stage: 'play',
      ...baseEntry,
    },
    {
      sequence: startSequence + 1,
      stage: 'resolve',
      ...baseEntry,
      metadata: resolveMetadata,
    },
  ];
};

export const toPlayedLite = (record: CardPlayRecord): PlayedLite | null => {
  const type = String(record.card.type ?? '').toUpperCase();
  if (type !== 'ATTACK' && type !== 'MEDIA' && type !== 'ZONE') {
    return null;
  }

  const entry: PlayedLite = {
    id: record.card.id,
    name: record.card.name,
    type: type as PlayedLite['type'],
    faction: record.faction,
  };

  const positiveTruth = Math.max(0, record.truthDelta);
  if (positiveTruth > 0) {
    entry.truth = positiveTruth;
  }

  const positiveIp = Math.max(0, record.ipDelta);
  if (positiveIp > 0) {
    entry.ip = positiveIp;
  }

  const captures = record.capturedStateIds.length;
  if (captures > 0) {
    entry.captures = captures;
  }

  if (record.damageDealt > 0) {
    entry.damage = record.damageDealt;
  }

  return entry;
};

const summarizeStrategy = (reasoning?: string, strategyDetails?: string[]): string | undefined => {
  const source = reasoning ?? strategyDetails?.[0];
  if (!source) {
    return undefined;
  }

  const cleaned = source.replace(/^AI Strategy:\s*/i, '').replace(/^AI Synergy Bonus:\s*/i, '').trim();
  const normalized = cleaned.replace(/\s+/g, ' ');

  if (!normalized.length) {
    return 'AI executed a strategic play.';
  }

  const firstSentenceMatch = normalized.match(/^[^.?!]*(?:[.?!]|$)/);
  const firstSentence = (firstSentenceMatch ? firstSentenceMatch[0] : normalized).trim();
  if (!firstSentence.length) {
    return 'AI executed a strategic play.';
  }

  return firstSentence.length > 100 ? `${firstSentence.slice(0, 97).trimEnd()}…` : firstSentence;
};

export const buildStrategyLogEntries = (reasoning?: string, strategyDetails?: string[]): string[] => {
  if (featureFlags.aiVerboseStrategyLog) {
    const verboseEntries: string[] = [];
    if (reasoning) {
      verboseEntries.push(`AI Strategy: ${reasoning}`);
    }
    if (strategyDetails?.length) {
      verboseEntries.push(...strategyDetails);
    }
    return verboseEntries;
  }

  const summary = summarizeStrategy(reasoning, strategyDetails);
  return summary ? [`AI focus: ${summary}`] : [];
};

export interface AiCardPlayParams {
  cardId: string;
  card?: GameCard;
  targetState?: string;
  reasoning?: string;
  strategyDetails?: string[];
}

export interface AiCardPlayResult {
  nextState: GameState;
  card?: GameCard;
  resolution?: CardPlayResolution;
  failed?: boolean;
}

export const applyAiCardPlay = (
  prev: GameState,
  params: AiCardPlayParams,
  achievements: AchievementTracker,
): AiCardPlayResult => {
  if (prev.cardsPlayedThisTurn >= 3) {
    return {
      nextState: {
        ...prev,
        log: [
          ...prev.log,
          'AI attempted to play an additional card but already reached the turn limit of 3.',
        ],
      },
      failed: true,
    };
  }

  const { cardId, card: providedCard, targetState, reasoning, strategyDetails } = params;
  const resolvedCard = prev.aiHand.find(handCard => handCard.id === (providedCard?.id ?? cardId));

  if (!resolvedCard) {
    const missingName = providedCard?.name ?? cardId;
    return {
      nextState: {
        ...prev,
        log: [
          ...prev.log,
          `AI attempted to execute planned card "${missingName}" but it was no longer available.`,
        ],
      },
      failed: true,
    };
  }

  if (resolvedCard.type === 'ZONE') {
    const trimmedTarget = typeof targetState === 'string' ? targetState.trim() : '';
    const normalizedTarget = trimmedTarget.toLowerCase();
    const hasValidTarget =
      trimmedTarget.length > 0 &&
      prev.states.some(candidate => {
        const identifiers = [candidate.id, candidate.abbreviation, candidate.name]
          .filter(Boolean)
          .map(value => value.trim().toLowerCase());
        return identifiers.includes(normalizedTarget);
      });

    if (!hasValidTarget) {
      const explanation = trimmedTarget.length
        ? `but the target state "${trimmedTarget}" could not be resolved.`
        : 'but no target state was provided.';
      return {
        nextState: {
          ...prev,
          log: [
            ...prev.log,
            `AI attempted to deploy zone card "${resolvedCard.name}" ${explanation}`,
          ],
        },
        failed: true,
      };
    }
  }

  const cardTags = Array.isArray((resolvedCard as { tags?: string[] }).tags)
    ? ((resolvedCard as { tags: string[] }).tags)
    : [];
  const recurringState: RecurringCharacterState = { ...prev.recurringCharacters };
  const recurringTracking = trackCharacterAppearance(resolvedCard.name, cardTags, prev.round, recurringState);

  let resolution = resolveCardMVP(prev, resolvedCard, targetState ?? null, 'ai', achievements);
  const playerEditorId = prev.playerEditor ?? prev.editorId ?? null;
  if (playerEditorId) {
    const category = normalizeCardCategory(resolvedCard.type);
    void emitBanter(playerEditorId, getCardPlayTrigger(category, 'opponent'), prev.turn, defaultBanterUi);
  }
  const logEntries = [...prev.log, ...resolution.logEntries];
  const strategyLogEntries = buildStrategyLogEntries(reasoning, strategyDetails);

  if (strategyLogEntries.length) {
    logEntries.push(...strategyLogEntries);
  }

  if (recurringTracking.character) {
    if (typeof recurringTracking.bonus.truthDelta === 'number' && recurringTracking.bonus.truthDelta !== 0) {
      const truthMutation = { truth: resolution.truth, log: [] as string[] };
      applyTruthDelta(truthMutation, recurringTracking.bonus.truthDelta, 'ai');
      resolution.truth = truthMutation.truth;
      if (truthMutation.log.length > 0) {
        logEntries.push(...truthMutation.log);
      }
      const truthLabel = recurringTracking.bonus.truthDelta > 0
        ? `+${recurringTracking.bonus.truthDelta}`
        : `${recurringTracking.bonus.truthDelta}`;
      logEntries.push(
        `Recurring cameo: ${recurringTracking.character.name} reroutes the briefing (${truthLabel}% Truth sway).`,
      );
    }
    if (typeof recurringTracking.bonus.ipDelta === 'number' && recurringTracking.bonus.ipDelta !== 0) {
      resolution.aiIP = Math.max(0, resolution.aiIP + recurringTracking.bonus.ipDelta);
      const ipLabel = recurringTracking.bonus.ipDelta > 0
        ? `+${recurringTracking.bonus.ipDelta}`
        : `${recurringTracking.bonus.ipDelta}`;
      logEntries.push(
        `Recurring cameo bankroll: ${ipLabel} IP secured by ${recurringTracking.character.name}.`,
      );
    }
    if (recurringTracking.stageArc) {
      logEntries.push(
        `Where Are They Now: ${recurringTracking.character.name} escalates to "${recurringTracking.stageArc.label}" duties.`,
      );
    }
    if (recurringTracking.milestone) {
      logEntries.push(`Milestone achieved — ${recurringTracking.milestone.label}.`);
    }
  }

  const playedCardRecord = createPlayedCardRecord({
    card: resolvedCard,
    player: 'ai',
    faction: prev.faction === 'truth' ? 'government' : 'truth',
    targetState,
    resolution,
    previousTruth: prev.truth,
    previousIp: prev.ip,
    previousAiIP: prev.aiIP,
    round: prev.round,
    turn: prev.turn,
  });

  const turnPlayEntries = createTurnPlayEntries({
    state: prev,
    card: resolvedCard,
    owner: 'ai',
    targetState,
    resolution,
  });

  const turnBufferEntry = toPlayedLite(playedCardRecord);

  const updatedHotspots = { ...prev.paranormalHotspots };
  if (resolution.resolvedHotspots) {
    for (const abbr of resolution.resolvedHotspots) {
      delete updatedHotspots[abbr];
    }
  }

  let nextActiveHotspot = prev.activeHotspot;
  if (resolution.hotspotResolutions) {
    for (const resolved of resolution.hotspotResolutions) {
      if (matchesResolvedHotspot(nextActiveHotspot, resolved)) {
        nextActiveHotspot = null;
      }
    }
  }

  const mergedStates = mergeStateEventHistories(prev.states, resolution.states);

  const nextState: GameState = {
    ...prev,
    ip: resolution.ip,
    aiIP: resolution.aiIP,
    truth: resolution.truth,
    states: mergedStates,
    controlledStates: resolution.controlledStates,
    aiControlledStates: resolution.aiControlledStates,
    targetState: resolution.targetState,
    aiHand: prev.aiHand.filter(c => c.id !== resolvedCard.id),
    cardsPlayedThisRound: [...prev.cardsPlayedThisRound, playedCardRecord],
    playHistory: [...prev.playHistory, playedCardRecord],
    turnPlays: [...prev.turnPlays, ...turnPlayEntries],
    turnBuffer: turnBufferEntry ? [...prev.turnBuffer, turnBufferEntry] : prev.turnBuffer,
    log: logEntries,
    paranormalHotspots: updatedHotspots,
    cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
    activeHotspot: nextActiveHotspot,
    recurringCharacters: recurringTracking.character ? recurringState : prev.recurringCharacters,
  };

  return {
    nextState,
    card: resolvedCard,
    resolution,
  };
};
