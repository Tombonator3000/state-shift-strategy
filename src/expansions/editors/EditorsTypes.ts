export type EditorId = string;

export type EditorEffect = {
  start_ipDelta?: number;
  onSetup_addCardIds?: string[];
  onSetup_deckSizeDelta?: number;
  round1_drawDelta?: number;
  turnStart_scandalChance?: number;
  scandal_effect?: 'randomDiscard:1';
  onMediaPlay_truthDelta?: number;
  attack_ipCostDelta?: number;
};

export type EditorDef = {
  id: EditorId;
  name: string;
  portrait?: string;
  flavor?: string;
  bonus: EditorEffect;
  penalty: EditorEffect;
};
