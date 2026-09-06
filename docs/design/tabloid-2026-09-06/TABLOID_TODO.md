# Paranoid Times – todo for funksjoner og ny avisstil

Dato: 2026-09-06. Undersøkt kilde: `d05843dbee84d0bb9f84e809ab53c31595d5cd80`.
Status: **arbeidsliste og grafikkforslag, ikke implementerte rettelser**.

Tom ønsker fungerende pressure-kort på mobil/PC, fungerende eksisterende musikk,
bedre Breaking/Redacted-popuper, en mer sammenhengende tabloidstil, nye artikler
satt sammen av rundens kort og et tydelig løft for komboer.

## Retningen

Spillet skal oppleves som å lage en skandaløs avis mens man kjemper om USA.
Britisk tabloid er formspråket; handlingen og kartet er fortsatt amerikansk.
Papir, trykksverte, enorme overskrifter og absurde pressebilder skal prege hele
opplevelsen. Myndighetene bortforklarer det åpenbare. Truth-redaksjonen slår opp et
uskarpt bilde som århundrets avsløring. Humormalen i repositoryet er fasiten.

Denne runden leverer seks separate konseptbilder i samtalen: PC, mobil/pressure,
rundens avis, Breaking, Redacted og kombo. Promptene og korreksjonene er bevart i
[CONCEPT_PROMPTS.json](CONCEPT_PROMPTS.json). Bildene er visuelle referanser;
spilltekst, kartgeometri, tall og knapper må bygges som ekte UI fra spillets data.
De skal ikke brukes som én stor bakgrunn med usynlige klikkfelt.

## Prioritert todo

| ID | Prioritet | Hva som skal gjøres | Ferdig når |
| --- | --- | --- | --- |
| T01 | P0 | Reproduser og rett pressure-målvalg på mobil og PC. Følg kortet fra detaljvisning via målvalg til motor og resultat. | Samme gyldige kort og mål gir samme press, IP-kostnad og kortforbruk med touch, mus og tastatur. Avbrutt/ugyldig spill bruker ingenting. |
| T02 | P0 | Gi pressure-kort en felles målvelger: kart eller søkbar delstatsliste, forhåndsvisning, Bekreft og Avbryt. | Spilleren ser eget/motstanderens press, forsvar, forventet endring og kostnad før bekreftelse. Eierskap følger gjeldende regler. Alle kort som faktisk krever delstatsmål får riktig inngang. |
| T03 | P0 | Reparer musikkadressene og den tomme Theme-1-filen. Bevar de eksisterende låtene. | Riktige adresser fungerer både på GitHub Pages og fra rotadresse; valgte spor er gyldig lyd. Ett ødelagt spor hindrer ikke de andre i å spille. |
| T04 | P0 | Gjør lydstart, innstillinger og feilstatus pålitelige. | Spiller kan starte/pause musikk, endre volum, bytte spor og gjenoppta etter bakgrunn/fokus. Status viser faktisk avspilling, ikke bare at et forsøk ble gjort. |
| T05 | P1 | Koble én tydelig avisflyt til den avsluttede rundens faktiske kort og hendelser. | Ny utgave refererer riktig runde og riktige kort. Også 0, 1 og 2 kort håndteres. Forrige rundes hovedsak lekker ikke inn som en ny sak. |
| T06 | P1 | Lag sammenhengende, varierte artikler av kortenes personer, hendelser, steder og konsekvenser. | En hovedsak har oppsett, kobling mellom kortene, vending og myndighetsreaksjon. Den er mer enn sammenlimte overskrifter eller hele kortnavn gjentatt som personer. |
| T07 | P1 | Innfør felles avisdesign i spilleflate, kort, kortdetaljer, menyer, innstillinger, samling og sluttresultat. | Samme logo, skrifthierarki, papir/blekk, fraksjonsmarkører og knappefamilie brukes på mobil og PC. Faktiske seiersmål vises. |
| T08 | P1 | Redesign rundens avis med hovedoppslag, bilde, bildetekst, ingress, spalter og kortkilder. | Avisen kan leses på telefon uten å krympe en PC-side. Fortsett er alltid tilgjengelig. Det samme utgavenummeret beholder samme historie når siden åpnes igjen. |
| T09 | P1 | Bygg Breaking som en ekstralapp med pressefoto og tydelig konsekvens. | Kort, hendelse og faktisk effekt vises. Den kan lukkes eller hoppes over, og resultatet finnes igjen i hendelsesloggen. |
| T10 | P1 | Bygg Redacted som et myndighetsdokument med stempel og lokale sensurstriper. | Sensuren berører dokumentet, ikke hele skjermen eller spillkontrollene. Kortresultat og lukking er lesbare hele tiden. |
| T11 | P1 | Løft komboene med kildekort, kobling, eget oppslag og belønning. | Eksisterende komboregler utløser én presentasjon med faktisk tildelt belønning; ingen ny eller dobbel belønning kommer fra animasjonen. |
| T12 | P1 | Samordne effektkø, lyd og varige kvitteringer. | Breaking, Redacted, capture og kombo kolliderer ikke. Spilltilstand venter ikke på en kosmetisk effekt, og et avbrudd etterlater ikke svart skjerm eller låst tur. |
| T13 | P2 | Lag gjenbrukbare pressebilder, papirflater og stempler der eksisterende kunst mangler. | Kortenes identitet og artikkelbanker bevares. Nye bilder finnes som optimaliserte ressurser; all tekst og alle tall er fortsatt redigerbar UI. |
| T14 | P2 | Kontroller lesbarhet, touch, bevegelse og ytelse mot konseptene. | Skjermbilder fra samme bygg sammenlignes på mobil/PC, med sikkerhetsmarger, tastaturfokus, 200 % zoom og redusert bevegelse. Ytelse er målt før den kalles godkjent. |

## Hva kildekoden faktisk viser

| Område | Bekreftet funn | Betydning / uavklart |
| --- | --- | --- |
| Musikk | `useAudio.ts` setter `audio.src = src` og bruker `/muzak/...`. Pages-basen er `/state-shift-strategy/`. SFX bruker tilsvarende rotadresser. | Adressene må normaliseres med eksisterende `getAssetPath`; data-URI-er skal fortsatt behandles som data-URI-er. Ingen ny avspillingsprøve er gjort i denne runden. |
| Musikkfil | `public/muzak/Theme-1.mp3` er 2 byte, bare CR/LF. Tolv andre MP3-filer finnes med større innhold. | Theme-1 inneholder ikke et musikkspor. Hent en intakt versjon fra historikken hvis den finnes; ellers bruk et intakt eksisterende spor som reserve uten å påstå at Theme-1 er reparert. Større filstørrelse alene beviser ikke at de øvrige sporene kan dekodes. |
| Lydstatus | Loaderen kan sette «Ready – All tracks loaded» selv når spor er falt ut. Første input kan komme før sporene er klare; senere avspilling skjer da utenfor den opprinnelige brukerhandlingen. | Reell start/feil må vises, og brukeren må kunne prøve lydstart igjen. Autoplay-begrensninger må håndteres, ikke omgås. |
| Pressure | Hånd, side og kart sender dagens målvalg gjennom ZONE-sjekker. Mobilen har en delstatsliste, og en tidligere ZONE-reise er verifisert. | Dette beviser ikke at alle kort med pressure-effekt fungerer. Kort-ID, effektdata, mål og plattform må logges ved reproduksjon. Årsaken til Toms gjenværende pressure-feil er ikke bekreftet. |
| Avis | Den synlige V2-visningen velger siste composite fra headlineLog/extraExtraFeed. Det finnes også IssueGenerator/smartNarrative og en separat ArticleCombiner-demo med AI/template-rute. | Flere implementasjoner finnes; demoen beviser ikke at rundens avis bruker den. Spor den faktiske produsenten og mottakeren før en konsolidering. Gamle rapporters importkart er ikke dagens fasit. |
| Artikkeltekst | De undersøkte statiske artiklene for TRUTH-001/007/040 gjentar hele kortnavn i generiske setninger. | Banken skal bevares som kilder og identiteter, men den ferdige sammensatte saken trenger redigering og bedre koblinger. |
| Kombo | `pair_bigfoot_mothman` / Cryptid Summit finnes med grunnbelønning +1 IP og +1 Truth. | Bruk faktisk tildelt belønning fra motoren i presentasjonen, også når modifikatorer gjelder. Konseptet viser grunnbelønningen. |

Kilder i repo: `src/hooks/useAudio.ts`, `src/assets/audio/sfxManifest.ts`,
`src/lib/assets.ts`, `vite.config.ts`, `src/pages/Index.tsx`,
`src/components/game/EnhancedGameHand.tsx`,
`src/components/game/EnhancedUSAMap.tsx`,
`src/components/game/mobile/MobileBattleLayout.tsx`,
`src/engine/applyEffects-mvp.ts`, `src/components/game/TabloidNewspaperV2.tsx`,
`src/engine/news/composeTriple.ts`, `src/engine/newspaper/IssueGenerator.ts`,
`src/engine/newspaper/ArticleCombiner.ts` og `src/game/twoCardCombos.ts`.

Nettleseren kan blokkere lydstart utenfor en brukerhandling. Dette er beskrevet i
[MDNs autoplay-veiledning](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
Det er en relevant teknisk ramme, ikke alene en bevist forklaring på denne feilrapporten.

## Design som skal følges

| Element | Retning |
| --- | --- |
| Papir og trykk | Lys varm papirflate, omtrent #EFE6D2, mørkt blekk #181817 og avisrødt #B51D25. Lite tekstur under brødtekst. |
| Typografi | Kraftig avislogo, smale tunge overskrifter, lesbar serif i artikler og tydelige tall. 16 px er utgangspunkt for mobilbrødtekst; font må vurderes i faktisk størrelse. |
| Foto | Kornete svart-hvite pressebilder fra 1990-tallet. Offisielt alminnelige situasjoner med én åpenbart absurd detalj. |
| Kort | Bevar eksisterende kortkunst og ID. Stor kostnad, type, effekt og lesbar tittel; full artikkel i detaljvisning. |
| PC | Status øverst, kart sentralt, hånd nederst; sidekolonner for redaksjon og siste hendelser. Ingen unødvendig konkurranse med kortvalg. |
| Mobil | Kort statuslinje og én aktiv oppgave. Pressure-målvalg får egen lesbar flate og bunnhandlinger. Ikke overfør konseptets dekorative småtekst direkte til en telefon. |
| Fraksjon | Samme avisfamilie, men Truth bruker avsløringer/fotomerknader og Government bruker saksmapper/sensur. Eierskap og markører må også ha tekst/ikoner. |
| Breaking | Kort papirslag inn, liten presseblits, lesbart resultat. Maks én stor hendelsespresentasjon om gangen. |
| Redacted | Ett stempelslag og få korte sensursveip på dokumentet. Ingen heldekkende svart effekt. |
| Kombo | Kildekort knyttes sammen; navn, artikkelbilde og belønning følger. Kort feiring, deretter en liten varig markering. |
| Musikk/lyd | Diskret tilgjengelig kontroll. Papir, stempel, kamera og trykkpresse er naturlige effekter; demp musikk kort under viktige signaler. |
| Bevegelse | Startforslag: 180–300 ms for åpning og 600–1000 ms for kombo. Lesetid er separat; brukeren skal ikke måtte lese i animasjonens tempo. Redusert bevegelse får statisk versjon. |

Konseptbildenes bakgrunnsdetaljer er illustrasjon, ikke autoritative kart,
komponenter eller spilldata. Redacted-bildets hånd/papirperspektiv er en
stilillustrasjon; det er ikke et krav om en hånd eller fotograferte kontroller i
spillet. Kombo og popuper skal få ekte tilgjengelige lukkeknapper selv der et
konseptbilde ikke tydelig viser dem.

## Slik skal kortene bli til en avis

1. Ta et uforanderlig øyeblikksbilde av den avsluttede runden: kort-ID-er, aktør,
   rekkefølge, mål, faktiske utfall og utløste komboer.
2. Hent personer, steder, motiv og artikkelfrø fra eksisterende kort-/artikkeldata.
3. Velg en hovedhendelse. La de andre kortene gi årsak, komplikasjon eller reaksjon.
4. Skriv overskrift, ingress, 2–4 avsnitt, sitat og en tørr offisiell bortforklaring.
   Bevar skillet mellom humoristisk fortelling og mekanisk resultat.
5. Vis hvilke kort saken bygger på. Sideoppslag kan dekke motstanderens handlinger
   og delstater som faktisk ble påvirket.
6. Bevar utgaven med kamp-/rundeidentitet og seed. Omlasting av samme avis skal
   ikke dikte opp en ny runde. En senere runde kan gi en oppfølgingssak.
7. Lokal komposisjon må fungere uten en ekstern AI-tjeneste. En eventuell AI-rute
   er valgfri, tidsavgrenset og har en brukbar lokal reserve.

Dette viderefører prosjektets **Setup → Twist → Redacted Footnote**-mal.
Spillforløpet Investigate → Uncover Contradiction → Escalate Paranoia → Resolve
ligger i kortene; avisen forteller hva den siste runden førte til.

### Eksempel fra faktiske kort

| Kildekort | Bidrag til historien |
| --- | --- |
| TRUTH-001: Blurry Bigfoot Photo Goes Viral | Bigfoot blir synlig i offentligheten. |
| TRUTH-040: Mothman Public Warning | En advarsel blir til en pressebriefing. |
| TRUTH-007: UFO Over High School Football Game | Stadion er stedet; UFO-en gir en ny komplikasjon. |

**BIGFOOT HIRES MOTHMAN AS PRESS SECRETARY**

*UFO stadium flyover turns a local warning into a national briefing.*

Bigfoot's latest blurry photograph was meant to settle the matter. It instead
earned him a press secretary. Mothman issued the warning. The saucer supplied the
lighting. Officials declined to comment on the choice of venue.

**Offisiell reaksjon:** No anomalies detected.

Dette er ny eksempeltekst, undersøkt mot den eksisterende banken uten identisk
overskrift. Intensjon: avsløring blir til mediehåndtering, og myndighetene
bagatelliserer en synlig hendelse. Det er ingen ny kortdefinisjon eller belønning.

## Verifisering ved implementering

| Område | Minimum som skal prøves |
| --- | --- |
| Pressure | Begge fraksjoner; nøytral/rival/egen delstat; ID/forkortelse; for lite IP; avbryt; dobbelttrykk; turbytte; motstanderpress; forsvarsterskel; alle målpliktige effekttyper som faktisk finnes i katalogen. |
| Lyd | Ren innlasting, første klikk før/etter sporlasting, lyd av/på, bakgrunn/fokus, sporbytte, feil fil, rotbase og Pages-base. Dekoding og hørbar avspilling på faktisk telefon og PC. |
| Avis | 0/1/2/3 kort, begge aktører, kombo, capture og ingen capture. Samme runde stabil; neste runde fersk; kildekort korrekte; ingen dobbel hovedsak. |
| UI | 360×640, 390×844, 844×390, 768×1024 og 1440×900. Trykkflater som utgangspunkt minst 48×48, fokus/tilbake, zoom, sikkerhetsmarger og redusert bevegelse. |
| Effekter | Flere raske hendelser; avbryt/skip; fokusbytte; mislykket bilde/lyd; ingen fastlåst spillfase. |

Kjør repositoryets obligatoriske typecheck, bygg, lint og Bun-dekning på hver
implementert slice. Rapporter eksisterende feil separat. Konseptbilder og
komponenttester alene godkjenner ikke touch, lyd eller fps.

**Foreslått rekkefølge:** T01–T04 → T05–T08 → T09–T12 → T13–T14.
Målvalg og lyd er første gjennomførbare leveranse. Hver leveranse skal kunne
prøves i det faktiske spillet, med logger og skjermbilder fra samme kodeversjon.

## Verifikasjon i denne planrunden

Kildekode og lokale filer er undersøkt. Konseptbildene er laget og visuelt
vurdert; USA-setting og PC-bildets seiersmål ble korrigert. Ingen spillkode,
musikkfil, artikkelbank eller regel er endret. Det er ikke kjørt nye spilltester,
lydprøver eller fps-målinger for disse forslagene. Tidligere 175 beståtte tester
tilhører den forrige implementasjonen, og er ikke bevis for at denne listen er ferdig.
