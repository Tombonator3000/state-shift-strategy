#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const CARD_DATA_PATH = path.join(repoRoot, "paranoid_times_card_articles_ALL.json");
const DOCS_DIRS = [path.join(repoRoot, "docs")];
const DOCS_FILES = [
  path.join(repoRoot, "DESIGN_DOC_MVP.md"),
  path.join(repoRoot, "README.md"),
  path.join(repoRoot, "README-core-recovery.md"),
  path.join(repoRoot, "TRUTH_MECHANICS_AUDIT.md"),
  path.join(repoRoot, "Humor Template  – Paranoid Times.md"),
];
const MARKDOWN_EXTENSIONS = new Set([".md", ".MD"]);

const NON_DIEGETIC_KEYWORDS = ["banana peel", "clown car", "rubber chicken"];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function gatherMarkdownFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const resolved = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return gatherMarkdownFiles(resolved);
        }
        const ext = path.extname(entry.name);
        if (MARKDOWN_EXTENSIONS.has(ext)) {
          return [resolved];
        }
        return [];
      }),
    );
    return files.flat();
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function loadDesignDocs() {
  const files = new Set();
  for (const dir of DOCS_DIRS) {
    const found = await gatherMarkdownFiles(dir);
    for (const file of found) {
      files.add(file);
    }
  }
  for (const file of DOCS_FILES) {
    try {
      await readFile(file, "utf8");
      files.add(file);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
  return [...files];
}

function buildKeywordSet(article) {
  const base = new Set();
  if (article.faction) {
    base.add(String(article.faction).toLowerCase());
  }
  if (Array.isArray(article.tags)) {
    for (const tag of article.tags) {
      base.add(String(tag).toLowerCase());
    }
  }
  if (article.headline) {
    const words = String(article.headline)
      .toLowerCase()
      .match(/[a-z0-9]+/g);
    if (words) {
      for (const word of words) {
        if (word.length >= 5) {
          base.add(word);
        }
      }
    }
  }
  for (const keyword of NON_DIEGETIC_KEYWORDS) {
    base.delete(keyword);
  }
  return base;
}

async function main() {
  const cardData = await readJson(CARD_DATA_PATH);
  const designDocs = await loadDesignDocs();

  const loreIndex = new Map();

  for (const article of cardData.articles ?? []) {
    const keywords = buildKeywordSet(article);
    for (const keyword of keywords) {
      if (!loreIndex.has(keyword)) {
        loreIndex.set(keyword, { cards: new Set(), docs: new Set() });
      }
      loreIndex.get(keyword).cards.add(article.id);
    }
  }

  for (const docPath of designDocs) {
    const content = (await readFile(docPath, "utf8")).toLowerCase();
    for (const [keyword, entry] of loreIndex.entries()) {
      const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
      if (pattern.test(content)) {
        entry.docs.add(path.relative(repoRoot, docPath));
      }
    }
  }

  const results = [];
  for (const [keyword, entry] of loreIndex.entries()) {
    if (entry.docs.size === 0) {
      continue;
    }
    results.push({
      keyword,
      cards: [...entry.cards].sort(),
      docs: [...entry.docs].sort(),
    });
  }

  results.sort((a, b) => a.keyword.localeCompare(b.keyword));

  console.log(JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));
}

main().catch((error) => {
  console.error("Failed to cross-link lore references:", error);
  process.exitCode = 1;
});
