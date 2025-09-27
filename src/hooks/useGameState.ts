import { useState, useCallback } from 'react';
import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE, getRandomCards } from '@/data/cardDatabase';
import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';
import {
  applyStateCombinationCostModifiers,
  calculateDynamicIpBonus,
  createDefaultCombinationEffects,
} from '@/data/stateCombinations';
import { getRandomAgenda, getAgendaById } from '@/data/agendaDatabase';
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
import { EventManager, type GameEvent, type ParanormalHotspotPayload } from '@/data/eventDatabase';
import { processAiActions } from './aiTurnActions';
import { buildEditionEvents } from './eventEdition';
import { getStartingHandSize, type DrawMode, type CardDrawState } from '@/data/cardDrawingSystem';
import { useAchievements } from '@/contexts/AchievementContext';
import { resolveCardMVP, type CardPlayResolution } from '@/systems/cardResolution';
import { applyTruthDelta } from '@/utils/truth';
import type { Difficulty } from '@/ai';
import { getDifficulty } from '@/state/settings';
import { featureFlags } from '@/state/featureFlags';
import { getComboSettings } from '@/game/comboEngine';
import type { ActiveParanormalHotspot, GameState, StateParanormalHotspot } from './gameStateTypes';
import {
  applyAiCardPlay,
  buildStrategyLogEntries as buildStrategyLogEntriesHelper,
  createPlayedCardRecord,
  createTurnPlayEntries,
  type AiCardPlayParams,
} from './aiHelpers';
import { evaluateCombosForTurn } from './comboAdapter';

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
    const computedProgressRaw = Number(agenda.checkProgress?.(snapshot) ?? agenda.progress ?? 0);
    const computedProgress = Number.isFinite(computedProgressRaw)
      ? Math.max(0, computedProgressRaw)
      : agenda.progress ?? 0;
    const previousProgress = agenda.progress ?? 0;
    const target = agenda.target ?? 0;
    const isCompleted = computedProgress >= target;
    const isStreakAgenda = STREAK_AGENDA_IDS.has(agenda.id);
    const shouldLogProgress = options.requireRevealForProgress ? Boolean(agenda.revealed) : true;
    const actorPrefix = actor === 'opposition' ? 'Opposition ' : '';
    const actorLabel = actor === 'opposition' ? 'Opposition' : 'Operatives';

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

    return {
      ...agenda,
      progress: computedProgress,
      completed: isCompleted,
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
          pressure: 0,
          contested: false,
          owner: 'neutral' as const,
          specialBonus: state.specialBonus,
          bonusValue: state.bonusValue,
          paranormalHotspot: undefined,
        };
      }),
      currentEvents: [],
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
      },
      aiSecretAgenda: {
        ...initialAiAgenda,
        progress: 0,
        completed: false,
        revealed: false,
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
      cardsPlayedThisTurn: 0,
      cardsPlayedThisRound: [],
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
          pressure: 0,
          contested: false,
          owner,
          specialBonus: state.specialBonus,
          bonusValue: state.bonusValue,
          paranormalHotspot: undefined,
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
      },
      aiSecretAgenda: {
        ...aiAgendaTemplate,
        progress: 0,
        completed: false,
        revealed: false,
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

      const nextState: GameState = {
        ...prev,
        hand: prev.hand.filter(c => c.id !== cardId),
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: resolution.states,
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

      return updateSecretAgendaProgress(stateWithReveal);
    });
  }, [achievements, resolveCardEffects]);

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

      const nextState: GameState = {
        ...prev,
        animating: true,
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: resolution.states,
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

      return updateSecretAgendaProgress(stateWithReveal);
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
  }, [gameState, achievements, resolveCardEffects]);

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

        if (prev.eventManager) {
          const maybeEvent = prev.eventManager.maybeSelectRandomEvent(prev);
          if (maybeEvent) {
            triggeredEvent = maybeEvent;
            eventForEdition = maybeEvent;

            if (maybeEvent.effects) {
              const effects = maybeEvent.effects;
              if (effects.truth) truthModifier = effects.truth;
              if (effects.ip) ipModifier = effects.ip;
              if (effects.cardDraw) bonusCardDraw = effects.cardDraw;

              eventEffectLog.push(`EVENT: ${maybeEvent.title} triggered!`);
              if (effects.truth) eventEffectLog.push(`Truth ${effects.truth > 0 ? '+' : ''}${effects.truth}%`);
              if (effects.ip) eventEffectLog.push(`IP ${effects.ip > 0 ? '+' : ''}${effects.ip}`);
              if (effects.cardDraw) eventEffectLog.push(`Draw ${effects.cardDraw} extra cards`);
              if (effects.revealSecretAgenda) {
                eventEffectLog.push('Enemy secret agenda exposed!');
              }
            }

            if (maybeEvent.paranormalHotspot) {
              const target = selectHotspotTargetState({
                states: statesAfterHotspot,
                activeHotspots: hotspotsAfterHotspot,
                payload: maybeEvent.paranormalHotspot,
                playerFaction: prev.faction,
              });

              if (target) {
                const { active, stateHotspot } = createHotspotEntries({
                  event: maybeEvent,
                  payload: maybeEvent.paranormalHotspot,
                  state: target,
                  currentTurn: prev.turn,
                });

                target.defense = target.defense + maybeEvent.paranormalHotspot.defenseBoost;
                target.paranormalHotspot = stateHotspot;
                hotspotsAfterHotspot = {
                  ...hotspotsAfterHotspot,
                  [target.abbreviation]: active,
                };

                eventEffectLog.push(
                  `👻 ${stateHotspot.label} erupts in ${target.name}! Defense +${stateHotspot.defenseBoost} for ${maybeEvent.paranormalHotspot.duration} turn${maybeEvent.paranormalHotspot.duration === 1 ? '' : 's'}. Capture swings truth by ±${stateHotspot.truthReward}%.`,
                );
                hotspotSourceToRegister = active.source;

                if (maybeEvent.paranormalHotspot.headlineTemplate) {
                  const dynamicHeadline = maybeEvent.paranormalHotspot.headlineTemplate.replace(
                    /\{\{STATE\}\}/g,
                    target.name.toUpperCase(),
                  );
                  eventForEdition = { ...maybeEvent, headline: dynamicHeadline };
                }
              } else {
                eventEffectLog.push('👻 Paranormal surge failed to find a viable hotspot target.');
              }
            }
          }
        }

        const newEvents = buildEditionEvents(prev, eventForEdition ?? triggeredEvent);

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
          comboTruthDeltaThisRound: prev.comboTruthDeltaThisRound + comboTruthDelta,
          cardDrawState: {
            cardsPlayedLastTurn: prev.cardsPlayedThisTurn,
            lastTurnWithoutPlay: prev.cardsPlayedThisTurn === 0,
          },
          log: logEntries,
          turnPlays: [],
          states: statesAfterHotspot,
          paranormalHotspots: hotspotsAfterHotspot,
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
        states: statesAfterHotspot,
        paranormalHotspots: hotspotsAfterHotspot,
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


  const playAICard = useCallback((params: AiCardPlayParams) => {
    return new Promise<GameState>(resolve => {
      setGameState(prev => {
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
  }, [achievements]);

  // AI Turn Management
  const executeAITurn = useCallback(async () => {
    if (
      !gameState.aiStrategist ||
      gameState.currentPlayer !== 'ai' ||
      gameState.aiTurnInProgress ||
      gameState.isGameOver
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

    setGameState(prev => (prev.isGameOver ? prev : { ...prev, aiTurnInProgress: true }));

    await new Promise<GameState>(resolve => {
      setGameState(prev => {
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

    const prePlanningState = await readLatestState();
    if (prePlanningState.isGameOver) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const planningState = await readLatestState();

    if (!planningState.aiStrategist) {
      setGameState(prev => (prev.isGameOver ? prev : { ...prev, aiTurnInProgress: false }));
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
      setGameState(prev => ({
        ...prev,
        log: [...prev.log, ...buildStrategyLogEntries(undefined, turnPlan.sequenceDetails)],
      }));
    }

    const actionOutcome = await processAiActions({
      actions: turnPlan.actions,
      sequenceDetails: turnPlan.sequenceDetails,
      readLatestState,
      playCard: playAICard,
      waitBetweenActions: () => new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400)),
    });

    if (actionOutcome.gameOver) {
      return;
    }

    const latestState = await readLatestState();
    if (latestState.isGameOver) {
      return;
    }

    setTimeout(() => {
      let shouldProceed = true;
      setGameState(prev => {
        if (prev.isGameOver) {
          shouldProceed = false;
          return prev;
        }
        return prev;
      });

      if (!shouldProceed) {
        return;
      }

      endTurn();
      setGameState(prev => (prev.isGameOver ? prev : { ...prev, aiTurnInProgress: false }));
    }, 1000);
  }, [gameState, endTurn, playAICard]);

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

      const nextState: GameState = {
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
        log: [...prev.log, drawLogEntry],
        agendaRoundCounters: {},
      };

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

        return {
          ...baseAgenda,
          progress,
          completed,
          revealed,
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
      const rawStates = Array.isArray(saveData.states) ? saveData.states : [];
      const normalizedStates = rawStates.map(rawState => {
        const abbreviation = typeof rawState?.abbreviation === 'string'
          ? rawState.abbreviation
          : typeof rawState?.id === 'string'
            ? rawState.id
            : '';
        const lookupBase = stateByAbbreviation[abbreviation] ?? (typeof rawState?.id === 'string' ? stateById[rawState.id] : undefined);
        const defense = typeof rawState?.defense === 'number' && Number.isFinite(rawState.defense)
          ? rawState.defense
          : lookupBase?.defense ?? 0;
        const baseDefense = typeof (rawState as any)?.baseDefense === 'number' && Number.isFinite((rawState as any).baseDefense)
          ? (rawState as any).baseDefense
          : lookupBase?.defense ?? defense;
        const owner = rawState?.owner === 'player'
          ? 'player'
          : rawState?.owner === 'ai'
            ? 'ai'
            : 'neutral';

        return {
          id: typeof rawState?.id === 'string' ? rawState.id : lookupBase?.id ?? abbreviation,
          name: typeof rawState?.name === 'string' ? rawState.name : lookupBase?.name ?? abbreviation,
          abbreviation: abbreviation || lookupBase?.abbreviation || '',
          baseIP: typeof rawState?.baseIP === 'number' && Number.isFinite(rawState.baseIP)
            ? rawState.baseIP
            : lookupBase?.baseIP ?? 0,
          baseDefense,
          defense,
          pressure: typeof rawState?.pressure === 'number' && Number.isFinite(rawState.pressure)
            ? rawState.pressure
            : 0,
          contested: Boolean(rawState?.contested),
          owner,
          specialBonus: rawState?.specialBonus ?? lookupBase?.specialBonus,
          bonusValue: typeof rawState?.bonusValue === 'number' && Number.isFinite(rawState.bonusValue)
            ? rawState.bonusValue
            : lookupBase?.bonusValue,
          occupierCardId: rawState?.occupierCardId ?? null,
          occupierCardName: rawState?.occupierCardName ?? null,
          occupierLabel: rawState?.occupierLabel ?? null,
          occupierIcon: rawState?.occupierIcon ?? null,
          occupierUpdatedAt: typeof rawState?.occupierUpdatedAt === 'number'
            ? rawState.occupierUpdatedAt
            : undefined,
          paranormalHotspot: undefined,
        } as GameState['states'][number];
      });

      const normalizedHotspots: Record<string, ActiveParanormalHotspot> = {};
      if (saveData.paranormalHotspots && typeof saveData.paranormalHotspots === 'object') {
        for (const [abbr, rawHotspot] of Object.entries(saveData.paranormalHotspots as Record<string, any>)) {
          if (!rawHotspot || typeof rawHotspot !== 'object') continue;
          const state = normalizedStates.find(entry => entry.abbreviation === abbr);
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
          const abbreviation = typeof rawState?.abbreviation === 'string'
            ? rawState.abbreviation
            : typeof rawState?.id === 'string'
              ? rawState.id
              : '';
          const state = normalizedStates.find(entry => entry.abbreviation === abbreviation);
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

      setGameState(prev => ({
        ...prev,
        ...saveData,
        turn: normalizedTurn,
        round: normalizedRound,
        states: statesWithHotspot.length > 0 ? statesWithHotspot : prev.states,
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
        stateCombinationEffects: saveData.stateCombinationEffects
          ? {
            ...createDefaultCombinationEffects(),
            ...saveData.stateCombinationEffects,
          }
          : createDefaultCombinationEffects(),
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
      }));
      
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