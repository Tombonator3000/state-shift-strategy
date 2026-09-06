# Paranoid Times – forbedringsplan

Oppdatert 2026-09-06. Dette er den aktive planen. Den tidligere planen er bevart i
[arkivet](_archive/roadmap-2025-10-11.md). [PR #800](https://github.com/Tombonator3000/state-shift-strategy/pull/800)
ble merged 2026-09-05 kl. 23:45:53 UTC. [PR #801](https://github.com/Tombonator3000/state-shift-strategy/pull/801)
ble merget 2026-09-06 kl. 00:13:38 UTC etter brukerens merge-instruksjon.
Oppstarts- og katalogrettelsene er merget i [PR #802](https://github.com/Tombonator3000/state-shift-strategy/pull/802)
2026-09-06T00:35:43Z. PR-kontrollene for typer/tester/bygg og Pages-publiseringen består.
Lint/dekning og ekte nettleserreise har fortsatt statusen som er beskrevet nedenfor.

## Aktiv leveranse: tabloidstil og fungerende målvalg/lyd

[PR #806](https://github.com/Tombonator3000/state-shift-strategy/pull/806) er merget
2026-09-06T09:44:21Z og publisert på Pages. Lovable-editoren har samme merge.
T01–T13 er i hovedsak implementert: delt målvelger, pressure-paritet, lazy radio,
rundebundne artikler, avisdesign og kø/arkiv for Breaking/Redacted/komboer.
Full detaljstatus: [todo](design/tabloid-2026-09-06/TABLOID_TODO.md) og
[QA-rapport](qa/tabloid-2026-09-06/README.md).

Live radio og PC-kort→mål→AI→avis→ny tur er prøvd. Kontrollen avdekket feil
rundenummer på avisens kildefilter og for høy PC-kartflate; oppfølgingsrettelser
verifiseres nå sammen med PWA-oppdatering. T14 er ikke ferdig: fysisk mobil,
hørbar avspilling på telefon, 200% zoom og målt FPS gjenstår. Enkeltstående eldre
paranormale effekter er fortsatt utenfor den nye hovedkøen. Theme-1 er tom og
hoppes over; 12 eksisterende spor dekodes korrekt. Lint/dekning har kjent gjeld.

## Mobilredesign — 2026-09-06

Brukeren bekrefter at mobilspillet fungerer, men at layouten er vanskelig å bruke.
Ny mobilflate er merget og publisert i PR #803–805: fast kampstatus,
søkbare ZONE-mål, Map/States/Played, sveipbar hånd og én End turn-knapp. Korttypene
får tydeligere grafikk og handlingsresultatene står igjen over hånden. Hjelp og
opplæring er tilpasset. 175 tester består; typer/bygg består; lint 410/51 uendret.
PR #803 er merget og publisert. ZONE → AI → avis → ny tur er gjennomført i nettleser.
Visuell kontroll fant kortskalering/fanekollisjon; rettelsen er merget og publisert.
PR #804 bekrefter 132×177-kort og grid-faner. Siste rettelse skjuler inaktive
faner helt, slik at kartet får hele området sitt. PR #805 er merget 2026-09-06T03:41:15Z
og Pages-publisering består. Siste visuelle kartkontroll ble blokkert av tidsavbrudd
i nettleserforbindelsen; den er ikke godkjent. Tidligere mobilgeometri er kontrollert
ved 390×844, 360×640, 844×390 og 768×1024. Fysisk telefon/ytelse er fortsatt uverifisert.
[Design og verifikasjon](analysis/mobile-newsroom-2026-09-06/README.md).
Neste praktiske kontroll: én kamp med én hånd på brukerens telefon, inkludert
nettleserens adressefelt/sikre marger og de eksisterende effektenes ytelse.

## Mål og spillopplevelse

Spilleren leder Truth Seekers eller Government. Hver tur brukes opptil tre kort til å
endre Truth, motstanderens IP eller presset i delstater. Redaktører, kombinasjoner,
relikvier og hendelser påvirker utfallet. Avisen forteller hva handlingene faktisk
førte til, før neste tur. Målet er tydelige valg og konsekvenser, med spillets tørre,
paranoide avishumor intakt.

Standardseier: Truth ≥90 gir Truth-seier; Truth ≤10 gir Government-seier. Deretter
kontrolleres 200 IP og 10 delstater. Scenarioenes terskler skal følges der de er satt.
Reglene i `src/game/victoryRules.ts` og `src/constants/truthThresholds.ts` er felles
referanse for denne seiersvurderingen.

## Gjennomført i PR #800

- Rettet feil vinner ved Truth-tersklene og forskjellen mellom 200/300 IP i spill og simulering.
- Sperret kortspill utenfor egen handlingsfase, samtidige spill og turavslutning under kortanimasjon.
- Sikret at avvist spill ikke forbruker kort, og at en gammel animasjon ikke endrer en ny kamp.
- Rettet discard-budsjettet; ett gratis kort, deretter 10/15/20 IP. Kort som ikke kan betales, beholdes.
- Gjort hånden og turknappen tilgjengelig i mobil-layouten, gitt kortene mer plass og egne lesbare handlinger.
- Forklart ZONE-mål, turstatus og fraksjonens seiersmål. Touch sveiper hånden; trykk åpner kortet. Mus kan fortsatt dra.
- Rettet innlasting/validering og hovedkortvisning for HYBRID/TRAP/PERSISTENT.
- Reparert npm-låsefil og TypeScript-feil; fjernet seks ubrukte komponenter og en ubrukt seiersfunksjon.
- Arkivert gammel plan, merket gamle revisjoner og samlet etterprøvbar logg.

Dette er en reparasjonsmilepæl med automatiske kontroller, ikke en ferdig godkjent
visuell versjon. [Gauntlet-rapporten](analysis/gauntlet-2026-09-05/README.md) viser åpne porter.

## Gjennomført i PR #801: kortdetaljer og kontroller

- Kortdetaljer viser full tekst og har navngitt dialog, fokuslås, Escape og tilbakeføring av fokus.
- Discard fra detaljvisningen fungerer også etter tre kortspill; motstanderens tur er fortsatt sperret.
- Vertikal lesing lukker ikke kortet; horisontal sveiping på bildet bytter kort. ZONE-valg lukker dialogen straks.
- Det ekstra svarte laget under kortspill er erstattet av status ved hånden.
- Én installasjonslås (`package-lock.json`), pluss PR-jobber for typecheck/test/bygg og synlig lint-/dekningsgjeld.
- Lokalt: 146 tester består, typecheck og bygg består; lint 438 feil / 51 varsler, dekning exit 1.

[Oppfølgingsrapporten](analysis/gauntlet-2026-09-05-card-flow/README.md) viser tester og begrensninger.
Komponenttestene bekrefter dialogatferd; ekte nettleserreise, mobilgeometri og fps er fortsatt uverifisert.

## Oppfølging: oppstart og kortkatalog

- Umiddelbar oppstartsstatus, varig feil-/treghetsmelding med omlasting og en render-feilgrense.
- Blokkert lokal-/sesjonslagring og feilformede innstillinger stopper ikke de rettede oppstartsbanene.
- Ekspansjoner bruker riktig baseadresse, tidsavgrensede forespørsler og parallelle fillastinger.
- Vite og Bun bruker samme 424 kjernekort; DOM opprettes før preload importerer lagringsavhengige moduler.
- 500 støttede eksterne kort lastes; manglende standardmål for gamle ZONE-kort fylles inn.
- De to Midnight-pakkene med 40 kort er synlig utilgjengelige. Motorstøtte må på plass før aktivering;
  korttekst og effekter slettes ikke for å få dem gjennom valideringen.
- 168 tester / 0 feil; typer, normalbygg og GitHub Pages-bygg består. Lint 410 feil / 51 varsler;
  dekning fortsatt exit 1. Mobilzoom er tillatt igjen, men faktisk nettleseratferd er uverifisert.

[Oppstartsrapport og logger](analysis/gauntlet-2026-09-06-startup/README.md).

## Prioritert videre arbeid

| Prioritet | Avgrenset oppgave | Ferdig når | Avhengighet |
|---|---|---|---|
| P0 – neste | Kjør ekte spillerreise på desktop og mobil | Start begge fraksjoner, spill MEDIA/ATTACK/ZONE, kast etter tre spill, avslutt tur, les avis, la AI svare, lagre/last, nå seier/tap og start på nytt. Dokumenter med uredigerte skjermbilder. | Nettleser som kan åpne bygget |
| P0 | Godkjenn responsiv layout og innganger | 390×844, 768×1024 og 1440×900: kort/End Turn nås, ingen sideveis sidescroll eller overlapping; tastatur, dialogfokus og touch fungerer; 200 % zoom og redusert bevegelse prøves. | Samme bygg som spillerreisen |
| P1 | Fullfør katalog- og artikkelkontroll | 424 kjernekort og fire eksterne kildefiler er nå testet. Gjenstår: statiske artikler, bildekoblinger, full effektdekning og bevarte spesialkort som i dag normaliseres. | Bevar dagens kilde/generert-forhold |
| P1 | Implementer Midnight-kortenes regler | Alle 40 kort har faktiske, testede betingede/avledede effekter, likt i live og simulering. Fjern utilgjengelig-status først da. | Dagens karantene og bevarte kortdefinisjoner |
| P1 | Sammenlign live-spill og simuleringsmotor | Samme deterministiske sekvens gir samme IP, Truth, eierskap, agenda og avis. Prioriter HYBRID-pris, TRAP-tidspunkt og PERSISTENT-varighet. | Katalogfixture og små adaptersammenligninger |
| P1 | Rydd lint-gjeld og inaktive tester | Reduser dagens lint- og dekningsfeil i avgrensede moduler uten å slå av reglene. Hver av de 63 `.disabled`-testene får beslutning: aktiver med reell verdi, erstatt eller slett med begrunnelse. | Baseline og faktisk importgraf |
| P1 | Følg opp PR-kontroller i CI | Ny `Game checks`-workflow kjører ren npm-installering, app-typecheck, Bun-tester og bygg. Lint og dekning rapporteres separat og feiler ærlig. Første GitHub-kjøring er bekreftet; reduser lint-/dekningsgjelden. | GitHub Actions-kjøringen i oppfølgings-PR-en |
| P2 | Mål og forbedre lasting/ytelse | Lastingen er tidsavgrenset og har status. Profilér initialt innhold og ~104 MiB Pages-precache før reduksjon; dokumenter kald/varm/offline lasting, kvotefeil og service-worker-oppdatering. | Ekte produksjonsbygg og valgt målenhet |
| P2 | 60 fps under representativ spilling | Etter oppvarming: ca. to minutter med kart, kort, effekter og aviser. Registrer enhet, oppløsning, snitt, p95/p99 og lange stopp. Foreløpige mål: p95 ≤16,67 ms, p99 <20 ms med oppgitt måleusikkerhet. | Samme visuelle innstillinger som godkjennes |
| P2 | Fullfør grafisk konsistens | Samme teksthierarki, fraksjonsfarger, korttyper og fokusmarkering i samling, nye kort, detaljvisning og mobil. Faktiske korttekster er redigerbar UI. | Skjermbilder og brukerreise |
| P3 | Verifiser nettspill separat | To faktiske klienter, synkronisert tur/eierskap, gjenoppretting og frakobling. Ingen påstand om ferdig nettspill før dette er demonstrert. | Egen avgrenset nettspilltest |
| P3 | Utvid fortellingen etter stabilisering | Statiske artikler følger faktisk spilte kort; tilbakevendende figurer og redaktører har konsistent stemme og fremdrift. Nye varianter dekker påviste hull. | Full katalogdekning og humormalen |

## Arbeidsregel for hver oppgave

Definer → inspiser baseline → implementer → kjør → vurder → rett → lagre checkpoint.
En test på en isolert hjelper beviser ikke hele spillerreisen. En konsepttegning
beviser ikke fungerende grafikk. Bruk PASS, FAIL og UNVERIFIED; før videre ideer hit,
og logg endrede filer og faktisk verifisering i `log.md`.
