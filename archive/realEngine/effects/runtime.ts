import type { SideAbs } from './types';

export function drawCards(gs:any, who:SideAbs, n:number) {
  for (let i=0; i<n; i++) {
    if (!gs.decks[who]?.length) reshuffle(gs, who);
    if (!gs.decks[who]?.length) return;
    const card = gs.decks[who].pop();
    if (gs.hands[who].length < 7) gs.hands[who].push(card);
    else gs.discards[who].push(card);
  }
}

function reshuffle(gs:any, who:SideAbs) {
  while (gs.discards[who]?.length) gs.decks[who].push(gs.discards[who].pop());
  for (let i=gs.decks[who].length-1;i>0;i--) {
    const j = (Math.random()*(i+1))|0;
    [gs.decks[who][i], gs.decks[who][j]] = [gs.decks[who][j], gs.decks[who][i]];
  }
}

export function discardRandom(gs:any, who:SideAbs, n:number) {
  const hand = gs.hands[who] as any[];
  for (let i=0; i<n && hand.length>0; i++) {
    const idx = (Math.random()*hand.length)|0;
    const [c] = hand.splice(idx,1);
    gs.discards[who].push(c);
  }
}

export async function discardChoice(gs:any, who:SideAbs, n:number, ctx:any) {
  const hand = gs.hands[who] as any[];
  if (!hand.length) return;

  if (!ctx.ui?.promptSelectCards) {
    discardRandom(gs, who, n);
    return;
  }

  const picked = await ctx.ui.promptSelectCards({ from: who, zone:'hand', count:n, reveal:true });
  for (const ref of picked) {
    const i = hand.findIndex(c => c.id === ref.id);
    if (i >= 0) {
      const [c] = hand.splice(i,1);
      gs.discards[who].push(c);
    }
  }
}
