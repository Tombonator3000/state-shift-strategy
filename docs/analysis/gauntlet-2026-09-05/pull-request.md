# Draft PR proposal

Title: Repair victory rules, turn flow and responsive hand; record Gauntlet findings
Base: main
Head: fix/gauntlet-flow-2026-09-05
Draft: true

The game could award the human faction a Truth victory at either threshold, accept
conflicting card/turn actions, hide the hand on mobile, and discard unaffordable
cards. The simulation also used a different economic victory threshold.

This change shares standard victory rules, protects accepted plays across animation
and restart boundaries, enforces discard budgets, restores the mobile hand, and
improves target instructions and readable controls. It repairs extended-card
validation and app types, removes six confirmed unused components, archives the old
roadmap, and records source-linked Gauntlet evidence.

Validation: clean npm ci, app TypeScript and production build pass. Bun assertions:
138 pass, 0 fail. Mandatory coverage command still exits 1 (also reproduced on
unchanged baseline). Lint: 439 errors / 51 warnings, down from 444 / 53; rules and
coverage thresholds are unchanged.

Open gates: actual desktop/mobile journey, accessibility focus review and 60 fps.
Cloud browser URL policy blocked runtime inspection. The two included PNGs are
provisional concept references, not screenshots. Full-catalog loading and live vs
simulation parity for extended cards remain explicit roadmap items.

See docs/roadmap.md and docs/analysis/gauntlet-2026-09-05/README.md. Keep this PR draft
and unmerged until the open review gates are addressed.
