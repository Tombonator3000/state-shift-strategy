#!/usr/bin/env bun

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { MVP_COST_TABLE, MVP_EFFECT_TABLE } from "../src/engine/constants";
import { validateCard } from "../src/engine/validation";
import type { Card, CardType, Rarity } from "../src/engine/types";

const CARD_DIR = join(process.cwd(), "src", "data", "cards");

const TYPE_MAP: Record<string, CardType | undefined> = {
  ATTACK: "ATTACK",
  MEDIA: "MEDIA",
  ZONE: "ZONE",
};

const RARITY_LIST: Rarity[] = ["common", "uncommon", "rare", "legendary"];

const factionPrefixes = {
  truth: "TR-",
  government: "GV-",
} as const;

type MigrationResult = {
  ok: number;
  fixed: number;
  failed: Array<{ file: string; cardId: string; reason: string; line: number }>;
};

const locateLineNumber = (content: string, cardId: string): number => {
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex(line => line.includes(cardId));
  return index >= 0 ? index + 1 : 0;
};

const sanitizeCard = (card: Card): { updated: Card; changed: boolean; error?: string } => {
  const original = structuredClone(card);
  let changed = false;

  if (!TYPE_MAP[card.type]) {
    return { updated: card, changed, error: `Unsupported card type ${card.type}` };
  }

  if (!RARITY_LIST.includes(card.rarity)) {
    return { updated: card, changed, error: `Unsupported rarity ${card.rarity}` };
  }

  if (card.faction !== "truth" && card.faction !== "government") {
    return { updated: card, changed, error: `Invalid faction ${card.faction}` };
  }

  const prefix = factionPrefixes[card.faction];
  if (!card.id.startsWith(prefix)) {
    return { updated: card, changed, error: `Card id must start with ${prefix}` };
  }

  const expectedCost = MVP_COST_TABLE[card.type][card.rarity];
  if (card.cost !== expectedCost) {
    card.cost = expectedCost;
    changed = true;
  }

  if (card.type === "ATTACK") {
    const effects = card.effects as any;
    if (!effects?.ipDelta?.opponent) {
      return { updated: card, changed, error: "ATTACK card missing ipDelta.opponent" };
    }
    const allowed = MVP_EFFECT_TABLE.ATTACK[card.rarity];
    if (effects.ipDelta.opponent !== allowed) {
      effects.ipDelta.opponent = allowed;
      changed = true;
    }
    const discard = effects.discardOpponent;
    if (discard !== undefined) {
      if (!Number.isInteger(discard) || discard < 0 || discard > 2) {
        return { updated: card, changed, error: "ATTACK discardOpponent must be between 0 and 2" };
      }
      if (card.rarity === "rare" && discard !== 1) {
        effects.discardOpponent = 1;
        changed = true;
      }
      if (card.rarity === "legendary" && discard > 2) {
        effects.discardOpponent = 2;
        changed = true;
      }
      if ((card.rarity === "common" || card.rarity === "uncommon") && discard > 0) {
        delete effects.discardOpponent;
        changed = true;
      }
    }
    const allowedKeys = new Set(["ipDelta", "discardOpponent"]);
    for (const key of Object.keys(effects)) {
      if (!allowedKeys.has(key)) {
        delete effects[key];
        changed = true;
      }
    }
  }

  if (card.type === "MEDIA") {
    const effects = card.effects as any;
    if (typeof effects?.truthDelta !== "number") {
      return { updated: card, changed, error: "MEDIA card missing truthDelta" };
    }
    const allowed = MVP_EFFECT_TABLE.MEDIA[card.rarity];
    const sign = effects.truthDelta >= 0 ? 1 : -1;
    const desired = allowed * sign;
    if (effects.truthDelta !== desired) {
      effects.truthDelta = desired;
      changed = true;
    }
    for (const key of Object.keys(effects)) {
      if (key !== "truthDelta") {
        delete effects[key];
        changed = true;
      }
    }
  }

  if (card.type === "ZONE") {
    const effects = card.effects as any;
    if (typeof effects?.pressureDelta !== "number" || effects.pressureDelta <= 0) {
      return { updated: card, changed, error: "ZONE card missing pressureDelta" };
    }
    const allowed = MVP_EFFECT_TABLE.ZONE[card.rarity];
    if (effects.pressureDelta !== allowed) {
      effects.pressureDelta = allowed;
      changed = true;
    }
    for (const key of Object.keys(effects)) {
      if (key !== "pressureDelta") {
        delete effects[key];
        changed = true;
      }
    }
  }

  try {
    validateCard(card);
  } catch (error) {
    return { updated: card, changed, error: (error as Error).message };
  }

  const normalized = JSON.stringify(card);
  const originalString = JSON.stringify(original);
  if (normalized !== originalString) {
    changed = true;
  }

  return { updated: card, changed };
};

const migrateFile = async (file: string, result: MigrationResult) => {
  const filePath = join(CARD_DIR, file);
  const content = await readFile(filePath, "utf8");
  let cards: Card[];
  try {
    cards = JSON.parse(content) as Card[];
  } catch (error) {
    throw new Error(`Failed to parse ${file}: ${(error as Error).message}`);
  }
  const updatedCards: Card[] = [];

  for (const card of cards) {
    const { updated, changed, error } = sanitizeCard(structuredClone(card));
    if (error) {
      result.failed.push({
        file,
        cardId: card.id,
        reason: error,
        line: locateLineNumber(content, card.id),
      });
      continue;
    }
    if (changed) {
      result.fixed += 1;
    } else {
      result.ok += 1;
    }
    updatedCards.push(updated);
  }

  if (result.failed.length === 0) {
    await writeFile(filePath, `${JSON.stringify(updatedCards, null, 2)}\n`, "utf8");
  }
};

const migrate = async () => {
  const files = await readdir(CARD_DIR);
  const result: MigrationResult = { ok: 0, fixed: 0, failed: [] };
  for (const file of files.filter(name => name.endsWith(".json"))) {
    await migrateFile(file, result);
  }

  console.log("MVP migration report");
  console.log(`  OK: ${result.ok}`);
  console.log(`  Fixed: ${result.fixed}`);
  console.log(`  Failed: ${result.failed.length}`);

  if (result.failed.length > 0) {
    console.error("\nIssues detected:");
    for (const fail of result.failed) {
      console.error(`  ${fail.file}:${fail.line} – ${fail.cardId}: ${fail.reason}`);
    }
    process.exit(1);
  }
};

migrate().catch(error => {
  console.error(error);
  process.exit(1);
});
