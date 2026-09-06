# Publiseringsfeilen som kunne gi svart skjerm

Kontrollert 2026-09-06T10:16:03+00:00.
Spillkoden er merget til main: `89a23aaf1f9a5c4b38619fffb30e0a61b6944ed5`.
Lovable-editoren rapporterte identisk SHA.

## Hva som skjedde

To publiseringsløp skrev til samme GitHub Pages-nettsted:

| Løp | Kjøring | Resultat |
| --- | --- | --- |
| Vite: Deploy to GitHub Pages | 34026665590, forsøk 1 | Ferdig 10:11:06Z; publiserer dist/ med bygget JavaScript og CSS |
| Automatisk Pages/Jekyll | 34026665218 | Ferdig 10:11:09Z; steg inkluderer Build with Jekyll; publiserer rå prosjektfiler |

Etter at begge viste success, serverte den offentlige adressen index.html med
`<script src="/src/main.tsx">` og ingen bygget CSS. Denne HTML-en kan ikke starte
Vite-spillet på statisk hosting. Den automatiske publiseringen overstyrte dermed
bygget som nettlesertestene nettopp hadde godkjent. Dette er en separat feil fra
musikkadressene og den store oppstartscachen.

## Gjenopprettet

Publiseringsjobben for det ferdige Vite-bygget ble kjørt på nytt etter at Jekyll
var ferdig. Kjøring 34026665590, forsøk 2, består. Den offentlige siden serverer nå:

- `/state-shift-strategy/assets/index-1hMZYuwv.js`
- `/state-shift-strategy/assets/index-C4XPKGxd.css`

HTTP-kontrollen bekrefter også den siste kontrastrettelsen: mobilens mørke
kortkvittering har eksplisitt lys tekst. Ingen ny main-commit ble laget etter
gjenopprettingen, siden en slik commit ville utløse den konkurrerende Jekyll-jobben igjen.
Denne rapporten er derfor bevart på en egen dokumentasjonsgren.

## Varig rettelse som krever repository-innstilling

Åpne [Settings → Pages](https://github.com/Tombonator3000/state-shift-strategy/settings/pages).
Under **Build and deployment → Source**, velg **GitHub Actions**.
Behold den eksisterende arbeidsflyten `.github/workflows/deploy-github-pages.yml`.
Da brukes den bygde dist-mappen, og automatisk publisering av rå main-filer opphører.

GitHub-tilkoblingen i dette arbeidsmiljøet eksponerer ikke endring av Pages-
innstillingen; et forsøk på å lese Pages-endepunktet ble avvist av verktøyets
endepunktliste. GitHubs dokumentasjon krever administrator-/maintainer-tilgang
eller rett til å administrere Pages for å endre kilden. Ingen tilgangskontroll
eller alternativ legitimasjon ble omgått.

[GitHubs veiledning om publiseringskilde](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Status for spillet

- PR #806–808 er merget: trykkmålvalg, pålitelig radio, avis fra riktig runde,
  Breaking/Redacted/kombo-kø, tabloidstil, PC-kart og mobilens lesbarhet.
- 203 tester / 0 feil / 784 assertions. Typekontroll og bygg består.
- Kjent lint: 409 feil / 42 advarsler. Dekning 67.19% funksjoner / 74.40% linjer;
  eksisterende terskler består ikke og er ikke svekket.
- Tolv eksisterende MP3-filer er fullt dekodet. Theme-1 er tom og hoppes over.
  Radio starter, pauser og bytter spor i nettleseren.
- 360×640 målvelger, 390×844 avis og 1280×800 PC-kart er kontrollert i nettleseren.
- Fysisk telefon, hørbar lyd på brukerens enhet, 200% zoom og FPS gjenstår.
- Lovable har samme kilde. Siste publiseringsforespørsel
  `2938ed9c-0185-4cbf-a0d5-56fdf3cc1edf` svarte pending; offentlig ny Lovable-utgave
  er ikke bekreftet. Nettleseren viste fortsatt index-Bd9Ye6x4.js.
