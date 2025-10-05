# Repository-wide Agent Guidelines

This guidance applies to the entire repository. If any directory later introduces its own `AGENTS.md`, those nested instructions take precedence for their scope. At present, no subdirectories provide additional rules.

## Technology stack
- Vite-powered React application written in TypeScript with Tailwind CSS and shadcn/ui components.
- State management and data fetching rely on React Query and standard React patterns.
- See [`docs/TECHNICAL_README.md`](docs/TECHNICAL_README.md) for detailed architecture and engineering conventions.

## Mandatory checks before sending changes
- `npm run lint`
- `bun test --coverage --coverage-reporter=text`

## Tooling notes
- `scripts/generate-extension-index.mjs` runs automatically via the `predev` and `prebuild` npm lifecycle hooks.

## Update log expectations
- Whenever a change that affects the game is merged, append a new entry to `UPDATES_LOG.md` at the repository root.
- Each entry must start with the merge date in `YYYY-MM-DD` format followed by a short, human-readable summary of the change.
- Keep the log sorted in descending chronological order so the most recent updates appear first.

