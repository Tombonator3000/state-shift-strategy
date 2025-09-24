import type { GameCard, Rarity } from '@/rules/mvp';
import { featureFlags } from '@/state/featureFlags';
import { resolveCardMVP, type AchievementTracker, type CardPlayResolution } from '@/systems/cardResolution';
import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import {
  consumeExpose,
  consumeObfuscate,
  clearHeadlineBonus,
  clearGovernmentInitiative,
  withTruthMomentum,
} from '@/game/momentum';
import { resolveFrontPageSlot } from '@/game/frontPage';
import type { TurnPlay } from '@/game/combo.types';
import type { PlayerId } from '@/mvp/validator';

import type { CardPlayRecord, GameState } from './gameStateTypes';

const CAPTURE_REGEX = /(captured|seized)\s+([^!]+)!/i;

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
  const capturedStates = extractCapturedStates(logEntries);

  return {
    card: params.card,
    player: params.player,
    faction: params.faction,
    targetState: params.targetState ?? null,
    truthDelta,
    ipDelta,
    aiIpDelta,
    capturedStates,
    damageDealt: params.resolution.damageDealt ?? 0,
    round: params.round,
    turn: params.turn,
    timestamp: Date.now(),
    logEntries: [...logEntries],
    frontPageSlot: resolveFrontPageSlot(params.card),
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

    const captured = computeZoneCaptures(owner, state, resolution);
    if (captured.length > 0) {
      metadata.captured = captured.join(',');
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

  const baseEntry = {
    owner: playerId,
    cardId: card.id,
    cardName: card.name,
    cardType: card.type,
    cardRarity: rarity,
    cost: card.cost,
    targetStateId,
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

  const baseResolution = resolveCardMVP(prev, resolvedCard, targetState ?? null, 'ai', achievements);
  const resolution = {
    ...baseResolution,
    logEntries: [...(baseResolution.logEntries ?? [])],
  };

  const exposeActive = prev.evidenceTrack.exposeReady && prev.evidenceTrack.exposeOwner === 'ai';
  if (exposeActive) {
    resolution.aiIP = resolution.aiIP + 1;
    resolution.logEntries.push('Expose! Agency accountants skimmed +1 IP for the AI.');
  }

  const initiativeActive = prev.publicFrenzy.governmentInitiativeActiveFor === 'ai';
  if (initiativeActive) {
    resolution.aiIP = resolution.aiIP + 1;
    resolution.logEntries.push('Initiative bonus: dossier stamped before the humans reacted (+1 IP).');
  }

  const obfuscateActive = prev.evidenceTrack.obfuscateReady && prev.evidenceTrack.obfuscateOwner === 'ai';
  let updatedAiDeck = prev.aiDeck;
  let bonusAiCards: GameCard[] = [];
  if (obfuscateActive) {
    if (updatedAiDeck.length === 0) {
      const refillFaction = prev.faction === 'truth' ? 'government' : 'truth';
      updatedAiDeck = generateWeightedDeck(40, refillFaction);
    }
    if (updatedAiDeck.length > 0) {
      bonusAiCards = [updatedAiDeck[0]];
      updatedAiDeck = updatedAiDeck.slice(1);
      resolution.logEntries.push('Obfuscate! Bureaucrats slipped an extra directive into the AI dossier (+1 card).');
    }
  }

  const logEntries = [...prev.log, ...resolution.logEntries];
  const strategyLogEntries = buildStrategyLogEntries(reasoning, strategyDetails);
  if (strategyLogEntries.length) {
    logEntries.push(...strategyLogEntries);
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

  let nextState: GameState = {
    ...prev,
    ip: resolution.ip,
    aiIP: resolution.aiIP,
    truth: resolution.truth,
    states: resolution.states,
    controlledStates: resolution.controlledStates,
    aiControlledStates: resolution.aiControlledStates,
    targetState: resolution.targetState,
    aiHand: [...prev.aiHand.filter(c => c.id !== resolvedCard.id), ...bonusAiCards],
    aiDeck: updatedAiDeck,
    cardsPlayedThisRound: [...prev.cardsPlayedThisRound, playedCardRecord],
    playHistory: [...prev.playHistory, playedCardRecord],
    turnPlays: [...prev.turnPlays, ...turnPlayEntries],
    log: logEntries,
  };

  if (initiativeActive) {
    nextState = clearGovernmentInitiative(nextState, 'ai');
  }

  if (exposeActive) {
    nextState = consumeExpose(nextState, 'ai');
  }

  if (obfuscateActive) {
    nextState = consumeObfuscate(nextState, 'ai');
  }

  if (prev.publicFrenzy.bonusHeadlineActiveFor === 'ai') {
    nextState = clearHeadlineBonus(nextState, 'ai');
  }

  nextState = withTruthMomentum({
    previousTruth: prev.truth,
    newTruth: resolution.truth,
    state: nextState,
    actor: 'ai',
    card: resolvedCard,
  });

  return {
    nextState,
    card: resolvedCard,
    resolution,
  };
};
