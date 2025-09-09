import { useState, useCallback } from 'react';
import type { GameCard } from '@/components/game/GameHand';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { TRUTH_SEEKERS_CARDS, GOVERNMENT_CARDS } from '@/data/factionCards';
import { generateRandomDeck, getRandomCards } from '@/data/cardDatabase';

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
    x: number;
    y: number;
    defense: number;
    pressure: number;
    owner: 'player' | 'ai' | 'neutral';
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
    controlledStates: ['CA', 'NY', 'TX'],
    states: [
      { id: 'CA', name: 'California', x: 50, y: 250, defense: 2, pressure: 0, owner: 'player' },
      { id: 'NY', name: 'New York', x: 650, y: 150, defense: 2, pressure: 1, owner: 'player' },
      { id: 'TX', name: 'Texas', x: 300, y: 350, defense: 3, pressure: 0, owner: 'player' },
      { id: 'FL', name: 'Florida', x: 600, y: 400, defense: 1, pressure: 2, owner: 'neutral' },
      { id: 'NV', name: 'Nevada', x: 150, y: 200, defense: 1, pressure: 0, owner: 'neutral' },
      { id: 'WA', name: 'Washington', x: 100, y: 50, defense: 2, pressure: 1, owner: 'ai' },
      { id: 'DC', name: 'Washington DC', x: 650, y: 200, defense: 5, pressure: 3, owner: 'ai' },
      { id: 'AK', name: 'Alaska', x: 50, y: 350, defense: 1, pressure: 0, owner: 'neutral' },
      { id: 'HI', name: 'Hawaii', x: 200, y: 400, defense: 1, pressure: 0, owner: 'neutral' },
      { id: 'CO', name: 'Colorado', x: 250, y: 200, defense: 2, pressure: 0, owner: 'neutral' }
    ],
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
    }
  });

  const initGame = useCallback((faction: 'government' | 'truth') => {
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10;
    const handSize = faction === 'truth' ? 4 : 3;
    const newDeck = generateRandomDeck(40);
    const startingHand = newDeck.slice(0, handSize);

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
      hand: startingHand,
      deck: newDeck.slice(handSize),
      log: [
        `Game started - ${faction} faction selected`,
        `Starting Truth: ${startingTruth}%`,
        `Starting IP: ${startingIP}`,
        `Cards drawn: ${handSize}`
      ]
    }));
  }, []);

  const playCard = useCallback((cardId: string) => {
    setGameState(prev => {
      const card = prev.hand.find(c => c.id === cardId);
      if (!card || prev.ip < card.cost || prev.cardsPlayedThisTurn >= 3) {
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

  const endTurn = useCallback(() => {
    setGameState(prev => {
      const cardsToDraw = Math.max(0, 5 - prev.hand.length);
      const drawnCards = prev.deck.slice(0, cardsToDraw);
      const remainingDeck = prev.deck.slice(cardsToDraw);
      
      return {
        ...prev,
        turn: prev.turn + 1,
        phase: 'newspaper',
        showNewspaper: true,
        cardsPlayedThisTurn: 0,
        ip: prev.ip + 5 + prev.controlledStates.length * 2, // Income phase
        hand: [...prev.hand, ...drawnCards],
        deck: remainingDeck,
        log: [...prev.log, `Turn ${prev.turn} ended`, `Income: +${5 + prev.controlledStates.length * 2} IP`, `Cards drawn: ${cardsToDraw}`]
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
    endTurn,
    closeNewspaper
  };
};