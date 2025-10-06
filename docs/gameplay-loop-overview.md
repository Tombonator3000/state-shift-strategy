# Paranoid Times — Oppsett og Gameplay Loop (MVP)

Denne guiden destillerer designnotatene til en konkret, bordklar prosedyre. Bruk den som referanse når du skal lære opp nye operatører (spillere) eller finjustere digitale prototyper.

## 1. Oppsett steg for steg

1. **Velg fraksjoner**  
   - Spillere avtaler hvem som styrer *Truth Network* og hvem som koordinerer *Continuity Government*.  
   - Gi hver spiller den tilhørende kortstokken og eventuelle fraksjonsspesifikke markører.
2. **Bygg og bland deck**  
   - Fjern eventuelle kampanje-/scenario-kort som ikke brukes i denne økten.  
   - Bland hver fraksjons deck grundig, plasser den som bibliotek, og trekk fem kort på hånd.
3. **Kalibrer globale spor**  
   - Sett `Truth-meter` til 50 %.  
   - Sett begge spilleres `IP-reserver` til 0.  
   - Legg frem `Round Tracker` på felt 1 (brukes i kampanjer for logging, men kan hjelpe ved første gangs spilling).
4. **Forbered kartet**  
   - Plasser alle statskort med standard *Defense*-verdier synlig for begge spillere.  
   - Sett `Pressure`-markører til 0 på begge sider av hver stat.  
   - Marker eventuelle stater som starter under kontroll (scenarioer kan definere dette; standard = ingen).
5. **Avtal opsjonelle moduler**  
   - Aktiver *Catch-up*-modulen hvis spillerne vil teste dynamiske handicapjusteringer.  
   - Aktiver *Maintenance*-regelen dersom dere ønsker å begrense ubrukte IP-reserver (anbefalt for konkurransebalanse).
6. **Forhåndsbrifing**  
   - Truth-spilleren får den ukentlige lekkasjen: les et kort stemningssitat fra `world-lore-quickstart.md` for å sette scenen.  
   - Government-spilleren klargjør "Counter-Intel"-loggen (bruk notatblokk) for å registrere hvilke stater som prioriteres.

## 2. Rundens hovedloop

```
Start of Turn → Inntekt → Catch-up (valgfritt) → Trekk → Spillfase (maks 3 kort)
    ↓                                             ↓
Capture-sjekk ← State Pressure Updates ← Kort effekter
    ↓
End Step (frivillig discard, vedlikehold) → Bytt aktiv spiller
```

Denne sekvensen gjentas til én av seiersbetingelsene fra design-dokumentet trigges (10 stater, 200 IP eller ekstrem Truth-verdi).

## 3. Detaljert tursekvens

### 3.1 Start of Turn

- **Inntekt:** Få `+5 IP` samt `+1 IP` per stat du allerede kontrollerer.  
- **Maintenance-justering (hvis aktiv):** Dersom du avsluttet forrige tur med mer enn 40 IP, trekk `floor((IP − 40) / 10)` fra inntekten (minimum 0).  
- **Catch-up-modul (hvis aktiv):**  
  1. Beregn forskjellen i IP (`Δip = IP_motstander − IP_deg`) og statskontroll (`Δstates = stater_motstander − stater_deg`).  
  2. For hver *fulle* 5 IP utover 10 i `|Δip|`, juster inntekt/Truth med ±1 (maksimalt 4 total).  
  3. For hver stat forskjell utover 1 i `|Δstates|`, juster med ytterligere ±1.  
  4. Positive verdier hjelper den som ligger bak; negative straffer lederen.

### 3.2 Trekkefase

- Fyll opp hånden til fem kort. Hvis du allerede har fem eller flere kort (på grunn av effekter), hopp over denne fasen.

### 3.3 Spillfase

- Spill opptil tre kort i valgfri rekkefølge.  
- Betal IP-kostnaden idet kortet spilles.  
- Resolving tips:  
  - **ATTACK:** Prioriter motstanderens IP og hånd; noter eventuelle `discardOpponent` effekter i Counter-Intel-loggen.  
  - **MEDIA:** Juster Truth-måleren umiddelbart og oppdater felles "Narrative Heat"-spor dersom dere bruker kampanjeregler.  
  - **ZONE:** Plasser Pressure-markører på valgte stater og husk at begge sider kan ha Pressure samtidig.

### 3.4 Capture-sjekk

- For hver stat hvor du har lagt Pressure denne turen: hvis `Pressure ≥ Defense`, overtar du staten.  
- Sett både din og motstanderens Pressure i den staten til 0.  
- Flytt en kontrollmarkør til staten og oppdater IP-inntekten for neste runde.

### 3.5 End Step

1. **Frivillig discard:**  
   - Første kort gratis.  
   - Andre kort koster 10 IP, tredje 15 IP, fjerde 20 IP osv. (økning på +5 IP for hvert ekstra kort).  
2. **Vedlikehold:** Sjekk på nytt om IP-reserven overstiger 40 og noter for neste tur.  
3. **Loggføring:** Oppdater Round Tracker eller digitale logger slik at fremdriften kan analyseres i etterkant.  
4. **Bytt aktiv spiller.**

## 4. Hurtigsjekkliste for designere/testere

- [ ] Truth starter på 50 % og har klare vinne-/tapsterskler definert i MVP-dokumentet.  
- [ ] IP-økonomien balanseres med vedlikeholdsregelen ved lange kamper.  
- [ ] Capture-sjekk tømmes alltid for Pressure for å hindre stacking-feil.  
- [ ] Catch-up-modulen er tydelig merket som valgfri i prototypens UI.  
- [ ] Rundeprotokollen er enkel nok til å forklare på under tre minutter.

## 5. Videre iterasjon

- Logg funn i `paranoid_times_analysis_and_roadmap.md` etter hver testsesjon.
- Dersom nye korttyper introduseres, oppdater `components.json` og utvid tabellen i `DESIGN_DOC_MVP.md` slik at denne loopen fortsatt beskriver standardstrømmen.

> **Paranoid notis:** Hver tur er en slagmark i informasjonskrigen. Bruk rundeloggen som en "redacted file" — strekk over mislykkede trekk, la fremtidige agenter gjette hva som egentlig skjedde.

## 6. Hva skiller dagens digitale gameplay-loop fra MVP-inntektsbeskrivelsen?

| Tema | MVP-dokumentasjon | Implementasjon i prototype (per `src/mvp/engine.ts`) |
| --- | --- | --- |
| **Basisinntekt** | `+5 IP` + `+1 IP` per kontrollert stat uten å nevne duplikathåndtering. | Samme formel, men statenavn aggregeres slik at flere kopier av samme stat gir én samlet post i loggen og én IP per unikt kort (duplikater teller på `count`).【F:src/mvp/engine.ts†L229-L255】 |
| **Maintenance** | Presenteres som valgfritt modul: `floor((IP − 40) / 10)` trekkes ved turstart om du lagret mer enn 40 IP. | Alltid aktiv i koden: terskel 40 og divisor 10 brukes hver runde, og loggen forklarer hvilke parametere som slo inn.【F:src/mvp/engine.ts†L219-L247】【F:src/mvp/engine.ts†L267-L285】 |
| **Catch-up / Swing Tax** | Beskrives som opsjonell justering som kun nevner resultatet («hjelper den som ligger bak»). | Kjøres automatisk hver tur. Systemet beregner separate «swing tax» (lederstraff) og «catch-up bonus» (etterslepbonus) med symmetrisk maks ±4 og loggfører om årsaken er IP- eller statsgap.【F:src/mvp/engine.ts†L147-L215】【F:src/mvp/engine.ts†L247-L284】 |
| **Logging** | Ikke dekket i dokumentasjonen. | Digital loop lager eksplisitte loggoppføringer for inntekt, maintenance, swing tax og catch-up, inkludert hvilke stater som bidro denne runden.【F:src/mvp/engine.ts†L257-L285】 |

**Kort fortalt:** Tallene matcher MVP-reglene, men prototypen håndhever både maintenance og catch-up konsekvent og dokumenterer effektene i spillloggen. Det gjør at playtests umiddelbart viser når en leder straffes eller ettersleperen får ekstra IP, noe som ikke er eksplisitt omtalt i MVP-notatet.
