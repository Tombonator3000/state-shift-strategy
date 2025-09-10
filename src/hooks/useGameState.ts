import { useState, useCallback } from 'react';
import type { GameCard } from '@/components/game/GameHand';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { extensionManager } from '@/data/extensionSystem';
import { TRUTH_SEEKERS_CARDS, GOVERNMENT_CARDS } from '@/data/factionCards';
import { generateRandomDeck, getRandomCards } from '@/data/cardDatabase';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';
import { getRandomAgenda, SecretAgenda } from '@/data/agendaDatabase';
import { AIStrategist, type AIDifficulty } from '@/data/aiStrategy';
import { AIFactory } from '@/data/aiFactory';
import { EventManager, type GameEvent, EVENT_DATABASE } from '@/data/eventDatabase';

interface GameState {
  faction: 'government' | 'truth';
  phase: 'income' | 'action' | 'capture' | 'event' | 'newspaper' | 'victory' | 'ai_turn' | 'card_presentation';
  turn: number;
  currentPlayer: 'human' | 'ai';
  aiDifficulty: AIDifficulty;
  aiPersonality?: string;
  truth: number;
  ip: number; // Player IP
  aiIP: number; // AI IP
  hand: GameCard[];
  aiHand: GameCard[];
  deck: GameCard[];
  aiDeck: GameCard[];
  cardsPlayedThisTurn: number;
  cardsPlayedThisRound: Array<{ card: GameCard; player: 'human' | 'ai' }>;
  controlledStates: string[];
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
  }>;
  currentEvents: GameEvent[];
  eventManager?: EventManager;
  showNewspaper: boolean;
  log: string[];
  secretAgenda: SecretAgenda & {
    progress: number;
    completed: boolean;
    revealed: boolean;
  };
  aiSecretAgenda: SecretAgenda & {
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
}

const generateInitialEvents = (eventManager: EventManager): GameEvent[] => {
  // Start with some common events for the first newspaper
  const initialEvents = EVENT_DATABASE.filter(event => 
    event.rarity === 'common' && !event.conditions
  ).slice(0, 3);
  
  return initialEvents;
};

export const useGameState = (aiDifficulty: AIDifficulty = 'medium') => {
  const [eventManager] = useState(() => new EventManager());
  
  const [gameState, setGameState] = useState<GameState>({
    faction: 'truth',
    phase: 'action',
    turn: 1,
    currentPlayer: 'human',
    aiDifficulty,
    truth: 60,
    ip: 15,
    aiIP: 15,
    hand: getRandomCards(3),
    aiHand: getRandomCards(3),
    deck: generateRandomDeck(40),
    aiDeck: generateRandomDeck(40),
    cardsPlayedThisTurn: 0,
    cardsPlayedThisRound: [],
    controlledStates: [],
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
    currentEvents: generateInitialEvents(eventManager),
    eventManager,
    showNewspaper: false,
    log: [
      'Game started - Truth Seekers faction selected',
      'Starting Truth: 60%',
      'Cards drawn: 3',
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
    aiStrategist: AIFactory.createStrategist(aiDifficulty)
  });

  const initGame = useCallback((faction: 'government' | 'truth') => {
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10; // Player IP
    const aiStartingIP = faction === 'government' ? 10 : 20; // AI starts as the opposite faction
    const handSize = faction === 'truth' ? 4 : 3;
    const newDeck = generateRandomDeck(40);
    const startingHand = newDeck.slice(0, handSize);
    const initialControl = getInitialStateControl(faction);

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
      aiIP: aiStartingIP,
      hand: startingHand,
      deck: newDeck.slice(handSize),
      controlledStates: initialControl.player,
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
        `Cards drawn: ${handSize}`,
        `Controlled states: ${initialControl.player.join(', ')}`
      ]
      ,
      aiTurnInProgress: false
    }));
  }, []);

  const playCard = useCallback((cardId: string) => {
    setGameState(prev => {
      const card = prev.hand.find(c => c.id === cardId);
      if (!card || prev.ip < card.cost || prev.cardsPlayedThisTurn >= 3 || prev.animating) {
        return prev;
      }

      const newHand = prev.hand.filter(c => c.id !== cardId);
      let newTruth = prev.truth;
      let newIP = prev.ip - card.cost;
      const newLog = [...prev.log];

      // Apply card effects
      let newStates = [...prev.states];
      
      switch (card.type) {
        case 'MEDIA':
          // Truth Seekers gain truth, Government loses enemy truth
          if (prev.faction === 'truth') {
            newTruth = Math.min(100, prev.truth + 12);
            newLog.push(`${card.name} played: Truth +12% (now ${newTruth}%)`);
          } else {
            newTruth = Math.max(0, prev.truth - 10);
            newLog.push(`${card.name} played: Truth manipulation (now ${newTruth}%)`);
          }
          break;
        case 'ZONE':
          if (prev.targetState) {
            const stateIndex = newStates.findIndex(s => 
              s.abbreviation === prev.targetState || 
              s.id === prev.targetState ||
              s.name === prev.targetState
            );
            if (stateIndex !== -1) {
              // Parse pressure value from card text
              const pressureMatch = card.text.match(/\+(\d+) Pressure/);
              const pressureGain = pressureMatch ? parseInt(pressureMatch[1]) : 1;
              newStates[stateIndex] = {
                ...newStates[stateIndex],
                pressure: newStates[stateIndex].pressure + pressureGain
              };
              
              // Check if state is captured
              if (newStates[stateIndex].pressure >= newStates[stateIndex].defense) {
                newStates[stateIndex].owner = 'player';
                newLog.push(`🚨 ${card.name} captured ${newStates[stateIndex].name}! (+${pressureGain} pressure)`);
                
                // Update controlled states list
                const newControlledStates = [...prev.controlledStates];
                const stateKey = newStates[stateIndex].abbreviation;
                if (!newControlledStates.includes(stateKey)) {
                  newControlledStates.push(stateKey);
                }
                return {
                  ...prev,
                  hand: newHand,
                  ip: newIP,
                  truth: newTruth,
                  states: newStates,
                  controlledStates: newControlledStates,
                  cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
                  cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
                  targetState: null, // Clear selection after use
                  selectedCard: null, // Clear card selection
                  log: [...prev.log, ...newLog]
                };
              } else {
                newLog.push(`${card.name} added pressure to ${newStates[stateIndex].name} (+${pressureGain}, ${newStates[stateIndex].pressure}/${newStates[stateIndex].defense})`);
              }
            } else {
              newLog.push(`${card.name} played: No valid target selected`);
            }
          } else {
            newLog.push(`${card.name} played: Select a target state first!`);
          }
          break;
        case 'ATTACK':
          // Attack cards damage AI IP
          const damage = 8 + Math.floor(Math.random() * 6); // 8-13 damage
          const newAIIP = Math.max(0, prev.aiIP - damage);
          newLog.push(`${card.name} played: Attack dealt ${damage} IP damage to AI (${prev.aiIP} → ${newAIIP})`);
          return {
            ...prev,
            hand: newHand,
            ip: newIP,
            truth: newTruth,
            states: newStates,
            aiIP: newAIIP,
            cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
            cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
            log: [...prev.log, ...newLog]
          };
        case 'DEFENSIVE':
          // Defensive cards reduce pressure on player-controlled states
          const playerStates = newStates.filter(s => s.owner === 'player' && s.pressure > 0);
          if (playerStates.length > 0) {
            const randomState = playerStates[Math.floor(Math.random() * playerStates.length)];
            const stateIndex = newStates.findIndex(s => s.id === randomState.id);
            const pressureReduction = 1;
            newStates[stateIndex] = {
              ...newStates[stateIndex],
              pressure: Math.max(0, newStates[stateIndex].pressure - pressureReduction)
            };
            newLog.push(`${card.name} played: Reduced pressure on ${randomState.name} (-${pressureReduction})`);
          } else {
            newLog.push(`${card.name} played: Defense prepared (no active threats)`);
          }
          break;
        default:
          newLog.push(`${card.name} played: Effect activated`);
          break;
      }

      return {
        ...prev,
        hand: newHand,
        ip: newIP,
        truth: newTruth,
        states: newStates,
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
        targetState: card.type === 'ZONE' ? prev.targetState : null, // Keep target for zone cards, clear for others
        log: [...prev.log, ...newLog]
      };
    });
  }, []);

  const playCardAnimated = useCallback(async (
    cardId: string,
    animateCard: (cardId: string, card: any, options?: any) => Promise<any>,
    explicitTargetState?: string
  ) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || gameState.ip < card.cost || gameState.cardsPlayedThisTurn >= 3 || gameState.animating) {
      return;
    }

    // Set animating state
    setGameState(prev => ({ ...prev, animating: true }));

    try {
      // Pay cost upfront and set target state if provided
      setGameState(prev => ({ 
        ...prev, 
        ip: prev.ip - card.cost, 
        ...(explicitTargetState ? { targetState: explicitTargetState } : {})
      }));

      // Run animation with resolve callback
      await animateCard(cardId, card, {
        targetState: explicitTargetState ?? gameState.targetState,
        onResolve: async (resolveCard: any) => {
            // Apply card effects during animation
            setGameState(prev => {
              let newTruth = prev.truth;
              let newStates = [...prev.states];
              let newControlledStates = [...prev.controlledStates];
              let newAIIP = prev.aiIP;
              const newLog = [...prev.log];

              switch (resolveCard.type) {
                case 'MEDIA':
                  if (prev.faction === 'truth') {
                    newTruth = Math.min(100, prev.truth + 12);
                    newLog.push(`${resolveCard.name} played: Truth +12% (now ${newTruth}%)`);
                  } else {
                    newTruth = Math.max(0, prev.truth - 10);
                    newLog.push(`${resolveCard.name} played: Truth manipulation (now ${newTruth}%)`);
                  }
                  break;
                case 'ZONE':
                  if (prev.targetState) {
                    const stateIndex = newStates.findIndex(s => s.abbreviation === prev.targetState);
                    if (stateIndex !== -1) {
                      // Parse pressure value from card text
                      const pressureMatch = resolveCard.text.match(/\+(\d+) Pressure/);
                      const pressureGain = pressureMatch ? parseInt(pressureMatch[1]) : 1;
                      newStates[stateIndex] = {
                        ...newStates[stateIndex],
                        pressure: newStates[stateIndex].pressure + pressureGain
                      };
                      
                      if (newStates[stateIndex].pressure >= newStates[stateIndex].defense) {
                        newStates[stateIndex].owner = 'player';
                        if (!newControlledStates.includes(prev.targetState)) {
                          newControlledStates.push(prev.targetState);
                        }
                        newLog.push(`🚨 ${resolveCard.name} captured ${newStates[stateIndex].name}! (+${pressureGain} pressure)`);
                      } else {
                        newLog.push(`${resolveCard.name} added pressure to ${newStates[stateIndex].name} (+${pressureGain}, ${newStates[stateIndex].pressure}/${newStates[stateIndex].defense})`);
                      }
                    }
                  } else {
                    newLog.push(`${resolveCard.name} played: Select a target state first!`);
                  }
                  break;
                case 'ATTACK':
                  const damage = 8 + Math.floor(Math.random() * 6);
                  newAIIP = Math.max(0, prev.aiIP - damage);
                  newLog.push(`${resolveCard.name} played: Attack dealt ${damage} IP damage to AI`);
                  break;
                case 'DEFENSIVE':
                  const playerStates = newStates.filter(s => s.owner === 'player' && s.pressure > 0);
                  if (playerStates.length > 0) {
                    const randomState = playerStates[Math.floor(Math.random() * playerStates.length)];
                    const stateIndex = newStates.findIndex(s => s.id === randomState.id);
                    newStates[stateIndex] = {
                      ...newStates[stateIndex],
                      pressure: Math.max(0, newStates[stateIndex].pressure - 1)
                    };
                    newLog.push(`${resolveCard.name} played: Reduced pressure on ${randomState.name}`);
                  } else {
                    newLog.push(`${resolveCard.name} played: Defense prepared`);
                  }
                  break;
              }

              return {
                ...prev,
                truth: newTruth,
                states: newStates,
                controlledStates: newControlledStates,
                aiIP: newAIIP,
                log: newLog
              };
            });
        }
      });

      // Remove from hand and cleanup
      setGameState(prev => ({
        ...prev,
        hand: prev.hand.filter(c => c.id !== cardId),
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
        selectedCard: null,
        targetState: null,
        animating: false
      }));

    } catch (error) {
      console.error('Card animation failed:', error);
      // Fallback to regular card play
      playCard(cardId);
      setGameState(prev => ({ ...prev, animating: false }));
    }
  }, [gameState, playCard]);

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
      if (prev.currentPlayer === 'human') {
        // Human player ending turn - switch to AI (no card draw here anymore)
        // Card drawing will happen after newspaper at start of new turn
        
        // Calculate IP income from controlled states
        const stateIncome = getTotalIPFromStates(prev.controlledStates);
        const baseIncome = 5;
        const totalIncome = baseIncome + stateIncome;

        // Update event manager with current turn
        prev.eventManager?.updateTurn(prev.turn);

        // Trigger random event (30% chance)
        let newEvents = [...prev.currentEvents];
        let eventEffectLog: string[] = [];
        let truthModifier = 0;
        let ipModifier = 0;
        let bonusCardDraw = 0;
        
        if (Math.random() < 0.3 && prev.eventManager) {
          const triggeredEvent = prev.eventManager.selectRandomEvent(prev);
          if (triggeredEvent) {
            newEvents = [triggeredEvent];
            
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

        // Store pending card draw for after newspaper
        const pendingCardDraw = bonusCardDraw;
        
        return {
          ...prev,
          turn: prev.turn + 1,
          phase: 'ai_turn',
          currentPlayer: 'ai',
          showNewspaper: false,
          cardsPlayedThisTurn: 0,
          truth: Math.max(0, Math.min(100, prev.truth + truthModifier)),
          ip: prev.ip + totalIncome + ipModifier,
          pendingCardDraw,
          currentEvents: newEvents,
          log: [...prev.log, 
            `Turn ${prev.turn} ended`, 
            `Base income: ${baseIncome} IP`,
            `State income: ${stateIncome} IP (${prev.controlledStates.length} states)`,
            `Total income: ${totalIncome + ipModifier} IP`, 
            ...eventEffectLog,
            `AI ${prev.aiStrategist?.personality.name} is thinking...`
          ]
        };
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

    // AI draws cards (correct hand limit of 7)
    const aiCardsToDraw = Math.max(0, Math.min(1, 7 - currentGameState.aiHand.length)); // Draw 1 card if under limit
    const aiDrawnCards = currentGameState.aiDeck.slice(0, aiCardsToDraw);
    const aiRemainingDeck = currentGameState.aiDeck.slice(aiCardsToDraw);

    // Update state with AI income and cards
    setGameState(prev => ({
      ...prev,
      aiHand: [...prev.aiHand, ...aiDrawnCards],
      aiDeck: aiRemainingDeck,
      // AI IP income
      aiIP: prev.aiIP + aiTotalIncome,
      log: [...prev.log,
        `AI Income: ${aiBaseIncome} base + ${aiStateIncome} from ${aiControlledStates.length} states = ${aiTotalIncome} IP`,
        `AI drew ${aiCardsToDraw} cards`
      ]
    }));

    // Give AI time to "think" (for better UX)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // AI plays cards
    let cardsPlayed = 0;
    const maxCardsPerTurn = 3;

    for (let i = 0; i < maxCardsPerTurn; i++) {
      // Get fresh game state for each card play
      const freshState = await new Promise<GameState>(resolve => {
        setGameState(prev => {
          resolve(prev);
          return prev;
        });
      });
      
      if (!freshState.aiStrategist || freshState.aiHand.length === 0) break;

      const bestPlay = freshState.aiStrategist.selectBestPlay({
        ...freshState,
        // Provide AI-relative IP metric expected by strategist (negative = player advantage)
        ip: -freshState.ip,
        hand: freshState.aiHand,
        controlledStates: freshState.states
          .filter(state => state.owner === 'ai')
          .map(state => state.abbreviation)
      });

      if (!bestPlay || bestPlay.priority < 0.3) break; // AI decides not to play more cards

      const cardToPlay = freshState.aiHand.find(c => c.id === bestPlay.cardId);
      if (!cardToPlay) break;
      if (freshState.aiIP < cardToPlay.cost) continue; // Can't afford, try next

      await playAICard(bestPlay.cardId, bestPlay.targetState, bestPlay.reasoning);
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

  const playAICard = useCallback(async (cardId: string, targetState?: string, reasoning?: string) => {
    const card = gameState.aiHand.find(c => c.id === cardId);
    if (!card) return;

    setGameState(prev => {
      let newTruth = prev.truth;
      let newStates = [...prev.states];
      const newLog = [...prev.log];

      // Apply card effects
      switch (card.type) {
        case 'MEDIA':
          // AI government faction tries to lower truth
          newTruth = Math.max(0, prev.truth - 12);
          newLog.push(`AI played ${card.name}: Truth manipulation (${prev.truth}% → ${newTruth}%)`);
          break;
        case 'ZONE':
          if (targetState) {
            const stateIndex = newStates.findIndex(s => s.abbreviation === targetState);
            if (stateIndex !== -1) {
              // Parse pressure value from card text
              const pressureMatch = card.text.match(/\+(\d+) Pressure/);
              const pressureGain = pressureMatch ? parseInt(pressureMatch[1]) : 1;
              
              newStates[stateIndex] = {
                ...newStates[stateIndex],
                pressure: newStates[stateIndex].pressure + pressureGain,
                owner: newStates[stateIndex].pressure + pressureGain >= newStates[stateIndex].defense ? 'ai' : newStates[stateIndex].owner
              };
              newLog.push(`AI played ${card.name} on ${targetState}: Added pressure (+${pressureGain})`);
              if (newStates[stateIndex].owner === 'ai') {
                newLog.push(`🚨 AI captured ${newStates[stateIndex].name}!`);
              }
            }
          }
          break;
        case 'ATTACK':
          const damage = 15 + Math.floor(Math.random() * 10);
          newLog.push(`AI played ${card.name}: Attack for ${damage} IP damage`);
          // Player loses IP (which is positive), so we subtract
          const newIP = Math.max(0, prev.ip - damage);
          if (reasoning) newLog.push(`AI Strategy: ${reasoning}`);
          return {
            ...prev,
            truth: newTruth,
            states: newStates,
            ip: newIP,
            aiIP: Math.max(0, prev.aiIP - card.cost),
            aiHand: prev.aiHand.filter(c => c.id !== cardId),
            cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'ai' }],
            log: newLog
          };
        case 'DEFENSIVE':
          newLog.push(`AI played ${card.name}: Defensive preparations`);
          break;
      }

      if (reasoning) newLog.push(`AI Strategy: ${reasoning}`);

      return {
        ...prev,
        truth: newTruth,
        states: newStates,
        aiIP: Math.max(0, prev.aiIP - card.cost),
        aiHand: prev.aiHand.filter(c => c.id !== cardId),
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'ai' }],
        log: newLog
      };
    });
  }, [gameState]);

  const closeNewspaper = useCallback(() => {
    setGameState(prev => {
      // Draw cards after newspaper closes (proper timing)
      const maxHandSize = 7; // Correct hand limit as per rules
      const currentHandSize = prev.hand.length;
      const baseCardDraw = Math.max(0, Math.min(1, maxHandSize - currentHandSize)); // Draw 1 card if under limit
      const bonusCardDraw = prev.pendingCardDraw || 0;
      const totalCardsToDraw = baseCardDraw + bonusCardDraw;
      
      if (totalCardsToDraw > 0) {
        const drawnCards = prev.deck.slice(0, totalCardsToDraw);
        const remainingDeck = prev.deck.slice(totalCardsToDraw);
        
        return {
          ...prev,
          showNewspaper: false,
          cardsPlayedThisRound: [], // Clear played cards for next round
          phase: 'card_presentation',
          newCards: drawnCards,
          showNewCardsPresentation: true,
          deck: remainingDeck,
          pendingCardDraw: 0,
          log: [...prev.log, `Drawing ${totalCardsToDraw} new cards...`]
        };
      } else {
        return {
          ...prev,
          showNewspaper: false,
          cardsPlayedThisRound: [], // Clear played cards for next round
          phase: 'action',
          pendingCardDraw: 0
        };
      }
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
    confirmNewCards
  };
};