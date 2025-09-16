export type Faction = "truth" | "government";
export type CardType = "ATTACK" | "MEDIA" | "ZONE";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type EffectsATTACK = {
  ipDelta: { opponent: number };
  discardOpponent?: number;
};

export type EffectsMEDIA = {
  truthDelta: number;
};

export type EffectsZONE = {
  pressureDelta: number;
};

export type Card = {
  id: string;
  name: string;
  faction: Faction;
  type: CardType;
  rarity: Rarity;
  cost: number;
  effects: EffectsATTACK | EffectsMEDIA | EffectsZONE;
  flavor?: string;
  artId?: string;
  tags?: string[];
};
