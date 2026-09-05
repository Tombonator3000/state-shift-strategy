# Gauntlet – reparasjon av Paranoid Times

**Levering:** [Draft-PR #800](https://github.com/Tombonator3000/state-shift-strategy/pull/800) er opprettet etter eksplisitt tillatelse til push og draft-PR. Ingen merge. Den tidligere publiseringsblokkeringen nedenfor er historikk.

Dato: 2026-09-05. Baseline: `8241c244e7ef5388dfca68059953cdf2573bba88` på `main`.
Gren: `fix/gauntlet-flow-2026-09-05`. Selv-review utført sekvensielt; ingen uavhengige
agenter eller eksterne spilltestere er brukt. Se [endringsmanifestet](changes.md) for eksakte filer.

**Leveranse:** reparert kildekode, to foreløpige konseptbilder, tester, opprydding og
[prioritert plan](../../roadmap.md). Dette er en reparasjonsmilepæl. Hele spillet,
visuell kvalitet og 60 fps er ikke ferdig godkjent. PR skal forbli unmerged.

## Oversikt og kildegrunnlag

Full Git-historikk ble klonet. Baseline hadde 925 sporede filer, inkludert 526 under
`src` og 274 under `public`. Hele filtræet og importreferanser ble kartlagt; dette betyr
ikke at hver linje i alle JSON-/lyd-/bildefiler er manuelt gjennomgått. AGENTS, CLAUDE,
README, loggene, design, teknisk oversikt, veikart og humormalen ble lest, og aktive
spill-, kort-, kart-, AI- og avisveier fulgt i kildekoden.

- Juli 2026: framer-motion/motion-dom-byggrettelser.
- April 2026: lazy SFX, separate leverandørpakker og Bun-testoppsett (#799).
- Februar 2026: refaktorert endTurn (#798), WebRTC-arbeid (#797), PWA (#796).
- Januar 2026: ekspansjonsvisning (#795).
- 2025: statiske kortartikler, tilbakevendende figurer, redaktører, relikvier og de
  utvidede korttypene er allerede implementert i ulike deler av systemet.

Vedleggene er eldre referanser. De er sammenlignet med repoets nåværende regler,
ikke kopiert over aktive kilder. `05-oversikt-filer.png` var tilgjengelig ved ny kontroll;
det viser et eldre GitHub-filtre og er ikke et skjermbilde av spillet. Motstridende
100/200/300 IP- og Truth-beskrivelser må vurderes mot aktiv kode/design.

Kjerneopplevelse: velg en fraksjon og redaktør, spill opptil tre kort, påvirk IP/Truth/
delstater, velg discard, avslutt tur, les den resulterende avisen og møt AI-svaret.
Historien skal beskrive handlingene spilleren faktisk utførte. Den statiske
artikkelbanken og de etablerte konspirasjonsfigurene er bevart.

## Avgrensning og akseptansekriterier

1. Begge fraksjoner får riktig seier/tap ved Truth 90/10, 200 IP eller 10 delstater;
   prioritetsrekkefølgen er lik i live-visning og simulering.
2. Et kort aksepteres høyst én gang per handling; feil fase, utilstrekkelig IP og
   gammel animasjon etter restart skal ikke forbruke nye kort eller gi falsk suksess.
3. Discard kan velges etter tre spill og kan aldri koste mer enn tilgjengelig IP.
4. Hånd, målvalg og turavslutning skal nås på mobil; desktopkort skal passe i panelet.
   Endringen er implementert, men denne porten trenger ekte nettleserbevis.
5. Ren installasjon, app-typecheck, tester og bygg skal være reproduserbare; kjente
   lint-/dekningsfeil og uverifisert ytelse skal være synlige.

Representasjon: 2D avisgrensesnitt med SVG-kart og eksisterende kortillustrasjoner.
Levering: nettleser/PWA, ingen motorbytte. Kontroll: mus, tastatur og touch. Kontrollstørrelser:
390×844, 768×1024 og 1440×900, pluss 200 % zoom. Enkelspiller og localStorage-lagring
beholdes; PWA/offline og nettspill krever egne ende-til-ende-kontroller. Engelsk spilltekst
beholdes for konsistens; rapport/plan er på norsk. 60 fps er et mål, ingen målt garanti.

## Verktøy og produksjonskjede

Versjoner er kontrollert fra installerte pakker etter `npm ci`.

| Ansvar | Valgt verktøy | Input → output / integrasjon | Tilgjengelighet og grunn |
|---|---|---|---|
| Kilde og historikk | Git | Baseline → egen gren/PR | VERIFIED WORKING; bevarer prosjektet |
| UI | React 18.3.1, TS 5.8.3 | TSX/typer → komponenter | VERIFIED WORKING gjennom app-typecheck/bygg |
| Design | Tailwind 3.4.17, shadcn, eksisterende SVG/raster | Redigerbare komponenter/CSS → avisflate | Bygger; faktisk visning UNVERIFIED |
| Animasjon | framer-motion 12.23.21 | UI-tilstander → presentasjon | Låsefil/bygg verifisert; bildeflyt UNVERIFIED |
| Bygg | Vite 5.4.19, Node 24.19.0 | Kilde + public → dist | VERIFIED WORKING; samme stack |
| Funksjonstester | Bun 1.4.2, happy-dom, Testing Library | Motor- og hook-scenarier → assertions/dekning | VERIFIED WORKING; DOM-simulering er ikke visuell nettlesertest |
| Konsept | Innebygd imagegen | Skriftlig brief → to PNG-referanser | VERIFIED WORKING; ikke runtime-bevis |
| Runtime-inspeksjon | Sites preview / cloud browser | Lokalt bygg → nettleser | Server startet; nettleser UNAVAILABLE pga. URL-policy |

Kanoniske kilder er `src` og kildeinnholdet i repoet; `dist` er generert. Ekspansjons-
indeksen genereres av eksisterende `predev`/`prebuild`. Kortvalidatoren, ny typeetikett
og standardseier er ført gjennom kode → testsuite → produksjonsbygg. Den siste
handoffen til faktisk visuelt inspisert spillerreise er blokkert.

## Funn og Gauntlet-sløyfer

| Funn / alvorlighet | Baseline og konsekvens | Rettelse | Verifisering |
|---|---|---|---|
| Feil Truth-vinner / kritisk | Index valgte menneskets fraksjon ved begge terskler; tap kunne bli seier | Felles evaluator finner fraksjonen som faktisk vant | Begge fraksjoner × begge terskler; engine-paritet |
| Regeldrift / høy | Live 200 IP, motor 300 IP; ulik prioritet | Felles 200-IP/10-state-regler og Truth→IP→states | Grenseverdier, distinkte stater og scenario-terskler |
| Ulovlige/samtidige kortspill / høy | Manglende fase-/turkontroll og tidlig turavslutning | Felles handlingsvindu og in-flight/session-vern | Faktisk useGameState-hook, ingen hook-mock |
| Rask/avbrutt animasjon / høy | Sløyfe 2 avdekket at React kunne utsette updateren; presentasjonen returnerte før kortet var registrert | Beregn akseptert spill én gang før await; finalize bare aksepterte spill i samme kamp | Den først feilede testen passerer; restart og avbrudd prøvd |
| Discard / høy | Knappen låst etter tre spill; ekstra kort fjernet selv uten IP | Separat discard-lås, budsjett både i hook, motor og preview | Gratis/første ekstra/for dyrt; hånd og IP kontrolleres |
| Mobilhånd skjult / høy | `hidden lg:flex` fjernet hånden og turknappen under 1024 px | Én synlig hånd, naturlig vertikal side, horisontal håndscroll | Kode/bygg; faktisk mobilport UNVERIFIED |
| Overlapp/lesbarhet / høy | 176 px-kort i 4/5 kolonner i 380–480 px panel | To passende kolonner, separate bildetekster/priser/discard-knapper | Kode/bygg; skjermbilder mangler |
| Utvidede kort / høy | `.has()` på manglende whitelist kunne kaste ved ekspansjonslasting; hovedkortvisning kalte typene MEDIA | Konfigurasjonsvalidator for HYBRID/TRAP/PERSISTENT, korrekte typeetiketter, komplette teksttabeller | Gyldig/manglende/feilkonfigurert/negativ pris, eksisterende motortester |
| Misvisende seierspanel / middels | Økonomisk seier kalt tie-breaker; Truth-progress uten fraksjonsretning | Faktiske mål, fraksjonsretning, scenarioverdier og native disclosure-knapp | Typecheck/bygg; visuell/fokusreise gjenstår |
| Bygg/typekontroll / høy | npm ci stoppet på framer-motion-lock mismatch; ekte app-tsc feilet | Lås 12.23.21 korrekt; komplette snapshots, metadata, lexicon og testtyper | Ren npm ci, app-tsc og produksjonsbygg |
| Utdatert analyse / middels | Root tsconfig har `files: []`; gammel unused-audit tolket tomt resultat som ingen ubrukt kode | Riktig prosjekt for typecheck/ts-prune; merk historiske rapporter | Faktisk eksportliste bevart; callersjekk før sletting |

Sløyfe 1: baseline → seiers-/tur-/discard-rettelser → 14 målrettede tester passerte.
Sløyfe 2: komplette typer, mobilinnganger, ekspansjoner og opprydding → full suite fant
én avbruddsfeil (137 pass / 1 fail). Sløyfe 3: flyttet resolution foran await → 138
assertion-tester passerer. Coverage-exit ble kontrollert separat på uendret baseline:
samme gate feiler der også. Ingen krav er senket eller lint-regler slått av.

## Visuell retning og sammenligning

[Desktop-konsept](visuals/desktop-concept-v1.png) og [mobilkonsept](visuals/mobile-concept-v1.png)
er laget med innebygd imagegen som foreløpige komposisjonsreferanser, ikke godkjente
runtime-skjermer. Originalpromptene står i [visuals/briefs.md](visuals/briefs.md).

| Referanseegenskap | Implementasjon / begrensning | Neste bevis |
|---|---|---|
| Avismasthead, papir/blekk, fraksjonsfarger | Eksisterende identitet/illustrasjoner bevart; ingen ny rastertekst i produktet | Runtime-skjermbilde |
| Tydelig kart + hånd på desktop | Fast håndpanel med auto-fit-kort og lesbare bildetekster | Sjekk 1440×900 og smal desktop |
| Mobil håndscroll, separate discard-knapper | Touch-drag frikoblet fra sveiping; tap åpner kortet | Fysisk touch-test og kortvalg |
| Ett tydelig ZONE-mål og Cancel | Målstripe + rull til kart etter valg | Opptak av kort → stat → effekt |
| Konsistent lore og korrekte tall | Genererte fiktive kort/tall/geografidetaljer i konseptet avvises som regelkilde; faktiske repo-data beholdes | Katalogtest + faktisk skjerm |

Konseptene ble laget etter den første funksjonelle/layout-reparasjonen og før videre
visuell tilpasning. Dette avviket fra «konsept først» i masterprompten er logget.
Ingen piksel-likhet eller ferdig grafisk kvalitet påstås.

Nettleseren nektet `http://terminal.local:4173/` med `ERR_BLOCKED_BY_CLIENT`, deretter
uttrykkelig Cloud browser URL-policy. Preview-serveren var startet og rapporterte
running. Ingen omvei eller alternativ nettleser ble forsøkt etter policyavslaget.
Serveren ble stoppet etterpå. Ingen runtime-skjermbilder, klikkrunde eller fps-opptak
ble laget. Bruk lokal `npm run dev` for den åpne manuelle porten.

## Opprydding

Slettet etter søk i aktive kilder, scripts og også `.disabled`-tester:

| Fjernet komponent | Aktiv erstatning |
|---|---|
| GameHand.tsx | EnhancedGameHand |
| USAMap.tsx / GameMap.tsx | EnhancedUSAMap |
| StartScreenTabloid.tsx | GameMenu / ui/start/StartScreen |
| EnhancedHUD.tsx | Index-masthead og målpaneler |
| Newspaper.tsx | TabloidNewspaper |

Dette fjerner 1 561 komponentlinjer. Den ubrukte hook-funksjonen `checkVictoryConditions`
med gamle regler er også fjernet. Den separate brukte seiersklassen i data er beholdt.
`TabloidNewspaperLegacy` er fortsatt importert av aktive moduler og er beholdt.
Statiske artikkelbanker, ekspansjoner, lyd og relikvier er beholdt. 63 disabled-tester
venter på vurdering, ikke automatisk slettet. Gammel roadmap er arkivert; daterte
UPDATES-innslag er sortert synkende uten å omskrive historiske påstander.

## Åpne risikoer og neste port

Start med den manuelle P0-spillerreisen i [planen](../../roadmap.md). Utvidede kort må
fortsatt sammenlignes mellom live-hook og simuleringsmotor; å få dem gjennom
validatoren beviser ikke full mekanikk-paritet. Testsuiten bruker delvis sekskorts-
fallback og gir ikke full artikkel-/ekspansjonsdekning. TypeScript er ikke i strict-
modus; denne endringen strammer ikke hele prosjektet samtidig.

Ingen 60-fps-måling er utført. ~104 MiB precache og en hovedpakke på ca. 4,76 MB er
fortsatt konkrete lasterisikoer. Byggetid er ikke lastetid eller bildefrekvens.

## Verifiserte porter

Kildeinnholdet identifiseres i [SHA-256-manifestet](evidence/tested-source-sha256.json);
dette unngår en sirkulær «commit inneholder sitt eget SHA»-påstand. Maskinlesbare
resultater: [results.json](evidence/results.json). Ingen produktkode ble endret etter
sluttkontrollene. Dokumentasjon og logger ble ferdigstilt etterpå.

| Port | Baseline → resultat | Status |
|---|---|---|
| Ren `npm ci` | Lock mismatch → 1 015 pakker installert, exit 0 | PASS |
| `npm run typecheck` | 26 app-feil → 0, exit 0 | PASS |
| `bun test` | 120 → 138 pass, 0 fail, 531 assertions / 36 filer, exit 0 | PASS |
| Obligatorisk Bun coverage-kommando | 120 / 0 og exit 1 på originalen; 138 / 0 og exit 1 nå | FAIL – dekningskrav |
| `npm run lint` | 444 feil / 53 varsler → 439 feil / 51 varsler, exit 1 | FAIL – eksisterende gjeld |
| `npm run lint:exports` | Feil root-config → faktisk kandidatrapport, exit 0 | PASS som analyse |
| `npm run build` | Fullført; sluttbygg 10,05 s Vite-del, exit 0 | PASS |
| Mobil/desktop brukerreise, dialogfokus, grafikk | Ikke mulig i cloud browser | UNVERIFIED |
| 60 fps, p95/p99, minne, fysisk målmaskin | Ikke målt | UNVERIFIED |

Dekningsrapporten viser 55,50 % funksjoner og 64,80 % linjer i importerte filer.
Nye ekte hook-tester trekker inn større deler av spillet; gjennomsnittet er ikke
sammenlignbart med full katalogdekning. Bun vurderer krav per fil, ikke bare
«All files»-raden. Kravene er beholdt. Se [Buns offisielle forklaring](https://bun.com/guides/test/coverage-threshold).

Sluttbygget har hoved-JS 4 755,32 kB (gzip 992,31 kB), mot baseline 4 753,82 kB
(gzip 991,40 kB); dette er ikke en ytelsesforbedring. CSS 337,86 kB (gzip 54,59 kB).
PWA precacher 508 oppføringer / 106 145,53 KiB. Ingen fps- eller lastetidskonklusjon
kan trekkes fra byggetid/pakkestørrelse. Et mellombygg mens preview var aktivt
inneholdt en ekstra gammel JS-fil; rent sluttbygg etter at preview ble stoppet er
brukt for tallene over.

Rå evidens: [bygg](evidence/build.log), [typecheck](evidence/typecheck.log),
[lint](evidence/lint.log), [testoversikt](evidence/tests-summary.log),
[full testlogg](evidence/tests.log.gz), [full dekningslogg](evidence/tests-coverage.log.gz),
[originalens dekningslogg](evidence/baseline-tests-coverage.log.gz).
De komprimerte loggene er uavkortede; `gzip -dc fil.log.gz` leser dem.

## Leveringsblokkering — 2026-09-05T20:25:15Z

Spillendringene er lagret i lokal commit `02bf91ec6597d0ce1128dad7bb6b7df79c119304`.
Automatisk godkjenningskontroll avviste `git push -u origin fix/gauntlet-flow-2026-09-05`.
Begrunnelse: repo-reparasjon ble ikke godtatt som eksplisitt autorisasjon til ekstern
publisering/opprettelse av gren; eierskap/privatstatus ble også oppgitt som uverifisert
av kontrollen. Ingen alternativ skrivevei er forsøkt etter avslaget. Ingen PR er
opprettet. [Draft-PR-teksten](pull-request.md) er klar; eksplisitt tillatelse til push
og draft-PR er siste avhengighet. Ingen merge er foreslått.

## Publisering fullført — 2026-09-05T20:32:30Z

Brukeren godkjente eksplisitt push og draft-PR. GitHub-tilkoblingen bekreftet
`push`-tilgang til riktig repo. Direkte git-push manglet terminalinnlogging; den
autoriserte GitHub-tilkoblingen overførte de samme filene. Alle 66 beholdte/endrede
filer i endringssettet fikk samme blob-hash som lokalt; seks slettinger ble bevart.
Hele treet `1ac41847db4f6dc617f13aa13edc7693293ad744` var identisk med lokal
checkpoint `a4fafb6`. Remote leveransecommit: `fbf50ab798b2a144b21c81f3d25f31c7baed7456`.
[PR #800](https://github.com/Tombonator3000/state-shift-strategy/pull/800) er draft og unmerged. Dette checkpointet oppdaterer bare dokumentasjon.
Filer: `log.md`, `UPDATES_LOG.md`, `docs/roadmap.md`, `docs/analysis/gauntlet-2026-09-05/README.md`, `docs/analysis/gauntlet-2026-09-05/changes.md`, `docs/analysis/gauntlet-2026-09-05/pull-request.md`, `docs/analysis/gauntlet-2026-09-05/evidence/results.json`. Produktmanifestet og testresultatene er uendret.
