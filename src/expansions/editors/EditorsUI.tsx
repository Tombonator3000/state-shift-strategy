import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EDITORS_EXPANSION_ID, isEditorsFeatureEnabled } from '@/data/expansions/features';

export { EDITORS_EXPANSION_ID } from '@/data/expansions/features';

import type { EditorDefinition, EditorFaction, EditorHookDefinition, EditorHookPhase } from './EditorsTypes';
import { getEditors, resolveActiveEditor, type EditorId } from './EditorsEngine';

export interface EditorsUIProps extends PropsWithChildren {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
  readonly className?: string;
}

const STORAGE_KEY = 'shadowgov:editors:last-selection';

const PHASE_LABELS: Record<EditorHookPhase, string> = {
  onSetup: 'Setup',
  onTurnStart: 'Turn Start',
  onPlayCard: 'On Play',
};

const PENALTY_KEYWORDS = [
  'opponent',
  'enemy',
  'lock',
  'locked',
  'discard',
  'tax',
  'suppress',
  'deny',
  'burn',
  'force',
  'steal',
  'reduce',
  'lose',
  'exhaust',
  'penalty',
  'sacrifice',
];

const HOOK_PHASES: readonly EditorHookPhase[] = ['onSetup', 'onTurnStart', 'onPlayCard'];

export interface EditorEffectSummary {
  readonly key: string;
  readonly phase: EditorHookPhase;
  readonly label: string;
  readonly description: string;
  readonly tone: 'bonus' | 'penalty';
}

export interface EditorEffectBuckets {
  readonly bonuses: readonly EditorEffectSummary[];
  readonly penalties: readonly EditorEffectSummary[];
}

const normalizeDescription = (description: string): string => description.toLowerCase();

const classifyHookTone = (hook: EditorHookDefinition): 'bonus' | 'penalty' => {
  const text = normalizeDescription(hook.description);
  return PENALTY_KEYWORDS.some(keyword => text.includes(keyword)) ? 'penalty' : 'bonus';
};

export const summarizeEditorEffects = (editor: EditorDefinition): EditorEffectBuckets => {
  const bonuses: EditorEffectSummary[] = [];
  const penalties: EditorEffectSummary[] = [];

  HOOK_PHASES.forEach(phase => {
    const hooksForPhase = editor.hooks?.[phase] ?? [];
    hooksForPhase.forEach(hook => {
      const tone = classifyHookTone(hook);
      const entry: EditorEffectSummary = {
        key: `${phase}:${hook.id}`,
        phase,
        label: hook.label,
        description: hook.description,
        tone,
      };
      if (tone === 'bonus') {
        bonuses.push(entry);
      } else {
        penalties.push(entry);
      }
    });
  });

  return {
    bonuses,
    penalties,
  };
};

const readStoredSelections = (): Partial<Record<'truth' | 'government' | 'neutral' | 'any', EditorId>> => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: Partial<Record<'truth' | 'government' | 'neutral' | 'any', EditorId>> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if ((key === 'truth' || key === 'government' || key === 'neutral' || key === 'any') && typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    console.warn('[Editors] Failed to read stored selection', error);
    return {};
  }
};

const writeStoredSelections = (map: Partial<Record<'truth' | 'government' | 'neutral' | 'any', EditorId>>) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn('[Editors] Failed to persist selection', error);
  }
};

const rememberSelection = (editor: EditorDefinition | null) => {
  if (!editor) {
    return;
  }
  const map = readStoredSelections();
  map.any = editor.id;
  map[editor.faction] = editor.id;
  writeStoredSelections(map);
};

const getStoredSelection = (faction?: EditorFaction | 'any'): EditorId | null => {
  const map = readStoredSelections();
  if (!faction || faction === 'any') {
    return map.any ?? null;
  }
  return map[faction] ?? map.any ?? null;
};

const filterEditorsByFaction = (faction?: EditorFaction | 'any'): EditorDefinition[] => {
  const editors = getEditors();
  if (!faction || faction === 'any') {
    return [...editors];
  }
  return editors.filter(editor => editor.faction === faction || editor.faction === 'neutral');
};

interface ChooseEditorOptions {
  readonly faction?: EditorFaction | 'any';
  readonly defaultId?: EditorId | null;
  readonly allowSkip?: boolean;
}

interface EditorsChooseModalProps {
  readonly editors: readonly EditorDefinition[];
  readonly initialSelection?: EditorId | null;
  readonly onConfirm: (editor: EditorDefinition | null) => void;
  readonly onSkip?: () => void;
  readonly allowSkip: boolean;
}

const factionTone: Record<EditorFaction, string> = {
  truth: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40',
  government: 'bg-sky-500/10 text-sky-600 border-sky-500/40',
  neutral: 'bg-amber-500/10 text-amber-600 border-amber-500/40',
};

const ensureHost = (): { container: HTMLElement; root: Root } => {
  if (typeof document === 'undefined') {
    throw new Error('Editors modal host requires a document.');
  }
  if (activeHost) {
    return activeHost;
  }
  const container = document.createElement('div');
  container.setAttribute('data-editors-modal-host', '');
  document.body.appendChild(container);
  const root = createRoot(container);
  activeHost = { container, root };
  return activeHost;
};

const teardownHost = () => {
  if (!activeHost) {
    return;
  }
  activeHost.root.unmount();
  if (activeHost.container.parentNode) {
    activeHost.container.parentNode.removeChild(activeHost.container);
  }
  activeHost = null;
};

let activeHost: { container: HTMLElement; root: Root } | null = null;
let activePromise: Promise<EditorId | null> | null = null;

// [EDITORS_CHOOSE_MODAL]
const EditorsChooseModal = ({ editors, initialSelection, onConfirm, onSkip, allowSkip }: EditorsChooseModalProps) => {
  const [selectedId, setSelectedId] = useState<EditorId | null>(() => {
    if (initialSelection && editors.some(editor => editor.id === initialSelection)) {
      return initialSelection;
    }
    return editors[0]?.id ?? null;
  });

  useEffect(() => {
    if (!initialSelection) {
      return;
    }
    if (editors.some(editor => editor.id === initialSelection)) {
      setSelectedId(initialSelection);
    }
  }, [initialSelection, editors]);

  const selectedEditor = useMemo(
    () => editors.find(editor => editor.id === selectedId) ?? null,
    [editors, selectedId],
  );

  const effectSummary = useMemo(() => (
    selectedEditor ? summarizeEditorEffects(selectedEditor) : { bonuses: [], penalties: [] }
  ), [selectedEditor]);

  return (
    <Dialog open>
      <DialogContent
        className="max-w-4xl gap-0 border border-foreground/20 bg-background/95 p-0 shadow-xl"
        onPointerDownOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => event.preventDefault()}
      >
        <DialogHeader className="space-y-1 border-b border-border bg-muted/40 px-6 py-4 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Assign a Desk Editor
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose an editor to tune your newsroom before the presses roll.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 px-6 pb-6 pt-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ScrollArea className="h-[360px] rounded border border-border/40 bg-background/70">
            <div className="grid gap-3 p-4">
              {editors.map(editor => {
                const isSelected = selectedId === editor.id;
                const tone = factionTone[editor.faction];
                const summary = summarizeEditorEffects(editor);
                return (
                  <button
                    key={editor.id}
                    type="button"
                    onClick={() => setSelectedId(editor.id)}
                    className={cn(
                      'flex flex-col gap-3 rounded-lg border bg-background/80 p-4 text-left transition',
                      'hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected ? 'border-foreground shadow-lg' : 'border-border/50 hover:border-foreground/60',
                    )}
                    data-editor-id={editor.id}
                    data-state={isSelected ? 'selected' : 'idle'}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{editor.shortName}</p>
                        <h3 className="text-lg font-semibold leading-tight">{editor.name}</h3>
                        <p className="text-sm text-muted-foreground">{editor.tagline}</p>
                      </div>
                      <Badge className={cn('border text-xs font-semibold uppercase tracking-wide', tone)}>
                        {editor.faction}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground/90">{editor.summary}</p>
                    {editor.hookSummary ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                        Focus: <span className="font-normal normal-case text-muted-foreground">{editor.hookSummary}</span>
                      </p>
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-2">
                      {summary.bonuses.length > 0 ? (
                        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700">
                          <p className="text-xs font-semibold uppercase tracking-wide">Desk Bonuses</p>
                          <ul className="mt-2 space-y-2 text-xs">
                            {summary.bonuses.map(effect => (
                              <li key={effect.key}>
                                <span className="font-semibold">{PHASE_LABELS[effect.phase]}:</span> {effect.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {summary.penalties.length > 0 ? (
                        <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-rose-700">
                          <p className="text-xs font-semibold uppercase tracking-wide">Desk Tradeoffs</p>
                          <ul className="mt-2 space-y-2 text-xs">
                            {summary.penalties.map(effect => (
                              <li key={effect.key}>
                                <span className="font-semibold">{PHASE_LABELS[effect.phase]}:</span> {effect.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="flex h-full flex-col gap-4 rounded border border-border/50 bg-background/70 p-4">
            {selectedEditor ? (
              <div className="space-y-3" data-editor-preview="selected">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected Editor</p>
                  <h4 className="text-lg font-semibold leading-tight">{selectedEditor.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedEditor.summary}</p>
                </div>
                {selectedEditor.recommendedHotspots?.length ? (
                  <div className="rounded border border-border/40 bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Favoured Hotspots</p>
                    <p className="text-xs text-muted-foreground/90">
                      {selectedEditor.recommendedHotspots.join(', ')}
                    </p>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {effectSummary.bonuses.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Bonuses</p>
                      <ul className="mt-1 space-y-1 text-xs text-emerald-700">
                        {effectSummary.bonuses.map(effect => (
                          <li key={effect.key}>
                            <span className="font-semibold">{PHASE_LABELS[effect.phase]}:</span> {effect.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {effectSummary.penalties.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Tradeoffs</p>
                      <ul className="mt-1 space-y-1 text-xs text-rose-700">
                        {effectSummary.penalties.map(effect => (
                          <li key={effect.key}>
                            <span className="font-semibold">{PHASE_LABELS[effect.phase]}:</span> {effect.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select an editor to preview their impact.
              </div>
            )}
            <div className="mt-auto flex flex-col gap-3">
              <Button
                className="w-full"
                disabled={!selectedEditor}
                onClick={() => onConfirm(selectedEditor ?? null)}
              >
                {selectedEditor ? `Start with ${selectedEditor.shortName}` : 'Select an Editor'}
              </Button>
              {allowSkip ? (
                <Button variant="ghost" className="w-full" onClick={() => (onSkip ? onSkip() : onConfirm(null))}>
                  Play without an editor
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const chooseEditor = (options: ChooseEditorOptions = {}): Promise<EditorId | null> => {
  if (activePromise) {
    return activePromise;
  }
  const { faction = 'any', defaultId, allowSkip = true } = options;
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  const availableEditors = filterEditorsByFaction(faction);
  if (availableEditors.length === 0) {
    return Promise.resolve(null);
  }

  const storedSelection = getStoredSelection(faction);
  const initialSelection = (defaultId ?? storedSelection) && availableEditors.some(editor => editor.id === (defaultId ?? storedSelection))
    ? (defaultId ?? storedSelection)
    : availableEditors[0]?.id ?? null;

  activePromise = new Promise<EditorId | null>((resolve) => {
    const host = ensureHost();
    host.root.render(
      <EditorsChooseModal
        editors={availableEditors}
        initialSelection={initialSelection}
        allowSkip={allowSkip}
        onConfirm={(editor) => {
          if (editor) {
            rememberSelection(editor);
            resolve(editor.id);
          } else {
            resolve(null);
          }
          teardownHost();
          activePromise = null;
        }}
        onSkip={() => {
          resolve(null);
          teardownHost();
          activePromise = null;
        }}
      />,
    );
  });

  return activePromise;
};

export const isEditorsExpansionEnabled = (): boolean => {
  try {
    return isEditorsFeatureEnabled();
  } catch (error) {
    console.warn('[Editors] Failed to resolve expansion state', error);
    return false;
  }
};

export const EditorsUI = ({ editorId, fallbackId, className, children }: EditorsUIProps) => {
  const editor = resolveActiveEditor({ editorId, fallbackId });

  if (!editor) {
    return children ? <>{children}</> : null;
  }

  return (
    <section
      className={cn(
        'space-y-2 rounded-lg border border-dashed border-muted-foreground/40 bg-background/60 p-4 text-left shadow-sm',
        className,
      )}
      data-editor-id={editor.id}
    >
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{editor.shortName}</p>
        <h2 className="text-lg font-semibold leading-tight">{editor.name}</h2>
        <p className="text-sm text-muted-foreground">{editor.tagline}</p>
      </header>
      <p className="text-sm leading-relaxed text-muted-foreground/90">{editor.summary}</p>
      <div className="space-y-3">
        {editor.hookSummary ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Hook Focus: <span className="font-normal normal-case text-muted-foreground">{editor.hookSummary}</span>
          </p>
        ) : null}
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground/90">
          {(editor.hooks.onSetup ?? []).map(hook => (
            <li key={hook.id}>
              <span className="font-semibold">Setup:</span> {hook.description}
            </li>
          ))}
          {(editor.hooks.onTurnStart ?? []).map(hook => (
            <li key={hook.id}>
              <span className="font-semibold">Turn Start:</span> {hook.description}
            </li>
          ))}
          {(editor.hooks.onPlayCard ?? []).map(hook => (
            <li key={hook.id}>
              <span className="font-semibold">Play Card:</span> {hook.description}
            </li>
          ))}
        </ul>
      </div>
      {children ? <footer className="pt-2 text-xs text-muted-foreground/80">{children}</footer> : null}
    </section>
  );
};

export { PHASE_LABELS as EDITOR_PHASE_LABELS };
