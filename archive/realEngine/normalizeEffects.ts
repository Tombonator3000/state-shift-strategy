import type { Effect, LegacyEffects, SideAbs } from './effects/types';

// Read stat helper for conditionals
function readStat(gs:any, stat:string): number {
  switch (stat) {
    case 'truth': return gs.truth ?? 0;
    case 'ipSelf': return gs.player?.ip ?? 0;
    case 'ipOpponent': return gs.ai?.ip ?? 0;
    case 'zonesControlled': return gs.player?.zonesControlled ?? 0;
    case 'round': return gs.round ?? 0;
    default: return 0;
  }
}

function mapConditional(e:any): Effect | null {
  if (!e?.if || (!e.then && !e.else)) return null;
  const { stat, op, value } = e.if;
  return {
    k:'conditional',
    if:(gs:any) => {
      const lhs = readStat(gs, stat);
      return op === '>=' ? lhs >= value :
             op === '<=' ? lhs <= value :
             op === '>'  ? lhs >  value :
             op === '<'  ? lhs <  value :
             op === '==' ? lhs === value :
             op === '!=' ? lhs !== value : false;
    },
    then: normalizeEffects(e.then),
    else: normalizeEffects(e.else)
  };
}

export function normalizeEffects(effects: LegacyEffects): Effect[] {
  if (!effects) return [];
  if (Array.isArray(effects)) return effects as Effect[];

  const out: Effect[] = [];
  const e:any = effects;

  // ---- Common fields across versions ----
  if (typeof e.truthDelta === 'number' && e.truthDelta) {
    out.push({ k:'truth', v: e.truthDelta });
  }
  if (e.pressureDelta) {
    if (typeof e.pressureDelta === 'number') {
      // Simple number format - assume target state will be provided by UI
      out.push({ k:'pressure', who:'self', state:'*', v: e.pressureDelta });
    } else {
      // Object format with explicit state
      const who = (e.pressureDelta.who ?? 'self') as any;
      out.push({ k:'pressure', who, state: e.pressureDelta.state, v: e.pressureDelta.v });
    }
  }
  if (e.defenseDelta) {
    out.push({ k:'defense', state: e.defenseDelta.state, v: e.defenseDelta.v });
  }
  if (typeof e.addCardId === 'string' && e.addCardId) {
    out.push({ k:'addCard', who:'self', cardId: e.addCardId });
  }

  // ---- v2.1E style keys ----
  if (typeof e.drawSelf === 'number' && e.drawSelf > 0)
    out.push({ k:'draw', who:'self', n: e.drawSelf });

  if (typeof e.drawOpponent === 'number' && e.drawOpponent > 0)
    out.push({ k:'draw', who:'opponent', n: e.drawOpponent });

  if (typeof e.ipSelf === 'number' && e.ipSelf)
    out.push({ k:'ip', who:'self', v: e.ipSelf });

  if (typeof e.ipOpponent === 'number' && e.ipOpponent)
    out.push({ k:'ip', who:'opponent', v: e.ipOpponent });

  if (typeof e.discardOpponent === 'number' && e.discardOpponent > 0)
    out.push({ k:'discardRandom', who:'opponent', n: e.discardOpponent });

  if (typeof e.discardOpponentChoice === 'number' && e.discardOpponentChoice > 0)
    out.push({ k:'discardChoice', who:'opponent', n: e.discardOpponentChoice });

  // ---- Legacy flat keys ----
  if (typeof e.draw === 'number' && e.draw > 0)
    out.push({ k:'draw', who:'self', n: e.draw });

  if (e.ipDelta != null) {
    if (typeof e.ipDelta === 'number') {
      out.push({ k:'ip', who:'self', v: e.ipDelta });
    } else {
      if (e.ipDelta.self)     out.push({ k:'ip', who:'self',     v: e.ipDelta.self });
      if (e.ipDelta.opponent) out.push({ k:'ip', who:'opponent', v: e.ipDelta.opponent });
    }
  }

  if (typeof e.discardRandom === 'number' && e.discardRandom > 0)
    out.push({ k:'discardRandom', who:'opponent', n: e.discardRandom });

  if (typeof e.discardChoice === 'number' && e.discardChoice > 0)
    out.push({ k:'discardChoice', who:'opponent', n: e.discardChoice });

  // ---- Conditional (supported in both styles) ----
  const cond = mapConditional(e);
  if (cond) out.push(cond);

  return out;
}

export function normalizeCard<T extends { id:string; text?:string; flavor?:string; effects?: LegacyEffects }>(card:T): T & { effects: Effect[] } {
  // Non-blocking English guard
  const nonAscii = (s?:string) => !!s && /[^\x00-\x7F]/.test(s);
  if (nonAscii(card.text) || nonAscii(card.flavor)) {
    console.warn(`[i18n] Non-ASCII text on ${card.id}. In-game text must be English.`);
  }
  return { ...card, effects: normalizeEffects(card.effects) };
}

export function normalizeDeck<T extends { id: string; text?: string; flavor?: string; effects?: LegacyEffects }>(cards: T[]): (T & { effects: Effect[] })[] {
  return (cards ?? []).map(normalizeCard);
}
