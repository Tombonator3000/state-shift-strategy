# Cryptids Expansion — README

## 1. Overview
The **Cryptids Expansion** brings folklore, legendary beasts, and tabloid absurdism into *Paranoid Times*.  
Players encounter Bigfoot, Mothman, Chupacabra, Nessie, the Jersey Devil, and more — always framed through the game’s satirical Government vs. Truth struggle.

- **Faction split**:  
  - Truth = chaotic revelations, blurry photos, DIY proof.  
  - Government = dry denials, bureaucratic cover-ups, “no anomalies detected.”  
- **Card types**: Still only ATTACK / MEDIA / ZONE (MVP whitelist).  
- **Style**: 1990s black-and-white tabloid grain, disposable camera snapshots (Truth) vs. official reports (Government).  
- **Flavor**: Blends conspiracy humor, running gags (Florida Man, Bat Boy, Elvis, Bigfoot), and absurd witness quotes.

---

## 2. Design Goals
- Expand the **flavor space** without breaking MVP balance.  
- Add **iconic cryptid figures** as both cards and running gags.  
- Introduce **Zone-locations** themed around cryptid folklore hotspots.  
- Provide **synergy combos** (soft bonuses + newspaper headlines) for thematic card pairs.  
- Support **Homestate bonuses**: small boosts when cryptids appear in their “natural” states.  
- Plug directly into the **newspaper engine** (mastheads, ads, headlines).

---

## 3. Components
- ~200 new cards (balanced to MVP rarity & cost tables).  
- ATTACK = exposés, leaks, chaos (IP drain).  
- MEDIA = viral proof, tabloid reports (Truth swings).  
- ZONE = hotspots, haunted sites, rallies (Pressure).  
- Fully MVP-compliant JSON (`cryptids.json`).  
- New mastheads & ads integrated via `newspaperData.json`.

---

## 4. Humor & Style
- **Government Humor**: Boring procedure covering absurd events.  
  - “Filed under subsection 12-C. No anomalies.”  
  - “Operation successful. Crowd dispersed before noticing the lizard.”  
- **Truth Humor**: Amateur journalism, tabloid hype, chaotic witnesses.  
  - “Crowd chanted until Bigfoot waved back.”  
  - “Posted to six forums before breakfast.”  
- **Recurring Figures**: Florida Man, Bat Boy, Elvis, Bigfoot.  
- **Duality**: Same cryptid can appear as a Truth revelation and a Government cover-up.

---

## 5. Special Systems

### 5.1 Combo Effects
Expansion cards trigger **combo headlines** and small bonuses when played together.  
These are *cosmetic + soft buffs* only — no new mechanics outside MVP.

#### Example Combos
- **Bigfoot + Elvis** → Headline: “BIGFOOT BACKUP SINGER JOINS ELVIS RESURRECTION TOUR!” → +1 Pressure in chosen state.  
- **Bat Boy + Florida Man** → “BAT BOY AND FLORIDA MAN FORM POLITICAL PARTY — CHAOS ENSUES!” → Opponent discards 1 card.  
- **Cornfield Abduction** (UFO + Cornfield Zone) → “COWS ABDUCTED DURING COUNTY FAIR!” → +1 Truth.  
- **Mothman + MEDIA** → “MOTHMAN PREDICTS DOOM — NARRATIVE SWINGS WILDLY!” → TruthDelta doubled (this turn).  
- **Cryptid Congress** (Bigfoot + Nessie + Chupacabra) → “CRYPTIDS FORM SHADOW CONGRESS!” → +2 Pressure in one state.

👉 Full combo table: see Appendix A.

---

### 5.2 Homestate Bonuses
Each major cryptid is linked to one or more states. Playing a ZONE/ATTACK/MEDIA card in that state triggers a small bonus if the matching cryptid card is on hand or in play.

#### Example Homestate Bonuses
- **Bigfoot** (WA/OR) → +1 Pressure when playing ZONE there.  
- **Mothman** (WV) → +1 Truth from MEDIA played in WV.  
- **Chupacabra** (TX/NM/AZ) → ATTACK drains +1 IP.  
- **Jersey Devil** (NJ) → +1 Pressure on ZONE in NJ.  
- **Skunk Ape** (FL) → ATTACK in FL drains +1 IP.  
- **Wendigo** (MN/MI/WI) → ATTACK in those states forces 1 discard.  

👉 Full homestate table: see Appendix B.

---

## 6. Integration
- **Rules**: Expansion remains within MVP whitelist (truthDelta, ipDelta, pressureDelta).  
- **Engine**: Homestate + combo systems run as optional layers in `StoryBanks.ts`.  
- **UI**: Newspaper generator uses expansion-specific headlines, ads, and mastheads:  
  - “Bigfoot Bulletin”, “Mothman Monthly”, “Zombie Zone Zine”.  
- **Data**: JSON card files validated by sanitiser (costs auto-match rarity).

---

## 7. Example Cards
- *“Bigfoot Campground”* — ZONE, Rare, Cost 6, +3 Pressure.  
  Flavor: “Please don’t feed the senator.”  
- *“Cornfield Abduction Site”* — ZONE, Rare, Cost 6, +3 Pressure.  
  Flavor: “Free tractor rides included.”  
- *“Elvis Shrine in Vegas”* — ZONE, Uncommon, Cost 5, +2 Pressure.  
  Flavor: “Burning love, steady income.”  
- *“Freedom of Information Blitz”* — ATTACK, Rare, Cost 4, −3 IP + discard.  
  Flavor: “Heavily unredacted, lightly folded.”

---

## 8. Appendices

### Appendix A — Cryptid Combo Table

| **Combo Name**             | **Trigger Cards**                  | **Headline (Newspaper)**                                                   | **Bonus Effect** |
|-----------------------------|------------------------------------|----------------------------------------------------------------------------|------------------|
| Bigfoot & Elvis Tour        | Any Bigfoot + Any Elvis            | “BIGFOOT BACKUP SINGER JOINS ELVIS RESURRECTION TOUR!”                     | +1 Pressure in chosen state |
| Bat Boy for President       | Any Bat Boy + Any Florida Man      | “BAT BOY AND FLORIDA MAN FORM POLITICAL PARTY — CHAOS ENSUES!”             | Opponent discards 1 card |
| Cornfield Abduction         | Any UFO/Alien + Cornfield Zone     | “COWS ABDUCTED DURING COUNTY FAIR!”                                        | +1 Truth |
| Mothman Prophecy            | Any Mothman + MEDIA card           | “MOTHMAN PREDICTS DOOM — NARRATIVE SWINGS WILDLY!”                         | TruthDelta doubled (this turn) |
| Florida Occupation          | Any Florida Man + Any ZONE card    | “FLORIDA MAN OCCUPIES STATE CAPITOL IN FLIP-FLOPS!”                        | +1 IP to Truth player |
| Witness Parade              | 2+ Witness/Photo/Selfie cards      | “TABLOID EXPLOSION: EVERYONE SAW SOMETHING!”                               | All MEDIA this round gain +1 TruthDelta |
| Cryptid Congress            | Bigfoot + Nessie + Chupacabra      | “CRYPTIDS FORM SHADOW CONGRESS — PASS LAWS IN SECRET CAVE!”                 | +2 Pressure in one state |
| Bat Boy Graduation          | Bat Boy + UFO + Gov MEDIA cover-up | “BAT BOY’S DEGREE DENIED BY GOV — WE PRINTED IT ANYWAY!”                   | +2 Truth |
| Elvis Shrine Special        | Elvis + Haunted Walmart/Roadside Shrine | “ELVIS SHRINE LIGHTS UP — LOCALS SWEAR IT HUMS!”                         | Choose: +1 Pressure OR opponent −1 IP |
| Mothership Karaoke          | UFO + Elvis + Florida Man          | “UFO MOTHERSHIP HOSTS KARAOKE NIGHT — ELVIS WINS, FLORIDA MAN BOOED”       | Both players draw +1 card |
| Loch Ness Selfie            | Nessie + Selfie/Photo MEDIA        | “TEEN POSTS LOCH NESS SELFIE — INTERNET MELTDOWN!”                         | +2 Truth |
| Chupacabra Milk Run         | Chupacabra + Cow/Witness Zone      | “CHUPACABRA CAUGHT ON DAIRY FARM — OFFICIALS BLAME RACCOONS”               | Opponent −1 IP |
| Haunted Road Trip           | Bigfoot + Mothman + Bat Boy        | “CRYPTID CARAVAN SIGHTED ON HIGHWAY 66!”                                   | +1 Truth and +1 Pressure |
| FOIA Gone Wild              | Gov ATTACK (FOIA, Redaction) + Truth reveal | “FILES LEAKED — CRYPTIDS EVERYWHERE!”                             | Truth player +1 IP |
| Festival of Fear            | 3+ Halloween-flavored ZONE cards   | “CRYPTID CARNIVAL ROCKS MIDWEST — ENTRY PAID IN SECRETS”                   | All ZONE gain +1 Pressure this round |
| Tabloid Megahit             | 3+ Truth MEDIA cards               | “MEGA-SCOOP! TABLOIDS CAN’T KEEP UP!”                                      | Draw 1 extra card at end of turn |

---

### Appendix B — Homestate Bonus Table

| **Cryptid**       | **Homestate / Region**  | **Bonus Effect**                                    | **Headline**                                      |
|-------------------|--------------------------|------------------------------------------------------|--------------------------------------------------|
| Bigfoot           | Washington / Oregon      | ZONE in WA/OR → +1 Pressure                         | “BIGFOOT SPOTTED IN CASCADES — RALLY TRIPLES!”   |
| Mothman           | West Virginia            | MEDIA in WV → +1 Truth                              | “MOTHMAN PROPHECY GRIPS STATE — TV RATINGS SOAR!”|
| Chupacabra        | Texas / NM / AZ          | ATTACK in those states drains +1 IP                 | “CHUPACABRA STRIKES AGAIN — RANCHERS DEMAND ANSWERS!” |
| Jersey Devil      | New Jersey               | ZONE in NJ → +1 Pressure                            | “JERSEY DEVIL SIGHTING STIRS LOCAL POLITICS!”    |
| Loch Ness (gag)   | Florida tourist zones    | MEDIA in FL → +1 Truth                              | “NESSIE VACATIONS IN MIAMI — INFLUENCERS GO WILD!” |
| Bat Boy           | Anywhere (Nomad)         | Bat Boy + any ZONE → draw +1 card                   | “BAT BOY CAMPAIGNS NATIONWIDE — VOTERS CONFUSED!”|
| Skunk Ape         | Florida                  | ATTACK in FL drains +1 IP                           | “SKUNK APE TAG-TEAMS WITH FLORIDA MAN!”          |
| Thunderbird       | OK / KS / NE             | MEDIA in those states → +1 Truth                    | “THUNDERBIRD BLOCKS SUN OVER NEBRASKA — CROWD CHEERS!” |
| Mokele-mbembe     | Louisiana                | ZONE in LA → +1 Pressure                            | “DINOSAUR IN BAYOU? OFFICIALS BLAME HUMIDITY”    |
| Wendigo           | MN / MI / WI             | ATTACK in those states forces 1 discard             | “WENDIGO HUNGER STRIKES — WITNESSES FLEE!”       |
| Lizard Man        | South Carolina           | ZONE in SC → +1 Pressure                            | “LIZARD MAN RETURNS TO SWAMP — STATEHOUSE SHRUGS”|
| Flatwoods Monster | West Virginia            | MEDIA in WV → +1 Truth                              | “FLATWOODS MONSTER ATTENDS PTA MEETING!”         |

---

📌 **Next Steps**
- Finalize `cryptids.json` with `tags` for `cryptid` + `homestate`.
- Implement combo & homestate logic in `StoryBanks.ts`.
- Add expansion headlines & ads to `newspaperData.json`.
- Playtest to ensure bonuses stay flavorful, not overpowered.
