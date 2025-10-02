import type { GameCard } from '@/rules/mvp';
import type { EventManager, GameEvent, ParanormalHotspotPayload } from '@/data/eventDatabase';
import type { SecretAgenda } from '@/data/agendaDatabase';
import type { AgendaIssueState } from '@/data/agendaIssues';
import type { EnhancedAIStrategist } from '@/data/enhancedAIStrategy';
import type { DrawMode, CardDrawState } from '@/data/cardDrawingSystem';
import type { AIDifficulty } from '@/data/aiStrategy';
import type { TurnPlay } from '@/game/combo.types';
import type { HotspotKind, WeightedHotspotCandidate } from '@/systems/paranormalHotspots';
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
    occupierCardId?: string | null;
    occupierCardName?: string | null;
    occupierLabel?: string | null;
    occupierIcon?: string | null;
    occupierUpdatedAt?: number;
    paranormalHotspot?: StateParanormalHotspot;
    paranormalHotspotHistory: StateParanormalHotspotSummary[];
    stateEventBonus?: StateEventBonusSummary;
    stateEventHistory: StateEventBonusSummary[];
    activeStateBonus?: ActiveStateBonus | null;
    roundEvents: StateRoundEventLogEntry[];
  }>;
  currentEvents: GameEvent[];
  pendingEditionEvents: GameEvent[];
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
    stageId?: string;
  };
  aiSecretAgenda?: SecretAgenda & {
    progress: number;
    completed: boolean;
    revealed: boolean;
    stageId?: string;
  };
  secretAgendaDifficulty?: SecretAgenda['difficulty'] | null;
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
  activeHotspot: WeightedHotspotCandidate | null;
  stateRoundSeed: number;
  lastStateBonusRound: number;
  stateRoundEvents: Record<string, StateRoundEventLogEntry[]>;
  activeCampaignArcs: ActiveCampaignArcState[];
  pendingArcEvents: PendingCampaignArcEvent[];
}

export interface ActiveCampaignArcState {
  arcId: string;
  currentChapter: number;
  lastEventId: string;
  status: 'active' | 'completed';
  resolution?: 'cliffhanger' | 'finale';
}

export interface PendingCampaignArcEvent {
  arcId: string;
  eventId: string;
  chapter: number;
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

export interface StateParanormalHotspotSummary {
  id: string;
  label: string;
  resolvedOnTurn: number;
  faction: 'truth' | 'government';
  truthDelta: number;
}

export interface ActiveStateBonus {
  source: 'state-themed';
  id: string;
  stateId: string;
  stateName: string;
  stateAbbreviation: string;
  round: number;
  label: string;
  summary: string;
  headline: string;
  subhead?: string;
  icon?: string;
  truthDelta?: number;
  ipDelta?: number;
  pressureDelta?: number;
}

export interface StateRoundEventLogEntry {
  source: 'state-themed';
  id: string;
  stateId: string;
  stateName: string;
  stateAbbreviation: string;
  round: number;
  headline: string;
  summary: string;
  subhead?: string;
  icon?: string;
  truthDelta?: number;
  ipDelta?: number;
  pressureDelta?: number;
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
  kind?: HotspotKind;
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
  kind?: HotspotKind;
}
