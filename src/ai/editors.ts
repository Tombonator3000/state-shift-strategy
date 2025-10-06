import { AI_PRESETS, mergeBiasModifiers, type BiasModifiers, type Difficulty } from "./difficulty";

export type EditorId =
  | "fox_muldrunk"
  | "florida_man"
  | "el_visto"
  | "hunter_s_thampson"
  | "agnes_inkwraith"
  | "delta_echo"
  | "sybil_margin"
  | "nocturne_typesetter";

export type DifficultyTier = Difficulty;

export interface AIPersonality {
  description: string;
  curiosity: number; // appetite for uncovering new leads
  caution: number; // willingness to hedge before publishing
  improvisation: number; // comfort with chaotic board states
  bravado: number; // taste for risky headline plays
  escalation: number; // tendency to press the attack once an opening appears
}

export interface EditorProfile {
  id: EditorId;
  codename: string;
  coverTitle: string;
  difficulty: DifficultyTier;
  desks: string[];
  specialty: string;
  personality: AIPersonality;
  defaultLocale: string;
  biasModifiers: BiasModifiers;
}

const createPersonality = (
  description: string,
  values: Omit<AIPersonality, "description">,
): AIPersonality => ({
  description,
  ...values,
});

const createBiasModifiers = (
  difficulty: Difficulty,
  overrides?: Partial<BiasModifiers>,
): BiasModifiers => {
  const base = AI_PRESETS[difficulty].biasModifiers;
  return mergeBiasModifiers(base, overrides);
};

export const AI_EDITORS: Record<EditorId, EditorProfile> = {
  fox_muldrunk: {
    id: "fox_muldrunk",
    codename: "Fox Muldrunk",
    coverTitle: "Basement Desk Sleuth",
    difficulty: "NORMAL",
    desks: ["Investigations", "Cold Files"],
    specialty: "Connects redacted dots before anyone else bothers to notice they align.",
    personality: createPersonality(
      "A believer with a corkboard empire and more leads than sleep.",
      {
        curiosity: 0.9,
        caution: 0.55,
        improvisation: 0.65,
        bravado: 0.45,
        escalation: 0.6,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("NORMAL", { combo: 1.1, income: 0.95 }),
  },
  florida_man: {
    id: "florida_man",
    codename: "Florida Man",
    coverTitle: "Chaos Stringer",
    difficulty: "NORMAL",
    desks: ["Breaking Weird", "Disaster Lifestyle"],
    specialty: "Turns every hotline tip into a statewide emergency drill.",
    personality: createPersonality(
      "Breathes conspiracy humidity and thrives on reactive plays.",
      {
        curiosity: 0.7,
        caution: 0.25,
        improvisation: 0.9,
        bravado: 0.85,
        escalation: 0.8,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("NORMAL", { combo: 1.05, income: 0.9 }),
  },
  el_visto: {
    id: "el_visto",
    codename: "El Visto",
    coverTitle: "Vegas Residency Reviewer",
    difficulty: "EASY",
    desks: ["Entertainment", "Anomalous Sightings"],
    specialty: "Stacks stagecraft reveals with real sightings until audiences forget which is which.",
    personality: createPersonality(
      "Charming showman who slow-plays the weird until the encore.",
      {
        curiosity: 0.6,
        caution: 0.45,
        improvisation: 0.7,
        bravado: 0.6,
        escalation: 0.5,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("EASY", { combo: 0.9, income: 0.95 }),
  },
  hunter_s_thampson: {
    id: "hunter_s_thampson",
    codename: "Hunter S. Thampson",
    coverTitle: "Gonzo Bureau Chief",
    difficulty: "HARD",
    desks: ["Field Reports", "Chemical Accountability"],
    specialty: "Drops manifesto-length exposes mid-chase and dares rivals to keep up.",
    personality: createPersonality(
      "A rolling thundercloud of deadline adrenaline.",
      {
        curiosity: 0.8,
        caution: 0.3,
        improvisation: 0.75,
        bravado: 0.9,
        escalation: 0.85,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("HARD", { combo: 1.25, income: 1.1 }),
  },
  agnes_inkwraith: {
    id: "agnes_inkwraith",
    codename: "Agnes Inkwraith",
    coverTitle: "Obituary Revisionist",
    difficulty: "HARD",
    desks: ["Archives", "Occult Estates"],
    specialty: "Excavates censored obits to expose immortal donors and their shadow trusts.",
    personality: createPersonality(
      "Keeps ledgers of restless sources and pays debts in secrets.",
      {
        curiosity: 0.85,
        caution: 0.7,
        improvisation: 0.4,
        bravado: 0.35,
        escalation: 0.55,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("HARD", { combo: 1.1, income: 1.25 }),
  },
  delta_echo: {
    id: "delta_echo",
    codename: "Delta Echo",
    coverTitle: "Numbers Station Ombudsman",
    difficulty: "INSANE",
    desks: ["Signals", "Cipher Watch"],
    specialty: "Decodes broadcast anomalies before the agencies notice their encryption glitched.",
    personality: createPersonality(
      "A walking shortwave antenna who plays the board four transmissions ahead.",
      {
        curiosity: 0.75,
        caution: 0.8,
        improvisation: 0.55,
        bravado: 0.4,
        escalation: 0.65,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("INSANE", { combo: 1.4, income: 1.3 }),
  },
  sybil_margin: {
    id: "sybil_margin",
    codename: "Sybil Margin",
    coverTitle: "Probability Columnist",
    difficulty: "HARD",
    desks: ["Analytics", "Future Crime"],
    specialty: "Publishes predictive spreads that make the odds blink first.",
    personality: createPersonality(
      "Cold reader of timelines with a fondness for impossible margins.",
      {
        curiosity: 0.65,
        caution: 0.75,
        improvisation: 0.5,
        bravado: 0.55,
        escalation: 0.6,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("HARD", { combo: 1.18, income: 1.2 }),
  },
  nocturne_typesetter: {
    id: "nocturne_typesetter",
    codename: "Nocturne Typesetter",
    coverTitle: "Midnight Edition Cartographer",
    difficulty: "INSANE",
    desks: ["Layout", "Temporal Logistics"],
    specialty: "Maps tomorrow's front page onto today's operations without ripping the timeline.",
    personality: createPersonality(
      "Calm, precise, and allergic to paradox but willing to bend headlines through it.",
      {
        curiosity: 0.7,
        caution: 0.85,
        improvisation: 0.6,
        bravado: 0.45,
        escalation: 0.5,
      },
    ),
    defaultLocale: "en-US",
    biasModifiers: createBiasModifiers("INSANE", { combo: 1.32, income: 1.35 }),
  },
};

export const EDITOR_IDS = Object.keys(AI_EDITORS) as EditorId[];
