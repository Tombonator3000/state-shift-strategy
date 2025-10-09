import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EDITORS_EXPANSION_ID, isEditorsFeatureEnabled } from '@/data/expansions/features';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';
import { portraitUrl } from '@/game/editorImages';

export { EDITORS_EXPANSION_ID } from '@/data/expansions/features';

import type { EditorDef, EditorId } from './EditorsTypes';
import {
  describeEditorEffect,
  getEditorEffectByKind,
  getEditors,
  resolveActiveEditor,
  type EditorEffectKind,
} from './EditorsEngine';

export interface EditorsUIProps extends PropsWithChildren {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
  readonly className?: string;
}

const STORAGE_KEY = 'paranoid-times:desk-editor';

const EFFECT_TITLES: Record<EditorEffectKind, string> = {
  bonus: 'Bonus',
  tradeoff: 'Tradeoff',
  modifier: 'Modifier',
};

const rememberSelection = (editor: EditorDef | null) => {
  if (!editor) {
    return;
  }
  safeSetLocalStorageItem(STORAGE_KEY, editor.id);
};

const getStoredSelection = (): EditorId | null => {
  const raw = safeGetLocalStorageItem(STORAGE_KEY);
  return raw ?? null;
};

interface EditorPortraitProps {
  readonly editor: EditorDef;
  readonly className?: string;
  readonly loading?: 'lazy' | 'eager';
}

const EditorPortrait = ({ editor, className, loading = 'lazy' }: EditorPortraitProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-sm border-2 border-[#b0904a] bg-[#f9eccc]/80 shadow-sm',
      className,
    )}
  >
    <img
      src={portraitUrl(editor.id, editor.portrait)}
      alt={`${editor.name} portrait`}
      loading={loading}
      className="h-full w-full object-cover"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 border border-black/5 mix-blend-multiply"
    />
  </div>
);

interface ChooseEditorOptions {
  readonly defaultId?: EditorId | null;
  readonly allowSkip?: boolean;
  readonly faction?: 'government' | 'truth';
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
  const effect = getEditorEffectByKind(editor, kind);
  const described = describeEditorEffect(effect);
  if (described.length > 0) {
    return described;
  }
  if (kind === 'bonus') {
    return ['No bonus'];
  }
  if (kind === 'tradeoff') {
    return ['No tradeoff'];
  }
  return ['No modifier'];
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
        className="max-w-4xl gap-0 border border-[#b89b5f]/40 bg-[#f9f4e4] p-0 shadow-2xl"
        onPointerDownOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => event.preventDefault()}
      >
        <DialogHeader className="space-y-1 border-b border-[#b89b5f]/40 bg-[#f1e7ce] px-6 py-4 text-left shadow">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-[#4d3b1e]">
            Assign a Desk Editor
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6b5430]">
            Choose an editor dossier to brief your newsroom before the presses roll.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 px-6 pb-6 pt-4 md:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          <ScrollArea className="h-[360px] rounded border border-[#c9ad70]/50 bg-[#fff9e9]/70 shadow-inner">
            <div className="grid gap-4 p-4">
              {editors.map(editor => {
                const isSelected = selectedId === editor.id;
                return (
                  <button
                    key={editor.id}
                    type="button"
                    onClick={() => setSelectedId(editor.id)}
                    className={cn(
                      'relative grid gap-4 rounded-md border-2 bg-[#fdf6dc] p-4 text-left transition',
                      'hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d5021]/60',
                      "before:absolute before:-top-3 before:left-3 before:h-6 before:w-32 before:rounded-t before:bg-[#f2dfb0] before:shadow",
                      "after:absolute after:-top-[10px] after:left-5 after:h-5 after:w-24 after:rounded-t after:bg-[#e6cfa0] after:shadow-sm after:content-['']",
                      isSelected
                        ? 'border-[#6d5021] shadow-[0_18px_35px_-20px_rgba(77,59,30,0.85)]'
                        : 'border-[#d7bf84] hover:border-[#a58545]',
                    )}
                    data-editor-id={editor.id}
                    data-state={isSelected ? 'selected' : 'idle'}
                  >
                    <div className="flex items-start justify-between gap-3 text-[#4d3b1e]">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight uppercase tracking-wide">
                          {editor.name}
                        </h3>
                        {editor.quote ? (
                          <p className="text-sm italic text-[#6b5430]">{editor.quote}</p>
                        ) : null}
                      </div>
                      <Badge className="border border-[#ad9155]/60 bg-[#f2dfb0]/70 text-xs font-semibold uppercase tracking-wide text-[#4d3b1e]">
                        Case File
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row">
                      <EditorPortrait editor={editor} className="h-32 w-28 shrink-0" />
                      <div className="flex-1 space-y-3">
                        {(['bonus', 'tradeoff', 'modifier'] as const).map(kind => (
                          <div
                            key={kind}
                            className={cn(
                              'rounded border border-dashed bg-white/80 p-3 text-sm shadow-sm',
                              kind === 'bonus'
                                ? 'border-[#7b9e59]/60 text-[#2f4f1f]'
                                : kind === 'tradeoff'
                                  ? 'border-[#b15555]/60 text-[#5a1d1d]'
                                  : 'border-[#5b6d85]/60 text-[#2c3d52]',
                            )}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4d3b1e]">
                              {EFFECT_TITLES[kind]}
                            </p>
                            <ul className="mt-2 space-y-1 text-xs">
                              {renderEffectList(editor, kind).map((line, index) => (
                                <li key={`${kind}-${index}`}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="relative flex h-full flex-col gap-4 rounded border-2 border-[#b89b5f]/70 bg-[#fffaf0]/90 p-5 shadow-inner">
            <div className="pointer-events-none absolute -top-3 right-6 h-6 w-32 rounded-t bg-[#f1e0b7] shadow" />
            {selectedEditor ? (
              <div className="space-y-4 text-[#4d3b1e]" data-editor-preview="selected">
                <div className="flex flex-col gap-1 border-b border-dashed border-[#bfa36b] pb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7a6236]">
                    Selected Case File
                  </p>
                  <h4 className="text-xl font-semibold leading-tight uppercase tracking-wide">{selectedEditor.name}</h4>
                  {selectedEditor.quote ? (
                    <p className="text-sm italic text-[#6b5430]">{selectedEditor.quote}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-4 md:flex-row">
                  <EditorPortrait editor={selectedEditor} className="h-36 w-32 shrink-0" loading="eager" />
                  <div className="flex-1 space-y-4">
                    {(['bonus', 'tradeoff', 'modifier'] as const).map(kind => (
                      <div key={kind} className="rounded border border-[#c9ad70]/70 bg-white/90 p-4 shadow">
                        <p
                          className={cn(
                            'text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4d3b1e]',
                            kind === 'bonus' ? 'text-[#2f4f1f]' : 'text-[#5a1d1d]',
                          )}
                        >
                          {EFFECT_TITLES[kind]}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs">
                          {renderEffectList(selectedEditor, kind).map((line, index) => (
                            <li key={`${kind}-detail-${index}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select an editor to preview their impact.
              </div>
            )}
            <div className="mt-auto flex flex-col gap-3">
              <Button
                className="w-full bg-[#4d3b1e] text-[#f9f4e4] hover:bg-[#3d2f16]"
                disabled={!selectedEditor}
                onClick={() => onConfirm(selectedEditor ?? null)}
              >
                {selectedEditor ? `Start with ${selectedEditor.name}` : 'Select an Editor'}
              </Button>
              {allowSkip ? (
                <Button
                  variant="ghost"
                  className="w-full border border-dashed border-[#b89b5f]/70 bg-[#f4e8c9] text-[#4d3b1e] hover:bg-[#eddcb8]"
                  onClick={() => (onSkip ? onSkip() : onConfirm(null))}
                >
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
  const { defaultId, allowSkip = true, faction } = options;
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  const availableEditors = getEditors().filter(editor => (faction ? editor.faction === faction : true));
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
        {editor.quote ? <p className="text-sm italic text-muted-foreground">{editor.quote}</p> : null}
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {(['bonus', 'tradeoff', 'modifier'] as const).map(kind => (
          <div
            key={kind}
            className={cn(
              'rounded border p-3 text-sm',
              kind === 'bonus'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
                : kind === 'tradeoff'
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-700'
                  : 'border-slate-500/40 bg-slate-500/10 text-slate-700',
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
