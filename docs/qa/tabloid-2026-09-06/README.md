# Tabloid implementation — 2026-09-06

Base: `c38743e7f13c2d27e7ad6401825d3492686f092d`. Live publication and browser verification will be recorded below after merge.

## Source and music diagnosis

Lovable project `fa2f38e2-5939-4c65-a945-2c0f8029da84` reports the same latest commit as `Tombonator3000/state-shift-strategy` main. Lovable edit history and `src/lib/assets.ts` agree. This verifies editor synchronization; it does not imply that both production hosts already serve the same deployment.

Before the change, Pages served `index-Z69T14oE.js`; the live Lovable browser loaded `index-Bd9Ye6x4.js`. The old root-relative `/muzak/Theme-2.mp3` is HTTP 404 on Pages. The correctly based `/state-shift-strategy/muzak/Theme-2.mp3` returns HTTP 206 and MP3 data. Lovable public requests returned 403 to the command-line client but the real browser opened the game, so those responses are not proof of missing assets.

`Theme-1.mp3` contains only two CR/LF bytes. The inspected historical revisions have the same empty blob; no intact version was recovered. The file remains preserved and is excluded from the playable catalog. The existing Theme-2 is the menu fallback. Twelve other tracks pass ffprobe metadata/duration inspection (see audio-audit.json). This is not a claim of listening to all tracks on a physical phone.

## Implemented

- One lazy radio with base-aware URLs, gesture start/retry, actual playback status, pause persistence, stale-promise protection, recording selection, volumes and background resume. Direct track transitions currently replace the old crossfade path.
- One searchable target dialog for ZONE and pressure-bearing HYBRID cards, with map/keyboard entry, cost/pressure preview, owned-state rejection and confirmation. Both live paths, AI target generation and simulator use the same target rules. Editor pressure is applied once, before capture.
- The visible round front page now composes a deterministic connected story from that round's actual card records. Empty/one/two/three-card editions and rival responses are supported. Source cards and actual outcomes are shown separately from the humorous story. Existing article banks and legacy adapters remain available.
- Paper/ink/red mastheads, revised menu/card details, bottom hand on desktop, responsive article columns, original card art and CSS press stamps. A failed artwork request gets a visible PHOTO WITHHELD panel.
- Breaking, Redacted and combo clips share one dismissible queue and archive. Results come from resolved plays/combo rewards; visuals do not award anything. Captures appear in play receipts. Some legacy paranormal events still have their own visual layers; this change does not claim a complete replacement of every cosmetic event.
- Startup precache reduced from 508 entries / 106111.61 KiB to 43 entries / approximately 6284 KiB. Original art/music files remain in the repository. Images use a bounded runtime cache; music is loaded on demand. Offline access to every unused media asset is no longer promised.

## Verification before publication

| Check | Result |
| --- | --- |
| App typecheck | PASS |
| Production root build | PASS; existing large-chunk warning remains |
| Production Pages build | PASS; 43 precache entries |
| Active Bun tests | 198 pass, 0 fail, 769 assertions, 47 files |
| Coverage | 66.62% functions / 73.79% lines; configured threshold still FAILS |
| Lint | 409 errors / 42 warnings; existing debt, down from 410 / 51 |
| Diff whitespace | PASS |
| Local browser | Blocked by cloud browser ERR_BLOCKED_BY_CLIENT for loopback; no bypass attempted |
| Physical phone, audible output, FPS, 200% zoom | Not yet verified |

Tests cover invalid/owned/aliased state targets, insufficient funds, cancellation, double confirmation, direct and animated pressure/capture parity, HYBRID simulator parity, audio failure and race conditions, coherent current-round newspaper composition, and queued/persisted dispatch presentation.

Evidence logs are gzip then base64 text; decode with Python base64.b64decode and gzip.decompress. Tests are green; the overall coverage/lint gates remain failures and have not been suppressed. Browser-only checks below must be distinguished from physical-device QA.

## First publication and live findings

PR #806 merged at 2026-09-06T09:44:21Z as `3f5fda27618f6053b3dfbae1f5eaf9dd6bce7fe9`.
The App types/tests/build job passed; the known-debt job failed as expected. Pages
workflow 34025489085 passed. Pages serves `index-Vi_1rV4F.js`. Lovable editor reports
the same merge; deployment 6821bfc1-3cc7-4739-a876-b434e792ab4a was requested.

Real Pages browser: Theme 2 reports On air, Pause persists into faction selection,
Play resumes and selecting Truth 2 reports On air. PC pressure target search for Texas
previews 0 → 1 pressure and IP 5 → 1; confirmation charges once. AI completes three
plays and Continue returns to the next playable turn. All twelve valid MP3 files
fully decode with ffmpeg -xerror; see audio-decode.json. Audible physical output is
still not claimed.

The same live review found three regressions/legacy faults requiring correction:
1. The engine advances round before opening its paper; passing that counter directly
   filtered out the just-completed cards. Use completedRoundNumber at the live caller;
   a real-hook integration test now enforces this producer/consumer contract.
2. A width-based 795px SVG overflowed the shorter desktop board. Give the map its full
   panel height and move played cards into an independently scrolling side column.
3. Auto-activated service workers left no waiting worker, so Update Now returned without
   reloading. Reload immediately if already active, otherwise wait for activation with
   a bounded fallback. The responsive QA page also needs exclusion from SPA navigation
   fallback, otherwise revisiting it gets the app's 404 instead of the QA HTML.

These are recorded findings, not waived gates. Follow-up source and final live results
will be documented after the corrective deployment.

Follow-up local gates: 201 tests pass / 0 fail / 778 assertions / 48 files; typecheck and Pages build pass. Lint remains 409 errors / 42 warnings; coverage thresholds still fail. Added tests reproduce the completed-round integration and PWA activation race.
