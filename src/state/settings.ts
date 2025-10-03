import type { Difficulty } from "../ai";

const OPTIONS_STORAGE_KEY = "gameSettings";

type StoredGameSettings = {
  paranormalEffectsEnabled?: unknown;
  mapVfxEnabled?: unknown;
};

const readStoredGameSettings = (): StoredGameSettings | null => {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as StoredGameSettings;
  } catch (error) {
    console.warn("Failed to read stored game settings:", error);
    return null;
  }
};

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
  const stored = readStoredGameSettings();
  if (stored && typeof stored.paranormalEffectsEnabled === "boolean") {
    return stored.paranormalEffectsEnabled;
  }
  return true;
}

export function areMapVfxEnabled(): boolean {
  const stored = readStoredGameSettings();
  if (stored && typeof stored.mapVfxEnabled === "boolean") {
    return stored.mapVfxEnabled;
  }
  return true;
}
