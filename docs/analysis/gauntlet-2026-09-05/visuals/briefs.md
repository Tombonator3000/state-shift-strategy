# Provisional visual briefs — 2026-09-05

Created with the built-in imagegen tool, one call per image. These are composition
references; they are not gameplay captures or user-approved final designs. They are
kept under docs and never imported into the runtime. Existing card art, state
geometry, card text and rules remain authoritative.

## Desktop — desktop-concept-v1.png

Prompt:

> Use case: ui-mockup. Preview-only visual direction concept, NOT a runtime screenshot. Create one desktop gameplay frame for Paranoid Times, an existing 2D browser card strategy game about Truth seekers versus government coverups on a USA state map. Landscape 16:9, straight-on flat editable-interface visual language, no perspective device frame. Keep established tabloid newspaper look: warm off-white paper, near-black ink, thin newspaper rules, bold serif masthead PARANOID TIMES, compact sans serif readable UI, muted red for Truth and blue for Government. Subtle print texture restricted to decoration. Header has turn, faction and clear Truth/IP stats. Left two thirds: large flat US map, individually outlined states with restrained red/blue control fills and small pressure markers. Right one third: clear YOUR HAND panel with TWO columns of large portrait illustrated conspiracy cards, human scale typography, generous separation, native-looking discard controls below cards and one obvious END TURN button. Exactly one concise instruction 'Choose a card, then a state.' near map. Card art uses simple monochrome archival UFO/bureaucracy illustrations with red accents, title and IP cost legible outside art. No extra features such as chat, currencies, 3D models, quests, or invented characters. No neon sci-fi dashboards, no overlapping cards. Small visibly separate caption CONCEPT — NOT RUNTIME. Concept target is composition and readability only; do not imply exact data or geography is verified.

Inspection: two-column hand and hierarchy are useful targets. Generated turn limits,
IP/Truth scales, card effects and state geometry are inaccurate and rejected as data.
The concept's single discard action is superseded by separate native controls in the
implementation. Paper grain is decorative; do not impair UI text with it.

## Mobile — mobile-concept-v1.png

Prompt:

> Use case ui-mockup. ONE separate portrait mobile interaction concept for Paranoid Times, 2D browser card strategy game. Strictly a provisional visual reference, visibly label CONCEPT — NOT RUNTIME at bottom. Flat screen, no phone bezel. Existing tabloid newspaper palette: cream paper, near-black ink, muted red Truth, navy Government, serif masthead and clean readable sans serif controls. Calm print texture only in background. Top compact PARANOID TIMES masthead, status YOUR TURN and 0 / 3 CARDS PLAYED. Below a concise bar 'Choose a state for your ZONE card' with a real-looking Cancel button. Middle a simplified US state map as contextual backdrop with muted state outlines, one obvious selected state. Lower area: YOUR HAND label, 'Swipe to see more cards', horizontal scroll row of large portrait cards with the next card partly visible; do not stack in two columns. Selected card is a ZONE card titled FIELD OPERATION with a monochrome archival field-agent illustration, clear 4 IP cost and caption '+2 pressure in one state'. Each visible card has its own separate DISCARD button below it. Bottom full-width END TURN native-looking button and short 'First discard free' caption. A single natural vertical scroll layout, no tiny panels, no extra game modes, no invented victory thresholds or rule values or max round counts, no chat, neon or 3D. Constraints: generous touch spacing, legible hierarchy, card and target instruction remain discoverable. This visual establishes layout only, no claim of verified game state.

Inspection: horizontal card row, target instruction and separated discard actions
are suitable provisional targets. Use actual card names/effects and the real SVG map;
generated cards and state labels must not enter the game data. Final caption and
control size must be judged at actual phone CSS pixels, not the PNG resolution.
