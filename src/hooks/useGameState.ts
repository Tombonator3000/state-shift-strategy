import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE, getRandomCards } from '@/data/cardDatabase';
import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';
import {
  applyStateCombinationCostModifiers,
  calculateDynamicIpBonus,
  applyDefenseBonusToStates,
  createDefaultCombinationEffects,
} from '@/data/stateCombinations';
import { getRandomAgenda, getAgendaById, resolveAgendaStageByProgress } from '@/data/agendaDatabase';
import type { SecretAgenda } from '@/data/agendaDatabase';
import {
  advanceAgendaIssue,
  agendaIssueToState,
  getIssueQuip,
  peekActiveAgendaIssue,
  resolveIssueStateById,
} from '@/data/agendaIssues';
import { type AIDifficulty } from '@/data/aiStrategy';
import { AIFactory } from '@/data/aiFactory';
import { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import { chooseTurnActions } from '@/ai/enhancedController';
import { EVENT_DATABASE, EventManager, type GameEvent, type ParanormalHotspotPayload } from '@/data/eventDatabase';
import { processAiActions } from './aiTurnActions';
import { buildEditionEvents } from './eventEdition';
import { getStartingHandSize, type DrawMode, type CardDrawState } from '@/data/cardDrawingSystem';
import { useAchievements } from '@/contexts/AchievementContext';
import { resolveCardMVP, type CardPlayResolution } from '@/systems/cardResolution';
import { useStateEvents } from '@/hooks/useStateEvents';
import { applyTruthDelta } from '@/utils/truth';
import type { Difficulty } from '@/ai';
import { getDifficulty } from '@/state/settings';
import { featureFlags } from '@/state/featureFlags';
import { getComboSettings } from '@/game/comboEngine';
import type {
  ActiveCampaignArcState,
  ActiveParanormalHotspot,
  ActiveStateBonus,
  GameState,
  PendingCampaignArcEvent,
  StateEventBonusSummary,
  StateParanormalHotspot,
} from './gameStateTypes';
import {
  applyAiCardPlay,
  buildStrategyLogEntries as buildStrategyLogEntriesHelper,
  createPlayedCardRecord,
  createTurnPlayEntries,
  type AiCardPlayParams,
} from './aiHelpers';
import { evaluateCombosForTurn } from './comboAdapter';
import { mergeStateEventHistories, trimStateEventHistory } from './stateEventHistory';
import { assignStateBonuses } from '@/game/stateBonuses';
import { applyStateBonusAssignmentToState } from './stateBonusAssignment';

const omitClashKey = (key: string, value: unknown) => (key === 'clash' ? undefined : value);

const HAND_LIMIT = 5;

type AgendaOwner = 'human' | 'ai';

const OWNER_LABEL: Record<AgendaOwner, 'player' | 'ai'> = {
  human: 'player',
  ai: 'ai',
};

const MEDIA_TOTAL_SUFFIX = 'mediaTotal';
const MEDIA_ROUND_SUFFIX = 'mediaThisRound';
const SIGHTING_TOTAL_SUFFIX = 'sightingsTotal';
const SIGHTING_ROUND_SUFFIX = 'sightingsThisRound';

const incrementCounterMap = (
  map: Record<string, number> | undefined,
  key: string,
  amount = 1,
): Record<string, number> => {
  if (!key) {
    return map ?? {};
  }
  if (amount === 0) {
    return map ?? {};
  }
  const source = map ?? {};
  const current = typeof source[key] === 'number' && Number.isFinite(source[key]) ? source[key] : 0;
  return {
    ...source,
    [key]: current + amount,
  };
};

const applyAgendaCardCounters = (
  state: GameState,
  owner: AgendaOwner,
  card: GameCard,
): { issueCounters: Record<string, number>; roundCounters: Record<string, number> } => {
  if (card.type !== 'MEDIA') {
    return {
      issueCounters: state.agendaIssueCounters ?? {},
      roundCounters: state.agendaRoundCounters ?? {},
    };
  }
  const ownerKey = OWNER_LABEL[owner];
  const totalKey = `${ownerKey}:${MEDIA_TOTAL_SUFFIX}`;
  const roundKey = `${ownerKey}:${MEDIA_ROUND_SUFFIX}`;
  return {
    issueCounters: incrementCounterMap(state.agendaIssueCounters, totalKey),
    roundCounters: incrementCounterMap(state.agendaRoundCounters, roundKey),
  };
};

const applyAgendaSightingCounters = (
  state: GameState,
  owner: AgendaOwner,
): { issueCounters: Record<string, number>; roundCounters: Record<string, number> } => {
  const ownerKey = OWNER_LABEL[owner];
  const totalKey = `${ownerKey}:${SIGHTING_TOTAL_SUFFIX}`;
  const roundKey = `${ownerKey}:${SIGHTING_ROUND_SUFFIX}`;
  return {
    issueCounters: incrementCounterMap(state.agendaIssueCounters, totalKey),
    roundCounters: incrementCounterMap(state.agendaRoundCounters, roundKey),
  };
};

const formatAgendaLogEntry = (
  agenda: SecretAgenda,
  message: string,
  quip?: string | null,
): string => {
  const headline = agenda.headline?.trim().length ? agenda.headline.trim() : agenda.title;
  const operation = agenda.operationName?.trim().length ? agenda.operationName.trim() : agenda.title;
  const cleanedMessage = message.trim().replace(/\s+/g, ' ');
  const base = `🗞️ ${headline} (${operation}) ${cleanedMessage}`.trim();
  if (!quip) {
    return base;
  }
  const trimmedQuip = quip.trim();
  return trimmedQuip.length ? `${base} — ${trimmedQuip}` : base;
};

const computeTruthStreaks = (
  prev: Pick<GameState, 'truthAbove80Streak' | 'truthBelow20Streak'>,
  truth: number,
) => {
  const previousAbove = Number.isFinite(prev.truthAbove80Streak)
    ? prev.truthAbove80Streak
    : 0;
  const previousBelow = Number.isFinite(prev.truthBelow20Streak)
    ? prev.truthBelow20Streak
    : 0;

  if (truth >= 80) {
    return {
      truthAbove80Streak: previousAbove + 1,
      truthBelow20Streak: 0,
    };
  }

  if (truth <= 20) {
    return {
      truthAbove80Streak: 0,
      truthBelow20Streak: previousBelow + 1,
    };
  }

  return {
    truthAbove80Streak: 0,
    truthBelow20Streak: 0,
  };
};

const STREAK_AGENDA_IDS = new Set(['truth_moonbeam_marmalade', 'gov_coverup_casserole']);

const DEFAULT_HOTSPOT_SOURCE: NonNullable<ParanormalHotspotPayload['source']> = 'neutral';

const computeHotspotTurnsRemaining = (currentTurn: number, expiresOnTurn: number) =>
  Math.max(0, expiresOnTurn - currentTurn);

const resolveHotspotSource = (
  payload: ParanormalHotspotPayload,
): NonNullable<ParanormalHotspotPayload['source']> => payload.source ?? DEFAULT_HOTSPOT_SOURCE;

const resolveHotspotAvoidFaction = (
  payload: ParanormalHotspotPayload,
  playerFaction: 'truth' | 'government',
): 'truth' | 'government' => {
  if (payload.source === 'truth' || payload.source === 'government') {
    return payload.source;
  }

  return playerFaction;
};

const ownerToFaction = (
  owner: 'player' | 'ai' | 'neutral',
  playerFaction: 'truth' | 'government',
): 'truth' | 'government' | 'neutral' => {
  if (owner === 'neutral') return 'neutral';
  if (owner === 'player') return playerFaction;
  return playerFaction === 'truth' ? 'government' : 'truth';
};

const findCampaignEventByChapter = (arcId: string, chapter: number): GameEvent | undefined =>
  EVENT_DATABASE.find(event => event.campaign?.arcId === arcId && event.campaign.chapter === chapter);

const updateCampaignArcProgress = (
  params: {
    currentArcs: ActiveCampaignArcState[];
    pendingEvents: PendingCampaignArcEvent[];
    triggeredEvent: GameEvent;
  },
): {
  activeArcs: ActiveCampaignArcState[];
  pendingEvents: PendingCampaignArcEvent[];
  logEntry?: string;
} => {
  const { currentArcs, pendingEvents, triggeredEvent } = params;
  if (!triggeredEvent.campaign) {
    return {
      activeArcs: currentArcs,
      pendingEvents,
    };
  }

  const { arcId, chapter, resolution } = triggeredEvent.campaign;
  const nextActiveArcs = currentArcs.map(arc => ({ ...arc }));
  const existingIndex = nextActiveArcs.findIndex(arc => arc.arcId === arcId);
  const status: ActiveCampaignArcState['status'] = resolution === 'finale' ? 'completed' : 'active';

  if (existingIndex === -1) {
    nextActiveArcs.push({
      arcId,
      currentChapter: chapter,
      lastEventId: triggeredEvent.id,
      status,
      resolution,
    });
  } else {
    const existing = nextActiveArcs[existingIndex];
    nextActiveArcs[existingIndex] = {
      ...existing,
      currentChapter: Math.max(existing.currentChapter, chapter),
      lastEventId: triggeredEvent.id,
      status,
      resolution,
    };
  }

  let nextPendingEvents = pendingEvents.filter(
    pending => !(pending.arcId === arcId && pending.chapter <= chapter),
  );

  if (resolution !== 'finale') {
    const nextChapter = chapter + 1;
    const nextEvent = findCampaignEventByChapter(arcId, nextChapter);
    if (nextEvent) {
      const alreadyQueued = nextPendingEvents.some(
        pending => pending.arcId === arcId && pending.chapter === nextChapter,
      );
      if (!alreadyQueued) {
        nextPendingEvents = [
          ...nextPendingEvents,
          { arcId, chapter: nextChapter, eventId: nextEvent.id },
        ];
      }
    } else {
      const updatedIndex = nextActiveArcs.findIndex(arc => arc.arcId === arcId);
      if (updatedIndex !== -1) {
        nextActiveArcs[updatedIndex] = {
          ...nextActiveArcs[updatedIndex],
          status: 'completed',
        };
      }
    }
  }

  nextPendingEvents = nextPendingEvents
    .slice()
    .sort((a, b) => (a.chapter === b.chapter ? a.arcId.localeCompare(b.arcId) : a.chapter - b.chapter));

  const logEntry = resolution === 'finale'
    ? `📖 Campaign arc ${arcId} concluded with ${triggeredEvent.title}.`
    : `📖 Campaign arc ${arcId} advanced to chapter ${chapter}.`;

  return {
    activeArcs: nextActiveArcs,
    pendingEvents: nextPendingEvents,
    logEntry,
  };
};

const selectPendingArcEvent = (
  pendingEvents: PendingCampaignArcEvent[],
  eventManager: EventManager | undefined,
  gameState: GameState,
): { event: GameEvent; index: number } | null => {
  if (!eventManager || pendingEvents.length === 0) {
    return null;
  }

  const availableEvents = eventManager.getAvailableEvents(gameState);
  const availableById = new Map(availableEvents.map(event => [event.id, event]));

  for (let index = 0; index < pendingEvents.length; index += 1) {
    const pending = pendingEvents[index];
    const candidate = availableById.get(pending.eventId);
    if (!candidate) {
      continue;
    }

    const forcedEvent: GameEvent = {
      ...candidate,
      triggerChance: 1,
      conditionalChance: 1,
    };

    return { event: forcedEvent, index };
  }

  return null;
};

const selectHotspotTargetState = (params: {
  states: GameState['states'];
  activeHotspots: Record<string, ActiveParanormalHotspot>;
  payload: ParanormalHotspotPayload;
  playerFaction: 'truth' | 'government';
}): GameState['states'][number] | undefined => {
  const { states, activeHotspots, payload, playerFaction } = params;
  const activeSet = new Set(Object.keys(activeHotspots));

  const avoidFaction = resolveHotspotAvoidFaction(payload, playerFaction);

  if (payload.stateId) {
    const target = states.find(state =>
      state.id === payload.stateId ||
      state.abbreviation === payload.stateId ||
      state.abbreviation === payload.stateId.toUpperCase() ||
      state.name.toLowerCase() === payload.stateId.toLowerCase(),
    );
    if (target && !activeSet.has(target.abbreviation)) {
      return target;
    }
  }

  const available = states.filter(state => !activeSet.has(state.abbreviation));
  if (available.length === 0) {
    return undefined;
  }

  const contested = available.filter(state => state.contested);
  const neutral = available.filter(state => state.owner === 'neutral');
  const opponentOwned = available.filter(state => {
    const faction = ownerToFaction(state.owner, playerFaction);
    return faction !== 'neutral' && faction !== avoidFaction;
  });

  const fallback = available.filter(state => ownerToFaction(state.owner, playerFaction) !== avoidFaction);

  const buckets = [contested, neutral, opponentOwned];
  for (const bucket of buckets) {
    if (bucket.length > 0) {
      const index = Math.floor(Math.random() * bucket.length);
      return bucket[index];
    }
  }

  if (fallback.length > 0) {
    const index = Math.floor(Math.random() * fallback.length);
    return fallback[index];
  }

  return undefined;
};

const toStateHotspot = (
  hotspot: ActiveParanormalHotspot,
  currentTurn: number,
): StateParanormalHotspot => ({
  id: hotspot.id,
  eventId: hotspot.eventId,
  label: hotspot.label,
  description: hotspot.description,
  icon: hotspot.icon,
  defenseBoost: hotspot.defenseBoost,
  truthReward: hotspot.truthReward,
  expiresOnTurn: hotspot.expiresOnTurn,
  turnsRemaining: computeHotspotTurnsRemaining(currentTurn, hotspot.expiresOnTurn),
  source: hotspot.source,
});

const createHotspotEntries = (params: {
  event: GameEvent;
  payload: ParanormalHotspotPayload;
  state: GameState['states'][number];
  currentTurn: number;
}): { active: ActiveParanormalHotspot; stateHotspot: StateParanormalHotspot } => {
  const { event, payload, state, currentTurn } = params;
  const duration = Math.max(1, payload.duration);
  const expiresOnTurn = currentTurn + duration;
  const source = resolveHotspotSource(payload);
  const id = `${event.id}:${state.abbreviation}:${currentTurn}`;

  const active: ActiveParanormalHotspot = {
    id,
    eventId: event.id,
    stateId: state.id,
    stateName: state.name,
    stateAbbreviation: state.abbreviation,
    label: payload.label,
    description: payload.description,
    icon: payload.icon,
    duration,
    defenseBoost: payload.defenseBoost,
    truthReward: payload.truthReward,
    expiresOnTurn,
    createdOnTurn: currentTurn,
    source,
  };

  return {
    active,
    stateHotspot: toStateHotspot(active, currentTurn),
  };
};

const cloneEventEffects = (
  effects: GameEvent['effects'] | undefined,
): NonNullable<GameEvent['effects']> | undefined => {
  if (!effects || typeof effects !== 'object') {
    return undefined;
  }

  const cloned: Partial<NonNullable<GameEvent['effects']>> = {};
  const assignNumber = <K extends keyof NonNullable<GameEvent['effects']>>(key: K, value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      cloned[key] = value as NonNullable<GameEvent['effects']>[K];
    }
  };

  assignNumber('truth', effects.truth);
  assignNumber('ip', effects.ip);
  assignNumber('cardDraw', effects.cardDraw);
  assignNumber('truthChange', effects.truthChange);
  assignNumber('ipChange', effects.ipChange);
  assignNumber('defenseChange', effects.defenseChange);

  if (effects.stateEffects && typeof effects.stateEffects === 'object') {
    const stateEffectsSource = effects.stateEffects;
    const stateEffects: Partial<NonNullable<NonNullable<GameEvent['effects']>['stateEffects']>> = {};

    if (typeof stateEffectsSource.stateId === 'string' && stateEffectsSource.stateId.trim().length > 0) {
      stateEffects.stateId = stateEffectsSource.stateId.trim();
    }

    if (typeof stateEffectsSource.pressure === 'number' && Number.isFinite(stateEffectsSource.pressure)) {
      stateEffects.pressure = stateEffectsSource.pressure;
    }

    if (typeof stateEffectsSource.defense === 'number' && Number.isFinite(stateEffectsSource.defense)) {
      stateEffects.defense = stateEffectsSource.defense;
    }

    if (Object.keys(stateEffects).length > 0) {
      cloned.stateEffects = stateEffects as NonNullable<NonNullable<GameEvent['effects']>['stateEffects']>;
    }
  }

  if (typeof effects.skipTurn === 'boolean') {
    cloned.skipTurn = effects.skipTurn;
  }

  if (typeof effects.doubleIncome === 'boolean') {
    cloned.doubleIncome = effects.doubleIncome;
  }

  if (typeof effects.revealSecretAgenda === 'boolean') {
    cloned.revealSecretAgenda = effects.revealSecretAgenda;
  }

  return Object.keys(cloned).length > 0
    ? (cloned as NonNullable<GameEvent['effects']>)
    : undefined;
};

const buildStateEventEffectSummary = (effects: GameEvent['effects'] | undefined): string[] => {
  if (!effects || typeof effects !== 'object') {
    return [];
  }

  const summary: string[] = [];
  const formatSigned = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  const truthDelta = (effects.truth ?? 0) + (effects.truthChange ?? 0);
  if (truthDelta) {
    summary.push(`Truth ${formatSigned(truthDelta)}%`);
  }

  const ipDelta = (effects.ip ?? 0) + (effects.ipChange ?? 0);
  if (ipDelta) {
    summary.push(`IP ${formatSigned(ipDelta)}`);
  }

  if (typeof effects.cardDraw === 'number' && Number.isFinite(effects.cardDraw) && effects.cardDraw !== 0) {
    const amount = effects.cardDraw;
    const cardLabel = Math.abs(amount) === 1 ? 'card' : 'cards';
    summary.push(`Draw ${formatSigned(amount)} ${cardLabel}`);
  }

  if (typeof effects.defenseChange === 'number' && Number.isFinite(effects.defenseChange) && effects.defenseChange !== 0) {
    summary.push(`Defense ${formatSigned(effects.defenseChange)}`);
  }

  if (effects.stateEffects && typeof effects.stateEffects === 'object') {
    if (typeof effects.stateEffects.defense === 'number' && Number.isFinite(effects.stateEffects.defense) && effects.stateEffects.defense !== 0) {
      summary.push(`Local defense ${formatSigned(effects.stateEffects.defense)}`);
    }

    if (typeof effects.stateEffects.pressure === 'number' && Number.isFinite(effects.stateEffects.pressure) && effects.stateEffects.pressure !== 0) {
      summary.push(`State pressure ${formatSigned(effects.stateEffects.pressure)}`);
    }
  }

  if (effects.doubleIncome) {
    summary.push('Double income next turn');
  }

  if (effects.skipTurn) {
    summary.push('Skip next turn');
  }

  if (effects.revealSecretAgenda) {
    summary.push('Reveal secret agenda');
  }

  return summary;
};

const createStateEventBonusSummary = (params: {
  event: GameEvent;
  faction: 'truth' | 'government';
  turn: number;
}): StateEventBonusSummary => {
  const { event, faction, turn } = params;
  const labelSource = typeof event.title === 'string' && event.title.trim().length > 0
    ? event.title.trim()
    : typeof event.headline === 'string' && event.headline.trim().length > 0
      ? event.headline.trim()
      : 'State Event Bonus';
  const descriptionSource = typeof event.headline === 'string' && event.headline.trim().length > 0
    ? event.headline.trim()
    : typeof event.content === 'string' && event.content.trim().length > 0
      ? event.content.trim()
      : undefined;
  const effects = cloneEventEffects(event.effects);
  const effectSummary = buildStateEventEffectSummary(event.effects);

  return {
    source: 'state-event',
    eventId: event.id,
    label: labelSource,
    description: descriptionSource,
    triggeredOnTurn: Math.max(1, turn),
    faction,
    effects,
    effectSummary: effectSummary.length > 0 ? effectSummary : undefined,
  } satisfies StateEventBonusSummary;
};

const normalizeStateEventBonus = (
  raw: unknown,
  fallbackTurn: number,
): StateEventBonusSummary | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const data = raw as Partial<StateEventBonusSummary> & { source?: unknown };
  if (data.source !== 'state-event') {
    return undefined;
  }

  const eventId = typeof data.eventId === 'string' && data.eventId.trim().length > 0
    ? data.eventId.trim()
    : undefined;

  if (!eventId) {
    return undefined;
  }

  const label = typeof data.label === 'string' && data.label.trim().length > 0
    ? data.label.trim()
    : 'State Event Bonus';
  const description = typeof data.description === 'string' && data.description.trim().length > 0
    ? data.description.trim()
    : undefined;
  const triggeredOnTurn = typeof data.triggeredOnTurn === 'number' && Number.isFinite(data.triggeredOnTurn)
    ? Math.max(1, Math.floor(data.triggeredOnTurn))
    : Math.max(1, Math.floor(fallbackTurn));
  const faction = data.faction === 'truth' || data.faction === 'government'
    ? data.faction
    : 'truth';
  const effectSummary = Array.isArray(data.effectSummary)
    ? data.effectSummary
        .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(entry => entry.length > 0)
    : undefined;
  const effects = cloneEventEffects((data as { effects?: GameEvent['effects'] }).effects);

  return {
    source: 'state-event',
    eventId,
    label,
    description,
    triggeredOnTurn,
    faction,
    effects,
    effectSummary: effectSummary && effectSummary.length > 0 ? effectSummary : undefined,
  } satisfies StateEventBonusSummary;
};

const normalizeStateEventHistory = (
  raw: unknown,
  fallbackTurn: number,
): StateEventBonusSummary[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const normalized = raw
    .map(entry => normalizeStateEventBonus(entry, fallbackTurn))
    .filter((entry): entry is StateEventBonusSummary => Boolean(entry));

  return trimStateEventHistory(normalized);
};

const revealAiSecretAgenda = (
  state: GameState,
  context: { type: 'card' | 'event'; name: string },
): GameState => {
  const agenda = state.aiSecretAgenda;
  if (!agenda || agenda.revealed) {
    return state;
  }

  const sourceLabel = context.type === 'event' ? 'Event' : 'Card';
  const message = `🔍 ${sourceLabel} "${context.name}" exposed the enemy secret agenda: ${agenda.title}.`;

  return {
    ...state,
    aiSecretAgenda: { ...agenda, revealed: true },
    log: [...state.log, message],
  };
};

const DIFFICULTY_TO_AI_DIFFICULTY: Record<Difficulty, AIDifficulty> = {
  EASY: 'easy',
  NORMAL: 'medium',
  HARD: 'hard',
  TOP_SECRET_PLUS: 'legendary',
};

const normalizeRoundFromSave = (saveData: Partial<GameState>): number => {
  const rawRound = typeof saveData.round === 'number' && Number.isFinite(saveData.round)
    ? saveData.round
    : 0;
  const rawTurn = typeof saveData.turn === 'number' && Number.isFinite(saveData.turn)
    ? saveData.turn
    : 1;
  const expectedRound = saveData.currentPlayer === 'human'
    ? Math.max(1, rawTurn)
    : Math.max(1, rawTurn - 1);

  return Math.max(expectedRound, rawRound);
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

const isDebugEnvironment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;

const buildStrategyLogEntries = (reasoning?: string, strategyDetails?: string[]): string[] => {
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

const debugStrategyToConsole = (reasoning?: string, strategyDetails?: string[]) => {
  if (featureFlags.aiVerboseStrategyLog || !isDebugEnvironment) {
    return;
  }

  if (reasoning) {
    console.debug('[AI Strategy]', reasoning);
  }

  strategyDetails?.forEach(detail => {
    console.debug('[AI Strategy Detail]', detail);
  });
};

const resolveAiDifficulty = (override?: AIDifficulty): AIDifficulty => {
  if (override) {
    return override;
  }

  try {
    return DIFFICULTY_TO_AI_DIFFICULTY[getDifficulty()];
  } catch {
    return 'medium';
  }
};

const drawCardsFromDeck = (
  deck: GameCard[],
  count: number,
  faction: 'government' | 'truth',
): { drawn: GameCard[]; deck: GameCard[] } => {
  if (count <= 0) {
    return { drawn: [], deck: [...deck] };
  }

  const drawn: GameCard[] = [];
  let nextDeck = [...deck];

  while (drawn.length < count) {
    if (nextDeck.length === 0) {
      const replenished = generateWeightedDeck(40, faction);
      if (replenished.length === 0) {
        break;
      }
      nextDeck = [...replenished];
    }

    const card = nextDeck.shift();
    if (!card) {
      break;
    }
    drawn.push(card);
  }

  return { drawn, deck: nextDeck };
};

type AgendaPerspective = 'player' | 'ai';

const buildAgendaSnapshot = (state: GameState, perspective: AgendaPerspective) => {
  const isPlayer = perspective === 'player';
  const faction = isPlayer ? state.faction : state.faction === 'truth' ? 'government' : 'truth';
  const playOwner = isPlayer ? 'human' : 'ai';
  const ownerKey = OWNER_LABEL[playOwner];
  const issueCounters = state.agendaIssueCounters ?? {};
  const roundCounters = state.agendaRoundCounters ?? {};
  const mediaRoundKey = `${ownerKey}:${MEDIA_ROUND_SUFFIX}`;
  const mediaTotalKey = `${ownerKey}:${MEDIA_TOTAL_SUFFIX}`;
  const sightingRoundKey = `${ownerKey}:${SIGHTING_ROUND_SUFFIX}`;
  const sightingTotalKey = `${ownerKey}:${SIGHTING_TOTAL_SUFFIX}`;

  return {
    controlledStates: isPlayer ? state.controlledStates : state.aiControlledStates,
    aiControlledStates: isPlayer ? state.aiControlledStates : state.controlledStates,
    states: state.states,
    truth: state.truth,
    truthAbove80Streak: state.truthAbove80Streak,
    truthBelow20Streak: state.truthBelow20Streak,
    timeBasedGoalCounters: state.timeBasedGoalCounters,
    ip: isPlayer ? state.ip : state.aiIP,
    aiIP: isPlayer ? state.aiIP : state.ip,
    round: state.round,
    turn: state.turn,
    currentPlayer: state.currentPlayer,
    faction,
    playHistory: state.playHistory,
    factionPlayHistory: state.playHistory.filter(record => record.player === playOwner),
    comboTruthDeltaThisRound: state.comboTruthDeltaThisRound,
    activeStateCombinationIds: state.activeStateCombinationIds,
    stateCombinationEffects: state.stateCombinationEffects,
    agendaIssue: state.agendaIssue,
    agendaIssueCounters: issueCounters,
    agendaRoundCounters: roundCounters,
    derivedCounters: {
      mediaCardsPlayedThisRound: typeof roundCounters[mediaRoundKey] === 'number'
        ? roundCounters[mediaRoundKey]
        : 0,
      mediaCardsPlayedTotal: typeof issueCounters[mediaTotalKey] === 'number'
        ? issueCounters[mediaTotalKey]
        : 0,
      sightingsLoggedThisRound: typeof roundCounters[sightingRoundKey] === 'number'
        ? roundCounters[sightingRoundKey]
        : 0,
      sightingsLoggedTotal: typeof issueCounters[sightingTotalKey] === 'number'
        ? issueCounters[sightingTotalKey]
        : 0,
    },
  };
};

const updateSecretAgendaProgress = (state: GameState): GameState => {
  let logUpdates: string[] = [];
  let updatedSecretAgenda = state.secretAgenda;
  let updatedAiSecretAgenda = state.aiSecretAgenda;

  const issueId = state.agendaIssue?.id;
  const playerFaction = state.faction;
  const aiFaction = state.faction === 'truth' ? 'government' : 'truth';

  const processAgenda = <T extends NonNullable<GameState['secretAgenda']> | NonNullable<GameState['aiSecretAgenda']>>(
    agenda: T,
    perspective: AgendaPerspective,
    faction: 'truth' | 'government',
    actor: 'player' | 'opposition',
    options: { requireRevealForProgress?: boolean } = {},
  ): T => {
    const snapshot = buildAgendaSnapshot(state, perspective);
    const progressResult = agenda.checkProgress?.(snapshot);
    const computedProgressRaw = typeof progressResult === 'number'
      ? progressResult
      : typeof (progressResult as { progress?: number } | null | undefined)?.progress === 'number'
        ? (progressResult as { progress: number }).progress
        : agenda.progress ?? 0;
    const computedProgress = Number.isFinite(computedProgressRaw)
      ? Math.max(0, computedProgressRaw)
      : agenda.progress ?? 0;
    const previousProgress = agenda.progress ?? 0;
    const target = agenda.target ?? 0;
    const previousStageId = agenda.stageId
      ?? resolveAgendaStageByProgress(agenda.stages, previousProgress)?.id
      ?? '';
    const rawStageId = typeof progressResult === 'object' && progressResult
      ? String((progressResult as { stageId?: string }).stageId ?? '')
      : '';
    const fallbackStage = resolveAgendaStageByProgress(agenda.stages, computedProgress);
    const computedStageId = (rawStageId || fallbackStage?.id || previousStageId || '').trim();
    const stageDefinition = agenda.stages?.find(stage => stage.id === computedStageId) ?? fallbackStage;
    const previousStageDefinition = agenda.stages?.find(stage => stage.id === previousStageId) ?? null;
    const stageIndex = agenda.stages?.findIndex(stage => stage.id === computedStageId) ?? -1;
    const previousStageIndex = agenda.stages?.findIndex(stage => stage.id === previousStageId) ?? -1;
    const stageChanged = computedStageId !== previousStageId;
    const isCompleted = computedProgress >= target;
    const isStreakAgenda = STREAK_AGENDA_IDS.has(agenda.id);
    const shouldLogProgress = options.requireRevealForProgress ? Boolean(agenda.revealed) : true;
    const actorPrefix = actor === 'opposition' ? 'Opposition ' : '';
    const actorLabel = actor === 'opposition' ? 'Opposition' : 'Operatives';
    const stageIsFinal = Boolean(stageDefinition && stageDefinition.threshold >= target);
    let stageStatus: 'advance' | 'setback' | 'complete' = 'advance';
    if (stageChanged) {
      if (isCompleted && stageIsFinal) {
        stageStatus = 'complete';
      } else if (stageIndex !== -1 && previousStageIndex !== -1 && stageIndex < previousStageIndex) {
        stageStatus = 'setback';
      }
    }

    if (computedProgress > previousProgress && shouldLogProgress) {
      const delta = computedProgress - previousProgress;
      const progressMessage = isStreakAgenda
        ? `${actorPrefix}streak climbs to ${computedProgress}/${target}.`
        : `${actorPrefix}progress hits ${computedProgress}/${target} (+${delta}).`;
      const quip = getIssueQuip(issueId, faction, computedProgress);
      logUpdates = [...logUpdates, formatAgendaLogEntry(agenda, progressMessage, quip)];
    } else if (computedProgress < previousProgress && isStreakAgenda && shouldLogProgress) {
      const dropMessage = `${actorPrefix}streak slips to ${computedProgress}/${target}.`;
      const quip = getIssueQuip(issueId, faction, -computedProgress);
      logUpdates = [...logUpdates, formatAgendaLogEntry(agenda, dropMessage, quip)];
    }

    if (stageChanged && shouldLogProgress && stageDefinition) {
      const stageLabel = stageDefinition.label ?? computedStageId;
      const stageMessage = stageStatus === 'setback'
        ? `${actorLabel} fall back to ${stageLabel}.`
        : `${actorLabel} advance to ${stageLabel}.`;
      const quip = getIssueQuip(
        issueId,
        faction,
        stageStatus === 'setback' ? -computedProgress : computedProgress,
      );
      logUpdates = [...logUpdates, formatAgendaLogEntry(agenda, stageMessage, quip)];
    }

    if (isCompleted && !agenda.completed) {
      const completionMessage = `${actorLabel} secure the objective at ${computedProgress}/${target}!`;
      const quip = getIssueQuip(issueId, faction, computedProgress * 2);
      logUpdates = [...logUpdates, formatAgendaLogEntry(agenda, completionMessage, quip)];
    } else if (!isCompleted && agenda.completed && (!options.requireRevealForProgress || agenda.revealed)) {
      const regressionMessage = actor === 'opposition'
        ? `${actorPrefix}momentum collapses to ${computedProgress}/${target}.`
        : `${actorLabel} fall back to ${computedProgress}/${target}.`;
      const quip = getIssueQuip(issueId, faction, -computedProgress * 2);
      logUpdates = [...logUpdates, formatAgendaLogEntry(agenda, regressionMessage, quip)];
    }

    if (stageChanged && shouldLogProgress && typeof window !== 'undefined' && stageDefinition) {
      const timestamp = Date.now();
      const stageLabel = stageDefinition.label ?? computedStageId;
      const detail = {
        id: `${agenda.id}:${timestamp}:${computedStageId || 'stage'}`,
        agendaId: agenda.id,
        agendaTitle: agenda.title,
        stageId: computedStageId,
        stageLabel,
        stageDescription: stageDefinition.description,
        previousStageId,
        previousStageLabel: previousStageDefinition?.label,
        faction,
        actor,
        status: stageStatus,
        progress: computedProgress,
        target,
        recordedAt: timestamp,
      };

      window.dispatchEvent(new CustomEvent('agendaStageShift', { detail }));
      window.dispatchEvent(new CustomEvent('agendaMoment', { detail }));
    }

    return {
      ...agenda,
      progress: computedProgress,
      completed: isCompleted,
      stageId: computedStageId || previousStageId,
    };
  };

  if (updatedSecretAgenda) {
    updatedSecretAgenda = processAgenda(updatedSecretAgenda, 'player', playerFaction, 'player');
  }

  if (updatedAiSecretAgenda) {
    updatedAiSecretAgenda = processAgenda(updatedAiSecretAgenda, 'ai', aiFaction, 'opposition', {
      requireRevealForProgress: true,
    });
  }

  if (
    updatedSecretAgenda !== state.secretAgenda ||
    updatedAiSecretAgenda !== state.aiSecretAgenda ||
    logUpdates.length > 0
  ) {
    return {
      ...state,
      secretAgenda: updatedSecretAgenda,
      aiSecretAgenda: updatedAiSecretAgenda,
      log: logUpdates.length > 0 ? [...state.log, ...logUpdates] : state.log,
    };
  }

  return state;
};

export const useGameState = (aiDifficultyOverride?: AIDifficulty) => {
  const aiDifficulty = resolveAiDifficulty(aiDifficultyOverride);
  const [eventManager] = useState(() => new EventManager());
  const achievements = useAchievements();
  const { triggerStateEvent } = useStateEvents();

  const triggerCapturedStateEvents = useCallback(
    (resolution: CardPlayResolution | undefined, nextState: GameState): GameEvent[] => {
      const capturedIds = resolution?.capturedStateIds ?? [];
      if (!capturedIds.length) {
        return [];
      }

      let workingStates: GameState['states'] | null = null;
      let normalizedStateLookup: { idLower: string; abbreviationLower: string | null }[] | null = null;

      const buildLookupEntry = (state: GameState['states'][number]) => ({
        idLower: typeof state.id === 'string' ? state.id.trim().toLowerCase() : '',
        abbreviationLower: typeof state.abbreviation === 'string'
          ? state.abbreviation.trim().toLowerCase()
          : null,
      });

      const ensureStateLookup = (states: GameState['states']) => {
        if (!normalizedStateLookup || normalizedStateLookup.length !== states.length) {
          normalizedStateLookup = states.map(buildLookupEntry);
        }
        return normalizedStateLookup!;
      };

      const updateStateLookupEntry = (index: number, state: GameState['states'][number]) => {
        if (!normalizedStateLookup) {
          return;
        }
        normalizedStateLookup[index] = buildLookupEntry(state);
      };

      const ensureWorkingStates = () => {
        if (!workingStates) {
          workingStates = nextState.states.map(state => ({ ...state }));
          normalizedStateLookup = workingStates.map(buildLookupEntry);
        } else if (!normalizedStateLookup || normalizedStateLookup.length !== workingStates.length) {
          normalizedStateLookup = workingStates.map(buildLookupEntry);
        }
        return workingStates;
      };

      const findStateIndex = (states: GameState['states'], identifier: string | null | undefined) => {
        if (typeof identifier !== 'string') {
          return -1;
        }
        const normalizedIdentifier = identifier.trim().toLowerCase();
        if (!normalizedIdentifier) {
          return -1;
        }
        const lookup = ensureStateLookup(states);
        for (let index = 0; index < lookup.length; index += 1) {
          const entry = lookup[index];
          if (entry.idLower === normalizedIdentifier) {
            return index;
          }
          if (entry.abbreviationLower && entry.abbreviationLower === normalizedIdentifier) {
            return index;
          }
        }
        return -1;
      };

      let truth = nextState.truth;
      let ip = nextState.ip;
      let aiIp = nextState.aiIP;
      let pendingCardDraw = nextState.pendingCardDraw ?? 0;
      let truthChanged = false;
      let ipChanged = false;
      let aiIpChanged = false;
      let pendingCardDrawChanged = false;
      const eventLogs: string[] = [];
      const triggeredEvents: GameEvent[] = [];

      for (const stateId of capturedIds) {
        const resolvedState = resolution?.states.find(state => state.id === stateId);
        if (!resolvedState) {
          continue;
        }

        const capturingFaction = resolvedState.owner === 'player'
          ? nextState.faction
          : resolvedState.owner === 'ai'
            ? (nextState.faction === 'truth' ? 'government' : 'truth')
            : null;

        if (!capturingFaction) {
          continue;
        }

        const eventStateKey = resolvedState.abbreviation ?? stateId;
        const trigger = triggerStateEvent(eventStateKey, capturingFaction, nextState);
        if (!trigger) {
          continue;
        }

        triggeredEvents.push(trigger.event);

        const statesArray = ensureWorkingStates();
        const indexCandidates = [resolvedState.id, resolvedState.abbreviation];
        if (!indexCandidates.includes(eventStateKey)) {
          indexCandidates.push(eventStateKey);
        }
        indexCandidates.push(trigger.stateId);
        let stateIndex = -1;
        for (const candidate of indexCandidates) {
          stateIndex = findStateIndex(statesArray, candidate);
          if (stateIndex !== -1) {
            break;
          }
        }

        if (stateIndex === -1) {
          continue;
        }

        const baseTargetState = statesArray[stateIndex];
        const targetState = {
          ...baseTargetState,
          stateEventHistory: Array.isArray(baseTargetState.stateEventHistory)
            ? [...baseTargetState.stateEventHistory]
            : baseTargetState.stateEventBonus
              ? [baseTargetState.stateEventBonus]
              : [],
        };
        const eventEffects = trigger.event.effects;

        let immediateDrawNote: string | null = null;

        if (eventEffects && typeof eventEffects === 'object') {
          const truthDelta = (eventEffects.truth ?? 0) + (eventEffects.truthChange ?? 0);
          if (truthDelta) {
            const truthMutation = { truth, log: [] as string[] };
            const truthActor = capturingFaction === nextState.faction ? 'human' : 'ai';
            applyTruthDelta(truthMutation, truthDelta, truthActor);
            if (truthMutation.log.length > 0) {
              eventLogs.push(...truthMutation.log);
            }
            truth = truthMutation.truth;
            truthChanged = true;
          }

          const ipDelta = (eventEffects.ip ?? 0) + (eventEffects.ipChange ?? 0);
          if (ipDelta) {
            if (resolvedState.owner === 'player') {
              ip = Math.max(0, ip + ipDelta);
              ipChanged = true;
            } else if (resolvedState.owner === 'ai') {
              aiIp = Math.max(0, aiIp + ipDelta);
              aiIpChanged = true;
            } else {
              ip = Math.max(0, ip + ipDelta);
              aiIp = Math.max(0, aiIp + ipDelta);
              ipChanged = true;
              aiIpChanged = true;
            }
          }

          if (typeof eventEffects.cardDraw === 'number' && Number.isFinite(eventEffects.cardDraw) && eventEffects.cardDraw > 0) {
            if (resolvedState.owner === 'player') {
              const drawAmount = Math.max(0, Math.floor(eventEffects.cardDraw));
              if (drawAmount > 0) {
                const { drawn, deck: updatedDeck } = drawCardsFromDeck(
                  nextState.deck,
                  drawAmount,
                  nextState.faction,
                );

                nextState.deck = updatedDeck;

                if (drawn.length > 0) {
                  nextState.hand = [...nextState.hand, ...drawn];
                  const immediateMessage = `drew ${drawn.length} card${drawn.length === 1 ? '' : 's'} immediately (hand ${nextState.hand.length})`;
                  immediateDrawNote = immediateDrawNote
                    ? `${immediateDrawNote}; ${immediateMessage}`
                    : immediateMessage;
                }

                const remainingDraw = drawAmount - drawn.length;
                if (remainingDraw > 0) {
                  pendingCardDraw += remainingDraw;
                  pendingCardDrawChanged = true;
                  const pendingMessage = `${remainingDraw} card${remainingDraw === 1 ? '' : 's'} queued for next turn`;
                  immediateDrawNote = immediateDrawNote
                    ? `${immediateDrawNote}; ${pendingMessage}`
                    : pendingMessage;
                }
              }
            }
          }

          if (typeof eventEffects.defenseChange === 'number' && Number.isFinite(eventEffects.defenseChange) && eventEffects.defenseChange !== 0) {
            targetState.defense = Math.max(1, targetState.defense + eventEffects.defenseChange);
          }

          if (eventEffects.stateEffects && typeof eventEffects.stateEffects === 'object') {
            const { stateEffects } = eventEffects;
            const targetIndexes: number[] = [];

            if (typeof stateEffects.stateId === 'string' && stateEffects.stateId.trim().length > 0) {
              const explicitIndex = findStateIndex(statesArray, stateEffects.stateId.trim());
              if (explicitIndex !== -1) {
                targetIndexes.push(explicitIndex);
              }
            } else {
              targetIndexes.push(stateIndex);
            }

            for (const index of targetIndexes) {
              const candidateState = index === stateIndex ? targetState : { ...statesArray[index] };

              if (typeof stateEffects.defense === 'number' && Number.isFinite(stateEffects.defense) && stateEffects.defense !== 0) {
                candidateState.defense = Math.max(1, candidateState.defense + stateEffects.defense);
              }

              if (typeof stateEffects.pressure === 'number' && Number.isFinite(stateEffects.pressure) && stateEffects.pressure !== 0) {
                const delta = stateEffects.pressure;
                candidateState.pressure = Math.max(0, candidateState.pressure + delta);

                if (candidateState.owner === 'player') {
                  candidateState.pressurePlayer = Math.max(0, candidateState.pressurePlayer + delta);
                } else if (candidateState.owner === 'ai') {
                  candidateState.pressureAi = Math.max(0, candidateState.pressureAi + delta);
                } else {
                  candidateState.pressurePlayer = Math.max(0, candidateState.pressurePlayer + delta);
                  candidateState.pressureAi = Math.max(0, candidateState.pressureAi + delta);
                }
              }

              if (index !== stateIndex) {
                statesArray[index] = candidateState;
                updateStateLookupEntry(index, candidateState);
              }
            }
          }
        }

        const summary = createStateEventBonusSummary({
          event: trigger.event,
          faction: trigger.capturingFaction,
          turn: trigger.triggeredOnTurn,
        });
        const updatedHistory = trimStateEventHistory([...targetState.stateEventHistory, summary]);
        targetState.stateEventHistory = updatedHistory;
        targetState.stateEventBonus = updatedHistory[updatedHistory.length - 1];
        statesArray[stateIndex] = targetState;
        updateStateLookupEntry(stateIndex, targetState);

        const stateName = targetState.name ?? resolvedState.name ?? trigger.stateId;
        const label = trigger.event.title ?? trigger.event.headline ?? trigger.event.id;
        const eventLogDetail = immediateDrawNote ? ` (${immediateDrawNote})` : '';
        eventLogs.push(`State event triggered in ${stateName}: ${label}${eventLogDetail}`);
      }

      if (workingStates) {
        nextState.states = workingStates;
      }
      if (truthChanged) {
        nextState.truth = truth;
      }
      if (ipChanged) {
        nextState.ip = ip;
      }
      if (aiIpChanged) {
        nextState.aiIP = aiIp;
      }
      if (pendingCardDrawChanged) {
        nextState.pendingCardDraw = pendingCardDraw;
      }
      if (eventLogs.length > 0) {
        nextState.log = [...nextState.log, ...eventLogs];
      }

      if (triggeredEvents.length > 0) {
        const existing = Array.isArray(nextState.pendingEditionEvents)
          ? [...nextState.pendingEditionEvents]
          : [];

        for (const event of triggeredEvents) {
          const existingIndex = existing.findIndex(candidate => candidate.id === event.id);
          if (existingIndex === -1) {
            existing.push(event);
          } else {
            existing[existingIndex] = event;
          }
        }

        nextState.pendingEditionEvents = existing;
      }

      return triggeredEvents;
    },
    [triggerStateEvent],
  );
  
  const availableCards = [...CARD_DATABASE];
  console.log(`📊 Card Database Stats:\n  - Total available: ${availableCards.length}`);
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialIssueDefinition = peekActiveAgendaIssue();
    const initialIssue = agendaIssueToState(initialIssueDefinition);
    const initialPlayerAgenda = getRandomAgenda('truth', { issueId: initialIssue.id });
    const initialAiAgenda = getRandomAgenda('government', { issueId: initialIssue.id });

    return {
      faction: 'truth',
      phase: 'action',
      turn: 1,
      round: 1,
      currentPlayer: 'human',
      aiDifficulty,
      truth: 50,
      ip: 5,
      aiIP: 5,
      // Use all available cards to ensure proper deck building
      hand: getRandomCards(5, { faction: 'truth' }),
      aiHand: getRandomCards(5, { faction: 'government' }),
      isGameOver: false,
      deck: generateWeightedDeck(40, 'truth'),
      aiDeck: generateWeightedDeck(40, 'government'),
      cardsPlayedThisTurn: 0,
      cardsPlayedThisRound: [],
      comboTruthDeltaThisRound: 0,
      stateCombinationBonusIP: 0,
      activeStateCombinationIds: [],
      stateCombinationEffects: createDefaultCombinationEffects(),
      truthAbove80Streak: 0,
      truthBelow20Streak: 0,
      timeBasedGoalCounters: {
        truthAbove80Streak: 0,
        truthBelow20Streak: 0,
      },
      paranormalHotspots: {},
      playHistory: [],
      turnPlays: [],
      controlledStates: [],
      aiControlledStates: [],
      states: USA_STATES.map(state => {
        return {
          id: state.id,
          name: state.name,
          abbreviation: state.abbreviation,
          baseIP: state.baseIP,
          baseDefense: state.defense,
          defense: state.defense,
          comboDefenseBonus: 0,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner: 'neutral' as const,
          paranormalHotspot: undefined,
          stateEventBonus: undefined,
          stateEventHistory: [],
          activeStateBonus: null,
          roundEvents: [],
        };
      }),
      currentEvents: [],
      pendingEditionEvents: [],
      activeCampaignArcs: [],
      pendingArcEvents: [],
      eventManager,
      showNewspaper: false,
      agendaIssue: initialIssue,
      agendaIssueCounters: {},
      agendaRoundCounters: {},
      log: [
        'Game started - Truth Seekers faction selected',
        'Starting Truth: 50%',
        'Cards drawn: 5',
        `AI Difficulty: ${aiDifficulty}`,
        `Weekly Issue: ${initialIssue.label}`,
      ],
      secretAgenda: {
        ...initialPlayerAgenda,
        progress: 0,
        completed: false,
        revealed: false,
        stageId: resolveAgendaStageByProgress(initialPlayerAgenda.stages, 0)?.id ?? '',
      },
      aiSecretAgenda: {
        ...initialAiAgenda,
        progress: 0,
        completed: false,
        revealed: false,
        stageId: resolveAgendaStageByProgress(initialAiAgenda.stages, 0)?.id ?? '',
      },
      animating: false,
      aiTurnInProgress: false,
      selectedCard: null,
      targetState: null,
      aiStrategist: AIFactory.createStrategist(aiDifficulty),
      drawMode: 'standard',
      cardDrawState: {
        cardsPlayedLastTurn: 0,
        lastTurnWithoutPlay: false,
      },
    };
  });

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const pendingAiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameSessionRef = useRef(0);

  useEffect(
    () => () => {
      if (pendingAiTimeoutRef.current) {
        clearTimeout(pendingAiTimeoutRef.current);
        pendingAiTimeoutRef.current = null;
      }
    },
    [],
  );

  const resolveCardEffects = useCallback(
    (
      prev: GameState,
      card: GameCard,
      targetState: string | null,
    ): CardPlayResolution => {
      return resolveCardMVP(prev, card, targetState, 'human', achievements);
    },
    [achievements],
  );

  const initGame = useCallback((faction: 'government' | 'truth') => {
    const startingTruth = 50;
    const startingIP = 5;
    const aiStartingIP = 5;
    
    // Get draw mode from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    const drawMode: DrawMode = savedSettings ? 
      (JSON.parse(savedSettings).drawMode || 'standard') : 'standard';
    
    const handSize = Math.max(5, getStartingHandSize(drawMode, faction));
    const aiFaction = faction === 'government' ? 'truth' : 'government';
    // CRITICAL: Pass faction to deck generation
    const newDeck = generateWeightedDeck(40, faction);
    const startingHand = newDeck.slice(0, handSize);
    const remainingDeck = newDeck.slice(handSize);
    const aiDeckSource = generateWeightedDeck(40, aiFaction);
    const aiStartingHand = aiDeckSource.slice(0, handSize);
    const aiRemainingDeck = aiDeckSource.slice(handSize);
    const initialControl = getInitialStateControl(faction);
    const issueDefinition = advanceAgendaIssue();
    const issueState = agendaIssueToState(issueDefinition);
    const playerAgendaTemplate = getRandomAgenda(faction, { issueId: issueState.id });
    const aiAgendaTemplate = getRandomAgenda(aiFaction, { issueId: issueState.id });

    // Track game start in achievements
    achievements.onGameStart(faction, aiDifficulty);
    achievements.manager.onNewGameStart();

    gameSessionRef.current += 1;
    if (pendingAiTimeoutRef.current) {
      clearTimeout(pendingAiTimeoutRef.current);
    }
    pendingAiTimeoutRef.current = null;

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
      aiIP: aiStartingIP,
      hand: startingHand,
      deck: remainingDeck,
      aiHand: aiStartingHand,
      aiDeck: aiRemainingDeck,
      controlledStates: initialControl.player,
      aiControlledStates: initialControl.ai,
      isGameOver: false,
      phase: 'action',
      turn: 1,
      round: 1,
      currentPlayer: 'human',
      cardsPlayedThisTurn: 0,
      cardsPlayedThisRound: [],
      comboTruthDeltaThisRound: 0,
      playHistory: [],
      turnPlays: [],
      stateCombinationBonusIP: 0,
      activeStateCombinationIds: [],
      stateCombinationEffects: createDefaultCombinationEffects(),
      truthAbove80Streak: 0,
      truthBelow20Streak: 0,
      timeBasedGoalCounters: {
        truthAbove80Streak: 0,
        truthBelow20Streak: 0,
      },
      paranormalHotspots: {},
      stateRoundSeed: Math.floor(Math.random() * 0xffffffff),
      lastStateBonusRound: 0,
      stateRoundEvents: {},
      currentEvents: [],
      pendingEditionEvents: [],
      activeCampaignArcs: [],
      pendingArcEvents: [],
      showNewspaper: false,
      aiStrategist: AIFactory.createStrategist(aiDifficulty),
      agendaIssue: issueState,
      agendaIssueCounters: {},
      agendaRoundCounters: {},
      animating: false,
      aiTurnInProgress: false,
      selectedCard: null,
      targetState: null,
      states: USA_STATES.map(state => {
        let owner: 'player' | 'ai' | 'neutral' = 'neutral';

        if (initialControl.player.includes(state.abbreviation)) owner = 'player';
        else if (initialControl.ai.includes(state.abbreviation)) owner = 'ai';

        return {
          id: state.id,
          name: state.name,
          abbreviation: state.abbreviation,
          baseIP: state.baseIP,
          baseDefense: state.defense,
          defense: state.defense,
          comboDefenseBonus: 0,
          pressure: 0,
          pressurePlayer: 0,
          pressureAi: 0,
          contested: false,
          owner,
          paranormalHotspot: undefined,
          stateEventBonus: undefined,
          stateEventHistory: [],
          activeStateBonus: null,
          roundEvents: [],
        };
      }),
      log: [
        `Game started - ${faction} faction selected`,
        `Starting Truth: ${startingTruth}%`,
        `Starting IP: ${startingIP}`,
        `Cards drawn: ${handSize} (${drawMode} mode)`,
        `Controlled states: ${initialControl.player.join(', ')}`,
        `Weekly Issue: ${issueState.label}`,
        `Issue Spotlight: ${issueState.description}`,
      ],
      drawMode,
      cardDrawState: {
        cardsPlayedLastTurn: 0,
        lastTurnWithoutPlay: false,
      },
      secretAgenda: {
        ...playerAgendaTemplate,
        progress: 0,
        completed: false,
        revealed: false,
        stageId: resolveAgendaStageByProgress(playerAgendaTemplate.stages, 0)?.id ?? '',
      },
      aiSecretAgenda: {
        ...aiAgendaTemplate,
        progress: 0,
        completed: false,
        revealed: false,
        stageId: resolveAgendaStageByProgress(aiAgendaTemplate.stages, 0)?.id ?? '',
      },
    }));
  }, [achievements, aiDifficulty]);

  const playCard = useCallback((cardId: string, targetOverride?: string | null) => {
    setGameState(prev => {
      const card = prev.hand.find(c => c.id === cardId);
      if (!card || prev.cardsPlayedThisTurn >= 3 || prev.animating) {
        return prev;
      }

      const effectiveCost = applyStateCombinationCostModifiers(
        card.cost,
        card.type,
        'human',
        prev.stateCombinationEffects,
      );

      if (prev.ip < effectiveCost) {
        return prev;
      }

      const resolvedCard = effectiveCost === card.cost ? card : { ...card, cost: effectiveCost };

      achievements.onCardPlayed(cardId, card.type, card.rarity);

      const targetState = targetOverride ?? prev.targetState ?? null;
      const resolution = resolveCardEffects(prev, resolvedCard, targetState);
      const updatedHotspots = { ...prev.paranormalHotspots };
      if (resolution.resolvedHotspots) {
        for (const abbr of resolution.resolvedHotspots) {
          delete updatedHotspots[abbr];
        }
      }
      const counterSnapshot = applyAgendaCardCounters(prev, 'human', resolvedCard);
      const playedCardRecord = createPlayedCardRecord({
        card: resolvedCard,
        player: 'human',
        faction: prev.faction,
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
        owner: 'human',
        targetState,
        resolution,
      });

      const mergedStates = mergeStateEventHistories(prev.states, resolution.states);

      const nextState: GameState = {
        ...prev,
        hand: prev.hand.filter(c => c.id !== cardId),
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: mergedStates,
        controlledStates: resolution.controlledStates,
        aiControlledStates: resolution.aiControlledStates,
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, playedCardRecord],
        playHistory: [...prev.playHistory, playedCardRecord],
        turnPlays: [...prev.turnPlays, ...turnPlayEntries],
        targetState: resolution.targetState,
        selectedCard: resolution.selectedCard,
        log: [...prev.log, ...resolution.logEntries],
        agendaIssueCounters: counterSnapshot.issueCounters,
        agendaRoundCounters: counterSnapshot.roundCounters,
        paranormalHotspots: updatedHotspots,
      };

      const stateWithReveal = resolution.aiSecretAgendaRevealed
        ? revealAiSecretAgenda(nextState, { type: 'card', name: resolvedCard.name })
        : nextState;

      const resultState = updateSecretAgendaProgress(stateWithReveal);
      triggerCapturedStateEvents(resolution, resultState);
      return resultState;
    });
  }, [achievements, resolveCardEffects, triggerCapturedStateEvents]);

  const playCardAnimated = useCallback(async (
    cardId: string,
    animateCard: (cardId: string, card: any, options?: any) => Promise<any>,
    explicitTargetState?: string
  ) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || gameState.cardsPlayedThisTurn >= 3 || gameState.animating) {
      return;
    }

    const initialCost = applyStateCombinationCostModifiers(
      card.cost,
      card.type,
      'human',
      gameState.stateCombinationEffects,
    );

    if (gameState.ip < initialCost) {
      return;
    }

    achievements.onCardPlayed(cardId, card.type, card.rarity);

    const targetState = explicitTargetState ?? gameState.targetState ?? null;
    let pendingRecord: ReturnType<typeof createPlayedCardRecord> | null = null;
    let pendingTurnPlays: ReturnType<typeof createTurnPlayEntries> | null = null;
    let pendingResolvedCard: GameCard | null = null;

    setGameState(prev => {
      if (prev.animating) {
        return prev;
      }

      const effectiveCost = applyStateCombinationCostModifiers(
        card.cost,
        card.type,
        'human',
        prev.stateCombinationEffects,
      );

      if (prev.ip < effectiveCost) {
        return prev;
      }

      const resolvedCard = effectiveCost === card.cost ? card : { ...card, cost: effectiveCost };
      pendingResolvedCard = resolvedCard;

      const resolution = resolveCardEffects(prev, resolvedCard, targetState);
      const updatedHotspots = { ...prev.paranormalHotspots };
      if (resolution.resolvedHotspots) {
        for (const abbr of resolution.resolvedHotspots) {
          delete updatedHotspots[abbr];
        }
      }
      const counterSnapshot = applyAgendaCardCounters(prev, 'human', resolvedCard);
      pendingRecord = createPlayedCardRecord({
        card: resolvedCard,
        player: 'human',
        faction: prev.faction,
        targetState,
        resolution,
        previousTruth: prev.truth,
        previousIp: prev.ip,
        previousAiIP: prev.aiIP,
        round: prev.round,
        turn: prev.turn,
      });

      pendingTurnPlays = createTurnPlayEntries({
        state: prev,
        card: resolvedCard,
        owner: 'human',
        targetState,
        resolution,
      });

      const mergedStates = mergeStateEventHistories(prev.states, resolution.states);

      const nextState: GameState = {
        ...prev,
        animating: true,
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: mergedStates,
        controlledStates: resolution.controlledStates,
        aiControlledStates: resolution.aiControlledStates,
        targetState: resolution.targetState,
        selectedCard: resolution.selectedCard,
        log: [...prev.log, ...resolution.logEntries],
        agendaIssueCounters: counterSnapshot.issueCounters,
        agendaRoundCounters: counterSnapshot.roundCounters,
        paranormalHotspots: updatedHotspots,
      };

      const stateWithReveal = resolution.aiSecretAgendaRevealed
        ? revealAiSecretAgenda(nextState, { type: 'card', name: resolvedCard.name })
        : nextState;

      const resultState = updateSecretAgendaProgress(stateWithReveal);
      triggerCapturedStateEvents(resolution, resultState);
      return resultState;
    });

    try {
      await animateCard(cardId, card, {
        targetState,
        onResolve: async () => Promise.resolve()
      });

      setGameState(prev => {
        const record = pendingRecord ?? {
          card: pendingResolvedCard ?? card,
          player: 'human' as const,
          faction: prev.faction,
          targetState: targetState ?? null,
          truthDelta: 0,
          ipDelta: 0,
          aiIpDelta: 0,
          capturedStates: [],
          capturedStateIds: [],
          damageDealt: 0,
          round: prev.round,
          turn: prev.turn,
          timestamp: Date.now(),
          logEntries: [],
        };
        const nextState: GameState = {
          ...prev,
          hand: prev.hand.filter(c => c.id !== cardId),
          cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
          cardsPlayedThisRound: [...prev.cardsPlayedThisRound, record],
          playHistory: [...prev.playHistory, record],
          turnPlays: [...prev.turnPlays, ...(pendingTurnPlays ?? [])],
          selectedCard: null,
          targetState: null,
          animating: false,
        };

        return updateSecretAgendaProgress(nextState);
      });
    } catch (error) {
      console.error('Card animation failed:', error);
      setGameState(prev => {
        const record = pendingRecord ?? {
          card: pendingResolvedCard ?? card,
          player: 'human' as const,
          faction: prev.faction,
          targetState: targetState ?? null,
          truthDelta: 0,
          ipDelta: 0,
          aiIpDelta: 0,
          capturedStates: [],
          capturedStateIds: [],
          damageDealt: 0,
          round: prev.round,
          turn: prev.turn,
          timestamp: Date.now(),
          logEntries: [],
        };
        const nextState: GameState = {
          ...prev,
          hand: prev.hand.filter(c => c.id !== cardId),
          cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
          cardsPlayedThisRound: [...prev.cardsPlayedThisRound, record],
          playHistory: [...prev.playHistory, record],
          turnPlays: [...prev.turnPlays, ...(pendingTurnPlays ?? [])],
          selectedCard: null,
          targetState: null,
          animating: false,
        };

        return updateSecretAgendaProgress(nextState);
      });
    }
  }, [gameState, achievements, resolveCardEffects, triggerCapturedStateEvents]);

  const selectCard = useCallback((cardId: string | null) => {
    setGameState(prev => ({ 
      ...prev, 
      selectedCard: prev.selectedCard === cardId ? null : cardId 
    }));
  }, []);

  const selectTargetState = useCallback((stateId: string | null) => {
    setGameState(prev => ({ ...prev, targetState: stateId }));
  }, []);

  const registerParanormalSighting = useCallback((source?: 'truth' | 'government' | 'neutral') => {
    setGameState(prev => {
      const factionSource = source ?? prev.faction;
      const owner: AgendaOwner = factionSource === prev.faction
        ? 'human'
        : factionSource === (prev.faction === 'truth' ? 'government' : 'truth')
          ? 'ai'
          : 'human';
      const counters = applyAgendaSightingCounters(prev, owner);
      return {
        ...prev,
        agendaIssueCounters: counters.issueCounters,
        agendaRoundCounters: counters.roundCounters,
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    let hotspotSourceToRegister: 'truth' | 'government' | 'neutral' | null = null;

    setGameState(prev => {
      if (prev.isGameOver) return prev;

      const isHumanTurn = prev.currentPlayer === 'human';
      const statesAfterHotspot = prev.states.map(state => ({ ...state }));
      let hotspotsAfterHotspot: Record<string, ActiveParanormalHotspot> = { ...prev.paranormalHotspots };
      const hotspotLogs: string[] = [];

      for (const [abbr, hotspot] of Object.entries(hotspotsAfterHotspot)) {
        const state = statesAfterHotspot.find(candidate => candidate.abbreviation === abbr);
        if (!state) {
          delete hotspotsAfterHotspot[abbr];
          continue;
        }

        if (prev.turn >= hotspot.expiresOnTurn) {
          const adjustedDefense = Math.max(1, state.defense - hotspot.defenseBoost);
          state.defense = Math.max(1, adjustedDefense);
          state.paranormalHotspot = undefined;
          delete hotspotsAfterHotspot[abbr];
          hotspotLogs.push(`🕯️ ${hotspot.label} in ${state.name} fizzles out. Defenses return to normal.`);
        } else {
          state.paranormalHotspot = toStateHotspot(hotspot, prev.turn);
        }
      }

      for (const state of statesAfterHotspot) {
        if (state.paranormalHotspot && !hotspotsAfterHotspot[state.abbreviation]) {
          state.paranormalHotspot = undefined;
        }
      }

      const comboResult = evaluateCombosForTurn(prev, isHumanTurn ? 'human' : 'ai');
      achievements.onCombosResolved(isHumanTurn ? 'human' : 'ai', comboResult.evaluation);
      const fxEnabled = getComboSettings().fxEnabled;

      if (
        fxEnabled &&
        comboResult.fxMessages.length > 0 &&
        typeof window !== 'undefined' &&
        typeof window.uiComboToast === 'function'
      ) {
        for (const message of comboResult.fxMessages) {
          window.uiComboToast(message);
        }
      }

      if (isHumanTurn) {
        const stateIncome = getTotalIPFromStates(prev.controlledStates);
        const baseIncome = 5;
        const synergyIncome = prev.stateCombinationBonusIP;
        const neutralStates = statesAfterHotspot.filter(state => state.owner === 'neutral').length;
        const comboEffectIncome = calculateDynamicIpBonus(
          prev.stateCombinationEffects,
          prev.controlledStates.length,
          neutralStates,
        );
        const totalIncome = baseIncome + stateIncome + synergyIncome + comboEffectIncome;

        prev.eventManager?.updateTurn(prev.turn);

        let eventEffectLog: string[] = [...hotspotLogs];
        let truthModifier = 0;
        let ipModifier = 0;
        let bonusCardDraw = 0;
        let triggeredEvent: GameEvent | null = null;
        let eventForEdition: GameEvent | null = null;
        let activeCampaignArcs = [...prev.activeCampaignArcs];
        let pendingArcEvents = [...prev.pendingArcEvents];

        if (prev.eventManager) {
          const pendingSelection = selectPendingArcEvent(pendingArcEvents, prev.eventManager, prev);
          if (pendingSelection) {
            triggeredEvent = pendingSelection.event;
            eventForEdition = pendingSelection.event;
            pendingArcEvents = pendingArcEvents.filter((_, index) => index !== pendingSelection.index);
            prev.eventManager.triggerEvent(pendingSelection.event.id);
          } else {
            const maybeEvent = prev.eventManager.maybeSelectRandomEvent(prev);
            if (maybeEvent) {
              triggeredEvent = maybeEvent;
              eventForEdition = maybeEvent;
            }
          }

          if (triggeredEvent) {
            const activeEvent = triggeredEvent;

            if (activeEvent.effects) {
              const effects = activeEvent.effects;
              const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);
              const truthDeltaFromEffects = (effects.truth ?? 0) + (effects.truthChange ?? 0);
              const ipDeltaFromEffects = (effects.ip ?? 0) + (effects.ipChange ?? 0);

              const collectStateIdentifiers = (...identifiers: Array<string | undefined | null>) => {
                const set = new Set<string>();
                for (const identifier of identifiers) {
                  if (typeof identifier === 'string' && identifier.trim().length > 0) {
                    set.add(identifier.trim());
                  }
                }
                return set;
              };

              const findStatesByIdentifiers = (identifiers: Set<string>) => {
                if (identifiers.size === 0) {
                  return [] as GameState['states'];
                }

                const identifierList = Array.from(identifiers);
                return statesAfterHotspot.filter(candidate =>
                  identifierList.some(identifier => {
                    const normalized = identifier.toUpperCase();
                    return (
                      candidate.id === identifier ||
                      candidate.abbreviation === identifier ||
                      candidate.abbreviation === normalized ||
                      candidate.name.toUpperCase() === normalized
                    );
                  }),
                );
              };

              const defenseLogMap = new Map<string, { name: string; delta: number }>();
              const pressureLogMap = new Map<string, { name: string; delta: number }>();
              const globalStateEffectLogs: string[] = [];

              const recordDefenseDelta = (state: GameState['states'][number], delta: number) => {
                if (delta === 0) return;
                const existing = defenseLogMap.get(state.id) ?? { name: state.name, delta: 0 };
                existing.delta += delta;
                defenseLogMap.set(state.id, existing);
              };

              const recordPressureDelta = (state: GameState['states'][number], delta: number) => {
                if (delta === 0) return;
                const existing = pressureLogMap.get(state.id) ?? { name: state.name, delta: 0 };
                existing.delta += delta;
                pressureLogMap.set(state.id, existing);
              };

              const eventStateContext = activeEvent as GameEvent & {
                stateId?: string;
                state?: string;
                stateAbbreviation?: string;
              };

              const stateIdentifiers = collectStateIdentifiers(
                effects.stateEffects?.stateId,
                eventStateContext.stateId,
                eventStateContext.state,
                eventStateContext.stateAbbreviation,
                maybeEvent.conditions?.requiresState,
              );

              if (truthDeltaFromEffects !== 0) {
                truthModifier = truthDeltaFromEffects;
              }

              if (ipDeltaFromEffects !== 0) {
                ipModifier = ipDeltaFromEffects;
              }

              if (effects.cardDraw) {
                bonusCardDraw = effects.cardDraw;
              }

              if (typeof effects.defenseChange === 'number') {
                const defenseTargets = findStatesByIdentifiers(stateIdentifiers);
                for (const state of defenseTargets) {
                  const updatedDefense = Math.max(1, state.defense + effects.defenseChange);
                  state.defense = updatedDefense;
                  recordDefenseDelta(state, effects.defenseChange);
                }
              }

              if (effects.stateEffects) {
                const { stateEffects } = effects;
                const hasSpecificState = typeof stateEffects.stateId === 'string' && stateEffects.stateId.length > 0;
                const stateEffectTargets = hasSpecificState
                  ? findStatesByIdentifiers(new Set([stateEffects.stateId!]))
                  : statesAfterHotspot;

                if (typeof stateEffects.defense === 'number') {
                  if (hasSpecificState) {
                    for (const state of stateEffectTargets) {
                      const updatedDefense = Math.max(1, state.defense + stateEffects.defense);
                      state.defense = updatedDefense;
                      recordDefenseDelta(state, stateEffects.defense);
                    }
                  } else {
                    for (const state of stateEffectTargets) {
                      const updatedDefense = Math.max(1, state.defense + stateEffects.defense);
                      state.defense = updatedDefense;
                    }
                    if (stateEffectTargets.length > 0 && stateEffects.defense !== 0) {
                      globalStateEffectLogs.push(`All states defense ${formatSigned(stateEffects.defense)}`);
                    }
                  }
                }

                if (typeof stateEffects.pressure === 'number') {
                  if (hasSpecificState) {
                    for (const state of stateEffectTargets) {
                      const nextPressure = Math.max(0, (state.pressure ?? 0) + stateEffects.pressure);
                      state.pressure = nextPressure;
                      recordPressureDelta(state, stateEffects.pressure);
                    }
                  } else {
                    for (const state of stateEffectTargets) {
                      const nextPressure = Math.max(0, (state.pressure ?? 0) + stateEffects.pressure);
                      state.pressure = nextPressure;
                    }
                    if (stateEffectTargets.length > 0 && stateEffects.pressure !== 0) {
                      globalStateEffectLogs.push(`All states pressure ${formatSigned(stateEffects.pressure)}`);
                    }
                  }
                }
              }

              eventEffectLog.push(`EVENT: ${activeEvent.title} triggered!`);
              if (truthDeltaFromEffects !== 0) {
                eventEffectLog.push(`Truth ${formatSigned(truthDeltaFromEffects)}%`);
              }
              if (ipDeltaFromEffects !== 0) {
                eventEffectLog.push(`IP ${formatSigned(ipDeltaFromEffects)}`);
              }
              if (effects.cardDraw) {
                eventEffectLog.push(`Draw ${effects.cardDraw} extra cards`);
              }
              for (const message of globalStateEffectLogs) {
                eventEffectLog.push(message);
              }
              for (const { name, delta } of defenseLogMap.values()) {
                if (delta !== 0) {
                  eventEffectLog.push(`${name} defense ${formatSigned(delta)}`);
                }
              }
              for (const { name, delta } of pressureLogMap.values()) {
                if (delta !== 0) {
                  eventEffectLog.push(`${name} pressure ${formatSigned(delta)}`);
                }
              }
              if (effects.revealSecretAgenda) {
                eventEffectLog.push('Enemy secret agenda exposed!');
              }
            }

            if (activeEvent.paranormalHotspot) {
              const target = selectHotspotTargetState({
                states: statesAfterHotspot,
                activeHotspots: hotspotsAfterHotspot,
                payload: activeEvent.paranormalHotspot,
                playerFaction: prev.faction,
              });

              if (target) {
                const { active, stateHotspot } = createHotspotEntries({
                  event: activeEvent,
                  payload: activeEvent.paranormalHotspot,
                  state: target,
                  currentTurn: prev.turn,
                });

                target.defense = target.defense + activeEvent.paranormalHotspot.defenseBoost;
                target.paranormalHotspot = stateHotspot;
                hotspotsAfterHotspot = {
                  ...hotspotsAfterHotspot,
                  [target.abbreviation]: active,
                };

                eventEffectLog.push(
                  `👻 ${stateHotspot.label} erupts in ${target.name}! Defense +${stateHotspot.defenseBoost} for ${activeEvent.paranormalHotspot.duration} turn${activeEvent.paranormalHotspot.duration === 1 ? '' : 's'}. Capture swings truth by ±${stateHotspot.truthReward}%.`,
                );
                hotspotSourceToRegister = active.source;

                if (activeEvent.paranormalHotspot.headlineTemplate) {
                  const dynamicHeadline = activeEvent.paranormalHotspot.headlineTemplate.replace(
                    /\{\{STATE\}\}/g,
                    target.name.toUpperCase(),
                  );
                  eventForEdition = { ...activeEvent, headline: dynamicHeadline };
                }
              } else {
                eventEffectLog.push('👻 Paranormal surge failed to find a viable hotspot target.');
              }
            }

            if (activeEvent.campaign) {
              const arcUpdate = updateCampaignArcProgress({
                currentArcs: activeCampaignArcs,
                pendingEvents: pendingArcEvents,
                triggeredEvent: activeEvent,
              });
              activeCampaignArcs = arcUpdate.activeArcs;
              pendingArcEvents = arcUpdate.pendingEvents;
              if (arcUpdate.logEntry) {
                eventEffectLog.push(arcUpdate.logEntry);
              }
            }
          }
        }

        const stateEventsForEdition = prev.pendingEditionEvents?.slice() ?? [];
        const randomEventForEdition = eventForEdition ?? triggeredEvent;
        if (randomEventForEdition) {
          stateEventsForEdition.push(randomEventForEdition);
        }

        const newEvents = buildEditionEvents(prev, stateEventsForEdition);

        const comboDrawBonus = Math.max(0, prev.stateCombinationEffects.extraCardDraw);
        const pendingCardDraw = bonusCardDraw + comboDrawBonus;

        const comboLog =
          comboResult.logEntries.length > 0 ? [...prev.log, ...comboResult.logEntries] : [...prev.log];

        const humanIpAfterCombos = comboResult.updatedPlayerIp;
        const aiIpAfterCombos = comboResult.updatedOpponentIp;
        const truthAfterCombos = comboResult.updatedTruth;
        const comboTruthDelta = comboResult.truthDelta;

        const logEntries = [
          ...comboLog,
          `Turn ${prev.turn} ended`,
          `Base income: ${baseIncome} IP`,
          `State income: ${stateIncome} IP (${prev.controlledStates.length} states)`,
          ...(synergyIncome > 0 ? [`State synergy bonus: +${synergyIncome} IP`] : []),
          ...(comboEffectIncome > 0 ? [`Combo effects bonus: +${comboEffectIncome} IP`] : []),
          `Total income: ${totalIncome + ipModifier} IP`,
          ...eventEffectLog,
          ...(comboDrawBonus > 0
            ? [`Synergy draw bonus: +${comboDrawBonus} card${comboDrawBonus === 1 ? '' : 's'}`]
            : []),
        ];

        let nextState: GameState = {
          ...prev,
          turn: prev.turn + 1,
          phase: 'ai_turn',
          currentPlayer: 'ai',
          showNewspaper: false,
          cardsPlayedThisTurn: 0,
          truth: truthAfterCombos,
          ip: humanIpAfterCombos + totalIncome + ipModifier,
          aiIP: aiIpAfterCombos,
          pendingCardDraw,
          currentEvents: newEvents,
          pendingEditionEvents: [],
          comboTruthDeltaThisRound: prev.comboTruthDeltaThisRound + comboTruthDelta,
          cardDrawState: {
            cardsPlayedLastTurn: prev.cardsPlayedThisTurn,
            lastTurnWithoutPlay: prev.cardsPlayedThisTurn === 0,
          },
          log: logEntries,
          turnPlays: [],
          states: statesAfterHotspot,
          paranormalHotspots: hotspotsAfterHotspot,
          activeCampaignArcs,
          pendingArcEvents,
        };

        if ((eventForEdition ?? triggeredEvent)?.effects?.revealSecretAgenda) {
          nextState = revealAiSecretAgenda(nextState, {
            type: 'event',
            name: (eventForEdition ?? triggeredEvent)!.title,
          });
        }

        applyTruthDelta(nextState, truthModifier, 'human');
        const finalTruth = nextState.truth;
        const truthStreaks = computeTruthStreaks(prev, finalTruth);
        const previousCounters = prev.timeBasedGoalCounters ?? {};
        nextState = {
          ...nextState,
          truthAbove80Streak: truthStreaks.truthAbove80Streak,
          truthBelow20Streak: truthStreaks.truthBelow20Streak,
          timeBasedGoalCounters: {
            ...previousCounters,
            truthAbove80Streak: truthStreaks.truthAbove80Streak,
            truthBelow20Streak: truthStreaks.truthBelow20Streak,
          },
        };
        nextState.log.push(`AI ${prev.aiStrategist?.personality.name} is thinking...`);

        return updateSecretAgendaProgress(nextState);
      }

      const comboLog =
        comboResult.logEntries.length > 0
          ? [...prev.log, ...comboResult.logEntries, ...hotspotLogs]
          : [...prev.log, ...hotspotLogs];

      const clearedStates = statesAfterHotspot.map(state => ({
        ...state,
        activeStateBonus: null,
        roundEvents: [],
      }));

      const nextStateBase: GameState = {
        ...prev,
        round: prev.round + 1,
        phase: 'newspaper',
        currentPlayer: 'human',
        showNewspaper: true,
        truth: comboResult.updatedTruth,
        ip: comboResult.updatedOpponentIp,
        aiIP: comboResult.updatedPlayerIp,
        cardsPlayedThisTurn: 0,
        turnPlays: [],
        comboTruthDeltaThisRound: prev.comboTruthDeltaThisRound + comboResult.truthDelta,
        log: [...comboLog, 'AI turn completed'],
        states: clearedStates,
        paranormalHotspots: hotspotsAfterHotspot,
        stateRoundEvents: {},
      };

      const truthStreaks = computeTruthStreaks(prev, nextStateBase.truth);
      const previousCounters = prev.timeBasedGoalCounters ?? {};
      const timeBasedGoalCounters = {
        ...previousCounters,
        truthAbove80Streak: truthStreaks.truthAbove80Streak,
        truthBelow20Streak: truthStreaks.truthBelow20Streak,
      };

      return updateSecretAgendaProgress({
        ...nextStateBase,
        truthAbove80Streak: truthStreaks.truthAbove80Streak,
        truthBelow20Streak: truthStreaks.truthBelow20Streak,
        timeBasedGoalCounters,
      });
    });

    if (hotspotSourceToRegister) {
      registerParanormalSighting(hotspotSourceToRegister);
    }
  }, [achievements, registerParanormalSighting]);

  const endTurnRef = useRef(endTurn);
  useEffect(() => {
    endTurnRef.current = endTurn;
  }, [endTurn]);

  const playAICard = useCallback((params: AiCardPlayParams) => {
    const sessionGuard = gameSessionRef.current;
    return new Promise<GameState>(resolve => {
      setGameState(prev => {
        if (sessionGuard !== gameSessionRef.current) {
          resolve(prev);
          return prev;
        }

        if (prev.isGameOver) {
          resolve(prev);
          return prev;
        }

        const result = applyAiCardPlay(prev, params, achievements);
        let nextStateBase = result.nextState;
        if (result.card) {
          const counterSnapshot = applyAgendaCardCounters(prev, 'ai', result.card);
          nextStateBase = {
            ...nextStateBase,
            agendaIssueCounters: counterSnapshot.issueCounters,
            agendaRoundCounters: counterSnapshot.roundCounters,
          };
        }
        const nextStateAfterReveal =
          result.resolution?.aiSecretAgendaRevealed && result.card
            ? revealAiSecretAgenda(nextStateBase, { type: 'card', name: result.card.name })
            : nextStateBase;
        const nextStateWithAgendas = updateSecretAgendaProgress(nextStateAfterReveal);

        triggerCapturedStateEvents(result.resolution, nextStateWithAgendas);

        if (result.card && typeof window !== 'undefined' && window.uiShowOpponentCard) {
          window.uiShowOpponentCard(result.card);
        }

        if (result.card && result.resolution) {
          prev.aiStrategist?.recordAiPlayOutcome({
            card: result.card,
            targetState: params.targetState,
            resolution: result.resolution,
            previousState: prev,
          });
        }

        if (!result.failed && !featureFlags.aiVerboseStrategyLog && (params.reasoning || params.strategyDetails?.length)) {
          debugStrategyToConsole(params.reasoning, params.strategyDetails);
        }

        resolve(nextStateWithAgendas);
        return nextStateWithAgendas;
      });
    });
  }, [achievements, triggerCapturedStateEvents]);

  const playAICardRef = useRef(playAICard);
  useEffect(() => {
    playAICardRef.current = playAICard;
  }, [playAICard]);

  // AI Turn Management
  const executeAITurn = useCallback(async () => {
    const currentState = gameStateRef.current;
    const sessionGuard = gameSessionRef.current;
    if (
      !currentState?.aiStrategist ||
      currentState.currentPlayer !== 'ai' ||
      currentState.aiTurnInProgress ||
      currentState.isGameOver
    ) {
      return;
    }

    const readLatestState = () =>
      new Promise<GameState>(resolve => {
        setGameState(prev => {
          resolve(prev);
          return prev;
        });
      });

    if (sessionGuard !== gameSessionRef.current) {
      return;
    }

    setGameState(prev => {
      if (sessionGuard !== gameSessionRef.current) {
        return prev;
      }

      return prev.isGameOver ? prev : { ...prev, aiTurnInProgress: true };
    });

    await new Promise<GameState>(resolve => {
      setGameState(prev => {
        if (sessionGuard !== gameSessionRef.current) {
          resolve(prev);
          return prev;
        }

        if (prev.isGameOver) {
          resolve(prev);
          return prev;
        }

        const aiControlledStates = prev.states
          .filter(state => state.owner === 'ai')
          .map(state => state.abbreviation);

        const aiStateIncome = getTotalIPFromStates(aiControlledStates);
        const aiBaseIncome = 5;
        const aiTotalIncome = aiBaseIncome + aiStateIncome;

        const aiFaction = prev.faction === 'government' ? 'truth' : 'government';
        const aiCardsNeeded = Math.max(0, HAND_LIMIT - prev.aiHand.length);
        const { drawn: aiDrawnCards, deck: aiRemainingDeck } = drawCardsFromDeck(prev.aiDeck, aiCardsNeeded, aiFaction);
        const aiHandSizeAfterDraw = prev.aiHand.length + aiDrawnCards.length;

        const nextState: GameState = {
          ...prev,
          aiHand: [...prev.aiHand, ...aiDrawnCards],
          aiDeck: aiRemainingDeck,
          aiIP: prev.aiIP + aiTotalIncome,
          log: [
            ...prev.log,
            `AI Income: ${aiBaseIncome} base + ${aiStateIncome} from ${aiControlledStates.length} states = ${aiTotalIncome} IP`,
            `AI drew ${aiDrawnCards.length} card${aiDrawnCards.length === 1 ? '' : 's'} (hand ${aiHandSizeAfterDraw}/${HAND_LIMIT})`,
          ],
        };

        resolve(nextState);
        return nextState;
      });
    });

    if (sessionGuard !== gameSessionRef.current) {
      return;
    }

    const prePlanningState = await readLatestState();
    if (prePlanningState.isGameOver) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    if (sessionGuard !== gameSessionRef.current) {
      return;
    }

    const planningState = await readLatestState();

    if (sessionGuard !== gameSessionRef.current) {
      return;
    }

    if (!planningState.aiStrategist) {
      setGameState(prev => {
        if (sessionGuard !== gameSessionRef.current) {
          return prev;
        }

        return prev.isGameOver ? prev : { ...prev, aiTurnInProgress: false };
      });
      return;
    }

    if (planningState.isGameOver) {
      return;
    }

    const turnPlan = chooseTurnActions({
      strategist: planningState.aiStrategist,
      gameState: planningState as any,
      maxActions: 3,
      priorityThreshold: 0.3,
    });

    if (turnPlan.actions.length === 0 && turnPlan.sequenceDetails.length) {
      setGameState(prev => {
        if (sessionGuard !== gameSessionRef.current) {
          return prev;
        }

        return {
          ...prev,
          log: [...prev.log, ...buildStrategyLogEntries(undefined, turnPlan.sequenceDetails)],
        };
      });
    }

    const actionOutcome = await processAiActions({
      actions: turnPlan.actions,
      sequenceDetails: turnPlan.sequenceDetails,
      readLatestState,
      playCard: params => {
        const playCardFn = playAICardRef.current;
        return playCardFn ? playCardFn(params) : readLatestState();
      },
      waitBetweenActions: () => new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400)),
    });

    if (sessionGuard !== gameSessionRef.current) {
      return;
    }

    if (actionOutcome.gameOver) {
      return;
    }

    const latestState = await readLatestState();
    if (latestState.isGameOver) {
      return;
    }

    if (sessionGuard !== gameSessionRef.current) {
      return;
    }

    if (pendingAiTimeoutRef.current) {
      clearTimeout(pendingAiTimeoutRef.current);
    }

    const timeoutSessionGuard = gameSessionRef.current;
    pendingAiTimeoutRef.current = setTimeout(() => {
      if (timeoutSessionGuard !== gameSessionRef.current) {
        return;
      }

      pendingAiTimeoutRef.current = null;

      const stateSnapshot = gameStateRef.current;
      if (!stateSnapshot || stateSnapshot.isGameOver || stateSnapshot.currentPlayer !== 'ai') {
        setGameState(prev => {
          if (timeoutSessionGuard !== gameSessionRef.current) {
            return prev;
          }

          return prev.isGameOver ? prev : { ...prev, aiTurnInProgress: false };
        });
        return;
      }

      if (timeoutSessionGuard !== gameSessionRef.current) {
        return;
      }

      endTurnRef.current?.();
      setGameState(prev => {
        if (timeoutSessionGuard !== gameSessionRef.current) {
          return prev;
        }

        return prev.isGameOver ? prev : { ...prev, aiTurnInProgress: false };
      });
    }, 1000);
  }, []);

  const closeNewspaper = useCallback(() => {
    setGameState(prev => {
      const bonusCardDraw = Math.max(0, prev.pendingCardDraw ?? 0);
      const targetHandSize = HAND_LIMIT + bonusCardDraw;
      const cardsNeeded = Math.max(0, targetHandSize - prev.hand.length);
      const {
        drawn,
        deck: remainingDeck,
      } = drawCardsFromDeck(prev.deck, cardsNeeded, prev.faction);
      const newHand = cardsNeeded > 0 ? [...prev.hand, ...drawn] : [...prev.hand];
      const deckShortage = cardsNeeded > 0 && drawn.length < cardsNeeded;

      let drawLogEntry = '';
      if (drawn.length > 0) {
        const bonusNote = bonusCardDraw > 0 ? ` (+${bonusCardDraw} bonus)` : '';
        drawLogEntry = `Drew ${drawn.length} card${drawn.length === 1 ? '' : 's'}${bonusNote} to start turn (hand ${newHand.length})`;
      } else if (deckShortage) {
        drawLogEntry = 'Deck exhausted: unable to draw enough cards for new turn';
      } else {
        drawLogEntry = `Ready to act (hand ${newHand.length})`;
      }

      const baseLogs = [...prev.log, drawLogEntry];

      let nextState: GameState = {
        ...prev,
        hand: newHand,
        deck: remainingDeck,
        showNewspaper: false,
        cardsPlayedThisRound: [],
        comboTruthDeltaThisRound: 0,
        phase: 'action',
        currentPlayer: 'human',
        showNewCardsPresentation: false,
        newCards: [],
        pendingCardDraw: 0,
        cardsPlayedThisTurn: 0,
        animating: false,
        selectedCard: null,
        targetState: null,
        aiTurnInProgress: false,
        log: baseLogs,
        agendaRoundCounters: {},
      };

      if (nextState.lastStateBonusRound !== nextState.round) {
        const existingBonuses = nextState.states.reduce<Record<string, ActiveStateBonus | null | undefined>>(
          (acc, state) => {
            if (state.activeStateBonus) {
              acc[state.abbreviation] = state.activeStateBonus;
            }
            return acc;
          },
          {},
        );

        const assignment = assignStateBonuses({
          states: nextState.states.map(state => ({
            id: state.id,
            abbreviation: state.abbreviation,
            name: state.name,
            owner: state.owner === 'player' || state.owner === 'ai' ? state.owner : 'neutral',
          })),
          baseSeed: nextState.stateRoundSeed,
          round: nextState.round,
          playerFaction: nextState.faction,
          existingBonuses,
        });

        nextState = applyStateBonusAssignmentToState(nextState, assignment);

        if (typeof window !== 'undefined') {
          (window as any).__stateThemedDebug = {
            round: nextState.round,
            baseSeed: nextState.stateRoundSeed,
            ...assignment.debug,
          };
          (window as any).__dumpStateThemed = () =>
            JSON.stringify((window as any).__stateThemedDebug, null, 2);
        }
      }

      return updateSecretAgendaProgress(nextState);
    });
  }, []);

  const confirmNewCards = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'action',
      hand: [...prev.hand, ...(prev.newCards || [])],
      showNewCardsPresentation: false,
      newCards: [],
      log: [...prev.log, `Added ${prev.newCards?.length || 0} cards to hand`]
    }));
  }, []);



  const checkVictoryConditions = useCallback((state: GameState) => {
    // Check for victory conditions and update achievements
    let victoryType = '';
    let playerWon = false;

    // Truth-based victories
    if (state.truth >= 95 && state.faction === 'truth') {
      victoryType = 'truth_high';
      playerWon = true;
    } else if (state.truth <= 5 && state.faction === 'government') {
      victoryType = 'truth_low';
      playerWon = true;
    }
    // Territorial victory (10+ states)
    else if (state.controlledStates.length >= 10) {
      victoryType = 'territorial';
      playerWon = true;
    }
    // Economic victory (300+ IP)
    else if (state.ip >= 300) {
      victoryType = 'economic';
      playerWon = true;
    }
    // Secret agenda completion
    else if (state.secretAgenda?.completed) {
      victoryType = 'agenda';
      playerWon = true;
    }
    // AI victory conditions (similar checks for AI)
    else if (state.aiIP >= 300 || state.controlledStates.filter(s => state.states.find(st => st.abbreviation === s)?.owner === 'ai').length >= 10) {
      playerWon = false;
    }

    // If victory condition met, track in achievements
    if (victoryType && playerWon) {
      achievements.onGameEnd(true, victoryType, {
        turns: state.turn,
        finalIP: state.ip,
        finalTruth: state.truth,
        statesControlled: state.controlledStates.length
      });
    } else if (!playerWon && (state.aiIP >= 300 || state.truth <= 0 || state.truth >= 100)) {
      achievements.onGameEnd(false, 'defeat', {
        turns: state.turn,
        finalIP: state.ip,
        finalTruth: state.truth,
        statesControlled: state.controlledStates.length
      });
    }

    return { victoryType, playerWon };
  }, [achievements]);
  const saveGame = useCallback(() => {
    const saveData = {
      ...gameState,
      timestamp: Date.now(),
      version: '1.0'
    };

    try {
      localStorage.setItem('shadowgov-savegame', JSON.stringify(saveData, omitClashKey));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem('shadowgov-savegame');
      if (!savedData) return false;

      const saveData = JSON.parse(savedData, omitClashKey);

      const rehydrateAgenda = (
        storedAgenda: unknown,
      ): GameState['secretAgenda'] | undefined => {
        if (!storedAgenda || typeof storedAgenda !== 'object') {
          return undefined;
        }

        const agendaData = storedAgenda as Partial<GameState['secretAgenda']> & { id?: unknown };
        if (typeof agendaData.id !== 'string') {
          return undefined;
        }

        const baseAgenda = getAgendaById(agendaData.id);
        if (!baseAgenda) {
          console.warn(`Unknown agenda ID in save data: ${agendaData.id}`);
          return undefined;
        }

        const progress =
          typeof agendaData.progress === 'number' && Number.isFinite(agendaData.progress)
            ? agendaData.progress
            : 0;
        const completed = typeof agendaData.completed === 'boolean' ? agendaData.completed : false;
        const revealed = typeof agendaData.revealed === 'boolean' ? agendaData.revealed : false;
        const stageId = resolveAgendaStageByProgress(baseAgenda.stages, progress)?.id ?? '';

        return {
          ...baseAgenda,
          progress,
          completed,
          revealed,
          stageId,
        };
      };

      const secretAgenda = rehydrateAgenda(saveData.secretAgenda);
      const aiSecretAgenda = rehydrateAgenda(saveData.aiSecretAgenda);
      const agendaIssueState = saveData.agendaIssue
        ? resolveIssueStateById((saveData.agendaIssue as { id?: string })?.id)
        : resolveIssueStateById((saveData as { agendaIssueId?: string }).agendaIssueId);
      const normalizedRound = normalizeRoundFromSave(saveData);
      const normalizedTurn = typeof saveData.turn === 'number' && Number.isFinite(saveData.turn)
        ? Math.max(1, saveData.turn)
        : 1;

      // Validate save data structure
      if (!saveData.faction || !saveData.phase || saveData.version !== '1.0') {
        console.warn('Invalid or incompatible save data');
        return false;
      }

      // Reconstruct the game state
      const stateByAbbreviation = Object.fromEntries(USA_STATES.map(state => [state.abbreviation, state]));
      const stateById = Object.fromEntries(USA_STATES.map(state => [state.id, state]));
      let legacySpecialBonusDetected = false;
      const rawStates = Array.isArray(saveData.states)
        ? saveData.states.map(rawState => {
            if (!rawState || typeof rawState !== 'object') {
              return rawState;
            }

            const { specialBonus, bonusValue, ...rest } = rawState as Record<string, unknown>;
            if (specialBonus !== undefined || bonusValue !== undefined) {
              legacySpecialBonusDetected = true;
            }

            return rest;
          })
        : [];

      if (legacySpecialBonusDetected) {
        console.info('[Migration] Dropped legacy state bonus fields from save data');
      }

      const normalizedStates = rawStates.map(rawState => {
        const providedAbbreviation = typeof rawState?.abbreviation === 'string'
          ? rawState.abbreviation.trim()
          : '';
        const uppercaseAbbreviation = providedAbbreviation ? providedAbbreviation.toUpperCase() : '';
        const lookupBase =
          (uppercaseAbbreviation ? stateByAbbreviation[uppercaseAbbreviation] : undefined)
          ?? (providedAbbreviation ? stateByAbbreviation[providedAbbreviation] : undefined)
          ?? (typeof rawState?.id === 'string' ? stateById[rawState.id] : undefined);
        const normalizedAbbreviation = uppercaseAbbreviation
          || (lookupBase?.abbreviation ? lookupBase.abbreviation.toUpperCase() : '');
        const defense = typeof rawState?.defense === 'number' && Number.isFinite(rawState.defense)
          ? rawState.defense
          : lookupBase?.defense ?? 0;
        const baseDefense = typeof (rawState as any)?.baseDefense === 'number' && Number.isFinite((rawState as any).baseDefense)
          ? (rawState as any).baseDefense
          : lookupBase?.defense ?? defense;
        const comboDefenseBonus = typeof (rawState as any)?.comboDefenseBonus === 'number' && Number.isFinite((rawState as any).comboDefenseBonus)
          ? Math.max(0, Math.floor((rawState as any).comboDefenseBonus))
          : 0;
        const owner = rawState?.owner === 'player'
          ? 'player'
          : rawState?.owner === 'ai'
            ? 'ai'
            : 'neutral';
        const basePressure = typeof rawState?.pressure === 'number' && Number.isFinite(rawState.pressure)
          ? rawState.pressure
          : 0;
        const rawPressurePlayer = (rawState as { pressurePlayer?: unknown } | null | undefined)?.pressurePlayer;
        const rawPressureAi = (rawState as { pressureAi?: unknown } | null | undefined)?.pressureAi;
        const pressurePlayer = typeof rawPressurePlayer === 'number' && Number.isFinite(rawPressurePlayer)
          ? rawPressurePlayer
          : basePressure;
        const pressureAi = typeof rawPressureAi === 'number' && Number.isFinite(rawPressureAi)
          ? rawPressureAi
          : basePressure;
        const rawStateEventHistory = (rawState as { stateEventHistory?: unknown }).stateEventHistory;
        let stateEventHistory = normalizeStateEventHistory(rawStateEventHistory, normalizedTurn);
        const normalizedBonus = normalizeStateEventBonus((rawState as { stateEventBonus?: unknown }).stateEventBonus, normalizedTurn);
        if (stateEventHistory.length === 0 && normalizedBonus) {
          stateEventHistory = trimStateEventHistory([...stateEventHistory, normalizedBonus]);
        }
        const stateEventBonus = stateEventHistory.length > 0
          ? stateEventHistory[stateEventHistory.length - 1]
          : normalizedBonus;

        const rawActiveBonus = (rawState as { activeStateBonus?: unknown }).activeStateBonus;
        const activeStateBonus = rawActiveBonus && typeof rawActiveBonus === 'object'
          && typeof (rawActiveBonus as { id?: unknown }).id === 'string'
          ? ({
              source: 'state-themed' as const,
              id: String((rawActiveBonus as { id: string }).id),
              stateId: typeof (rawActiveBonus as { stateId?: unknown }).stateId === 'string'
                ? (rawActiveBonus as { stateId: string }).stateId
                : lookupBase?.id ?? normalizedAbbreviation,
              stateName: typeof (rawActiveBonus as { stateName?: unknown }).stateName === 'string'
                ? (rawActiveBonus as { stateName: string }).stateName
                : lookupBase?.name ?? normalizedAbbreviation,
              stateAbbreviation: normalizedAbbreviation,
              round: typeof (rawActiveBonus as { round?: unknown }).round === 'number'
                && Number.isFinite((rawActiveBonus as { round: number }).round)
                ? (rawActiveBonus as { round: number }).round
                : normalizedRound,
              label: typeof (rawActiveBonus as { label?: unknown }).label === 'string'
                ? (rawActiveBonus as { label: string }).label
                : 'State Bonus',
              summary: typeof (rawActiveBonus as { summary?: unknown }).summary === 'string'
                ? (rawActiveBonus as { summary: string }).summary
                : '',
              headline: typeof (rawActiveBonus as { headline?: unknown }).headline === 'string'
                ? (rawActiveBonus as { headline: string }).headline
                : (typeof (rawActiveBonus as { label?: unknown }).label === 'string'
                  ? String((rawActiveBonus as { label: string }).label)
                  : 'State Bonus'),
              subhead: typeof (rawActiveBonus as { subhead?: unknown }).subhead === 'string'
                ? (rawActiveBonus as { subhead: string }).subhead
                : undefined,
              icon: typeof (rawActiveBonus as { icon?: unknown }).icon === 'string'
                ? (rawActiveBonus as { icon: string }).icon
                : undefined,
              truthDelta: typeof (rawActiveBonus as { truthDelta?: unknown }).truthDelta === 'number'
                && Number.isFinite((rawActiveBonus as { truthDelta: number }).truthDelta)
                ? (rawActiveBonus as { truthDelta: number }).truthDelta
                : undefined,
              ipDelta: typeof (rawActiveBonus as { ipDelta?: unknown }).ipDelta === 'number'
                && Number.isFinite((rawActiveBonus as { ipDelta: number }).ipDelta)
                ? (rawActiveBonus as { ipDelta: number }).ipDelta
                : undefined,
              pressureDelta: typeof (rawActiveBonus as { pressureDelta?: unknown }).pressureDelta === 'number'
                && Number.isFinite((rawActiveBonus as { pressureDelta: number }).pressureDelta)
                ? (rawActiveBonus as { pressureDelta: number }).pressureDelta
                : undefined,
            })
          : null;

        const rawRoundEvents = (rawState as { roundEvents?: unknown }).roundEvents;
        const roundEvents = Array.isArray(rawRoundEvents)
          ? rawRoundEvents
              .filter(entry => entry && typeof entry === 'object' && typeof (entry as { id?: unknown }).id === 'string')
              .map(entry => ({
                source: 'state-themed' as const,
                id: String((entry as { id: string }).id),
                stateId: typeof (entry as { stateId?: unknown }).stateId === 'string'
                  ? (entry as { stateId: string }).stateId
                  : lookupBase?.id ?? normalizedAbbreviation,
                stateName: typeof (entry as { stateName?: unknown }).stateName === 'string'
                  ? (entry as { stateName: string }).stateName
                  : lookupBase?.name ?? normalizedAbbreviation,
                stateAbbreviation: normalizedAbbreviation,
                round: typeof (entry as { round?: unknown }).round === 'number'
                  && Number.isFinite((entry as { round: number }).round)
                  ? (entry as { round: number }).round
                  : normalizedRound,
                headline: typeof (entry as { headline?: unknown }).headline === 'string'
                  ? (entry as { headline: string }).headline
                  : 'State Event',
                summary: typeof (entry as { summary?: unknown }).summary === 'string'
                  ? (entry as { summary: string }).summary
                  : '',
                subhead: typeof (entry as { subhead?: unknown }).subhead === 'string'
                  ? (entry as { subhead: string }).subhead
                  : undefined,
                icon: typeof (entry as { icon?: unknown }).icon === 'string'
                  ? (entry as { icon: string }).icon
                  : undefined,
                truthDelta: typeof (entry as { truthDelta?: unknown }).truthDelta === 'number'
                  && Number.isFinite((entry as { truthDelta: number }).truthDelta)
                  ? (entry as { truthDelta: number }).truthDelta
                  : undefined,
                ipDelta: typeof (entry as { ipDelta?: unknown }).ipDelta === 'number'
                  && Number.isFinite((entry as { ipDelta: number }).ipDelta)
                  ? (entry as { ipDelta: number }).ipDelta
                  : undefined,
                pressureDelta: typeof (entry as { pressureDelta?: unknown }).pressureDelta === 'number'
                  && Number.isFinite((entry as { pressureDelta: number }).pressureDelta)
                  ? (entry as { pressureDelta: number }).pressureDelta
                  : undefined,
              }))
          : [];

        return {
          id: typeof rawState?.id === 'string' ? rawState.id : lookupBase?.id ?? normalizedAbbreviation,
          name: typeof rawState?.name === 'string' ? rawState.name : lookupBase?.name ?? normalizedAbbreviation,
          abbreviation: normalizedAbbreviation,
          baseIP: typeof rawState?.baseIP === 'number' && Number.isFinite(rawState.baseIP)
            ? rawState.baseIP
            : lookupBase?.baseIP ?? 0,
          baseDefense,
          defense,
          comboDefenseBonus,
          pressure: Math.max(basePressure, pressurePlayer, pressureAi),
          pressurePlayer,
          pressureAi,
          contested: Boolean(rawState?.contested),
          owner,
          occupierCardId: rawState?.occupierCardId ?? null,
          occupierCardName: rawState?.occupierCardName ?? null,
          occupierLabel: rawState?.occupierLabel ?? null,
          occupierIcon: rawState?.occupierIcon ?? null,
          occupierUpdatedAt: typeof rawState?.occupierUpdatedAt === 'number'
            ? rawState.occupierUpdatedAt
            : undefined,
          paranormalHotspot: undefined,
          stateEventBonus,
          stateEventHistory,
          activeStateBonus,
          roundEvents,
        } as GameState['states'][number];
      });

      const normalizedHotspots: Record<string, ActiveParanormalHotspot> = {};
      if (saveData.paranormalHotspots && typeof saveData.paranormalHotspots === 'object') {
        for (const [abbr, rawHotspot] of Object.entries(saveData.paranormalHotspots as Record<string, any>)) {
          if (!rawHotspot || typeof rawHotspot !== 'object') continue;
          const normalizedKey = abbr.trim();
          const uppercaseKey = normalizedKey.toUpperCase();
          const state = normalizedStates.find(entry =>
            entry.abbreviation === uppercaseKey
            || entry.abbreviation === normalizedKey
            || entry.id === normalizedKey,
          );
          if (!state) continue;
          const eventId = typeof rawHotspot.eventId === 'string' ? rawHotspot.eventId : undefined;
          if (!eventId) continue;
          const defenseBoost = typeof rawHotspot.defenseBoost === 'number' && Number.isFinite(rawHotspot.defenseBoost)
            ? rawHotspot.defenseBoost
            : 0;
          const truthReward = typeof rawHotspot.truthReward === 'number' && Number.isFinite(rawHotspot.truthReward)
            ? rawHotspot.truthReward
            : 0;
          const duration = typeof rawHotspot.duration === 'number' && Number.isFinite(rawHotspot.duration)
            ? Math.max(1, rawHotspot.duration)
            : 1;
          const expiresOnTurn = typeof rawHotspot.expiresOnTurn === 'number' && Number.isFinite(rawHotspot.expiresOnTurn)
            ? rawHotspot.expiresOnTurn
            : normalizedTurn + duration;
          const createdOnTurn = typeof rawHotspot.createdOnTurn === 'number' && Number.isFinite(rawHotspot.createdOnTurn)
            ? rawHotspot.createdOnTurn
            : normalizedTurn;
          const source = (rawHotspot.source === 'truth' || rawHotspot.source === 'government' || rawHotspot.source === 'neutral')
            ? rawHotspot.source
            : 'neutral';

          normalizedHotspots[state.abbreviation] = {
            id: typeof rawHotspot.id === 'string' ? rawHotspot.id : `${eventId}:${state.abbreviation}:${createdOnTurn}`,
            eventId,
            stateId: typeof rawHotspot.stateId === 'string' ? rawHotspot.stateId : state.id,
            stateName: typeof rawHotspot.stateName === 'string' ? rawHotspot.stateName : state.name,
            stateAbbreviation: state.abbreviation,
            label: typeof rawHotspot.label === 'string'
              ? rawHotspot.label
              : (typeof rawHotspot.description === 'string' ? rawHotspot.description : 'Paranormal Hotspot'),
            description: typeof rawHotspot.description === 'string' ? rawHotspot.description : undefined,
            icon: typeof rawHotspot.icon === 'string' ? rawHotspot.icon : undefined,
            duration,
            defenseBoost,
            truthReward,
            expiresOnTurn,
            createdOnTurn,
            source,
          };
        }
      }

      if (Object.keys(normalizedHotspots).length === 0) {
        for (const rawState of rawStates) {
          if (!rawState || typeof rawState !== 'object') continue;
          const embedded = (rawState as any).paranormalHotspot;
          if (!embedded || typeof embedded !== 'object') continue;
          const providedAbbreviation = typeof rawState?.abbreviation === 'string'
            ? rawState.abbreviation.trim()
            : '';
          const uppercaseAbbreviation = providedAbbreviation ? providedAbbreviation.toUpperCase() : '';
          const state = normalizedStates.find(entry => {
            if (uppercaseAbbreviation && entry.abbreviation === uppercaseAbbreviation) {
              return true;
            }
            if (providedAbbreviation && entry.abbreviation === providedAbbreviation) {
              return true;
            }
            if (typeof rawState?.id === 'string' && entry.id === rawState.id) {
              return true;
            }
            return false;
          });
          if (!state) continue;
          const eventId = typeof embedded.eventId === 'string' ? embedded.eventId : undefined;
          if (!eventId) continue;
          const defenseBoost = typeof embedded.defenseBoost === 'number' && Number.isFinite(embedded.defenseBoost)
            ? embedded.defenseBoost
            : 0;
          const truthReward = typeof embedded.truthReward === 'number' && Number.isFinite(embedded.truthReward)
            ? embedded.truthReward
            : 0;
          const duration = typeof embedded.duration === 'number' && Number.isFinite(embedded.duration)
            ? Math.max(1, embedded.duration)
            : 1;
          const expiresOnTurn = typeof embedded.expiresOnTurn === 'number' && Number.isFinite(embedded.expiresOnTurn)
            ? embedded.expiresOnTurn
            : normalizedTurn + duration;
          const createdOnTurn = typeof embedded.createdOnTurn === 'number' && Number.isFinite(embedded.createdOnTurn)
            ? embedded.createdOnTurn
            : normalizedTurn;
          const source = (embedded.source === 'truth' || embedded.source === 'government' || embedded.source === 'neutral')
            ? embedded.source
            : 'neutral';

          normalizedHotspots[state.abbreviation] = {
            id: typeof embedded.id === 'string' ? embedded.id : `${eventId}:${state.abbreviation}:${createdOnTurn}`,
            eventId,
            stateId: typeof embedded.stateId === 'string' ? embedded.stateId : state.id,
            stateName: typeof embedded.stateName === 'string' ? embedded.stateName : state.name,
            stateAbbreviation: state.abbreviation,
            label: typeof embedded.label === 'string' ? embedded.label : 'Paranormal Hotspot',
            description: typeof embedded.description === 'string' ? embedded.description : undefined,
            icon: typeof embedded.icon === 'string' ? embedded.icon : undefined,
            duration,
            defenseBoost,
            truthReward,
            expiresOnTurn,
            createdOnTurn,
            source,
          };
        }
      }

      const statesWithHotspot = normalizedStates.map(state => {
        const active = normalizedHotspots[state.abbreviation];
        return {
          ...state,
          paranormalHotspot: active ? toStateHotspot(active, normalizedTurn) : undefined,
        };
      });

      const savedTruthAboveStreak =
        typeof saveData.truthAbove80Streak === 'number' && Number.isFinite(saveData.truthAbove80Streak)
          ? saveData.truthAbove80Streak
          : typeof saveData.timeBasedGoalCounters?.truthAbove80Streak === 'number' &&
              Number.isFinite(saveData.timeBasedGoalCounters.truthAbove80Streak)
            ? saveData.timeBasedGoalCounters.truthAbove80Streak
            : 0;

      const savedTruthBelowStreak =
        typeof saveData.truthBelow20Streak === 'number' && Number.isFinite(saveData.truthBelow20Streak)
          ? saveData.truthBelow20Streak
          : typeof saveData.timeBasedGoalCounters?.truthBelow20Streak === 'number' &&
              Number.isFinite(saveData.timeBasedGoalCounters.truthBelow20Streak)
            ? saveData.timeBasedGoalCounters.truthBelow20Streak
            : 0;

      gameSessionRef.current += 1;
      if (pendingAiTimeoutRef.current) {
        clearTimeout(pendingAiTimeoutRef.current);
      }
      pendingAiTimeoutRef.current = null;

      setGameState(prev => {
        const restoredEffects = saveData.stateCombinationEffects
          ? {
            ...createDefaultCombinationEffects(),
            ...saveData.stateCombinationEffects,
          }
          : createDefaultCombinationEffects();

        const baseStates = statesWithHotspot.length > 0 ? statesWithHotspot : prev.states;
        const statesWithDefense = applyDefenseBonusToStates(baseStates, restoredEffects.stateDefenseBonus);
        const derivedStateRoundEvents = Object.fromEntries(
          statesWithDefense.map(state => [state.abbreviation, Array.isArray(state.roundEvents) ? state.roundEvents : []]),
        );

        return {
          ...prev,
          ...saveData,
          turn: normalizedTurn,
          round: normalizedRound,
          paranormalHotspots: normalizedHotspots,
          secretAgenda,
          aiSecretAgenda,
          agendaIssue: agendaIssueState,
          agendaIssueCounters: (saveData.agendaIssueCounters && typeof saveData.agendaIssueCounters === 'object')
            ? saveData.agendaIssueCounters as Record<string, number>
            : {},
          agendaRoundCounters: (saveData.agendaRoundCounters && typeof saveData.agendaRoundCounters === 'object')
            ? saveData.agendaRoundCounters as Record<string, number>
            : {},
          cardsPlayedThisRound: Array.isArray(saveData.cardsPlayedThisRound)
            ? saveData.cardsPlayedThisRound
            : [],
          playHistory: Array.isArray(saveData.playHistory)
            ? saveData.playHistory
            : [],
          turnPlays: Array.isArray(saveData.turnPlays)
            ? saveData.turnPlays
            : [],
          comboTruthDeltaThisRound:
            typeof saveData.comboTruthDeltaThisRound === 'number' ? saveData.comboTruthDeltaThisRound : 0,
          stateCombinationBonusIP:
            typeof saveData.stateCombinationBonusIP === 'number' ? saveData.stateCombinationBonusIP : 0,
          activeStateCombinationIds: Array.isArray(saveData.activeStateCombinationIds)
            ? saveData.activeStateCombinationIds
            : [],
          stateCombinationEffects: restoredEffects,
          states: statesWithDefense,
          pendingEditionEvents: Array.isArray(saveData.pendingEditionEvents)
            ? saveData.pendingEditionEvents
            : [],
          activeCampaignArcs: Array.isArray(saveData.activeCampaignArcs)
            ? saveData.activeCampaignArcs as ActiveCampaignArcState[]
            : [...prev.activeCampaignArcs],
          pendingArcEvents: Array.isArray(saveData.pendingArcEvents)
            ? saveData.pendingArcEvents as PendingCampaignArcEvent[]
            : [...prev.pendingArcEvents],
          // Ensure objects are properly reconstructed
          eventManager: prev.eventManager, // Keep the current event manager
          aiStrategist: prev.aiStrategist || AIFactory.createStrategist(saveData.aiDifficulty || 'medium'),
          truthAbove80Streak: savedTruthAboveStreak,
          truthBelow20Streak: savedTruthBelowStreak,
          timeBasedGoalCounters: {
            ...(saveData.timeBasedGoalCounters && typeof saveData.timeBasedGoalCounters === 'object'
              ? saveData.timeBasedGoalCounters
              : {}),
            truthAbove80Streak: savedTruthAboveStreak,
            truthBelow20Streak: savedTruthBelowStreak,
          },
          stateRoundSeed: typeof saveData.stateRoundSeed === 'number' && Number.isFinite(saveData.stateRoundSeed)
            ? saveData.stateRoundSeed >>> 0
            : (Number.isFinite(prev.stateRoundSeed) ? prev.stateRoundSeed : Math.floor(Math.random() * 0xffffffff)),
          lastStateBonusRound: typeof saveData.lastStateBonusRound === 'number'
            && Number.isFinite(saveData.lastStateBonusRound)
            ? saveData.lastStateBonusRound
            : 0,
          stateRoundEvents: derivedStateRoundEvents,
        };
      });
      
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }, []);

  const getSaveInfo = useCallback(() => {
    try {
      const savedData = localStorage.getItem('shadowgov-savegame');
      if (!savedData) return null;

      const saveData = JSON.parse(savedData, omitClashKey);
      const normalizedRound = normalizeRoundFromSave(saveData);
      const normalizedTurn = typeof saveData.turn === 'number' && Number.isFinite(saveData.turn)
        ? Math.max(1, saveData.turn)
        : 1;
      return {
        faction: saveData.faction,
        turn: normalizedTurn,
        round: normalizedRound,
        phase: saveData.phase,
        truth: saveData.truth,
        timestamp: saveData.timestamp,
        exists: true
      };
    } catch {
      return null;
    }
  }, []);

  const deleteSave = useCallback(() => {
    try {
      localStorage.removeItem('shadowgov-savegame');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }, []);

  return {
    gameState,
    initGame,
    playCard,
    playCardAnimated,
    selectCard,
    selectTargetState,
    endTurn,
    closeNewspaper,
    executeAITurn,
    confirmNewCards,
    setGameState,
    saveGame,
    loadGame,
    getSaveInfo,
    deleteSave,
    checkVictoryConditions,
    registerParanormalSighting,
  };
};