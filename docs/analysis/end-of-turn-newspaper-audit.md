# End-of-Turn Newspaper Audit

## Executive Summary
- The end-of-turn newspaper pulls cosmetic pools (mastheads, ads, subheads, etc.) from `src/data/newspaperData.json` through the cached `loadNewspaperData` helper, giving the UI a conspiratorial tone even when the primary dataset is unavailable thanks to minimal fallbacks.【F:src/components/game/TabloidNewspaperV2.tsx†L347-L384】【F:src/lib/newspaperData.ts†L1-L153】【F:src/data/newspaperData.json†L1-L214】
- Narrative articles and front-page packages depend on the article bank loader, which first looks for runtime JSON assets and then falls back to the bundled `paranoid_times_card_articles_ALL.json` so every card has at least templated coverage.【F:src/engine/news/articleBank.ts†L3-L138】【F:src/engine/newspaper/IssueGenerator.ts†L344-L513】
- The overlay highlights hero plays, combo reports, agenda setbacks, paranormal sightings, and campaign arcs, but several elements still rely on generic copy instead of tightly referencing the actual states, cards, and outcomes of the latest turn.【F:src/components/game/TabloidNewspaperV2.tsx†L720-L959】

## Data & Generation Pipeline
1. **Cosmetic Pools** – `TabloidNewspaperV2` loads mastheads, ads, conspiracy blurbs, and weather strings via `loadNewspaperData`, which fetches `/newspaperData.json`, normalizes nested `pools`, and caches the result. If the request fails it falls back to a minimal, lore-friendly set.【F:src/components/game/TabloidNewspaperV2.tsx†L347-L384】【F:src/lib/newspaperData.ts†L117-L145】
2. **Article Bank** – `loadArticleBank` first fetches runtime JSON (`data/` or `assets/data/`), then falls back to the statically bundled `paranoid_times_card_articles_ALL.json`. Parsed articles are indexed by card id and exposed via `getById` and `hasArticles` methods.【F:src/engine/news/articleBank.ts†L3-L138】
3. **Issue Composition** – `generateIssue` stitches the hero article, player/opposition spreads, combo write-up, and supplemental pools. It prioritizes hero cards with captures or high Truth swings, samples article copy if available, and generates fallback prose when the article bank lacks an entry.【F:src/engine/newspaper/IssueGenerator.ts†L344-L520】
4. **Front Page Rendering** – `FrontPage` reconstructs a mini headline trio by loading the article bank again, composing a seeded headline via `generateMainStory`, and using static subheads from `src/data/newspaperData.json` when no tailored story exists.【F:src/ui/newspaper/FrontPage.tsx†L35-L142】【F:src/engine/news/mainStory.ts†L87-L136】

## Strengths
- **Robust Fallbacks:** Both the cosmetic pool loader and the article bank supply deterministic fallback text, ensuring the tabloid always renders even when network assets fail or new cards lack dedicated prose.【F:src/lib/newspaperData.ts†L117-L145】【F:src/engine/news/articleBank.ts†L87-L138】
- **Dynamic Hero Logic:** Hero selection considers captures, Truth swings, and card metadata, producing sensible marquee stories without manual scripting.【F:src/engine/newspaper/IssueGenerator.ts†L355-L438】
- **Campaign Awareness:** The overlay summarizes campaign arcs, generating taglines, progress bars, and status badges from the event log to keep long-form narratives visible.【F:src/components/game/TabloidNewspaperV2.tsx†L827-L959】
- **Sensory Flourish:** Random masthead glitches, radio static for new sightings, and rotating classified ads keep the presentation lively while matching the paranoid tabloid vibe.【F:src/components/game/TabloidNewspaperV2.tsx†L347-L455】【F:public/newspaperData.json†L3-L158】

## Gaps & Risks
- **Duplicate Article Fetches:** `generateIssue` already loads the article bank, yet `FrontPage` fetches it again, doubling the network work and risking mismatched caches between the overlay and front-page rendering.【F:src/engine/newspaper/IssueGenerator.ts†L344-L513】【F:src/ui/newspaper/FrontPage.tsx†L35-L88】
- **Limited State Referencing:** Generated hero bodies and fallback copy default to faction-generic paragraphs when no event fires, missing opportunities to name the contested state or tie back to the latest capture list.【F:src/components/game/TabloidNewspaperV2.tsx†L720-L755】
- **Sparse Article Metadata:** Many cards rely on fallback article text because the JSON only holds headline/subhead/body blobs; there is no structured metadata for states affected, allied factions, or recurring NPCs, making it harder to weave precise recaps.【F:src/engine/newspaper/IssueGenerator.ts†L320-L341】
- **Static Subheads:** Front-page subheads reuse a tiny static pool tied to card id length instead of leveraging the turn log or combo summaries, so repeated runs can feel recycled.【F:src/ui/newspaper/FrontPage.tsx†L92-L142】
- **Siloed Cosmetic Pools:** `src/data/newspaperData.json` previously diverged from the runtime JSON fetched by the newspaper, leading to different ad and masthead inventories between the overlay and the standalone front page widget.【F:src/ui/newspaper/FrontPage.tsx†L5-L104】

## Improvement Opportunities
1. **Share the Article Bank Instance** – Pass the already-loaded article bank (or its serialized stories) from `generateIssue` into `FrontPage` to eliminate duplicate loads and guarantee consistent copy across views.【F:src/engine/newspaper/IssueGenerator.ts†L344-L520】【F:src/ui/newspaper/FrontPage.tsx†L35-L88】
2. **Enrich Hero Fallbacks** – When no event or article drives the hero story, synthesize paragraphs from captured state names, Truth deltas, and combo tags so the lead still references recent gameplay.【F:src/components/game/TabloidNewspaperV2.tsx†L720-L765】
3. **Expand Article Metadata Schema** – Extend `paranoid_times_card_articles_ALL.json` (and its loader) with optional fields like `statesMentioned`, `recurringCharacter`, or `followUpHooks` to support richer recap sentences and future cross-linking.【F:src/engine/news/articleBank.ts†L68-L133】
4. **Unify Cosmetic Pools** – Move the richer JSON deck into the shared loader so every newspaper surface draws from the same conspiratorial copy.【F:src/lib/newspaperData.ts†L1-L153】【F:src/ui/newspaper/FrontPage.tsx†L1-L209】
5. **Contextual Subheads** – Teach `FrontPage` to derive subheads from combo summaries or agenda pull quotes before falling back to static strings, improving variety between turns.【F:src/ui/newspaper/FrontPage.tsx†L92-L142】【F:src/components/game/TabloidNewspaperV2.tsx†L270-L331】

## Foreslått plan (Suggested Plan)
1. **Samle datakilder** – Konsolider artikkelbank og kosmetiske pooler i ett delt hook/konfig, og la både avisspreaden og front page-widgeten motta ferdig hydrert dataobjekt fra spilltilstanden.【F:src/components/game/TabloidNewspaperV2.tsx†L347-L384】【F:src/engine/news/articleBank.ts†L87-L138】【F:src/ui/newspaper/FrontPage.tsx†L35-L142】
2. **Dynamiske hero-paragrafer** – Implementer en formatter som bygger avsnitt ut fra `capturedStates`, `truthDeltaTotal` og `comboReport`, slik at ledeteksten alltid føles fersk og turn-spesifikk.【F:src/components/game/TabloidNewspaperV2.tsx†L720-L771】【F:src/engine/newspaper/IssueGenerator.ts†L425-L513】
3. **Metadata-utvidelse** – Oppdater `paranoid_times_card_articles_ALL.json` og `cardArticleSchema` med nye felt, og bruk dem til å generere oppfølgingslinjer og teaser-lenker til kampanjearcene.【F:src/engine/news/articleBank.ts†L57-L133】【F:src/components/game/TabloidNewspaperV2.tsx†L827-L959】
4. **Subhead-variator** – Lag en hjelpefunksjon som først sjekker combo-/agenda-data før den velger statisk subhead, og eksporter den for gjenbruk i både tabloid og front page.【F:src/components/game/TabloidNewspaperV2.tsx†L270-L331】【F:src/ui/newspaper/FrontPage.tsx†L92-L142】

## Neste oppgaver (Next Tasks)
1. **Refactor:** Eksponer `issue.generatedStory` (inkl. artikler og artikkelbank-status) via props slik at `FrontPage` kan gjenbruke alt uten ny `loadArticleBank()`-kall.【F:src/engine/newspaper/IssueGenerator.ts†L488-L520】【F:src/ui/newspaper/FrontPage.tsx†L43-L88】
2. **Hero Formatter:** Bygg en `composeHeroFallback()` util som injiserer statlige navn og prosentendringer i fallback-avsnittene, og koble den inn der `fallbackHeroBody` etableres.【F:src/components/game/TabloidNewspaperV2.tsx†L702-L755】
3. **Schema Update:** Utvid `cardArticleSchema` med nye felt og migrer `paranoid_times_card_articles_ALL.json`; dokumenter hvordan skribenter kan fylle ut metadata for fremtidige kort.【F:src/engine/news/articleBank.ts†L57-L133】
4. **Pool Consolidation:** Flytt `public/newspaperData.json` inn i `src/data/` (eller generer det via byggsteg) slik at `loadNewspaperData` og `FrontPage` deler samme kilde.【F:src/lib/newspaperData.ts†L117-L145】【F:src/ui/newspaper/FrontPage.tsx†L35-L142】
5. **Subhead Strategy:** Lag en `deriveFrontPageSubhead()` helper som tar inn combo-/agenda-data og faller tilbake til statiske tekster kun som siste utvei.【F:src/components/game/TabloidNewspaperV2.tsx†L270-L331】【F:src/ui/newspaper/FrontPage.tsx†L92-L142】

## Hvordan brukes `paranoid_times_card_articles_ALL.json`?
- **Fallback-datasett:** Filen pakkes inn i builden og importeres direkte av `loadArticleBank`. Når runtime-JSON ikke er tilgjengelig, sørger denne bunten for at hver kort-ID fortsatt har minst ett artikkelfrø, slik at genererte avisoppslag aldri står uten tekst.【F:src/engine/news/articleBank.ts†L3-L138】
- **Kort → artikkel-oppslag:** Under `generateIssue` slår systemet opp artikkelmetadata per kort-ID for å bygge hero- og sekundæroppslag. Hvis artikkelen finnes i banken, overstyrer den fallback-overskrifter og -brødtekst; ellers brukes de dynamiske nødsakene.【F:src/engine/newspaper/IssueGenerator.ts†L344-L520】
- **Front page-widgeten:** `FrontPage` gjenbruker samme loader for å hente artikkelkroppene som vises i miniversjonen av avisen. Når `IssueGenerator` allerede har prefetchet artikkelbanken, videresendes ferdige artikler og en `articleBankReady`-flagg, slik at widgeten slipper å laste filen på nytt.【F:src/ui/newspaper/FrontPage.tsx†L1-L169】【F:src/engine/newspaper/IssueGenerator.ts†L467-L520】
