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

### Appendix C — Paranoid Times State Cryptid Index
These notes braid Fangoria’s fifty-state dossier into Paranoid Times ops-plans. Each entry distills the folklore vibe and flags a fast rule tweak or content hook.

#### Northeast & Mid-Atlantic
- **Connecticut — Connie (Connecticut River Serpent)**: River pilots whisper about a long, scaled silhouette that surfaces where shipping lanes tighten. *Ops Hook:* Truth MEDIA that pairs sonar doodles with Connie gains +1 Pressure in coastal Zones while Government cards must spend 1 IP to keep ports moving.
- **Delaware — Pukwudgie**: Fire-starting tricksters blink between pines, leaving scorched footprints and pranked park rangers. *Ops Hook:* Deploying Pukwudgie lore lets Truth mark a forest Zone as “mischief-hot,” forcing Government redeploys to cost +1 IP.
- **Maine — Pocomoonshine Lake Monster**: A duel between rival shamans allegedly birthed a snail-serpent hybrid that still capsizes canoes. *Ops Hook:* Truth ZONE cards tied to northern lakes can stall Government draws for a turn unless they fund extra patrols.
- **Maryland — Goatman**: Stories toggle between lab accident and jilted hermit, but either way the ax-wielding hybrid keeps lovers’ lanes empty. *Ops Hook:* Attaching Goatman rumors to suburban Zones adds +1 Pressure; Government cover-ups must discard a MEDIA card to calm PTA outrage.
- **Massachusetts — Beast of Truro**: Cape Cod livestock maulings and cougar-sized tracks kept 1970s sheriffs on edge. *Ops Hook:* Truth ATTACK cards that cite Truro field notes drain an extra IP unless Government bankrolls a wildlife task force.
- **New Hampshire — Wood Devils**: Tall, bark-colored figures pivot behind tree trunks the moment anyone looks. *Ops Hook:* Woodland Zones aligned with Wood Devils grant Truth stealth (preventing one Government ATTACK targeting that Zone per turn).
- **New Jersey — Jersey Devil**: The Pine Barrens’ winged menace mixes colonial curses with casino roof prints. *Ops Hook:* Jersey Devil headlines spike Truth momentum: +1 Truth when a MEDIA card names Atlantic City or the Barrens.
- **New York — White Lady of Durand-Eastman**: A mourning specter patrols Lake Ontario cliffs, freezing beach traffic whenever she appears. *Ops Hook:* Playing the White Lady locks a lakeside Zone for one Government turn unless they spend 1 IP on grief counseling pressers.
- **Pennsylvania — Squonk**: The wrinkled hermit-beast dissolves into tears whenever cornered, soaking hunters in its wake. *Ops Hook:* Truth MEDIA leveraging Squonk sob-stories can convert 1 Government IP into Pressure through “sympathy drives.”
- **Rhode Island — Palentine Ghost**: Block Island locals insist a fiery ship and wailing survivor reappear each winter. *Ops Hook:* Deploying the apparition freezes one Government card in hand (they must reveal and keep it exhausted) unless they field salvage reports.
- **Vermont — Northfield Pigman**: A tusked prowler raided barns and stalked teenagers during harvest festivals. *Ops Hook:* Truth ZONE cards themed around rural fairs earn +1 Pressure; Government counterplay spends 1 extra IP to bolster curfews.

#### Southeast
- **Alabama — Wolf Woman of Mobile**: April 1971 calls flooded dispatch with sightings of a half-wolf woman sprinting through Mobile’s marsh suburbs. *Ops Hook:* Chain hotline witness MEDIA to draw +1 card; Government may pay 1 IP to declare it an April Fools hoax.
- **Arkansas — White River Monster**: “Whitey” surfaces like a humpbacked battering ram whenever the river is dredged. *Ops Hook:* Riverine Zones tied to Whitey tax Government logistics—each deployment there costs +1 IP unless they invest in sonar sweeps.
- **Florida — Skunk Ape**: Everglades tours market the sulfur-scented primate as both attraction and menace. *Ops Hook:* Truth ATTACKS citing Skunk Ape stench drain +1 IP; Government can neutralize it with a sanitation-themed MEDIA play.
- **Georgia — Altie (Altamaha-ha)**: Muscogee stories and modern boat blogs agree a long-necked river dweller prowls the Altamaha basin. *Ops Hook:* Altie combos with any river ZONE to add +1 Truth; Government may discard a NAVY-tag card to steady morale.
- **Kentucky — Pope Lick Monster**: Thrill seekers trespass on a live rail trestle hoping to glimpse the goat-headed hypnotist. *Ops Hook:* Truth can risk a Zone to gain +2 Pressure; Government may cancel it by sacrificing a Rail Infrastructure card.
- **Louisiana — Rougarou**: Cajun parishes invoke werewolf penance stories to keep secrets in the bayou. *Ops Hook:* Rougarou sightings enable Truth ATTACKS to inflict Fear tokens (−1 Government draw) unless they spend 1 IP on parish outreach.
- **Mississippi — Three-Legged Ghost**: Delta churchyards host tales of a hopping revenant and her mother’s phantom limb. *Ops Hook:* Ghost-focused MEDIA drains 1 IP from Government assets assigned to religious Zones.
- **North Carolina — Wampus Cat**: A six-legged feline prowler mauls watchdogs and spooks mountain towns. *Ops Hook:* Wampus-sourced ATTACKS in rural Zones gain +1 damage; Government must play a Wildlife Countermeasure card or lose a card from hand.
- **South Carolina — Lizard Man of Scape Ore**: The 1980s rash of clawed car doors keeps swamp mechanics flush with work. *Ops Hook:* Any ZONE referencing Scape Ore Swamp deals +1 Pressure; Government can pay 1 IP for forensic debunking.
- **Tennessee — Spearfinger**: The stone-skinned witch steals livers while disguised as kin in the Smokies. *Ops Hook:* Truth can tag a Zone as “ancestral alert” to force Government to discard after drawing, unless they field Cultural Outreach MEDIA.
- **Texas — La Lechuza**: Border towns warn of owl-witches swooping down on night drinkers staggering home. *Ops Hook:* Nightlife Zones with Lechuza lore cause Government IP drains during upkeep unless they install curfew orders.
- **Virginia — Chessie**: Chesapeake mariners watch for serpentine wakes and coordinate citizen flotillas. *Ops Hook:* Chessie-themed MEDIA can convert a coastal Zone into a Truth control point for a turn; Government must spend 1 IP to reroute the Coast Guard.
- **West Virginia — Flatwoods Monster**: The 1952 landing panic birthed a permanent festival for a glowing-suited visitor. *Ops Hook:* Pairing Flatwoods with UFO tags doubles Truth from the next MEDIA headline; Government counters by discarding a Weather Balloon card.

#### Midwest & Great Lakes
- **Illinois — Cohomo (Cole Hollow Monster)**: A sulfur-smelling seven-footer stalked riverbanks in the 1970s, logging 200 sightings. *Ops Hook:* Truth can recycle archived police blotters to draw +1; Government loses 1 IP unless they label it “prank season.”
- **Indiana — Devil’s Lake Guardian**: Lake Manitou construction crews blamed accidents on a protective monster. *Ops Hook:* Infrastructure Zones linked to the guardian delay Government builds by one turn unless they finance appeasement rituals.
- **Iowa — Mugwump**: Carnival barkers and lakeside locals promote a hairy, long-necked swimmer as tourist bait. *Ops Hook:* Mugwump promos let Truth MEDIA create temporary pop-up Zones worth +1 Pressure.
- **Kansas — Sinkhole Sam**: Inman Lake anglers feared an eyeless, tubular creature cruising flooded quarries. *Ops Hook:* Sam converts farmland Zones into water hazards, forcing Government to spend 1 IP or take −1 draw next turn.
- **Michigan — Pressie (Presque Isle Serpent)**: 19th-century ship crews recorded serpentine shapes rolling across the bay. *Ops Hook:* Truth MEDIA about Pressie delays Government shipping-related actions by a round unless they issue Coast Guard memos.
- **Minnesota — Hairy Man of Vergas Trails**: Cable crews and farmers chase a towering, nocturnal prowler leaving shredded livestock. *Ops Hook:* Assigning the Hairy Man to a forest Zone boosts Pressure by +1 and forces Government to reveal a card if they contest it.
- **Missouri — Ozark Howler**: Bonfire tales describe a horned bear-cat whose howl rattles campers. *Ops Hook:* Truth combos with music-tour MEDIA for +1 Pressure; Government may pay 1 IP to dismiss it as marketing.
- **Nebraska — Lake Walgren Monster**: Hay Springs residents rebranded a horned lake beast as tourist mascot. *Ops Hook:* Deploying Walgren lore nets Truth +1 card draw; Government must invest 1 IP in “giant sturgeon” PR to negate it.
- **North Dakota — Devil’s Lake Serpent**: Tribal warnings and settler reports blame drownings on a lurking serpent. *Ops Hook:* Aquatic Zones in ND force Government to discard 1 card unless they play Hydrology Data.
- **Ohio — Loveland Frogman**: Wand-wielding frogfolk allegedly waved down patrol cars in the 1950s. *Ops Hook:* Frogman sightings allow Truth to convert one ATTACK into a MEDIA headline mid-turn; Government counters by spending 1 IP on animatronic explanations.
- **South Dakota — Jackalope**: Tourism boards embraced antlered jackrabbits with novelty hunting permits. *Ops Hook:* Jackalope merch MEDIA generates +1 IP for Truth; Government can tax the permits to steal it back.
- **Wisconsin — Hodag**: Rhinelander’s horned lumber-camp legend keeps logging festivals crowded. *Ops Hook:* Hodag-connected Zones deal +1 Pressure; Government must play a Museum Debunking card or eat the loss.

#### Southwest, Plains & Mountain West
- **Arizona — Mogollon Monster**: A reeking, red-eyed biped stalks the Rim Country treeline. *Ops Hook:* Assigning the Monster adds a fear token to a forest Zone, preventing Government IP gain there next turn.
- **Colorado — Tommyknockers**: Mine tunnels echo with goblin knocks that signal cave-ins—or sabotage. *Ops Hook:* Truth can prime mining Zones for instant Pressure spikes; Government must allocate 1 IP to inspection crews to clear it.
- **Idaho — Sharlie**: Payette Lake festivals celebrate a serpentine mascot called Slimy Slim. *Ops Hook:* Play Sharlie to create a temporary MEDIA headline granting +1 Truth unless Government pays 1 IP to host a debunking regatta.
- **Montana — Flathead Lake Monster**: Shape-shifting duelists’ legend morphed into 20th-century boaters logging thirty-foot forms. *Ops Hook:* Truth can pressure fisheries for +1 Pressure; Government spends 1 IP on sonar disinformation to resist.
- **Nevada — Water Babies of Pyramid Lake**: Vengeful spirits tug swimmers under near the reservation shallows. *Ops Hook:* Assign Water Babies to entertainment Zones to lock Government resources for a turn unless they sponsor memorial services.
- **New Mexico — Skinwalkers**: Witch-shifters mimic coyotes and owls, especially across the Four Corners ranchlands. *Ops Hook:* Skinwalker dossiers let Truth swap a card from discard into hand; Government loses 1 IP unless they host cultural briefings.
- **Oklahoma — Green Hill Monster**: A foggy-night encounter birthed tales of a hulking forest dweller outside Talihina. *Ops Hook:* Deploying the Green Hill tale forces Government to exhaust one card, representing PTA damage control.
- **Utah — Uintah Basin Skinwalkers**: Ranch mutilations and portal rumors keep aerospace contractors circling the Basin. *Ops Hook:* Utah Skinwalker Zones double any anomaly combo; Government can discard a Surveillance card to clamp down.
- **Wyoming — Jackalope**: Legislators embraced the antlered rabbit as a tourist champion. *Ops Hook:* Jackalope souvenirs give Truth +1 IP; Government may inspect stands to reclaim it.

#### Pacific & Arctic Frontier
- **Alaska — Qalupalik**: A green-skinned sea dweller sings children toward the surf and hauls them into her amautik. *Ops Hook:* Qalupalik events let Truth freeze one coastal Zone; Government may spend 1 IP to stage a safety PSA.
- **California — Tahoe Tessie**: A deep-lake dweller surfaces often enough to sustain hotline operators and a museum. *Ops Hook:* Tessie sightings allow Truth to convert tourism Zones into +1 Pressure for a round; Government counters by issuing DMV-style pamphlets.
- **Hawaii — Menehune**: Night-working artisans leave perfect fishponds and terraces, then vanish before sunrise. *Ops Hook:* Menehune labor halves build time for Truth Zones; Government can invoke preservation law to stall construction.
- **Oregon — Colossal Claude**: Columbia River sailors report a broad-headed serpent that rides fogbanks. *Ops Hook:* Claude blinds Government reconnaissance, preventing them from targeting one coastal Zone that turn unless they pay 1 IP for lighthouse upgrades.
- **Washington — Tacoma Narrows Octopus**: Divers blame a giant octopus for guarding the collapsed bridge’s wreckage. *Ops Hook:* Assigning the octopus to infrastructure Zones causes Government projects to cost +1 IP unless they host aquarium tours.

### Appendix D — NorthAmericanCryptids Field Guide
Alphabetized intelligence packets cross-referencing NorthAmericanCryptids.com. Use them to lace new cards, sidebars, or narrative beats with ready-made lore and gameplay prompts.

#### A–D
- **Altamaha-ha**: Georgia’s tidal serpent glides through the Altamaha River marsh, described variously as a fish, croc, or plesiosaur holdout. *Deck Hook:* Treat Altie as a roaming boss—when a Zone mentions tidal rivers, let Truth players tutor a cryptid card while Government must park 1 IP in “corps of engineers” denial.
- **Batsquatch**: A blue-furred, nine-foot flyer with an engine-killing screech first linked to Mount St. Helens fallout. *Deck Hook:* Slot Batsquatch into aviation or volcano combos; its entry should add a temporary “no-fly” status that blanks one Government MEDIA response.
- **Bear Lake Monster**: Locals on the Utah–Idaho line still swear a spiked, locomotive-fast beast patrols the lake. *Deck Hook:* Use Bear Lake as a dual-state Zone: if players connect two states in a headline, trigger bonus Pressure and strand a Government transport card.
- **Beast of Bladenboro**: In 1953 a blood-draining cat-beast tore through Carolina farmsteads, leaving canines husked. *Deck Hook:* Give the Beast a “drain twice” effect on livestock or pet-themed cards; Government counters only by sacrificing a community outreach asset.
- **Beast of Bray Road**: Wisconsin’s roadside werewolf legend toggles between shapeshifter and unknown canid. *Deck Hook:* Let Bray Road escalate every time a Moon or Night tag appears—Truth gains stacking Pressure, while Government burns IP on lab DNA reports.
- **Beast of Busco**: Indiana’s giant snapping turtle allegedly spans six feet across and eluded every trap. *Deck Hook:* When Busco surfaces, allow Truth to recycle a discarded ATTACK; Government can only respond with costly dredging operations (+2 IP spend).
- **Bigfoot**: The evergreen icon—upright, elusive, and ready to anchor multi-state conspiracies. *Deck Hook:* Make Bigfoot a wild-card combo enabler: once per game it can copy another cryptid tag in play, while Government must reveal one surveillance card whenever he spawns.
- **Cadborosaurus**: Pacific sailors cataloged “Caddy,” a serpentine hunter glimpsed from California to Alaska. *Deck Hook:* Tie Caddy to long-haul shipping—Truth can string cross-coast Zones for +1 Truth, Government counters by exhausting a Customs unit.
- **Champy**: Lake Champlain’s mascot surfaces across New York, Vermont, and Quebec press clippings. *Deck Hook:* Embed Champ in border headlines; when international Zones align, Truth steals 1 IP as tourism surges unless Government invests in joint task forces.
- **Chessie**: Chesapeake Bay’s sinuous resident spawns photo clubs and watch parties. *Deck Hook:* Chessie should amplify flotilla or Coast Guard mechanics, granting Truth a free MEDIA retheme while Government delays a naval asset for one round.
- **Chupacabra**: The livestock leech toggles between alien spines and mange-ridden coyotes across the Southwest. *Deck Hook:* Let Chupacabra mark any rural Zone; all IP drains there increase by 1 until Government files DNA analyses.
- **Colossal Claude**: Oregon fishers describe a broad-headed serpent riding Columbia River fogbanks. *Deck Hook:* Claude provides concealment—Truth can shroud a Zone to block one Government action; counter requires lighthouse or radar tech.
- **Dover Demon**: Massachusetts teens in 1977 chased a pale, melon-headed climber along stone walls. *Deck Hook:* Pair the Demon with Suburb or Teen Witness tags to turn small MEDIA plays into panic-fueled Truth swings.
- **Enfield Horror**: Illinois reports of a three-legged, red-eyed hopper in 1973 drew armed posses. *Deck Hook:* Deploy the Horror to add chaos tokens; every time Government plays an ATTACK in that Zone they risk splash damage (lose 1 IP on a coin flip).

#### E–L
- **Fouke Monster**: Arkansas’ swamp-stalking ape reeked of sulfur and inspired *The Legend of Boggy Creek*. *Deck Hook:* Give Fouke a “documentary crew” synergy—Truth MEDIA filmed on-site gains +1 draw, while Government must spend 1 IP to seize the footage.
- **Fresno NightCrawler**: Security cams caught stick-legged figures gliding silently through Californian yards. *Deck Hook:* NightCrawler cards can slip past defenses, letting Truth bypass one Government Zone restriction per turn; countermeasures require surveillance upgrades.
- **Honey Island Swamp Monster**: Louisiana trackers cite four-toed prints and yellow eyes prowling the cypress bogs. *Deck Hook:* Pair it with Bayou Zones to inflict “quicksand” penalties that slow Government redeployments.
- **Iliamna Lake Monster**: Alaska pilots report torpedo-shaped predators breaching remote waters. *Deck Hook:* Allow Iliamna to convert isolated Zones into ambush sites that strand a Government resource card until they pay for air support.
- **Jackalope**: The antlered rabbit is equal parts taxidermy hoax and tourism darling across the Plains. *Deck Hook:* Jackalope should print counterfeit permits—Truth gains 1 IP whenever a Souvenir tag appears unless Government imposes novelty taxes.
- **Jersey Devil**: A winged screecher born from colonial curses patrols the Pine Barrens. *Deck Hook:* Mirror the Fangoria homestate bonus: add +1 Truth to any Atlantic City headline unless Government drafts a drone rebuttal.
- **Kelly Little Green Men**: 1955 Kentucky farm families held off glowing, goblin-sized intruders with shotgun fire. *Deck Hook:* Treat the siege as a defense mini-game: Truth can trigger “panic barricade” effects, whereas Government needs to invest IP in Air Force cover stories.
- **Lake Worth Monster**: Fort Worth witnesses described a goat-headed swimmer hurling tires at lakeside revelers. *Deck Hook:* This cryptid weaponizes party Zones—Truth may bounce a Government card back to hand, representing hurled debris.
- **Lizard Man of Scape Ore Swamp**: South Carolina’s clawed car-mauler keeps auto shops busy. *Deck Hook:* Let Lizard Man tag vehicles; any Government vehicle asset in that Zone suffers −1 durability unless reinforced.
- **Loveland Frogmen**: Wand-wielding amphibians allegedly flagged down Ohio patrol cars. *Deck Hook:* Frogmen convert ATTACKS into MEDIA mid-turn, echoing their baton-like sparks; Government counters by discarding a “toy wand” debunk card.

#### M–R
- **Melon Heads**: Midwest legends describe feral, big-headed children haunting backroads and barns. *Deck Hook:* Melon Head rumors can convert any Rural Zone into a trap that punishes Government searches with −1 draw.
- **Menehune**: Hawaiʻi’s night builders leave fishponds and terraces ready by dawn, then vanish into rainforest whispers. *Deck Hook:* Menehune crews halve construction costs for Truth Zones; Government can stall them by invoking sacred land injunctions.
- **Michigan Dogman**: Lumber-camp lore claims a bipedal wolf returns every decade with a bone-rattling howl. *Deck Hook:* Dogman adds a “decade timer” mechanic—after ten rounds, unleash a massive Pressure surge unless Government pre-funds DNA tests.
- **Mogollon Monster**: Arizona’s canyon Bigfoot reeks of carrion and peat moss. *Deck Hook:* Tie the Monster to fear tokens; while it prowls a forest Zone, Government cannot gain IP there.
- **Momo (Missouri Monster)**: A shaggy, orange-eyed figure that stalked a Mississippi River bluff family in the 1970s. *Deck Hook:* Let Momo amplify Family Witness cards, chaining them into surprise combos that steal Government IP.
- **Mothman**: Red-eyed harbinger whose sightings clustered before the Silver Bridge collapse. *Deck Hook:* Use Mothman as a prediction engine—Truth can name a card type; if Government plays it next turn, double the resulting Truth swing.
- **Oklahoma Octopus**: Murky lake drownings fueled stories of freshwater cephalopods pulling swimmers under. *Deck Hook:* Introduce “undertow” markers—any Government unit ending a turn in the afflicted Zone risks being discarded.
- **Ozark Howler**: Horned, catlike predator whose howl rattles Ozarks campers and moonshiners. *Deck Hook:* The Howler should synergize with Music or Festival tags, turning them into Pressure bombs while Government must buy off promoters.
- **Pascagoula River Aliens**: Two shipyard workers described metallic-skinned abductors levitating them into a craft. *Deck Hook:* Treat the abduction as a forced draw—Truth can seize a Government card at random; counterplay costs 2 IP in debriefings.
- **Pig Man of Northfield**: Vermont farmers reported a tusked humanoid rummaging through corn silos. *Deck Hook:* Pig Man lets Truth corrupt Food Supply cards, forcing Government to reroute logistics or lose IP.
- **Pope Lick Monster**: Kentucky’s trestle-dwelling goatman hypnotizes trespassers onto active rails. *Deck Hook:* Assign a “trespass dare” effect—Truth can risk self-damage for big Pressure, while Government spends IP on rail security to defuse it.
- **Rougarou**: Cajun shapeshifter enforcing taboo and loyalty along the bayous. *Deck Hook:* Rougarou applies a “secret oath” token; any player breaking the condition (discarding allies, revealing cards) triggers extra IP drains.

#### S–Z
- **Sharlie**: Payette Lake’s beloved Slimy Slim blends pioneer diaries with modern parade floats. *Deck Hook:* Sharlie can act as a festival wildcard—Truth gains +1 Truth when pairing it with Celebration tags; Government spends 1 IP to sponsor a debunking regatta.
- **Shunka Warakin**: Frontier tales recount a long-bodied wolf-beast stalking Montana prairies. *Deck Hook:* Give Shunka a pursuit trigger—every time Government retreats from a Zone, lose 1 additional IP as it picks off the rear guard.
- **Sink Hole Sam**: Kansas anglers stalked a giant wormlike creature in flooded quarries. *Deck Hook:* Sam transforms farmland Zones into temporary water tiles that block Government infrastructure unless drained.
- **Skin Walkers**: Navajo and Ute warnings describe witch-shifters adopting coyote, owl, or fox forms. *Deck Hook:* Implement a mimic mechanic—Skin Walkers can copy one opposing card ability per round; Government must pay 2 IP for cultural liaison shields.
- **Skunk Ape**: Florida’s swamp Sasquatch leaves sulfur stench and photo ops in its wake. *Deck Hook:* Let Skunk Ape add an olfactory hazard—Government suffers −1 draw in that Zone unless they equip hazmat gear.
- **Slide-Rock Bolter**: Colorado miners feared a whale-like predator that slides down mountains to swallow crews. *Deck Hook:* Bolter cards can “detonate” after a delay, wiping a mountain Zone unless Government installs avalanche nets.
- **Snallygaster**: Maryland moonshiners once blamed a tentacled dragon-bird for livestock raids. *Deck Hook:* Snallygaster should combo with Prohibition or Rum-Running tags, forcing Government to split focus between crime and monsters.
- **Specter Moose**: Maine hunters report a massive white moose shrugging off bullets. *Deck Hook:* Specter Moose grants temporary invulnerability to Truth units in wilderness Zones; Government can nullify it with tranquilizer research.
- **Squonk**: Pennsylvania’s tearful creature dissolves into puddles when cornered. *Deck Hook:* Squonk cards can sacrifice themselves to convert 1 Government IP into Pressure, echoing their emotional contagion.
- **Tahoe Tessie**: Sierra visitors trade hotline tips about a deep-lake dweller near casinos and ski lifts. *Deck Hook:* Tessie merges Winter Sports and Lakefront tags, producing combo headlines unless Government funds tourism spin rooms.
- **Taku-He**: Lakota witnesses describe a towering hairy figure in South Dakota’s Sica Hollow. *Deck Hook:* Taku-He enforces sacred ground—Truth can mark a Zone as off-limits, forcing Government to spend extra IP to enter.
- **Tennessee Wildman**: 19th-century reports detailed a red-eyed ape stealing dogs and shouting in unknown tongues. *Deck Hook:* Wildman creates “panic noise” tokens that disrupt Government card sequencing unless they deploy linguists.
- **Thunderbird**: Giant, storm-bringing birds span Indigenous stories from Alaska to the desert Southwest. *Deck Hook:* Thunderbirds can supercharge Weather cards, doubling their effect while Government must divert power-grid resources.
- **Tizheruk**: Inuit fishers warn of a long-necked predator snatching prey from the Bering Sea docks. *Deck Hook:* Tizheruk locks Arctic supply lines; Government must invest 2 IP to thaw the blockade.
- **Vampire Mercy Brown**: Rhode Island’s 1892 exhumation case turned a tuberculosis victim into vampiric scapegoat. *Deck Hook:* Mercy’s legend can corrode Public Health cards, flipping them into Truth assets unless Government maintains trust campaigns.
- **Van Meter Monster**: An Iowa mining town fired on a horned, bat-winged light emitter in 1903. *Deck Hook:* Van Meter introduces a blinding effect—Government loses targeting on their next ATTACK unless they field spotlights.
- **Walgren Lake Monster**: Nebraska’s horned aquatic terror doubles as a roadside mascot. *Deck Hook:* Walgren can spawn souvenir stalls granting Truth draws; Government recovers by funding “giant sturgeon” exhibits.
- **Wendigo**: Famine-born cannibal spirits prowl northern forests, possessing the greedy. *Deck Hook:* Wendigo cards apply a corruption status that taxes any player hoarding resources; Government must purge with Ritual or Fire tags.
- **White Thang**: Alabama folklore cites a pale, lion-maned creature sprinting toward startled witnesses. *Deck Hook:* White Thang injects sonic fear—Government loses 1 IP whenever it triggers unless they calm crowds with Gospel MEDIA.
- **Woods Devil**: New Hampshire loggers say bark-colored figures hug trunks to vanish instantly. *Deck Hook:* Woods Devil grants stealth—Truth units in forest Zones cannot be targeted once per round; Government needs thermal scans to break it.
- **Zwaanendael Merman**: Delaware’s colonial museum displays a mummified “merman” that sparks maritime toll rumors. *Deck Hook:* Use the merman as a museum asset granting Truth bonus draws when Maritime tags appear; Government can expose it as a hoax to reclaim IP.

📌 **Next Steps**
- Finalize `cryptids.json` with `tags` for `cryptid` + `homestate`.
- Implement combo & homestate logic in `StoryBanks.ts`.
- Add expansion headlines & ads to `newspaperData.json`.
- Playtest to ensure bonuses stay flavorful, not overpowered.
