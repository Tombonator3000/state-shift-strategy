import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import type { Card, CardType, Rarity, EffectsATTACK, EffectsMEDIA, EffectsZONE } from "../src/types/mvpCard";

const MEDIA_LEVELS = [-4, -3, -2, -1, 1, 2, 3, 4] as const;
const ATTACK_LEVELS = [1, 2, 3, 4] as const;
const ZONE_LEVELS = [1, 2, 3, 4] as const;

export function clampTo<T extends number>(levels: readonly T[], x: number): T {
  return levels.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a)) as T;
}

export function rarityFor(type: CardType, magnitude: number): Rarity {
  return (["", "common", "uncommon", "rare", "legendary"] as const)[magnitude] as Rarity;
}

export function costFor(type: CardType, rarity: Rarity): number {
  if (type === "MEDIA") {
    return { common: 3, uncommon: 4, rare: 5, legendary: 6 }[rarity];
  }
  if (type === "ATTACK") {
    return { common: 2, uncommon: 3, rare: 4, legendary: 5 }[rarity];
  }
  return { common: 4, uncommon: 5, rare: 6, legendary: 7 }[rarity];
}

export interface MigrationCounters {
  filesProcessed: number;
  cardsProcessed: number;
  defensiveReclassified: number;
  typeChanged: number;
  factionNormalized: number;
  effectsTrimmed: number;
  rarityAdjusted: number;
  costAdjusted: number;
  discardAdjusted: number;
  flavorSelected: number;
}

interface CardLogEntry {
  exportName: string;
  id: string;
  name: string;
  before: {
    faction?: string;
    type?: string;
    rarity?: string;
    cost?: number;
    effects?: any;
  };
  after: {
    faction: Card["faction"];
    type: CardType;
    rarity: Rarity;
    cost: number;
    effects: Card["effects"];
  };
  notes: string[];
}

interface FileLogEntry {
  file: string;
  cards: CardLogEntry[];
}

export type LegacyCard = Record<string, any>;

type EffectsMap = EffectsATTACK | EffectsMEDIA | EffectsZONE;

class CodeWriter {
  private lines: string[] = [];
  private indentLevel = 0;

  writeLine(text = ""): void {
    const indent = "  ".repeat(this.indentLevel);
    this.lines.push(text ? `${indent}${text}` : "");
  }

  indent(callback: () => void): void {
    this.indentLevel += 1;
    callback();
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }

  toString(): string {
    return this.lines.join("\n");
  }
}

function stringLiteral(value: string): string {
  return JSON.stringify(value);
}

function extractLeadingComment(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const leading: string[] = [];
  let index = 0;
  let inBlock = false;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!inBlock && trimmed.startsWith("/*")) {
      inBlock = true;
      leading.push(line);
      if (trimmed.includes("*/")) {
        inBlock = false;
      }
      index += 1;
      continue;
    }
    if (inBlock) {
      leading.push(line);
      if (trimmed.includes("*/")) {
        inBlock = false;
      }
      index += 1;
      continue;
    }
    if (trimmed.startsWith("//")) {
      leading.push(line);
      index += 1;
      continue;
    }
    if (trimmed === "") {
      if (leading.length > 0) {
        leading.push(line);
        index += 1;
        continue;
      }
      index += 1;
      continue;
    }
    break;
  }

  return leading;
}

function isIdentifierChar(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}

function extractExportArrayNames(content: string): string[] {
  const names: string[] = [];
  const length = content.length;
  let index = 0;

  const isWordBoundary = (pos: number): boolean => {
    const next = content[pos];
    return !next || !isIdentifierChar(next);
  };

  const skipWhitespace = (): void => {
    while (index < length) {
      const ch = content[index];
      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
        index += 1;
        continue;
      }
      if (ch === "/" && content[index + 1] === "/") {
        index += 2;
        while (index < length && content[index] !== "\n") {
          index += 1;
        }
        continue;
      }
      if (ch === "/" && content[index + 1] === "*") {
        index += 2;
        while (index < length && !(content[index] === "*" && content[index + 1] === "/")) {
          index += 1;
        }
        index += 2;
        continue;
      }
      break;
    }
  };

  const skipString = (): void => {
    const quote = content[index];
    index += 1;
    while (index < length) {
      const ch = content[index];
      if (ch === "\\") {
        index += 2;
        continue;
      }
      if (ch === quote) {
        index += 1;
        break;
      }
      index += 1;
    }
  };

  while (index < length) {
    if (content.startsWith("export", index) && isWordBoundary(index + 6)) {
      index += 6;
      skipWhitespace();
      if (!content.startsWith("const", index) || !isWordBoundary(index + 5)) {
        continue;
      }
      index += 5;
      skipWhitespace();
      let name = "";
      while (index < length) {
        const ch = content[index];
        if (!isIdentifierChar(ch)) {
          break;
        }
        name += ch;
        index += 1;
      }
      if (!name) {
        continue;
      }
      skipWhitespace();
      if (content[index] === ":") {
        index += 1;
        while (index < length && content[index] !== "=") {
          const ch = content[index];
          if (ch === "\"" || ch === "'" || ch === "`") {
            skipString();
            continue;
          }
          if (ch === "/" && content[index + 1] === "/") {
            index += 2;
            while (index < length && content[index] !== "\n") {
              index += 1;
            }
            continue;
          }
          if (ch === "/" && content[index + 1] === "*") {
            index += 2;
            while (index < length && !(content[index] === "*" && content[index + 1] === "/")) {
              index += 1;
            }
            index += 2;
            continue;
          }
          index += 1;
        }
      }
      skipWhitespace();
      if (content[index] !== "=") {
        continue;
      }
      index += 1;
      skipWhitespace();
      if (content[index] !== "[") {
        continue;
      }
      names.push(name);
    } else {
      index += 1;
    }
  }

  return names;
}

function normalizeFaction(faction: any): { value: Card["faction"]; changed: boolean } {
  const raw = String(faction ?? "").toLowerCase();
  const value: Card["faction"] = raw === "government" ? "government" : "truth";
  const changed = raw !== value;
  return { value, changed };
}

function isAttackish(effects: any): boolean {
  if (!effects || typeof effects !== "object") {
    return false;
  }
  if (typeof effects.discardOpponent === "number" && effects.discardOpponent > 0) {
    return true;
  }
  if (effects.ipDelta && typeof effects.ipDelta === "object") {
    const opponent = effects.ipDelta.opponent;
    if (typeof opponent === "number" && opponent !== 0) {
      return true;
    }
  }
  if (typeof effects.truthDelta === "number" && effects.truthDelta < 0) {
    return true;
  }
  return false;
}

function extractZoneMagnitude(effects: any): number | undefined {
  if (!effects || typeof effects !== "object") {
    return undefined;
  }
  if (typeof effects.pressureDelta === "number") {
    return Math.abs(effects.pressureDelta);
  }
  if (effects.pressureDelta && typeof effects.pressureDelta === "object") {
    const candidate = [effects.pressureDelta.value, effects.pressureDelta.v, effects.pressureDelta.amount]
      .map((v) => (typeof v === "number" ? Math.abs(v) : undefined))
      .find((v) => typeof v === "number");
    if (candidate !== undefined) {
      return candidate;
    }
  }
  if (typeof effects.zoneDefense === "number") {
    return Math.abs(effects.zoneDefense);
  }
  if (effects.ipDelta && typeof effects.ipDelta === "object" && typeof effects.ipDelta.self === "number") {
    return Math.abs(effects.ipDelta.self);
  }
  if (typeof effects.truthDelta === "number") {
    return Math.abs(effects.truthDelta);
  }
  return undefined;
}

function extractAttackMagnitude(effects: any): number | undefined {
  if (!effects || typeof effects !== "object") {
    return undefined;
  }
  if (effects.ipDelta && typeof effects.ipDelta === "object" && typeof effects.ipDelta.opponent === "number") {
    const value = effects.ipDelta.opponent;
    return Math.abs(value);
  }
  return undefined;
}

function migrateCard(
  legacy: LegacyCard,
  counters: MigrationCounters,
  exportName: string
): { card: Card; log: CardLogEntry } {
  const beforeEffects = legacy.effects ? JSON.parse(JSON.stringify(legacy.effects)) : undefined;
  const notes: string[] = [];

  const { value: faction, changed: factionChanged } = normalizeFaction(legacy.faction);
  if (factionChanged) {
    counters.factionNormalized += 1;
    notes.push(`faction:${legacy.faction}→${faction}`);
  }

  const originalType = String(legacy.type ?? "MEDIA").toUpperCase();
  let type: CardType;
  let defensive = false;
  if (originalType === "DEFENSIVE") {
    defensive = true;
    counters.defensiveReclassified += 1;
    const attack = isAttackish(legacy.effects);
    type = attack ? "ATTACK" : "ZONE";
    notes.push(`type:${originalType}→${type}`);
  } else if (originalType === "ATTACK" || originalType === "MEDIA" || originalType === "ZONE") {
    type = originalType as CardType;
  } else {
    type = "MEDIA";
    notes.push(`type:${originalType}→${type}`);
  }
  if (type !== originalType) {
    counters.typeChanged += 1;
  }

  let effects: EffectsMap;
  let rarity: Rarity;
  let cost: number;
  let effectsTrimmed = false;
  let discardAdjusted = false;

  if (type === "MEDIA") {
    const legacyDeltaRaw = typeof legacy.effects?.truthDelta === "number" ? legacy.effects.truthDelta : 1;
    const deltaValue = legacyDeltaRaw === 0 ? 1 : legacyDeltaRaw;
    const truthDelta = clampTo(MEDIA_LEVELS, deltaValue);
    const magnitude = Math.abs(truthDelta);
    rarity = rarityFor(type, magnitude);
    cost = costFor(type, rarity);
    effects = { truthDelta };
    if (legacy.effects && Object.keys(legacy.effects).length > 1) {
      effectsTrimmed = true;
    }
    if (legacy.effects && typeof legacy.effects.truthDelta === "number" && legacy.effects.truthDelta !== truthDelta) {
      effectsTrimmed = true;
      notes.push(`truthDelta:${legacy.effects.truthDelta}→${truthDelta}`);
    }
  } else if (type === "ATTACK") {
    const attackMagnitude = extractAttackMagnitude(legacy.effects);
    const baseMagnitude = attackMagnitude === undefined || attackMagnitude === 0 ? 1 : attackMagnitude;
    const clamped = clampTo(ATTACK_LEVELS, baseMagnitude);
    const magnitude = clamped;
    rarity = rarityFor(type, magnitude);
    cost = costFor(type, rarity);
    const cardEffects: EffectsATTACK = { ipDelta: { opponent: magnitude } };
    if (!attackMagnitude || attackMagnitude !== magnitude) {
      effectsTrimmed = true;
      if (attackMagnitude !== undefined) {
        notes.push(`ipDelta:${attackMagnitude}→${magnitude}`);
      }
    }
    const originalDiscard = typeof legacy.effects?.discardOpponent === "number" ? legacy.effects.discardOpponent : undefined;
    if (originalDiscard && originalDiscard > 0) {
      if (rarity === "rare") {
        cardEffects.discardOpponent = 1;
        discardAdjusted = originalDiscard !== 1;
      } else if (rarity === "legendary") {
        cardEffects.discardOpponent = originalDiscard >= 2 ? 2 : 1;
        discardAdjusted = cardEffects.discardOpponent !== originalDiscard;
      } else {
        discardAdjusted = true;
      }
    }
    if (originalDiscard && rarity !== "common" && rarity !== "uncommon" && cardEffects.discardOpponent) {
      notes.push(`discard:${originalDiscard}→${cardEffects.discardOpponent}`);
    }
    if (originalDiscard && rarity !== "rare" && rarity !== "legendary") {
      notes.push(`discardRemoved:${originalDiscard}`);
    }
    effects = cardEffects;
  } else {
    const zoneMagnitude = extractZoneMagnitude(legacy.effects);
    const baseMagnitudeRaw = zoneMagnitude === undefined ? 1 : zoneMagnitude;
    const baseMagnitude = baseMagnitudeRaw <= 0 ? 1 : baseMagnitudeRaw;
    const normalized = baseMagnitude % 1 === 0 ? baseMagnitude : Math.floor(baseMagnitude);
    const magnitude = clampTo(ZONE_LEVELS, normalized < 1 ? 1 : normalized);
    rarity = rarityFor(type, magnitude);
    cost = costFor(type, rarity);
    effects = { pressureDelta: magnitude };
    if (!zoneMagnitude || zoneMagnitude !== magnitude) {
      effectsTrimmed = true;
      if (zoneMagnitude !== undefined) {
        notes.push(`pressure:${zoneMagnitude}→${magnitude}`);
      }
    }
    if (legacy.effects) {
      const allowed = new Set(["pressureDelta"]);
      for (const key of Object.keys(legacy.effects)) {
        if (!allowed.has(key)) {
          effectsTrimmed = true;
          break;
        }
      }
    }
  }

  if (effectsTrimmed) {
    counters.effectsTrimmed += 1;
  }
  if (discardAdjusted) {
    counters.discardAdjusted += 1;
  }

  const legacyRarity = String(legacy.rarity ?? "").toLowerCase();
  if (legacyRarity !== rarity) {
    counters.rarityAdjusted += 1;
    notes.push(`rarity:${legacy.rarity}→${rarity}`);
  }
  const legacyCost = typeof legacy.cost === "number" ? legacy.cost : undefined;
  if (legacyCost !== cost) {
    counters.costAdjusted += 1;
    if (legacyCost !== undefined) {
      notes.push(`cost:${legacyCost}→${cost}`);
    }
  }

  const flavorCandidates = [legacy.flavor, legacy.flavorTruth, legacy.flavorGov].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  const flavor = flavorCandidates.length > 0 ? flavorCandidates[0].trim() : undefined;
  if (flavor) {
    counters.flavorSelected += 1;
  }

  const migrated: Card = {
    id: String(legacy.id ?? ""),
    name: String(legacy.name ?? ""),
    faction,
    type,
    rarity,
    cost,
    effects,
  };

  if (flavor) {
    migrated.flavor = flavor;
  }
  if (typeof legacy.artId === "string" && legacy.artId.trim().length > 0) {
    migrated.artId = legacy.artId;
  }
  if (Array.isArray(legacy.tags)) {
    migrated.tags = legacy.tags;
  }

  const log: CardLogEntry = {
    exportName,
    id: migrated.id,
    name: migrated.name,
    before: {
      faction: legacy.faction,
      type: legacy.type,
      rarity: legacy.rarity,
      cost: legacy.cost,
      effects: beforeEffects,
    },
    after: {
      faction: migrated.faction,
      type: migrated.type,
      rarity: migrated.rarity,
      cost: migrated.cost,
      effects: migrated.effects,
    },
    notes,
  };

  return { card: migrated, log };
}

function buildFileContent(
  leadingComment: string[],
  importPath: string,
  exports: { name: string; cards: Card[] }
): string {
  const writer = new CodeWriter();

  if (leadingComment.length > 0) {
    leadingComment.forEach((line) => writer.writeLine(line));
    writer.writeLine();
  }

  writer.writeLine(`import type { Card } from "${importPath}";`);
  writer.writeLine();

  writer.writeLine(`export const ${exports.name}: Card[] = [`);
  writer.indent(() => {
    exports.cards.forEach((card, index) => {
      writer.writeLine("{");
      writer.indent(() => {
        writer.writeLine(`id: ${stringLiteral(card.id)},`);
        writer.writeLine(`name: ${stringLiteral(card.name)},`);
        writer.writeLine(`faction: ${stringLiteral(card.faction)},`);
        writer.writeLine(`type: ${stringLiteral(card.type)},`);
        writer.writeLine(`rarity: ${stringLiteral(card.rarity)},`);
        writer.writeLine(`cost: ${card.cost},`);
        writer.writeLine("effects: {");
        writer.indent(() => {
          if (card.type === "ATTACK") {
            writer.writeLine(`ipDelta: { opponent: ${card.effects.ipDelta.opponent} }${
              (card.effects as EffectsATTACK).discardOpponent ? "," : ""
            }`);
            if ((card.effects as EffectsATTACK).discardOpponent) {
              writer.writeLine(`discardOpponent: ${(card.effects as EffectsATTACK).discardOpponent}`);
            }
          } else if (card.type === "MEDIA") {
            writer.writeLine(`truthDelta: ${(card.effects as EffectsMEDIA).truthDelta}`);
          } else {
            writer.writeLine(`pressureDelta: ${(card.effects as EffectsZONE).pressureDelta}`);
          }
        });
        writer.writeLine("},");
        if (card.flavor) {
          writer.writeLine(`flavor: ${stringLiteral(card.flavor)},`);
        }
        if (card.artId) {
          writer.writeLine(`artId: ${stringLiteral(card.artId)},`);
        }
        if (card.tags) {
          writer.writeLine(`tags: ${JSON.stringify(card.tags)},`);
        }
      });
      writer.writeLine(index === exports.cards.length - 1 ? "}" : "},");
    });
  });
  writer.writeLine("];");
  writer.writeLine();

  return writer.toString();
}

async function walkDir(dir: string, matcher: (file: string) => boolean, results: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(full, matcher, results);
    } else if (entry.isFile() && matcher(full)) {
      results.push(full);
    }
  }
}

async function collectCardFiles(root: string): Promise<string[]> {
  const results: string[] = [];
  await walkDir(path.join(root, "src/data/core"), (file) => file.endsWith(".ts"), results);
  return results.sort();
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function relativeImport(from: string, to: string): string {
  let rel = path.relative(path.dirname(from), to).replace(/\\/g, "/");
  if (!rel.startsWith(".")) {
    rel = `./${rel}`;
  }
  if (rel.endsWith(".ts")) {
    rel = rel.slice(0, -3);
  }
  return rel;
}

async function backupFile(filePath: string, root: string, backupRoot: string): Promise<void> {
  const rel = path.relative(root, filePath);
  const dest = path.join(backupRoot, rel);
  await ensureDir(path.dirname(dest));
  await fs.copyFile(filePath, dest);
}

export function migrateCardsInMemory(cards: LegacyCard[]): {
  cards: Card[];
  logs: CardLogEntry[];
  counters: MigrationCounters;
} {
  const counters: MigrationCounters = {
    filesProcessed: 0,
    cardsProcessed: 0,
    defensiveReclassified: 0,
    typeChanged: 0,
    factionNormalized: 0,
    effectsTrimmed: 0,
    rarityAdjusted: 0,
    costAdjusted: 0,
    discardAdjusted: 0,
    flavorSelected: 0,
  };
  const logs: CardLogEntry[] = [];
  const migrated: Card[] = [];

  cards.forEach((legacyCard) => {
    counters.cardsProcessed += 1;
    const { card, log } = migrateCard(legacyCard, counters, "TEST");
    migrated.push(card);
    logs.push(log);
  });

  return { cards: migrated, logs, counters };
}

async function main(): Promise<void> {
  const scriptPath = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(scriptPath, "../..");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.join(projectRoot, "tools/migration_backups", timestamp);
  const logPath = path.join(projectRoot, "tools/migration_logs", `mvp-${timestamp}.json`);

  await ensureDir(backupRoot);
  await ensureDir(path.dirname(logPath));

  const files = await collectCardFiles(projectRoot);
  const counters: MigrationCounters = {
    filesProcessed: 0,
    cardsProcessed: 0,
    defensiveReclassified: 0,
    typeChanged: 0,
    factionNormalized: 0,
    effectsTrimmed: 0,
    rarityAdjusted: 0,
    costAdjusted: 0,
    discardAdjusted: 0,
    flavorSelected: 0,
  };
  const fileLogs: FileLogEntry[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const exportNames = extractExportArrayNames(content);
    if (exportNames.length === 0) {
      continue;
    }

    const moduleUrl = `${pathToFileURL(file).href}?ts=${Date.now()}`;
    const moduleExports = await import(moduleUrl);

    await backupFile(file, projectRoot, backupRoot);

    const leadingComment = extractLeadingComment(content);
    const importPath = relativeImport(file, path.join(projectRoot, "src/types/mvpCard.ts"));

    if (exportNames.length !== 1) {
      throw new Error(`Unexpected multiple exports in ${file}`);
    }

    const exportName = exportNames[0];
    const exportValue = moduleExports[exportName];
    if (!Array.isArray(exportValue)) {
      continue;
    }

    const migratedCards: Card[] = [];
    const fileLog: FileLogEntry = { file: path.relative(projectRoot, file), cards: [] };

    exportValue.forEach((legacyCard: LegacyCard) => {
      counters.cardsProcessed += 1;
      const { card, log } = migrateCard(legacyCard, counters, exportName);
      migratedCards.push(card);
      fileLog.cards.push(log);
    });

    counters.filesProcessed += 1;
    fileLogs.push(fileLog);

    const newContent = buildFileContent(leadingComment, importPath, { name: exportName, cards: migratedCards });
    await fs.writeFile(file, newContent);
  }

  const log = {
    timestamp,
    summary: counters,
    files: fileLogs,
  };

  await fs.writeFile(logPath, JSON.stringify(log, null, 2));

  console.log(`✅ Migrated ${counters.cardsProcessed} cards across ${counters.filesProcessed} files.`);
  console.log(`📁 Backup created at ${path.relative(projectRoot, backupRoot)}`);
  console.log(`📝 Log written to ${path.relative(projectRoot, logPath)}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}
