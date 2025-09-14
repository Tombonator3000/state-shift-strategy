export type Normalized = {
  truthDelta?: number;
  ipDelta?: { self?: number; opponent?: number };
  draw?: number;
  discardOpponent?: number;
  pressureDelta?: number;
  zoneDefense?: number;
  conditional?: any;
  flags?: { blockAttack?: boolean; immune?: boolean; bonusDraw?: number; zoneCostReduction?: number; skipActionAI?: boolean; forceDiscard?: number; };
  development?: { income?: number; mediaCost?: number };
  duration?: "thisTurn";
};

export function normalizeEffects(e: any): Normalized {
  if (e && typeof e === "object" && !Array.isArray(e)) {
    const clone:any = { ...e };
    if (typeof clone.antiTruthDelta === "number") { clone.truthDelta = (clone.truthDelta||0) + clone.antiTruthDelta; delete clone.antiTruthDelta; }
    return clone;
  }
  let arr:any[]=[]; try { if (typeof e==="string") arr = JSON.parse(e); } catch {}
  const out: Normalized = {};
  for (const it of arr||[]) {
    switch (it.k) {
      case "truth": out.truthDelta = (out.truthDelta||0)+Number(it.v||it.value||0); break;
      case "ip": {
        const who = String(it.who||"").toLowerCase(); out.ipDelta = out.ipDelta||{};
        if (who==="player"||who==="self") out.ipDelta.self = (out.ipDelta.self||0)+Number(it.v||0);
        if (who==="ai"||who==="opponent") out.ipDelta.opponent = (out.ipDelta.opponent||0)+Number(it.v||0);
        break;
      }
      case "pressure": out.pressureDelta = (out.pressureDelta||0)+Number(it.v||it.value||0); break;
      case "flag": {
        out.flags = out.flags||{};
        if (it.name==="blockAttack") out.flags.blockAttack = !!it.value;
        if (it.name==="immune") out.flags.immune = !!it.value;
        if (it.name==="bonusDraw") out.flags.bonusDraw = (out.flags.bonusDraw||0)+Number(it.value||0);
        if (it.name==="zoneCostReduction") out.flags.zoneCostReduction = (out.flags.zoneCostReduction||0)+Number(it.value||0);
        if (it.name==="skipAction" && (it.target==="ai"||it.target==="opponent")) out.flags.skipActionAI = !!it.value;
        if (it.name==="forceDiscard") out.flags.forceDiscard = (out.flags.forceDiscard||0)+Number(it.value||0);
        if (it.name==="counterNext") out.duration = "thisTurn";
        break;
      }
      case "development": {
        out.development = out.development||{};
        if (it.type==="income") out.development.income = (out.development.income||0)+Number(it.value||0);
        if (it.type==="mediaCost") out.development.mediaCost = (out.development.mediaCost||0)+Number(it.value||0);
        break;
      }
      default: break;
    }
  }
  return out;
}
