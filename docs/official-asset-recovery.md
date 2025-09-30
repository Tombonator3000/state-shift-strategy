# Official Asset Recovery & Manifest Relock

When the card art manifest drifts away from the official assets (for example, after pulling down a teammate's local downloads), run the recovery workflow to restore locked entries that match the shipped art.

## 📦 What the helper does

The `relockOfficialAssets` helper in `src/services/assets/relockOfficialAssets.ts`:

- Iterates every card in the database.
- Uses `OfficialStore.lookup` to fetch the canonical metadata for cards with official art IDs.
- Rewrites the manifest so those entries are marked `source: "official"` and `locked: true`.
- Optionally drops any superseded download entries and clears the autofill cache namespace.

The manifest is then persisted to `public/data/card-art-manifest.json` so the client ships with a clean baseline.

## 🚀 One-off recovery script

Run this during deploys (or anytime the manifest needs to be reset):

```bash
npm run assets:relock
```

What the script does:

1. Loads any existing `public/data/card-art-manifest.json` entries into the in-memory manifest.
2. Invokes `relockOfficialAssets` with download cleanup + cache clearing enabled.
3. Writes the refreshed manifest back to `public/data/card-art-manifest.json`.
4. Prints a summary of relocked entries and any errors.

Commit the updated manifest file so the runtime starts from the restored official state.

## 🗓️ When to run it

- **Before creating a release build** – guarantees the shipped bundle references official art.
- **After importing cards or modifying official art IDs** – syncs any new metadata.
- **When diagnosing asset drift** – re-locking verifies whether discrepancies are caused by local downloads.

## 🧹 Optional cleanup

By default the script clears the autofill provider cache and removes download-sourced manifest entries that get replaced by official data. If you need to preserve locally downloaded assets, re-run the helper manually and pass `{ cleanupDownloads: false }`.

```ts
import { relockOfficialAssets } from '@/services/assets/relockOfficialAssets';

await relockOfficialAssets({
  cleanupDownloads: false,
  clearAutofillCache: false,
});
```

That overload is useful inside custom tooling or dev dashboards if you need a softer reset.
