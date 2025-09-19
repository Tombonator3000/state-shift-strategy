import type { GameCard } from '@/rules/mvp';
import { featureFlags } from '@/state/featureFlags';
import { resolveCardMVP, type AchievementTracker, type CardPlayResolution } from '@/systems/cardResolution';

import type { GameState } from './gameStateTypes';

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
  targetState?: string | null;
  resolution: CardPlayResolution;
  previousTruth: number;
}) => ({
  card: params.card,
  player: params.player,
  targetState: params.targetState ?? null,
  truthDelta: params.resolution.truth - params.previousTruth,
  capturedStates: extractCapturedStates(params.resolution.logEntries),
});

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

  const resolution = resolveCardMVP(prev, resolvedCard, targetState ?? null, 'ai', achievements);
  const logEntries = [...prev.log, ...resolution.logEntries];
  const strategyLogEntries = buildStrategyLogEntries(reasoning, strategyDetails);

  if (strategyLogEntries.length) {
    logEntries.push(...strategyLogEntries);
  }

  const playedCardRecord = createPlayedCardRecord({
    card: resolvedCard,
    player: 'ai',
    targetState,
    resolution,
    previousTruth: prev.truth,
  });

  const nextState: GameState = {
    ...prev,
    ip: resolution.ip,
    aiIP: resolution.aiIP,
    truth: resolution.truth,
    states: resolution.states,
    controlledStates: resolution.controlledStates,
    aiControlledStates: resolution.aiControlledStates,
    targetState: resolution.targetState,
    aiHand: prev.aiHand.filter(c => c.id !== resolvedCard.id),
    cardsPlayedThisRound: [...prev.cardsPlayedThisRound, playedCardRecord],
    log: logEntries,
  };

  return {
    nextState,
    card: resolvedCard,
    resolution,
  };
};
