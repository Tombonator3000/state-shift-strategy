import path from "path";
import fs from "fs/promises";
import { fileURLToPath, pathToFileURL } from "url";

import type { Card } from "../src/types/mvpCard";
import { costFor, rarityFor } from "./migrate-to-mvp";

const allowedFactions = new Set(["truth", "government"]);
const allowedTypes = new Set(["ATTACK", "MEDIA", "ZONE"]);
const allowedRarities = new Set(["common", "uncommon", "rare", "legendary"]);
const MEDIA_LEVELS = new Set([-4, -3, -2, -1, 1, 2, 3, 4]);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateAttack(card: Card & { type: "ATTACK" }): string[] {
  const errors: string[] = [];
  if (!isRecord(card.effects)) {
    errors.push("effects must be object");
    return errors;
  }
  const keys = Object.keys(card.effects);
  const allowed = new Set(["ipDelta", "discardOpponent"]);
  for (const key of keys) {
    if (!allowed.has(key)) {
      errors.push(`invalid effect key ${key}`);
    }
  }
  const ipDelta = (card.effects as any).ipDelta;
  if (!isRecord(ipDelta) || typeof ipDelta.opponent !== "number") {
    errors.push("ipDelta.opponent missing");
    return errors;
  }
  const value = ipDelta.opponent;
  if (![1, 2, 3, 4].includes(value)) {
    errors.push(`ipDelta.opponent must be 1..4, received ${value}`);
  }
  const expectedRarity = rarityFor("ATTACK", value);
  if (card.rarity !== expectedRarity) {
    errors.push(`rarity mismatch (expected ${expectedRarity})`);
  }
  const expectedCost = costFor("ATTACK", card.rarity);
  if (card.cost !== expectedCost) {
    errors.push(`cost mismatch (expected ${expectedCost})`);
  }
  if ("discardOpponent" in card.effects) {
    const discard = (card.effects as any).discardOpponent;
    if (typeof discard !== "number") {
      errors.push("discardOpponent must be number");
    } else {
      if (card.rarity === "rare" && discard !== 1) {
        errors.push("rare discard must be 1");
      }
      if (card.rarity === "legendary" && ![1, 2].includes(discard)) {
        errors.push("legendary discard must be 1 or 2");
      }
      if (card.rarity === "common" || card.rarity === "uncommon") {
        errors.push("discardOpponent not allowed on common/uncommon");
      }
    }
  }
  return errors;
}

function validateMedia(card: Card & { type: "MEDIA" }): string[] {
  const errors: string[] = [];
  if (!isRecord(card.effects)) {
    errors.push("effects must be object");
    return errors;
  }
  const keys = Object.keys(card.effects);
  if (keys.length !== 1 || !keys.includes("truthDelta")) {
    errors.push("MEDIA effects must only contain truthDelta");
  }
  const truthDelta = (card.effects as any).truthDelta;
  if (typeof truthDelta !== "number") {
    errors.push("truthDelta must be number");
    return errors;
  }
  if (!MEDIA_LEVELS.has(truthDelta)) {
    errors.push(`truthDelta ${truthDelta} not in MVP levels`);
  }
  const magnitude = Math.abs(truthDelta);
  const expectedRarity = rarityFor("MEDIA", magnitude);
  if (card.rarity !== expectedRarity) {
    errors.push(`rarity mismatch (expected ${expectedRarity})`);
  }
  const expectedCost = costFor("MEDIA", card.rarity);
  if (card.cost !== expectedCost) {
    errors.push(`cost mismatch (expected ${expectedCost})`);
  }
  return errors;
}

function validateZone(card: Card & { type: "ZONE" }): string[] {
  const errors: string[] = [];
  if (!isRecord(card.effects)) {
    errors.push("effects must be object");
    return errors;
  }
  const keys = Object.keys(card.effects);
  if (keys.length !== 1 || !keys.includes("pressureDelta")) {
    errors.push("ZONE effects must only contain pressureDelta");
  }
  const pressureDelta = (card.effects as any).pressureDelta;
  if (typeof pressureDelta !== "number") {
    errors.push("pressureDelta must be number");
    return errors;
  }
  if (![1, 2, 3, 4].includes(pressureDelta)) {
    errors.push(`pressureDelta ${pressureDelta} not allowed`);
  }
  const expectedRarity = rarityFor("ZONE", pressureDelta);
  if (card.rarity !== expectedRarity) {
    errors.push(`rarity mismatch (expected ${expectedRarity})`);
  }
  const expectedCost = costFor("ZONE", card.rarity);
  if (card.cost !== expectedCost) {
    errors.push(`cost mismatch (expected ${expectedCost})`);
  }
  return errors;
}

export function validateCard(card: Card, context: { file: string; exportName: string }): string[] {
  const errors: string[] = [];
  if (typeof card.id !== "string" || card.id.trim().length === 0) {
    errors.push("id missing");
  }
  if (typeof card.name !== "string" || card.name.trim().length === 0) {
    errors.push("name missing");
  }
  if (!allowedFactions.has(card.faction)) {
    errors.push(`invalid faction ${card.faction}`);
  }
  if (!allowedTypes.has(card.type)) {
    errors.push(`invalid type ${card.type}`);
    return errors;
  }
  if (!allowedRarities.has(card.rarity)) {
    errors.push(`invalid rarity ${card.rarity}`);
  }
  if (typeof card.cost !== "number" || Number.isNaN(card.cost)) {
    errors.push("invalid cost");
  }
  if (!isRecord(card.effects)) {
    errors.push("effects missing");
    return errors;
  }

  let detailErrors: string[] = [];
  if (card.type === "ATTACK") {
    detailErrors = validateAttack(card as Card & { type: "ATTACK" });
  } else if (card.type === "MEDIA") {
    detailErrors = validateMedia(card as Card & { type: "MEDIA" });
  } else {
    detailErrors = validateZone(card as Card & { type: "ZONE" });
  }

  errors.push(...detailErrors);

  if (card.effects && typeof card.effects === "object") {
    const keys = Object.keys(card.effects as any);
    const allowed = card.type === "ATTACK" ? ["ipDelta", "discardOpponent"] : card.type === "MEDIA" ? ["truthDelta"] : ["pressureDelta"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        errors.push(`unexpected effect key ${key}`);
      }
    }
  }

  if (card.effects && (card as any).effects.ipDelta) {
    const ipKeys = Object.keys((card as any).effects.ipDelta);
    if (card.type === "ATTACK" && ipKeys.some((key) => key !== "opponent")) {
      errors.push("ipDelta must only contain opponent");
    }
  }

  return errors.map((message) => `${context.file} :: ${context.exportName} :: ${card.id} - ${message}`);
}

async function main(): Promise<void> {
  const scriptPath = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(scriptPath, "../..");
  const files = await collectCardFiles(projectRoot);

  const errors: string[] = [];
  let total = 0;

  for (const file of files) {
    const moduleUrl = `${pathToFileURL(file).href}?t=${Date.now()}`;
    const moduleExports = await import(moduleUrl);
    const rel = path.relative(projectRoot, file);

    for (const [exportName, value] of Object.entries(moduleExports)) {
      if (!Array.isArray(value)) {
        continue;
      }
      if (value.length === 0) {
        continue;
      }
      const first = value[0];
      if (!isRecord(first) || typeof first.id !== "string") {
        continue;
      }
      for (const card of value as Card[]) {
        total += 1;
        errors.push(...validateCard(card, { file: rel, exportName }));
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    console.error(`❌ Validation failed for ${errors.length} issues across ${total} cards.`);
    process.exit(1);
  }

  console.log(`✅ All ${total} cards passed MVP validation.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error("Validation failed:", error);
    process.exit(1);
  });
}
