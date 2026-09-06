# CLAUDE.md – Notater for fremtidige Claude-økter

Dette dokumentet samler hardt-tilegnet kunnskap fra tidligere økter slik at
neste Claude-instans ikke trenger å gjenoppdage de samme fellene. Les også
`AGENTS.md` (overordnet stil/regler), `log.md` (full historikk) og
`UPDATES_LOG.md` (gameplay-endringer).

## Test-infrastruktur (bun:test)

`bun test` kjører serielt, men `mock.module()` er **prosess-globalt og
permanent**. En mock installert i én testfil lekker til alle påfølgende
filer i samme `bun test`-kjøring og kan ikke "resettes" av `afterAll`.

### Mønster: preload + delegerende mock

For å mocke kun innenfor én fil uten å forurense andre filer:

Foretrekk `spyOn` med `mockRestore` når det er tilstrekkelig. Mønsteret under
er for eksisterende tester som trenger delegerende modul-mocker.

1. **Stash ekte modul-bindinger i `__tests__/__setup__/preload.ts`** (kjøres
   via `bunfig.toml [test] preload = "__tests__/__setup__/preload.ts"`).
   Bruk **spread-kopi** (`{ ...module }`) — ES-modulbindinger er live, så
   en direkte referanse ville pekt på mocken etter at `mock.module` kjører,
   noe som gir uendelig rekursjon i delegasjons-stuben.

   ```ts
   // Først: installer DOM og lagring. Statiske imports kjører før oppsettet.
   const realApplyEffectsMvp = await import('../../src/engine/applyEffects-mvp');
   (globalThis as typeof globalThis & { __TEST_REAL_MODULES__?: Record<string, unknown> }).__TEST_REAL_MODULES__ = {
     applyEffectsMvp: { ...realApplyEffectsMvp },
     // …
   };
   ```

2. **I testfilen:** installer mock som delegerer til den ekte modulen, med
   en lokal `useStub`-toggle. Sett `useStub = true` i `beforeEach`,
   `useStub = false` i `afterAll` — slik forblir mocken installert (kan
   ikke fjernes), men oppfører seg som identitet utenfor egen fil.

   ```ts
   const real = (globalThis as any).__TEST_REAL_MODULES__.applyEffectsMvp;
   let useStub = false;
   mock.module('@/engine/applyEffects-mvp', () => ({
     ...real,
     applyEffectsMvp: (...a) =>
       useStub ? a[0] : real.applyEffectsMvp(...a),
   }));
   ```

### DOM-oppsett

`preload.ts` installerer happy-dom én gang for hele kjøringen og setter
`globalThis.document/window/localStorage`. **Ikke** installer en lokal
happy-dom `Window` i individuelle testfiler — det overskriver preload-ets
globaler **etter** at `@testing-library/react` har fanget en referanse til
`document.body`, og resulterer i tomme DOM-tester.

Bruk `@testing-library/react` (ikke `react-test-renderer`) for komponenter
som bruker shadcn `Select`/Radix-portaler — `createPortal` er inkompatibel
med `react-test-renderer` når en happy-dom `document` finnes.

## Build / bundle

- **Lazy-load tunge assets:** `src/assets/audio/paranormalSfx.ts` (~5 MB
  base64) lastes via `loadProceduralSfx()` i `sfxManifest.ts` — egen chunk.
  Mønster: hvis en modul er > 500 kB og kun trengs etter første render,
  flytt den bak `import()`.
- **`vite.config.ts → build.rollupOptions.output.manualChunks`** splitter
  `react`, `@radix-ui`, `lucide-react`, `recharts/d3`, `@tanstack/zod/router`,
  og `peerjs` til egne `vendor-*`-chunks for cache-granularitet.
- **Unngå dobbeltimport-warnings:** Hvis modul A statisk importerer X og
  modul B `import()`-er X, forsvinner code-split-gevinsten (Rollup vil
  inlined begge i samme chunk). Sjekk Vite-bygget for "X is dynamically
  imported by … but also statically imported" og fjern enten den statiske
  eller den dynamiske importen.

## ESLint

- `src/assets/audio/paranormalSfx.ts` (6993 linjer base64) krasjer parser
  med stack overflow → ligger i `eslint.config.js` `ignores`.
- Målt 2026-09-06: 410 feil / 51 varsler mot 438 / 51 etter PR #801.
  Lint-porten feiler fortsatt. Ikke skjul gjelden eller introduser nye `any`.

## Sjekkliste før commit

```
npm run typecheck       # tsconfig.app.json; rotkonfigurasjonen er en tom solution
bun test --coverage --coverage-reporter=text
npm run build           # bekrefter manualChunks fortsatt OK
npm run lint            # rapporter eksisterende feil separat fra regresjoner
```

Kildeimportene i `src/data/core/index.ts` er eksplisitte slik at Vite og Bun
bruker de samme 424 kortene. Ikke gjeninnfør `import.meta.glob` som eneste
testlaster: Bun falt da stille tilbake til seks nødkort. Ekspansjonstester leser
de ekte JSON-filene: 500 støttede kort, 40 avvist med synlig begrunnelse. Se
`docs/analysis/gauntlet-2026-09-06-startup/README.md` for avgrensningen.
