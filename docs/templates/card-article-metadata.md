# Card Article Metadata Notes

Use this reference when adding narrative entries to `paranoid_times_card_articles_ALL.json`. The new optional fields let writers seed the headline generator with extra lore hooks so the end-of-turn newspaper can point to specific fallout without guessing.

## Optional fields
- **`statesMentioned`** – Array of state or region names touched by the card. Keep entries short (e.g., `"Nevada"`, `"Gulf Coast"`). The generator uses these to stitch fallback paragraphs and subheads that call out contested territory.
- **`recurringCharacter`** – Single string naming a notable NPC, source, or operative tied to the article. Leave blank if the piece is purely situational.
- **`followUpHooks`** – Array of teaser lines that hint at future investigations, rumors, or missions. Think of them as prompts the newsroom can surface in sidebars or future arcs.

## Tone & sourcing reminders
- Stay inside the Paranoid Times voice: conspiratorial, sly, and rooted in semi-plausible occult bureaucracy.
- Reference in-universe organizations or tech where possible. If you invent a new codename, jot it down in the lore tracker so it can be reused consistently.
- When in doubt, sanity-check the field values against existing entries near the top of the JSON for style and length.

Document any large metadata migrations in the accompanying PR description so future editors know why fields were added or renamed.
