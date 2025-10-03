import editorsJson from './editors.json';
import type { EditorDefinition, EditorHookFor, EditorHookPhase, EditorsJson } from './EditorsTypes';

const data = editorsJson as EditorsJson;
const editorsList = data.editors as const satisfies readonly EditorDefinition[];

export type EditorId = (typeof editorsList)[number]['id'];
export type EditorSlug = (typeof editorsList)[number]['slug'];

const editorsById = new Map<EditorId, EditorDefinition>(
  editorsList.map((editor) => [editor.id, editor]),
);

export const FEATURE_EDITORS_MINIDRAFT = false;

export interface ResolveEditorOptions {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
}

export const getEditors = (): readonly EditorDefinition[] => editorsList;

export const getEditorById = (editorId: EditorId | null | undefined): EditorDefinition | undefined => {
  if (!editorId) {
    return undefined;
  }
  return editorsById.get(editorId);
};

export const resolveActiveEditor = (options?: ResolveEditorOptions): EditorDefinition | undefined => {
  if (!options) {
    return undefined;
  }

  const { editorId, fallbackId } = options;
  const active = getEditorById(editorId ?? undefined);
  if (active) {
    return active;
  }

  if (fallbackId) {
    return getEditorById(fallbackId);
  }

  return undefined;
};

type HookCallback<Phase extends EditorHookPhase> = (payload: {
  readonly editor: EditorDefinition;
  readonly hook: EditorHookFor<Phase>;
}) => void;

type HookTarget = EditorId | EditorDefinition | null | undefined;

const normaliseEditor = (editorLike: HookTarget): EditorDefinition | undefined => {
  if (!editorLike) {
    return undefined;
  }

  if (typeof editorLike === 'string') {
    return getEditorById(editorLike as EditorId);
  }

  return editorLike;
};

const createHookApplier = <Phase extends EditorHookPhase>(phase: Phase) => {
  return (target: HookTarget, callback: HookCallback<Phase>): void => {
    const editor = normaliseEditor(target);
    if (!editor) {
      return;
    }

    const hooksForPhase = editor.hooks?.[phase];
    if (!hooksForPhase?.length) {
      return;
    }

    for (const hook of hooksForPhase) {
      callback({
        editor,
        hook: hook as EditorHookFor<Phase>,
      });
    }
  };
};

// @future-editors-hook:applyOnSetup
export const applyOnSetup = createHookApplier('onSetup');

// @future-editors-hook:applyOnTurnStart
export const applyOnTurnStart = createHookApplier('onTurnStart');

// @future-editors-hook:applyOnPlayCard
export const applyOnPlayCard = createHookApplier('onPlayCard');

const FLORIDA_TOKENS = new Set([
  'fl',
  'florida',
  'florida, usa',
  'state-florida',
  'sunshine-state',
]);

export type HotspotLike =
  | string
  | number
  | { readonly id?: string | number; readonly slug?: string; readonly stateName?: string; readonly name?: string };

const normaliseHotspotToken = (value: unknown): string => {
  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const candidate =
      (value as Record<string, unknown>).slug ??
      (value as Record<string, unknown>).id ??
      (value as Record<string, unknown>).stateName ??
      (value as Record<string, unknown>).name;

    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return String(candidate);
    }
  }

  return '';
};

export const isFloridaHot = (hotspot: HotspotLike | null | undefined): boolean => {
  if (hotspot === null || hotspot === undefined) {
    return false;
  }

  const token = normaliseHotspotToken(hotspot).trim().toLowerCase();
  if (!token) {
    return false;
  }

  if (FLORIDA_TOKENS.has(token)) {
    return true;
  }

  return token.includes('florida');
};
