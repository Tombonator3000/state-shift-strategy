# Card Article Usage Audit

**Intent:** Confirm whether the card article dataset powers in-game newspaper flows or if it has fallen out of use.

## Findings

1. **Article bank loader consumes the master JSON.** `loadArticleBank` first attempts to fetch runtime JSON assets and then falls back to the bundled `paranoid_times_card_articles_ALL.json`, normalising entries into a map for lookup by card id.【F:src/engine/news/articleBank.ts†L6-L169】
2. **Issue generation resolves per-card copy from the bank.** During end-of-turn issue composition the generator calls `loadArticleBank`, looks up each played card via `getById`, and only fabricates prose when no matching article exists, ensuring the dataset is the primary source of headlines, decks, and tone metadata.【F:src/engine/newspaper/IssueGenerator.ts†L661-L826】
3. **Front-page UI reads from the same article bank.** The React front page loads the bank on mount and surfaces stored headlines/subheads for secondary stories whenever entries are present, advertising fallback messaging only when the dataset misses a card.【F:src/ui/newspaper/FrontPage.tsx†L3-L175】
4. **News pools seed additional systems from the JSON.** The newsroom pool initialiser parses `paranoid_times_card_articles_ALL.json` into reusable article blocks that feed combo and triple-story generation, so the dataset influences both scripted and dynamic coverage.【F:src/engine/news/newsPools.ts†L1-L105】

## Gaps & Recommendations

- **Coverage tracking:** Instrument `loadArticleBank` callers to log missing ids so narrative leads can prioritise backfilling unauthored cards.
- **Schema parity:** Align the `newsPools` schema (which expects `tone`) with the richer article bank schema to avoid divergence between runtime story paths.
- **Testing:** Reinstate the disabled article bank tests with fixtures that cover both fetched and fallback scenarios to guard against accidental regressions.
