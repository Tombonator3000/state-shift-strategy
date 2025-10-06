# Player Hub Tabloidization Blueprint

## Executive Summary
- The Player Hub currently mixes warm faction palettes, modern glassmorphism, and UI kit defaults, which clashes with the "leaked supermarket tabloid" fantasy we reserve for the Truth faction interface.【F:src/components/game/PlayerHubOverlay.tsx†L298-L405】【F:src/styles/playerHub.css†L1-L161】
- Weekly World News energy demands oversized mastheads, halftone ink textures, guttered column layouts, and teaser decks that wink at outlandish conspiracies; today only the Press Archive tab leans into print vernacular while the rest feel like a holo-briefing.【F:src/components/game/PlayerHubOverlay.tsx†L370-L737】
- This blueprint proposes a phased art direction shift: unify the hub around a broadsheet grid, introduce consistent typographic hierarchy (Condensed grotesk headlines + serif body), integrate diegetic marginalia (redacted memos, scribbled notes), and supply asset hooks for animated paper noise.

## Design North Stars
1. **Front Page Everywhere** – Every tab should feel like a different spread of the Paranoid Times Weekly: a hero banner, kicker, dek, and inset sidebars even when showing card lists.【F:src/components/game/PlayerHubOverlay.tsx†L298-L424】
2. **Rotogravure Patina** – Replace glass blur and neon glows with overprint halftones, ink bleeds, and off-white stock reminiscent of conspiracy rags stacked beside grocery checkout aisles.【F:src/styles/playerHub.css†L9-L134】
3. **Conspirator Marginalia** – Layer sticky notes, clipped telegrams, and typewritten annotations that frame each dataset as a leaked dossier rather than a tidy dashboard.【F:src/components/game/PlayerHubOverlay.tsx†L430-L689】
4. **Faction as Columnists** – Truth vs. Government styling should manifest as rival column treatments (Truth = sensational crimson headlines; Government = cold bureaucratic blue/green columns) while sharing the same print grid.【F:src/components/game/PlayerHubOverlay.tsx†L307-L405】

## Current-State Audit
| Surface | Present Style | Newspaper Gap |
| --- | --- | --- |
| Hub shell & tab bar | Frosted glass gradients, uppercase microcopy, modern tab toggles.【F:src/components/game/PlayerHubOverlay.tsx†L304-L395】 | Needs broadsheet masthead strip with edition metadata, weather bug, and price slug instead of pill toggles. |
| Achievements | Card grid with neon badges and trophy icon emphasis.【F:src/components/game/PlayerHubOverlay.tsx†L422-L424】 | Should become a "Centerfold of Glory" with oversized headline, ribboned pull quotes, and columnized achievements. |
| Agendas | Stacked cards with blur backgrounds and Tailwind badges.【F:src/components/game/PlayerHubOverlay.tsx†L426-L689】 | Needs dossier layout: stamped envelopes, briefing paragraphs in two-column flow, status timeline styled like classified cables. |
| Card collection | Library icon + neutral panel; uses default card components.【F:src/components/game/PlayerHubOverlay.tsx†L691-L705】 | Convert into "Back-Page Trading Cards" with perforated edges, print registration marks, and binder hole margin. |
| Tutorials | Shadow Academy hero card with gradient panels.【F:src/components/game/PlayerHubOverlay.tsx†L698-L705】 | Recast as "Correspondence Course"—typewritten lessons, faux postcards, tear-off coupons. |
| Press archive | Already leans tabloid but still shares glass panel shell.【F:src/components/game/PlayerHubOverlay.tsx†L707-L714】 | Wrap it inside a newsstand shelf with stacked editions and gutter copy for navigation. |
| Evidence & Intel | Present as clean list views over glass background.【F:src/components/game/PlayerHubOverlay.tsx†L715-L734】 | Should resemble investigative corkboard printed supplements: fold-out US map, clipped articles, margin notes.【F:src/styles/playerHub.css†L49-L131】 |

## Proposed Newspaper Treatments
### 1. Hub Shell & Navigation
- Swap TabsList for a faux masthead ribbon: use a multi-column flex grid with column dividers, edition date, and fictional barcode.【F:src/components/game/PlayerHubOverlay.tsx†L304-L395】
- Introduce top-left box with "Paranoid Times Weekly" logo, volume/issue metadata, and price ("₮3.50 or one classified lead").
- Replace glass backgrounds with textured paper base and halftone overlays (SVG noise + CSS blend modes) to evoke mass-printed stock.【F:src/styles/playerHub.css†L32-L116】

### 2. Typography & Iconography
- Headline tier: Condensed grotesk uppercase with slight misalignment; subheads in italic serif; body copy in a legible news serif (e.g., Fraunces or Newsreader). Update Tailwind config with font tokens and letterpress-like tracking.
- Replace lucide icons in tab triggers with custom woodcut-style pictograms or stamp seals; keep accessible text but lean into diegetic badges.【F:src/components/game/PlayerHubOverlay.tsx†L312-L395】

### 3. Content Panels by Tab
- **Achievements:** Lay out achievements as two-column article listing with mugshot frames, kicker lines like "COLUMN: HEROES OF THE WEEK." Add decorative award ribbons overlapping the columns.【F:src/components/game/PlayerHubOverlay.tsx†L422-L424】
- **Agendas:** Render current agenda as front-page lead: kicker ("TOP SECRET AGENDA"), banner headline, deck paragraph, then timeline presented as teletyped bulletins with timestamp badges mimicking newsroom stamps.【F:src/components/game/PlayerHubOverlay.tsx†L430-L689】
- **Card Collection:** Group cards by "Collector's Insert" sections with perforated edges. Use background repeating dots and color registration marks in corners to mimic print sheets.【F:src/components/game/PlayerHubOverlay.tsx†L691-L705】
- **Tutorials:** Present lessons as serialized correspondence course with typewriter font, tear-off coupon UI for starting sequences, and envelope stickers for progress.【F:src/components/game/PlayerHubOverlay.tsx†L698-L705】
- **Press Archive:** Frame issue thumbnails inside a 3D newsstand shelf with date placards; add flip animation resembling page turns when opening editions.【F:src/components/game/PlayerHubOverlay.tsx†L707-L714】
- **Evidence & Intel:** Wrap map and intel boards with printed map fold lines, margin coordinates, and scribbled conspirator notes referencing each state's anomaly.【F:src/components/game/PlayerHubOverlay.tsx†L715-L734】【F:src/styles/playerHub.css†L49-L131】

### 4. Ambient Effects
- Subtle animated paper flutter shader: low-frequency brightness oscillation + noise offset to simulate flickering fluorescent lights in a newsroom.
- Ambient audio hook (optional) for page rustle when switching tabs.
- Add "late edition" badge that pulses when new intel arrives, using CSS keyframes that mimic ink misregistration.

## Asset & Content Needs
- **Typography:** Commission or license two display faces (Condensed grotesk + news serif) and create Tailwind utilities.
- **Textures:** Generate tiling halftone PNG/SVGs, paper folds, and registration mark sprites.
- **Iconography:** Design faction-specific column header stamps and section bugs.
- **Copy:** Draft kicker/dek templates for each tab to inject Paranoid Times voice (e.g., "ALIEN UNION CALLS FOR CARD REPRINTS"). Consult `'Humor Template – Paranoid Times.md'` for tone alignment.

## Implementation Plan
1. **Foundation Sprint (Week 1)**
   - Build shared "BroadsheetLayout" component wrapping the hub shell with masthead, column grid, and paper textures.【F:src/components/game/PlayerHubOverlay.tsx†L298-L405】
   - Update global styles with newspaper font tokens, halftone utilities, and remove existing glassmorphism classes in `playerHub.css` once replacement assets land.【F:src/styles/playerHub.css†L32-L161】
2. **Tab Conversions (Weeks 2–3)**
   - Convert Achievements, Agendas, and Card Collection tabs onto the broadsheet grid with new decorative assets.【F:src/components/game/PlayerHubOverlay.tsx†L422-L705】
   - Provide component hooks for injecting kicker/dek copy so narrative team can localize quickly.
3. **Investigative Spread Pass (Week 4)**
   - Redesign Evidence and Intel tabs around corkboard-meets-print supplements, integrating map overlays and margin annotations.【F:src/components/game/PlayerHubOverlay.tsx†L707-L734】【F:src/styles/playerHub.css†L49-L131】
   - Add ambient effects (page rustle audio, ink flicker) gated behind reduced-motion preferences.
4. **Polish & QA (Week 5)**
   - Audit accessibility (contrast, focus states) after texture changes.
   - Capture golden path video for localization and QA sign-off; ensure screens still adapt to small widths with stacked columns.

## Task Backlog
1. **Design** – Produce masthead, column grid, and tab bug mockups referencing Weekly World News covers.
2. **Design** – Deliver halftone + paper texture asset kit (tiling at 1024px) with usage notes.
3. **Design** – Draft kicker/dek copy library per tab (10 variants each) drawing from Paranoid Times lore.
4. **Frontend** – Implement `BroadsheetLayout` shell and swap existing TabsList.
5. **Frontend** – Refactor Achievements tab into article layout with kicker/headline/dek components.
6. **Frontend** – Re-skin Agendas timeline as declassified telegram column with stamped status markers.
7. **Frontend** – Rebuild Card Collection into perforated collector's insert.
8. **Frontend** – Reskin Tutorials as correspondence course envelopes with CTA tear-off.
9. **Frontend** – Wrap Press Archive in newsstand shelf component with flip animations.
10. **Frontend** – Style Evidence/Intel spreads with fold lines, map overlays, and margin scribbles.
11. **Audio** – Prototype page rustle + printing press ambiance triggered on tab change.
12. **QA** – Run regression sweep for responsive breakpoints and colorblind-safe contrast.

## Risks & Mitigations
- **Asset Delivery Lag:** Mitigate by designing halftone/texture placeholders in CSS to unblock dev before final art arrives.
- **Readability in Low Light:** Provide high-contrast variant toggled via settings, maintaining noir palette while preserving print feel.
- **Performance:** Optimize textures (SVG or compressed PNG) and memoize ambient animations to avoid jank on lower-end hardware.

## Success Criteria
- 90% of Player Hub surfaces evoke tabloid print to internal reviewers during usability tests.
- Player focus group reports +20% improvement in "feels like secret tabloid HQ" metric compared to current hub.
- Narrative team can author new kicker/dek copy via config without touching component code.
