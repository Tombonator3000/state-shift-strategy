import { useState, useCallback } from 'react';
import type { GameCard } from '@/components/game/GameHand';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { TRUTH_SEEKERS_CARDS, GOVERNMENT_CARDS } from '@/data/factionCards';
import { generateRandomDeck, getRandomCards } from '@/data/cardDatabase';
import { USA_STATES, getInitialStateControl, getTotalIPFromStates, type StateData } from '@/data/usaStates';

interface GameState {
  faction: 'government' | 'truth';
  phase: 'income' | 'action' | 'capture' | 'event' | 'newspaper' | 'victory';
  turn: number;
  truth: number;
  ip: number;
  hand: GameCard[];
  deck: GameCard[];
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
  currentEvents: Array<{
    id: string;
    headline: string;
    content: string;
    type: 'conspiracy' | 'government' | 'truth' | 'random';
  }>;
  showNewspaper: boolean;
  log: string[];
  secretAgenda: {
    id: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
    revealed: boolean;
  };
  animating: boolean;
  selectedCard: string | null;
  targetState: string | null;
}

const generateRandomEvents = () => [
  {
    id: 'event_1',
    headline: 'BREAKING: UFO Spotted Over Washington D.C.',
    content: 'Multiple witnesses report seeing strange lights performing impossible maneuvers above the Capitol building. Government officials claim it was just weather balloons, but experts disagree...',
    type: 'conspiracy' as const
  }
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    faction: 'truth',
    phase: 'action',
    turn: 1,
    truth: 60,
    ip: 15,
    hand: getRandomCards(3),
    deck: generateRandomDeck(40),
    cardsPlayedThisTurn: 0,
    cardsPlayedThisRound: [],
    controlledStates: ['CA', 'OR', 'FL', 'NV'],
    states: USA_STATES.map(state => {
      const initialControl = getInitialStateControl('truth');
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
    currentEvents: generateRandomEvents(),
    showNewspaper: false,
    log: [
      'Game started - Truth Seekers faction selected',
      'Starting Truth: 60%',
      'Cards drawn: 3'
    ],
    secretAgenda: {
      id: 'agenda_1',
      description: 'Control 3 coastal states',
      progress: 2,
      target: 3,
      completed: false,
      revealed: false
    },
    animating: false,
    selectedCard: null,
    targetState: null
  });

  const initGame = useCallback((faction: 'government' | 'truth') => {
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10;
    const handSize = faction === 'truth' ? 4 : 3;
    const newDeck = generateRandomDeck(40);
    const startingHand = newDeck.slice(0, handSize);
    const initialControl = getInitialStateControl(faction);

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
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
      switch (card.type) {
        case 'MEDIA':
          newTruth = Math.min(100, prev.truth + 10);
          newLog.push(`${card.name} played: Truth +10% (now ${newTruth}%)`);
          break;
        case 'ZONE':
          newLog.push(`${card.name} played: Added pressure to target state`);
          break;
        case 'ATTACK':
          newLog.push(`${card.name} played: Attack launched`);
          break;
        case 'DEFENSIVE':
          newLog.push(`${card.name} played: Defense prepared`);
          break;
      }

      return {
        ...prev,
        hand: newHand,
        ip: newIP,
        truth: newTruth,
        cardsPlayedThisTurn: prev.cardsPlayedThisTurn + 1,
        cardsPlayedThisRound: [...prev.cardsPlayedThisRound, { card, player: 'human' }],
        log: newLog
      };
    });
  }, []);

  const playCardAnimated = useCallback(async (cardId: string, animateCard: (cardId: string, card: any, options?: any) => Promise<any>) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || gameState.ip < card.cost || gameState.cardsPlayedThisTurn >= 3 || gameState.animating) {
      return;
    }

    // Set animating state
    setGameState(prev => ({ ...prev, animating: true }));

    try {
      // Pay cost upfront
      setGameState(prev => ({ ...prev, ip: prev.ip - card.cost }));

      // Run animation with resolve callback
      await animateCard(cardId, card, {
        targetState: gameState.targetState,
        onResolve: async (resolveCard: any) => {
          // Apply card effects during animation
          setGameState(prev => {
            let newTruth = prev.truth;
            const newLog = [...prev.log];

            switch (resolveCard.type) {
              case 'MEDIA':
                newTruth = Math.min(100, prev.truth + 10);
                newLog.push(`${resolveCard.name} played: Truth +10% (now ${newTruth}%)`);
                break;
              case 'ZONE':
                newLog.push(`${resolveCard.name} played: Added pressure to target state`);
                break;
              case 'ATTACK':
                newLog.push(`${resolveCard.name} played: Attack launched`);
                break;
              case 'DEFENSIVE':
                newLog.push(`${resolveCard.name} played: Defense prepared`);
                break;
            }

            return {
              ...prev,
              truth: newTruth,
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
      const cardsToDraw = Math.max(0, 5 - prev.hand.length);
      const drawnCards = prev.deck.slice(0, cardsToDraw);
      const remainingDeck = prev.deck.slice(cardsToDraw);
      
      // Calculate IP income from controlled states
      const stateIncome = getTotalIPFromStates(prev.controlledStates);
      const baseIncome = 5;
      const totalIncome = baseIncome + stateIncome;
      
      return {
        ...prev,
        turn: prev.turn + 1,
        phase: 'newspaper',
        showNewspaper: true,
        cardsPlayedThisTurn: 0,
        ip: prev.ip + totalIncome,
        hand: [...prev.hand, ...drawnCards],
        deck: remainingDeck,
        log: [...prev.log, 
          `Turn ${prev.turn} ended`, 
          `Base income: ${baseIncome} IP`,
          `State income: ${stateIncome} IP (${prev.controlledStates.length} states)`,
          `Total income: ${totalIncome} IP`, 
          `Cards drawn: ${cardsToDraw}`
        ]
      };
    });
  }, []);

  const closeNewspaper = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showNewspaper: false,
      cardsPlayedThisRound: [], // Clear played cards for next round
      phase: 'action'
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
    closeNewspaper
  };
};