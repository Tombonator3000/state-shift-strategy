import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import type { EditorId } from './EditorsEngine';
import { resolveActiveEditor } from './EditorsEngine';

export interface EditorsUIProps extends PropsWithChildren {
  readonly editorId?: EditorId | null;
  readonly fallbackId?: EditorId | null;
  readonly className?: string;
}

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
          {(editor.hooks.onSetup ?? []).map((hook) => (
            <li key={hook.id}>
              <span className="font-semibold">Setup:</span> {hook.description}
            </li>
          ))}
          {(editor.hooks.onTurnStart ?? []).map((hook) => (
            <li key={hook.id}>
              <span className="font-semibold">Turn Start:</span> {hook.description}
            </li>
          ))}
          {(editor.hooks.onPlayCard ?? []).map((hook) => (
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
