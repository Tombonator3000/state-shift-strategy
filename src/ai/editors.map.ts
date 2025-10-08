import type { EditorId } from './editors';
import type { DifficultyTier } from './difficulty';

export function recommendEditor(faction:'truth'|'government', diff:DifficultyTier): EditorId {
  if (faction === 'government') {
    if (diff === 'EASY')   return 'editor_redactor';
    if (diff === 'NORMAL') return 'editor_smitherson';
    if (diff === 'HARD')   return 'editor_mkunit';
    return 'editor_cigs'; // INSANE
  } else {
    if (diff === 'EASY')   return 'editor_mothwoman';
    if (diff === 'NORMAL') return 'editor_muldrunk';
    if (diff === 'HARD')   return 'editor_batboy';
    return 'editor_hunter'; // INSANE
  }
}
