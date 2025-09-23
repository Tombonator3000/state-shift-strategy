import type { GameCard } from '@/rules/mvp';
import type { EventManager, GameEvent } from '@/data/eventDatabase';
import type { SecretAgenda } from '@/data/agendaDatabase';
import type { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import type { DrawMode, CardDrawState } from '@/data/cardDrawingSystem';
import type { AIDifficulty } from '@/data/aiStrategy';
import type { TurnPlay } from '@/game/combo.types';

export interface CardPlayRecord {
  card: GameCard;
  player: 'human' | 'ai';
  faction: 'government' | 'truth';
  targetState: string | null;
  truthDelta: number;
  ipDelta: number;
  aiIpDelta: number;
  capturedStates: string[];
  damageDealt: number;
  round: number;
  turn: number;
  timestamp: number;
  logEntries: string[];
}

export interface GameState {
  faction: 'government' | 'truth';
  phase: 'income' | 'action' | 'capture' | 'event' | 'newspaper' | 'victory' | 'ai_turn' | 'card_presentation';
  turn: number;
  round: number;
  currentPlayer: 'human' | 'ai';
  aiDifficulty: AIDifficulty;
  aiPersonality?: string;
  truth: number;
  ip: number;
  aiIP: number;
  maxCardsPerTurn: number;
  hand: GameCard[];
  aiHand: GameCard[];
  isGameOver: boolean;
  deck: GameCard[];
  aiDeck: GameCard[];
  cardsPlayedThisTurn: number;
  cardsPlayedThisRound: CardPlayRecord[];
  playHistory: CardPlayRecord[];
  turnPlays: TurnPlay[];
  comboTruthDeltaThisRound: number;
  controlledStates: string[];
  aiControlledStates: string[];
  states: Array<{
    id: string;
    name: string;
    abbreviation: string;
    baseIP: number;
    defense: number;
    pressure: number;
    contested: boolean;
    owner: 'player' | 'ai' | 'neutral';
    specialBonus?: string;
    bonusValue?: number;
    occupierCardId?: string | null;
    occupierCardName?: string | null;
    occupierLabel?: string | null;
    occupierIcon?: string | null;
    occupierUpdatedAt?: number;
  }>;
  currentEvents: GameEvent[];
  eventManager?: EventManager;
  showNewspaper: boolean;
  newspaperGlitchBadge?: boolean;
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
  aiStrategist?: EnhancedAIStrategist;
  pendingCardDraw?: number;
  newCards?: GameCard[];
  showNewCardsPresentation?: boolean;
  drawMode: DrawMode;
  cardDrawState: CardDrawState;
  maxPlaysPerTurn: number;
}
