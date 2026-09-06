import type { GameState } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import { applyStateCombinationCostModifiers } from '@/data/stateCombinations';
import { resolveEditor, gatherEditorPlayCardAdjustments } from '@/expansions/editors/EditorsEngine';
import { trackCharacterAppearance } from '@/game/recurringCharacters';
import { quoteZonePressure } from '@/systems/cardResolution';

export function quoteHumanCard(state: GameState, card: GameCard) {
  let cost = applyStateCombinationCostModifiers(card.cost, card.type, 'human', state.stateCombinationEffects);
  const editor = state.editorDef ?? resolveEditor(state.playerEditor ?? state.editorId ?? null);
  if (editor && card.type === 'ATTACK') cost += gatherEditorPlayCardAdjustments(editor).attackIpCostDelta;
  const recurring = trackCharacterAppearance(card.name, card.tags ?? [], state.round, structuredClone(state.recurringCharacters));
  cost = Math.max(0, Math.trunc(cost - (recurring.bonus.costReduction ?? 0)));
  return { cost, pressure: quoteZonePressure(state, card) };
}
