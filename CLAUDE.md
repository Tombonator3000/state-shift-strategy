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

1. **Stash ekte modul-bindinger i `__tests__/__setup__/preload.ts`** (kjøres
   via `bunfig.toml [test] preload = "__tests__/__setup__/preload.ts"`).
   Bruk **spread-kopi** (`{ ...module }`) — ES-modulbindinger er live, så
   en direkte referanse ville pekt på mocken etter at `mock.module` kjører,
   noe som gir uendelig rekursjon i delegasjons-stuben.

   ```ts
   import * as realApplyEffectsMvp from '../../src/engine/applyEffects-mvp';
   (globalThis as any).__TEST_REAL_MODULES__ = {
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
- Eksisterende baseline: 445 `no-explicit-any`-feil og 53 advarsler — ikke
  blokker for nye PR-er, men introduser ikke nye `any`.

## Sjekkliste før commit

```
npx tsc --noEmit
bun test
npm run build           # bekrefter manualChunks fortsatt OK
npm run lint            # OK å akseptere baseline-feil over
```
