import type { DifficultyTier } from '@/ai/difficulty';
import { DIFFICULTY_MULT } from '@/ai/difficulty';
import type { EditorProfile } from '@/ai/editors';

export function resolveEffectiveMods(editor: EditorProfile, diff: DifficultyTier) {
  const d = DIFFICULTY_MULT[diff];
  const r = editor.runtimeModifiers ?? {};
  return {
    ipIncomeScalar:    (r.ipIncomeScalar ?? 1) * d.ipIncomeScalar,
    mediaTruthDelta:   (r.mediaTruthDelta ?? 0),
    attackCostDelta:   (r.attackCostDelta ?? 0),
    zonePressureBonus: (r.zonePressureBonus ?? 0),
    weightBias: {
      media:  (editor.biasModifiers?.mediaWeight  ?? 1) * d.mediaWeightBias,
      attack: (editor.biasModifiers?.attackWeight ?? 1) * d.attackWeightBias,
      zone:   (editor.biasModifiers?.zoneWeight   ?? 1) * d.zoneWeightBias,
      comboAggression: (editor.biasModifiers?.comboAggression ?? 1) * d.comboAggression,
    },
  };
}
