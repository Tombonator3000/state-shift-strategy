# Gauntlet-oppfølging: kortdetaljer og tydelige handlinger

Arbeidet startet 2026-09-05 fra `d7e1267b1f7c9b5f517a100f9dbcef9635e8ba10`.
Mens oppfølgingen pågikk, ble PR #800 merged på GitHub kl. 23:45:53 UTC.
Denne oppfølgingen er flyttet til `fix/card-inspector-flow-2026-09-05` fra
`main` / `512d25211d0a18a4bd38b9a435af5d4207b4ec6d`. De to utgangstrærne er identiske;
ingen nye main-endringer ble overskrevet. Oppfølgingen skal leveres som egen draft-PR.

## Problem og endring

Etter tre kortspill kunne spilleren fortsatt kaste kort fra hånden, men samme
handling var feilaktig låst i detaljvinduet. Detaljvinduet brukte dessuten et manuelt
dialoglag uten Escape eller fokusstyring. Den faste kortrammen klippet lang tekst,
og sveiping ned kunne lukke vinduet under lesing på mobil.

- `CardDetailOverlay` bruker nå eksisterende Radix-dialog med navn, beskrivelse,
  fokuslås, Escape og tilbakeføring av fokus til åpneren.
- Kortets illustrasjon og komplette effekt-/flavortekst vises separat. Innholdet
  kan rulles; handlingsfeltet har store knapper og en egen status. Begge temaer støttes.
- Discard følger sin egen lås, uavhengig av grensen på tre kortspill eller kortprisen.
  Motstanderens tur og pågående handlinger sperrer fortsatt discard.
- Vertikal bevegelse brukes til lesing; horisontal sveiping på illustrasjonen bytter
  kort. ZONE-valg lukker dialogen med én gang før målvalget på kartet.
- Det ekstra heldekkende svarte «Deploying asset»-laget er erstattet av en liten
  status ved hånden. Den eksisterende spillanimasjonen håndteres fortsatt av spillsiden.
- Den ekstra `bun.lock` er fjernet. Det dokumenterte npm-oppsettet, npm-låsefilen og
  Pages-workflowen var allerede installasjonsgrunnlaget; to låsefiler fikk
  installasjonsverktøyet til å stoppe med «Conflicting packageManager and lockfiles».
  Installasjon etter fjerningen fullførte med 1 015 pakker. Ingen pakkeversjoner er endret.
- `Game checks` er lagt til for PR-er: app-typecheck, Bun-tester og bygg, pluss separat
  lint/dekning. Begge gjeldsporter samles før jobben feiler; `bash` med `pipefail`
  sikrer at loggføring gjennom `tee` ikke skjuler feilkoden. Loggene kan lastes ned.
- Teknisk oversikt viser nå de faktiske Truth-grensene 90/10.

Spillbeaten er **Investigate → Escalate**: les hva kortet gjør, velg handling og få
tydelig respons. Eksisterende kortdata, artikler, regler og illustrasjoner er beholdt.
Dette er en UI-/flytoppfølging; ingen ny lore eller mekanikk er innført.

## Verifisering

Miljø: Node 24.19.0, npm 11.9.0 og Bun 1.4.2. Bun kjøres via npm exec i arbeidsmiljøet.
Siste lokale kontroll ble registrert 2026-09-06T00:00:12Z.

| Port | Resultat | Status |
|---|---|---|
| App-typecheck | `npm run typecheck`, exit 0 | PASS |
| Aktive tester | 146 pass, 0 fail, 552 assertions i 37 filer, exit 0 | PASS |
| Nye flyttester | 8 pass: begge temaer, fokus/Tab/Escape, discard-låser, IP, touch og ZONE | PASS i happy-dom |
| Produksjonsbygg | `npm run build`, exit 0 | PASS |
| Lint | 438 feil / 51 varsler; før 439 / 51, exit 1. Ingen funn i de endrede TSX-filene | FAIL – eksisterende gjeld |
| Dekningskommando | 146 pass / 0 fail, men exit 1 som tidligere | FAIL – krav beholdt |
| Ekte desktop-/mobilreise, zoom og visuell layout | Preview-server startet, nettleseren avviste navigasjon | UNVERIFIED |
| 60 fps / faktisk lastetid | Ikke målt | UNVERIFIED |
| GitHub Actions | Workflow-konfigurasjonen er lagt til og YAML-parset; lokal ekvivalent er kjørt | Remote-kjøring må kontrolleres etter publisering |

Dekning av importerte filer: 59,02 % funksjoner og 67,40 % linjer. Disse gjennomsnittene
erstatter ikke filkravene. Testoppsettet logger fortsatt localStorage-/katalogfallback
under preload; full ekspansjons-/artikkeldekning er fortsatt åpen i veikartet.

Bygget: hoved-JS 4 749,81 kB / gzip 990,85 kB, CSS 339,33 kB / gzip 55,10 kB.
PWA-precache: 508 oppføringer / 106 141,59 KiB. Dette beviser ikke raskere lasting.
Den store offline-cachen gjenstår som en egen ytelsesoppgave.

Nettleseren returnerte `net::ERR_BLOCKED_BY_CLIENT` mot korrekt preview-adresse,
selv om serverstatus var running. Det ble ikke forsøkt omveier. Fanen og serveren
ble lukket etter forsøket. Ingen runtime-skjermbilder eller fysisk touch-test er utført.
Den tidligere meldingen «Cache exceeded» i Work-samtalen er ikke reprodusert eller
reparert av disse spillendringene.

Evidens: [resultater](evidence/results.json), [typecheck](evidence/typecheck.log),
[bygg](evidence/build.log), [testsammendrag](evidence/tests-summary.log),
[fulle tester](evidence/tests.log.gz), [dekning](evidence/tests-coverage.log.gz),
[lint](evidence/lint.log.gz), [testet kildeinnhold](evidence/tested-source-sha256.json).
Komprimerte logger er uavkortede og kan leses med `gzip -dc fil.log.gz`.

## Neste port

Kjør den ekte spillerreisen i [veikartet](../../roadmap.md), særlig kort → ZONE-mål,
discard etter tre spill, artikkelvisning og fokus ved lukking, på 390×844,
768×1024 og 1440×900, deretter 200 % zoom og redusert bevegelse. Happy-dom bekrefter
komponentatferd, men måler ikke CSS-geometri eller fysisk touch.

CI-oppsett bygger på de offisielle instruksjonene for
[setup-node](https://github.com/actions/setup-node) og
[setup-bun](https://github.com/oven-sh/setup-bun).
