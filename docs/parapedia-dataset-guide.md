# ParaPedia Dataset Guide

The ParaPedia atlas blends MVP cryptid lore, UFO telemetry tallies, and spectral case files into a reusable dataset for the Premium ParaPedia panel.

## Source Inputs

| Source | Usage | Notes |
| --- | --- | --- |
| `public/extensions/CRYPTIDS_EXPANSION_README.md` | Homestate hotspots, combo references, tonal guardrails | Extract homestate lists and recurring figures. Use appendix callouts to anchor featured quotes. |
| Vetted anomaly briefings (`https://www.vetted.ai/blog/us-ufo-sightings-2023`, `https://www.vetted.ai/blog/desert-uap-patterns`, `https://www.vetted.ai/blog/appalachian-radar-ghosts`) | UFO statistics, radar irregularities, trend language | Snapshot the latest anomaly counts. Preserve article slugs so future refreshes can diff changes. |
| Open archives & Wikipedia (`https://en.wikipedia.org/wiki/Bigfoot`, `https://en.wikipedia.org/wiki/Mothman`, etc.) | Public dossiers for descriptions, timelines, and citations | Store URL + summary text in the reference block. |
| Regional reportage (`https://weirdnj.com/stories/pine-barrens/`, `https://www.chicagotribune.com/history/eastland-disaster`) | Local witness detail and lore texture | Capture the tone in `summary` fields; keep quotes diegetic. |

## Regeneration Workflow

1. **Sync source material.** Pull the newest Cryptids Expansion README and confirm URL references still resolve.
2. **Normalize state metadata.** Align state IDs with USPS codes; set the `region` to match the map groupings defined in `src/state/index.ts`.
3. **Refresh entry payloads.** For each location:
   - Update `summary`, `signalLevel`, and `tags` based on the latest lore.
   - Append timeline beats with `{ year, title, description }`.
   - Ensure every entry lists at least two references (one in-universe, one public).
4. **Rebuild state summaries.** Recalculate `anomaliesIndexed`, `hotspots`, `headline`, and `trend`. These figures fuel the Player Hub landing copy.
5. **Run validations.** Execute `npm run lint` and `bun test --coverage --coverage-reporter=text` to catch formatting or typing issues.
6. **Document changes.** Note any major dataset shifts inside this guide and add a blurb to `UPDATES_LOG.md` when ParaPedia content ships.

## Automation Hooks

- Future iterations can ingest CSV exports from the Vetted anomaly tracker and merge with our atlas via a script in `tools/`.
- A follow-up task should scrape the Cryptids Expansion JSON once it lands to avoid hand-maintaining the homestate table.

## Intent Reminder

ParaPedia must always answer: **“What paranoia lever does this pull?”** Capture that intent line either in commit messages or PR notes so the codex stays razor focused on conspiratorial escalation.
