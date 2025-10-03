import type { FC, ReactNode } from 'react';

import { FEATURE_EDITORS_MINIDRAFT } from './EditorsEngine';

export interface EditorsDraftProps {
  readonly placeholder?: ReactNode;
}

export const EditorsDraft: FC<EditorsDraftProps> = ({ placeholder }) => {
  if (FEATURE_EDITORS_MINIDRAFT) {
    return (
      <div className="rounded-md border border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-primary" data-editor-draft-state="enabled">
        Editors mini-draft mode is active. Hook up the real drafting flow here.
      </div>
    );
  }

  if (placeholder) {
    return <>{placeholder}</>;
  }

  return (
    <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/10 p-4 text-sm text-muted-foreground" data-editor-draft-state="disabled">
      Editors mini-draft tools are currently disabled. Flip <code>FEATURE_EDITORS_MINIDRAFT</code> when the experience is ready.
    </div>
  );
};

export default EditorsDraft;
