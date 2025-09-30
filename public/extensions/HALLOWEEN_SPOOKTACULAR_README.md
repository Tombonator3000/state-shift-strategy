# Halloween Spooktacular Expansion — README

## 1. Overview
The **Halloween Spooktacular Expansion** bathes *ShadowGov* in supernatural satire: vampires, zombies, ghosts, skeletons, haunted houses, and bureaucratic witches.  

- **Faction focus**: Primarily Government (cover-ups of the undead).  
- **Tone**: Deadpan official memos describing absurd paranormal events.  
- **Card types**: Still ATTACK / MEDIA / ZONE (MVP whitelist).  
- **Style**: Black-and-white grainy “Halloween special” tabloid edition.  
- **Flavor**: Horror tropes + bureaucratic language.  

---

## 2. Design Goals
- Add a seasonal **Halloween flavor pack** (~200 cards).  
- Stick to MVP cost/effect balance.  
- Explore **bureaucratic horror**: committees for ghosts, protocols for hauntings.  
- Provide thematic **Zones** (Haunted Walmart, Carnival of Fear, Abandoned Cemeteries).  
- Integrate into newspaper headlines, mastheads, and ads.

---

## 3. Components
- ATTACK = “Incidents” (e.g., Poltergeist Panic, Zombie Outbreak).  
- MEDIA = “Press Releases” (e.g., Witchcraft Audit Report, Pumpkin Shortage Memo).  
- ZONE = “Protocols/Initiatives” (e.g., Haunted Walmart, Ghost Containment Site).  
- ~200 cards (`halloween_spooktacular_with_temp_image.json`).  
- Integrated headlines + ads in `newspaperData.json` (e.g., “Zombie Zone Zine”).  

---

## 4. Humor & Style
- **Government Humor**:  
  - “Approved by the Council of Shadows.”  
  - “Poltergeist disturbances filed under HVAC malfunctions.”  
- **Truth Humor** (sprinkled):  
  - DIY paranormal hunters, grainy haunted-house photos, skeptical sheriffs.  
- **Recurring Gags**: Bat Boy cameo in a cape, Florida Man in zombie makeup, Elvis as undead crooner.  
- **Visuals**: Tabloid-style glitch effects, ink smudges, “Halloween special” masthead.  

---

## 5. Special Systems

### 5.1 Seasonal Identity
- The Halloween pack can be played standalone for spooky campaign nights.  
- Cards retain MVP structure but are unified by horror theme.  
- Works as a “flavor reskin” of core mechanics.  

### 5.2 Combo Effects (Optional)
Some combos add spooky newspaper headlines:  
- **Haunted Walmart + Ghost Hunter Raid** → “CUSTOMER RETURNS TURN INTO EXORCISM!” (+1 Truth).  
- **Zombie March + Media Leak** → “UNDEAD TREND ON SOCIAL MEDIA!” (TruthDelta doubled this round).  
- **Bat Boy + Pumpkin Protocol** → “BAT BOY ELECTED HALLOWEEN KING!” (draw +1 card).  

(👉 If combo system enabled, see `StoryBanks.ts` for integration.)

---

## 6. Integration
- **Rules**: MVP whitelist only (truthDelta, ipDelta, pressureDelta).  
- **Engine**: Same sanitiser as core.  
- **UI**: Halloween-specific mastheads and ads:  
  - Mastheads: “Zombie Zone Zine”, “Haunted Headlines”.  
  - Ads: “Haunted Toaster — Your Bread Will Scream”, “Zombie Repellent Spray”.  
- **Data**: Card JSON validated by cost curve.  

---

## 7. Example Cards
- *“Haunted Walmart”* — ZONE, Uncommon, Cost 5, +2 Pressure.  
  Flavor: “Rollback prices on cursed dolls.”  
- *“Poltergeist Protocol”* — MEDIA, Common, Cost 3, −1 Truth.  
  Flavor: “Filed under HVAC anomalies.”  
- *“Zombie March”* — ATTACK, Uncommon, Cost 3, −2 IP.  
  Flavor: “The dead walk… right into a permit hearing.”  
- *“Council of Shadows”* — MEDIA, Rare, Cost 5, −3 Truth.  
  Flavor: “Approved unanimously, minutes withheld.”  

---

## 8. Appendices

### Appendix A — Example Combo Headlines
| **Combo**                   | **Headline**                                   | **Bonus** |
|------------------------------|------------------------------------------------|-----------|
| Haunted Walmart + Ghost Raid | “CUSTOMER RETURNS TURN INTO EXORCISM!”        | +1 Truth |
| Zombie March + Media Leak    | “UNDEAD TREND ON SOCIAL MEDIA!”               | TruthDelta doubled this round |
| Bat Boy + Pumpkin Protocol   | “BAT BOY ELECTED HALLOWEEN KING!”             | Draw +1 card |

### Appendix B — Halloween Mastheads & Ads
- **Mastheads**: “Zombie Zone Zine”, “Haunted Headlines”, “Tabloid of Terror”.  
- **Ads**: Haunted Toaster, Zombie-Proof Yoga Mats, Pumpkin Perfume, Ghost Dating App.

---

📌 **Next Steps**
- Finalize JSON with MVP structure.  
- Expand combo/headline list for StoryBanks.  
- Playtest as standalone “Halloween Night” mode.  
- Integrate seasonal mastheads & ads into newspaper generator.  
