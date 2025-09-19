import { useState, useCallback } from 'react';
import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE, getRandomCards } from '@/data/cardDatabase';
import { generateMixedDeck } from '@/lib/decks/generator';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';
import { getRandomAgenda, SecretAgenda } from '@/data/agendaDatabase';
import { AIStrategist, type AIDifficulty, type CardPlay } from '@/data/aiStrategy';
import { AIFactory } from '@/data/aiFactory';
import { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import { EventManager, type GameEvent } from '@/data/eventDatabase';
import { buildEditionEvents } from './eventEdition';
import { getStartingHandSize, type DrawMode, type CardDrawState } from '@/data/cardDrawingSystem';
import { useAchievements } from '@/contexts/AchievementContext';
import { resolveCardMVP, type CardPlayResolution } from '@/systems/cardResolution';
import { applyTruthDelta } from '@/utils/truth';
import type { Difficulty } from '@/ai';
import { getDifficulty } from '@/state/settings';
import { featureFlags } from '@/state/featureFlags';

interface GameState {
  faction: 'government' | 'truth';
  phase: 'income' | 'action' | 'capture' | 'event' | 'newspaper' | 'victory' | 'ai_turn' | 'card_presentation';
  turn: number;
  round: number;
  currentPlayer: 'human' | 'ai';
  aiDifficulty: AIDifficulty;
  aiPersonality?: string;
  truth: number;
  ip: number; // Player IP
  aiIP: number; // AI IP
  hand: GameCard[];
  aiHand: GameCard[];
  isGameOver: boolean;
  deck: GameCard[];
  aiDeck: GameCard[];
  cardsPlayedThisTurn: number;
  cardsPlayedThisRound: Array<{
    card: GameCard;
    player: 'human' | 'ai';
    targetState?: string | null;
    truthDelta?: number;
    capturedStates?: string[];
  }>;
  controlledStates: string[];
  aiControlledStates: string[];
  states: Array<{
    id: string;
    name: string;
    abbreviation: string;
    baseIP: number;
    defense: number;
    pressure: number;
    owner: 'player' | 'ai' | 'neutral';
    specialBonus?: string;
    bonusValue?: number;
    // Occupation data for ZONE takeovers
    occupierCardId?: string | null;
    occupierCardName?: string | null;
    occupierLabel?: string | null;
    occupierIcon?: string | null;
    occupierUpdatedAt?: number;
  }>;
  currentEvents: GameEvent[];
  eventManager?: EventManager;
  showNewspaper: boolean;
  log: string[];
  agenda?: SecretAgenda & {
    progress?: number;
    complete?: boolean;
    revealed?: boolean;
  };
  secretAgenda?: SecretAgenda & {
    progress: number;
    completed: boolean;
    revealed: boolean;
  };
  aiSecretAgenda?: SecretAgenda & {
    progress: number;
    completed: boolean;
    revealed: boolean;
  };
  animating: boolean;
  aiTurnInProgress: boolean;
  selectedCard: string | null;
  targetState: string | null;
  aiStrategist?: AIStrategist;
  pendingCardDraw?: number;
  newCards?: GameCard[];
  showNewCardsPresentation?: boolean;
  // Enhanced drawing system state
  drawMode: DrawMode;
  cardDrawState: CardDrawState;
}

const omitClashKey = (key: string, value: unknown) => (key === 'clash' ? undefined : value);

const HAND_LIMIT = 5;

const CAPTURE_REGEX = /(captured|seized)\s+([^!]+)!/i;

const extractCapturedStates = (logEntries: string[]): string[] => {
  const states: string[] = [];
  for (const entry of logEntries) {
    const match = entry.match(CAPTURE_REGEX);
    if (match) {
      states.push(match[2]);
    }
  }
  return states;
};

const createPlayedCardRecord = (params: {
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

const DIFFICULTY_TO_AI_DIFFICULTY: Record<Difficulty, AIDifficulty> = {
  EASY: 'easy',
  NORMAL: 'medium',
  HARD: 'hard',
  TOP_SECRET_PLUS: 'legendary',
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
      const replenished = generateMixedDeck({ faction, deckSize: 40 }).deck;
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
    truth: 60,
    ip: 15,
    aiIP: 15,
    // Use all available cards to ensure proper deck building
    hand: getRandomCards(3, { faction: 'truth' }),
    aiHand: getRandomCards(3, { faction: 'government' }),
    isGameOver: false,
    deck: generateMixedDeck({ faction: 'truth', deckSize: 40 }).deck,
    aiDeck: generateMixedDeck({ faction: 'government', deckSize: 40 }).deck,
    cardsPlayedThisTurn: 0,
    cardsPlayedThisRound: [],
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
        owner: 'neutral' as const,
        specialBonus: state.specialBonus,
        bonusValue: state.bonusValue
      };
    }),
    currentEvents: [],
    eventManager,
    showNewspaper: false,
    log: [
      'Game started - Truth Seekers faction selected',
      'Starting Truth: 60%',
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
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10; // Player IP
    const aiStartingIP = faction === 'government' ? 10 : 20; // AI starts as the opposite faction
    
    // Get draw mode from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    const drawMode: DrawMode = savedSettings ? 
      (JSON.parse(savedSettings).drawMode || 'standard') : 'standard';
    
    const handSize = getStartingHandSize(drawMode, faction);
    // CRITICAL: Pass faction to deck generation
    const newDeck = generateMixedDeck({ faction, deckSize: 40 }).deck;
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
      aiDeck: generateMixedDeck({
        faction: faction === 'government' ? 'truth' : 'government',
        deckSize: 40,
      }).deck,
      controlledStates: initialControl.player,
      aiControlledStates: initialControl.ai,
      isGameOver: false, // CRITICAL: Reset game over state
      phase: 'action', // Reset to proper starting phase
      turn: 1,
      round: 1,
      cardsPlayedThisTurn: 0,
      cardsPlayedThisRound: [],
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
          owner,
          specialBonus: state.specialBonus,
          bonusValue: state.bonusValue
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
      if (!card || prev.ip < card.cost || prev.cardsPlayedThisTurn >= 3 || prev.animating) {
        return prev;
      }

      achievements.onCardPlayed(cardId, card.type);

      const targetState = targetOverride ?? prev.targetState ?? null;
      const resolution = resolveCardEffects(prev, card, targetState);
      const playedCardRecord = createPlayedCardRecord({
        card,
        player: 'human',
        targetState,
        resolution,
        previousTruth: prev.truth,
      });

      return {
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
        targetState: resolution.targetState,
        selectedCard: resolution.selectedCard,
        log: [...prev.log, ...resolution.logEntries]
      };
    });
  }, [achievements, resolveCardEffects]);

  const playCardAnimated = useCallback(async (
    cardId: string,
    animateCard: (cardId: string, card: any, options?: any) => Promise<any>,
    explicitTargetState?: string
  ) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || gameState.ip < card.cost || gameState.cardsPlayedThisTurn >= 3 || gameState.animating) {
      return;
    }

    achievements.onCardPlayed(cardId, card.type);

    const targetState = explicitTargetState ?? gameState.targetState ?? null;
    let pendingRecord: ReturnType<typeof createPlayedCardRecord> | null = null;

    setGameState(prev => {
      if (prev.animating) {
        return prev;
      }

      const resolution = resolveCardEffects(prev, card, targetState);
      pendingRecord = createPlayedCardRecord({
        card,
        player: 'human',
        targetState,
        resolution,
        previousTruth: prev.truth,
      });

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
        const record = pendingRecord ?? { card, player: 'human', targetState };
        return {
          ...prev,
          hand: prev.hand.filter(c => c.id !== cardId),
          cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
          cardsPlayedThisRound: [...prev.cardsPlayedThisRound, record],
          selectedCard: null,
          targetState: null,
          animating: false,
        };
      });
    } catch (error) {
      console.error('Card animation failed:', error);
      setGameState(prev => {
        const record = pendingRecord ?? { card, player: 'human', targetState };
        return {
          ...prev,
          hand: prev.hand.filter(c => c.id !== cardId),
          cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
          cardsPlayedThisRound: [...prev.cardsPlayedThisRound, record],
          selectedCard: null,
          targetState: null,
          animating: false,
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
      
      if (prev.currentPlayer === 'human') {
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
        
        const logEntries = [
          ...prev.log,
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
          truth: prev.truth,
          ip: prev.ip + totalIncome + ipModifier,
          pendingCardDraw,
          currentEvents: newEvents,
          cardDrawState: {
            cardsPlayedLastTurn: prev.cardsPlayedThisTurn,
            lastTurnWithoutPlay: prev.cardsPlayedThisTurn === 0
          },
          log: logEntries,
        };

        applyTruthDelta(nextState, truthModifier, 'human');
        nextState.log.push(`AI ${prev.aiStrategist?.personality.name} is thinking...`);

        return nextState;
      } else {
        // AI turn ending - switch back to human
        return {
          ...prev,
          phase: 'newspaper',
          currentPlayer: 'human',
          showNewspaper: true,
          log: [...prev.log, `AI turn completed`]
        };
      }
    });
  }, []);

  // AI Turn Management
  const executeAITurn = useCallback(async () => {
    // Prevent re-entrancy or accidental multiple triggers
    if (!gameState.aiStrategist || gameState.currentPlayer !== 'ai' || gameState.aiTurnInProgress) return;

    // Mark AI turn as in progress
    setGameState(prev => ({ ...prev, aiTurnInProgress: true }));

    const currentGameState = gameState; // Capture current state
    
    // AI income phase
    const aiControlledStates = currentGameState.states
      .filter(state => state.owner === 'ai')
      .map(state => state.abbreviation);
      
    const aiStateIncome = getTotalIPFromStates(aiControlledStates);
    const aiBaseIncome = 5;
    const aiTotalIncome = aiBaseIncome + aiStateIncome;

    const aiFaction = currentGameState.faction === 'government' ? 'truth' : 'government';
    const aiCardsNeeded = Math.max(0, HAND_LIMIT - currentGameState.aiHand.length);
    const {
      drawn: aiDrawnCards,
      deck: aiRemainingDeck,
    } = drawCardsFromDeck(currentGameState.aiDeck, aiCardsNeeded, aiFaction);
    const aiHandSizeAfterDraw = currentGameState.aiHand.length + aiDrawnCards.length;

    // Update state with AI income and cards
    setGameState(prev => ({
      ...prev,
      aiHand: [...prev.aiHand, ...aiDrawnCards],
      aiDeck: aiRemainingDeck,
      // AI IP income
      aiIP: prev.aiIP + aiTotalIncome,
      log: [...prev.log,
        `AI Income: ${aiBaseIncome} base + ${aiStateIncome} from ${aiControlledStates.length} states = ${aiTotalIncome} IP`,
        `AI drew ${aiDrawnCards.length} card${aiDrawnCards.length === 1 ? '' : 's'} (hand ${aiHandSizeAfterDraw}/${HAND_LIMIT})`
      ]
    }));

    // Give AI time to "think" (for better UX)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // AI plays cards
    let cardsPlayed = 0;
    const maxCardsPerTurn = 3;

    while (cardsPlayed < maxCardsPerTurn) {
      // Get fresh game state for each card play
      const freshState = await new Promise<GameState>(resolve => {
        setGameState(prev => {
          resolve(prev);
          return prev;
        });
      });

      if (!freshState.aiStrategist || freshState.aiHand.length === 0) break;

      const baseStrategistView = {
        ...freshState,
        // Provide AI-relative IP metric expected by strategist (negative = player advantage)
        ip: -freshState.ip,
        hand: freshState.aiHand,
        aiHand: freshState.aiHand,
        controlledStates: freshState.states
          .filter(state => state.owner === 'ai')
          .map(state => state.abbreviation)
      };

      const attemptedCardIds = new Set<string>();
      let selectedPlay: CardPlay | null = null;
      let selectedCard: GameCard | undefined;
      let selectedStrategyDetails: string[] | undefined;
      let stopPlaying = false;

      while (!stopPlaying && attemptedCardIds.size < freshState.aiHand.length) {
        const availableHand = freshState.aiHand.filter(card => !attemptedCardIds.has(card.id));
        if (availableHand.length === 0) {
          break;
        }

        const strategistView = {
          ...baseStrategistView,
          hand: availableHand,
          aiHand: availableHand,
        };

        if (freshState.aiStrategist instanceof EnhancedAIStrategist) {
          const enhancedPlay = freshState.aiStrategist.selectOptimalPlay(strategistView);

          if (!enhancedPlay || enhancedPlay.priority < 0.3) {
            stopPlaying = true;
            break;
          }

          const candidateCard = availableHand.find(card => card.id === enhancedPlay.cardId);
          if (!candidateCard) {
            attemptedCardIds.add(enhancedPlay.cardId);
            continue;
          }

          if (freshState.aiIP < candidateCard.cost) {
            attemptedCardIds.add(candidateCard.id);
            continue;
          }

          const details: string[] = [];
          const { synergies, deceptionValue, threatResponse } = enhancedPlay;

          if (synergies?.length) {
            const synergyDescriptions = synergies.map(synergy => synergy.description).join(', ');
            details.push(`AI Synergy Bonus: ${synergyDescriptions}`);
          }

          if (deceptionValue > 0) {
            details.push(`Deception tactics engaged (${Math.round(deceptionValue * 100)}% intensity)`);
          }

          if (threatResponse) {
            details.push('Countering recent player action.');
          }

          const adaptiveSummary = freshState.aiStrategist.getAdaptiveSummary();
          if (adaptiveSummary.length) {
            details.push(...adaptiveSummary);
          }

          selectedPlay = enhancedPlay;
          selectedCard = candidateCard;
          selectedStrategyDetails = details.length > 0 ? details : undefined;
          break;
        }

        const basicPlay = freshState.aiStrategist.selectBestPlay(strategistView);

        if (!basicPlay || basicPlay.priority < 0.3) {
          stopPlaying = true;
          break;
        }

        const candidateCard = availableHand.find(card => card.id === basicPlay.cardId);
        if (!candidateCard) {
          attemptedCardIds.add(basicPlay.cardId);
          continue;
        }

        if (freshState.aiIP < candidateCard.cost) {
          attemptedCardIds.add(candidateCard.id);
          continue;
        }

        selectedPlay = basicPlay;
        selectedCard = candidateCard;
        selectedStrategyDetails = undefined;
        break;
      }

      if (stopPlaying || !selectedPlay || !selectedCard) break;

      await playAICard(
        selectedPlay.cardId,
        selectedPlay.targetState,
        selectedPlay.reasoning,
        selectedStrategyDetails,
      );
      cardsPlayed++;

      // Brief pause between AI card plays
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }

    // End AI turn
    setTimeout(() => {
      endTurn();
      // Clear in-progress flag after AI ends turn
      setGameState(prev => ({ ...prev, aiTurnInProgress: false }));
    }, 1000);
  }, [gameState]);

  const playAICard = useCallback((
    cardId: string,
    targetState?: string,
    reasoning?: string,
    strategyDetails?: string[],
  ) => {
    const card = gameState.aiHand.find(c => c.id === cardId);
    if (!card) return;

    if (typeof window !== "undefined" && window.uiShowOpponentCard) {
      window.uiShowOpponentCard(card);
    }

    setGameState(prev => {
      const resolution = resolveCardMVP(prev, card, targetState ?? null, 'ai', achievements);
      const logEntries = [...prev.log, ...resolution.logEntries];
      const strategyLogEntries = buildStrategyLogEntries(reasoning, strategyDetails);

      if (strategyLogEntries.length) {
        logEntries.push(...strategyLogEntries);
      }

      if (!featureFlags.aiVerboseStrategyLog && (reasoning || strategyDetails?.length)) {
        debugStrategyToConsole(reasoning, strategyDetails);
      }

      if (prev.aiStrategist instanceof EnhancedAIStrategist) {
        prev.aiStrategist.recordAiPlayOutcome({
          card,
          targetState,
          resolution,
          previousState: prev,
        });
      }

      const playedCardRecord = createPlayedCardRecord({
        card,
        player: 'ai',
        targetState,
        resolution,
        previousTruth: prev.truth,
      });

      return {
        ...prev,
        ip: resolution.ip,
        aiIP: resolution.aiIP,
        truth: resolution.truth,
        states: resolution.states,
        controlledStates: resolution.controlledStates,
        aiControlledStates: resolution.aiControlledStates,
        targetState: resolution.targetState,
        aiHand: prev.aiHand.filter(c => c.id !== cardId),
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, playedCardRecord],
        log: logEntries,
      };
    });
  }, [achievements, gameState]);

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
    if (state.truth >= 90 && state.faction === 'truth') {
      victoryType = 'truth_high';
      playerWon = true;
    } else if (state.truth <= 10 && state.faction === 'government') {
      victoryType = 'truth_low';
      playerWon = true;
    }
    // Territorial victory (10+ states)
    else if (state.controlledStates.length >= 10) {
      victoryType = 'territorial';
      playerWon = true;
    }
    // Economic victory (200+ IP)
    else if (state.ip >= 200) {
      victoryType = 'economic';
      playerWon = true;
    }
    // Secret agenda completion
    else if (state.secretAgenda?.completed) {
      victoryType = 'agenda';
      playerWon = true;
    }
    // AI victory conditions (similar checks for AI)
    else if (state.aiIP >= 200 || state.controlledStates.filter(s => state.states.find(st => st.abbreviation === s)?.owner === 'ai').length >= 10) {
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
    } else if (!playerWon && (state.aiIP >= 200 || state.truth <= 0 || state.truth >= 100)) {
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

      // Validate save data structure
      if (!saveData.faction || !saveData.phase || saveData.version !== '1.0') {
        console.warn('Invalid or incompatible save data');
        return false;
      }
      
      // Reconstruct the game state
      setGameState(prev => ({
        ...prev,
        ...saveData,
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
      return {
        faction: saveData.faction,
        turn: saveData.turn,
        round: saveData.round,
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