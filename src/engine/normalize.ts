export type Normalized = {
  truthDelta?: number;
  ipDelta?: { self?: number; opponent?: number };
  draw?: number;
  discardOpponent?: number;
  discardRandom?: number; // Support for legacy random discard
  pressureDelta?: number;
  zoneDefense?: number;
  reduceFactor?: number; // For partial blocking defensive cards (0-1)
  conditional?: any;
  flags?: {
    blockAttack?: boolean;
    immune?: boolean;
    bonusDraw?: number;
    zoneCostReduction?: number;
    skipActionAI?: boolean;
    forceDiscard?: number;
  };
  development?: { income?: number; mediaCost?: number };
  // support for "duration": "thisTurn" (set via flags)
  duration?: "thisTurn";
};

export function normalizeEffects(effectsField: any): Normalized {
  // 1) Flat v2.1E object
  if (effectsField && typeof effectsField === "object" && !Array.isArray(effectsField)) {
    // map alias antiTruthDelta → truthDelta if it exists
    const clone = { ...effectsField };
    if (typeof (clone as any).antiTruthDelta === "number") {
      clone.truthDelta = (clone.truthDelta || 0) + (clone as any).antiTruthDelta;
      delete (clone as any).antiTruthDelta;
    }
    // Handle legacy discardRandom field
    if (typeof (clone as any).discardRandom === "number") {
      clone.discardRandom = (clone as any).discardRandom;
    }
    // Handle reduceFactor for defensive cards
    if (typeof (clone as any).reduceFactor === "number") {
      clone.reduceFactor = Math.max(0, Math.min(1, (clone as any).reduceFactor)); // Clamp 0-1
    }
    return clone as Normalized;
  }

  // 2) List-based JSON-string (mini-language)
  let list: any[] = [];
  try { 
    if (typeof effectsField === "string") {
      list = JSON.parse(effectsField);
    }
  } catch { /* noop */ }

  const out: Normalized = {};
  for (const item of list || []) {
    switch (item.k) {
      case "truth": {
        out.truthDelta = (out.truthDelta || 0) + Number(item.v || item.value || 0);
        break;
      }
      case "ip": {
        const who = String(item.who || "").toLowerCase();
        out.ipDelta = out.ipDelta || {};
        if (who === "player" || who === "self") {
          out.ipDelta.self = (out.ipDelta.self || 0) + Number(item.v || 0);
        }
        if (who === "ai" || who === "opponent") {
          out.ipDelta.opponent = (out.ipDelta.opponent || 0) + Number(item.v || 0);
        }
        break;
      }
      case "draw": {
        out.draw = (out.draw || 0) + Number(item.v || item.value || 0);
        break;
      }
      case "discardOpponent": {
        out.discardOpponent = (out.discardOpponent || 0) + Number(item.v || item.value || 0);
        break;
      }
      case "discardRandom": {
        out.discardRandom = (out.discardRandom || 0) + Number(item.v || item.value || 0);
        break;
      }
      case "pressure": {
        out.pressureDelta = (out.pressureDelta || 0) + Number(item.v || item.value || 0);
        break;
      }
      case "zoneDefense": {
        out.zoneDefense = (out.zoneDefense || 0) + Number(item.v || item.value || 0);
        break;
      }
      case "reduceFactor": {
        const factor = Number(item.v || item.value || 0);
        out.reduceFactor = Math.max(0, Math.min(1, factor)); // Clamp 0-1
        break;
      }
      case "flag": {
        out.flags = out.flags || {};
        if (item.name === "blockAttack") out.flags.blockAttack = !!item.value;
        if (item.name === "immune") out.flags.immune = !!item.value;
        if (item.name === "bonusDraw") out.flags.bonusDraw = (out.flags.bonusDraw || 0) + Number(item.value || 0);
        if (item.name === "zoneCostReduction") out.flags.zoneCostReduction = (out.flags.zoneCostReduction || 0) + Number(item.value || 0);
        if (item.name === "skipAction" && (item.target === "ai" || item.target === "opponent")) {
          out.flags.skipActionAI = !!item.value;
        }
        if (item.name === "forceDiscard") out.flags.forceDiscard = (out.flags.forceDiscard || 0) + Number(item.value || 0);
        if (item.name === "counterNext") out.duration = "thisTurn";
        break;
      }
      case "development": {
        out.development = out.development || {};
        if (item.type === "income") out.development.income = (out.development.income || 0) + Number(item.value || 0);
        if (item.type === "mediaCost") out.development.mediaCost = (out.development.mediaCost || 0) + Number(item.value || 0);
        break;
      }
      default: break; // unknown → ignore for now
    }
  }
  return out;
}