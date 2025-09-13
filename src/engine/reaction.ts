import { EngineState, Card, PlayerID } from "./types";

// Dependencies from existing engine:
declare function other(p: PlayerID): PlayerID;
declare function applyEffects(effects: any, ctx: any): void;
declare function log(msg: string): void;
declare function discardIfNeeded(card?: Card): void;
declare function hasHarmfulEffect(card: Card): boolean; // use existing test

export function isReactiveAttack(card: Card): boolean {
  return card.type === "ATTACK" || (card.type === "MEDIA" && hasHarmfulEffect(card));
}

export function openReactionWindow(engine: EngineState, attacker: PlayerID, attackCard: Card) {
  engine.phase = "REACTION_WINDOW_OPEN";
  engine.clash = {
    open: true,
    attacker,
    defender: other(attacker),
    attackCard,
    windowMs: engine.clash?.windowMs ?? 4000,
    expiresAt: Date.now() + (engine.clash?.windowMs ?? 4000),
  };
}

export type Outcome =
  | { type: "BLOCK_ALL" }
  | { type: "REDUCE"; factor: number } // 0..1 (0.5 = 50%)
  | { type: "FULL_HIT" };

export function computeOutcome(attack: Card, defense?: Card): Outcome {
  if (!defense) return { type: "FULL_HIT" };
  // Simple standard: DEFENSIVE without special field blocks everything
  if (!defense.tags?.partialBlock) return { type: "BLOCK_ALL" };

  // If DEFENSIVE has partial-block in effects (e.g. { reduceFactor: 0.5 })
  const f = Math.max(0, Math.min(1, defense.effects?.reduceFactor ?? 0.5));
  return f <= 0 ? { type: "BLOCK_ALL" } : { type: "REDUCE", factor: f };
}

export function reduceEffects(effects: any, factor: number) {
  // Utility: scales numbers in a subset we care about (IP/truthDelta/damage)
  const copy = structuredClone(effects);
  if (typeof copy?.ipDelta === "number") copy.ipDelta = Math.round(copy.ipDelta * factor);
  if (typeof copy?.effects?.ipDelta === "number") copy.effects.ipDelta = Math.round(copy.effects.ipDelta * factor);
  if (typeof copy?.truthDelta === "number") copy.truthDelta = Math.round(copy.truthDelta * factor);
  if (typeof copy?.damage === "number") copy.damage = Math.round(copy.damage * factor);
  return copy;
}

export function resolveClash(engine: EngineState) {
  const { attackCard, defenseCard, attacker, defender } = engine.clash;
  if (!attackCard || !attacker || !defender) return;

  engine.phase = "RESOLVING";
  const outcome = computeOutcome(attackCard, defenseCard);

  if (outcome.type === "BLOCK_ALL") {
    log(`🛡️ ${defenseCard?.name ?? "Defense"} blocked ${attackCard.name}.`);
  } else if (outcome.type === "REDUCE") {
    const scaled = reduceEffects(attackCard.effects, outcome.factor);
    applyEffects(scaled, { attacker, defender, attackCard, defenseCard });
    log(`🛡️ ${defenseCard?.name ?? "Defense"} reduced ${attackCard.name} by ${Math.round(outcome.factor * 100)}%.`);
  } else {
    applyEffects(attackCard.effects, { attacker, defender, attackCard, defenseCard });
    log(`💥 ${attackCard.name} hits!`);
  }

  // Cleanup
  discardIfNeeded(attackCard);
  if (defenseCard) discardIfNeeded(defenseCard);

  engine.clash = { open: false, windowMs: engine.clash.windowMs };
  engine.phase = "IDLE";
}

export function closeReactionWindow(engine: EngineState) {
  engine.clash.open = false;
}