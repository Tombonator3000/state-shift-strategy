export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type Effect =
  | { k: 'ip'; who: 'player' | 'ai'; v: number }
  | { k: 'truth'; who: 'player' | 'ai'; v: number }
  | { k: 'pressure'; who: 'player' | 'ai'; state: string; v: number }
  | { k: 'defense'; state: string; v: 1 | -1 }
  | { k: 'draw'; who: 'player' | 'ai'; n: number }
  | { k: 'discardRandom'; who: 'player' | 'ai'; n: number }
  | { k: 'discardChoice'; who: 'player' | 'ai'; n: number }
  | { k: 'addCard'; who: 'player' | 'ai'; cardId: string }
  | { k: 'flag'; name: string; on?: boolean }
  | { k: 'conditional'; if: (gs: any, target: any) => boolean; then: Effect[]; else?: Effect[] }
  | { k: 'special'; fn: (gs: any, target: any) => void };

function reshuffle(gs: any, who: 'player' | 'ai') {
  const deck = gs.decks[who];
  const discard = gs.discards[who];
  while (deck.length > 0) discard.push(deck.pop());
  // simple Fisher-Yates shuffle
  for (let i = discard.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [discard[i], discard[j]] = [discard[j], discard[i]];
  }
  gs.decks[who] = discard.splice(0);
}

export function drawCards(gs: any, who: 'player' | 'ai', n: number) {
  for (let i = 0; i < n; i++) {
    if (gs.decks[who].length === 0) reshuffle(gs, who);
    if (gs.decks[who].length === 0) return; // nothing left
    const card = gs.decks[who].pop();
    if (gs.hands[who].length < 7) {
      gs.hands[who].push(card);
    } else {
      gs.discards[who].push(card); // overflow goes to discard
    }
  }
}

export function discardRandom(gs: any, who: 'player' | 'ai', n: number) {
  for (let i = 0; i < n && gs.hands[who].length > 0; i++) {
    const idx = Math.floor(Math.random() * gs.hands[who].length);
    const [c] = gs.hands[who].splice(idx, 1);
    gs.discards[who].push(c);
  }
}

export function promptDiscardChoice(gs: any, who: 'player' | 'ai', n: number) {
  // TODO: UI modal for human. For AI, pick lowest-value card.
  // For now: if AI, auto-pick. If player, trigger callback placeholder.
  if (who === 'ai') {
    discardRandom(gs, who, n);
  } else {
    // placeholder for UI integration
    gs.pendingDiscard = { who, n };
  }
}

export function addCardToHand(gs: any, who: 'player' | 'ai', cardId: string) {
  const card = gs.cardLibrary?.[cardId];
  if (card && gs.hands[who].length < 7) {
    gs.hands[who].push({ ...card });
  }
}

export function applyEffects(gs: any, effects: Effect[] | ((ctx: any) => Effect[]), ctx: any) {
  if (!effects) return;

  const effList = typeof effects === 'function' ? effects(ctx) : effects;

  for (const eff of effList) {
    switch (eff.k) {
      case 'ip':
        gs[eff.who].ip = Math.max(0, gs[eff.who].ip + eff.v);
        break;

      case 'truth':
        gs.truth = Math.max(0, Math.min(100, gs.truth + eff.v));
        break;

      case 'pressure':
        if (!gs.pressure[eff.state]) gs.pressure[eff.state] = { player: 0, ai: 0 };
        gs.pressure[eff.state][eff.who] = (gs.pressure[eff.state][eff.who] || 0) + eff.v;
        break;

      case 'defense':
        gs.states[eff.state].defense = Math.max(1, gs.states[eff.state].defense + eff.v);
        break;

      case 'draw':
        drawCards(gs, eff.who, eff.n);
        break;

      case 'discardRandom':
        discardRandom(gs, eff.who, eff.n);
        break;

      case 'discardChoice':
        promptDiscardChoice(gs, eff.who, eff.n);
        break;

      case 'addCard':
        addCardToHand(gs, eff.who, eff.cardId);
        break;

      case 'flag':
        gs.flags = gs.flags || {};
        gs.flags[eff.name] = eff.on ?? true;
        break;

      case 'conditional':
        if (eff.if(gs, ctx?.target)) {
          applyEffects(gs, eff.then, ctx);
        } else if (eff.else) {
          applyEffects(gs, eff.else, ctx);
        }
        break;

      case 'special':
        eff.fn(gs, ctx?.target);
        break;

      default:
        console.warn('Unknown effect', eff);
    }
  }
}

export default applyEffects;
