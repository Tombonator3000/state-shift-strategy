export type Faction = "truth"|"government";
export type CardType = "MEDIA" | "ZONE" | "ATTACK" | "DEFENSIVE" | "TECH" | "DEVELOPMENT" | "INSTANT" | "LEGENDARY";

export interface Card { id:string; name:string; faction:Faction; type:CardType; cost:number; effects:any; }
export interface PlayerState {
  id:"P1"|"P2"; faction:Faction; deck:Card[]; hand:Card[]; discard:Card[]; ip:number; zones:string[];
  zoneDefenseBonus:number; pressureTotal?:number; costMods?:{zone?:number; media?:number}; passiveIncome?:number;
}
export interface GameState {
  turn:number; truth:number; currentPlayer:"P1"|"P2";
  players:Record<"P1"|"P2",PlayerState>;
  skipAIActionNext?:boolean;
}
export interface Context {
  state:GameState; log?:(m:string)=>void; openReaction?:(attackCard:Card,attacker:"P1"|"P2",defender:"P1"|"P2")=>void;
  turnFlags?:Record<"P1"|"P2",{immune?:boolean; blockAttack?:boolean}>;
  // newspaper logger
  news?: { push:(entry: NewspaperEntry)=>void };
}
export type NewspaperEntry = { id:string; when:number; headline:string; deck:Faction; body:string; tags:string[] };
