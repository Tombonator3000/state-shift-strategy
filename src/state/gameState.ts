import type { GameState as EngineGameState } from '@/mvp';
import type { GameCard } from '@/types/cardTypes';
import type { GameEvent, EventManager } from '@/data/eventDatabase';
import type { SecretAgenda } from '@/data/agendaDatabase';
import type { AIStrategist } from '@/data/aiStrategy';
import type { AIDifficulty } from '@/data/aiFactory';
import type { DrawMode, CardDrawState } from '@/data/cardDrawingSystem';

export interface GameState {
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
  discardPile: GameCard[];
  aiDeck: GameCard[];
  aiDiscardPile: GameCard[];
  cardsPlayedThisTurn: number;
  cardsPlayedThisRound: Array<{ card: GameCard; player: 'human' | 'ai' }>;
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

export type UIGameState = EngineGameState;

export const toEngineState = (state: UIGameState): EngineGameState => state;

export const fromEngineState = (state: EngineGameState): UIGameState => state;
