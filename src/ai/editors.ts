export type EditorId =
  | 'editor_muldrunk' | 'editor_floridaman' | 'editor_elvis' | 'editor_hunter'
  | 'editor_batboy'   | 'editor_mothwoman'  | 'editor_smitherson' | 'editor_cigs'
  | 'editor_bureau'   | 'editor_mkunit'     | 'editor_blackbudget'| 'editor_redactor';

export type DifficultyTier = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';
export type AIPersonality = 'balanced' | 'aggressive' | 'manipulator' | 'defensive' | 'chaotic' | 'methodical';

export interface EditorProfile {
  id: EditorId;
  faction: 'truth' | 'government' | 'neutral';
  name: string;
  title?: string;
  difficulty: DifficultyTier;
  aiPersonality: AIPersonality;
  biasModifiers?: {
    mediaWeight?: number; attackWeight?: number; zoneWeight?: number;
    targetOwnedStateBias?: number; targetNeutralStateBias?: number; targetEnemyStateBias?: number;
    comboAggression?: number;
  };
  runtimeModifiers?: {
    ipIncomeScalar?: number;   // startTurn income ×=
    mediaTruthDelta?: number;  // MEDIA truth +=
    attackCostDelta?: number;  // ATTACK IP cost +=
    zonePressureBonus?: number;// ZONE pressure +=
  };
  image?: { portrait?: string; broll?: string };
  signature?: string;
}

export const AI_EDITORS: Record<EditorId, EditorProfile> = {
  // TRUTH
  editor_muldrunk:   { id:'editor_muldrunk', faction:'truth', name:'Fox Muldrunk', difficulty:'NORMAL', aiPersonality:'balanced',
    biasModifiers:{ mediaWeight:1.10, zoneWeight:1.05 }, runtimeModifiers:{ mediaTruthDelta:+1 } },
  editor_floridaman: { id:'editor_floridaman', faction:'truth', name:'Florida Man (Freelance)', difficulty:'HARD', aiPersonality:'chaotic',
    biasModifiers:{ attackWeight:1.20, comboAggression:1.10 }, runtimeModifiers:{ attackCostDelta:-1 } },
  editor_elvis:      { id:'editor_elvis', faction:'truth', name:'Elvis in Exile', difficulty:'NORMAL', aiPersonality:'balanced',
    biasModifiers:{ mediaWeight:1.10 }, runtimeModifiers:{ mediaTruthDelta:+1 } },
  editor_hunter:     { id:'editor_hunter', faction:'truth', name:'Hunter S. Tabloid', difficulty:'HARD', aiPersonality:'aggressive',
    biasModifiers:{ mediaWeight:1.05, attackWeight:1.05 }, runtimeModifiers:{ mediaTruthDelta:+1, attackCostDelta:+1 } },
  editor_batboy:     { id:'editor_batboy', faction:'truth', name:'Bat Boy Jr.', difficulty:'HARD', aiPersonality:'aggressive',
    biasModifiers:{ zoneWeight:1.15, comboAggression:1.20 }, runtimeModifiers:{ zonePressureBonus:+1 } },
  editor_mothwoman:  { id:'editor_mothwoman', faction:'truth', name:'Mothwoman of Copy Desk', difficulty:'EASY', aiPersonality:'defensive',
    biasModifiers:{ mediaWeight:1.20, attackWeight:0.90 }, runtimeModifiers:{ mediaTruthDelta:+1, attackCostDelta:+1 } },

  // GOVERNMENT
  editor_smitherson: { id:'editor_smitherson', faction:'government', name:'Agent Smitherson', difficulty:'NORMAL', aiPersonality:'balanced',
    biasModifiers:{ mediaWeight:1.15 }, runtimeModifiers:{ ipIncomeScalar:1.10, mediaTruthDelta:-1 } },
  editor_cigs:       { id:'editor_cigs', faction:'government', name:'Cigarette Whisperer', difficulty:'INSANE', aiPersonality:'aggressive',
    biasModifiers:{ attackWeight:1.25, comboAggression:1.25 }, runtimeModifiers:{ ipIncomeScalar:1.10, mediaTruthDelta:-1, attackCostDelta:-1 } },
  editor_bureau:     { id:'editor_bureau', faction:'government', name:'Bureau Chief Deep Throat', difficulty:'HARD', aiPersonality:'manipulator',
    biasModifiers:{ zoneWeight:1.10, targetNeutralStateBias:1.10 }, runtimeModifiers:{ zonePressureBonus:+1 } },
  editor_mkunit:     { id:'editor_mkunit', faction:'government', name:'MK-Editor Unit 7', difficulty:'HARD', aiPersonality:'methodical',
    biasModifiers:{ comboAggression:1.10 }, runtimeModifiers:{ ipIncomeScalar:1.10, attackCostDelta:+1 } },
  editor_blackbudget:{ id:'editor_blackbudget', faction:'government', name:'Black Budget Comptroller', difficulty:'NORMAL', aiPersonality:'manipulator',
    biasModifiers:{ attackWeight:1.10 }, runtimeModifiers:{ attackCostDelta:-1, zonePressureBonus:-1 } },
  editor_redactor:   { id:'editor_redactor', faction:'government', name:'The Redactor', difficulty:'EASY', aiPersonality:'defensive',
    biasModifiers:{ mediaWeight:0.90 }, runtimeModifiers:{ mediaTruthDelta:-2 } },
};

export const EDITOR_IDS = Object.keys(AI_EDITORS) as EditorId[];

export function getEditor(id: EditorId) { return AI_EDITORS[id]; }
