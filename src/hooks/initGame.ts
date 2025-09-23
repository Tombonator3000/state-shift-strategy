import { getStartingHandSize, type CardDrawState, type DrawMode } from '@/data/cardDrawingSystem';
import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import { USA_STATES, getInitialStateControl } from '@/data/usaStates';
import { DEFAULT_MAX_CARDS_PER_TURN } from '@/config/turnLimits';
import type { GameState } from './gameStateTypes';
import type { AIDifficulty } from '@/data/aiStrategy';
import { parseDrawModeSetting } from '@/state/settings';

type SetGameState = (updater: GameState | ((previous: GameState) => GameState)) => void;

type InitGameAchievements = {
  onGameStart: (faction: 'government' | 'truth', aiDifficulty: AIDifficulty) => void;
  manager: { onNewGameStart: () => void };
};

export interface InitGameConfig {
  faction: 'government' | 'truth';
  aiDifficulty: AIDifficulty;
  achievements: InitGameAchievements;
  setGameState: SetGameState;
  savedSettings?: string | null;
}

export const createDefaultCardDrawState = (): CardDrawState => ({
  cardsPlayedLastTurn: 0,
  lastTurnWithoutPlay: false,
});

export const initGame = ({
  faction,
  aiDifficulty,
  achievements,
  setGameState,
  savedSettings,
}: InitGameConfig) => {
  const startingTruth = 50;
  const startingIP = 5;
  const aiStartingIP = 5;

  const drawMode: DrawMode = parseDrawModeSetting(savedSettings ?? null);

  const handSize = getStartingHandSize(drawMode, faction);
  const opposingFaction = faction === 'government' ? 'truth' : 'government';
  const aiHandSize = getStartingHandSize(drawMode, opposingFaction);
  const newDeck = generateWeightedDeck(40, faction);
  const startingHand = newDeck.slice(0, handSize);
  const aiStartingDeck = generateWeightedDeck(40, opposingFaction);
  const aiStartingHand = aiStartingDeck.slice(0, aiHandSize);
  const initialControl = getInitialStateControl(faction);

  achievements.onGameStart(faction, aiDifficulty);
  achievements.manager.onNewGameStart();

  setGameState(prev => ({
    ...prev,
    faction,
    truth: startingTruth,
    ip: startingIP,
    aiIP: aiStartingIP,
    maxCardsPerTurn: DEFAULT_MAX_CARDS_PER_TURN,
    hand: startingHand,
    deck: newDeck.slice(handSize),
    aiHand: aiStartingHand,
    aiDeck: aiStartingDeck.slice(aiHandSize),
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
    animating: false,
    aiTurnInProgress: false,
    selectedCard: null,
    targetState: null,
    newspaperGlitchBadge: false,
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
      `Starting IP: ${startingIP} (gain 5 + controlled states each income phase)`,
      `Cards drawn: ${handSize} (${drawMode} mode)`,
      `AI opening hand: ${aiHandSize}`,
      `Controlled states: ${initialControl.player.join(', ')}`,
    ],
    drawMode,
    cardDrawState: createDefaultCardDrawState(),
  }));
};
