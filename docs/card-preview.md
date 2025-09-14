# Card Preview

Introduces a full-size card preview modal driven by design tokens.

- Tokens in `src/index.css` define card width/height clamp and colors.
- `CardPreviewContext` exposes `openCardPreview(cardId, sourceZone)` and renders a
  read-only `CardPreview` for non-hand zones.
- `PlayedCardsDock` wires click, keyboard, and long-press events to open previews.

Mini-card sizing in the hand remains unchanged.
