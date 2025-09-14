// Absolute and relative sides
export type SideAbs = 'player' | 'ai';      // absolute (back-compat)
export type SideRel = 'self' | 'opponent';  // relative to actor
export type SideAny = SideAbs | SideRel;

// Canonical runtime Effect (what the resolver consumes)
export type Effect =
  | { k:'truth'; v:number } // global
  | { k:'ip'; who:SideAny; v:number }
  | { k:'draw'; who:SideAny; n:number }
  | { k:'discardRandom'; who:SideAny; n:number }
  | { k:'discardChoice'; who:SideAny; n:number }
  | { k:'pressure'; who:SideAny; state:string; v:number }
  | { k:'defense'; state:string; v:1|-1 }
  | { k:'addCard'; who:SideAny; cardId:string }
  | { k:'flag'; name:string; on?:boolean }
  | { k:'conditional'; if:(gs:any,target?:any)=>boolean; then:Effect[]; else?:Effect[] }
  | { k:'special'; fn:(gs:any,target?:any)=>void };

// ----- Compatibility “input” shapes accepted by normalizer -----

// v2.1E-ish explicit keys used by some core cards
export type CardEffectsV21E = Partial<{
  drawSelf: number;                 // self draws N
  drawOpponent: number;             // opponent draws N
  ipSelf: number;                   // change self IP
  ipOpponent: number;               // change opponent IP
  discardOpponent: number;          // opponent discards random N
  discardOpponentChoice: number;    // opponent discards chosen N
  truthDelta: number;               // +/- Truth (global)
  pressureDelta: { state:string; who?: 'self'|'opponent'|'player'|'ai'; v:number };
  defenseDelta: { state:string; v:1|-1 };
  addCardId: string;                // to self
  // conditional
  if: { stat:string; op: '>='|'<='|'>'|'<'|'=='|'!='; value:number };
  then: LegacyEffects;
  else: LegacyEffects;
}>;

// Legacy flat object used earlier
export type LegacyFlat = Partial<{
  draw: number;                     // actor draws N
  ipDelta: number | { self?:number; opponent?:number };
  discardRandom: number;            // opponent discards random N
  discardChoice: number;            // opponent discards chosen N
  truthDelta: number;
  pressureDelta: { state:string; who?: 'self'|'opponent'|'player'|'ai'; v:number };
  defenseDelta: { state:string; v:1|-1 };
  addCardId: string;
  if: { stat:string; op: '>='|'<='|'>'|'<'|'=='|'!='; value:number };
  then: LegacyEffects;
  else: LegacyEffects;
}>;

// Already-normalized array case
export type EffectArray = Effect[];

// Unified input type the normalizer accepts:
export type LegacyEffects = EffectArray | CardEffectsV21E | LegacyFlat | undefined;
