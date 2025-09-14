import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sword, Ban, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export type Faction = "truth" | "government";
export type CardType = "MEDIA" | "ZONE" | "ATTACK" | "DEFENSIVE" | "TECH" | "DEVELOPMENT" | "INSTANT" | "LEGENDARY";
export interface Card { id: string; name: string; faction: Faction; type: CardType; cost: number; effects: any; }

interface ClashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attackCard: Card | null;
  attackerName: string;
  defenseHand: Card[];
  defenderName: string;
  onDefend: (card: Card | null) => void; // velg forsvarskort eller “ingen”
  outcome?: "blocked" | "played" | null;
  busy?: boolean;
}

const Masthead: React.FC<{ title?: string; kicker?: string }> = ({ title="WEEKLY WORLD CLASH", kicker="ATTACK vs DEFENSE" }) => (
  <div className="relative overflow-hidden rounded-t-xl border-b border-black/10">
    <div className="absolute inset-0 bg-[radial-gradient(black_1px,transparent_1px)] [background-size:4px_4px] opacity-[0.06]" />
    <div className="bg-neutral-50 px-4 py-3 flex items-baseline justify-between font-black tracking-wide uppercase">
      <span className="text-2xl md:text-3xl [text-shadow:_1px_1px_0_#fff]">{title}</span>
      <span className="text-sm text-red-700">{kicker}</span>
    </div>
    <div className="absolute -right-8 -top-6 rotate-12">
      <div className="bg-red-700 text-white px-6 py-1 font-extrabold tracking-widest shadow-md">EXTRA!</div>
    </div>
  </div>
);

const SectionHeadline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-3 mb-2 px-3 py-1 bg-black text-white inline-block font-extrabold tracking-wider uppercase rounded">{children}</div>
);

const Stamp: React.FC<{ kind: "blocked" | "hit" }> = ({ kind }) => (
  <motion.div initial={{ rotate: -8, scale: 0.7, opacity: 0 }} animate={{ rotate: -8, scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={clsx("absolute z-20 -top-4 -left-4 px-4 py-1 rounded rotate-[-8deg] border-4 text-2xl font-extrabold tracking-wider",
      kind==="blocked" ? "bg-red-50/90 border-red-700 text-red-800" : "bg-green-50/90 border-green-700 text-green-800")}
  >
    {kind==="blocked"?"BLOCKED!":"HIT!"}
  </motion.div>
);

function effectSummary(effects: any): string[] {
  try {
    if (typeof effects === "string") {
      const arr = JSON.parse(effects);
      if (Array.isArray(arr)) {
        return arr.map((e: any) => {
          switch (e.k) {
            case "truth": return `Truth ${e.v>0?"+":""}${e.v}%`;
            case "ip": return `IP ${e.who==="player"?"you":"opponent"} ${e.v>0?"+":""}${e.v}`;
            case "pressure": return `Pressure ${e.v>0?"+":""}${e.v}`;
            case "flag": return `Flag: ${e.name}${e.value!=null?`=${e.value}`:""}`;
            case "development": return `Dev: ${e.type}${e.value!=null?`=${e.value}`:""}`;
            default: return `${e.k ?? "effect"}`;
          }
        });
      }
    }
  } catch {}
  if (effects && typeof effects === "object") {
    const lines: string[] = [];
    if (typeof effects.truthDelta === "number") lines.push(`Truth ${effects.truthDelta>0?"+":""}${effects.truthDelta}%`);
    if (effects.ipDelta?.self) lines.push(`IP you +${effects.ipDelta.self}`);
    if (effects.ipDelta?.opponent) lines.push(`IP opp ${effects.ipDelta.opponent>0?"+":""}${effects.ipDelta.opponent}`);
    if (effects.draw) lines.push(`Draw ${effects.draw}`);
    if (effects.discardOpponent) lines.push(`Opponent discards ${effects.discardOpponent}`);
    if (effects.zoneDefense) lines.push(`Zone Defense +${effects.zoneDefense}`);
    if (effects.pressureDelta) lines.push(`Pressure ${effects.pressureDelta>0?"+":""}${effects.pressureDelta}`);
    if (effects.conditional) lines.push(`Conditional`);
    return lines.length?lines:["Effect"];
  }
  return ["Effect"];
}

const CardPanel: React.FC<{ card: Card; role: "attack"|"defense" }> = ({ card, role }) => {
  const lines = effectSummary(card.effects);
  return (
    <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }}
      className={clsx("relative rounded-xl border-2 p-3 shadow-sm w-full", role==="attack"?"border-red-700/60 bg-red-50":"border-blue-700/60 bg-blue-50")}
    >
      <div className="absolute -left-2 -top-3 rotate-[-4deg] bg-black text-white text-[10px] font-extrabold tracking-widest px-2 py-[2px] rounded">
        {role==="attack"?"ATTACK":"DEFENSIVE"}
      </div>
      <div className="flex items-center gap-2">
        {role==="attack"?<Sword className="w-5 h-5 text-red-700" />:<Shield className="w-5 h-5 text-blue-700" />}
        <div className="font-extrabold uppercase tracking-wide">{card.name}</div>
        <div className="ml-auto text-xs opacity-70">Cost {card.cost}</div>
      </div>
      <div className="mt-2 text-sm leading-snug">
        {lines.map((l,i)=>(
          <div key={i} className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-current opacity-70" />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function ClashModal({
  open, onOpenChange, attackCard, attackerName, defenseHand, defenderName, onDefend, outcome=null, busy=false,
}: ClashModalProps) {
  const [tab, setTab] = React.useState<"defend"|"preview">("defend");
  const canDefend = defenseHand.length>0;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-neutral-950/70">
          <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px] opacity-[0.18]" />
        </Dialog.Overlay>
        <Dialog.Content className="fixed left-1/2 top-10 -translate-x-1/2 w-[min(960px,95vw)] rounded-xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
          <Masthead />
          <div className="bg-neutral-50">
            <div className="px-4 pt-3">
              <SectionHeadline>Tonight’s Headline</SectionHeadline>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="relative flex-1">
                  {attackCard && outcome && (
                    <AnimatePresence><Stamp kind={outcome==="blocked"?"blocked":"hit"} /></AnimatePresence>
                  )}
                  {attackCard ? <CardPanel card={attackCard} role="attack" /> :
                    <div className="rounded-xl border-2 border-dashed p-6 text-center text-sm opacity-60">No attack card</div>}
                  <div className="mt-1 text-xs uppercase tracking-wider font-black text-red-800 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {attackerName}
                  </div>
                </div>
                <div className="flex items-center justify-center md:pt-8">
                  <div className="text-3xl font-extrabold tracking-widest text-black/70">VS</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between pr-1">
                    <div className="text-xs uppercase tracking-wider font-black text-blue-800 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {defenderName}
                    </div>
                    <div className="flex gap-2">
                      <Button variant={tab==="defend"?"default":"secondary"} onClick={()=>setTab("defend")} className="h-7 px-2 text-xs">Defend</Button>
                      <Button variant={tab==="preview"?"default":"secondary"} onClick={()=>setTab("preview")} className="h-7 px-2 text-xs">Preview All</Button>
                    </div>
                  </div>
                  {tab==="defend" ? (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
                      {canDefend ? defenseHand.map(c=>(
                        <button key={c.id} disabled={busy} onClick={()=>onDefend(c)}
                          className={clsx("relative text-left rounded-lg border-2 p-2 bg-white hover:bg-blue-50 transition","border-blue-700/60")}>
                          <div className="absolute -left-2 -top-3 rotate-[-4deg] bg-black text-white text-[9px] font-extrabold tracking-widest px-2 py-[2px] rounded">
                            DEFENSIVE
                          </div>
                          <div className="font-bold">{c.name}</div>
                          <div className="text-xs opacity-70">Cost {c.cost}</div>
                          <div className="mt-1 text-xs leading-tight opacity-90 line-clamp-3">
                            {effectSummary(c.effects).join(" • ")}
                          </div>
                        </button>
                      )) : (
                        <div className="rounded-lg border-2 border-dashed p-6 text-center text-sm opacity-60">No defensive cards available</div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border bg-white/70 px-3 py-2 text-[13px] leading-tight max-h-56 overflow-auto">
                      <ul className="list-disc pl-4">
                        {(defenseHand.length?defenseHand:[{id:"none",name:"—",cost:0,effects:{}} as Card]).map(c=>(
                          <li key={c.id} className="mb-1">
                            <span className="font-semibold">{c.name}</span> — {effectSummary(c.effects).join(" • ")} <span className="opacity-60">(cost {c.cost})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border-t mt-3 bg-neutral-100">
              <div className="text-[11px] tracking-wider uppercase font-extrabold">Action: Choose a defensive move — or concede the headline.</div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={()=>onOpenChange(false)} disabled={busy} className="gap-1"><X className="w-4 h-4" /> Close</Button>
                <Button variant="destructive" onClick={()=>onDefend(null)} disabled={busy} className="gap-1"><Ban className="w-4 h-4" /> Don’t Defend</Button>
              </div>
            </div>
            <div className="px-4 py-2 bg-neutral-200 text-[11px] font-semibold tracking-wide uppercase text-neutral-700 border-t">
              Breaking: Government Denies Everything • Elk Photographed Riding UFO • Florida Man Appointed Minister of Truth
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
