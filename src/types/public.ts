export type Faction = "truth" | "government";
export type CardType = "ATTACK" | "MEDIA" | "ZONE";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Card = {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  rarity: Rarity;
  cost: number;
  flavor?: string;
  artId?: string;
  set?: string;
  effects?: any;
};

export type Deck = Card[];
