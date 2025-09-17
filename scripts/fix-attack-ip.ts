import fs from "node:fs";
import path from "node:path";

import { expectedCost, type Rarity } from "../src/rules/mvp";

const DATA_ROOT = path.join(process.cwd(), "src", "data");
const LOG_PATH = path.join(process.cwd(), "tools", "logs", "fix-attack-ip.json");

const AMOUNT_BY_RARITY: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  legendary: 4
};

const INDENT_STEP = "  ";

type RarityKey = Rarity;
type CardRecord = Record<string, unknown> & {
  id?: string;
  rarity?: RarityKey;
  type?: string;
  cost?: number;
  flavor?: string;
  flavorTruth?: string;
  flavorGov?: string;
  text?: string;
  effects?: any;
};

type EffectRecord = Record<string, unknown> & {
  ipDelta?: Record<string, unknown> & { opponent?: number };
  conditional?: unknown;
};

type ChangeLog = { file: string; id: string; rarity?: string; fix: string };

const changes: ChangeLog[] = [];

function walkFiles(dir: string, collector: string[]): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, collector);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      collector.push(fullPath);
    }
  }
}

function findObjectBounds(content: string, matchIndex: number): { start: number; end: number; indent: string } | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = matchIndex; i >= 0; i--) {
    const char = content[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === '}') {
      depth++;
      continue;
    }
    if (char === '{') {
      if (depth === 0) {
        start = i;
        break;
      }
      depth--;
    }
  }

  if (start === -1) return null;

  depth = 0;
  inString = false;
  stringChar = "";
  escaped = false;
  let end = -1;

  for (let i = start; i < content.length; i++) {
    const char = content[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === '{') {
      depth++;
      continue;
    }
    if (char === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) return null;

  const lineStart = content.lastIndexOf("\n", start) + 1;
  const indent = content.slice(lineStart, start);

  return { start, end, indent };
}

function parseObject(text: string): CardRecord {
  return Function("return (" + text + ");")();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function ensureFlavor(card: CardRecord): boolean {
  if (typeof card.flavor === "string" && card.flavor.length > 0) {
    if (/Opponent\s+gains/i.test(card.flavor)) {
      card.flavor = card.flavor.replace(/Opponent\s+gains/gi, "Opponent loses");
      return true;
    }
    return false;
  }

  const source = card.flavorTruth || card.flavorGov || "—";
  card.flavor = source;
  return true;
}

function sanitizeText(card: CardRecord): boolean {
  if (typeof card.text !== "string") return false;
  if (!/Opponent\s+gains/i.test(card.text)) return false;
  card.text = card.text.replace(/Opponent\s+gains/gi, "Opponent loses");
  return true;
}

function sanitizeFlavorSources(card: CardRecord): boolean {
  let updated = false;
  if (typeof card.flavorTruth === "string" && /Opponent\s+gains/i.test(card.flavorTruth)) {
    card.flavorTruth = card.flavorTruth.replace(/Opponent\s+gains/gi, "Opponent loses");
    updated = true;
  }
  if (typeof card.flavorGov === "string" && /Opponent\s+gains/i.test(card.flavorGov)) {
    card.flavorGov = card.flavorGov.replace(/Opponent\s+gains/gi, "Opponent loses");
    updated = true;
  }
  return updated;
}

function normalizeEffects(effects: EffectRecord | undefined, amount: number, enforceAmount: boolean = true): void {
  if (!effects || typeof effects !== "object") return;

  const ipDelta = (effects.ipDelta && typeof effects.ipDelta === "object") ? effects.ipDelta : {};
  for (const key of Object.keys(ipDelta)) {
    if (key !== "opponent") {
      delete (ipDelta as Record<string, unknown>)[key];
    }
  }
  const existing = typeof ipDelta.opponent === "number" ? Math.abs(ipDelta.opponent) : undefined;
  (ipDelta as Record<string, unknown>).opponent = enforceAmount ? amount : (existing ?? amount);
  effects.ipDelta = ipDelta;

  if (Array.isArray(effects.conditional)) {
    for (const cond of effects.conditional) {
      if (cond && typeof cond === "object") {
        normalizeConditional(cond as Record<string, unknown>, amount);
      }
    }
  } else if (effects.conditional && typeof effects.conditional === "object") {
    normalizeConditional(effects.conditional as Record<string, unknown>, amount);
  }
}

function normalizeConditional(conditional: Record<string, unknown>, amount: number): void {
  const thenEffects = conditional.then as EffectRecord | undefined;
  const elseEffects = conditional.else as EffectRecord | undefined;
  if (thenEffects) normalizeEffects(thenEffects, amount, false);
  if (elseEffects) normalizeEffects(elseEffects, amount, false);
}

function formatAny(value: unknown, indent: string, preferredKeys?: string[]): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const innerIndent = indent + INDENT_STEP;
    const items = value.map((item) => `${innerIndent}${formatAny(item, innerIndent)}`);
    return `[
${items.join(",\n")}\n${indent}]`;
  }

  if (value && typeof value === "object") {
    return formatObject(value as Record<string, unknown>, indent, preferredKeys);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  return String(value);
}

const CARD_KEY_ORDER = [
  "id",
  "faction",
  "name",
  "type",
  "rarity",
  "cost",
  "text",
  "flavor",
  "flavorTruth",
  "flavorGov",
  "target",
  "effects",
  "extId",
];

const EFFECT_KEY_ORDER = [
  "truthDelta",
  "ipDelta",
  "draw",
  "discardSelf",
  "discardOpponent",
  "pressureDelta",
  "zoneDefense",
  "captureBonus",
  "damage",
  "incomeBonus",
  "conditional",
  "duration",
  "repeatable",
  "requiresTarget",
  "tags",
];

function sortKeys(keys: string[], preferred: string[] = []): string[] {
  return keys.sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function formatObject(obj: Record<string, unknown>, indent: string, preferredOrder?: string[]): string {
  const keys = sortKeys(Object.keys(obj), preferredOrder ?? []);
  if (keys.length === 0) {
    return "{}";
  }

  const innerIndent = indent + INDENT_STEP;
  const lines: string[] = [];

  for (const key of keys) {
    const value = (obj as Record<string, unknown>)[key];
    if (value === undefined) continue;
    let childOrder: string[] | undefined;
    if (key === "effects") {
      childOrder = EFFECT_KEY_ORDER;
    } else if (key === "ipDelta") {
      childOrder = ["opponent"];
    }
    lines.push(`${innerIndent}${key}: ${formatAny(value, innerIndent, childOrder)}`);
  }

  if (lines.length === 0) {
    return "{}";
  }

  return `{
${lines.join(",\n")}\n${indent}}`;
}

function processCard(cardText: string, indent: string, filePath: string): { updatedText: string; changed: boolean; card: CardRecord } {
  const parsed = parseObject(cardText);
  const original = clone(parsed);

  if (parsed.type !== "ATTACK") {
    return { updatedText: indent + cardText.trimStart(), changed: false, card: parsed };
  }

  const rarity = parsed.rarity as RarityKey | undefined;
  if (!rarity || !(rarity in AMOUNT_BY_RARITY)) {
    return { updatedText: indent + cardText.trimStart(), changed: false, card: parsed };
  }

  const amount = AMOUNT_BY_RARITY[rarity];
  parsed.cost = expectedCost("ATTACK", rarity);
  parsed.effects = parsed.effects ?? {};
  normalizeEffects(parsed.effects as EffectRecord, amount);

  ensureFlavor(parsed);
  sanitizeFlavorSources(parsed);
  sanitizeText(parsed);

  if (parsed.flavor && /Opponent\s+gains/i.test(parsed.flavor)) {
    parsed.flavor = parsed.flavor.replace(/Opponent\s+gains/gi, "Opponent loses");
  }

  const formatted = `${indent}${formatObject(parsed as Record<string, unknown>, indent, CARD_KEY_ORDER)}`;
  const existingFormatted = `${indent}${cardText.trimStart()}`;
  const dataChanged = JSON.stringify(parsed) !== JSON.stringify(original);
  const formattedChanged = existingFormatted !== formatted;
  const changed = dataChanged || formattedChanged;

  if (changed) {
    changes.push({
      file: path.relative(process.cwd(), filePath),
      id: parsed.id ?? "UNKNOWN",
      rarity,
      fix: "attack-ip-normalized",
    });
  }

  return { updatedText: formatted, changed, card: parsed };
}

function processFile(filePath: string): void {
  const original = fs.readFileSync(filePath, "utf8");
  const pattern = /type\s*:\s*['"]ATTACK['"]/g;
  const matches: Array<{ start: number; end: number; indent: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(original)) !== null) {
    const bounds = findObjectBounds(original, match.index);
    if (bounds) {
      matches.push(bounds);
    }
  }

  if (matches.length === 0) return;

  let content = original;
  let fileChanged = false;

  for (let i = matches.length - 1; i >= 0; i--) {
    const { start, end, indent } = matches[i];
    const replaceStart = Math.max(0, start - indent.length);
    const cardText = content.slice(start, end);
    const { updatedText, changed } = processCard(cardText, indent, filePath);
    if (changed) {
      fileChanged = true;
      content = content.slice(0, replaceStart) + updatedText + content.slice(end);
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

const files: string[] = [];
walkFiles(DATA_ROOT, files);
files.sort();

for (const file of files) {
  processFile(file);
}

fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
fs.writeFileSync(LOG_PATH, JSON.stringify(changes, null, 2));

console.log(`Done. Changes: ${changes.length}`);
