# Bruksanvisning: Nye kort og temaer

Denne oppskriften viser hvordan du designer, registrerer og kvalitetssikrer et nytt korttema i Paranoid Times-universet. Følg stegene kronologisk for å holde både datasett, avisoppslag og kunstfiler i takt med konspirasjonslore.

## 1. Avklar paranoia-konseptet
- Les gjennom [CARD_STYLE_MANUAL.md](../CARD_STYLE_MANUAL.md) og `'Humor Template  – Paranoid Times.md'` for å låse tone, fraksjonsbalanse og foretrukne punchlines før du skriver et eneste kort.
- Formuler én setning som svarer på «hvilken paranoia-spak drar dette temaet?» og legg den i commit- eller PR-teksten.
- Lag en mini-matrise over stater, karakterer og tagger du vil berøre, så du kan sjekke overlapp mot eksisterende artikler i `paranoid_times_card_articles_ALL.json`.

## 2. Bygg kortene i kjernedatasettet
1. Opprett en ny batch-fil under `src/data/core/` dersom kortene skal leve i hovedsettet (for eksempel `government-batch-5.ts`). Eksporter et `GameCard[]` slik de andre batchene gjør.
2. Sørg for at hvert kort følger `GameCard`-schemaet fra `src/rules/mvp.ts` og at `cost` matcher `MVP_COST_TABLE`. Bruk validatoren til å sjekke kostnadene i etterkant (`npm run validate:mvp`).
3. Fyll ut `tags` og `stateBonuses` når kortet peker på spesifikke stater eller nøkkelord – dette hjelper både artikkelmotoren og AI-strategien.

### Eksempel (TypeScript)
```ts
import type { GameCard } from '@/rules/mvp';

export const continuityCache: GameCard[] = [
  {
    id: 'GOV-513',
    name: 'Continuity Cache Choir',
    faction: 'government',
    type: 'MEDIA',
    rarity: 'rare',
    cost: 5,
    tags: ['media', 'continuity-program'],
    effects: {
      truthDelta: -2,
      ipDelta: { opponent: 1 },
    },
    flavorGov: 'Patriot hymns at 432Hz keep the archive docile.',
    flavorTruth: 'Why does the anthem hide a numbers station undernote?',
  },
];
```

## 3. Registrer temaet som utvidelse
1. Lag en JSON-fil i `src/data/expansion/` (eller `public/extensions/` hvis det skal lastes eksternt) med kortene i MVP-format.
2. Oppdater `src/data/expansions/builtin.ts` og legg til en ny `BuiltinExpansionSource` som peker på filen, beskriver temaet og krediterer forfatter.
3. Kjør `scripts/generate-extension-index.mjs` indirekte ved å starte `npm run dev` eller `npm run build` så manifestene fanger opp pakken.

### Eksempel (JSON)
```json
[
  {
    "id": "TRUTH-720",
    "name": "Starlite Doorstep Vigil",
    "faction": "truth",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "tags": ["watchers", "midnight-vigil"],
    "effects": {
      "pressureDelta": 2,
      "truthDelta": 1
    },
    "flavorTruth": "Neighbors swap telescope shifts and apocalypse recipes.",
    "flavorGov": "Unauthorized congregation flagged for morale dilution."
  }
]
```

## 4. Knyt nye kort til avisoppslag
1. Finn eller opprett artikler for kortene i `paranoid_times_card_articles_ALL.json`. Hold deg til schema-versjonen øverst i filen.
2. Inkluder tags, `statesMentioned`, `followUpHooks` og en byline som føles som en paranoid nyhetsdesk.
3. Hvis temaet introduserer gjentakende karakterer, oppdater `docs/cardArticles/article-coverage.md` med hvilke kort som har dekning.

### Eksempel (artikelutdrag)
```json
{
  "id": "GOV-513",
  "faction": "government",
  "tags": ["continuity-program", "numbers-station"],
  "headline": "CONTINUITY CACHE CHOIR DROWNS OUT WHISTLEBLOWERS",
  "subhead": "Vault loudspeakers hum patriotic counter-signals across {STATES_CONTROLLED} counties.",
  "byline": "By: Cipher Clearance Echo",
  "statesMentioned": ["VA", "MD"],
  "followUpHooks": ["Why does the score modulate with IP totals?"],
  "body": "Security choirs rehearse at 03:33, drowning out {PLAYER_FACTION} leaks with hymns spiked in white noise."
}
```

## 5. Sørg for kunst og media
- Plasser kortillustrasjoner i `public/card-art/` med filnavn som matcher kort-ID (for eksempel `GOV-513.png`).
- Legg inn midlertidig tekstur i samme mappe hvis endelig illustrasjon ikke er klar, og merk TODO i commit-meldingen.
- Hold `cardArtManifest.ts` synkronisert hvis du manuelt legger til forhåndslastede bilder.

## 6. Valider og loggfør
1. Kjør `npm run validate:mvp` for å sjekke schema.
2. Kjør `npm run lint` og `bun test --coverage --coverage-reporter=text` som påkrevd i repoets agentinstruks.
3. Oppdater `UPDATES_LOG.md` med dato, filer og kort sammendrag når temaet påvirker spillet.

## 7. Hurtigsjekkliste
- [ ] Paranoia-spaken er dokumentert.
- [ ] TypeScript/JSON følger `GameCard`-schemaet.
- [ ] Utvidelsen er registrert i `BUILTIN_EXPANSION_SOURCES`.
- [ ] Avisartikler, tags og stater er koblet til.
- [ ] Kunstfiler matcher kort-ID og manifestet.
- [ ] Validator, lint og tester er kjørt, og endringen er loggført.
