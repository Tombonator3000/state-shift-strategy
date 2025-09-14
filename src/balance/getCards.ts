import type { Card } from "./types";

// Import core batches
import { CORE_BATCH_TRUTH_1 } from "../data/core/truth-batch-1";
import { CORE_BATCH_TRUTH_2 } from "../data/core/truth-batch-2";
import { CORE_BATCH_TRUTH_3 } from "../data/core/truth-batch-3";
import { CORE_BATCH_TRUTH_4 } from "../data/core/truth-batch-4";
import { CORE_BATCH_GOV_1 } from "../data/core/government-batch-1";
import { CORE_BATCH_GOV_2 } from "../data/core/government-batch-2";
import { CORE_BATCH_GOV_3 } from "../data/core/government-batch-3";
import { CORE_BATCH_GOV_4 } from "../data/core/government-batch-4";

function getExtensionCardsSafe(): Card[] {
  // @ts-ignore - read from global if available
  const reg: Card[] = (window as any)?.ShadowGovExtensions?.cards ?? [];
  return Array.isArray(reg) ? (reg as Card[]) : [];
}

export function getAllCoreCards(): Card[] {
  return [
    ...CORE_BATCH_TRUTH_1,
    ...CORE_BATCH_TRUTH_2,
    ...CORE_BATCH_TRUTH_3,
    ...CORE_BATCH_TRUTH_4,
    ...CORE_BATCH_GOV_1,
    ...CORE_BATCH_GOV_2,
    ...CORE_BATCH_GOV_3,
    ...CORE_BATCH_GOV_4,
  ] as Card[];
}

export function getAllCards(includeExtensions: boolean): Card[] {
  const core = getAllCoreCards();
  if (!includeExtensions) return core;
  const ext = getExtensionCardsSafe();
  return [...core, ...ext];
}
