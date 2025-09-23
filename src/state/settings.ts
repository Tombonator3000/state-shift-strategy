import type { Difficulty } from "../ai";

const OPTIONS_STORAGE_KEY = "gameSettings";

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

export function areParanormalEffectsEnabled(): boolean {
  if (typeof localStorage === "undefined") {
    return true;
  }

  try {
    const stored = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (!stored) {
      return true;
    }

    const parsed = JSON.parse(stored) as { paranormalEffectsEnabled?: unknown } | null;
    if (parsed && typeof parsed.paranormalEffectsEnabled === "boolean") {
      return parsed.paranormalEffectsEnabled;
    }
  } catch (error) {
    console.warn("Failed to read paranormal effects setting: ", error);
  }

  return true;
}
