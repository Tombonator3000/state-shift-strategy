# Repository-wide Agent Guidelines

This guidance applies to the entire repository. If any directory later introduces its own `AGENTS.md`, those nested instructions take precedence for their scope. At present, no subdirectories provide additional rules.

## Storytone, humor, and world-lore integration
- The project leans on the "Paranoid Times" alternate-history vibe. When you create narrative assets (copy, quests, cards, etc.), weave in conspiratorial whimsy rather than slapstick. Think "shadowy cabal memos" and "smirking time-travel dossiers."
- Pepper in sly humor, but keep it diegetic—jokes should feel like they belong to the universe's paranoid insiders.
- Reference the living world lore document (`'Humor Template  – Paranoid Times.md'`) before writing new flavor text so tone stays consistent.
- When inventing new factions, artifacts, or historical twists, leave breadcrumbs for future expansions (e.g., mention rumors, redacted files).

## Copy and template usage
- Reuse established narrative/copy templates stored in `/docs` and the repository root before drafting new structures. Only diverge when the story demands it, and document why in commit messages or PR notes.
- Keep new templates in `/docs/templates`. If you need a fresh template, include a README snippet describing when to use it.
- Maintain a catalog entry in `components.json` whenever a new UI element is introduced so designers can track available building blocks.

## Content quality checklist
- Card or quest content should answer: "What paranoia lever does this pull?" Capture that in a one-line intent note inside the file or PR.
- Cross-check against `paranoid_times_card_articles_ALL.json` to avoid duplicating core plot points.
- Verify entries reference at least one piece of in-universe technology, rumor, or organization to keep the lore web dense.

## Suggested backlog tasks
1. Draft a "World Lore Quickstart" page summarizing the top five conspiracies every new writer must know.
2. Build a reusable card narrative template that highlights "Setup → Twist → Redacted Footnote."
3. Add automated lint rules that flag non-diegetic humor keywords (e.g., "banana peel") to maintain tone.
4. Create a style guide for naming temporal anomalies, including examples and banned clichés.
5. Prototype a script that cross-links lore references between cards and design docs for easier continuity checks.

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

