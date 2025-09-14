import { SideAbs } from './types';
import { safePushToHand } from '../draw';

function reshuffle(gs: any, who: SideAbs) {
  const deck = gs.decks[who];
  const discard = gs.discards[who];
  while (deck.length > 0) discard.push(deck.pop());
  for (let i = discard.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [discard[i], discard[j]] = [discard[j], discard[i]];
  }
  gs.decks[who] = discard.splice(0);
}

export function drawCards(gs: any, who: SideAbs, n: number) {
  for (let i = 0; i < n; i++) {
    if (gs.decks[who].length === 0) reshuffle(gs, who);
    if (gs.decks[who].length === 0) return;
    const card = gs.decks[who].pop();
    if (card) safePushToHand(gs, who, card);
  }
}

export function discardRandom(gs: any, whoAbs: SideAbs, n: number) {
  const hand = gs.hands[whoAbs] as any[];
  for (let i = 0; i < n && hand.length > 0; i++) {
    const idx = (Math.random() * hand.length) | 0;
    const [c] = hand.splice(idx, 1);
    gs.discards[whoAbs].push(c);
  }
}

export async function discardChoice(gs: any, whoAbs: SideAbs, n: number, ctx: any) {
  const hand = gs.hands[whoAbs] as any[];
  if (!hand.length) return;

  if (!ctx.ui?.promptSelectCards) {
    discardRandom(gs, whoAbs, n);
    ctx.ui?.toast?.(`Opponent discarded ${n} card${n === 1 ? '' : 's'}.`);
    return;
  }

  const picked = await ctx.ui.promptSelectCards({
    from: whoAbs,
    zone: 'hand',
    count: n,
    reveal: true,
  });

  for (const ref of picked) {
    const i = hand.findIndex((c) => c.id === ref.id);
    if (i >= 0) {
      const [c] = hand.splice(i, 1);
      gs.discards[whoAbs].push(c);
    }
  }
  ctx.ui?.toast?.(`Opponent discarded ${picked.length} card${picked.length === 1 ? '' : 's'}.`);
}

export function addCardToHand(gs: any, who: SideAbs, cardId: string) {
  const card = gs.cardLibrary?.[cardId];
  if (card) safePushToHand(gs, who, { ...card });
}
