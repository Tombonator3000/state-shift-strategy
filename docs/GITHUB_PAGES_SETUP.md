# GitHub Pages Setup - Dual Hosting

Dette dokumentet beskriver hvordan du setter opp dual hosting for **Paranoid Times**, slik at spillet kan kjøres både via Lovable OG GitHub Pages.

## ✅ Fordeler med Dual Hosting

- **Uavhengighet**: Ikke avhengig av Lovable for hosting
- **Backup**: Fungerer selv om Lovable har nedetid
- **Redundans**: To uavhengige deployments
- **Valgfrihet**: Velg selv hvilken plattform du vil bruke

## 🚀 Aktivering av GitHub Pages

### Trinn 1: Aktiver GitHub Pages i Repository Settings

1. Gå til repository på GitHub: `https://github.com/Tombonator3000/state-shift-strategy`
2. Klikk på **Settings** (øverst til høyre)
3. Scroll ned til **Pages** i venstre meny
4. Under **Source**, velg:
   - Source: **GitHub Actions**
   - (Dette vil automatisk kjøre workflow fra `.github/workflows/deploy-github-pages.yml`)

### Trinn 2: Push endringer til main branch

Når du pusher til `main` branch, vil GitHub Actions automatisk:
1. Bygge prosjektet med `npm run build`
2. Deploye til GitHub Pages
3. Gjøre spillet tilgjengelig på: `https://tombonator3000.github.io/state-shift-strategy/`

### Trinn 3: Verifiser deployment

1. Gå til **Actions** tab i GitHub repository
2. Se at workflow "Deploy to GitHub Pages" kjører/er fullført
3. Besøk spillet på: `https://tombonator3000.github.io/state-shift-strategy/`

## 🔧 Hvordan det fungerer

### Vite Configuration

`vite.config.ts` er konfigurert med dynamisk base path:

```typescript
const base = process.env.GITHUB_PAGES === 'true' ? '/state-shift-strategy/' : '/';
```

- **I Lovable**: base = `/` (root path)
- **På GitHub Pages**: base = `/state-shift-strategy/` (repository path)
- **Lokal utvikling**: base = `/` (root path)

### GitHub Actions Workflow

Workflow `.github/workflows/deploy-github-pages.yml` kjører automatisk når:
- Du pusher til `main` branch
- Du manuelt trigger workflow fra Actions tab

Workflow steg:
1. Checkout kode
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Build med `GITHUB_PAGES=true` environment variable
5. Upload build artifacts
6. Deploy til GitHub Pages

## 📝 Deployment Status

| Platform | URL | Status |
|----------|-----|--------|
| **Lovable** | `https://[your-lovable-url].lovable.app` | ✅ Active |
| **GitHub Pages** | `https://tombonator3000.github.io/state-shift-strategy/` | ⏳ Pending Setup |

## 🔄 Manuell Deployment

Du kan manuelt trigge en deployment:

1. Gå til **Actions** tab i GitHub
2. Velg **Deploy to GitHub Pages** workflow
3. Klikk **Run workflow**
4. Velg `main` branch
5. Klikk **Run workflow**

## 🐛 Troubleshooting

### Spillet lastes ikke riktig på GitHub Pages

**Problem**: Assets (bilder, CSS, etc.) mangler eller gir 404 errors.

**Løsning**: Verifiser at `base` path er riktig konfigurert i `vite.config.ts`:
```typescript
const base = process.env.GITHUB_PAGES === 'true' ? '/state-shift-strategy/' : '/';
```

### Workflow feiler

**Problem**: GitHub Actions workflow feiler under build.

**Løsning**:
1. Sjekk error logs i Actions tab
2. Verifiser at alle dependencies er i `package.json`
3. Test lokal build: `npm run build`

### 403 Permission error

**Problem**: GitHub Pages viser "403 Forbidden".

**Løsning**:
1. Verifiser at repository er **public** (eller at du har GitHub Pro for private repos)
2. Sjekk at GitHub Pages er aktivert i Settings → Pages

## 🎮 Testing Lokal Preview

Test GitHub Pages build lokalt:

```bash
# Build med GitHub Pages config
GITHUB_PAGES=true npm run build

# Preview bygget
npm run preview
```

Spillet vil kjøre på `http://localhost:4173/state-shift-strategy/`

## 📚 Ressurser

- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
