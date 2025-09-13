import { Article, Card, NewspaperConfig, NewspaperIssue } from "@/types/newspaper";

let _cfg: NewspaperConfig | null = null;
const _queue: Article[] = [];

export async function loadConfig(): Promise<NewspaperConfig> {
  if (_cfg) return _cfg;
  try {
    const res = await fetch("/data/newspaper.config.json", { cache: "no-store" });
    _cfg = await res.json();
  } catch (e) {
    console.warn("[Newspaper] Failed to load config:", e);
    _cfg = {
      mastheads: [{ name: "The Paranoid Times" }],
      ads: [{ title: "Buy 2 Tinfoil Hats — Get 3rd FREE!", body: "Now 5G-proof* (*not evaluated)" }],
      headlineTemplates: [{ type: "GENERIC", faction: "Any", templates: ["{CARD}!", "SOURCES WHISPER: {CARD}"] }],
      sidebars: ["DIY Faraday Beanie in 3 steps."],
      tickers: ["Scientists demand pixels; pixels refuse comment."],
      editorialStamps: ["EXCLUSIVE!", "TOP SECRET!", "ALIEN LEAK!"]
    };
  }
  return _cfg!;
}

export function queueArticleFromCard(card: Card, ctx: { round: number; state: any }) {
  if (!_cfg) return;
  const cfg = _cfg;
  const isEvent = !!card.meta?.isEvent;
  const title = card.meta?.headlineOverride ?? generateHeadline(card, cfg);
  const dek = pickDek(card);
  const body = buildBodyParagraphs(card, ctx);
  const imageUrl = card.image ?? "/img/classified-placeholder.png";
  const stamps = pickStamps(cfg, isEvent);
  _queue.push({ cardId: card.id, isEvent, title, dek, body, imageUrl, stamps });
}

export function flushForRound(round: number): NewspaperIssue {
  const cfg = _cfg!;
  const masthead = chooseMasthead(cfg);
  const ads = pickAds(cfg, 2 + Math.floor(Math.random() * 2));
  const sidebars = pickSidebars(cfg, 1);
  const tickers: string[] = [];

  const lead = _queue.splice(0, 3);
  const brief = _queue.length ? _queue.shift()! : null;
  while (_queue.length) tickers.push(shortlineFrom(_queue.shift()!));

  return { round, masthead, lead, brief, ads, tickers, sidebars };
}

/* ---------------- helpers ---------------- */
function generateHeadline(card: Card, cfg: NewspaperConfig): string {
  const templates = pickTemplates(cfg, card);
  const tpl = templates[Math.floor(Math.random() * templates.length)] ?? "{CARD}!";
  return fill(tpl, {
    CARD: card.name,
    EFFECT: summarizeEffects(card.effects),
    PLACE: summarizePlace(card.target),
    TARGET: summarizeTarget(card.target),
    VALUE: extractPercent(card.effects)
  });
}

function pickTemplates(cfg: NewspaperConfig, card: Card): string[] {
  const exact = cfg.headlineTemplates.find(
    h => h.type === card.type && (h.faction === card.faction || h.faction === "Any")
  );
  if (exact?.templates?.length) return exact.templates;
  const generic = cfg.headlineTemplates.find(h => h.type === "GENERIC");
  return generic?.templates ?? ["{CARD}!"];
}

function pickDek(card: Card): string | undefined {
  return card.flavorTruth ?? card.flavorGov ?? card.flavor ?? undefined;
}

function buildBodyParagraphs(card: Card, ctx: { round: number; state: any }): string[] {
  const eff = summarizeEffects(card.effects);
  const tgt = summarizeTarget(card.target);
  return [
    `${card.name} played this round. ${eff ? eff + "." : ""}`,
    tgt ? `Witnesses reported activity affecting ${tgt}.` : `Details remain undisclosed.`,
    `Experts insist results are "within expected anomalies".`,
    `Sources hint more to come next round.`
  ].filter(Boolean);
}

function pickStamps(cfg: NewspaperConfig, isEvent: boolean): string[] {
  const s = cfg.editorialStamps ?? [];
  const out: string[] = [];
  if (isEvent) out.push("BREAKING!");
  if (s.length) out.push(s[Math.floor(Math.random() * s.length)]);
  return out;
}

function chooseMasthead(cfg: NewspaperConfig): string {
  const list = cfg.mastheads?.length ? cfg.mastheads : [{ name: "The Paranoid Times" }];
  return list[Math.floor(Math.random() * list.length)].name;
}

function pickAds(cfg: NewspaperConfig, n: number) {
  const src = cfg.ads ?? [];
  const shuffled = [...src].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(0, Math.min(n, shuffled.length)));
}

function pickSidebars(cfg: NewspaperConfig, n: number) {
  const src = cfg.sidebars ?? [];
  const shuffled = [...src].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(0, Math.min(n, shuffled.length)));
}

function shortlineFrom(a: Article): string {
  return a.title;
}

function summarizeEffects(e: any): string {
  if (!e) return "";
  const td = e.truthDelta ?? e.truth ?? e.delta ?? 0;
  if (typeof td === "number" && td !== 0) {
    const sign = td > 0 ? "+" : "";
    return `Truth ${sign}${td}%`;
  }
  if (typeof e.draw === "number" && e.draw > 0) return `Draw ${e.draw}`;
  return "Unspecified effects";
}

function extractPercent(e: any): string {
  if (!e) return "";
  const td = e.truthDelta ?? 0;
  return typeof td === "number" ? Math.abs(Math.round(td)).toString() : "";
}

function summarizePlace(target: any): string {
  if (!target) return "Undisclosed Location";
  return target.name ?? target.state ?? target.zone ?? "Undisclosed Location";
}

function summarizeTarget(target: any): string {
  if (!target) return "Opposition";
  return target.scope ?? target.player ?? target.state ?? "Opposition";
}

function fill(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}
