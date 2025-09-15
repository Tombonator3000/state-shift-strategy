import { Card, Context } from "./types";
import { applyCanonical } from "./applyStrict";

export type PlayOutcome = "played" | "blocked" | "failed" | "reaction-pending";

export function effectiveCostFor(ctx:Context, owner:"P1"|"P2", card:Card){
  const mods = ctx.state.players[owner].costMods || {};
  let m = card.cost;
  if (card.type==="ZONE"  && typeof mods.zone  === "number") m = Math.max(0, m + mods.zone);
  if (card.type==="MEDIA" && typeof mods.media === "number") m = Math.max(0, m + mods.media);
  return m;
}

export function canAfford(ctx: Context, owner:"P1"|"P2", card:Card): boolean {
  return ctx.state.players[owner].ip >= effectiveCostFor(ctx, owner, card);
}
export function payCost(ctx: Context, owner:"P1"|"P2", card:Card) {
  ctx.state.players[owner].ip -= effectiveCostFor(ctx, owner, card);
}

function defenderHasPlayableReaction(ctx: Context, defender: "P1" | "P2") {
  const hand = ctx.state.players[defender].hand;
  return hand.some(c => (c.type === "DEFENSIVE" || c.type === "INSTANT") && canAfford(ctx, defender, c));
}

export function resolveCard(ctx: Context, owner:"P1"|"P2", card:Card, targetStateId?: string){
  applyCanonical(ctx, owner, card.effects || {}, targetStateId);
  const you = ctx.state.players[owner];
  you.hand = you.hand.filter(c => c !== card);
  you.discard.push(card);
  if (card.type === "ZONE") you.zones.push(card.id);
}

export function playCard(ctx: Context, owner:"P1"|"P2", card:Card, targetStateId?: string): PlayOutcome {
  if (card.type === "ZONE" && !targetStateId) {
    ctx.log?.(`[warn] ZONE played without target → no effect`);
  }
  if (!canAfford(ctx, owner, card)) return "failed";
  payCost(ctx, owner, card);

  const defender = owner === "P1" ? "P2" : "P1";
  const needsReaction = (card.type === "ATTACK" || card.type === "MEDIA");
  if (needsReaction){
    const canReact = defenderHasPlayableReaction(ctx, defender);
    if (!canReact) {
      resolveCard(ctx, owner, card, targetStateId);
      return "played";
    }
    if (ctx.openReaction) {
      ctx.openReaction(card, owner, defender, targetStateId);
      return "reaction-pending";
    }
    resolveCard(ctx, owner, card, targetStateId);
    return "played";
  }

  resolveCard(ctx, owner, card, targetStateId);
  return "played";
}

// Kalles fra UI når reaction er valgt (defenseCard = null for “Don’t Defend”)
export function resolveReaction(ctx: Context, attack: {card:Card, attacker:"P1"|"P2", targetStateId?:string}, defenseCard: Card | null): PlayOutcome {
  const { card: attackCard, attacker, targetStateId } = attack;
  const defender = attacker === "P1" ? "P2" : "P1";

  let blocked = false;
  if (defenseCard && canAfford(ctx, defender, defenseCard)) {
    payCost(ctx, defender, defenseCard);
    resolveCard(ctx, defender, defenseCard, targetStateId);
    const flags = ctx.turnFlags?.[defender];
    if (flags?.blockAttack) blocked = true;
  }

  if (!blocked) {
    const flags = ctx.turnFlags?.[defender];
    if (flags?.immune) blocked = true;
  }

  // alltid forbruk angrepskortet (kost er allerede betalt)
  const atk = ctx.state.players[attacker];
  atk.hand = atk.hand.filter(c => c !== attackCard);
  atk.discard.push(attackCard);

  if (!blocked) {
    // vi har allerede lagt det i discard; men må kjøre effekter:
    applyCanonical(ctx, attacker, attackCard.effects || {}, targetStateId);
    ctx.turnFlags = {};
    return "played";
  } else {
    ctx.turnFlags = {};
    return "blocked";
  }
}
