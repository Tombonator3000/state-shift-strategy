import { Card, Context } from "./types";
import { applyEffects } from "./effects";

export type PlayOutcome = "played" | "blocked" | "failed";

export function effectiveCostFor(ctx: Context, owner: "P1" | "P2", card: Card) {
  const mods = ctx.state.players[owner].costMods || {};
  let m = card.cost;
  if (card.type === "ZONE" && typeof mods.zone === "number") {
    m = Math.max(0, m + mods.zone);
  }
  if (card.type === "MEDIA" && typeof mods.media === "number") {
    m = Math.max(0, m + mods.media);
  }
  return m;
}

export function canAfford(ctx: Context, owner: "P1" | "P2", card: Card): boolean {
  return ctx.state.players[owner].ip >= effectiveCostFor(ctx, owner, card);
}

export function payCost(ctx: Context, owner: "P1" | "P2", card: Card) {
  ctx.state.players[owner].ip -= effectiveCostFor(ctx, owner, card);
}

export function resolveCard(ctx: Context, owner: "P1" | "P2", card: Card, targetStateId?: string) {
  applyEffects(ctx, owner, card.effects || {}, targetStateId);
  const you = ctx.state.players[owner];
  
  // Fix: Use ID-based filtering instead of reference equality
  console.log(`[Engine] Removing card ${card.id} from ${owner} hand (${you.hand.length} cards)`);
  const originalHandSize = you.hand.length;
  you.hand = you.hand.filter(c => c.id !== card.id);
  console.log(`[Engine] Hand after removal: ${you.hand.length} cards (removed: ${originalHandSize - you.hand.length})`);
  
  you.discard.push(card);
  if (card.type === "ZONE") {
    you.zones.push(card.id);
  }
}

export function playCard(ctx: Context, owner: "P1" | "P2", card: Card, targetStateId?: string): PlayOutcome | "reaction-pending" {
  if (!canAfford(ctx, owner, card)) return "failed";
  payCost(ctx, owner, card);

  const defender = owner === "P1" ? "P2" : "P1";
  const needsReaction = (card.type === "ATTACK" || card.type === "MEDIA");
  
  if (needsReaction && ctx.openReaction) {
    ctx.openReaction(card, owner, defender); // UI opens ReactionModal for human, AI can auto
    return "reaction-pending";
  }

  resolveCard(ctx, owner, card, targetStateId);
  return "played";
}

// Called from UI when reaction is chosen (defenseCard = null if "Don't Defend")
export function resolveReaction(
  ctx: Context, 
  attack: { card: Card, attacker: "P1" | "P2", targetStateId?: string }, 
  defenseCard: Card | null
): PlayOutcome {
  const { card: attackCard, attacker, targetStateId } = attack;
  const defender = attacker === "P1" ? "P2" : "P1";

  // 1) Defender plays optional defense
  let blocked = false;
  if (defenseCard) {
    if (canAfford(ctx, defender, defenseCard)) {
      payCost(ctx, defender, defenseCard);
      resolveCard(ctx, defender, defenseCard, targetStateId);
      const flags = ctx.turnFlags?.[defender];
      if (flags?.blockAttack) blocked = true;
    }
  }

  // 2) Attack resolve – check immunity
  if (!blocked) {
    const flags = ctx.turnFlags?.[defender];
    if (flags?.immune) {
      // Ignore effects that affect defender (truth/ip/pressure/forceDiscard) – no-op
      // But for simplicity: mark as blocked
      blocked = true;
    }
  }

  if (blocked) {
    // withdraw cost for attack? No – cost is paid. Only effects are nullified.
    const you = ctx.state.players[attacker];
    // Fix: Use ID-based filtering here too
    you.hand = you.hand.filter(c => c.id !== attackCard.id);
    you.discard.push(attackCard);
    return "blocked";
  }

  resolveCard(ctx, attacker, attackCard, targetStateId);
  return "played";
}