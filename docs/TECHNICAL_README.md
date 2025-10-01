# Paranoid Times Technical Overview

## Table of contents
- [Game loop fundamentals](#game-loop-fundamentals)
- [MVP card schema](#mvp-card-schema)
- [State map and territorial control](#state-map-and-territorial-control)
- [Combo engine integration](#combo-engine-integration)
- [Card data normalization pipeline](#card-data-normalization-pipeline)
- [Audio systems](#audio-systems)
- [Campaign arc progress telemetry](#campaign-arc-progress-telemetry)
- [Secret agenda cookbook grid](#secret-agenda-cookbook-grid)

## Game loop fundamentals
The MVP design defines a duel between the Truth Seekers and the Government, each managing Influence Points (IP), a shared Truth meter, and pressure on individual U.S. states. Win conditions include controlling 10 states, pushing Truth to faction-specific thresholds, or accumulating 300 IP.【F:DESIGN_DOC_MVP.md†L7-L63】 These core concepts are implemented directly in the runtime engine:

- **Turn start:** `startTurn` clones game state, uses `computeTurnIpIncome` to award `5 + controlledStates` IP, applies reserve maintenance, evaluates the swing-tax/catch-up module, logs every adjustment, and refills the active player's hand to five cards.【F:src/mvp/engine.ts†L50-L114】
- **Card play gating:** `canPlay` enforces the three-card-per-turn limit, IP costs, and ZONE targeting rules before a card resolves.【F:src/mvp/engine.ts†L71-L99】
- **Playing a card:** `playCard` removes the card from hand, deducts IP, logs the play, and calls `resolve` to apply effects.【F:src/mvp/engine.ts†L101-L215】
- **Effect resolution:** `resolve` relies on `applyEffectsMvp` to adjust IP, Truth, and pressure while tracking capture metadata for end-of-turn summaries.【F:src/mvp/engine.ts†L157-L215】【F:src/engine/applyEffects-mvp.ts†L53-L157】
- **Turn end:** Discards are processed with the “first one free, extras cost 1 IP each” rule, combo hooks are evaluated, logs are appended, and control passes to the other player.【F:src/mvp/engine.ts†L217-L348】
- **Victory checks:** `winCheck` confirms state, Truth, and IP victory thresholds after every turn wrap-up, matching the MVP specification but using 95%/5% Truth buffers for runtime tuning.【F:src/mvp/engine.ts†L367-L395】【F:DESIGN_DOC_MVP.md†L55-L63】

### Campaign event manager and state bonuses
The runtime promotes story arcs and state-themed bonuses during the same end-of-round bookkeeping. When a campaign event fires, `updateCampaignArcProgress` copies the existing `activeCampaignArcs`, marks the matching arc as active or completed based on the event’s `resolution`, queues the next chapter by seeding `pendingArcEvents`, and emits a 📖 log entry for the Extra Edition.【F:src/hooks/useGameState.ts†L204-L290】 Both lists live directly on the game state, so new sessions start with empty `activeCampaignArcs`/`pendingArcEvents` arrays and persist them in saves until the finale event clears the queue.【F:src/hooks/useGameState.ts†L1320-L1494】【F:src/hooks/useGameState.ts†L3152-L3154】 The event manager then pulls from `pendingArcEvents` before sampling random tabloids, guaranteeing that forced chapters override RNG once they are unlocked.【F:src/hooks/useGameState.ts†L293-L320】

State-themed bonuses use the same round gate. Each new round re-seeds the deterministic `stateRoundSeed`, builds a snapshot of existing bonuses, and only re-rolls assignments if the round counter has advanced.【F:src/hooks/useGameState.ts†L1483-L1494】【F:src/hooks/useGameState.ts†L2598-L2635】 `assignStateBonuses` hashes the base seed with the round number, reuses any `existingBonuses` for stability, and otherwise drafts weighted effects and anomaly events from each state’s themed pool while recording separate pressure/IP/Truth adjustments for human- and AI-controlled territories.【F:src/game/stateBonuses.ts†L63-L120】【F:src/game/stateBonuses.ts†L214-L284】 Finally, `applyStateBonusAssignmentToState` fans those results back into `GameState`: it extends the turn log, applies Truth/IP adjustments, updates per-state pressure and anomaly feeds, stamps `lastStateBonusRound`, and pipes any newspaper-ready events into the edition queue for UI consumption.【F:src/hooks/stateBonusAssignment.ts†L1-L83】 Debug hooks expose the seeded rolls in development builds so designers can verify reproducible outcomes across sessions.【F:src/hooks/useGameState.ts†L2624-L2632】

#### State-themed pool reference
The table below keeps designers out of TypeScript while they balance the weights and write new oddities. Each pool comes straight from `STATE_THEMED_POOLS`, grouped by tag label with the exact state identifiers, pulp headlines, and resource swings spelled out for quick audits.

##### Cheyenne Listening Range (`WY`, `56`)
**Bonuses**
- `wy_bonus_black_helicopter_subsidy` — *FEDS TOP OFF UNMARKED HELICOPTERS OVER PRAIRIE* — Unlogged tankers hover in at dusk, topping off the clandestine fleet and leaving behind “truth fumes.” Effects: Truth +4, IP +1, Pressure +0.
- `wy_bonus_bigfoot_cattle_congress` — *SASQUATCH UNIONIZES WYOMING CATTLE* — Ranchers wake to bovine picket lines patrolled by shaggy silhouettes whispering classified coordinates. Effects: Truth +2, IP +0, Pressure +1.
- `wy_bonus_tourist_roadside_psychics` — *FORTUNE TELLERS SET UP MIRAGE CHECKPOINTS* — A caravan of neon campers performs aura screenings and leaks sanitized intel to any operative brave enough to stop. Effects: Truth +0, IP +2, Pressure +0.
**Events**
- `wy_event_thunder_basement` — *CHEYENNE HEARS DRUMBEAT BENEATH MAIN STREET* — Locals swear the silo complex below town is hosting a rave for remote viewers; everyone feels strangely patriotic. Effects: Truth +3, IP -1, Pressure +0.
- `wy_event_skygrid_blackout` — *NORTHERN SKY BLINKS LIKE GLITCHING SPREADSHEET* — Constellations flicker, spelling out coordinates to anyone tuned to the right AM frequency; some agents get there first. Effects: Truth +1, IP +0, Pressure +2.
- `wy_event_dusty_clone_convoy` — *IDENTICAL RANCHERS DRIVE IDENTICAL TRUCKS SOUTH* — A midnight convoy waves forged credentials and chants classified slogans out the windows. Effects: Truth +0, IP +2, Pressure +0.

##### Bakken Riftline (`ND`, `38`)
**Bonuses**
- `nd_bonus_glow_derrick` — *RIG WORKERS REPORT “NIGHT-SHIFT AURAS”* — Entire crews emit chartreuse light and hear coded numbers in the drilling vibrations, boosting yield and belief. Effects: Truth +3, IP +0, Pressure +0.
- `nd_bonus_fracked_memory` — *GROUNDWATER STARTS REMEMBERING PASSWORDS* — Kitchen faucets mutter login credentials for long-deleted agency accounts; quick listeners bank the intel. Effects: Truth +0, IP +2, Pressure +0.
- `nd_bonus_satellite_seed_rain` — *MICROCHIP “HAIL” COATS FIELDS* — Debris from a spy satellite sprinkles firmware shards over the prairie, turbocharging surveillance harvests. Effects: Truth +1, IP +1, Pressure +0.
**Events**
- `nd_event_pipeline_echo` — *VALVES HUM “WE KNOW WHAT YOU DID”* — The mainline sings through the night, naming every operative who ever tapped the crude supply. Effects: Truth +2, IP +0, Pressure +0.
- `nd_event_frozen_drone_yard` — *HUNDREDS OF DRONES FREEZE MID-TAKEOFF* — A winter microburst flash-freezes classified deliveries; whoever thaws them first gets the manifests. Effects: Truth +0, IP +2, Pressure +0.
- `nd_event_williston_time_loop` — *DINER CLOCKS RUN BACKWARDS FOR ONE SHIFT* — Analysts rerun the same intel drop three times while skeptics wake up already convinced. Effects: Truth +1, IP +0, Pressure +1.

##### Florida Manifold (`FL`, `12`)
**Bonuses**
- `fl_bonus_airboat_numbers` — *EVERGLADES TOUR GUIDE BROADCASTS PRIME NUMBERS* — Night rides pipe coded instructions through static loudspeakers synced with swamp fireflies. Effects: Truth +2, IP +1, Pressure +0.
- `fl_bonus_motel_oracle` — *EXIT-7 MOTEL CLERK TELLS FUTURE, TAKES CASH* — Check-in ritual unlocks glimpses of next week’s cover-up while management insists he just “reads people well.” Effects: Truth +0, IP +3, Pressure +0.
- `fl_bonus_tourist_ufo_ferry` — *PANHANDLE FERRY CROSSES TRIANGLE IN 12 MINUTES* — The route slices through a geometry glitch, catapulting operatives ahead of schedule and straight into soft targets. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `fl_event_reptilian_press_conference` — *STATE CAPITOL MICROPHONES HISS IN REPTO-SPEAK* — A televised briefing devolves into forked-tongue revelations before the feed mysteriously burns out. Effects: Truth +4, IP -1, Pressure +0.
- `fl_event_themepark_blackout` — *MASCOTS FREEZE, EYES GLOW BLUE* — Animatronics lock into a perfect salute, projecting classified coordinates on the nearest rollercoaster. Effects: Truth +0, IP +2, Pressure +0.
- `fl_event_citrus_psychic_bloom` — *ORANGE GROVES BLOSSOM WITH WIFI SIGNALS* — Harvest crews record hyper-clear dreams after squeezing the crop while rivals scramble to jam the orchard. Effects: Truth +2, IP +0, Pressure +1.

##### Nevada Neon Occult (`NV`, `32`)
**Bonuses**
- `nv_bonus_slot_machine_divination` — *JACKPOTS SPELL OUT AGENCY CALL SIGNS* — High rollers pull triple oracle-7s and leave with more intel than chips as pit bosses comp the truth drinks. Effects: Truth +2, IP +1, Pressure +0.
- `nv_bonus_desert_zeppelin_drop` — *BLIMP RAINS POLYGRAPH BALLOONS* — The night sky fills with helium truth orbs gently landing on suburban lawns, each a working interrogation rig. Effects: Truth +3, IP +0, Pressure +0.
- `nv_bonus_area51_clearance_sale` — *SURPLUS HANGAR HOLDS “CLASSIFIED GARAGE SALE”* — Retired engineers dump prototypes at discount rates; savvy operatives snag cloaking blankets and EMP clipboards. Effects: Truth +0, IP +3, Pressure +0.
**Events**
- `nv_event_mirrorstorm` — *CASINO MIRRORS REFLECT ALTERNATE TIMELINE* — Reflections show tomorrow’s scandals; surveillance teams race to photograph the future before it blinks out. Effects: Truth +3, IP +0, Pressure +0.
- `nv_event_coyote_oracle` — *PACK OF COYOTES HOWLS ENCRYPTED WEBSITES* — Desert radios light up with root passwords as field teams scramble to transcribe the chorus. Effects: Truth +0, IP +2, Pressure +0.
- `nv_event_phantom_table_games` — *DEALERS SERVE INVISIBLE HIGH ROLLERS* — Roulette wheels spin themselves, landing on coordinates only insiders recognize. Effects: Truth +1, IP +0, Pressure +1.

##### Jersey Megacorridor (`NJ`, `34`)
**Bonuses**
- `nj_bonus_turnpike_cb_rally` — *TRUCKERS JAM CHANNEL 19 WITH REDACTED RECIPES* — Rest stops hum with rigs swapping hush-hush intelligence disguised as slow-cooker gossip. Effects: Truth +2, IP +1, Pressure +0.
- `nj_bonus_pharma_samples` — *REPS DUMP UNLABELED CASES AT WAREHOUSE B* — Overstock shipments hide morale boosters and memory serums that operatives requisition before the audit. Effects: Truth +0, IP +3, Pressure +0.
- `nj_bonus_pine_barrens_signal` — *BLUE FLAMES SPELL OUT ROUTING NUMBERS* — Night hikers watch will-o’-wisps render clandestine bank transfers in the treetops. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `nj_event_turnpike_time_fog` — *EXIT 12 COVERED IN CLOCK-STOPPING MIST* — A luminescent fog halts time, letting operatives reposition surveillance vans in reversed traffic. Effects: Truth +2, IP +0, Pressure +0.
- `nj_event_reststop_flashmob` — *JANITORS BREAK INTO CHOREOGRAPHED LEAK* — Molly Pitcher staff perform a whistleblower routine while drivers record and upload the scoop. Effects: Truth +1, IP +2, Pressure +0.
- `nj_event_gwb_lightcode` — *GEORGE WASHINGTON BRIDGE BLINKS BINARY* — An 8-bit aurora uploads clearance keys to anyone stuck in traffic with a dashcam. Effects: Truth +0, IP +0, Pressure +2.

##### Pacific Quantum Coast (`CA`, `WA`, `OR`, `AK`, `HI`)
**Bonuses**
- `pacific_bonus_tsunami_briefing_buoys` — *PACIFIC BUOY FLASHES TOP-SECRET WAVE ALERTS* — Buoy lights blink clearance codes in Morse while surfers nod solemnly and paddle toward the anomaly. Effects: Truth +2, IP +1, Pressure +0.
- `pacific_bonus_seaweed_encryption_wrack` — *KELP WASHES UP SPELLED LIKE FILEPATHS* — Tidal mats arrange into login prompts and satellite keys before the tide rips them away. Effects: Truth +0, IP +2, Pressure +0.
- `pacific_bonus_volcano_listening_post` — *KILAUEA STEAM RUMORS MATCH PENTAGON MINUTES* — Lava vents sigh transcripts of classified hearings while agents roast marshmallows and take notes. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `pacific_event_cascadia_sync_quake` — *EARTHQUAKE VIBRATES EXACTLY AT 440 HZ* — Windows rattle in tune from Seattle to San Diego, unlocking archives keyed to resonant desk drawers. Effects: Truth +2, IP +1, Pressure +0.
- `pacific_event_aurora_bunker_ferry` — *ALASKAN FERRY DOCKS INSIDE SECRET GLACIER HANGAR* — A sudden aurora opens the glacier wall, and passengers disembark into a cache of surplus thermal bugs. Effects: Truth +0, IP +2, Pressure +0.
- `pacific_event_pacific_whale_courier` — *MIGRATING WHALES TAP SOS IN SUBMARINE HULLS* — Pods thump hulls with vault coordinates before sounding deep-cover horns. Effects: Truth +1, IP +0, Pressure +1.

##### Four Corners Echo (`AZ`, `UT`, `CO`, `NM`)
**Bonuses**
- `fourcorners_bonus_monument_projection` — *DESERT ARCHES PROJECT CLASSIFIED POWERPOINT* — Sunset light refracts through sandstone, finishing government briefings minus the reptile roll call. Effects: Truth +2, IP +1, Pressure +0.
- `fourcorners_bonus_labyrinth_helicoid` — *UFO TOURISTS FORM PERFECT MAZE AROUND AREA RIDGE* — Pilgrims trace spirals in red dust, charging buried antennas that beam metadata into waiting briefcases. Effects: Truth +0, IP +2, Pressure +0.
- `fourcorners_bonus_hot_spring_debrief` — *MOUNTAIN SPA OPENS “CLASSIFIED MINERAL” WING* — Agents in towels trade debriefs while geysers hiss encryption keys across the plateau. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `fourcorners_event_chaco_time_beacon` — *ANCIENT PUEBLO KIVA LIGHTS UP LIKE SERVER ROOM* — Stone walls pulse fiber-optic colors, syncing satellite passes and extending mission clocks. Effects: Truth +2, IP +1, Pressure +0.
- `fourcorners_event_canyon_echo_court` — *JUDGES HOLD SECRET HEARING IN SLOT CANYON* — Sealed proceedings echo back stamped verdicts to operatives waiting on the rim. Effects: Truth +0, IP +2, Pressure +0.
- `fourcorners_event_balloon_vortex_derby` — *FESTIVAL BALLOONS SPIN INTO PERFECT SURVEILLANCE ARRAY* — Hot-air pilots salute and broadcast raw reconnaissance straight into auditor holding pens. Effects: Truth +1, IP +0, Pressure +1.

##### Mountain Thunderline (`MT`, `ID`, `WY`)
**Bonuses**
- `mountain_bonus_powder_cache_caravan` — *SNOWCATS DELIVER “AVALANCHE PREPAREDNESS” CRATES* — Mountain patrols haul unmarked containers uphill, leaving spare dossiers beside the trail mix. Effects: Truth +0, IP +2, Pressure +0.
- `mountain_bonus_sasquatch_zoning_board` — *FOREST COUNCIL MEETING INCLUDES VERY TALL “RANGER”* — The board approves clandestine antenna farms with a unanimous grunt and hairy endorsement. Effects: Truth +2, IP +0, Pressure +1.
- `mountain_bonus_idaho_tater_array` — *POTATO FARMS AIM SPUD-POWERED RADARS SKYWARD* — Irrigation rigs become spiral antennas that bake truth signals into every casserole. Effects: Truth +1, IP +1, Pressure +0.
**Events**
- `mountain_event_grizzly_signal_drill` — *RANGERS TRAIN BEARS TO DELIVER FLASH DRIVES* — Tagged grizzlies stroll into operations tents with USB collars, dropping undeniable footage. Effects: Truth +2, IP +0, Pressure +0.
- `mountain_event_timberline_aurora` — *NORTHERN LIGHTS DESCEND TO SKI LODGE LOBBY* — Chandeliers glow green, aligning satphone channels so analysts siphon premium bandwidth all night. Effects: Truth +0, IP +2, Pressure +0.
- `mountain_event_militia_podcast_marathon` — *TWENTY-FOUR HOURS OF “JUST ASKING QUESTIONS”* — Prepper broadcasters forget to mute the encrypted channel, gifting raw intel and a cult of auditors. Effects: Truth +1, IP +0, Pressure +1.

##### High Plains Number Run (`ND`, `SD`, `NE`, `KS`)
**Bonuses**
- `plains_bonus_wheatfield_lasergrid` — *COMBINES CUT PERFECT QR CODES INTO CROPS* — Satellite flyovers decode glowing circuits and forward supply manifests straight into the bunker. Effects: Truth +0, IP +2, Pressure +0.
- `plains_bonus_tornado_spotter_network` — *STORM CHASERS SHARE LIVE UFO ROSTER* — Volunteer spotters triangulate both cyclones and clandestine drop-points, faxing coordinates from pickup dashboards. Effects: Truth +2, IP +0, Pressure +1.
- `plains_bonus_grain_elevator_townhall` — *SILO LOUDSPEAKERS HOST MIDNIGHT FOIA READING* — County clerks project censored documents across the prairie while locals clap politely. Effects: Truth +1, IP +1, Pressure +0.
**Events**
- `plains_event_blacksite_tractor_pull` — *COUNTY FAIR ANNOUNCES “CLASSIFIED” WEIGHT CLASS* — Hydraulic beasts drag mystery cargo across the arena, flinging open cases of leverage at the finish line. Effects: Truth +0, IP +2, Pressure +0.
- `plains_event_floodlight_migration` — *MILLIONS OF FIREFLIES FORM TOP-SECRET FLIGHTPATH* — The glowing swarm charts hidden safehouses from Fargo to Topeka. Effects: Truth +2, IP +0, Pressure +0.
- `plains_event_cornfield_conference_call` — *IRRIGATION PIVOTS BROADCAST 12-WAY COVER-UP* — Sprinkler arms click like switchboards, patching together decision-makers who forget the county is listening. Effects: Truth +1, IP +0, Pressure +1.

##### Heartland Feedback Loop (`IA`, `MO`, `IL`, `IN`, `OH`)
**Bonuses**
- `heartland_bonus_mississippi_barge_brief` — *BARGES FORM FLOATING CLASSIFIED CONVOY* — Towboats sync horns in Morse, ferrying sealed crates of leverage upriver while reporters wave. Effects: Truth +2, IP +1, Pressure +0.
- `heartland_bonus_factory_breakroom_tipline` — *AUTOMAKERS INSTALL “ANONYMOUS GOSSIP” BUTTON* — Coffee machines dispense latte art featuring classified schematics everyone pretends is foam. Effects: Truth +0, IP +2, Pressure +0.
- `heartland_bonus_rail_yard_gospel_choir` — *TRAIN WORKERS SING SCHEDULES TO HEAVEN* — Harmony lines reveal troop movements and caucus times; recordings sell out before the encore. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `heartland_event_siloed_votes_recount` — *COUNTY FAIR BLUE-RIBBON BOOTHS DEMAND AUDIT* — Prize pies hide ballots exposing clandestine caucus tallies, forcing bureaucrats to eat humble pie. Effects: Truth +2, IP +0, Pressure +0.
- `heartland_event_rustbelt_lightning_strike` — *ABANDONED FACTORY TAKES DIRECT HIT, BOOTS BACK UP* — Machines whir alive, printing decades of sealed expense reports while tourists film the sparks. Effects: Truth +0, IP +2, Pressure +0.
- `heartland_event_cornbelt_call_in_show` — *LATE-NIGHT AM HOST GIVES OUT PARKING GARAGE KEYS* — Listeners dial in, receive directions to hush-hush meetings, and arrive before the spin doctors. Effects: Truth +1, IP +0, Pressure +1.

##### Great Lakes Signal (`MI`, `WI`, `MN`)
**Bonuses**
- `lakes_bonus_ice_shanty_router` — *FROZEN LAKES HOST SECRET WI-FI HOTSPOTS* — Shanties glow midnight blue, bouncing encrypted podcasts to every operative willing to bait a hole. Effects: Truth +0, IP +2, Pressure +0.
- `lakes_bonus_supersupper_briefing` — *FRIDAY FISH FRY ANNOUNCES “MYSTERY FILET SPECIAL”* — Community halls fry cod while a back-room projector spills sealed whistleblower footage. Effects: Truth +2, IP +0, Pressure +0.
- `lakes_bonus_ore_freighter_maildrop` — *LAKE BOAT DUMPS LOCKER OF “MISPLACED” POUCHES* — Waterproof satchels bob ashore, each holding pristine intel wrapped in flannel napkins. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `lakes_event_aurora_coast_guard` — *NORTHERN LIGHTS TURN CUTTERS INTO BILLBOARDS* — Patrol ships glow neon, displaying tomorrow’s classified routes to every binocular on the beach. Effects: Truth +2, IP +1, Pressure +0.
- `lakes_event_superior_mist_memory` — *DAWN FOG REPLAYS DELETED SECURITY FOOTAGE* — Mist screens show reruns of buried scandals until the sun dissolves the evidence. Effects: Truth +2, IP +0, Pressure +0.
- `lakes_event_paulbunyan_press_gang` — *TWINS LEGEND RECRUITS OPERATIVES WITH AXE-INSPIRED NDA* — A giant mascot leads a halftime parade into a secure locker room loaded with press badges. Effects: Truth +0, IP +2, Pressure +0.

##### Gulf Surge Protocol (`TX`, `LA`, `MS`, `AL`, `FL`)
**Bonuses**
- `gulf_bonus_refinery_confessional` — *OIL PLANT INSTALLS “SAFETY SUGGESTION” POD* — The booth records anonymous grievances that just happen to include off-book shipment ledgers. Effects: Truth +0, IP +3, Pressure +0.
- `gulf_bonus_mardi_gras_mask_drop` — *PARADE KREWE THROWS CLASSIFIED LENTICULARS* — Throws include holographic dossiers and hush-money beads; catchers suddenly remember every off-shore account. Effects: Truth +2, IP +0, Pressure +1.
- `gulf_bonus_shrimp_boat_sensor_net` — *TRAWLERS DRAG MILES OF BUGGED NETTING* — Every catch includes miniature black boxes chirping intercepted cabinet chatter over the deck speakers. Effects: Truth +1, IP +1, Pressure +0.
**Events**
- `gulf_event_hurricane_truthsirens` — *EVACUATION SIRENS BROADCAST BUDGET CUT SCANDAL* — Storm sirens belt a confession about siphoned relief funds; evacuees record before power returns. Effects: Truth +3, IP +0, Pressure +0.
- `gulf_event_oilrig_lightning_rodeo` — *PLATFORMS COMPETE FOR BIGGEST STATIC DISCHARGE* — Blazing arcs brand the night sky with coordinates to supply caches hidden along the coastline. Effects: Truth +0, IP +2, Pressure +0.
- `gulf_event_gator_press_pool` — *ALLIGATORS WEAR MEDIA BADGES AT SWAMP BRIEFING* — The reptiles record everything on waterproof lapel cams and dump it to an “anonymous” leak drive. Effects: Truth +1, IP +0, Pressure +1.

##### Appalachian Whisper Network (`GA`, `SC`, `NC`, `TN`, `KY`, `VA`, `WV`)
**Bonuses**
- `appalachian_bonus_moonshine_modems` — *DISTILLERIES BOIL OFF ENCRYPTED BROADCASTS* — Copper coils hum with dial-up shrieks that decrypt into lists of corrupt subcommittees. Effects: Truth +2, IP +1, Pressure +0.
- `appalachian_bonus_coaltrain_couriers` — *FREIGHT CREWS PASS ENVELOPES BETWEEN TUNNELS* — Each tunnel handoff drops untraceable intel packets into lunch pails bound for sympathetic clerks. Effects: Truth +0, IP +2, Pressure +0.
- `appalachian_bonus_ballad_broadcast` — *FIDDLE JAM DOUBLES AS DECLASSIFIED SING-ALONG* — Local radio airs haunting harmonies that sneak truth into every porch conversation. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `appalachian_event_blue_ridge_bugbear` — *CRYPTID CRASHES COUNTY COMMISSION LIVE STREAM* — A mossy witness drops binders of receipts then vanishes, leaving viewers with irrefutable screen grabs. Effects: Truth +3, IP +0, Pressure +0.
- `appalachian_event_thunderhead_signal` — *RIDGETOP STORM CLOUD BEAMS BLUEPRINTS IN LIGHTNING* — Bolts etch schematics across valley floors, empowering field teams overnight. Effects: Truth +0, IP +2, Pressure +0.
- `appalachian_event_trail_of_leaks` — *HIKERS FIND QR CODES BURNED INTO SHELTER LOGBOOKS* — Every waypoint unlocks a dead drop with truth-saturated ration bars and unredacted memos. Effects: Truth +1, IP +0, Pressure +1.

##### Capital Corridor Coverup (`DC`, `MD`, `DE`, `PA`, `NJ`)
**Bonuses**
- `capital_bonus_rotunda_soundcheck` — *CAPITOL TOUR GUIDE TESTS MIC WITH SECRET BUDGET LINE* — The echoing dome transmits itemized slush funds to anyone hiding behind the velvet rope. Effects: Truth +2, IP +1, Pressure +0.
- `capital_bonus_beltway_badge_swap` — *COMMUTERS TRADE LANYARDS DURING GRIDLOCK* — Standstill traffic turns into a clearance bazaar arming operatives with high-value visitor passes. Effects: Truth +0, IP +2, Pressure +0.
- `capital_bonus_boardwalk_blackmail` — *ATLANTIC CITY ARCADE DISPENSES “SOUVENIR” DOSSIERS* — Skee-ball jackpots spit sealed envelopes stuffed with deposition transcripts. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `capital_event_smithsonian_reclassification` — *MUSEUM RELABELS UFO AS “ARTIFACT OF BUREAUCRACY”* — The new placard links to a “mistakenly” public archive of coverups and hush payments. Effects: Truth +3, IP +0, Pressure +0.
- `capital_event_delaware_shell_company_gala` — *WILMINGTON HOSTS INVISIBLE DONOR BANQUET* — Projected guests sign receipts that print midair before dropping onto every plate. Effects: Truth +0, IP +2, Pressure +0.
- `capital_event_liberty_bell_push_notification` — *BELL CRACK FLASHES BREAKING NEWS ALERTS* — Every camera flash triggers headlines about suppressed hearings, sending spin doctors sprinting. Effects: Truth +1, IP +0, Pressure +1.

##### Empire Codex Circuit (`NY`, `MA`, `CT`, `RI`)
**Bonuses**
- `empire_bonus_subway_manifesto` — *COMMUTERS HANDED FOLDERS LABELED “NOT FOR MEDIA”* — Rush-hour trains flood with pamphlets outlining clandestine mergers and reptilian board meetings. Effects: Truth +2, IP +1, Pressure +0.
- `empire_bonus_ivy_league_footnote` — *FOOTNOTES IN JOURNAL REVEAL CLASSIFIED RESEARCH* — Academic citations hyperlink directly to redacted memos; grad students mirror the goods overnight. Effects: Truth +2, IP +0, Pressure +0.
- `empire_bonus_harbor_beacon_swap` — *STATEN ISLAND FERRY LIGHT BLINKS STOCK TICKERS* — Lighthouses coordinate to flash insider trading alerts disguised as safety drills. Effects: Truth +0, IP +2, Pressure +0.
**Events**
- `empire_event_broadway_truth_revue` — *MATINEE CAST BREAKS INTO CLASSIFIED SHOWTUNE* — Spotlights reveal dossier photocopies raining from the rafters as ushers pass out NDAs. Effects: Truth +3, IP +0, Pressure +0.
- `empire_event_boston_telex_regatta` — *ROWERS TOW FLOATING PRINTERS DOWN CHARLES* — Inkjet wakes spit oversight transcripts, giving every spectator a damp scoop. Effects: Truth +0, IP +2, Pressure +0.
- `empire_event_ri_mob_family_reunion` — *FAMILY REUNION REGISTERS AS INTERNATIONAL TREATY* — Pentagonal tables release scent-activated truth serum across the banquet hall. Effects: Truth +1, IP +0, Pressure +1.

##### Northern Rumor Coast (`ME`, `NH`, `VT`)
**Bonuses**
- `rumor_bonus_lobster_wiretap_coop` — *TRAPS PING SUBMARINE FREQUENCIES* — Boats haul crates of shell-bound transmitters repeating clandestine coastal agreements. Effects: Truth +2, IP +1, Pressure +0.
- `rumor_bonus_maple_syrup_memory` — *SUGAR SHACK BARRELS STORE CLASSIFIED AUDIO* — Each pour leaks sweet recordings of closed-door caucuses; breakfast crowds sip and nod. Effects: Truth +2, IP +0, Pressure +0.
- `rumor_bonus_white_mountain_retreat` — *SKI LODGE OFFERS “ANONYMIZED” PRESS PACKAGES* — Guests receive unmarked dossiers with their lift tickets, plus cocoa branded with riddles. Effects: Truth +0, IP +2, Pressure +0.
**Events**
- `rumor_event_portland_foghorn_archive` — *HARBOR FOGHORN PLAYS BACK CONGRESSIONAL VOICEMAIL* — Mournful blasts replay apology messages from senators trying to bury a deep-state audit. Effects: Truth +3, IP +0, Pressure +0.
- `rumor_event_green_mountain_flash_mob` — *FARMERS MARKET FREEZES, PERFORMS DATA DROP* — Vendors spell encryption keys with heirloom carrots before handing over the receipts. Effects: Truth +0, IP +2, Pressure +0.
- `rumor_event_whitecap_signal_boat` — *SAILBOARDS PAINT WAKE MESSAGES IN BIOLUMINESCENCE* — Glowing trails encode the next leak drop, broadcast worldwide before sunrise. Effects: Truth +1, IP +0, Pressure +1.

##### Ozark Veil Syndicate (`AR`, `OK`, `MO`)
**Bonuses**
- `ozark_bonus_crystal_radio_cavern` — *CAVE CHOIR BROADCASTS FROM STALACTITE ANTENNAS* — Echoes channel truth through limestone, handing operatives perfect transcripts disguised as souvenir mixtapes. Effects: Truth +2, IP +1, Pressure +0.
- `ozark_bonus_riverboat_intel_buffet` — *PADDLEWHEEL CASINO RUNS “UNMARKED DOCUMENT” CARVING STATION* — Buffet trays hide microfiche between ribs and coleslaw; diners leave sticky-fingered and briefed. Effects: Truth +0, IP +2, Pressure +0.
- `ozark_bonus_thunderbird_tailgate` — *HIGHWAY REST STOP HOSTS CRYPTID FAN CLUB* — Enthusiasts swap Polaroids with embedded map overlays, fueling field teams with protein and intel. Effects: Truth +1, IP +0, Pressure +1.
**Events**
- `ozark_event_plateau_blackout` — *POWER GRID CUTS OUT DURING GOVERNOR’S BALL* — Chandeliers flicker Morse code revealing slush funds while guests slow-dance and record. Effects: Truth +2, IP +0, Pressure +0.
- `ozark_event_route66_data_parade` — *CLASSIC CARS STREAM WIFI FROM TAILFINS* — Chrome convertibles blast an unfiltered data dump down the highway as confetti spells login credentials. Effects: Truth +0, IP +2, Pressure +0.
- `ozark_event_bass_fishing_press_conference` — *ANGLERS HOIST MICROPHONES INSTEAD OF TROPHIES* — Winning teams reel in suitcases of deposition audio and hand copies to every bait-shop journalist. Effects: Truth +1, IP +0, Pressure +1.

### Catch-up swing math
`computeTurnIpIncome` now layers a swing-tax/catch-up module on top of the existing reserve maintenance. The routine compares the active player's reserves and state holdings to their opponent and scores two separate gaps: IP and controlled states. Full steps beyond the grace windows generate modifiers according to the piecewise formula

```
swingTax   = clamp₀⁴( floor(max(Δip - 10, 0) / 5) + max(Δstates - 1, 0) )
catchUp    = clamp₀⁴( floor(max(-Δip - 10, 0) / 5) + max(-Δstates - 1, 0) )
netIncome  = max(0, 5 + controlledStates - swingTax + catchUp)
```

where `Δip = playerIp - opponentIp` and `Δstates = playerStates - opponentStates`. This keeps small leads untouched, taxes runaway economies by up to 4 IP per turn, and grants the same ceiling as a comeback bonus when significantly behind.【F:src/mvp/engine.ts†L56-L207】

#### FAQ: Why did my income swing this turn?
- **You were ahead:** A positive `Δip` or `Δstates` beyond the grace windows triggers a swing tax. The log entry spells out the lead size so the reason is transparent.【F:src/mvp/engine.ts†L213-L272】
- **You were behind:** Large deficits flip the same magnitude into a catch-up bonus, letting the underdog earn up to +4 IP until parity is restored.【F:src/mvp/engine.ts†L213-L272】

## MVP card schema
MVP cards belong to the Truth or Government factions and are typed as ATTACK, MEDIA, or ZONE with rarities from common to legendary. The baseline design restricts each type to a concise whitelist of effect keys and ties costs to a rarity table.【F:DESIGN_DOC_MVP.md†L25-L178】【F:src/rules/mvp.ts†L1-L60】 The runtime validator codifies the schema:

- **Effects:** `EffectsATTACK`, `EffectsMEDIA`, and `EffectsZONE` narrow MVP cards to the permitted keys (`ipDelta.opponent` plus optional `discardOpponent`, `truthDelta`, or `pressureDelta`).【F:src/mvp/validator.ts†L5-L22】
- **Normalization:** `repairToMVP` coerces faction/type casing, fills missing IDs and names, clamps numeric ranges, adds default ZONE targets, and generates standard rules text while recording change logs.【F:src/mvp/validator.ts†L324-L395】
- **Validation:** `validateCardMVP` enforces factions, types, rarities, baseline costs, and per-type effect constraints before a card is accepted into decks.【F:src/mvp/validator.ts†L398-L458】
- **Runtime resolution:** `applyEffectsMvp` translates the sanitized card into gameplay effects—deducting IP and forcing discards for ATTACKs, adjusting the shared Truth meter for MEDIA, or adding pressure and checking captures for ZONE cards.【F:src/engine/applyEffects-mvp.ts†L53-L155】

### Cost baseline
`MVP_COST_TABLE` ties each type/rarity pair to a canonical IP cost. `expectedCost` is shared by the validator and database loader so card definitions that drift from the baseline are corrected automatically.【F:src/rules/mvp.ts†L48-L60】【F:src/mvp/validator.ts†L363-L393】

## State map and territorial control
`src/data/usaStates.ts` enumerates every state with base IP income, defense ratings, and thematic bonuses, plus helpers for lookups and occupation labels. These values populate the `stateDefense` map that ZONE cards challenge and govern income bonuses when `startTurn` tallies controlled states.【F:src/data/usaStates.ts†L1-L178】【F:src/mvp/engine.ts†L52-L58】 Helper utilities such as `buildOccupierLabel` and `setStateOccupation` standardize capture messaging, ensuring UI layers can display faction-flavored control markers.【F:src/data/usaStates.ts†L115-L169】

### Hotspot lifecycle and map VFX
Hotspots originate from end-of-turn tabloids and immediately mark their host state as contested: defense rises, the Truth reward is logged, and the UI posts a “resolve me” badge. While a hotspot is active, the Enhanced USA Map watches for three inputs:

1. **Activation pulse** – the first frame after a hotspot spawns pings `CardAnimationLayer`, which queues the paranormal “flying saucer” sprite to traverse the targeted state. With full effects enabled, the UFO animates across the board and leaves a neon vapor trail; reduced-motion mode swaps this for a single-frame overlay and audio ping so photosensitive players still receive clear notice without camera movement.
2. **State glow** – the owning map tile flips to a green phosphorescent outline as long as the hotspot flag is set. This glow persists for both animation profiles; in reduced-motion mode the glow fades in instantly instead of pulsing.
3. **Resolution reset** – when either faction clears the hotspot, the glow, animation queues, and boosted defense are torn down, and the state reverts to its regular control palette. The animation stack also emits a final “resolved” flash (again single-frame in reduced-motion mode) to confirm the payout.

These hooks let designers adjust paranormal pacing without rewriting the map: the lifecycle is just `spawn → animate → glow → resolve`, with each phase mirrored by a low-motion equivalent so accessibility settings never hide critical information.

## Combo engine integration
After discards resolve, `endTurn` invokes `evaluateCombos` to detect synergies, logs any triggered definitions, applies rewards (e.g., extra IP) through `applyComboRewards`, and optionally fires VFX callbacks controlled by `ComboOptions`. The resulting `ComboSummary` is surfaced in the turn log for UI consumption.【F:src/mvp/engine.ts†L289-L333】 Components such as the main game page respond to these events with particle effects and SFX when a combo grants bonus resources.【F:src/pages/Index.tsx†L508-L544】

### State combination bonuses
The state-combination manager aggregates multiple passive bonuses in addition to each combo’s printed IP stipend. Economic powerhouses now deliver flat IP surges (`Wall Street Empire` adds +2 IP each turn), while energy and border cartels scale income per controlled or neutral territory.【F:src/data/stateCombinations.ts†L225-L288】 Military synergies extend beyond IP: `Military Triangle` injects +1 IP damage into every player ATTACK card, `Nuclear Triad` grants +1 defense to every player-held state, and `Midwest Backbone` trims 1 pressure from each AI ZONE strike against liberated regions.【F:src/data/stateCombinations.ts†L225-L340】【F:src/systems/cardResolution.ts†L230-L330】 The UI surfaces the running totals so players can see their media cost discounts, extra draws, flat IP income, and defensive perks at a glance.【F:src/components/game/StateCombinationsPanel.tsx†L13-L116】

## Card data normalization pipeline
The card database wraps multiple sources behind `CARD_DATABASE`, loading fallback MVP cards immediately, attempting to import the core set asynchronously, and merging extension packs. Every card flows through `repairToMVP` and `validateCardMVP` during ingestion so gameplay always operates on sanitized MVP-compliant records. Normalization warnings and cost adjustments are logged in development builds for quick author feedback.【F:src/data/cardDatabase.ts†L1-L200】 Extension authors can rely on this pipeline to auto-correct casing, default targets, and baseline costs without hand-tuning individual files.

## Audio systems
The `useAudio` hook centralizes music playlists, SFX loading, and playback APIs. It loads thematic track lists for the start menu, faction selection, in-game loops, and end credits, while registering a library of sound keys for UI and event feedback.【F:src/hooks/useAudio.ts†L171-L268】 Notable integration points include:

- **Menu and UI actions:** Start screen buttons and game menus trigger the shared `click` key, while hover states reuse the quieter `lightClick` variant to avoid audio fatigue.【F:src/components/start/StartScreen.tsx†L59-L108】【F:src/components/game/EnhancedUSAMap.tsx†L237-L263】
- **Gameplay feedback:** The main game page plays `cardPlay`, `flash`, `turnEnd`, `cardDraw`, `newspaper`, `state-capture`, `hover`, and `error` cues during card deployment, Truth surges, turn transitions, and targeting workflows.【F:src/pages/Index.tsx†L919-L1025】【F:src/pages/Index.tsx†L520-L544】
- **Advanced effects:** `CardAnimationLayer` triggers paranormal SFX (`ufo-elvis`, `cryptid-rumble`) when optional overlays fire, and `TabloidNewspaperV2` plays `radio-static` when fresh sightings enter the log.【F:src/components/game/CardAnimationLayer.tsx†L128-L177】【F:src/components/game/TabloidNewspaperV2.tsx†L310-L336】

### SFX inventory and coverage
| Keys | Asset | Usage |
| --- | --- | --- |
| `cardPlay`, `flash` | `/audio/card-play.mp3` | Fired when a card deploys or a Truth flash resolves, pairing the shared asset with visual effects on the main game board.【F:src/hooks/useAudio.ts†L406-L418】【F:src/pages/Index.tsx†L1694-L1745】 |
| `cardDraw`, `turnEnd` | `/audio/card-draw.mp3`, `/audio/turn-end.mp3` | Wrap up turns by pinging the end-turn button and the delayed card draw cue in sequence.【F:src/hooks/useAudio.ts†L406-L413】【F:src/pages/Index.tsx†L1424-L1431】 |
| `stateCapture` / `state-capture` | `/audio/state-capture.mp3` | Registered as `stateCapture` in the loader but invoked from combo logic as `'state-capture'` to celebrate new synergies with an animated capture flare.【F:src/hooks/useAudio.ts†L406-L414】【F:src/pages/Index.tsx†L900-L907】 |
| `newspaper` | `/audio/newspaper.mp3` | Plays when the player closes or archives the in-game tabloid to emphasize the paper shuffling animation.【F:src/hooks/useAudio.ts†L406-L413】【F:src/pages/Index.tsx†L1766-L1769】 |
| `hover`, `lightClick`, `click` | `/audio/hover.mp3`, `/audio/click.mp3` | Provides low-volume hover feedback on the map and card grid while reusing the stronger click for selections and surveillance overlays.【F:src/hooks/useAudio.ts†L415-L419】【F:src/components/game/EnhancedUSAMap.tsx†L302-L320】【F:src/components/game/EnhancedGameHand.tsx†L182-L211】【F:src/components/game/CardAnimationLayer.tsx†L299-L315】 |
| `error` | `/audio/click.mp3` (fallback) | Signals invalid targets, unaffordable plays, and other rule violations during card handling.【F:src/hooks/useAudio.ts†L418-L419】【F:src/pages/Index.tsx†L1561-L1566】【F:src/pages/Index.tsx†L1600-L1605】 |
| `typewriter` | `/audio/typewriter.mp3` | Reserved for dossier-style overlays triggered by the animation layer’s typewriter reveal events.【F:src/hooks/useAudio.ts†L417-L418】【F:src/components/game/CardAnimationLayer.tsx†L325-L335】 |
| `victory`, `defeat` | `/audio/victory.mp3`, `/audio/defeat.mp3` | Preloaded stingers that the endgame modal can trigger once victory and defeat flows ship.【F:src/hooks/useAudio.ts†L412-L414】 |
| `ufo-elvis`, `cryptid-rumble`, `radio-static` | Procedurally generated cues | Paranormal overlays request these clips for broadcasts, cryptid sightings, and static interference across the board and the newspaper feed.【F:src/hooks/useAudio.ts†L420-L423】【F:src/components/game/CardAnimationLayer.tsx†L214-L354】【F:src/components/game/TabloidNewspaperV2.tsx†L300-L315】 |

The loader currently falls back to placeholder audio for `ufo-elvis`, `cryptid-rumble`, and `radio-static`, so contributors should source royalty-free replacements—e.g., UFO ambience, low-frequency rumble, and shortwave static—from providers listed in the audio README, ensure MP3 format under the recommended size limits, and drop them into `public/audio/` with filenames that match the SFX keys. Update `existingSfxFiles` if the final filenames differ and verify licensing records per the project’s royalty-free guidance.【F:src/hooks/useAudio.ts†L406-L423】【F:public/audio/README.md†L1-L28】【F:public/audio/README.md†L30-L36】

Music playback is orchestrated through stateful helpers (`setMenuMusic`, `setFactionMusic`, `setGameplayMusic`, `setEndCreditsMusic`) so UI layers can switch playlists without reinitializing the hook.【F:src/hooks/useAudio.ts†L320-L420】 Future contributors should call these helpers instead of manipulating HTMLAudioElements directly to keep crossfade and unlock logic intact.

## Campaign arc progress telemetry
`TabloidNewspaperV2` now groups every campaign storyline into `CampaignArcGroup` buckets as it assembles the nightly paper. Each group tracks the latest unlocked chapter, total chapter count, resolution status (active, cliffhanger, or finale), a progress bar percentage, and a generated status tagline derived from the most recent story beats.【F:src/components/game/TabloidNewspaperV2.tsx†L783-L865】 Those groups are distilled into lightweight `ArcProgressSummary` objects that capture the active chapter metadata and the top arc-aligned headlines. Whenever the overlay resolves a fresh batch of summaries it calls the optional `onArcProgress` callback so downstream systems can persist arc telemetry outside of the newspaper UI.【F:src/components/game/TabloidNewspaperV2.tsx†L824-L873】

`Index.tsx` subscribes to that callback with `handleArcProgress`, merging each payload into a stateful cache keyed by `arcId` so progress persists across multiple newspaper issues and into the post-game flow.【F:src/pages/Index.tsx†L691-L750】 When a match ends, the same file folds the cached summaries into `summarizeEventForFinalEdition`, which tags each high-impact event highlight with the matching arc snapshot if the headline advanced the same chapter that emitted the summary.【F:src/pages/Index.tsx†L269-L309】 This keeps the final edition report aware of how a given play moved its broader storyline.

`FinalEditionLayout` renders those annotated highlights in the Key Events panel. If an event includes `arcSummary` data, the panel adds chapter counters, finale/cliffhanger badges, a progress bar, the generated tagline, and the first few arc headlines so the endgame recap shows exactly how the campaign arc evolved.【F:src/components/game/FinalEditionLayout.tsx†L165-L229】 Future contributors who need real-time arc progress can tap the `onArcProgress` emission on the newspaper overlay, while post-game dashboards can reuse the cached summaries exposed alongside event highlights to surface chapter status, completion percentage, and narrative flavor text.

## Toast notification catalog
The UI surfaces a consistent set of toast banners to reinforce player feedback. The table below maps each emitting module to its messages and why they appear.

| Module | Messages | Purpose |
| --- | --- | --- |
| State event feed | <ul><li>`🗞️ BREAKING: ${event.title}`</li></ul> | Announces tabloid headlines whenever a state event is triggered by territory swings.【F:src/hooks/useStateEvents.ts†L31-L47】 |
| Achievement lifecycle | <ul><li>`🏆 Achievement Unlocked!`</li><li>`Import Successful`</li><li>`Import Failed`</li><li>`Progress Reset`</li></ul> | Celebrates new achievements and reports import/export outcomes inside the provider that manages persistent stats.【F:src/contexts/AchievementContext.tsx†L58-L140】 |
| Achievement control panel | <ul><li>`Progress Exported`</li><li>`Import Failed`</li></ul> | Confirms manual exports and flags invalid files from the achievements dashboard overlay.【F:src/components/game/AchievementPanel.tsx†L94-L118】 |
| Hand interactions | <ul><li>`❌ Insufficient IP`</li><li>`❌ Deployment Failed`</li></ul> | Blocks unaffordable cards and warns about interrupted deployments when playing from the enhanced hand UI.【F:src/components/game/EnhancedGameHand.tsx†L52-L78】 |
| USA map targeting | <ul><li>`❌ Invalid Target`</li></ul> | Reminds players that they cannot aim zone cards at states they already control when clicking on the map.【F:src/components/game/EnhancedUSAMap.tsx†L302-L318】 |
| Archive & synergy updates | <ul><li>`Edition already in archive`</li><li>`Final newspaper archived to Player Hub`</li><li>`🔗 Synergy Activated: … (+IP)`</li></ul> | Handles press archive deduplication and highlights bonus IP when new state combinations form on the main board.【F:src/pages/Index.tsx†L612-L908】 |
| Fullscreen controls | <ul><li>`Fullskjerm støttes ikke i denne nettleseren`</li><li>`Fullskjerm aktivert!`</li><li>`Fullskjerm deaktivert`</li><li>`Fullskjerm ble blokkert av nettleseren…`</li><li>`Kunne ikke bytte fullskjerm-modus`</li><li>`Kunne ikke aktivere fullskjerm automatisk`</li></ul> | Covers every manual and automatic fullscreen toggle outcome so players know why the mode changed or failed.【F:src/pages/Index.tsx†L1390-L1542】 |
| Card gating & targeting | <ul><li>`🚫 Cannot target your own states with zone cards!`</li><li>`🎯 Targeting …! Deploying zone card...`</li><li>`💰 Insufficient IP! Need …`</li><li>`📋 Maximum 3 cards per turn!`</li><li>`🎯 Zone card selected - click a state to target it!`</li><li>`🎯 Select a valid state target before deploying this zone card!`</li></ul> | Guides the targeting workflow, enforcing cost and turn limits while steering players toward valid zone card selections.【F:src/pages/Index.tsx†L1545-L1687】 |
| Card resolution results | <ul><li>`✅ ${card.name} deployed successfully!`</li><li>`❌ Card deployment failed!`</li></ul> | Summarizes the outcome of each play once animation completes or throws, mirroring the audio cues.【F:src/pages/Index.tsx†L1694-L1755】 |
| Contextual guidance | <ul><li>Dynamic suggestions from `ContextualHelp`</li></ul> | Surfaces turn-by-turn hints from the contextual helper when the player requests assistance.【F:src/pages/Index.tsx†L2443-L2454】 |
| Tutorial overlay | <ul><li>`Tutorial Started`</li><li>`Tutorial Unavailable`</li></ul> | Signals which tutorial sequence just launched or why the request was rejected from the training vault UI.【F:src/components/game/TutorialOverlay.tsx†L39-L55】 |

## Secret agenda cookbook grid

### Difficulty parity roadmap
Secret agendas now share a single difficulty roll between the player and the AI. The `getRandomAgenda` helper will accept an optional `difficulty` argument so the AI can mirror the tier that the human either selected or rolled. If no agenda exists for that combination the selector gracefully falls back to the nearest tier while logging the miss. This keeps sudden “cakewalk vs. nightmare” mismatches out of live builds and simplifies QA reproduction.

The start flow upgrades described in [Let players pick a secret agenda at game start](../src/hooks/useGameState.ts) expose the available agendas per faction, grouped by difficulty and annotated with the weekly issue. `startNewGame` forwards an agenda id to `initGame`, which then bypasses the randomizer for the human player and records the difficulty for the mirrored AI draw. Save slots persist both the agenda id and locked-in difficulty so mid-campaign loads do not drift into a new pairing.

We keep a diff-friendly checklist below for testing the parity hooks:

1. Start as Truth Seekers, pick a Hard agenda, and confirm the AI log announces a Hard agenda as well.
2. Start as Government, pick any agenda, and verify the AI’s agenda falls back only when its faction lacks the requested tier.
3. Rotate agendas mid-campaign (e.g., through narrative triggers) and confirm both factions land on the same tier.
4. Load an autosave created after a rotation and ensure the lock still applies.

### Agenda expansion notes
The hidden agenda database is expanding significantly. Designers can continue appending entries to `AGENDA_DATABASE`, but they should tag each record with `difficulty`, `faction`, `issue`, and a short `summary` string so the start-menu picker can render filter badges without extra work. When adding new stages, prefer the `createAgendaStages` helper because it provides consistent goal messaging and pipes completion telemetry to the campaign tracker automatically. If an agenda demands bespoke logic, encapsulate the evaluator in a dedicated module and import it into the agenda definition so future refactors can tree-shake unused code.

For QA coverage, add a unit test that instantiates every agenda definition and executes the stage predicates against mocked game state snapshots. The test suite should assert that each agenda advertises at least one completion path and that the picker list renders a title for every record.

### UI cues
The objectives HUD control will receive a subtle pulsing ring via a Tailwind keyframe animation (`objectives-pulse`). The pulse should respect reduced-motion preferences: wrap the animation in the existing `useReducedMotion` gate and switch to a static highlighted border when motion is disabled. Whenever the agenda tracker has unseen progress (new stage unlocked, completion imminent, etc.), the hook should set a `shouldPulseObjectives` flag so the button attracts attention without permanently flashing.
The secret agenda database now leans into the “Paranoid Times” tabloid-cookbook tone. Each faction’s entries pair a pulp trope with concrete telemetry pulled from `GameState` snapshots, ensuring the themed goals remain trackable by AI and UI layers alike.

### Truth Seekers menu
| Agenda | Theme hook | Progress trigger |
| --- | --- | --- |
| Bat Boy’s Brunch Brigade | Bat Boy sightings go brunch-core | Counts Appalachian control via `controlledStates` to confirm WV/KY/TN/PA brunch venues. |
| Moonbeam Marmalade Slow-Cook | Lunar jam session | Reads `truthAbove80Streak` / `timeBasedGoalCounters` to require three glowing turns. |
| UFO Retrieval Mise en Place | Crash-site mise en place | Filters `factionPlayHistory` for ZONE plays targeting desert crash states (NV/NM/AZ/UT). |
| Tabloid Taste Test Kitchen | Recipe-column media blitz | Tallies MEDIA cards from `factionPlayHistory` to model serialized taste tests. |
| Cryptid Potluck Planning | Monster potluck RSVPs | Uses `controlledStates` to corral cryptid-haunted states like WA/OR/WV/NJ/MT/NH. |
| Abduction Bake-Off | Levitation soufflé contest | Aggregates captured states reported in `factionPlayHistory.capturedStates`. |
| Cosmic Conserve Drive | Nebula jam fundraiser | Sums positive `truthDelta` values from `factionPlayHistory` to bottle 25% Truth. |

### Government test kitchen
| Agenda | Theme hook | Progress trigger |
| --- | --- | --- |
| Capitol Cafeteria Stew | Beltway cafeteria chow | Requires `controlledStates` coverage of DC/VA/MD/CO ladles. |
| Field-Ration Redactions | Press-release seasoning | Counts MEDIA plays from `factionPlayHistory` to keep the placemats censored. |
| Supply Chain Soup | Heartland ration routing | Monitors agricultural depot control (IA/NE/KS/MO/OK/AR) via `controlledStates`. |
| UFO Recall Paperwork | Crash-site compliance | Uses `capturedStates` extracted from `factionPlayHistory` to confirm confiscations in NV/NM/AZ/UT. |
| Cover-Up Casserole | Lid-on truth suppression | Leans on `truthBelow20Streak` / `timeBasedGoalCounters` for streak-style baking. |
| Spice Rack Surveillance | Coast-to-coast shakers | Checks `controlledStates` for NY/CA/TX/FL coverage. |
| Black-Budget Barbecue | Classified cookout | Tracks raw IP reserves through the snapshot `ip` value. |

### Shared potluck platter
| Agenda | Theme hook | Progress trigger |
| --- | --- | --- |
| Paranoid Picnic Tour | Roadside oddities tailgate | Validates four foodie-state holdings (WI/MN/NJ/LA/NM) from `controlledStates`. |
| Midnight Press Run | Alternating outrage courses | Uses paired MEDIA/ATTACK counts from `factionPlayHistory` (`Math.min` pairing). |
| Combo Platter Column | Buffet-table resonance | Reads `activeStateCombinationIds.length` to demand two simultaneous combo bonuses. |
