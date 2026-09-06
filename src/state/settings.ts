import type { Difficulty } from "../ai";
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from "@/utils/storage";

const OPTIONS_STORAGE_KEY = "gameSettings";

type StoredGameSettings = {
  paranormalEffectsEnabled?: unknown;
  mapVfxEnabled?: unknown;
};

const readStoredGameSettings = (): StoredGameSettings | null => {
  try {
    const stored = safeGetLocalStorageItem(OPTIONS_STORAGE_KEY);
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
  const raw =
    safeGetLocalStorageItem("shadowgov:difficulty", { logger: console }) ?? "NORMAL";
  switch (raw) {
    case "EASY":
    case "NORMAL":
    case "HARD":
    case "INSANE":
      return raw as Difficulty;
    case "TOP_SECRET_PLUS":
      return "INSANE";
    default:
      return "NORMAL";
  }
}

export function setDifficultyFromLabel(label: string) {
  const map: Record<string, string> = {
    "EASY - Intelligence Leak": "EASY",
    "NORMAL - Classified": "NORMAL",
    "HARD - Top Secret": "HARD",
    "INSANE - Shadow Directorate": "INSANE",
    "TOP SECRET+ - Meta-Cheating": "INSANE",
  };
  safeSetLocalStorageItem("shadowgov:difficulty", map[label] ?? "NORMAL", {
    logger: console,
  });
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
