# Paranoid Times — State Shift Strategy

Et satirisk kortstrategispill der Truth Seekers og Government kjemper om nyhetsbildet,
Influence Points og amerikanske delstater. React-grensesnittet er en spillbar avis:
velg kort, se konsekvensene på kartet, gå i trykken og les motstanderens svar.
Spillets eksisterende engelske kort- og avistekst er beholdt.

- [Aktiv forbedringsplan](docs/roadmap.md)
- [Gauntlet: funn, tester og åpne porter](docs/analysis/gauntlet-2026-09-05/README.md)
- [Oppfølging: kortdetaljer, discard og PR-kontroller](docs/analysis/gauntlet-2026-09-05-card-flow/README.md)
- [Oppfølging: oppstart, lagring og ekte kortkatalog](docs/analysis/gauntlet-2026-09-06-startup/README.md)
- [Spilldesign](DESIGN_DOC_MVP.md), [teknisk oversikt](docs/TECHNICAL_README.md)
- [Arbeidslogg](log.md), [endringshistorikk](UPDATES_LOG.md)

## Kjør lokalt

Testmiljø for denne reparasjonen: Node 24.19.0, npm-låst installasjon og Bun 1.4.2.
Bun brukes til tester; `package-lock.json` er eneste installasjonsgrunnlag.
Den ekstra `bun.lock` er fjernet slik at verktøy ikke velger mellom to installasjonslåser.

```sh
git clone https://github.com/Tombonator3000/state-shift-strategy.git
cd state-shift-strategy
npm ci
npm run dev
```

Åpne adressen Vite skriver ut. For produksjonsbygg: `npm run build`, deretter
`npm run preview`. `predev` og `prebuild` oppdaterer ekspansjonsindeksen automatisk.

```sh
npm run typecheck
bun test --coverage --coverage-reporter=text
npm run build
npm run lint
npm run lint:exports
```

`typecheck` peker på `tsconfig.app.json`. Et bart `tsc --noEmit` bruker en tom
solution-konfigurasjon og er ikke bevis på at appen er typekontrollert. Eksportanalysen
er en kandidatrapport, ikke automatisk tillatelse til å slette filer. Lint har kjent
gjeld; se Gauntlet-rapporten for målt baseline og gjenværende feil.

PR-er kjører `Game checks`: app-typecheck, aktive tester og produksjonsbygg i én jobb,
lint og dekning i en separat jobb. Sistnevnte viser kjent gjeld som feil og lagrer
begge loggene som artefakt; ingen lint-regler eller dekningskrav er slått av.

Kortkatalogen importeres likt i Vite og Bun. Nye aktive filer i `src/data/core/`
må registreres i `CORE_CARD_SOURCES` i `src/data/core/index.ts`; katalogtesten
oppdager manglende registrering. De to Midnight-pakkene vises som utilgjengelige
inntil motoren støtter alle effektene deres. Kildene er bevart.

## Redigering og publisering

Kildeprosjektet er også knyttet til [Lovable](https://lovable.dev/projects/fa2f38e2-5939-4c65-a945-2c0f8029da84).
Den eksisterende GitHub Pages-workflowen bygger og publiserer ved push til `main`.
Arbeid på en egen gren og gjennomgå PR før merge. PR #800 og #801 er merget;
se arbeidsloggen for senere rettelser og dokumentert publiseringsstatus.
Lovable-taggeren er valgfri: `ENABLE_LOVABLE_TAGGER=true npm run dev`.

## Card art assets

Custom artwork for cards should be stored in `public/card-art/` with filenames that match the card ID. The game first looks for a
`<cardId>.jpg` image and then for `<cardId>.png`. If neither file is present the UI will automatically fall back to the existing
placeholder illustrations.

## Unified AI configuration & debugging

The new unified AI stack uses the enhanced strategist pipeline that powers both the in-game agent and automated tests.

- Instantiate the AI with `AIFactory.createStrategist(difficulty)`. This returns an enhanced strategist wired to the latest `AI_PRESETS` for `easy`, `medium`, `hard`, and `insane` modes. For lower-level experiments you can also call `createAiStrategist` directly from `@/data/aiStrategy` to obtain the normalized baseline heuristics.
- Turn planning flows through `chooseTurnActions` in `@/ai/enhancedController`. Pass the live game state and strategist to receive a ranked list of card plays plus short-form `sequenceDetails` suitable for logging.
- Strategy logging defaults to concise one-line summaries. Set the `featureFlags.aiVerboseStrategyLog` flag (see `@/state/featureFlags`) to include the full adaptive context, synergy notes, and evaluation breakdowns in the game log when debugging complex situations.
- The planning scenario at `src/ai/__tests__/unifiedAiPlanning.test.ts.disabled` is currently disabled. It is not evidence that all difficulties are covered by the active test run; restore a deterministic real-engine test before making that claim.
