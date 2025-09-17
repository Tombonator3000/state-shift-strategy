import fs from "node:fs";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "src", "data");
const AMOUNT_BY_RARITY = { common: 1, uncommon: 2, rare: 3, legendary: 4 } as const;
const COST_BY_RARITY = { common: 2, uncommon: 3, rare: 4, legendary: 5 } as const;

type RarityKey = keyof typeof AMOUNT_BY_RARITY;
type CardRecord = {
  id?: string;
  rarity?: RarityKey;
  type?: string;
  cost?: number;
  flavor?: string;
  flavorTruth?: string;
  flavorGov?: string;
  text?: string;
  effects?: {
    ipDelta?: Record<string, unknown>;
  } & Record<string, unknown>;
};

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

function findObjectBounds(content: string, matchIndex: number): { start: number; end: number } | null {
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
  return { start, end };
}

function parseObject(text: string): CardRecord {
  return Function("return (" + text + ");")();
}

const files: string[] = [];
walkFiles(DATA_ROOT, files);
files.sort();

const errors: string[] = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const pattern = /type\s*:\s*['"]ATTACK['"]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const bounds = findObjectBounds(content, match.index);
    if (!bounds) continue;
    const { start, end } = bounds;
    const cardText = content.slice(start, end);

    let card: CardRecord;
    try {
      card = parseObject(cardText);
    } catch (error) {
      errors.push(`${path.relative(process.cwd(), file)}: Failed to parse ATTACK card at index ${start}`);
      continue;
    }

    if (card.type !== "ATTACK") continue;
    const rarity = card.rarity;
    const id = card.id ?? "UNKNOWN";
    if (!rarity || !(rarity in AMOUNT_BY_RARITY)) {
      errors.push(`${id} (${path.relative(process.cwd(), file)}): missing or invalid rarity`);
      continue;
    }

    const expectedAmount = AMOUNT_BY_RARITY[rarity];
    const expectedCost = COST_BY_RARITY[rarity];

    const ipDelta = card.effects?.ipDelta as Record<string, unknown> | undefined;
    if (!ipDelta) {
      errors.push(`${id}: missing effects.ipDelta`);
    } else {
      const keys = Object.keys(ipDelta);
      for (const key of keys) {
        if (key !== "opponent") {
          errors.push(`${id}: illegal ipDelta.${key}`);
        }
      }

      const valueRaw = ipDelta.opponent;
      const value = typeof valueRaw === "number" ? valueRaw : Number(valueRaw);
      if (!Number.isFinite(value) || value !== expectedAmount) {
        errors.push(`${id}: ipDelta.opponent=${valueRaw} expected ${expectedAmount}`);
      }
    }

    if (card.cost !== expectedCost) {
      errors.push(`${id}: cost=${card.cost} expected ${expectedCost}`);
    }

    const flavor = card.flavor ?? card.flavorGov ?? card.flavorTruth;
    if (!flavor || typeof flavor !== "string" || flavor.trim().length === 0) {
      errors.push(`${id}: missing flavor`);
    }

    const textFields = [card.text, card.flavor, card.flavorTruth, card.flavorGov];
    for (const field of textFields) {
      if (typeof field === "string" && /Opponent\s+gains/i.test(field)) {
        errors.push(`${id}: contains forbidden phrase 'Opponent gains'`);
        break;
      }
    }
  }
}

if (errors.length > 0) {
  console.error("❌ ATTACK IP validation failed:");
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log("✅ All ATTACK cards have normalized IP and cost values.");
