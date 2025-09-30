# Expansions — README

## 1. Overview
Expansions add new themes, humor, and content to *ShadowGov* without breaking the streamlined MVP ruleset.  
They follow the same JSON schema as core decks and integrate directly into the engine.

### Available Expansions
- ✅ **Cryptids Expansion** — Folklore monsters, blurry Polaroids, cover-ups vs. revelations.  
- ✅ **Halloween Spooktacular** — Bureaucratic horror: ghosts, zombies, haunted malls.  
- 🔜 **UFOlogy Mini-Pack** — Alien abductions, saucers, men-in-black.  
- 🔜 **Florida Man Special** — The ultimate running gag as a standalone booster.  
- 🔜 **Tabloid Ads Pack** — Joke ads and fake classifieds integrated as mini-events.  

Each expansion has its own `README.md` in its subfolder, describing design, humor, and card data.

---

## 2. How to Make an Expansion

### Step 1 — Theme & Humor
- Pick a clear **theme** (e.g., Cryptids, Halloween, UFOs).  
- Decide tone split:  
  - **Truth** = chaotic, DIY journalism, zany tabloid energy.  
  - **Government** = dry, bureaucratic cover-up humor.  

### Step 2 — Card Data
- All cards must use MVP whitelist effects (see `DESIGN_DOC_MVP.md`):  
  - **ATTACK** = `ipDelta.opponent` (+ optional `discardOpponent`).  
  - **MEDIA** = `truthDelta`.  
  - **ZONE** = `pressureDelta`.  
- Costs auto-balance by rarity (Common/Uncommon/Rare/Legendary).  
- JSON schema example:  
  ```json
  {
    "id": "EXP-TS-001",
    "name": "Example Expansion Card",
    "faction": "truth",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": { "truthDelta": 1 },
    "flavor": "Blurry photo, grainy headline."
  }
  ```

### Step 3 — Flavor & Style
- **Truth**: Amateur photos, witness quotes, scribbled captions.  
- **Government**: Minutes, forms, memos ignoring obvious absurdity.  
- Art style: grainy 1990s black-and-white tabloid photos.  

### Step 4 — Integration
- Place JSON in `/expansions/your-expansion-name/`.  
- Add `README.md` with:  
  - Overview, Design Goals, Humor/Style, Example Cards.  
  - Optional Appendices (Combo Tables, Homestate Bonuses).  
- Expansion auto-loads via sanitiser.  

### Step 5 — Newspaper System
- Add mastheads, ads, and headlines to `newspaperData.json`.  
- Expansion headlines should match card theme (e.g., “Bigfoot Bulletin”, “Zombie Zone Zine”).  
- Use `StoryBanks.ts` for expansion-specific combos and glitches.  

### Step 6 — Playtest
- Ensure bonuses stay small (+1 Truth/IP/Pressure, 1 discard, 1 draw).  
- Flavor should carry the expansion, not raw power.  
- Watch for combos stacking too high — keep them fun and cosmetic.  

---

## 3. Expansion Roadmap
- More seasonal packs (Xmas Conspiracies, Summer UFO Invasion).  
- Crossovers (Elvis Special, Bat Boy Origins).  
- Joke micro-packs (Ads-only decks, Meme Deck).  

---

📌 **Pro tip**: When in doubt, keep expansions **funny first, balanced second**. The core MVP rules protect balance; expansions exist to push humor and replay value.
