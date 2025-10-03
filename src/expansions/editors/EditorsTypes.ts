export type EditorFaction = 'truth' | 'government' | 'neutral';

export type EditorHookPhase = 'onSetup' | 'onTurnStart' | 'onPlayCard';

export interface EditorHookDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export type EditorHooksMap = Partial<Record<EditorHookPhase, readonly EditorHookDefinition[]>>;

export interface EditorDefinition {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly faction: EditorFaction;
  readonly summary: string;
  readonly hookSummary: string;
  readonly recommendedHotspots?: readonly string[];
  readonly hooks: EditorHooksMap;
}

export interface EditorsJson {
  readonly editors: readonly EditorDefinition[];
}

export type EditorHookFor<Phase extends EditorHookPhase> = NonNullable<EditorHooksMap[Phase]> extends readonly (infer Hook)[]
  ? Hook
  : never;
