import { useState, useCallback } from 'react';
import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE, getRandomCards } from '@/data/cardDatabase';
import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';
import { getRandomAgenda, SecretAgenda } from '@/data/agendaDatabase';
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
import {
  createEvidenceTrackState,
  createPublicFrenzyState,
  withTruthMomentum,
  consumeExpose,
  consumeObfuscate,
  clearHeadlineBonus,
  clearGovernmentInitiative,
  getMaxPlaysForTurn,
  resolveStateReference,
} from '@/game/momentum';
import { isFrontPageSlot, resolveFrontPageSlot } from '@/game/frontPage';

const omitClashKey = (key: string, value: unknown) => (key === 'clash' ? undefined : value);

const HAND_LIMIT = 5;

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

const sanitizeCardPlayRecord = (record: any): CardPlayRecord | null => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const card = record.card as GameCard | undefined;
  if (!card) {
    return null;
  }

  const slotCandidate = typeof record.frontPageSlot === 'string' ? record.frontPageSlot : null;
  const normalizedSlot = slotCandidate && isFrontPageSlot(slotCandidate)
    ? slotCandidate
    : resolveFrontPageSlot(card);

  return {
    card,
    player: record.player === 'ai' ? 'ai' : 'human',
    faction: record.faction === 'government' ? 'government' : 'truth',
    targetState: typeof record.targetState === 'string' ? record.targetState : null,
    truthDelta: typeof record.truthDelta === 'number' ? record.truthDelta : 0,
    ipDelta: typeof record.ipDelta === 'number' ? record.ipDelta : 0,
    aiIpDelta: typeof record.aiIpDelta === 'number' ? record.aiIpDelta : 0,
    capturedStates: Array.isArray(record.capturedStates) ? [...record.capturedStates] : [],
    damageDealt: typeof record.damageDealt === 'number' ? record.damageDealt : 0,
    round: typeof record.round === 'number' ? record.round : 0,
    turn: typeof record.turn === 'number' ? record.turn : 0,
    timestamp: typeof record.timestamp === 'number' ? record.timestamp : Date.now(),
    logEntries: Array.isArray(record.logEntries) ? [...record.logEntries] : [],
    frontPageSlot: normalizedSlot,
  };
};

const sanitizeCardPlayRecords = (records: unknown): CardPlayRecord[] => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map(entry => sanitizeCardPlayRecord(entry))
    .filter((entry): entry is CardPlayRecord => entry !== null);
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
    ip: 15,
    aiIP: 15,
    // Use all available cards to ensure proper deck building
    hand: getRandomCards(3, { faction: 'truth' }),
    aiHand: getRandomCards(3, { faction: 'government' }),
    isGameOver: false,
    deck: generateWeightedDeck(40, 'truth'),
    aiDeck: generateWeightedDeck(40, 'government'),
    cardsPlayedThisTurn: 0,
    cardsPlayedThisRound: [],
    comboTruthDeltaThisRound: 0,
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
    evidenceTrack: createEvidenceTrackState(),
    publicFrenzy: createPublicFrenzyState(50),
    log: [
      'Game started - Truth Seekers faction selected',
      'Starting Truth: 50%',
      'Cards drawn: 3',
      `AI Difficulty: ${aiDifficulty}`
    ],
    agenda: {
      ...getRandomAgenda('truth'),
      progress: 0,
      complete: false,
      revealed: false
    },
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
    const startingIP = faction === 'government' ? 20 : 10; // Player IP
    const aiStartingIP = faction === 'government' ? 10 : 20; // AI starts as the opposite faction
    
    // Get draw mode from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    const drawMode: DrawMode = savedSettings ? 
      (JSON.parse(savedSettings).drawMode || 'standard') : 'standard';
    
    const handSize = getStartingHandSize(drawMode, faction);
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
      evidenceTrack: createEvidenceTrackState(),
      publicFrenzy: createPublicFrenzyState(startingTruth),
      drawMode,
      cardDrawState: {
        cardsPlayedLastTurn: 0,
        lastTurnWithoutPlay: false
      }
    }));
  }, [achievements, aiDifficulty]);

  const finalizeHumanPlay = (
    prev: GameState,
    card: GameCard,
    targetState: string | null,
    baseResolution: CardPlayResolution,
  ): GameState => {
    const resolution = {
      ...baseResolution,
      logEntries: [...(baseResolution.logEntries ?? [])],
    };

    const exposeActive = prev.evidenceTrack.exposeReady && prev.evidenceTrack.exposeOwner === 'human';
    if (exposeActive) {
      resolution.ip = resolution.ip + 1;
      resolution.logEntries.push('Expose! Coupon clipped the tabloid budget (+1 IP).');
    }

    const initiativeActive = prev.publicFrenzy.governmentInitiativeActiveFor === 'human';
    if (initiativeActive) {
      resolution.ip = resolution.ip + 1;
      resolution.logEntries.push('Initiative bonus: bureaucracy fast-tracked +1 IP.');
    }

    const obfuscateActive = prev.evidenceTrack.obfuscateReady && prev.evidenceTrack.obfuscateOwner === 'human';
    let updatedDeck = prev.deck;
    let bonusCards: GameCard[] = [];
    if (obfuscateActive) {
      const drawResult = drawCardsFromDeck(updatedDeck, 1, prev.faction);
      bonusCards = drawResult.drawn;
      updatedDeck = drawResult.deck;
      if (bonusCards.length > 0) {
        resolution.logEntries.push('Obfuscate! Red tape unearthed a replacement dossier (+1 card).');
      }
    }

    const resolvedTargetInfo = resolveStateReference(prev, targetState);
    const momentumTarget = resolvedTargetInfo?.id ?? targetState ?? null;

    const playedCardRecord = createPlayedCardRecord({
      card,
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
      card,
      owner: 'human',
      targetState,
      resolution,
    });

    const handWithoutCard = prev.hand.filter(c => c.id !== card.id);
    let nextState: GameState = {
      ...prev,
      hand: bonusCards.length > 0 ? [...handWithoutCard, ...bonusCards] : handWithoutCard,
      deck: updatedDeck,
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
    };

    if (initiativeActive) {
      nextState = clearGovernmentInitiative(nextState, 'human');
    }

    if (exposeActive) {
      nextState = consumeExpose(nextState, 'human');
    }

    if (obfuscateActive) {
      nextState = consumeObfuscate(nextState, 'human');
    }

    const hadHeadlineBonus = prev.publicFrenzy.bonusHeadlineActiveFor === 'human';
    const previousMax = getMaxPlaysForTurn(prev, 'human');
    if (hadHeadlineBonus && prev.cardsPlayedThisTurn + 1 >= previousMax) {
      nextState = clearHeadlineBonus(nextState, 'human');
    }

    nextState = withTruthMomentum({
      previousTruth: prev.truth,
      newTruth: resolution.truth,
      state: nextState,
      actor: 'human',
      card,
      targetState: momentumTarget,
    });

    if (resolution.underReviewApplied && prev.publicFrenzy.governmentInitiativeActiveFor) {
      nextState = clearGovernmentInitiative(nextState, prev.publicFrenzy.governmentInitiativeActiveFor);
    }

    return nextState;
  };

  const playCard = useCallback((cardId: string, targetOverride?: string | null) => {
    setGameState(prev => {
      const card = prev.hand.find(c => c.id === cardId);
      const maxPlays = getMaxPlaysForTurn(prev, 'human');
      if (!card || prev.ip < card.cost || prev.cardsPlayedThisTurn >= maxPlays || prev.animating) {
        return prev;
      }

      achievements.onCardPlayed(cardId, card.type, card.rarity);

      const targetState = targetOverride ?? prev.targetState ?? null;
      const baseResolution = resolveCardEffects(prev, card, targetState);
      return finalizeHumanPlay(prev, card, targetState, baseResolution);
    });
  }, [achievements, resolveCardEffects]);

  const playCardAnimated = useCallback(async (
    cardId: string,
    animateCard: (cardId: string, card: any, options?: any) => Promise<any>,
    explicitTargetState?: string
  ) => {
    const card = gameState.hand.find(c => c.id === cardId);
    const maxPlays = getMaxPlaysForTurn(gameState, 'human');
    if (!card || gameState.ip < card.cost || gameState.cardsPlayedThisTurn >= maxPlays || gameState.animating) {
      return;
    }

    achievements.onCardPlayed(cardId, card.type, card.rarity);

    const targetState = explicitTargetState ?? gameState.targetState ?? null;
    let pendingResolution: CardPlayResolution | null = null;

    setGameState(prev => {
      if (prev.animating) {
        return prev;
      }

      const resolution = resolveCardEffects(prev, card, targetState);
      pendingResolution = resolution;

      return {
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
    });

    try {
      await animateCard(cardId, card, {
        targetState,
        onResolve: async () => Promise.resolve()
      });

      setGameState(prev => {
        const baseResolution = pendingResolution ?? resolveCardEffects(prev, card, targetState);
        const finalized = finalizeHumanPlay(prev, card, targetState ?? null, baseResolution);
        return {
          ...finalized,
          animating: false,
          selectedCard: null,
          targetState: null,
        };
      });
    } catch (error) {
      console.error('Card animation failed:', error);
      setGameState(prev => {
        const baseResolution = pendingResolution ?? resolveCardEffects(prev, card, targetState);
        const finalized = finalizeHumanPlay(prev, card, targetState ?? null, baseResolution);
        return {
          ...finalized,
          animating: false,
          selectedCard: null,
          targetState: null,
        };
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
        const totalIncome = baseIncome + stateIncome;

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
        const pendingCardDraw = bonusCardDraw;

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
          `Total income: ${totalIncome + ipModifier} IP`,
          ...eventEffectLog,
        ];

        const nextState: GameState = {
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
        nextState.log.push(`AI ${prev.aiStrategist?.personality.name} is thinking...`);

        let adjusted = nextState;
        if (nextState.publicFrenzy.bonusHeadlineActiveFor === 'human') {
          adjusted = clearHeadlineBonus(adjusted, 'human');
        }
        if (nextState.publicFrenzy.governmentInitiativeActiveFor === 'human') {
          adjusted = clearGovernmentInitiative(adjusted, 'human');
        }

        return adjusted;
      }

      const comboLog =
        comboResult.logEntries.length > 0 ? [...prev.log, ...comboResult.logEntries] : [...prev.log];

      let aiPhaseState: GameState = {
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

      if (aiPhaseState.publicFrenzy.bonusHeadlineActiveFor === 'ai') {
        aiPhaseState = clearHeadlineBonus(aiPhaseState, 'ai');
      }
      if (aiPhaseState.publicFrenzy.governmentInitiativeActiveFor === 'ai') {
        aiPhaseState = clearGovernmentInitiative(aiPhaseState, 'ai');
      }

      return aiPhaseState;
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

        resolve(result.nextState);
        return result.nextState;
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

      return {
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
      const cardsPlayedThisRound = sanitizeCardPlayRecords(saveData.cardsPlayedThisRound);
      const playHistory = sanitizeCardPlayRecords(saveData.playHistory);

      setGameState(prev => ({
        ...prev,
        ...saveData,
        turn: normalizedTurn,
        round: normalizedRound,
        cardsPlayedThisRound,
        playHistory,
        turnPlays: Array.isArray(saveData.turnPlays)
          ? saveData.turnPlays
          : [],
        comboTruthDeltaThisRound:
          typeof saveData.comboTruthDeltaThisRound === 'number' ? saveData.comboTruthDeltaThisRound : 0,
        evidenceTrack: saveData.evidenceTrack
          ? { ...createEvidenceTrackState(), ...saveData.evidenceTrack }
          : createEvidenceTrackState(),
        publicFrenzy: saveData.publicFrenzy
          ? { ...createPublicFrenzyState(saveData.truth ?? prev.truth ?? 50), ...saveData.publicFrenzy }
          : createPublicFrenzyState(saveData.truth ?? prev.truth ?? 50),
        // Ensure objects are properly reconstructed
        eventManager: prev.eventManager, // Keep the current event manager
        aiStrategist: prev.aiStrategist || AIFactory.createStrategist(saveData.aiDifficulty || 'medium')
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