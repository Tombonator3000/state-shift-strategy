import { recommendEditor } from '@/ai/editors.map';
import { AI_EDITORS, type EditorId } from '@/ai/editors';
import type { DifficultyTier } from '@/ai/difficulty';

function getAiSideRef(state: any) {
  return state?.players?.AI ?? state?.players?.ai ?? state?.ai ?? null;
}

function readDifficulty(state: any): DifficultyTier {
  const d = state?.options?.difficulty
    ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('difficulty') : null);
  return (['EASY', 'NORMAL', 'HARD', 'INSANE'] as const).includes(d as any) ? (d as DifficultyTier) : 'NORMAL';
}

export function ensureAiEditorSelected(state: any) {
  if (!(state?.expansions?.aiEditors ?? true)) return;
  const ai = getAiSideRef(state);
  if (!ai) return;
  if (ai.activeEditor && AI_EDITORS[ai.activeEditor as EditorId]) return;

  const aiFaction = ai.faction === 'government' ? 'government' : 'truth';
  const diff = readDifficulty(state);
  ai.activeEditor = recommendEditor(aiFaction, diff);
}

