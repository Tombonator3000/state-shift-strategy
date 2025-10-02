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

