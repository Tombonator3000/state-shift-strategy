import type { Difficulty } from "../ai";

export function getDifficulty(): Difficulty {
  const storage = typeof localStorage !== "undefined" ? localStorage : null;
  const raw = storage?.getItem("shadowgov:difficulty") ?? "NORMAL";
  switch (raw) {
    case "EASY":
    case "NORMAL":
    case "HARD":
    case "TOP_SECRET_PLUS":
      return raw as Difficulty;
    default:
      return "NORMAL";
  }
}

export function setDifficultyFromLabel(label: string) {
  const map: Record<string, string> = {
    "EASY - Intelligence Leak": "EASY",
    "NORMAL - Classified": "NORMAL",
    "HARD - Top Secret": "HARD",
    "TOP SECRET+ - Meta-Cheating": "TOP_SECRET_PLUS",
  };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("shadowgov:difficulty", map[label] ?? "NORMAL");
  }
}
