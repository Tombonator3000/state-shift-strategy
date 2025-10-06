# Unused Function Audit

## Overview
- **Audit date:** 2025-10-06
- **Scope:** Entire TypeScript/JavaScript codebase under `src/`, `scripts/`, and `tools/`.
- **Methodology:**
  1. Executed `npx ts-prune --project tsconfig.json --entryPoint src/main.tsx` to surface unused exports.
  2. Ran `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` to detect file-local functions or parameters without references.

## Findings
No unused functions or exports were detected by either analysis command. At this time there are no candidates ready for archival.

## Recommended Follow-up Plan
1. **Integrate automated check** – Add `ts-prune` (or equivalent) to CI to prevent unused exports from lingering in future commits.
2. **Tighten TypeScript compiler options** – Enable `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json` to continuously flag dormant helpers during development.
3. **Quarterly manual review** – Re-run the audit after major feature deliveries to confirm new modules stay referenced.

## Backlog Tasks
- [ ] Add a CI step (npm script + pipeline job) that runs `ts-prune --json` and fails on findings.
- [ ] Update `tsconfig.json` with `"noUnusedLocals": true` and `"noUnusedParameters": true`, ensuring build tooling still passes.
- [ ] Document the unused-function audit procedure in `docs/TECHNICAL_README.md` so new contributors can repeat the process.
