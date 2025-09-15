export const RULESET = "v2.1E" as const;

// Draw-mode: choose one and document in UI
export type DrawMode = "drawToFive" | "fixedPerTurn";
export const DRAW_MODE: DrawMode = "drawToFive";
export const FIXED_DRAW_PER_TURN = 1; // used if fixedPerTurn

// Three-card limit (already documented & enforced)
export const MAX_PLAYS_PER_TURN = 3;

// Cost: v2.1E uses ONLY effect-based cost
export const EFFECT_BASED_COST = true;
