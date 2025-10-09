# ParaPedia Delivery Tasks

Denne oppgaven bryter faseplanen ned i konkrete oppgaver som kan loggføres i issue-tracking.

## Fase 1 – Datafundament
- [ ] Opprett `src/data/parapedia/paranormalAtlas.ts` som definere typer som `ParapediaEntry`, `ParapediaStateSummary`, og eksporterer atlasdatastrukturen.
- [ ] Hent cryptidoppføringer fra `public/extensions/CRYPTIDS_EXPANSION_README.md`, UFO-statistikk fra Vetted-bloggen, og supplerende spøkelses-/konspirasjonsnotater fra Wikipedia; normaliser navn, state-koder og regionfelt.
- [ ] Dokumenter alle referanser i datasettet, inkludert URL-felt per kilde og tydelig kildebeskrivelse i kommentarer/JSDoc.
- [ ] Eksporter hjelpefunksjoner for kategorilister, referanseoppslag og tidslinje-tabeller slik at UI kan gjenbruke den samme logikken.
- [ ] Noter i filkommentar hvordan datasetet kan regenereres/oppdateres ved fremtidige refreshes.

## Fase 2 – Tilgangslag og søk
- [ ] Opprett `src/hooks/useParapediaEntries.ts` som importerer atlaset og eksponerer hooks/selectors for kategorilister, fritekstsøk, statefiltrering og statistikker.
- [ ] Implementer hjelpehooks som `useParapediaCategories()`, `useParapediaStatePayload(stateId)` og søkefunksjon som matcher navn, tags og hendelser.
- [ ] Legg til memoisering og derivert mapping for landingdata (featured sitater, trending kategorier) og detaljvisning (tidslinje, referanser).
- [ ] Skriv enhetstester i `src/hooks/__tests__/useParapediaEntries.test.ts` som dekker filtrering, kategorisummer og state-oppslag.

## Fase 3 – Premium ParaPedia-panel
- [ ] Flytt eksisterende logikk til modulært komponenttre i `src/components/game/parapedia/`, med egne komponenter for landing, state-detaljer og navigasjon.
- [ ] Bruk shadcn/ui, dossier-stiler og accent-gradients for et premium uttrykk; hent data via `useParapediaEntries`.
- [ ] Håndter tomtilstander og fallback-formattering, inkludert `Intl`-avhengigheter.
- [ ] Oppdater `components.json` med nye komponentoppføringer.
- [ ] Legg til snapshot-/render-tester i `src/components/game/parapedia/__tests__/` for landing og state-detalj.

## Fase 4 – Interaktivt USA-kart
- [ ] Opprett `src/components/game/parapedia/ParapediaAtlasMap.tsx` (eller tilpass `PlayerHubMapView.tsx`) koblet til ParaPedia-datasetet.
- [ ] Implementer hoverstates, fokuserbare path-elementer og tastaturnavigasjon (pil, home/end) for tilgjengelighet.
- [ ] Lag tooltips i Truth-paletten med nøkkelstatistikk og kjente hendelser.
- [ ] Eksponer `onStateFocus` og `onStateSelect` callbacks for å trigge detaljvisning.
- [ ] Skriv tester eller storybook-scenarier for keyboard-navigasjon og interaksjon.

## Fase 5 – Integrasjon i PlayerHub
- [ ] Oppdater `ParapediaPanel` til å bruke `useParapediaEntries` og den nye kartkomponenten, og administrer valgt kategori/state.
- [ ] La både landing-fliser og kartet bruke samme navigasjonslogikk for å bytte mellom oversikt og detalj.
- [ ] Utvid `PlayerHubOverlay.tsx` (eller relevant container) med props/state slik at ParaPedia-tabben synkroniserer med hubben.
- [ ] Sørg for aria-attributter og fokusfeller i overlayen for tilgjengelighet.
- [ ] Tilpass analytics/logging hvis ParaPedia-nav er instrumentert.

## Fase 6 – Dokumentasjon og vedlikehold
- [ ] Lag `docs/parapedia-dataset-guide.md` som dokumenterer kilder, transformasjonsprosess og regenereringssteg.
- [ ] Oppdater `UPDATES_LOG.md` med ny post når funksjonen lanseres.
- [ ] Verifiser at `components.json` reflekterer de nye UI-elementene.
- [ ] Kjør `npm run lint` og `bun test --coverage --coverage-reporter=text` før PR leveres.

