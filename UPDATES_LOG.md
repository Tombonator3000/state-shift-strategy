# Updates Log

This document provides a chronological record of gameplay-impacting changes merged into State Shift Strategy. Each entry should include the merge date and a brief, human-readable summary so future contributors can quickly understand how the game has evolved.

## 2025-10-07 – Chronicle agenda signals in hub
- Route the live agenda moment feed into the Player Hub overlay and surface a chronological timeline of stages and outcomes.
- Add status filters, timeline styling, and empty-state messaging to help players review agenda advances, setbacks, and completions at a glance.

## 2025-10-06 – Surface agenda history in player hub
- Add an agendas tab to the Player Hub that highlights the current secret agenda when enabled.
- Surface completed agendas with descriptions, issue themes, and difficulty badges for quick review.

## 2025-10-06 – Newsroom discard tooltip
- Replace the Newsroom Desk IP label with a discard counter that surfaces queued cards and IP impact via tooltip.
- Move the discard cost breakdown into the tooltip and leave the footer with the free-first-discard reminder when the queue is empty.

## 2025-10-06 – Delay final editions until news pools load
- Load news article pools on app startup to prevent empty or stale final editions when the archives are still initializing.
- Skip composing the final newspaper until pool data is ready and clear the preview to avoid stale spreads during loading.

## 2025-10-05 – Surface extra bulletins in final editions
- Retire the in-play Extra Extra strip so the primary board regains vertical space during matches.
- Feed archived bulletin articles into the final edition builder and render them in the victory newspaper spread with fallback copy.

## 2025-10-05 – Rebuild Paranoid Times article bank
- Replace the templated article dump with bespoke Truth and Government stories for every card across core sets and expansions.
- Switch article metadata to the `faction` field and normalise legacy values inside the loader so the UI matches card factions.
- Add a scripted generator to keep the article JSON in sync with card data and populate tags plus image prompts.

## 2025-10-05 – Lower IP victory threshold to 200
- Drop the economic victory target from 300 IP to 200 across rules, tutorial copy, and in-game HUD messaging.
- Update the IP victory condition logic, onboarding flows, and documentation so both factions now race to 200 IP.

## 2025-10-05 – Launch Extra Feed and final overlay refresh
- Replace the legacy victory screen with a final edition overlay that pairs the campaign recap with a live-generated newspaper spread.
- Surface turn-driven Extra Extra bulletins beside the main board using full `ArticleBlock` data instead of strings.
- Persist structured extra feed entries across engines and saves so weather, ads, and bullet lists render consistently.

## 2025-10-05 – Sync victory overlays with final editions
- Persist MVP win checks into the game state so victory screens know the winner and trigger type automatically.
- Build final newspaper reports through the shared helper and surface them via the victory overlay and extra edition reader.

## 2025-10-05 – Summarize turn headlines and extras
- Record per-turn highlights for both MVP engine and the main hook so news systems can consume consistent `PlayedLite` buffers.
- Generate turn headline summaries and trigger Extra Extra bulletins after three plays to populate `headlineLog` and `extraExtraFeed`.

## 2025-10-05 – Expand game state tracking buffers
- Add headline, extra edition, and turn buffer placeholders to both MVP and main game state models so upcoming newspaper flows
  can read consistent structures.
- Ensure clones, reducers, and initializers keep the new arrays in sync and persist them through saves.

## 2025-10-05 – Unify newspaper data pools
- Move the public newspaper dataset to the new root location and expose shared pool loading helpers so newspaper generators can read the expanded copy deck consistently.

## 2025-10-05 – Guard difficulty storage access
- Use the safe localStorage helpers for difficulty reads and writes so blocked storage falls back to the NORMAL difficulty without crashing callers.

## 2025-10-05 – Harden options storage reads
- Use the safe localStorage helper when loading saved options so the game falls back to defaults when storage is unavailable.

## 2025-10-05 – Harden tutorial progress storage
- Ensure the tutorial manager uses safe localStorage helpers so blocked storage falls back to in-memory defaults without breaking onboarding.
- Wrap tutorial reset logic in guards so clearing progress never crashes when storage access fails.

## 2025-10-05 – Harden onboarding storage writes
- Use the safe localStorage setter for onboarding completion and skip flags so the tutorial still dismisses when storage access is blocked and logs a warning when persistence fails.

## 2025-10-05 – Index onboarding storage safeguards
- Use the safe storage helpers for faction selection, IP tracking, and onboarding checks so the intro flow still works when localStorage is blocked.

## 2025-10-05 – Weather badge storage safety
- Use the safe localStorage helper for the start screen weather badge so blocked storage no longer breaks the intro UI.

## 2025-10-05 – Stabilize discard toggling during menus
- Move the discard hook and related gating logic before intro/menu early returns so switching between intro and menu no longer triggers React hook order errors.

## 2025-10-05 – Harden local storage fallbacks
- Guard settings and faction persistence against blocked storage so new games keep default options without crashing.
- Add helper coverage to verify localStorage failures resolve safely.

## 2025-10-05 – Safeguard AI zone plays without targets
- Prevent the AI from resolving zone cards that lack a valid target state and add regression coverage to keep turns flowing.

## 2025-10-05 – Planned discard feature
- Track the upcoming discard mechanic update so we remember to document its implementation details when the feature ships.
