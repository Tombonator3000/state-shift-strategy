export type Faction = "Truth" | "Government";
export type CardType = "MEDIA" | "ZONE" | "ATTACK" | "DEFENSIVE";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  faction?: Faction;
  rarity?: "common"|"uncommon"|"rare"|"legendary";
  cost: number;
  text?: string;
  flavor?: string;
  flavorTruth?: string;
  flavorGov?: string;
  image?: string;
  target?: any;
  effects?: any;
  meta?: {
    isEvent?: boolean;
    headlineOverride?: string;
  };
}

export type NewspaperConfig = {
  mastheads: { name: string; weight?: number }[];
  ads: { title: string; body?: string; kicker?: string; footer?: string; weight?: number }[];
  headlineTemplates: {
    type: CardType | "GENERIC";
    faction: Faction | "Any";
    templates: string[];
  }[];
  sidebars?: string[];
  tickers?: string[];
  editorialStamps?: string[];
};

export type Article = {
  cardId: string;
  isEvent: boolean;
  title: string;
  dek?: string;
  body: string[];
  imageUrl: string;
  stamps?: string[];
};

export type NewspaperIssue = {
  round: number;
  masthead: string;
  lead: Article[];
  brief?: Article | null;
  ads: { title: string; body?: string; kicker?: string; footer?: string }[];
  tickers: string[];
  sidebars?: string[];
};
