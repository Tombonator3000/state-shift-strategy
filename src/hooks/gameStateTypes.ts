import type { GameCard } from '@/rules/mvp';
import type { EventManager, GameEvent, ParanormalHotspotPayload } from '@/data/eventDatabase';
import type { SecretAgenda } from '@/data/agendaDatabase';
import type { AgendaIssueState } from '@/data/agendaIssues';
import type { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import type { DrawMode, CardDrawState } from '@/data/cardDrawingSystem';
import type { AIDifficulty } from '@/data/aiStrategy';
import type { TurnPlay } from '@/game/combo.types';
import type { StateCombinationEffects } from '@/data/stateCombinations';

export interface CardPlayRecord {
  card: GameCard;
  player: 'human' | 'ai';
  faction: 'government' | 'truth';
  targetState: string | null;
  truthDelta: number;
  ipDelta: number;
  aiIpDelta: number;
  capturedStates: string[];
  capturedStateIds: string[];
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
    baseDefense: number;
    defense: number;
    comboDefenseBonus?: number;
    pressure: number;
    pressurePlayer: number;
    pressureAi: number;
    contested: boolean;
    owner: 'player' | 'ai' | 'neutral';
    specialBonus?: string;
    bonusValue?: number;
    occupierCardId?: string | null;
    occupierCardName?: string | null;
    occupierLabel?: string | null;
    occupierIcon?: string | null;
    occupierUpdatedAt?: number;
    paranormalHotspot?: StateParanormalHotspot;
    stateEventBonus?: StateEventBonusSummary;
  }>;
  currentEvents: GameEvent[];
  eventManager?: EventManager;
  showNewspaper: boolean;
  log: string[];
  agendaIssue: AgendaIssueState;
  agendaIssueCounters: Record<string, number>;
  agendaRoundCounters: Record<string, number>;
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
  stateCombinationBonusIP: number;
  activeStateCombinationIds: string[];
  stateCombinationEffects: StateCombinationEffects;
  truthAbove80Streak: number;
  truthBelow20Streak: number;
  timeBasedGoalCounters: Record<string, number>;
  paranormalHotspots: Record<string, ActiveParanormalHotspot>;
}

export interface StateEventBonusSummary {
  source: 'state-event';
  eventId: string;
  label: string;
  description?: string;
  triggeredOnTurn: number;
  faction: 'truth' | 'government';
  effects?: NonNullable<GameEvent['effects']>;
  effectSummary?: string[];
}

export interface ActiveParanormalHotspot {
  id: string;
  eventId: string;
  stateId: string;
  stateName: string;
  stateAbbreviation: string;
  label: string;
  description?: string;
  icon?: string;
  duration: number;
  defenseBoost: number;
  truthReward: number;
  expiresOnTurn: number;
  createdOnTurn: number;
  source: NonNullable<ParanormalHotspotPayload['source']>;
}

export interface StateParanormalHotspot {
  id: string;
  eventId: string;
  label: string;
  description?: string;
  icon?: string;
  defenseBoost: number;
  truthReward: number;
  expiresOnTurn: number;
  turnsRemaining: number;
  source: NonNullable<ParanormalHotspotPayload['source']>;
}
