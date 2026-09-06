import type { GameCard } from '@/rules/mvp';
import { repairToMVP } from '@/mvp/validator';
import { validateMvpCard } from '@/utils/validate-mvp';

export function readExpansionCard(raw: unknown): { card: GameCard | null; unsupported: boolean } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { card: null, unsupported: false };
  const candidate = { ...raw } as GameCard;
  if (typeof candidate.id !== 'string' || !candidate.id) return { card: null, unsupported: false };

  // Legacy packs omit this field. ZONE already means a single state in the game.
  if (typeof candidate.type === 'string' && candidate.type.toUpperCase() === 'ZONE' && candidate.target == null) {
    candidate.target = { scope: 'state', count: 1 };
  }

  // Validate before repair: repair can strip unsupported effects while leaving
  // the original card text promising them. Such cards must stay unavailable.
  const validation = validateMvpCard(candidate);
  if (!validation.ok) {
    return { card: null, unsupported: validation.issues.some(issue => issue.code === 'invalid-effect-key') };
  }
  return { card: repairToMVP(candidate).card, unsupported: false };
}
