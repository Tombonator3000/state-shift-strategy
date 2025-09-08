import { useState, useCallback } from 'react';
import type { GameCard } from '@/components/game/GameHand';

interface GameState {
  faction: 'government' | 'truth';
  phase: 'income' | 'action' | 'capture' | 'event' | 'newspaper' | 'victory';
  turn: number;
  truth: number;
  ip: number;
  hand: GameCard[];
  cardsPlayedThisTurn: number;
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
  };
}

// Sample cards for the game
const sampleCards: GameCard[] = [
  {
    id: 'media_1',
    name: 'Leak Documents',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Increase Truth by 10%',
    flavorGov: 'Another security breach to contain...',
    flavorTruth: 'The people deserve to know!',
    cost: 4
  },
  {
    id: 'zone_1',
    name: 'Infiltrate Capitol',
    type: 'ZONE',
    rarity: 'uncommon',
    text: 'Add 1 Pressure to target state',
    flavorGov: 'Expand our network of influence',
    flavorTruth: 'Expose corruption at the source',
    cost: 5
  },
  {
    id: 'attack_1',
    name: 'Discredit Whistleblower',
    type: 'ATTACK',
    rarity: 'rare',
    text: 'Target loses 8 IP and discards a card',
    flavorGov: 'Make them disappear from the headlines',
    flavorTruth: 'Another truth-teller silenced',
    cost: 6
  },
  {
    id: 'defensive_1',
    name: 'Counter-Intelligence',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block one ATTACK card',
    flavorGov: 'Our security is impenetrable',
    flavorTruth: 'We saw that coming a mile away',
    cost: 3
  }
];

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
    hand: sampleCards.slice(0, 3),
    cardsPlayedThisTurn: 0,
    controlledStates: ['CA', 'NY', 'TX'],
    states: [],
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
      completed: false
    }
  });

  const initGame = useCallback((faction: 'government' | 'truth') => {
    const startingTruth = faction === 'government' ? 40 : 60;
    const startingIP = faction === 'government' ? 20 : 10;
    const handSize = faction === 'truth' ? 4 : 3;

    setGameState(prev => ({
      ...prev,
      faction,
      truth: startingTruth,
      ip: startingIP,
      hand: sampleCards.slice(0, handSize),
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
        log: newLog
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      turn: prev.turn + 1,
      phase: 'income',
      cardsPlayedThisTurn: 0,
      ip: prev.ip + 5 + prev.controlledStates.length * 2, // Income phase
      hand: [...prev.hand, ...sampleCards.slice(0, Math.max(0, 5 - prev.hand.length))], // Draw to 5
      log: [...prev.log, `Turn ${prev.turn} ended`, `Income: +${5 + prev.controlledStates.length * 2} IP`, `Cards drawn to hand`]
    }));
  }, []);

  return {
    gameState,
    initGame,
    playCard,
    endTurn
  };
};