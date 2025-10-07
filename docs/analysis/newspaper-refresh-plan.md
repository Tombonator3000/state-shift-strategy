# Newspaper Refresh Execution Plan

## Context
The most recent QA pass surfaced three regressions tied to the Paranoid Times front page generator and supporting narrative pools:
- The hero article is duplicated because it is injected into both the hero slot and the dispatch list.
- Extra Extra showdowns grade factions by a single high-value play instead of the combined strength of their three-card runs.
- Legacy "culinary" flavor survives in multiple data pools despite the article database migration.

## Objectives
1. Restore unique hero and dispatch presentations on the front page.
2. Rebalance Extra Extra scoring so the winning trio reflects total strength, including tie handling.
3. Scrub outdated culinary copy from all narrative data sources linked to the new database.

## Workstreams & Tasks
### 1. Front Page Deduplication
- Audit `IssueGenerator` to document how hero metadata flows into `generatedStory.articles`.
- Update the generator to exclude the hero meta from the dispatch list before render.
- Regression-test `TabloidNewspaperV2` to verify the hero column and dispatch stack show unique entries.

### 2. Extra Extra Scoring Fix
- Replace the single-card max comparison with a trio-sum evaluation in `headlineEngine`.
- Update tie-breaking logic so equal sums defer to existing truth-delta safeguards.
- Extend or create unit tests proving only the higher-sum faction claims the bonus article and truth swing.

### 3. Culinary Copy Purge
- Sweep `stateThemedPools`, `agendaIssues`, and relevant `eventDatabase` nodes for culinary references.
- Draft replacement flavor that aligns with the new paranoid article set and note paranoia levers.
- Run a repo-wide `rg "culinary"` to confirm removal, then regenerate any cached narrative assets if required.

## Milestones
1. **Implementation Complete** – Code and data changes merged behind unit coverage.
2. **Narrative QA** – Lore team signs off on new copy; confirm tone matches the current conspiracy arc.
3. **Release Note Ready** – Update `UPDATES_LOG.md` with the deployed fix summary once shipped.

## Risks & Mitigations
- **Regression risk in generator consumers:** Coordinate with UI owners to smoke-test other layouts that rely on the article array.
- **Tone drift in replacement copy:** Reference `'Humor Template  – Paranoid Times.md'` and loop in narrative editors for review.
- **Coverage gaps:** Pair test updates with instrumentation to ensure trio scoring logic is executed during CI runs.

## Ownership & Next Steps
- Assign engineering lead to Workstreams 1 & 2; narrative design lead to Workstream 3.
- Kick off with a design huddle to validate acceptance criteria, then schedule implementation sprint.
- Track progress in the project board under "Newspaper Refresh" with weekly check-ins until all milestones clear.
