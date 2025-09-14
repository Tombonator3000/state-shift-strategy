import { Card, Context } from "./types";
import { applyEffects } from "./effects";

export type PlayOutcome = "played"|"blocked"|"failed"|"reaction-pending";

export function effectiveCostFor(ctx:Context, owner:"P1"|"P2", card:Card){
  const mods = ctx.state.players[owner].costMods||{};
  let m = card.cost;
  if (card.type==="ZONE" && typeof mods.zone==="number") m = Math.max(0,m+mods.zone);
  if (card.type==="MEDIA" && typeof mods.media==="number") m = Math.max(0,m+mods.media);
  return m;
}
export function canAfford(ctx:Context, owner:"P1"|"P2", card:Card){ return ctx.state.players[owner].ip >= effectiveCostFor(ctx, owner, card); }
export function payCost(ctx:Context, owner:"P1"|"P2", card:Card){ ctx.state.players[owner].ip -= effectiveCostFor(ctx, owner, card); }

export function resolveCard(ctx:Context, owner:"P1"|"P2", card:Card, targetStateId?:string){
  applyEffects(ctx, owner, card.effects||{}, targetStateId);
  const you = ctx.state.players[owner];
  you.hand = you.hand.filter(c=>c!==card);
  you.discard.push(card);
  if (card.type==="ZONE") you.zones.push(card.id);
}

export function playCard(ctx:Context, owner:"P1"|"P2", card:Card, targetStateId?:string): PlayOutcome {
  if (!canAfford(ctx, owner, card)) return "failed";
  payCost(ctx, owner, card);
  const defender = owner==="P1"?"P2":"P1";
  const needsReaction = (card.type==="ATTACK" || card.type==="MEDIA");
  if (needsReaction && ctx.openReaction){ ctx.openReaction(card, owner, defender); return "reaction-pending"; }
  resolveCard(ctx, owner, card, targetStateId); return "played";
}

export function resolveReaction(ctx:Context, attack:{card:Card, attacker:"P1"|"P2", targetStateId?:string}, defenseCard:Card|null): PlayOutcome {
  const { card:attackCard, attacker, targetStateId } = attack; const defender = attacker==="P1"?"P2":"P1";
  let blocked = false;
  if (defenseCard) {
    if (canAfford(ctx, defender, defenseCard)) {
      payCost(ctx, defender, defenseCard);
      resolveCard(ctx, defender, defenseCard, targetStateId);
      if (ctx.turnFlags?.[defender]?.blockAttack) blocked = true;
    }
  }
  if (!blocked && ctx.turnFlags?.[defender]?.immune) blocked = true;

  // ✍️ Avislogg (headline/artikkel)
  const outcome = blocked ? "blocked" : "played";
  logNewspaperEntry(ctx, attackCard, attacker, blocked);

  if (blocked) {
    const you = ctx.state.players[attacker];
    you.hand = you.hand.filter(c=>c!==attackCard);
    you.discard.push(attackCard);
    return "blocked";
  }
  resolveCard(ctx, attacker, attackCard, targetStateId);
  return "played";
}

// === Newspaper ===
function logNewspaperEntry(ctx:Context, attackCard:Card, attacker:"P1"|"P2", blocked:boolean){
  if (!ctx.news?.push) return;
  const atkFaction = ctx.state.players[attacker].faction;
  const entry = makeHeadline(attackCard, atkFaction, blocked);
  ctx.news.push(entry);
}

export function makeHeadline(card:Card, deck:"truth"|"government", blocked:boolean){
  const when = Date.now();
  const tags = [deck, card.type.toLowerCase()];
  const attack = card.name.toUpperCase();

  const blockedHeads = [
    `BUREAUCRATS CRUSH: ${attack}`,
    `TOP SECRET SHIELD HALTS ${attack}`,
    `“NOT TODAY,” SAYS DEEP STATE TO ${attack}`,
    `TABLOID PANIC AVERTED: ${attack} BLOCKED`,
  ];
  const hitHeads = [
    `${attack}! PUBLIC IN SHOCK`,
    `NATION REELS AS ${attack} LANDS`,
    `EVIDENCE MOUNTS: ${attack}`,
    `AREA 51 WHISTLEBLOWER YELLS: ${attack}`,
  ];

  const headline = blocked ? pick(blockedHeads) : pick(hitHeads);
  const body = blocked
    ? `Sources claim a shadowy defense neutralized "${card.name}". Officials deny everything. Citizens advised to remain calm and buy extra tinfoil.`
    : `"${card.name}" rocked the nation. Eyewitnesses report lights in the sky, missing files, and a suspicious briefcase. More on page 2.`;

  return { id:`news-${when}-${Math.random().toString(16).slice(2)}`, when, headline, deck, body, tags };
}

function pick<T>(arr:T[]):T { return arr[Math.floor(Math.random()*arr.length)] }
