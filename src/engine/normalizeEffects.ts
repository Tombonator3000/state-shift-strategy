export type Who = 'player' | 'ai';

export type Effect =
  | { k: 'truth'; who: Who; v: number }
  | { k: 'ip'; who: Who; v: number }
  | { k: 'draw'; who: Who; n: number }
  | { k: 'pressure'; who: Who; state: string; v: number }
  | { k: 'defense'; state: string; v: 1 | -1 }
  | { k: 'discardRandom'; who: Who; n: number }
  | { k: 'discardChoice'; who: Who; n: number }
  | { k: 'addCard'; who: Who; cardId: string }
  | { k: 'flag'; name: string; on?: boolean }
  | { k: 'conditional'; if: (gs: any, target?: any) => boolean; then: Effect[]; else?: Effect[] }
  | { k: 'special'; fn: (gs: any, target?: any) => void };

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

function normalizeIpDelta(ip: any): Effect[] {
  const out: Effect[] = [];
  if (ip == null) return out;
  if (typeof ip === 'number') {
    out.push({ k: 'ip', who: 'player', v: ip });
    return out;
  }
  const self = ip.self ?? 0;
  const opp = ip.opponent ?? 0;
  if (self) out.push({ k: 'ip', who: 'player', v: self });
  if (opp) out.push({ k: 'ip', who: 'ai', v: opp });
  return out;
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

export function normalizeEffects(effects: LegacyEffects): Effect[] {
  if (!effects) return [];
  if (Array.isArray(effects)) return effects;

  const out: Effect[] = [];
  const e: any = effects;

  if (typeof e.truthDelta === 'number' && e.truthDelta)
    out.push({ k: 'truth', who: 'player', v: e.truthDelta });
  if (typeof e.draw === 'number' && e.draw > 0)
    out.push({ k: 'draw', who: 'player', n: e.draw });
  if (e.ipDelta != null) out.push(...normalizeIpDelta(e.ipDelta));
  if (e.pressureDelta)
    out.push({ k: 'pressure', who: toWho(e.pressureDelta.who), state: e.pressureDelta.state, v: e.pressureDelta.v });
  if (e.defenseDelta)
    out.push({ k: 'defense', state: e.defenseDelta.state, v: e.defenseDelta.v });
  if (e.discardRandom)
    out.push({ k: 'discardRandom', who: 'ai', n: e.discardRandom });
  if (e.discardChoice)
    out.push({ k: 'discardChoice', who: 'ai', n: e.discardChoice });
  if (e.addCardId)
    out.push({ k: 'addCard', who: 'player', cardId: e.addCardId });

  const cond = normalizeConditional(e);
  if (cond) out.push(cond);

  if (!out.length) console.warn('[normalizeEffects] Legacy produced no effects.', e);
  return out;
}

export function normalizeCard<T extends { effects?: LegacyEffects; text?: string; flavor?: string; id: string }>(
  card: T,
): T & { effects: Effect[] } {
  const nonAscii = (s?: string) => !!s && /[^\x00-\x7F]/.test(s);
  if (nonAscii(card.text) || nonAscii((card as any).flavor)) console.warn(`[i18n] Non-ASCII text on ${card.id}. In-game text must be English.`);
  return { ...card, effects: normalizeEffects(card.effects) };
}

export function normalizeDeck<T extends { effects?: LegacyEffects }>(cards: T[]): (T & { effects: Effect[] })[] {
  return (cards ?? []).map(normalizeCard);
}

