# Mobile newsroom redesign — 2026-09-06

The user reports that the mobile game works, but its layout is difficult to use.
This slice replaces the long stack of desktop panels with a mobile battle surface
below 1024 CSS pixels. It preserves the existing game engine, card rules and
newspaper identity. Base: `268be5ac0d9fadaf7578b082e2a3bda2afaa9ec4`.

## Design decisions and references

| Reference | Evidence consulted | Application here |
| --- | --- | --- |
| [Pokémon TCG Pocket battle guide](https://www.pokemontcgpocket.com/tc/howtoplay/battle/) | Official portrait battle screenshot, inspected directly: opponent at top, active board in the middle, hand at bottom; a card-local attack effect. | Persistent opponent/player status, a distinct battlefield, a thumb-reachable hand and restrained feedback near the resulting values. |
| [MARVEL SNAP](https://marvelsnap.com/) | Official overview describes short mobile/PC matches and a 12-card deck. Full starter-guide access was unavailable. | Our inference: prioritize the next actionable choice and make remaining plays visible. We do not copy SNAP's deck size or rules. |
| [Hearthstone](https://hearthstone.blizzard.com/en-us) | Official overview describes its hero/card combat and cross-device availability. No detailed mobile usability study was completed. | A secondary category reference, not evidence that this interface has equivalent usability. |

No third-party card illustrations were copied into the game. Existing art is
preserved; cards without bespoke or expansion art use original lightweight vector
type illustrations in the compact hand. New copy follows the existing newsroom
and dossier vocabulary in the project's humor guide.

## Behavior

- Status stays above the battlefield; the hand and one End turn button remain in
  their own lower areas. Portrait uses a horizontal hand; short landscape puts it
  beside the board. Safe-area insets and dynamic viewport height are respected.
- Map / States / Played tabs reduce competing panels. The map stays mounted when
  another tab opens, preserving its zoom. State rows show owner, defense and IP.
- Selecting a ZONE card opens searchable targets automatically. Own states are
  unavailable; Cancel exits targeting. The existing action guards and target
  callback still control deployment.
- Compact cards show cost, type, title and effect, plus selected/discard/affordability
  status. The shared inspector retains full rules, articles and discard actions,
  including discard after the three-play limit.
- Latest play remains above the hand. Truth/IP changes have short transitions;
  no new particle loop is added. New CSS motion respects reduced-motion settings.
- Objectives and contextual help share a briefing sheet. Settings, archive,
  fullscreen and card lab are in a separate menu. Help no longer covers End turn.
- Map ownership colors match the You/Rival legend for either faction; contested
  states retain their amber indication. Tutorial text no longer claims red always
  means the player, and the tutorial fits narrow screens.

This improves presentation of Investigate → Resolve; it introduces no new game
mechanics or narrative/card bank changes.

## Verification

Six new interaction tests exercise the real hand inspector, ZONE targeting,
owned-state rejection, discard after the play limit, opposing-turn locks,
state inspection, turn end, history and briefing/menu behavior.

Typecheck and both Vite builds pass. The final Pages build and typecheck cover
the final code. All 174 tests pass (649 assertions, 42 files). Lint remains
410 errors / 51 warnings, matching the base. Coverage is 65.02% functions /
71.92% lines and exits 1 against unchanged thresholds. Logs are compressed in
`evidence/check-logs.tar.gz`; results and tested source hashes are alongside it.

The local browser cannot connect to the local preview server in this environment.
The published baseline was inspected at 1363 × 936; this was a desktop view, not
a mobile test. A small unlinked `qa/mobile-preview.html` page provides a real game
iframe at selectable viewport sizes for repeatable visual inspection after Pages
deployment. It changes iframe dimensions only, not browser identity or game state.
It does not emulate device performance, mobile browser chrome or touch hardware.

New viewport inspection is pending publication; this checkpoint does not mark
mobile geometry, animation performance or browser travel as passed.

Physical-device performance, offline behavior and the separate ChatGPT Work
"cache exceeded" issue are not verified by this slice. Existing large bundle and
precache warnings remain. Gameplay rules and static card/article banks are intact.

## Follow-up

The central backlog is [docs/roadmap.md](../../roadmap.md). Next useful product
checks are one-handed play on the user's phone, safe areas with browser chrome,
and performance with the existing effects enabled. Avoid claiming 60 fps without
measurement.
