# Paranoid Times – Front Page Expansion Roadmap

This roadmap captures the follow-up implementation slices for the "Paranoid Times" makeover. It distills the brainstorm (Gameplay & Layout Brainstorm) into concrete engineering milestones, and records the status of each beat so future passes can pick up without re-deriving the plan.

## Delivery Principles
- **Respect the MVP core.** Truth %, IP, and Pressure remain the win conditions – new flavor layers must plug into the existing math instead of replacing it.
- **Surface the duel.** Every UI/UX change needs to amplify the Truth vs. Government tug-of-war described in the tone bible.
- **Ship in thin slices.** Each milestone should be playable, tested, and reviewable on its own so we can tune humor, pacing, and balance incrementally.

## Milestone Tracker
| Area | Goal | Current Status | Next Actions |
| --- | --- | --- | --- |
| Front-page slots | Map played cards into headline slots with factional dressing. | ✅ Implemented in `FrontPageLayout` with slot metadata and highlight events. | Add cinematic transitions for reveal events and refactor tile component for reuse in match recap. |
| Evidence vs. Red Tape | Wrap the truth meter with thresholds that grant Expose!/Obfuscate bonuses. | ✅ Truth/Government coupons hook into card resolution and log messaging. | Balance coupon values (currently flat +1 IP / extra draw) and add UI affordance for "coupon ready" state. |
| Location stunts | Surface stunt hotspots when ZONE cards fire. | ✅ `StuntBadge` renders hotspot + pressure gains under the main photo slot. | Wire badges into state detail drawer and add humor lines sourced from the tone template. |
| Public Frenzy momentum | Track short-term swings that unlock Truth bonus slots or Government countermeasures. | ⚙️ Momentum manager tracks value/ownership; under-review debuff now halves opposing ZONE pressure. | Implement true "initiative" (front-loading resolution order) and animate the frenzy dial during ±10% spikes. |
| Deck archetype flavor | Group card pools by running gags (Bat Boy Beat, Paperwork Tsunami, etc.). | 🚧 Pending – decklists still share the generic pool. | Draft curated lists per archetype and route flavor blurbs through localization helpers. |
| Humor & feedback polish | Trigger gag banks during key beats (success/failure). | 🚧 Pending – current logs use placeholder strings. | Pipe success/failure into Humor Template snippets and add SFX hooks to card events. |

## Immediate Focus
1. **Stabilize new systems** – exercise under-review debuff, coupon logic, and bonus slot edge cases via dev tools.
2. **Communicate state** – expand the Public Frenzy meter with explicit badges (bonus headline, initiative owner, under-review target).
3. **Plan archetype curation** – gather card IDs per faction that align with the humor beats for the next content pass.

Tracking updates here keeps the implementation aligned with the narrative pillars and prevents regressions as we iterate on balance and UI polish.
