export type CardType = 'ATTACK' | 'MEDIA' | 'ZONE';

export type ArticleTone = 'truth' | 'government' | 'draw';

export interface ArticleBlock {
  tone: ArticleTone;
  hed: string;
  dek: string;
  bullets: string[];
  byline: string;
  source: string;
  body?: string[];
  imagePrompt?: string;
  kicker?: string;
  stinger?: string;
  templateId?: string;
  comboId?: string;
}

export interface PlayedLite {
  id: string;
  name: string;
  type: CardType;
  faction: 'truth' | 'government';
  truth?: number;
  ip?: number;
  captures?: number;
  damage?: number;
}

export interface FactionTotals {
  plays: number;
  attack: number;
  media: number;
  zone: number;
  truth: number;
  ip: number;
  captures: number;
  damage: number;
}

export interface TurnTotals {
  truth: FactionTotals;
  government: FactionTotals;
}

export interface TurnLog {
  round: number;
  turn: number;
  plays: PlayedLite[];
}

export interface WeightedMetric {
  raw: number;
  weighted: number;
}

export interface TurnCompositeMetrics {
  cards: number;
  truth: WeightedMetric;
  ip: WeightedMetric;
  captures: WeightedMetric;
  damage: WeightedMetric;
  typeBonus: number;
  total: number;
}

export interface TurnComposite {
  round: number;
  turn: number;
  plays: PlayedLite[];
  focus: PlayedLite[];
  tone: ArticleTone;
  main: ArticleBlock | null;
  runnersUp: ArticleBlock[];
  metrics: TurnCompositeMetrics;
  signature: string | null;
  seed: number | null;
}
