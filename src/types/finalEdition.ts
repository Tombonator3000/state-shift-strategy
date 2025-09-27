import type { ParanormalSighting } from '@/types/paranormal';

export type ImpactType = 'capture' | 'truth' | 'ip' | 'damage' | 'support';

export interface AgendaSummary {
  title: string;
  headline: string;
  operationName: string;
  issueTheme: string;
  pullQuote?: string;
  artCue?: {
    icon?: string;
    alt?: string;
  };
  faction: 'truth' | 'government' | 'both';
  progress: number;
  target: number;
  completed: boolean;
  revealed: boolean;
}

export interface MVPReport {
  cardId: string;
  cardName: string;
  player: 'human' | 'ai';
  faction: 'truth' | 'government';
  truthDelta: number;
  ipDelta: number;
  aiIpDelta: number;
  capturedStates: string[];
  damageDealt: number;
  round: number;
  turn: number;
  impactType: ImpactType;
  impactValue: number;
  impactLabel: string;
  highlight: string;
}

export interface FinalEditionEventHighlight {
  id: string;
  headline: string;
  summary: string;
  faction: 'truth' | 'government' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  truthDelta: number;
  ipDelta: number;
  stateName?: string;
  kicker?: string;
}

export interface FinalEditionComboHighlight {
  id: string;
  name: string;
  rewardLabel: string;
  turn: number;
  ownerLabel: string;
  description?: string;
}

export interface FinalEditionReport {
  winner: 'government' | 'truth' | 'draw';
  victoryType: 'states' | 'ip' | 'truth' | 'agenda' | 'draw';
  rounds: number;
  finalTruth: number;
  ipPlayer: number;
  ipAI: number;
  statesGov: number;
  statesTruth: number;
  playerFaction: 'truth' | 'government';
  playerSecretAgenda?: AgendaSummary;
  aiSecretAgenda?: AgendaSummary;
  mvp?: MVPReport | null;
  runnerUp?: MVPReport | null;
  legendaryUsed: string[];
  topEvents: FinalEditionEventHighlight[];
  comboHighlights: FinalEditionComboHighlight[];
  sightings: ParanormalSighting[];
  recordedAt: number;
}

export type GameOverReport = FinalEditionReport;
