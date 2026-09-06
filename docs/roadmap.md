# Paranoid Times – forbedringsplan

Oppdatert 2026-09-06. Dette er den aktive planen. Den tidligere planen er bevart i
[arkivet](_archive/roadmap-2025-10-11.md). [PR #800](https://github.com/Tombonator3000/state-shift-strategy/pull/800)
ble merged 2026-09-05 kl. 23:45:53 UTC. Ny oppfølging ligger på
`fix/card-inspector-flow-2026-09-05` og skal vurderes i egen draft-PR.

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

## Ny oppfølging: kortdetaljer og kontroller

- Kortdetaljer viser full tekst og har navngitt dialog, fokuslås, Escape og tilbakeføring av fokus.
- Discard fra detaljvisningen fungerer også etter tre kortspill; motstanderens tur er fortsatt sperret.
- Vertikal lesing lukker ikke kortet; horisontal sveiping på bildet bytter kort. ZONE-valg lukker dialogen straks.
- Det ekstra svarte laget under kortspill er erstattet av status ved hånden.
- Én installasjonslås (`package-lock.json`), pluss PR-jobber for typecheck/test/bygg og synlig lint-/dekningsgjeld.
- Lokalt: 146 tester består, typecheck og bygg består; lint 438 feil / 51 varsler, dekning exit 1.

[Oppfølgingsrapporten](analysis/gauntlet-2026-09-05-card-flow/README.md) viser tester og begrensninger.
Komponenttestene bekrefter dialogatferd; ekte nettleserreise, mobilgeometri og fps er fortsatt uverifisert.

## Prioritert videre arbeid

| Prioritet | Avgrenset oppgave | Ferdig når | Avhengighet |
|---|---|---|---|
| P0 – neste | Kjør ekte spillerreise på desktop og mobil | Start begge fraksjoner, spill MEDIA/ATTACK/ZONE, kast etter tre spill, avslutt tur, les avis, la AI svare, lagre/last, nå seier/tap og start på nytt. Dokumenter med uredigerte skjermbilder. | Nettleser som kan åpne bygget |
| P0 | Godkjenn responsiv layout og innganger | 390×844, 768×1024 og 1440×900: kort/End Turn nås, ingen sideveis sidescroll eller overlapping; tastatur, dialogfokus og touch fungerer; 200 % zoom og redusert bevegelse prøves. | Samme bygg som spillerreisen |
| P1 | Test ekte kort- og artikkelkatalog | Filbasert testlasting av alle aktive ekspansjoner og statiske artikler; ingen stille sekskorts-fallback i dekningstesten; ID-er, bilder og artikkeloppslag kontrolleres. | Bevar dagens kilde/generert-forhold |
| P1 | Sammenlign live-spill og simuleringsmotor | Samme deterministiske sekvens gir samme IP, Truth, eierskap, agenda og avis. Prioriter HYBRID-pris, TRAP-tidspunkt og PERSISTENT-varighet. | Katalogfixture og små adaptersammenligninger |
| P1 | Rydd lint-gjeld og inaktive tester | Reduser dagens lint- og dekningsfeil i avgrensede moduler uten å slå av reglene. Hver av de 63 `.disabled`-testene får beslutning: aktiver med reell verdi, erstatt eller slett med begrunnelse. | Baseline og faktisk importgraf |
| P1 | Følg opp PR-kontroller i CI | Ny `Game checks`-workflow kjører ren npm-installering, app-typecheck, Bun-tester og bygg. Lint og dekning rapporteres separat og feiler ærlig. Kontroller første remote-kjøring og reduser gjelden. | GitHub Actions-kjøringen i oppfølgings-PR-en |
| P2 | Mål og forbedre lasting/ytelse | Profilér før endring. Reduser initialt innhold og ~104 MiB PWA-precache uten å miste offline-funksjon eller avisarkiv; dokumenter kald/varm lasting. | Ekte produksjonsbygg og valgt målenhet |
| P2 | 60 fps under representativ spilling | Etter oppvarming: ca. to minutter med kart, kort, effekter og aviser. Registrer enhet, oppløsning, snitt, p95/p99 og lange stopp. Foreløpige mål: p95 ≤16,67 ms, p99 <20 ms med oppgitt måleusikkerhet. | Samme visuelle innstillinger som godkjennes |
| P2 | Fullfør grafisk konsistens | Samme teksthierarki, fraksjonsfarger, korttyper og fokusmarkering i samling, nye kort, detaljvisning og mobil. Faktiske korttekster er redigerbar UI. | Skjermbilder og brukerreise |
| P3 | Verifiser nettspill separat | To faktiske klienter, synkronisert tur/eierskap, gjenoppretting og frakobling. Ingen påstand om ferdig nettspill før dette er demonstrert. | Egen avgrenset nettspilltest |
| P3 | Utvid fortellingen etter stabilisering | Statiske artikler følger faktisk spilte kort; tilbakevendende figurer og redaktører har konsistent stemme og fremdrift. Nye varianter dekker påviste hull. | Full katalogdekning og humormalen |

## Arbeidsregel for hver oppgave

Definer → inspiser baseline → implementer → kjør → vurder → rett → lagre checkpoint.
En test på en isolert hjelper beviser ikke hele spillerreisen. En konsepttegning
beviser ikke fungerende grafikk. Bruk PASS, FAIL og UNVERIFIED; før videre ideer hit,
og logg endrede filer og faktisk verifisering i `log.md`.
