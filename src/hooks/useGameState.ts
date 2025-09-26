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
import { getRandomAgenda } from '@/data/agendaDatabase';
import { type AIDifficulty } from '@/data/aiStrategy';
import { AIFactory } from '@/data/aiFactory';
import { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import { chooseTurnActions } from '@/ai/enhancedController';
import { EventManager, type GameEvent } from '@/data/eventDatabase';
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
import type { GameState } from './gameStateTypes';
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

const STREAK_AGENDA_IDS = new Set(['truth_truth_threshold', 'gov_truth_suppression']);

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
  };
};

const updateSecretAgendaProgress = (state: GameState): GameState => {
  let logUpdates: string[] = [];
  let updatedSecretAgenda = state.secretAgenda;
  let updatedAiSecretAgenda = state.aiSecretAgenda;

  if (updatedSecretAgenda) {
    const snapshot = buildAgendaSnapshot(state, 'player');
    const computedProgressRaw = Number(updatedSecretAgenda.checkProgress?.(snapshot) ?? updatedSecretAgenda.progress ?? 0);
    const computedProgress = Number.isFinite(computedProgressRaw)
      ? Math.max(0, computedProgressRaw)
      : updatedSecretAgenda.progress ?? 0;
    const previousProgress = updatedSecretAgenda.progress ?? 0;
    const target = updatedSecretAgenda.target ?? 0;
    const isCompleted = computedProgress >= target;

    if (computedProgress !== previousProgress || isCompleted !== updatedSecretAgenda.completed) {
      const isStreakAgenda = STREAK_AGENDA_IDS.has(updatedSecretAgenda.id);

      if (computedProgress > previousProgress) {
        const delta = computedProgress - previousProgress;
        const progressMessage = isStreakAgenda
          ? `Secret Agenda streak increased to ${computedProgress}: ${updatedSecretAgenda.title} (${computedProgress}/${target})`
          : `Secret Agenda progress +${delta}: ${updatedSecretAgenda.title} (${computedProgress}/${target})`;
        logUpdates = [...logUpdates, progressMessage];
      } else if (computedProgress < previousProgress && isStreakAgenda) {
        logUpdates = [
          ...logUpdates,
          `Secret Agenda streak dropped to ${computedProgress}: ${updatedSecretAgenda.title} (${computedProgress}/${target})`,
        ];
      }

      if (isCompleted && !updatedSecretAgenda.completed) {
        logUpdates = [...logUpdates, `Secret Agenda complete: ${updatedSecretAgenda.title}`];
      }

      if (!isCompleted && updatedSecretAgenda.completed) {
        logUpdates = [...logUpdates, `Secret Agenda progress lost: ${updatedSecretAgenda.title} (${computedProgress}/${target})`];
      }

      updatedSecretAgenda = {
        ...updatedSecretAgenda,
        progress: computedProgress,
        completed: isCompleted,
      };
    }
  }

  if (updatedAiSecretAgenda) {
    const snapshot = buildAgendaSnapshot(state, 'ai');
    const computedProgressRaw = Number(updatedAiSecretAgenda.checkProgress?.(snapshot) ?? updatedAiSecretAgenda.progress ?? 0);
    const computedProgress = Number.isFinite(computedProgressRaw)
      ? Math.max(0, computedProgressRaw)
      : updatedAiSecretAgenda.progress ?? 0;
    const previousProgress = updatedAiSecretAgenda.progress ?? 0;
    const target = updatedAiSecretAgenda.target ?? 0;
    const isCompleted = computedProgress >= target;

    if (computedProgress !== previousProgress || isCompleted !== updatedAiSecretAgenda.completed) {
      const isStreakAgenda = STREAK_AGENDA_IDS.has(updatedAiSecretAgenda.id);

      if (computedProgress > previousProgress) {
        const delta = computedProgress - previousProgress;
        if (updatedAiSecretAgenda.revealed) {
          const progressMessage = isStreakAgenda
            ? `AI secret agenda streak increased to ${computedProgress}/${target}`
            : `AI secret agenda advanced by ${delta}: ${computedProgress}/${target}`;
          logUpdates = [...logUpdates, progressMessage];
        }
      } else if (
        computedProgress < previousProgress &&
        updatedAiSecretAgenda.revealed &&
        isStreakAgenda
      ) {
        logUpdates = [
          ...logUpdates,
          `AI secret agenda streak dropped to ${computedProgress}/${target}`,
        ];
      }

      if (isCompleted && !updatedAiSecretAgenda.completed) {
        logUpdates = [...logUpdates, 'AI secret agenda completed!'];
      }

      if (!isCompleted && updatedAiSecretAgenda.completed && updatedAiSecretAgenda.revealed) {
        logUpdates = [
          ...logUpdates,
          `AI secret agenda progress lost: ${computedProgress}/${target}`,
        ];
      }

      updatedAiSecretAgenda = {
        ...updatedAiSecretAgenda,
        progress: computedProgress,
        completed: isCompleted,
      };
    }
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
  
  const [gameState, setGameState] = useState<GameState>({
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
        defense: state.defense,
        pressure: 0,
        contested: false,
        owner: 'neutral' as const,
        specialBonus: state.specialBonus,
        bonusValue: state.bonusValue,
      };
    }),
    currentEvents: [],
    eventManager,
    showNewspaper: false,
    log: [
      'Game started - Truth Seekers faction selected',
      'Starting Truth: 50%',
      'Cards drawn: 5',
      `AI Difficulty: ${aiDifficulty}`
    ],
    secretAgenda: {
      ...getRandomAgenda('truth'),
      progress: 0,
      completed: false,
      revealed: false
    },
    aiSecretAgenda: {
      ...getRandomAgenda('government'),
      progress: 0,
      completed: false,
      revealed: false
    },
    animating: false,
    aiTurnInProgress: false,
    selectedCard: null,
    targetState: null,
    aiStrategist: AIFactory.createStrategist(aiDifficulty),
    drawMode: 'standard',
    cardDrawState: {
      cardsPlayedLastTurn: 0,
      lastTurnWithoutPlay: false
    }
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
    // CRITICAL: Pass faction to deck generation
    const newDeck = generateWeightedDeck(40, faction);
    const startingHand = newDeck.slice(0, handSize);
    const initialControl = getInitialStateControl(faction);

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
      deck: newDeck.slice(handSize),
      // AI gets opposite faction cards
      aiHand: getRandomCards(handSize, { faction: faction === 'government' ? 'truth' : 'government' }),
      aiDeck: generateWeightedDeck(40, faction === 'government' ? 'truth' : 'government'),
      controlledStates: initialControl.player,
      aiControlledStates: initialControl.ai,
      isGameOver: false, // CRITICAL: Reset game over state
      phase: 'action', // Reset to proper starting phase
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
          defense: state.defense,
          pressure: 0,
          contested: false,
          owner,
          specialBonus: state.specialBonus,
          bonusValue: state.bonusValue,
        };
      }),
      log: [
        `Game started - ${faction} faction selected`,
        `Starting Truth: ${startingTruth}%`,
        `Starting IP: ${startingIP}`,
        `Cards drawn: ${handSize} (${drawMode} mode)`,
        `Controlled states: ${initialControl.player.join(', ')}`
      ],
      drawMode,
      cardDrawState: {
        cardsPlayedLastTurn: 0,
        lastTurnWithoutPlay: false
      }
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
        log: [...prev.log, ...resolution.logEntries]
      };

      return updateSecretAgendaProgress(nextState);
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
        log: [...prev.log, ...resolution.logEntries]
      };

      return updateSecretAgendaProgress(nextState);
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

  const endTurn = useCallback(() => {
    setGameState(prev => {
      // Don't allow turn ending if game is over
      if (prev.isGameOver) return prev;
      
      const isHumanTurn = prev.currentPlayer === 'human';
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
        // Human player ending turn - switch to AI (no card draw here anymore)
        // Card drawing will happen after newspaper at start of new turn

        // Calculate IP income from controlled states
        const stateIncome = getTotalIPFromStates(prev.controlledStates);
        const baseIncome = 5;
        const synergyIncome = prev.stateCombinationBonusIP;
        const neutralStates = prev.states.filter(state => state.owner === 'neutral').length;
        const comboEffectIncome = calculateDynamicIpBonus(
          prev.stateCombinationEffects,
          prev.controlledStates.length,
          neutralStates,
        );
        const totalIncome = baseIncome + stateIncome + synergyIncome + comboEffectIncome;

        // Update event manager with current turn
        prev.eventManager?.updateTurn(prev.turn);

        // Trigger random event using event manager gating
        let eventEffectLog: string[] = [];
        let truthModifier = 0;
        let ipModifier = 0;
        let bonusCardDraw = 0;
        let triggeredEvent: GameEvent | null = null;

        if (prev.eventManager) {
          triggeredEvent = prev.eventManager.maybeSelectRandomEvent(prev);
          if (triggeredEvent) {

            // Apply event effects
            if (triggeredEvent.effects) {
              const effects = triggeredEvent.effects;
              if (effects.truth) truthModifier = effects.truth;
              if (effects.ip) ipModifier = effects.ip;
              if (effects.cardDraw) bonusCardDraw = effects.cardDraw;

              eventEffectLog.push(`EVENT: ${triggeredEvent.title} triggered!`);
              if (effects.truth) eventEffectLog.push(`Truth ${effects.truth > 0 ? '+' : ''}${effects.truth}%`);
              if (effects.ip) eventEffectLog.push(`IP ${effects.ip > 0 ? '+' : ''}${effects.ip}`);
              if (effects.cardDraw) eventEffectLog.push(`Draw ${effects.cardDraw} extra cards`);
            }
          }
        }

        const newEvents = buildEditionEvents(prev, triggeredEvent);

        // Store pending card draw for after newspaper
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
          ...(comboEffectIncome > 0
            ? [`Combo effects bonus: +${comboEffectIncome} IP`]
            : []),
          `Total income: ${totalIncome + ipModifier} IP`,
          ...eventEffectLog,
          ...(comboDrawBonus > 0 ? [`Synergy draw bonus: +${comboDrawBonus} card${comboDrawBonus === 1 ? '' : 's'}`] : []),
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
            lastTurnWithoutPlay: prev.cardsPlayedThisTurn === 0
          },
          log: logEntries,
          turnPlays: [],
        };

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
        comboResult.logEntries.length > 0 ? [...prev.log, ...comboResult.logEntries] : [...prev.log];

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
        log: [...comboLog, 'AI turn completed']
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
  }, []);

  const playAICard = useCallback((params: AiCardPlayParams) => {
    return new Promise<GameState>(resolve => {
      setGameState(prev => {
        if (prev.isGameOver) {
          resolve(prev);
          return prev;
        }

        const result = applyAiCardPlay(prev, params, achievements);
        const nextStateWithAgendas = updateSecretAgendaProgress(result.nextState);

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
        log: [...prev.log, drawLogEntry]
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
    checkVictoryConditions
  };
};