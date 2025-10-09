import type { CardArticle } from './articleDatabase';

/**
 * Expansion Card Articles
 * Includes narrative coverage for new Truth and Government cards
 */

export const expansionArticles: CardArticle[] = [
  {
    cardId: 'TRUTH-NEW-001',
    faction: 'truth',
    headline: 'KANSAS TORNADO DUMPS ARCHIVE BOXES—EACH LABELED "OPEN DURING ECLIPSE"',
    subhead: 'Small town inundated by swirling FOIA packets with future postmarks',
    byline: 'By Ruth Alvarez, Plains Paradox Reporter',
    body: `Residents of Greensburg, Kansas, watched a rope tornado pirouette through the county records office before gently releasing 342 cardboard boxes onto Main Street. Every lid bore identical stencil lettering: "OPEN DURING NEXT TOTAL ECLIPSE."

Inside, clerks found Freedom of Information Act responses stamped with dates from 2027, 2039, and one marked "after the last sun blinks." The packets address UFO sightings, crop insurance anomalies, and a mysterious annex listed as "tornado diplomacy wing."

State troopers attempted to load the boxes onto trucks, only to be blocked by a spontaneous bucket brigade of retirees who insisted on filing public comment first. The Department of Atmospheric Normalization calls the drop "weather-shaped paperwork." Locals have scheduled eclipse watch parties and plan to guard the boxes with lawn chairs until the sun cooperates.`,
    imagePrompt: 'Small Kansas town street covered in neatly stacked archive boxes after tornado, curious townsfolk, newsprint photo',
    tags: ['weather', 'foia', 'mystery'],
    statesMentioned: ['Kansas'],
    recurringCharacter: null,
    followUpHooks: [
      'Box labeled 2039 contains sealed instructions for a parade that has not been invented yet',
      'Insurance adjusters report policies rewriting themselves to include "acts of eclipse" clauses'
    ]
  },
  {
    cardId: 'TRUTH-NEW-002',
    faction: 'truth',
    headline: 'COACH HAMMOND OPENS BLUEGRASS FILM ROOM—REVIEWS UFO PLAYBOOK AT CHURCHILL DOWNS',
    subhead: 'Kentucky Derby jockeys attend mandatory morale session featuring extraterrestrial highlight reels',
    byline: 'By Mallory Greene, Heartland Sports Investigator',
    body: `Coach Terry Hammond, the high school football legend who once lost a championship to a hovering craft, has traded cleats for horse blankets—at least for the week. The coach installed a portable projector inside Churchill Downs, inviting jockeys to study "unidentified formation tape" ahead of this year's Derby.

"If a saucer can read cover-two, it can definitely corner on the back stretch," Hammond drawled while rewinding footage of glowing orbs executing perfect slingshot maneuvers over Louisville. Riders scribbled notes about "beam interference" and "antigrav drafting" as Hammond insisted they practice celebratory shouts in binary.

Track officials shrugged, calling the session an "inspirational seminar on situational awareness." Bettors, however, noticed the odds board flickering whenever Hammond mentioned "zone defense from the sky." He promised to host a follow-up workshop titled "How to Blitz a Tractor Beam."`,
    imagePrompt: 'Coach in Derby stables projecting UFO footage for jockeys, chalkboard with alien plays, newsprint grain',
    tags: ['coach-hammond', 'sports', 'ufo'],
    statesMentioned: ['Kentucky'],
    recurringCharacter: 'Coach Terry Hammond',
    followUpHooks: [
      'Churchill Downs installs lightning rods shaped like goalposts at Hammond's suggestion',
      'Mysterious bettor places wager in binary code on horse named "Area Fifty-Fun"'
    ]
  },
  {
    cardId: 'TRUTH-NEW-003',
    faction: 'truth',
    headline: 'LOUISIANA BAYOU BAND TUNES ITSELF—GHOST BRASS SETS WEATHER PATTERN TO SWING TEMPO',
    subhead: 'Trumpets emerge from swamp each dusk, cueing storms with second-line rhythms',
    byline: 'By Desiree Baptiste, Crescent City Correspondent',
    body: `Cypress knees near Breaux Bridge now double as music stands after a phantom brass band began rising from the bayou at sunset. The translucent musicians launch into brassy second-line standards, and every downbeat coincides with lightning sketching treble clefs over the Atchafalaya Basin.

Local shrimpers swear the spectral sousaphone controls rainfall. "When they hit the bridge, the clouds clap back," Captain Jules Thibodeaux said while wiping condensation off his glasses. Meteorologists recorded barometric pressure dancing in syncopation, resulting in rainfall shaped suspiciously like eighth notes.

State officials labeled the performances "cultural fog," yet quickly filed trademarks for "Jazz-Based Precipitation Management." Tourists now charter fan boats for front-row seats, leaving offerings of gumbo mix to keep the ghosts on tempo.`,
    imagePrompt: 'Spectral jazz band emerging from Louisiana bayou, lightning shaped like musical notes, newsprint photo',
    tags: ['music', 'weather', 'ghost'],
    statesMentioned: ['Louisiana'],
    recurringCharacter: null,
    followUpHooks: [
      'NOAA updates hurricane forecasts using newly released sheet music from the bayou band',
      'Tourism board files patent for "syncopated storm seeding"'
    ]
  },
  {
    cardId: 'TRUTH-NEW-004',
    faction: 'truth',
    headline: 'MAINE LIGHTHOUSES FLASH COORDINATED WARNING—MORSE CODE SPELLS OUT "STAY INSIDE THE LOBSTER TRAP"',
    subhead: 'Coastal keepers decode nightly instructions from unseen maritime authority',
    byline: 'By Cora McDougall, North Atlantic Bureau',
    body: `From Portland Head to West Quoddy, Maine's lighthouses have begun blinking in perfect unison, spelling lengthy Morse passages that appear to reference "dimensional tides" and "authorized portals for crustaceans only."

Volunteer keeper Miles Penobscot claims the signals originate from beneath the Bay of Fundy. "It's like someone below sea level is reminding us the lobster traps aren't just for dinner," he said, revealing a notebook full of decoded phrases warning against "unauthorized sunrise viewing."

The Coast Guard politely insists the synchronized flashes are part of a modernization pilot. Still, fishermen report their catch now includes scrolls of waterproof parchment stamped with a red kraken seal. Locals obey the nightly command to "wave politely at the horizon," just in case.`,
    imagePrompt: 'Row of Maine lighthouses flashing in unison under foggy night, lighthouse keepers taking notes, newsprint style',
    tags: ['maritime', 'signals', 'mystery'],
    statesMentioned: ['Maine'],
    recurringCharacter: null,
    followUpHooks: [
      'Harbor seals spotted wearing reflective harnesses that blink in sync with beacons',
      'Fishermen discover trap containing passport stamped "Atlantic Anomaly Authority"'
    ]
  },
  {
    cardId: 'TRUTH-NEW-005',
    faction: 'truth',
    headline: 'CHESAPEAKE CRABS STAGE BLOCKADE—ARRANGE THEMSELVES INTO PERFECT PENTAGON BLUEPRINT',
    subhead: 'Maryland watermen puzzled as crustaceans sketch classified-looking schematics',
    byline: 'By Jordan Ellis, Brackish Intel Correspondent',
    body: `Boats departing Kent Island found their paths redirected by thousands of blue crabs linking claws in immaculate straight lines. From above, the crustacean crowd formed a blueprint matching a rumored underground wing of the Pentagon—complete with annotations reading "floodgate here" and "mystery elevator."

Marine biologists attempting to sample the crab collective reported their equipment politely shoved aside. "They spelled 'wait your turn' in bubbles," said researcher Dr. Simone Hart. Dockside gossip claims the crabs tapped out coordinates leading toward the mouth of the Potomac before dispersing at high tide.

The Department of Defense thanked the crabs for their "enthusiasm" and issued a statement reminding citizens that crustaceans cannot hold security clearances. Meanwhile, Annapolis lawmakers propose a new state holiday: Mutual Aid Among Crabs Day.`,
    imagePrompt: 'Aerial view of Chesapeake Bay with blue crabs forming geometric pattern resembling Pentagon, newsprint texture',
    tags: ['maritime', 'conspiracy', 'crustacean'],
    statesMentioned: ['Maryland'],
    recurringCharacter: null,
    followUpHooks: [
      'Crab blueprint matches subterranean tunnels rumored in declassified 1974 memo',
      'Old Bay seasoning company offers scholarship to any student fluent in claw semaphore'
    ]
  },
  {
    cardId: 'TRUTH-NEW-006',
    faction: 'truth',
    headline: 'BOSTON LIBRARY STAIRS LOOP BACK TWO MINUTES—GRAD STUDENTS GAIN EXTRA COFFEE BREAK',
    subhead: 'Historic reading room quietly warps time for overdue thesis writers',
    byline: 'By Aiden Doyle, Temporal Academia Desk',
    body: `Patrons at the Boston Athenaeum discovered that climbing its grand staircase now adds two spare minutes to the clock. The phenomenon activates only when carrying overdue research books; security cameras show patrons exiting the stairwell precisely two minutes before they entered, clutching fresher coffee.

"It's the only reason my dissertation still exists," confessed MIT doctoral candidate Priyanka Vyas. "I loop until my caffeine stabilizes, then sprint back to the microfilm." Custodians report hearing faint harpsichord music whenever someone tries to exploit the anomaly for nap time.

Administrators deny anything supernatural, labeling the reports "motivational architecture." Nevertheless, the state fire marshal installed an "Escher Zone" placard at the landing while professors quietly draft policies for "chronological plagiarism."`,
    imagePrompt: 'Elegant Boston library staircase with blurred figure appearing twice, clock showing paradox time, newsprint style',
    tags: ['time-anomaly', 'academia', 'library'],
    statesMentioned: ['Massachusetts'],
    recurringCharacter: null,
    followUpHooks: [
      'Local cafés adjust loyalty programs to account for time-looped purchases',
      'Athenaeum board debates charging rent to future versions of the same student'
    ]
  },
  {
    cardId: 'TRUTH-NEW-007',
    faction: 'truth',
    headline: 'FLORIDA MAN ICE-SURFS THE GREAT LAKES—LEAVES HOTLINE FOR THAWING SHIPWRECKS',
    subhead: 'Legendary trickster turns Lake Michigan into emergency delivery route for frozen freighters',
    byline: 'By Lena Papadopoulos, Rust Belt Ripples Reporter',
    body: `Residents of Muskegon spotted the infamous Florida Man riding a chrome skimboard across newly solidified sections of Lake Michigan. Each glide carved glowing grooves that warmed the ice just enough to release trapped fishing boats, which floated free with fresh supplies stacked on deck.

"He tossed me a thermos labeled 'CITRUS DE-ICER' and winked," said lighthouse keeper Morgan Hayes. Witnesses heard him shout, "Stay weird, freshwater!" before launching into a series of hurricane-grade spins that spelled out a phone number in steam: a hotline connecting stranded sailors to a voicemail promising "rapid thaw assistance."

Coast Guard officials urge caution, insisting the hotline is "not affiliated with recognized rescue services." Still, freighters trapped near Milwaukee report receiving mysterious care packages of oranges, mittens, and legally questionable fireworks.`,
    imagePrompt: 'Daring figure skimboarding across icy Great Lake with glowing trail, freed boats nearby, newsprint aesthetic',
    tags: ['florida-man', 'rescue', 'lake'],
    statesMentioned: ['Michigan'],
    recurringCharacter: 'Florida Man',
    followUpHooks: [
      'Hotline voicemail references map coordinates that trace an alligator-shaped constellation over the lake',
      'Great Lakes shipping union invites Florida Man to keynote winter safety conference'
    ]
  },
  {
    cardId: 'TRUTH-NEW-008',
    faction: 'truth',
    headline: 'MINNESOTA ICE FISHING HUTS ALIGN INTO RUNWAY—NORTHERN LIGHTS START LANDING',
    subhead: 'Lake Mille Lacs cabins reposition nightly to guide shimmering aircraft',
    byline: 'By Howard Lindholm, Boreal Anomalies Correspondent',
    body: `Satellite imagery revealed that the ice fishing huts on Lake Mille Lacs are no longer randomly scattered; instead they reposition themselves overnight into a tidy runway. At precisely 2:13 a.m., curtains of aurora descend, folding into triangular craft that hover just above the huts before dissolving into glitter.

Anglers awaken to find their tackle boxes reorganized and sticky notes reading "THANK YOU FOR LOANING YOUR RUNWAY" alongside unfamiliar bait shaped like constellations. Local pilot associations confirm their radios pick up polite clearance requests spoken in Minnesotan accents layered with starlight static.

Authorities chalk it up to "crowdsourced art," yet install additional signage reminding residents to file flight plans, even for auroral visitors. The lake ice now hums with a low chorus that sounds suspiciously like "Uff da" on loop.`,
    imagePrompt: 'Ice fishing huts arranged as runway on frozen lake under aurora landing, newsprint photo',
    tags: ['aurora', 'ufo', 'community'],
    statesMentioned: ['Minnesota'],
    recurringCharacter: null,
    followUpHooks: [
      'State tourism bureau offers "Aurora Air Traffic Control" certification badges',
      'Local coffee shop reports customers paying with coins made of compacted starlight'
    ]
  },
  {
    cardId: 'TRUTH-NEW-009',
    faction: 'truth',
    headline: 'MISSISSIPPI RIVER DELTA HUMS BLUES SCALE—BARGES FLOAT UPRIVER ON BEAT THREE',
    subhead: 'Hydrologists baffled as current reverses during nightly jam sessions',
    byline: 'By Elijah Moore, Delta Phenomena Editor',
    body: `Towboat captains near Clarksdale report the Mississippi River now vibrates with a B-flat blues scale after sundown. When the phantom house band hits beat three, barges briefly drift upstream against the current, carrying crates labeled "souvenir history" that were never loaded at the dock.

Musician-turned-hydrologist Lila Freeman lowered microphones into the current and captured what she calls "liquid slide guitar." Her analysis shows the water temperature dropping precisely three degrees whenever a minor seventh appears. River traffic controllers have started issuing rhythm charts alongside tide tables.

Army Corps officials attribute the reversals to "unusually enthusiastic catfish," but quietly request additional earplugs. Local venues now advertise "Bring your barge, join the jam."`,
    imagePrompt: 'Barges on Mississippi River glowing with musical notes rising from water, night scene, newsprint',
    tags: ['music', 'river', 'anomaly'],
    statesMentioned: ['Mississippi'],
    recurringCharacter: null,
    followUpHooks: [
      'Smithsonian folklorists ship blank vinyl upstream to capture the river's nightly set',
      'Delta blues festival sells out after promising "first-ever current reversal dance floor"'
    ]
  },
  {
    cardId: 'TRUTH-NEW-010',
    faction: 'truth',
    headline: 'BAT BOY HOSTS MIDNIGHT CIVICS CLASS BENEATH THE ARCH—TEACHES SENATORS HOW TO HANG',
    subhead: 'Gateway Arch visitors receive crash course in upside-down transparency',
    byline: 'By Jennifer Cross, Cryptid Democracy Correspondent',
    body: `St. Louis park rangers confirmed the Gateway Arch now opens after midnight for Bat Boy's "Civics For The Nocturnal" seminars. Attendees receive suction-cup gloves and instruction on hanging upside down while reading appropriations bills projected on the stainless steel surface.

"Corruption slides right off when you turn the page vertically," Bat Boy chirped, distributing bat-shaped highlighters. Witnesses spotted several Missouri lawmakers participating incognito; one fainted when asked to echolocate the phrase "earmark."

The Senate sergeant-at-arms asked for a briefing, calling the event "an unauthorized bat caucus." Bat Boy countered by inviting the entire chamber to a bipartisan roosting session.`,
    imagePrompt: 'Gateway Arch at night with Bat Boy teaching upside-down class, senators hanging, newsprint texture',
    tags: ['bat-boy', 'civics', 'activism'],
    statesMentioned: ['Missouri'],
    recurringCharacter: 'Bat Boy',
    followUpHooks: [
      'Missouri legislature files bill requiring transparency harnesses for midnight hearings',
      'Bat Boy schedules field trip to Jefferson City tunnels rumored to echo secrets'
    ]
  },
  {
    cardId: 'TRUTH-NEW-011',
    faction: 'truth',
    headline: 'NEW HAMPSHIRE PRIMARY TOWN HALL RESETS ITSELF—CANDIDATES ANSWER DIFFERENT QUESTIONS EACH LOOP',
    subhead: 'Voters delighted as time-warp ensures every policy gets grilled eventually',
    byline: 'By Dana Schultz, Granite State Scrutineer',
    body: `The famed town hall in Concord now reboots every 47 minutes, rewinding podium scuffs and refilling coffee urns while candidates stumble through brand-new questions projected from nowhere. Local moderators swear they ask the same prompt, yet transcripts show increasingly specific policy hypotheticals about moose rights and drone-free maple syrup.

"It's the fairest system we've ever had," said voter Hazel Kimball, who has attended six loops and counting. Each reset sends candidates scrambling to adjust their stump speeches as mysterious bells chime the countdown to another timeline.

State officials deny tampering, claiming the event is "augmented civic engagement." Campaign buses now circle the block until their drivers feel jet lag.`,
    imagePrompt: 'New Hampshire town hall with repeating identical scenes blurred together, candidates sweating, newsprint',
    tags: ['election', 'time-loop', 'civic-duty'],
    statesMentioned: ['New Hampshire'],
    recurringCharacter: null,
    followUpHooks: [
      'Polling stations request hazard pay for maintaining simultaneous voter rolls',
      'Town archivist opens "Temporal Lost and Found" for campaign promises dropped mid-loop'
    ]
  },
  {
    cardId: 'TRUTH-NEW-012',
    faction: 'truth',
    headline: 'PINE BARRENS CRYPTID CON STARTS WITHOUT ORGANIZER—BAT BOY & MARIA CHEN RUN THE MERCH TABLE',
    subhead: 'New Jersey gathering features spontaneous crossover of tabloid legends',
    byline: 'By Nicolette Ramos, Garden State Sightings Editor',
    body: `Vendors arriving for the first Pine Barrens Cryptid Convention found the organizer missing but the merch table fully staffed by Bat Boy and tinfoil entrepreneur Maria Chen. The duo distributed holographic trail maps annotated with disclaimers like "Watch for Jersey Devil, tip your guide, bring receipts."

Attendees claim Bat Boy handled autographs while Maria fitted guests with limited-edition pine-scented foil hats that allegedly repel government drones. Between panels, the pair whispered about a "cross-coastal alliance" before unveiling a raffle for a weekend getaway to an undisclosed cave with great Wi-Fi.

State park officials, caught off guard, declared the event an "unsanctioned interpretive experience" and requested the merch booth file sales tax forms in triplicate. The duo simply vanished into the pines, leaving behind a perfectly balanced cash drawer and a note reading "See you at the next crossover."`,
    imagePrompt: 'Forest clearing with Bat Boy and Maria Chen at merch table selling foil hats, attendees excited, newsprint style',
    tags: ['bat-boy', 'maria-chen', 'festival'],
    statesMentioned: ['New Jersey'],
    recurringCharacter: 'Bat Boy & Maria Chen',
    followUpHooks: [
      'Jersey Devil spotted delivering thank-you baskets of artisanal pinecones',
      'Pop-up cryptid convention announced simultaneously in Roswell and Richmond via glowing postcards'
    ]
  },
  {
    cardId: 'TRUTH-NEW-013',
    faction: 'truth',
    headline: 'TIMES SQUARE BILLBOARDS HIJACKED BY POP-UP FOIL BOUTIQUE—MARIA CHEN SELLS ANTENNAS TO TOURISTS',
    subhead: 'Midnight flash sale broadcasts classified coupons onto Manhattan skyscrapers',
    byline: 'By Ava Klein, Neon Underground Correspondent',
    body: `New Yorkers witnessed Times Square billboards flicker into synchronized schematics advertising Maria Chen's newest line of urban paranoia wear. The pop-up stall materialized atop a sightseeing bus, dispensing telescoping foil crowns tuned to "metropolitan ley lines."

"I'm just helping people hear the whispers between subway cars," Chen said, attaching resonator charms shaped like MetroCards. Within minutes, her limited-run "Times Square Shield" sold out, leaving behind customers claiming they could hear Wall Street conference calls in advance.

City inspectors shrugged, citing a "permitted promotional art project." Meanwhile, finance firms reported sudden runs on white-noise machines. Chen promised to return for the ball drop with "antennae that fold into a pretzel."`,
    imagePrompt: 'Times Square night scene with foil boutique on bus, holographic coupons in sky, newsprint texture',
    tags: ['maria-chen', 'commerce', 'urban'],
    statesMentioned: ['New York'],
    recurringCharacter: 'Maria Chen',
    followUpHooks: [
      'MTA announces pilot program to accept foil crowns as proof of fare when the moon is full',
      'Wall Street lobbyists file complaint about "preemptive eavesdropping" accessories'
    ]
  },
  {
    cardId: 'TRUTH-NEW-014',
    faction: 'truth',
    headline: 'OUTER BANKS FOG PROJECTS PIRATE HHOLOGRAMS—THEY DEMAND A SHARE OF TOURISM TAX',
    subhead: 'North Carolina beaches host nightly negotiations with spectral privateers',
    byline: 'By Serena Holt, Coastal Contradiction Reporter',
    body: `Visitors to Nags Head now encounter rolling fog banks that solidify into translucent pirate crews. The holographic buccaneers unfurl scrolls itemizing centuries of unpaid "paranormal docking fees" and politely request 8% of modern tourism revenue to maintain the "Atlantic rift."

Local officials attempted to dismiss the demand until the fog crew projected a detailed ledger of municipal expenditures—complete with notes like "please stop paving over haunted dunes." Economists from UNC were summoned to negotiate, only to find themselves learning sea shanties about municipal bond ratings.

State tourism reps spun the encounter as an "interactive heritage moment" while quietly drafting proposals for pirate revenue-sharing programs. Beachgoers, meanwhile, trade recipes for ectoplasmic sunscreen.`,
    imagePrompt: 'North Carolina beach with foggy pirate holograms confronting officials, tourists watching, newsprint photo',
    tags: ['pirate', 'spectral', 'economics'],
    statesMentioned: ['North Carolina'],
    recurringCharacter: null,
    followUpHooks: [
      'State treasurer schedules listening session aboard a replica galleon at sunset',
      'Fog pirates circulate petition to rename sales tax "Pieces of Eight"'
    ]
  },
  {
    cardId: 'TRUTH-NEW-015',
    faction: 'truth',
    headline: 'NORTH DAKOTA OIL PUMPS HUM PRAIRIE LULLABY—WELLS FALL ASLEEP MID-EXTRACTION',
    subhead: 'Rigs request bedtime stories before resuming perfectly ethical drilling',
    byline: 'By Wyatt Grey, High Plains Oddities Reporter',
    body: `Pumpjacks near Williston have begun singing themselves to sleep, emitting harmonic overtones that lull entire rigs into temporary hibernation. Engineers report the machines gently lowering their horseheads, flashing indicator lights that spell "TUCK US IN" in Morse.

Roughnecks now gather nightly to read from dog-eared prairie poetry anthologies, after which the pumps resume work with renewed vigor and inexplicable efficiency. "They just needed stories about bison migrations," said foreman Lacey Ortiz, who has added bedtime snack deliveries of fair-trade hot cocoa to the maintenance schedule.

Energy regulators categorize the phenomenon as "mechanical mindfulness" while economists marvel at the increased output. Local children volunteer to perform lullabies, citing "goodnight, rig" as their new favorite bedtime gig.`,
    imagePrompt: 'Oil pumpjacks in North Dakota glowing softly as workers read bedtime stories, night sky, newsprint',
    tags: ['energy', 'sentient-machine', 'lullaby'],
    statesMentioned: ['North Dakota'],
    recurringCharacter: null,
    followUpHooks: [
      'Petroleum companies commission lullaby-writing contest judged by retired cowboys',
      'Geologists detect dreamlike seismic patterns syncing with the rigs' nightly nap'
    ]
  },
  {
    cardId: 'TRUTH-NEW-016',
    faction: 'truth',
    headline: 'CLEVELAND ROCK HALL HOSTS SURPRISE DUET—BAT BOY & FLORIDA MAN DROP CONSPIRACY MIXTAPE',
    subhead: 'Museum speakers broadcast untraceable track detailing classified setlists',
    byline: 'By Marcus Webb, Sonic Convergence Correspondent',
    body: `Visitors to the Rock & Roll Hall of Fame were treated to an after-hours surprise when Bat Boy rappelled from the glass pyramid while Florida Man surfed across Lake Erie on a guitar-shaped jet ski. The duo performed an improvised mix of echolocation beats and hurricane percussion, all while projecting redacted tour itineraries onto the ceiling.

"We're here to declassify the groove," Bat Boy squeaked, harmonizing with Florida Man's steel-drum thunder. The track referenced secret encores at Area 51, clandestine rave bunkers in Tampa, and a rumored "Moonlight on the Moon" residency.

Museum officials dismissed the event as "spontaneous performance art" but quietly replaced their visitor badges with RFID earplugs. Bootleg copies of the mix now circulate in conspiracy forums alongside grainy selfies of the duo high-fiving on the Rock Hall roof.`,
    imagePrompt: 'Rock & Roll Hall of Fame night scene with Bat Boy performing and Florida Man surfing on guitar jet ski, newsprint',
    tags: ['bat-boy', 'florida-man', 'music'],
    statesMentioned: ['Ohio'],
    recurringCharacter: 'Bat Boy & Florida Man',
    followUpHooks: [
      'Unsigned liner notes list next venue as "Somewhere between Toledo and the Twilight Zone"',
      'Cleveland weather radar briefly displays equalizer bars matching the duet's beats'
    ]
  },
  {
    cardId: 'TRUTH-NEW-017',
    faction: 'truth',
    headline: 'TORNADO CHASERS FIND REVIVAL TENT FLOATING BETWEEN OKLAHOMA AND TEXAS—PASTOR REX & SMITHERSON ARGUE ABOUT WIND RIGHTS',
    subhead: 'Mobile sermon collides with federal no-fly zone paperwork mid-air',
    byline: 'By Caleb Monroe, Boundary Layer Bureau',
    body: `Storm spotters tracking a supercell near the Red River encountered Pastor Rex conducting a midair sermon from a levitating tent, while Agent Smitherson hovered nearby in a government helicopter waving a stack of authorization forms. The tent drifted precisely along the state line, alternating between Oklahoma amen choruses and Texas barbecue coupons.

"This gust front belongs to the faithful!" Rex proclaimed as Doomsday Beans banners fluttered. Smitherson countered through a bullhorn, insisting the sermon violated "interstate vortex protocols" and offering to stamp the tent back to earth for a small classification fee.

Ultimately the twister itself issued a booming "Settle it yourselves" before dissipating. Locals on both sides of the border received complimentary evacuation kits containing hymnals, nondisclosure agreements, and coupons for brisket-flavored survival beans.`,
    imagePrompt: 'Floating revival tent straddling Oklahoma-Texas border with preacher and agent arguing mid-air, stormy newsprint scene',
    tags: ['pastor-rex', 'agent-smitherson', 'storm'],
    statesMentioned: ['Oklahoma', 'Texas'],
    recurringCharacter: 'Pastor Rex & Agent Smitherson',
    followUpHooks: [
      'FAA proposes new category for "faith-based atmospheric gatherings"',
      'Red River towns schedule joint potluck to compare sermon transcripts with confiscated paperwork'
    ]
  },
  {
    cardId: 'TRUTH-NEW-018',
    faction: 'truth',
    headline: 'PORTLAND COFFEE ROASTERS CLAIM BEANS WHISPER TRAIN SCHEDULES—LIGHT RAIL RUNS EARLY',
    subhead: 'Baristas chart espresso crema patterns that predict transit glitches',
    byline: 'By Naomi Fletcher, Cascadia Curiosities Reporter',
    body: `A collective of Portland roasters says their single-origin beans now whisper precise TriMet arrival times while cooling. Baristas jot the murmured predictions into latte art, creating foamy depictions of trains arriving five minutes early—and the trains comply.

"The crema told me car three would have two undercover agents and a clarinetist," said barista Leo Wu. Riders confirmed the forecast down to the instrument. Transit planners hurriedly launched a "Public Espresso Engagement" task force to understand why cappuccinos know more than dispatch.

City Hall called it "community-driven punctuality" and encouraged residents to support local cafés. Meanwhile, the beans demand ethically sourced soundproof bags in exchange for continued schedule leaks.`,
    imagePrompt: 'Portland coffee shop with barista examining latte art showing train schedule, commuters checking watches, newsprint',
    tags: ['coffee', 'transit', 'prediction'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: [
      'TriMet installs espresso machines in control rooms hoping to negotiate directly with the beans',
      'Latte art begins including doodles of a mysterious tunnel not on official maps'
    ]
  },
  {
    cardId: 'TRUTH-NEW-019',
    faction: 'truth',
    headline: 'LIBERTY BELL EMITS NDA FREQUENCY—AGENT SMITHERSON DECLARES IT "PERFECTLY NORMAL PATRIOTISM"',
    subhead: 'Philadelphia tourists forced to sign waivers before hearing new harmonic overtone',
    byline: 'By Elise Grant, Independence Intrigue Correspondent',
    body: `Visitors to Independence Hall report the Liberty Bell now resonates with a subsonic tone that compels listeners to whisper, "I have heard nothing unusual." Enter Agent Smitherson, distributing nondisclosure forms shaped like colonial parchment and promising the tone is "an advanced patriotic frequency approved by the Founders."

Acoustic engineers discovered the vibration encodes snippets of classified memos about "Project Crack Seal." When asked, Smitherson shrugged and suggested everyone enjoy the "historic silence." Tourists posing for photos found their camera audio replaced by polite coughs.

National Park officials insist the bell simply "settled" after centuries of service. Nonetheless, souvenir shops now sell earplugs with embossed eagles, and Smitherson has set up a pop-up kiosk labeled "Voluntary Oath Station."`,
    imagePrompt: 'Liberty Bell emitting sound waves while Agent Smitherson hands out waivers to tourists, newsprint illustration',
    tags: ['agent-smitherson', 'history', 'coverup'],
    statesMentioned: ['Pennsylvania'],
    recurringCharacter: 'Agent Smitherson',
    followUpHooks: [
      'New overtone harmonizes perfectly with Bat Boy's campaign anthem, causing tremors in Congress',
      'Archives reveal earlier drafts of the Declaration printed on nondisclosure agreements'
    ]
  },
  {
    cardId: 'TRUTH-NEW-020',
    faction: 'truth',
    headline: 'PROVIDENCE WATERFIRE ADDS UNINVITED FLAME—BURNS IN SHAPE OF MISSING CONSTELLATION',
    subhead: 'Rhode Island art installation receives luminous upgrade referencing colonial star charts',
    byline: 'By Talia Mendes, Illuminated Oddities Reporter',
    body: `Spectators at Providence's WaterFire festival watched an extra flame ignite mid-river, tracing the outline of a long-lost constellation known only from a 1697 alchemist's diary. The shimmering fire hovers inches above the water, humming in Latin and occasionally spelling coordinates in sparks.

Local historians matched the shape to "The Navigator," a star pattern rumored to guide seekers to hidden libraries. Whenever the flame pulses, nearby streetlamps flicker, revealing temporary passages that loop back to the river. Vendors selling roasted chestnuts report their receipts now feature tiny telescopes doodled in the margins.

City officials labeled the addition "community-sourced illumination" but quietly assigned a historian to follow the spark trail. Attendees toss parchment wishes into the river, hoping the flame will chart their course to secrets yet unburned.`,
    imagePrompt: 'Providence WaterFire scene with extra hovering flame shaped like constellation, crowd watching, newsprint photo',
    tags: ['art', 'constellation', 'mystery'],
    statesMentioned: ['Rhode Island'],
    recurringCharacter: null,
    followUpHooks: [
      'Brown University astronomers discover campus tunnels glowing in the same constellation shape',
      'WaterFire organizers receive anonymous donation of antique star maps wrapped in oilskin'
    ]
  },
  {
    cardId: 'GOV-NEW-001',
    faction: 'government',
    headline: 'COASTAL LIGHTS IN SOUTH CAROLINA "MERELY COURTESY DRONES," SAYS BRIEFING',
    subhead: 'Officials urge beachgoers to enjoy synchronized glow without speculation',
    byline: 'By: Coastal Stability Directorate',
    body: `Visitors along Myrtle Beach observed a formation of amber lights gliding just above the surf at 9:04 p.m., tracing perfect rectangles before ascending toward the horizon. Officials from the Coastal Stability Directorate immediately confirmed the display as part of a routine courtesy drone rehearsal designed to "calm the rumor economy" ahead of summer tourism numbers.

Local charter captains insisted the lights spelled out the phrase "TIDAL COURT IN SESSION," yet the Directorate released high-resolution footage showing only grid patterns and a cheerful thumbs-up hologram. According to briefing documents, the drones run on biodegradable batteries and are incapable of forming legal summons.

The agency reminded residents that classified coastline phenomena always arrive with at least three different fonts of warning tape. Since none were present, the public is encouraged to enjoy the synchronized glow, purchase sunscreen, and refrain from filing additional inquiry forms that may delay beach fireworks permits.`,
    imagePrompt: 'Official aerial photo of Myrtle Beach shoreline with uniform drone lights, calm government press release style, newsprint',
    tags: ['coverup', 'coast', 'training'],
    statesMentioned: ['South Carolina'],
    recurringCharacter: null,
    followUpHooks: [
      'Tourism board approves drone soundtrack featuring soothing elevator sax',
      'Unrelated fisherman fined for attempting to subpoena a quadcopter'
    ]
  },
  {
    cardId: 'GOV-NEW-002',
    faction: 'government',
    headline: 'BLACK HILLS HUM IDENTIFIED AS "EAGER GEOLOGICAL VENTILATION"',
    subhead: 'South Dakota caverns receive upgraded fans to discourage mythmaking',
    byline: 'By: Department of Subsurface Harmony',
    body: `Hikers near the Black Hills reported low-frequency tones reverberating from newly sealed mine entrances. State geologists promptly clarified that the sound originated from experimental ventilation fans designed to keep abandoned tunnels polite and well-aired.

Rumors that the hum syncs with Lakota star charts were dismissed as "creative listening." Officials demonstrated the fans' remote control app, which features only three settings: Fresh Air, Very Fresh Air, and Please Stop Recording.

Residents are encouraged to appreciate the improved air quality and to ignore any accompanying flashes of blue light, which are simply reflections of responsible maintenance badges worn by staff.`,
    imagePrompt: 'Government engineer adjusting large ventilation fan at Black Hills mine entrance, informational signage, newsprint',
    tags: ['infrastructure', 'acoustics', 'reassurance'],
    statesMentioned: ['South Dakota'],
    recurringCharacter: null,
    followUpHooks: [
      'Park service schedules monthly "Quiet Appreciation" walks with complimentary earplugs',
      'Tour company offering "mystery hum" excursions receives cease-and-desist letter for inaccurate adjectives'
    ]
  },
  {
    cardId: 'GOV-NEW-003',
    faction: 'government',
    headline: 'GENERAL THOMPSON ANNOUNCES AREA 51 "SISTER FACILITY" IN WEST TEXAS—PROMISES NOTHING INTERESTING INSIDE',
    subhead: 'Rebranded proving ground to host family-friendly runway tours and souvenir kiosks',
    byline: 'By: Office of Strategic Transparency',
    body: `General Marcus Thompson unveiled plans to repurpose a remote West Texas airstrip into the Area 51 Family Fun Annex, featuring guided walks past entirely ordinary hangars. "We have heard your curiosity," Thompson said, "so we are providing a safe, boring outlet for it."

The general emphasized that any unusual aircraft glimpsed over Marfa lights country are part of a "historical cosplay program" staffed by contractors in reflective jumpsuits. Visitors will receive commemorative ear protection to muffle the sound of classified boredom.

Locals who reported delivery trucks marked "Do Not Observe" were assured the shipments contain only folding chairs and educational brochures. Thompson invited families to bring binoculars "if they enjoy watching paperwork."`,
    imagePrompt: 'Bland military press conference with general pointing to map of West Texas facility, smiling families, newsprint photo',
    tags: ['rebranding', 'tourism', 'containment'],
    statesMentioned: ['Texas'],
    recurringCharacter: 'General Marcus Thompson',
    followUpHooks: [
      'Annex gift shop accidentally sells map with hangar 7 circled in red, promptly recalls all copies',
      'Airstrip renamed again after focus group says "Annex" sounds too interesting'
    ]
  },
  {
    cardId: 'GOV-NEW-004',
    faction: 'government',
    headline: 'UTAH SALT FLATS MIRAGE ATTRIBUTED TO "SPONTANEOUS PERFORMANCE ART"',
    subhead: 'Officials applaud creative citizens for holographic racing spectacle',
    byline: 'By: Bureau of Visual Serenity',
    body: `Spectators on the Bonneville Salt Flats reported translucent racecars zipping past at supersonic speeds, leaving trails of shimmering glyphs. The Bureau of Visual Serenity praised the display as "proof that community theater can thrive outdoors" and confirmed no permits were necessary for art made entirely of mirage.

Motor enthusiasts insisted the glyphs matched schematics for gravity-defying engines. The Bureau replied with a slideshow of pastel mood boards and a reminder that mirages cannot be patented. Portable kiosks now distribute brochures titled "How to Appreciate Illusions Without Filing FOIA."

Drivers are advised to wear sunglasses, drink water, and ignore any invitations from apparitions promising "test rides above the veil."`,
    imagePrompt: 'Utah salt flats with faint holographic racecars and calm officials holding clipboards, newsprint aesthetic',
    tags: ['mirage', 'arts', 'coverup'],
    statesMentioned: ['Utah'],
    recurringCharacter: null,
    followUpHooks: [
      'Tourism office introduces sunset mirage viewing zones with recommended applause cues',
      'Patent office receives 73 applications for "imaginary engine" and stamps each with friendly denial'
    ]
  },
  {
    cardId: 'GOV-NEW-005',
    faction: 'government',
    headline: 'MAPLE SYRUP RIVER THROUGH MONTPELIER DECLARED "BENIGN SUPPLY CHAIN SIMULATION"',
    subhead: 'Vermont agencies coordinate sweet-smelling logistics drill',
    byline: 'By: Agricultural Stability Command',
    body: `A caramel-colored stream briefly flowed through downtown Montpelier, coating cobblestones with Grade A amber aroma. Agricultural Stability Command thanked citizens for participating in an unannounced syrup distribution drill meant to test hose pressure and patience.

Officials provided biodegradable boot covers and explained that the exercise ensures Vermont can reroute sweetener reserves should a pancake crisis ever threaten national morale. Locals querying the presence of miniature tugboats made of stainless steel were told they represented "metaphorical resilience."

Residents are encouraged to rinse sidewalks with warm water and to ignore any rumors of sentient sap issuing travel advisories.`,
    imagePrompt: 'City street in Montpelier with gentle syrup flow and officials placing caution cones, newsprint photo',
    tags: ['logistics', 'simulation', 'sweet'],
    statesMentioned: ['Vermont'],
    recurringCharacter: null,
    followUpHooks: [
      'Statehouse cafeteria releases recipe book titled "Preparedness Pancakes"',
      'Tour companies offering "syrup rafting" receive strongly worded memos about stickiness compliance'
    ]
  },
  {
    cardId: 'GOV-NEW-006',
    faction: 'government',
    headline: 'APPALACHIAN LOW HUM IS JUST "HEROIC AIR FILTERS" HARD AT WORK',
    subhead: 'West Virginia mines receive moral support from federal ventilation upgrades',
    byline: 'By: Office of Responsible Extraction',
    body: `Communities near Beckley reported a resonant tone rolling through the hills each dusk. The Office of Responsible Extraction confirmed the sound is produced by new morale-enhancing air filters that vibrate to reassure coal seams they are cared for.

Residents insisting the hum carries whispered coordinates were encouraged to appreciate the filters' dedication instead. Engineers demonstrated that when the frequency peaks, it is simply reminding miners to hydrate.

Citizens are invited to submit compliments for the filters via postcard; any references to hidden elevators will be recycled into safety posters.`,
    imagePrompt: 'West Virginia mine entrance with large ventilation equipment and smiling officials, newsprint texture',
    tags: ['mining', 'acoustics', 'messaging'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: [
      'Appalachian radio stations agree to rebroadcast the hum as ambient hold music',
      'Filter manufacturer receives contract extension after promising optional lullaby setting'
    ]
  },
  {
    cardId: 'GOV-NEW-007',
    faction: 'government',
    headline: 'WISCONSIN CHEESE WHEELS SEEN ROLLING UPTOWN ARE "AUTONOMOUS QUALITY CHECKS"',
    subhead: 'Agricultural monitors insist self-guided dairy inspections are perfectly normal',
    byline: 'By: Dairy Oversight Council',
    body: `Madison residents filmed enormous cheddar wheels trundling uphill toward the capitol before returning to warehouses via synchronized spin. The Dairy Oversight Council applauded the program as the latest advancement in self-directed quality control, noting that the wheels are GPS-enabled and union-compliant.

Suggestions that the cheeses communicate in low-frequency moo Morse were deemed "enthusiastic folklore." Inspectors highlighted the wheels' commitment to transparency by reminding citizens the rinds are literally see-through when sliced thin enough.

Curious onlookers should maintain respectful distance, avoid attaching protest signs, and trust that any leftover curds on sidewalks are part of the federal lactose stimulus.`,
    imagePrompt: 'Large cheese wheels rolling in organized line past Wisconsin capitol with officials taking notes, newsprint photo',
    tags: ['agriculture', 'automation', 'coverup'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: [
      'Council issues voluntary handbook "How to Yield to Dairy Traffic"',
      'Cheese wheels file amicus brief supporting refrigeration subsidies'
    ]
  },
  {
    cardId: 'GOV-NEW-008',
    faction: 'government',
    headline: 'DEPUTY DIRECTOR WALSH HOSTS "SUNSHINE CALIBRATION" IN GEORGIA PEACH ORCHARDS',
    subhead: 'Bureau assures citizens the glowing fruit is part of morale outreach',
    byline: 'By: Office of Public Equilibrium',
    body: `Deputy Director Karen Walsh visited Fort Valley, Georgia, after orchard owners reported peaches emitting polite halos. Walsh explained the glow as a pilot program to measure optimism levels in agricultural regions. "When morale is high, so is the vitamin content," she declared while distributing complimentary sunglasses.

Farmworkers who noted the halos pulsed Morse code spelling "TRUST BUT VERIFY" received commemorative tote bags and a brochure on authorized optimism. Walsh promised the glow would fade once the data upload concludes or after peach cobbler season, whichever arrives first.

Citizens are encouraged to enjoy the radiant produce and to forward any suspicious recipes to the Office for culinary benchmarking.`,
    imagePrompt: 'Deputy Director giving press remarks in glowing peach orchard with agents holding clipboards, newsprint style',
    tags: ['agriculture', 'morale', 'briefing'],
    statesMentioned: ['Georgia'],
    recurringCharacter: 'Deputy Director Karen Walsh',
    followUpHooks: [
      'Glowing peach crates rerouted to undisclosed cafeteria for "taste panel"',
      'Walsh schedules follow-up visit to ensure farm dogs stop barking at surveillance satellites'
    ]
  },
  {
    cardId: 'GOV-NEW-009',
    faction: 'government',
    headline: 'ALABAMA COURTHOUSE CLOCK RUNNING BACKWARD IS "RETRO CHARM," NOT A PORTAL',
    subhead: 'Selma officials celebrate historically inspired timekeeping refresh',
    byline: 'By: Heritage Modernization Task Force',
    body: `Selma residents raised eyebrows when the courthouse clock began ticking backward, chiming thirteen times at noon. The Heritage Modernization Task Force unveiled the feature as a nostalgic art installation honoring the long arc of justice and absolutely not as evidence of temporal anomalies.

Engineers reassured the public that all legal deadlines remain forward-facing even if the clock prefers a retro loop. Any jurors experiencing déjà vu are offered complimentary coffee and a brochure titled "Progress Is Still Progress."

The Task Force asks citizens to resist speculative podcasts about wormholes and instead enjoy the scenic soundscape, which has already attracted film crews scouting for patriotic documentaries.`,
    imagePrompt: 'Historic Alabama courthouse with backward moving clock and smiling officials unveiling plaque, newsprint photo',
    tags: ['heritage', 'timekeeping', 'public-relations'],
    statesMentioned: ['Alabama'],
    recurringCharacter: null,
    followUpHooks: [
      'City council debates selling limited edition "reverse time" pocket watches',
      'Local historians volunteer to narrate backward walking tours every Thursday'
    ]
  },
  {
    cardId: 'GOV-NEW-010',
    faction: 'government',
    headline: 'ALASKA GLACIER THAT SHAPE-SHIFTED INTO NATIONAL SEAL WAS "SPIRITED ICE," CLAIMS PARK SERVICE',
    subhead: 'Officials discourage photographing patriotic permafrost after dark',
    byline: 'By: Arctic Stewardship Corps',
    body: `Cruise passengers in Glacier Bay watched a calving iceberg briefly reshape into the Great Seal of the United States before refreezing as a modest berm. The Arctic Stewardship Corps praised nature's patriotism and requested visitors treat the occurrence as an inspirational screensaver, not classified geomancy.

Rangers deployed signage reminding guests that ice occasionally salutes the flag and that flashes from cameras can startle migrating puffins. Any reports of the seal winking are to be forwarded directly to the Corps for inclusion in morale briefings.

Souvenir shops now stock commemorative mittens emblazoned with "Keep Calm, It Is Just Ice."`,
    imagePrompt: 'Alaskan glacier forming brief shape of national seal with park ranger giving thumbs up, newsprint texture',
    tags: ['nature', 'patriotism', 'coverup'],
    statesMentioned: ['Alaska'],
    recurringCharacter: null,
    followUpHooks: [
      'Navy band volunteers to perform ceremonial anthem for the glacier during peak tourist season',
      'Park Service bans carving of unofficial symbols into cooperative ice formations'
    ]
  },
  {
    cardId: 'GOV-NEW-011',
    faction: 'government',
    headline: 'DR. NG SAYS LEVITATING LIVESTOCK IN THE PLAINS ARE "OPTIMIZED FOR WIND"',
    subhead: 'Precision ranching trial allegedly eliminates hoofprints and awkward questions',
    byline: 'By: Department of Agricultural Plausibility',
    body: `Ranchers in western Nebraska filmed cattle hovering several inches above prairie grass during high gusts. Lead researcher Dr. Patricia Ng assured the press that the animals were fitted with harmless lift harnesses to reduce soil impact and improve air circulation. "Think of them as environmentally conscious balloons," she said.

Witnesses who noticed blue beams connecting the herd to passing satellites were told the lights signaled successful data uploads for hoofstep efficiency metrics. Dr. Ng emphasized that any moo patterns resembling binary are coincidental and not part of a secret language program.

Producers are advised to continue normal feeding schedules and to refrain from attaching protest banners to the harnesses.`,
    imagePrompt: 'Calm researcher demonstrating hovering cattle harness on Great Plains ranch, newsprint photograph',
    tags: ['livestock', 'research', 'denial'],
    statesMentioned: ['Nebraska'],
    recurringCharacter: 'Dr. Patricia Ng',
    followUpHooks: [
      'Harness manufacturer issues recall only for models that accidentally glow in the dark',
      'Satellite telemetry briefly spells "everything is fine" over the prairie night sky'
    ]
  },
  {
    cardId: 'GOV-NEW-012',
    faction: 'government',
    headline: 'MANHATTAN SUBWAY ECHO UPGRADE MISHEARD AS SECRET TRIBUNAL',
    subhead: 'Transportation Authority blames acoustics, not hidden juries under Times Square',
    byline: 'By: Metropolitan Clarification Unit',
    body: `Commuters at Times Square heard layered whispers responding "noted" whenever someone complained about delays. The Metropolitan Clarification Unit confirmed the phenomenon as a beta test of responsive acoustics that validates rider feedback in real time.

Any speculation about subterranean councils deliberating passenger sins was dismissed as "creative urban poetry." The Unit promised to recalibrate the echo so it says "thank you" instead of "your appeal is logged" by the end of the fiscal quarter.

Riders are encouraged to continue filing complaints through official apps rather than yelling into ventilation grates.`,
    imagePrompt: 'New York subway platform with officials adjusting speakers while riders listen, newsprint style',
    tags: ['transit', 'acoustics', 'public-relations'],
    statesMentioned: ['New York'],
    recurringCharacter: null,
    followUpHooks: [
      'Transit authority prints etiquette posters explaining the difference between echoes and verdicts',
      'Legal observers politely asked to leave after trying to swear in the reverb'
    ]
  },
  {
    cardId: 'GOV-NEW-013',
    faction: 'government',
    headline: 'PACIFIC NORTHWEST RAIN THAT FALLS UPWARD CALLED "LIMITED-EDITION MIST"',
    subhead: 'Oregon meteorologists unveil premium precipitation tier with anti-gravity flair',
    byline: 'By: Atmospheric Branding Office',
    body: `Residents of Astoria filmed raindrops rising from puddles back into low clouds, sparkling like reversed waterfalls. The Atmospheric Branding Office launched a marketing campaign describing the event as Limited-Edition Mist, available only during coastal gratitude weeks.

Scientists insisting on investigating were offered tote bags and redirected to standard rain events occurring nearby. The Office reminded everyone that gravity occasionally "needs a wellness retreat" and that umbrellas work equally well upside down when held with intention.

Citizens are invited to post uplifting photos using the hashtag #RainGoesHome rather than drafting weather conspiracies.`,
    imagePrompt: 'Oregon street with rain visibly rising upward while officials hand out branded umbrellas, newsprint photo',
    tags: ['weather', 'marketing', 'spin'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: [
      'Airport duty-free shops begin selling bottles of "pre-loved rain" at premium prices',
      'Environmental scientists receive grant to study the mist only if they agree to wear branded ponchos'
    ]
  },
  {
    cardId: 'GOV-NEW-014',
    faction: 'government',
    headline: 'DONALD PIERCE INTRODUCES "CLASSIFIED COLORING BOOK" TO REDUCE FOIA BACKLOG',
    subhead: 'Omega Plus Ultra Supreme clearance now available in soothing pastels',
    byline: 'By: Office of Infinite Redaction',
    body: `Classification Czar Donald Pierce unveiled a 64-page coloring book featuring silhouettes of things the public is not allowed to know. He claimed the interactive format will "channel curiosity into mindful shading" while agencies process requests.

Each page instructs readers to color inside the redaction bars without asking what is behind them. Pierce promised that any scribbles resembling actual secrets will be cheerfully confiscated. The book ships with a single crayon labeled "Authorized Gray."

Citizens are encouraged to enjoy the activity in quiet rooms and to recycle completed pages at designated shredding stations staffed by very calm security officers.`,
    imagePrompt: 'Bureaucrat unveiling redacted coloring book at press conference, oversized crayon, newsprint',
    tags: ['classification', 'bureaucracy', 'public-relations'],
    statesMentioned: ['District of Columbia'],
    recurringCharacter: 'Classification Czar Donald Pierce',
    followUpHooks: [
      'Retailers mistakenly sell a multicolor version; pallets disappear overnight',
      'Pierce schedules mindfulness webinar titled "Staying Calm While Highlighting Nothing"'
    ]
  },
  {
    cardId: 'GOV-NEW-015',
    faction: 'government',
    headline: 'HAWAIIAN SURF THAT GLOWS WITH TOUR SLOGANS IS "JUST LED PLANKTON"',
    subhead: 'Tourism authority requests visitors stop chanting proprietary mantras',
    byline: 'By: Pacific Messaging Bureau',
    body: `Waikiki surfers noticed bioluminescent waves spelling out government-approved slogans like "ALOHA IS COMPLIANCE." The Pacific Messaging Bureau attributed the effect to LED plankton recently introduced to "enhance brand synergy."

When beachgoers pointed out that the slogans updated in real time to match security advisories, officials explained the plankton simply enjoy current events. They asked residents to resist teaching the glow to spell sarcastic phrases.

The Bureau promises the illumination will subside after fiscal-year marketing goals are met. Until then, please surf responsibly and wave only at authorized cameras.`,
    imagePrompt: 'Nighttime Waikiki wave glowing with text while officials hold marketing boards, newsprint photo',
    tags: ['tourism', 'messaging', 'coverup'],
    statesMentioned: ['Hawaii'],
    recurringCharacter: null,
    followUpHooks: [
      'Unauthorized surfer writes "tax transparency" in the water and receives complimentary seminar invitation',
      'Plankton supplier releases patch notes referencing firmware version "Poseidon.2"'
    ]
  },
  {
    cardId: 'GOV-NEW-016',
    faction: 'government',
    headline: 'INTERAGENCY COASTAL DRILL ENDS WITH WALSH AND SMITHERSON ARGUING ABOUT WHO OWNS THE FOG',
    subhead: 'Carolinas assured the mist dispute is healthy bureaucratic teamwork',
    byline: 'By: Joint Fog Management Task Force',
    body: `A cooperative exercise along the Carolina coast deployed artificial mist to test evacuation signage. Deputy Director Karen Walsh and Agent Smitherson briefly disagreed over whether the haze should recite motivational slogans or deny its own existence. Observers noted the fog politely alternated between both messages.

The Task Force praised the spirited discussion as evidence that transparency and secrecy can coexist within one cloud. Residents who heard the fog whisper GPS coordinates to offshore platforms were told those numbers merely referenced buoy serial codes.

Both officials signed a memorandum affirming that all fog is federal property only during business hours.`,
    imagePrompt: 'Coastal scene with officials in suits gesturing at fog banks, joint task force banner, newsprint texture',
    tags: ['interagency', 'fog', 'coordination'],
    statesMentioned: ['North Carolina', 'South Carolina'],
    recurringCharacter: 'Deputy Director Karen Walsh & Agent Smitherson',
    followUpHooks: [
      'Joint memo schedules quarterly mist-sharing workshops with complimentary tote bags',
      'Beach towns receive grant to install speakers that play both optimism and denial on alternating hours'
    ]
  },
  {
    cardId: 'GOV-NEW-017',
    faction: 'government',
    headline: 'DR. FOSTER RECOMMENDS EARPLUGS FOR MIDWEST "SILENCE SURGES"',
    subhead: 'Health officials explain sudden quiet as a wellness opportunity, not alien power loss',
    byline: 'By: National Health Communication Bureau',
    body: `Communities across northern Ohio experienced abrupt pockets of total quiet in which clocks paused and Wi-Fi signals politely excused themselves. Dr. Raymond Foster attributed the phenomenon to a pilot stress-reduction program that "lets overstimulated cities take a breath."

Residents asked why the silence zones traveled down Main Street like invisible parade floats. Foster replied that serenity prefers a scenic route. He advised citizens to wear complimentary earplugs stamped with calming slogans and to journal any visions of luminous doctors offering melatonin.

The Bureau assures everyone that the quiet will lift once heart rates stabilize or when the next municipal election concludes, whichever comes first.`,
    imagePrompt: 'Midwestern town frozen in stillness while health official distributes earplugs, newsprint photo',
    tags: ['wellness', 'silence', 'public-health'],
    statesMentioned: ['Ohio'],
    recurringCharacter: 'Dr. Raymond Foster',
    followUpHooks: [
      'Residents receive survey asking if they enjoyed the silence more before or after the clipboard debrief',
      'Power companies credit the quiet with unexpected energy savings and request repeat events'
    ]
  },
  {
    cardId: 'GOV-NEW-018',
    faction: 'government',
    headline: 'ARIZONA MIRROR LAKE REFLECTION SHOWING NEXT WEEK IS "A WEATHER TEASER"',
    subhead: 'Tourism officials love the anticipation; meteorologists shrug',
    byline: 'By: Desert Outlook Administration',
    body: `Travelers near Sedona found a small lake reflecting a sky full of next Tuesday's clouds, complete with timestamps. The Desert Outlook Administration congratulated the water on its forward-thinking attitude and labeled the effect a "preview special" to boost hotel bookings.

Any hikers attempting to step into the reflection to "beat traffic" were gently redirected. Officials insist the lake is simply very proud of its predictive evaporation schedule.

Visitors are invited to take selfies with the future sky while remembering that weather is subject to change without metaphysical notice.`,
    imagePrompt: 'Arizona desert lake reflecting future sky with officials posting signs, newsprint aesthetic',
    tags: ['tourism', 'weather', 'spin'],
    statesMentioned: ['Arizona'],
    recurringCharacter: null,
    followUpHooks: [
      'Local resorts offer early-bird discounts tied to the reflection timetable',
      'Highway patrol warns that speeding to match the mirror forecast will still earn tickets'
    ]
  },
  {
    cardId: 'GOV-NEW-019',
    faction: 'government',
    headline: 'AGENT SMITHERSON INSTALLS "LISTENING BOOTHS" IN WEST VIRGINIA—INSISTS THEY ARE QUIET BOXES',
    subhead: 'Public asked to whisper nothing of consequence into friendly metal walls',
    byline: 'By: Information Courtesy Office',
    body: `Agent Smitherson oversaw the placement of stainless steel booths along scenic overlooks in the New River Gorge, inviting visitors to step inside for "structured contemplation." Once inside, citizens hear a gentle hum and a recorded reminder that secrets are heavy and should be surrendered for recycling.

When pressed about blinking indicator lights, Smitherson explained the booths simply track appreciation levels for federal infrastructure. He encouraged hikers to whisper affirmations about compliance and then exit feeling lighter.

Any echoes resembling follow-up questions are to be ignored; the booths already heard them.`,
    imagePrompt: 'Agent Smitherson presenting sleek booth overlooking gorge with smiling tourists, newsprint style',
    tags: ['agent-smitherson', 'surveillance', 'public-relations'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: 'Agent Smitherson',
    followUpHooks: [
      'Booths begin dispensing souvenir badges that read "I Confessed to Nothing"',
      'Local musicians try to use the booths for reverb practice and are politely redirected'
    ]
  },
  {
    cardId: 'GOV-NEW-020',
    faction: 'government',
    headline: 'GENERAL THOMPSON AND DONALD PIERCE UNVEIL "MUTUALLY ASSURED PAPERWORK" INITIATIVE',
    subhead: 'Texas testing grounds will share forms with Virginia vaults so no question goes unanswered',
    byline: 'By: Strategic Compliance Board',
    body: `In a rare joint appearance, General Marcus Thompson and Classification Czar Donald Pierce announced a cross-state paperwork exchange program. Any document filed at the West Texas Annex will now be instantly copied to a secure vault in Virginia, where Pierce promises to black out the question marks before anyone reads them.

Thompson praised the partnership as "transparency through redundancy," while Pierce displayed a flowchart shaped like a Möbius strip. Observers noted both men shaking hands without letting go of their respective briefcases.

Citizens are reassured that this initiative will streamline inquiries by ensuring they vanish in two jurisdictions at once.`,
    imagePrompt: 'Two officials shaking hands while exchanging identical briefcases connected by red tape, newsprint photo',
    tags: ['bureaucracy', 'coordination', 'classification'],
    statesMentioned: ['Texas', 'Virginia'],
    recurringCharacter: 'General Marcus Thompson & Classification Czar Donald Pierce',
    followUpHooks: [
      'Public comment portal now features dropdown menu labeled "Choose your preferred backlog"',
      'Pierce schedules celebratory coloring book signing at the annex gift shop'
    ]
  }
];
