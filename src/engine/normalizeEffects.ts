// Normalizes legacy core cards into the new Effect[] schema.
// New schema key summary:
//  - truth       → { k:'truth', who:'player'|'ai', v:number }   (clamped 0..100 by engine)
//  - ip          → { k:'ip',    who:'player'|'ai', v:number }   (min 0 by engine)
//  - draw        → { k:'draw',  who:'player'|'ai', n:number }
//  - pressure    → { k:'pressure', who:'player'|'ai', state:string, v:number }
//  - defense     → { k:'defense', state:string, v:1|-1 }
//  - discard rnd → { k:'discardRandom', who:'player'|'ai', n:number }
//  - discard sel → { k:'discardChoice', who:'player'|'ai', n:number }
//  - conditional → { k:'conditional', if:(gs,target)=>boolean, then:Effect[], else?:Effect[] }
//  - addCard     → { k:'addCard', who:'player'|'ai', cardId:string }
//  - flag        → { k:'flag', name:string, on?:boolean }

import type { Effect } from './effects'; // canonical Effect type

type Who = 'player' | 'ai';

export type LegacyEffects =
  | Effect[]
  | {
      truthDelta?: number;
      draw?: number;
      ipDelta?: number | { self?: number; opponent?: number };
      pressureDelta?: { state: string; who?: Who; v: number };
      defenseDelta?: { state: string; v: 1 | -1 };
      discardRandom?: number;
      discardChoice?: number;
      addCardId?: string;
      if?: { stat: string; op: '>=' | '<=' | '>' | '<' | '==' | '!='; value: number };
      then?: LegacyEffects;
      else?: LegacyEffects;
    }
  | undefined;

function toWho(x?: any): Who {
  return x === 'ai' ? 'ai' : 'player';
}

function normalizeIpDelta(ip: any): Effect[] {
  const out: Effect[] = [];
  if (ip == null) return out;
  if (typeof ip === 'number') {
    out.push({ k: 'ip', who: 'player', v: ip });
    return out;
  }
  const self = ip.self ?? 0;
  const opp = ip.opponent ?? 0;
  if (self !== 0) out.push({ k: 'ip', who: 'player', v: self });
  if (opp !== 0) out.push({ k: 'ip', who: 'ai', v: opp });
  return out;
}

function readStat(gs: any, stat: string): number {
  switch (stat) {
    case 'truth':
      return gs.truth ?? 0;
    case 'ipSelf':
      return gs.player?.ip ?? 0;
    case 'ipOpponent':
      return gs.ai?.ip ?? 0;
    case 'zonesControlled':
      return gs.player?.zonesControlled ?? 0;
    case 'round':
      return gs.round ?? 0;
    default:
      return 0;
  }
}

function normalizeConditional(obj: any): Effect | null {
  if (!obj?.if || (!obj.then && !obj.else)) return null;
  const { stat, op, value } = obj.if;
  const thenEff = normalizeEffects(obj.then);
  const elseEff = normalizeEffects(obj.else);
  return {
    k: 'conditional',
    if: (gs: any) => {
      const lhs = readStat(gs, stat);
      switch (op) {
        case '>=':
          return lhs >= value;
        case '<=':
          return lhs <= value;
        case '>':
          return lhs > value;
        case '<':
          return lhs < value;
        case '==':
          return lhs === value;
        case '!=':
          return lhs !== value;
        default:
          return false;
      }
    },
    then: thenEff,
    else: elseEff,
  };
}

export function isLegacyFlat(obj: any): boolean {
  if (!obj || Array.isArray(obj)) return false;
  return (
    'truthDelta' in obj ||
    'draw' in obj ||
    'ipDelta' in obj ||
    'pressureDelta' in obj ||
    'defenseDelta' in obj ||
    'discardRandom' in obj ||
    'discardChoice' in obj ||
    'addCardId' in obj ||
    'if' in obj
  );
}

/** Normalize any effects value (array/new, or legacy flat object) to Effect[] */
export function normalizeEffects(effects: LegacyEffects): Effect[] {
  if (!effects) return [];
  if (Array.isArray(effects)) return effects as Effect[];

  const out: Effect[] = [];
  const e: any = effects;

  if (typeof e.truthDelta === 'number' && e.truthDelta !== 0) {
    out.push({ k: 'truth', who: 'player', v: e.truthDelta });
  }
  if (typeof e.draw === 'number' && e.draw > 0) {
    out.push({ k: 'draw', who: 'player', n: e.draw });
  }
  if (e.ipDelta != null) {
    out.push(...normalizeIpDelta(e.ipDelta));
  }
  if (e.pressureDelta) {
    out.push({
      k: 'pressure',
      who: toWho(e.pressureDelta.who),
      state: e.pressureDelta.state,
      v: e.pressureDelta.v,
    });
  }
  if (e.defenseDelta) {
    out.push({
      k: 'defense',
      state: e.defenseDelta.state,
      v: e.defenseDelta.v,
    });
  }
  if (typeof e.discardRandom === 'number' && e.discardRandom > 0) {
    out.push({ k: 'discardRandom', who: 'ai', n: e.discardRandom });
  }
  if (typeof e.discardChoice === 'number' && e.discardChoice > 0) {
    out.push({ k: 'discardChoice', who: 'ai', n: e.discardChoice });
  }
  if (typeof e.addCardId === 'string' && e.addCardId) {
    out.push({ k: 'addCard', who: 'player', cardId: e.addCardId });
  }

  const c = normalizeConditional(e);
  if (c) out.push(c);

  if (out.length === 0) {
    console.warn('[normalizeEffects] Legacy object produced no effects. Check mapping.', e);
  }
  return out;
}

export default normalizeEffects;
