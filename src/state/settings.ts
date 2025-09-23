import type { Difficulty } from "../ai";
import type { DrawMode } from "@/data/cardDrawingSystem";

const OPTIONS_STORAGE_KEY = "gameSettings";

const VALID_DRAW_MODES: DrawMode[] = ['standard', 'classic', 'momentum', 'catchup', 'fast'];

export const DEFAULT_DRAW_MODE: DrawMode = 'standard';

const isRecognizedDrawMode = (mode: unknown): mode is DrawMode =>
  typeof mode === 'string' && (VALID_DRAW_MODES as readonly string[]).includes(mode);

export const parseDrawModeSetting = (rawSettings: string | null | undefined): DrawMode => {
  if (!rawSettings) {
    return DEFAULT_DRAW_MODE;
  }

  try {
    const parsed = JSON.parse(rawSettings) as { drawMode?: unknown } | null;
    if (parsed && isRecognizedDrawMode(parsed.drawMode)) {
      return parsed.drawMode;
    }
  } catch (error) {
    console.warn('Failed to parse draw mode from saved settings, defaulting to standard.', error);
  }

  return DEFAULT_DRAW_MODE;
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
  if (typeof localStorage === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (!stored) {
      return false;
    }

    const parsed = JSON.parse(stored) as { paranormalEffectsEnabled?: unknown } | null;
    if (parsed && typeof parsed.paranormalEffectsEnabled === "boolean") {
      return parsed.paranormalEffectsEnabled;
    }
  } catch (error) {
    console.warn("Failed to read paranormal effects setting: ", error);
  }

  return false;
}

export function areUiNotificationsEnabled(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (!stored) {
      return false;
    }

    const parsed = JSON.parse(stored) as { uiNotificationsEnabled?: unknown } | null;
    if (parsed && typeof parsed.uiNotificationsEnabled === "boolean") {
      return parsed.uiNotificationsEnabled;
    }
  } catch (error) {
    console.warn("Failed to read UI notifications setting: ", error);
  }

  return false;
}
