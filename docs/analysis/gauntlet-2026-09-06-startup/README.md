# Oppstart, lagring og ekte kortkatalog — 2026-09-06

PR #801 er merget på brukerens instruksjon, kl. 00:13:38 UTC, som
`4e929c063bf7422bfa377b6da2f9318ccc26c43f`. Dette er neste avgrensede rettelse
fra den commiten, på `fix/startup-and-catalog-2026-09-06`.
Status: [PR #802](https://github.com/Tombonator3000/state-shift-strategy/pull/802)
er merget 2026-09-06T00:35:43Z som `30821063777f5bdb15097dff14ea3bf9919d3de9`.
[GitHub Actions](https://github.com/Tombonator3000/state-shift-strategy/actions/runs/34001628048) bekrefter ren installasjon, app-typer, alle 168 tester og bygg
på kildecommit `2ae251048a97486f7fdea835143b2a0aab300ef3`. Lint/dekning feiler som dokumentert.
[GitHub Pages-jobben](https://github.com/Tombonator3000/state-shift-strategy/actions/runs/34001700918) har også fullført bygg og publisering
av merge-commiten. Dette er publiseringsbevis, ikke en visuell spillerreise.

## Påviste feil og rettelser

| Funn | Konsekvens | Rettelse |
|---|---|---|
| `window.localStorage` ble lest før `try` i oppstarten | En kastende lagringsgetter stoppet React-oppstarten | Felles beskyttet lesing; ugyldige UI-innstillinger gir standardinnstillinger |
| Første React-render ventet på ekspansjonene; forespørslene hadde ingen tidsgrense | Tom rot ved venting; ingen varig forklaring | Statisk HTML-status før JavaScript, React-lastestatus, treghetsmelding etter 8 s og feilgrense med omlasting |
| `/extensions/...` ignorerte Pages-base, og `?t=` endret cache-nøkkelen | Feil URL på Pages og manglende samsvar med precache-URL | `getAssetPath`, stabil URL og 6 s grense for hele JSON-responsen; filer hentes parallelt |
| Bun støtter ikke den tidligere Vite-spesifikke katalogglobben | Testene kunne bruke seks nødkort i stedet for faktisk katalog | Eksplisitte kildeimporter, kildeinventartest og kontroll av 424 unike kort |
| Preload brukte statiske imports før DOM-oppsettet | Lagringsavhengige moduler startet før testmiljøet var klart | Dynamiske imports etter DOM/oppsett, med bevarte ekte modulbindinger |
| Ugyldige aktiveringspreferanser ble tolket som lister | Senere `.find`/iterering kunne krasje | Skjemakontroll av lagrede aktiveringsposter og payloads; avbrutte filvelgere avsluttes |
| Gamle ZONE-kort manglet `target` | Ellers støttede kort ble avvist | Standardmålet `{ scope: 'state', count: 1 }` tilføres ved innlesing |
| Reparasjon kunne fjerne uimplementerte effekter, men beholde løftet i kortteksten | Kort kunne aktiveres med feil virkning | Valider før reparasjon; avvis effektene og vis utilgjengelig pakke med begrunnelse |

Ingen seiers-, tur- eller effektregler er implementert på nytt i denne endringen.
Dette støtter **Investigate**: spilleren kommer inn i spillet og får vite hvilke
kort som faktisk kan brukes. Korttekst og eksisterende historiefiler er bevart.

## Faktisk katalog

| Kilde | Spillbare kort etter innlesing | Status |
|---|---:|---|
| Core: 400 base + 20 spesial + 4 comeback | 424 | 212 Truth / 212 Government; 11 aktive kildefiler |
| Cryptids | 300 | Innlest og normalisert |
| Halloween Spooktacular | 200 | Innlest og normalisert |
| Cryptids Midnight Fieldguide | 0 av 20 | Synlig utilgjengelig: uimplementerte effekter |
| Halloween Midnight Dossiers | 0 av 20 | Synlig utilgjengelig: uimplementerte effekter |

De to innebygde pakkene `gov-new` og `truth-new` finnes fortsatt. Tallene 500/40
gjelder de fire eksterne JSON-filene. Dette er katalog-/valideringstester, ikke
bevis på at hvert kjernekorts spesialregel eller hver avisartikkel er riktig.
Midnight-kortenes betingelser og avledede effekter finnes i data/typesystemet,
men de flate MEDIA/ATTACK/ZONE-motorbanene implementerer dem ikke.
Begge ekspansjonspanelene viser årsak og sperrer tomme pakker; aktiveringslaget
filtrerer også ID-ene slik at lagrede valg ikke kan omgå sperren.

## Verifisering

Lokalt/PR-CI: Node 24.19.0, npm 11.9.0, Bun 1.4.2. CI bekrefter ren `npm ci`
med 1015 pakker. Den eksisterende Pages-jobben bygger separat med Node 20.
Bun ble kjørt med `npm exec --yes --package=bun@1.4.2 -- bun ...`.

| Kontroll | Resultat |
|---|---|
| `npm run typecheck` | PASS, exit 0; faktisk app-konfigurasjon |
| `bun test` | PASS, 168 tester / 0 feil, 622 assertions, 41 filer |
| Nye målrettede tester | PASS, 22 tester, 70 assertions i fire filer |
| `npm run build` | PASS, exit 0 |
| `GITHUB_PAGES=true npm run build` | PASS, exit 0; baseadresse og fallback-tekst også inspisert i byggfilene |
| `npm run lint` | FAIL, 410 feil / 51 varsler; før 438 / 51 |
| `bun test --coverage --coverage-reporter=text` | FAIL, exit 1; 168 tester består, totalsammendrag 64,29 % funksjoner / 71,20 % linjer |
| Ekte nettleser, touch, offline, zoom og fps | UNVERIFIED; forrige tillatte preview ble avvist med `ERR_BLOCKED_BY_CLIENT` |

CI viser samme 410 lint-feil / 51 varsler. CI-dekning: 64,68 % funksjoner /
71,44 % linjer, fortsatt exit 1; artefakt `lint-and-coverage-34001628048` er lastet opp.

Lint-/dekningsregler er uendret. `npm run lint` stopper ved ESLint-feilen og kjører
derfor ikke den etterfølgende eksportanalysen. De 63 inaktive testfilene er fortsatt
inaktive. Store bundle-/precache-varsler består: Pages-bygget har 508 oppføringer,
106111,61 KiB precache og ca. 4,75 MB hovedchunk før gzip. Ingen ytelsesgevinst målt.

Det første katalogforsøket feilet to tester: antakelsen om 540 fullt støttede kort
var feil. Kildene viste 500 støttede kort og 40 med uimplementerte regler. Testene
kontrollerer nå eksplisitt avvisning, synlig årsak og at slike kort ikke aktiveres.
En TypeScript-feil i den nye fraksjonslisten ble også funnet og rettet før sluttsjekk.
Begge mellomresultatene er bevart i loggarkivet; de er ikke presentert som bestått.

## Avgrensning og videre arbeid

Den tidligere ChatGPT Work-meldingen «Cache exceeded» er ikke reprodusert eller
bekreftet rettet. Denne endringen retter påviste oppstartsbaner i **spillet**.
En bundlenedlasting som stopper kan fortsatt kreve omlasting; HTML-fallbacken
gir da tekst før React har startet. Ingen lagringsdata eller nettlesercacher slettes.

Neste porter er ekte mobil-/desktop-spillerreise, service-worker/offline- og
kvotetesting, full kort-/artikkelkontroll og implementering av Midnight-effektene
med live-/simuleringsparitet. Alt er ført i [aktiv roadmap](../../roadmap.md).

## Etterprøvbare filer

- [Resultater med kommandoer, starttid og exit-koder](evidence/results.json)
- [Fullstendige kontroll- og mellomresultatlogger](evidence/check-logs.tar.gz)
- [Statisk inspeksjon av Pages-bygg](evidence/built-assets.json)
- [SHA-256 for endrede testede kilder](evidence/tested-source-sha256.json)
- [Endrede filer](changes.md)

Loggarkivet inneholder uavkortede logger. Pakk det ut med
`tar -xzf evidence/check-logs.tar.gz` fra denne rapportmappen. Nettleserskjermbilder
eller uavhengig agentreview inngår ikke; det er ikke gjennomført i denne rettelsen.
