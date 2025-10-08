# AI Self-Training Workflow

This playbook captures how to generate repeatable AI-vs-AI match logs that can double as optimization telemetry and as a training dataset you can check into version control.

## 1. Run a training batch

Use the bundled helper script, which wraps `tools/ai-simulation.ts` with the right logging switches:

```bash
npm run ai:self-train -- --seed=12345 --iterations=24 --games=48
```

- The optional `--seed` flag makes runs reproducible.
- You can override any other CLI flag surfaced by `tools/ai-simulation.ts` (hand size, turn cap, overtime tweaks, etc.).
- The CLI runs under Node, so you may see harmless warnings about missing `localStorage`; the simulator already falls back to an in-memory extension manifest and continues.

## 2. Inspect the optimization report

Each invocation still emits the familiar optimizer report at `tools/simulations/latest-results.json`. That file summarizes win rates, score deltas, and the configuration that performed best in the batch.

## 3. Capture training-ready logs

When `--trainingLog` is set (the npm script wires it to `docs/analysis/ai-training-dataset.ndjson`), the simulator now appends every sampled game—full turn-by-turn context included—to the NDJSON dataset.

Each entry contains:

- Run metadata (`timestamp`, `seed`, `iteration`, and the aggregate summary score)
- The candidate and baseline AI tuning blobs used for the match
- The raw `GameLog` payload (plays, evaluations, truth/IP/control history, and overtime outcome)

Because it’s NDJSON you can stream the file into analytics tooling, or pipe it through additional filters before building your own learner.

## 4. Commit artifacts to Git

1. Review the appended dataset slices in `docs/analysis/ai-training-dataset.ndjson` and the optimizer report.
2. Commit whichever snapshots matter (you can down-sample or move them under `docs/analysis/` as needed).
3. If the optimizer found a higher-scoring configuration it will already have written the tuned weights to `src/data/aiWeights.json`; include that change in the same commit so the game immediately benefits.

## 5. Extend the loop (optional)

- Hook a separate trainer into the NDJSON feed to learn new policies offline.
- Schedule the npm script via CI to keep collecting fresh scrimmages.
- Add post-processing scripts under `tools/` to boil the logs down into features tailored for your chosen model.

Remember to log the conspiratorial “why” for each batch in commit messages or PR notes—our Paranoid Times analysts demand breadcrumbs.

## Recorded batch – 2025-11-27

- Captured five successive `--games=10` slices (seeds `1001` through `1005`) with `--trainingLogMode=append` to assemble a 50-game NDJSON corpus at `docs/analysis/ai-training-dataset.ndjson`.
- Followed with a `--games=12 --iterations=4 --intensity=0.35` tuning pass (seed `7777`) that surfaced a higher-scoring configuration and rewrote `src/data/aiWeights.json`.
- See `tools/simulations/latest-results.json` for the optimizer report corresponding to the promoted weights.
