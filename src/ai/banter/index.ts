import type { EditorId } from "../editors";

import agnesInkwraith from "./agnes_inkwraith.en-US.json" assert { type: "json" };
import deltaEcho from "./delta_echo.en-US.json" assert { type: "json" };
import elVisto from "./el_visto.en-US.json" assert { type: "json" };
import floridaMan from "./florida_man.en-US.json" assert { type: "json" };
import foxMuldrunk from "./fox_muldrunk.en-US.json" assert { type: "json" };
import hunterThampson from "./hunter_s_thampson.en-US.json" assert { type: "json" };
import nocturneTypesetter from "./nocturne_typesetter.en-US.json" assert { type: "json" };
import sybilMargin from "./sybil_margin.en-US.json" assert { type: "json" };

type BanterCategoryMap = Record<string, string[]>;

export interface EditorBanterBank {
  schemaVersion: number;
  editorId: EditorId;
  locale: string;
  categories: BanterCategoryMap;
}

type RawEditorBanterBank = {
  schemaVersion?: unknown;
  editorId?: unknown;
  locale?: unknown;
  categories?: unknown;
};

type Locale = string;

type BankLookup = Partial<Record<EditorId, EditorBanterBank>>;

const RAW_BANKS: Record<Locale, Partial<Record<EditorId, unknown>>> = {
  "en-US": {
    fox_muldrunk: foxMuldrunk,
    florida_man: floridaMan,
    el_visto: elVisto,
    hunter_s_thampson: hunterThampson,
    agnes_inkwraith: agnesInkwraith,
    delta_echo: deltaEcho,
    sybil_margin: sybilMargin,
    nocturne_typesetter: nocturneTypesetter,
  },
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

const validateBank = (value: unknown): EditorBanterBank | null => {
  const raw = value as RawEditorBanterBank | null;
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const { schemaVersion, editorId, locale, categories } = raw;
  if (typeof schemaVersion !== "number" || schemaVersion < 1) {
    return null;
  }
  if (typeof editorId !== "string") {
    return null;
  }
  if (typeof locale !== "string" || locale.length === 0) {
    return null;
  }
  if (!categories || typeof categories !== "object") {
    return null;
  }

  const normalizedCategories: BanterCategoryMap = {};
  for (const [key, valueList] of Object.entries(categories)) {
    if (!isStringArray(valueList)) {
      return null;
    }
    normalizedCategories[key] = valueList;
  }

  return {
    schemaVersion,
    editorId: editorId as EditorId,
    locale,
    categories: normalizedCategories,
  };
};

const BANKS: Record<Locale, BankLookup> = {};

for (const [locale, entries] of Object.entries(RAW_BANKS)) {
  for (const [editorId, payload] of Object.entries(entries) as [EditorId, unknown][]) {
    const validated = validateBank(payload);
    if (!validated) {
      console.warn(
        `[AI][Banter] Failed to validate banter bank for ${editorId} (${locale}). Payload was ignored.`,
      );
      continue;
    }

    if (!BANKS[locale]) {
      BANKS[locale] = {};
    }

    BANKS[locale]![editorId] = validated;
  }
}

const DEFAULT_LOCALE = "en-US";

export const getBanterBank = (
  editorId: EditorId,
  locale: string = DEFAULT_LOCALE,
): EditorBanterBank | null => {
  const normalizedLocale = locale || DEFAULT_LOCALE;
  const localeBanks = BANKS[normalizedLocale];
  const exactMatch = localeBanks?.[editorId] ?? null;
  if (exactMatch) {
    return exactMatch;
  }

  if (normalizedLocale !== DEFAULT_LOCALE) {
    const fallback = BANKS[DEFAULT_LOCALE]?.[editorId] ?? null;
    if (fallback) {
      console.warn(
        `[AI][Banter] Missing ${normalizedLocale} bank for ${editorId}. Falling back to ${DEFAULT_LOCALE}.`,
      );
      return fallback;
    }
  }

  console.warn(`[AI][Banter] No banter bank found for editor ${editorId} in locale ${normalizedLocale}.`);
  return null;
};

export const listBanterLocales = (): string[] => Object.keys(BANKS);
