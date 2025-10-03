import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EDITORS_EXPANSION_ID, isEditorsFeatureEnabled } from '@/data/expansions/features';

export { EDITORS_EXPANSION_ID } from '@/data/expansions/features';

import type { EditorDef, EditorId } from './EditorsTypes';
import {
  describeEditorEffect,
  getEditors,
  resolveActiveEditor,
  type EditorEffectKind,
} from './EditorsEngine';

export interface EditorsUIProps extends PropsWithChildren {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
  readonly className?: string;
}

const STORAGE_KEY = 'shadowgov:editors:last-selection';

const EFFECT_TITLES: Record<EditorEffectKind, string> = {
  bonus: 'Bonus',
  penalty: 'Tradeoff',
};

const EFFECT_BADGES: Record<EditorEffectKind, string> = {
  bonus: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40',
  penalty: 'bg-rose-500/10 text-rose-600 border-rose-500/40',
};

const rememberSelection = (editor: EditorDef | null) => {
  if (!editor || typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, editor.id);
  } catch (error) {
    console.warn('[Editors] Failed to persist selection', error);
  }
};

const getStoredSelection = (): EditorId | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ?? null;
  } catch (error) {
    console.warn('[Editors] Failed to read stored selection', error);
    return null;
  }
};

interface ChooseEditorOptions {
  readonly defaultId?: EditorId | null;
  readonly allowSkip?: boolean;
}

interface EditorsChooseModalProps {
  readonly editors: readonly EditorDef[];
  readonly initialSelection?: EditorId | null;
  readonly onConfirm: (editor: EditorDef | null) => void;
  readonly onSkip?: () => void;
  readonly allowSkip: boolean;
}

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

const renderEffectList = (editor: EditorDef, kind: EditorEffectKind): string[] => {
  const effect = kind === 'bonus' ? editor.bonus : editor.penalty;
  const described = describeEditorEffect(effect);
  if (described.length > 0) {
    return described;
  }
  if (kind === 'bonus') {
    return ['No bonus'];
  }
  return ['No tradeoff'];
};

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

  return (
    <Dialog open>
      <DialogContent
        className="max-w-3xl gap-0 border border-foreground/20 bg-background/95 p-0 shadow-xl"
        onPointerDownOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => event.preventDefault()}
      >
        <DialogHeader className="space-y-1 border-b border-border bg-muted/40 px-6 py-4 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Assign a Desk Editor</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose an editor to adjust your newsroom before the presses roll.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 px-6 pb-6 pt-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ScrollArea className="h-[340px] rounded border border-border/40 bg-background/70">
            <div className="grid gap-3 p-4">
              {editors.map(editor => {
                const isSelected = selectedId === editor.id;
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight">{editor.name}</h3>
                        {editor.flavor ? (
                          <p className="text-sm italic text-muted-foreground">{editor.flavor}</p>
                        ) : null}
                      </div>
                      <Badge className="border border-foreground/40 bg-muted/40 text-xs font-semibold uppercase tracking-wide">
                        Editors
                      </Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(['bonus', 'penalty'] as const).map(kind => (
                        <div
                          key={kind}
                          className={cn(
                            'rounded border p-3 text-sm',
                            EFFECT_BADGES[kind],
                          )}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide">{EFFECT_TITLES[kind]}</p>
                          <ul className="mt-2 space-y-1 text-xs">
                            {renderEffectList(editor, kind).map((line, index) => (
                              <li key={`${kind}-${index}`}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
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
                  {selectedEditor.flavor ? (
                    <p className="text-sm italic text-muted-foreground">{selectedEditor.flavor}</p>
                  ) : null}
                </div>
                <div className="space-y-3">
                  {(['bonus', 'penalty'] as const).map(kind => (
                    <div key={kind}>
                      <p
                        className={cn(
                          'text-xs font-semibold uppercase tracking-wide',
                          kind === 'bonus' ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {EFFECT_TITLES[kind]}
                      </p>
                      <ul
                        className={cn(
                          'mt-1 space-y-1 text-xs',
                          kind === 'bonus' ? 'text-emerald-700' : 'text-rose-700',
                        )}
                      >
                        {renderEffectList(selectedEditor, kind).map((line, index) => (
                          <li key={`${kind}-detail-${index}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select an editor to preview their impact.
              </div>
            )}
            <div className="mt-auto flex flex-col gap-3">
              <Button className="w-full" disabled={!selectedEditor} onClick={() => onConfirm(selectedEditor ?? null)}>
                {selectedEditor ? `Start with ${selectedEditor.name}` : 'Select an Editor'}
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
  const { defaultId, allowSkip = true } = options;
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  const availableEditors = getEditors();
  if (availableEditors.length === 0) {
    return Promise.resolve(null);
  }

  const storedSelection = getStoredSelection();
  const initialSelection = (defaultId ?? storedSelection) &&
    availableEditors.some(editor => editor.id === (defaultId ?? storedSelection))
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
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Editor</p>
        <h2 className="text-lg font-semibold leading-tight">{editor.name}</h2>
        {editor.flavor ? <p className="text-sm italic text-muted-foreground">{editor.flavor}</p> : null}
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {(['bonus', 'penalty'] as const).map(kind => (
          <div
            key={kind}
            className={cn(
              'rounded border p-3 text-sm',
              kind === 'bonus'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-700',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide">{EFFECT_TITLES[kind]}</p>
            <ul className="mt-2 space-y-1 text-xs">
              {renderEffectList(editor, kind).map((line, index) => (
                <li key={`${kind}-hud-${index}`}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {children ? <footer className="pt-2 text-xs text-muted-foreground/80">{children}</footer> : null}
    </section>
  );
};
