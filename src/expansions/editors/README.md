# Editors mini-expansion scaffolding

This folder seeds the *Paranoid Times* "Editors" expansion with strongly typed
configuration and light-weight utilities. The data is stored in
[`editors.json`](./editors.json) and is typed through [`EditorsTypes.ts`](./EditorsTypes.ts)
so future patches can safely extend the roster without guessing at field names.

## Activating the mini-draft

The mini-draft UI is intentionally dormant until the experience is ready. The
feature flag is exported from [`EditorsEngine.ts`](./EditorsEngine.ts) as
`FEATURE_EDITORS_MINIDRAFT` and is also surfaced through the shared
`featureFlags` module. To experiment locally:

1. Flip `FEATURE_EDITORS_MINIDRAFT` to `true` in `EditorsEngine.ts`, **or**
2. Override the runtime flag by setting `window.shadowgovFeatureFlags.editorsMiniDraft = true`
   in the browser console, **or**
3. Store `shadowgov:flag:editorsMiniDraft` as the string `"true"` in
   `localStorage`.

Once active, [`EditorsDraft.tsx`](./EditorsDraft.tsx) renders a visible banner
and becomes the integration point for the drafting workflow. When the flag is
`false`, the component renders a friendly placeholder and accepts an optional
custom placeholder via props for embedding contexts.

## Hook responsibilities

`EditorsEngine` exposes three helper applicators that wrap the JSON-defined
hooks:

- `applyOnSetup` – run setup hooks exactly once as part of the initial game
  bootstrap.
- `applyOnTurnStart` – fire at the beginning of the active editor's turn and
  handle recurring upkeep.
- `applyOnPlayCard` – execute reactions that respond immediately to specific
  card plays.

Each helper resolves the targeted editor (from an `EditorId` or pre-fetched
`EditorDefinition`), iterates the relevant hook list, and forwards the typed
payload to a callback supplied by the caller. Anchor comments sit directly above
the exports so later patches can inject additional logic near the applicators.

The utility `isFloridaHot` is provided to safely check incoming hotspot data
without assuming a specific shape. This is useful for the Florida Bureau's
hooks, which rely on confirming that the Sunshine State is actively burning
before upgrading their tabloid plays.
