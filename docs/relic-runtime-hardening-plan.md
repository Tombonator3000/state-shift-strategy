# Tabloid Relic Runtime Hardening Plan

## Root cause recap
- Existing saves or malformed runtime payloads could lack a valid `entries` array.
- The round start hook blindly cloned `runtime.entries`, triggering a crash when the data was not an array.
- The failure surfaced consistently at the start of round three when the runtime was first processed after being deserialized.

## Immediate mitigation
1. Sanitize `cloneRuntime` to treat non-object, non-array, or partially populated structures as empty.
2. Normalize selection history and numeric counters while discarding invalid members.
3. Ensure `RelicEngine.applyRoundStart` gracefully returns `null` runtime when sanitized data yields no active entries.

## Follow-up tasks
- [ ] Extend save/load rehydration to validate `tabloidRelicsRuntime` at the point of persistence to prevent future corruption.
- [ ] Add telemetry for discarded runtime entries so QA can spot recurring malformed payloads.
- [ ] Cover the ingest path with fixtures representing older save formats to guarantee forward compatibility.
- [ ] Build a regression test that loads a mocked legacy save blob and steps through three rounds without throwing.
- [ ] Document the runtime schema in `docs/TECHNICAL_README.md` to help tool authors avoid emitting malformed data.
