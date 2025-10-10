import type { CardArticle } from './articleDatabase';

/**
 * Truth Faction Card-Specific Articles
 * Cards TRUTH-001 through TRUTH-200
 *
 * Each article follows the Paranoid Times style:
 * - Conspiratorial but humorous tone
 * - References to in-universe lore
 * - Recurring characters when appropriate
 * - State mentions for geographic context
 * - Follow-up hooks for narrative continuity
 */

export const truthArticles: CardArticle[] = [
  {
    cardId: 'TRUTH-001',
    faction: 'truth',
    headline: 'BLURRY BIGFOOT PHOTO BREAKS INTERNET—EXPERTS SAY "PIXELS DON\'T LIE"',
    subhead: 'Image forensics confirm authenticity; government remains suspiciously quiet',
    byline: 'By Marcus Webb, Cryptid Correspondent',
    body: `A grainy photograph uploaded to social media late Thursday night has racked up 47 million views and counting, showing what appears to be an eight-foot-tall bipedal figure crossing Highway 101 near Willow Creek, California.

Dr. Helena Frost of the Independent Image Analysis Institute ran the photo through seventeen different authenticity filters. "Every test came back clean," she reported. "No digital manipulation, no costume zipper visible under magnification. Either this is Bigfoot, or someone spent years engineering the perfect hoax—and forgot to focus the camera."

Local sheriff's departments in Northern California report a 340% spike in "sighting calls" since the photo went viral. The Bureau of Wildlife Management issued a terse statement: "We have reviewed the image and determined it shows a bear. A very tall, bipedal bear. Case closed."

Citizen journalists have already geo-located the exact spot where the photo was taken and are organizing weekend expeditions. One group is offering $10,000 for a clear follow-up photo. "Blurry worked once," explained organizer Kent Briggs. "But HD would be better."`,
    imagePrompt: 'Grainy newsprint photo of a blurry dark figure crossing a forest road at night, motion blur, amateur photography, black and white, vintage tabloid aesthetic',
    tags: ['cryptid', 'viral', 'investigation'],
    statesMentioned: ['California'],
    recurringCharacter: null,
    followUpHooks: [
      'Expedition teams report strange howls near photo site',
      'Government purchases all land within 2-mile radius of sighting'
    ]
  },
  {
    cardId: 'TRUTH-002',
    faction: 'truth',
    headline: 'ELVIS SPOTTED AT 3 A.M. DINER—ORDERS "USUAL," PAYS IN SILVER DOLLARS',
    subhead: 'Waitress confirms: "He tipped 200% and hummed \'Suspicious Minds\'"',
    byline: 'By Danny Ortega, Late-Night Beat',
    body: `A late-shift waitress at Ruby's All-Night Diner in Memphis, Tennessee, swears she served Elvis Presley a stack of midnight pancakes early Saturday morning—forty-eight years after his reported death.

"He walked in around 3:15, sat at the counter, ordered the number three with extra bacon," said Charlene Vickers, 34, who has worked at Ruby's for six years. "When I brought the check, he paid with these old silver dollars and told me to keep the change. Then he winked and said, 'Thank you, thank you very much.'"

Security camera footage from that time period is mysteriously corrupted—a 47-minute gap shows only static. The diner's owner, Ruby Martinez, dismissed the incident as "stress and long hours," but could not explain why the cash register contained twelve 1964 Kennedy half-dollars that morning.

Elvis sightings have spiked 23% in the Mid-South region over the past six months. Researchers tracking the phenomenon note that appearances cluster around diners, truck stops, and charity events—always late at night, always near Graceland.`,
    imagePrompt: 'Dimly lit diner interior at night, empty counter with coffee cup and half-eaten pancakes, grainy security camera angle, vintage 1970s aesthetic, newsprint quality',
    tags: ['elvis', 'sighting', 'witness'],
    statesMentioned: ['Tennessee'],
    recurringCharacter: 'Elvis',
    followUpHooks: [
      'Silver dollars traced to Federal Reserve vault reported empty in 1977',
      'Ruby\'s Diner receives anonymous donation covering six months of rent'
    ]
  },
  {
    cardId: 'TRUTH-003',
    faction: 'truth',
    headline: 'PASTOR REX\'S APOCALYPSE PODCAST HITS #1—DOOMSDAY BEANS™ SOLD OUT NATIONWIDE',
    subhead: '"The end is extremely nigh, and also gluten-free," warns controversial preacher',
    byline: 'By Sarah Kim, Faith & Conspiracy Desk',
    body: `Evangelical podcaster Pastor Rex Hollowell's weekly show "The Final Countdown (With Coupons)" has dethroned true-crime juggernauts to claim the top spot on streaming platforms, amassing 12 million weekly listeners who tune in for his unique blend of biblical prophecy and survival product placement.

"The signs are everywhere, friends," Rex intoned during Tuesday's episode. "Earthquakes, floods, politicians agreeing on things—it's all there in Revelation, Chapter 6, Verse 12. Which is why you need Doomsday Beans, now available in Original and Spicy varieties."

The freeze-dried legume company sponsoring his show reported a 670% sales spike within 48 hours of the episode airing. Their warehouse in Idaho is completely empty. "We did not anticipate this level of eschatological enthusiasm," admitted CEO Brandon Mills.

Pastor Rex, who operates out of a converted grain silo in Nebraska, has correctly predicted three minor earthquakes, two celebrity divorces, and one partial government shutdown. Critics point out he's also incorrectly predicted the Rapture seventeen times since 2019. "I'm refining my methodology," he countered in a statement.`,
    imagePrompt: 'Eccentric preacher in grain silo recording studio, surrounded by canned goods and doomsday supplies, vintage microphone, black and white newsprint photography',
    tags: ['media', 'prophecy', 'commerce'],
    statesMentioned: ['Nebraska', 'Idaho'],
    recurringCharacter: 'Pastor Rex',
    articleVariant: 'pastor_rex_stage_0',
    followUpHooks: [
      'Doomsday Beans contains "proprietary prophetic seasoning," label reveals',
      'Pastor Rex announces live event at undisclosed bunker location'
    ]
  },
  {
    cardId: 'TRUTH-004',
    faction: 'truth',
    headline: 'BAT BOY ENDORSES TRANSPARENCY—CAMPAIGN PLATFORM: "WINDOWS WITH NO CURTAINS"',
    subhead: 'Former tabloid icon enters political arena with radical openness agenda',
    byline: 'By Jennifer Cross, Political Oddities Reporter',
    body: `The half-human, half-bat creature known simply as "Bat Boy" announced his candidacy for a Virginia Senate seat Monday, running on a single-issue platform of absolute governmental transparency.

"For too long, the powerful have operated in darkness," Bat Boy squeaked at a press conference held in a Richmond parking garage. "I was raised in shadows. I know what they hide there. No more curtains. No more closed doors. Literally—I'm proposing legislation to remove all window coverings from federal buildings."

The 37-year-old cryptid-American, who first gained fame through Weekly World News coverage in the 1990s, has filed official paperwork and secured 12,000 signatures to appear on the ballot. His campaign slogan, "Finally, a candidate who actually drains the swamp—because he uses echolocation," has resonated with frustrated voters.

Political analysts are divided. "It's a publicity stunt," said Dr. Morton Riggs of Georgetown University. "On the other hand, his donation records are completely public, he's never been photographed at a fundraiser dinner, and he literally cannot lie—his sonar detects his own vocal inconsistencies."`,
    imagePrompt: 'Bat Boy at podium with campaign signs, grainy newsprint photo, political rally setting, dramatic lighting, vintage tabloid style',
    tags: ['politics', 'cryptid', 'transparency'],
    statesMentioned: ['Virginia'],
    recurringCharacter: 'Bat Boy',
    articleVariant: 'bat_boy_stage_0',
    followUpHooks: [
      'Major party operatives reportedly "very concerned" about echolocation abilities',
      'Bat Boy refuses to debate indoors, citing unfair acoustic advantage'
    ]
  },
  {
    cardId: 'TRUTH-005',
    faction: 'truth',
    headline: 'ALIEN WEDDING BLOCKS I-95 FOR FOUR HOURS—RICE IMMEDIATELY ABDUCTED',
    subhead: 'Interstellar ceremony causes massive traffic jam; couple reportedly "very much in love"',
    byline: 'By Robert Chen, Traffic & Extraterrestrial Affairs',
    body: `A wedding ceremony conducted by what witnesses describe as "definitely not-from-around-here entities" brought Interstate 95 to a standstill near Wilmington, Delaware, Thursday afternoon, leaving thousands of commuters stranded and deeply confused.

The event began around 2:30 PM when a luminous craft descended onto the northbound lanes, extending a ceremonial platform. Two vaguely humanoid figures in what appeared to be formal attire exchanged glowing objects while approximately 40 smaller beings observed from hovering attendance pods.

"I was on my way to a dentist appointment," said witness Patricia Gomez, 52. "Then there were—I don't know—space people getting married? The music was beautiful but hurt my teeth. When guests threw rice, it floated up and vanished into the ship. Very considerate, actually. No littering."

Delaware State Police arrived on scene but took no action. "What were we supposed to do?" asked Trooper David Mills. "They weren't breaking any traffic laws we have jurisdiction over. Also, their ship was blocking all lanes. We waited."

The ceremony concluded at 6:45 PM when the craft departed vertically at high speed. Traffic resumed. No rice was recovered.`,
    imagePrompt: 'Highway traffic jam with glowing UFO landed on road, small alien figures visible, cars backed up for miles, aerial news photography angle, black and white newsprint',
    tags: ['ufo', 'disruption', 'witness'],
    statesMentioned: ['Delaware'],
    recurringCharacter: null,
    followUpHooks: [
      'Wedding registry traced to store that doesn\'t exist—yet',
      'Several commuters report receiving "thank you" cards in unknown language'
    ]
  },
  {
    cardId: 'TRUTH-006',
    faction: 'truth',
    headline: 'LOCAL GRANDMA SEES TWO GHOSTS—THEY POLITELY ASKED FOR TEA',
    subhead: 'Spectral visitors demonstrate impeccable manners, discuss 1940s politics',
    byline: 'By Ellen Morrison, Paranormal Etiquette Correspondent',
    body: `Retired schoolteacher Dorothy Hutchins, 86, reports hosting two transparent visitors in her Savannah, Georgia, parlor last Tuesday—both of whom exhibited "better manners than most living people."

"They appeared around 4 o'clock, right when I usually have tea," Mrs. Hutchins explained. "A gentleman in a suit from the 1940s and a woman in a lovely dress. They asked—very politely—if I had Earl Grey. I did. We talked about Roosevelt for twenty minutes."

The spectral guests remained visible for approximately 35 minutes before fading "like sugar dissolving in hot tea," according to Hutchins. She found two teacups empty on the table afterward, though she doesn't remember pouring.

Paranormal investigator teams have attempted to replicate the encounter by sitting in Hutchins' parlor at 4 PM with various tea brands. No ghosts have returned, though one researcher noted "a distinct feeling of judgment when I forgot to use a saucer."

"I hope they come back," Hutchins said. "They were delightful company and didn't talk about their health problems once."`,
    imagePrompt: 'Elderly woman sitting in vintage parlor with empty teacups, faded transparent figures barely visible in background, soft lighting, nostalgic newsprint photography',
    tags: ['ghost', 'witness', 'wholesome'],
    statesMentioned: ['Georgia'],
    recurringCharacter: null,
    followUpHooks: [
      'Tea sales of Earl Grey spike 340% in Savannah area',
      'Historical society identifies ghosts as former city council members'
    ],
    preferredTone: 'LOCAL_COLOR'
  },
  {
    cardId: 'TRUTH-007',
    faction: 'truth',
    headline: 'UFO HOVERS OVER HIGH SCHOOL FOOTBALL GAME—HALFTIME SHOW "BEAMED IN FROM ANDROMEDA"',
    subhead: 'Visiting team loses 42-7; coach blames "unfair extraterrestrial advantage"',
    byline: 'By Travis McKenna, Sports & Sky Phenomena',
    body: `Friday night lights got significantly brighter in Roswell, New Mexico, when an unidentified aerial craft positioned itself directly above Goddard High School's homecoming game, apparently to observe—or critique—the halftime marching band performance.

The craft, described by witnesses as "disc-shaped, silent, and very shiny," appeared during the third quarter and remained stationary for 47 minutes. Its presence seemed to energize the home team, who scored 28 unanswered points while their opponents "kept looking up nervously," according to referee Tim Valdez.

"The band was playing our space-themed show—'Thus Spoke Zarathustra,' obviously," said band director Carol Foster. "Right during the climax, this thing shows up and starts emitting harmonic tones that perfectly complemented our brass section. Our tuba player cried."

The visiting team's coach filed an official protest, claiming "cosmic interference." League officials are reviewing footage but admit there's no rule specifically prohibiting UFO attendance. "We'll probably add one now," sighed Commissioner Sarah Ng.

The craft departed immediately after the game ended, ascending at what physics teacher Dr. Robert Kim calculated as "way too fast."`,
    imagePrompt: 'Night football game with glowing disc hovering over stadium lights, marching band on field, crowd looking up, dramatic sports photography, grainy newsprint',
    tags: ['ufo', 'sports', 'culture'],
    statesMentioned: ['New Mexico'],
    recurringCharacter: null,
    followUpHooks: [
      'Band invited to perform at "Interstellar Arts Festival" via mysterious email',
      'Winning team\'s quarterback recruited by university "not listed in any database"'
    ]
  },
  {
    cardId: 'TRUTH-008',
    faction: 'truth',
    headline: 'CRYPTID SELFIE GOES MAINSTREAM—#NoFilter #DefinitelyReal TRENDS WORLDWIDE',
    subhead: 'Influencer\'s forest photo receives 89M likes, brand sponsorship offers',
    byline: 'By Amanda Zhang, Digital Culture Reporter',
    body: `What started as a casual hiking photo posted by lifestyle influencer @TrendyTrailz has exploded into the most-liked image in social media history: a perfectly-framed selfie featuring what appears to be a genuine cryptid photobombing in the background.

The image shows influencer Kaylee Morrison, 24, smiling at the camera in Olympic National Forest, Washington. Visible over her left shoulder: a seven-foot-tall, fur-covered bipedal creature, also appearing to smile.

"I didn't even notice until people started commenting," Morrison said. "I thought it was a hiker in a costume. But when I zoomed in—those eyes. That's not a costume. Also it's holding a pinecone? Very gently?"

Forensic analysis from three independent firms confirms zero digital manipulation. The photo's metadata checks out. Morrison's location history places her exactly where she claimed to be. Most compelling: the cryptid's reflection is visible in her sunglasses.

Brands have offered Morrison endorsement deals worth an estimated $4.7 million. "Obviously we want her to recreate this with our hiking gear," explained OutdoorCo marketing director Kevin Strauss. "Preferably with the same cryptid. We're willing to negotiate."`,
    imagePrompt: 'Selfie-style photo of young woman in hiking gear, blurry but distinct large furry creature visible in background, forest setting, bright daylight, social media aesthetic converted to newsprint',
    tags: ['cryptid', 'viral', 'culture'],
    statesMentioned: ['Washington'],
    recurringCharacter: null,
    followUpHooks: [
      'Morrison returns to site with camera crew; crew returns without Morrison',
      'Cryptid spotted in background of 14 other influencer photos from same forest'
    ]
  },


  {
    cardId: 'TRUTH-009',
    faction: 'truth',
    headline: 'ALABAMA RADIO HOST PICKS UP CIVIL WAR BROADCAST FROM TOMORROW NIGHT',
    subhead: 'Montgomery ham operator records spectral soldiers debating SEC standings',
    byline: 'By Keisha Rollins, Temporal Interference Correspondent',
    body: `Community radio host Lawrence "Buzz" Riddick was tuning his late-night conspiracy show across unused frequencies when a crisp voice crackled through the static—identifying itself as Lieutenant Hiram Collins of the 3rd Alabama Infantry, transmitting from May 12, 1865, by way of "temporal rebound."

Collins' broadcast, captured in full on reel-to-reel tape, included tactical updates, a recipe for chicory coffee, and a heated argument with an unseen sergeant about the Auburn Tigers' chances next season. Historians note college football would not exist for another 24 years.

"They kept asking if 'Coach Saban' had secured the perimeter," Riddick recounted, still visibly shaking. "I told them he's retired, which made them say the timeline was compromised. Then the signal cut out and my station clock jumped ahead six minutes."

The Alabama Historical Commission has cordoned off Riddick's studio "for calibration" while the Department of Defense insists the recording is an elaborate hoax. Meanwhile, local tailgate groups are organizing a "Temporal Pep Rally" to welcome the spectral squad if they call again.`,
    imagePrompt: 'Ham radio studio cluttered with vintage equipment, ghostly Civil War soldiers reflected in window, newsprint grain',
    tags: ['time-anomaly', 'broadcast', 'civil-war'],
    statesMentioned: ['Alabama'],
    recurringCharacter: null,
    followUpHooks: [
      'University of Alabama physics department requests tape and immediately loses it',
      'SEC schedules emergency meeting to address "chronological recruiting"'
    ]
  },
  {
    cardId: 'TRUTH-011',
    faction: 'truth',
    headline: 'AURORA BOREALIS TURNS INTO SHOPPING LIST—TINFOIL ENTREPRENEUR TAKES THE HINT',
    subhead: 'Northern lights display spells out inventory orders over Fairbanks skyline',
    byline: 'By Lena Tavik, Polar Phenomena Beat',
    body: `Residents of Fairbanks, Alaska, reported seeing shimmering emerald words materialize within Tuesday night's aurora: "TINPLATE," "QUANTUM VELVET," and "BRING MORE HAND WARMERS." The luminous list scrolled repeatedly for eighteen minutes before dissolving into the usual curtains of light.

Maria Chen, Roswell's famed tinfoil haberdasher, just happened to be hosting her first Arctic pop-up shop that evening. "I was testing a portable paranoia kiosk," Chen explained, zipping up a parka lined with reflective foil. "When the sky places an order, you fulfill it. I'm not arguing with cosmic clientele."

Within hours, Chen's booth sold out of every metallic accessory, including experimental aurora antennae designed to "catch whispers from the magnetosphere." Local scientists claim the glowing grocery list was a trick of geomagnetic storms, yet several admitted privately they placed rush orders for Chen's new line of anti-hypnosis earmuffs.`,
    imagePrompt: 'Aurora borealis above snowy Fairbanks street market, glowing letters spelling supply list, newsprint photograph',
    tags: ['aurora', 'commerce', 'anomaly'],
    statesMentioned: ['Alaska'],
    recurringCharacter: 'Maria Chen',
    articleVariant: 'maria_chen_stage_0',
    followUpHooks: [
      'Chen announces permanent "Northern Lights Loyalty Program" with classified perks',
      'NOAA satellites detect coupon codes embedded in solar wind'
    ]
  },
  {
    cardId: 'TRUTH-012',
    faction: 'truth',
    headline: 'ARIZONA PETROGLYPHS UPDATE THEMSELVES OVERNIGHT—NOW FEATURING WIFI PASSWORD',
    subhead: 'Tribal monitors baffled as ancient carvings add QR code pointing to deep-space livestream',
    byline: 'By Mateo Ruiz, Desert Mystery Reporter',
    body: `Caretakers at Canyon Echo Preserve near Sedona arrived Wednesday to find a new panel of petroglyphs carved into sandstone—depicting precise orbital diagrams, an unfamiliar star map, and a scannable QR code etched with laser-like accuracy.

"The panel is at least 1,200 years old," said archaeologist Dr. Nyla Begay. "We dated lichen growth yesterday. Today the same surface features a password: 'open_the_gateway'. Lichens do not grow overnight. Neither do QR codes."

Visitors who scanned the code briefly accessed a live video feed of what appeared to be a horizon lined with obelisks under a violet sky. The stream ended abruptly when park rangers covered the panel with canvas. Federal officials now cite "digital preservation concerns" while visitors claim the rocks hum softly after sunset.`,
    imagePrompt: 'Red rock canyon wall with glowing petroglyphs including QR code, desert night sky, monochrome tabloid style',
    tags: ['ancient-tech', 'qr-code', 'ufo'],
    statesMentioned: ['Arizona'],
    recurringCharacter: null,
    followUpHooks: [
      'Tourists report receiving push notifications in unknown constellation patterns',
      'Smithsonian denies rushing portable laser scanners to Sedona—despite shipping manifest'
    ]
  },
  {
    cardId: 'TRUTH-013',
    faction: 'truth',
    headline: 'ARKANSAS RICE FIELD FORMS PERFECT CIRCUIT—TRACTOR STARTS SPEAKING BINARY',
    subhead: 'Delta farmers decode crop circle instructions for DIY weather machine',
    byline: 'By Rochelle Gaines, Agro-Anomaly Bureau',
    body: `Farmers outside Stuttgart, Arkansas, woke to find their rice paddies reorganized into a glistening spiral of irrigation ditches shaped like a printed circuit board. The design channels runoff into a central pond where a lone scarecrow now emits rhythmic beeps.

Electrical engineer Malik Jefferson analyzed the audio and confirmed it as eight-bit binary repeating the phrase "SYNC THE SKY." When the farm's antique tractor idled nearby, its exhaust plumes aligned with the spiral and formed glowing droplets that hovered three feet off the ground.

"It's like the whole field wants to become a weather computer," Jefferson said, toggling switches on a hastily assembled control panel. State officials arrived with soil sample kits and politely requested everyone "forget the talking tractor" while they handled "routine levee maintenance." Locals instead hosted a cookout, selling "Binary Biscuits" while the scarecrow continued pulsing instructions.`,
    imagePrompt: 'Aerial view of rice field shaped like circuit board, vintage tractor with glowing exhaust, newsprint grain',
    tags: ['crop-circle', 'techno-magic', 'farming'],
    statesMentioned: ['Arkansas'],
    recurringCharacter: null,
    followUpHooks: [
      'Arkansas Cooperative Extension issues pamphlet titled "How to Decline Sentient Machinery"',
      'Scarecrow firmware update scheduled for next thunderstorm'
    ]
  },
  {
    cardId: 'TRUTH-014',
    faction: 'truth',
    headline: 'CONNECTICUT TOWN LIBRARY CHECKS OUT BOOK THAT WRITES BACK',
    subhead: 'Mystic patrons receive personalized footnotes advising against property tax compliance',
    byline: 'By Asha Patel, Annotated Phenomena Desk',
    body: `The Mystic Free Library's inter-library loan system delivered an unmarked tome titled *Ledger of the Unheard Majority*. By morning, every margin contained fresh ink responding to whoever last touched the page.

"I underlined a sentence about municipal bonds and the book underlined me back," said librarian Everett Sloan. "It scribbled, 'Your town hall basement is hollow—ask about the echo.'" Several patrons confirmed the tome offered specific, eerily relevant advice, including a detailed recipe for invisibility chowder.

Town officials confiscated the book "for auditing," yet it reappeared on the returns cart each night accompanied by handwritten late fees payable in "civic courage." The Governor's office insists the phenomenon is a viral marketing stunt, though the state budget website now displays invisible ink when printed.`,
    imagePrompt: 'Cozy New England library table with open book showing glowing handwritten notes, newsprint photograph',
    tags: ['library', 'sentient-text', 'civic-duty'],
    statesMentioned: ['Connecticut'],
    recurringCharacter: null,
    followUpHooks: [
      'Mystic town meeting agenda replaced with blank pages that whisper when folded',
      'State comptroller denies installing "metaphysical audit" line item'
    ]
  },
  {
    cardId: 'TRUTH-015',
    faction: 'truth',
    headline: 'FLORIDA MAN SURFS HURRICANE, DELIVERS MAIL TO EVERY HOUSE ON ROUTE',
    subhead: 'Key West residents applaud "stormside service" as postal inspectors faint',
    byline: 'By Jasmine Ortiz, Sunshine State Shenanigans Reporter',
    body: `As Hurricane Persephone brushed past the Florida Keys, an unidentified barefoot surfer wearing a postal satchel carved through twenty-foot swells, tossing perfectly sorted envelopes onto porches with preternatural accuracy.

"He was laughing like the wind owed him money," said eyewitness Captain Luis Dominguez. Security footage shows the surfer—matching the legendary Florida Man's description—riding a bioluminescent wave that briefly formed the shape of the USPS eagle. Each envelope bore a handwritten note: "Through rain, sleet, wind, cosmic interference..."

The U.S. Postal Service called the incident "unauthorized heroism" and reminded citizens that surfing during a hurricane voids warranty coverage on stamps. Florida Man reportedly left behind a waterproof zine outlining evacuation routes that double as treasure maps.`,
    imagePrompt: 'Stormy ocean with surfer carrying mail satchel, houses in background, dramatic newsprint',
    tags: ['florida-man', 'weather', 'heroics'],
    statesMentioned: ['Florida'],
    recurringCharacter: 'Florida Man',
    articleVariant: 'florida_man_stage_0',
    followUpHooks: [
      'Postal Service pilots new "Extreme Delivery" program with Florida Man as consultant',
      'Treasure map route corresponds to shuttered Navy listening posts'
    ]
  },
  {
    cardId: 'TRUTH-016',
    faction: 'truth',
    headline: 'MAUNA KEA OBSERVATORY RECORDS TOURIST-CAMO UFO—AGENT CLAIMS IT\'S JUST "SUNGLASSES GLARE"',
    subhead: 'Visiting officials distribute identical aviators moments before footage erased',
    byline: 'By Noelani Kealoha, Pacific Skywatch Desk',
    body: `Astronomers atop Hawaii's Mauna Kea captured crystal-clear footage of a craft mimicking the shape and coloration of nearby tourists—complete with floral shirts rippling along its hull. The camouflaged object hovered silently, mirroring every group selfie for nine minutes.

Before the team could publish their findings, Agent Smitherson of the newly formed Reflection Integrity Bureau arrived by helicopter, handing out complimentary mirrored sunglasses and "voluntary consent" forms. Within hours, the observatory's hard drives displayed only looping videos of cheerful vacationers, even though witnesses swear they saw the craft wink and flash a shaka sign.

"There's nothing unusual here besides the unparalleled Hawaiian sunshine," Smitherson said while confiscating telescopic lens caps. Local tour guides now offer "Maybe You Saw It" packages, promising refunds if no reflective anomalies photobomb their guests.`,
    imagePrompt: 'Observatory dome at dusk with translucent UFO mimicking tourists, agent handing out sunglasses, grainy newsprint',
    tags: ['ufo', 'coverup', 'tourism'],
    statesMentioned: ['Hawaii'],
    recurringCharacter: 'Agent Smitherson',
    articleVariant: 'agent_smitherson_stage_0',
    followUpHooks: [
      'Tourists report sunglasses whispering directions to hidden lava tubes',
      'Agent Smitherson requests reimbursement for 400 pairs of identical aviators'
    ]
  },
  {
    cardId: 'TRUTH-017',
    faction: 'truth',
    headline: 'ILLINOIS COMMUTER TRAIN ARRIVES FIVE MINUTES EARLY—PASSENGERS FROM PARALLEL LINE ONBOARD',
    subhead: 'Chicago transit authorities baffled by riders holding tickets to non-existent stops',
    byline: 'By Andre Whitfield, Urban Loop Investigator',
    body: `Monday's 7:32 AM Metra from Aurora rolled into Chicago's Ogilvie Station five minutes ahead of schedule, doors sliding open to reveal commuters wearing nearly—but not exactly—local fashion. Their transit cards displayed holographic logos for the "Midwest Unified Rail," an agency that does not exist in this timeline.

"They asked where the skyline went," said conductor Janelle Ruiz. "When we pointed outside, they insisted Chicago is supposed to have three Sears Towers stacked like a totem pole." The unfamiliar passengers vanished when police requested identification, leaving behind briefcases full of architectural renderings labeled "Project Sky Ladder."

City officials attribute the event to "enthusiastic cosplayers" from a transit fan club, though CTA engineers quietly installed new sensors in rail yards. One abandoned briefcase hums whenever the Cubs win.`,
    imagePrompt: 'Chicago train platform with slightly out-of-place commuters, briefcase glowing, newsprint style',
    tags: ['parallel-world', 'transit', 'urban-mystery'],
    statesMentioned: ['Illinois'],
    recurringCharacter: null,
    followUpHooks: [
      'Blueprints reveal optional bridge to "Lake Michigan Annex" that no map shows',
      'Commuters from our timeline now report vivid dreams of stacked skyscrapers'
    ]
  },
  {
    cardId: 'TRUTH-019',
    faction: 'truth',
    headline: 'INDIANA REVIVAL TENT LEVITATES—PASTOR REX PREDICTS CORN YIELDS FROM MID-AIR',
    subhead: 'Floating sermon livestreamed to 3 million viewers before power grid bows in prayer',
    byline: 'By Caleb Monroe, Heartland Wonders Correspondent',
    body: `Pastor Rex's traveling prophecy roadshow pitched its tent outside Terre Haute, Indiana, only for the entire structure to rise ten feet above ground mid-sermon. Witnesses say the tent's stakes glowed red while Rex recited crop forecasts accurate down to the bushel for every farm in Vigo County.

"The harvest angels are running their audits," Rex proclaimed as folding chairs gently floated, allowing congregants to recline mid-air. Local farmers confirmed his predictions matched their secret soil data to the decimal.

Utility crews arrived when nearby substations began emitting gospel harmonies. The grid stabilized the moment Rex announced a limited-edition Doomsday Beans flavor: "Hoosier Harvest." Critics accused him of using magnets. Rex responded, "Magnets wish they had this booking."`,
    imagePrompt: 'Revival tent levitating above cornfield, preacher addressing floating congregation, newsprint photograph',
    tags: ['pastor-rex', 'miracle', 'agriculture'],
    statesMentioned: ['Indiana'],
    recurringCharacter: 'Pastor Rex',
    articleVariant: 'pastor_rex_stage_1',
    followUpHooks: [
      'State fair invites Pastor Rex to judge giant pumpkin contest—pumpkins begin chanting psalms',
      'Doomsday Beans releases Hoosier Harvest flavor exclusively via drone drop'
    ]
  },
  {
    cardId: 'TRUTH-020',
    faction: 'truth',
    headline: 'IOWA WIND FARM TURNS INTO GIANT ETCH-A-SKETCH—SKY DRAWS CROP REPORTS',
    subhead: 'Turbines pivot in unison to spell out market futures visible from Des Moines',
    byline: 'By Priya Banerjee, Renewable Riddles Desk',
    body: `Residents near Ames watched in awe as wind turbines rotated with impossible precision, their blades tracing lines of condensed mist that spelled out real-time commodity prices. The aerial handwriting updated every thirty seconds, occasionally doodling smiling corn cobs with suspiciously knowing eyes.

"It's like the sky hired an accountant," joked farmer Leland Ortiz, who confirmed the forecasts matched insider reports usually paywalled by agribusiness giants. Drones attempting to film the spectacle lost navigation, instead circling to form punctuation marks.

State regulators called the incident "a temporary advertisement for wind literacy" before quietly filing for emergency patents. Meanwhile, local high schools now offer elective courses in "Aerial Penmanship Appreciation" taught by meteorologists with chalk dust on their sleeves.`,
    imagePrompt: 'Wind farm with turbine trails forming letters in sky, Midwestern landscape, newsprint aesthetic',
    tags: ['renewable-energy', 'skywriting', 'economics'],
    statesMentioned: ['Iowa'],
    recurringCharacter: null,
    followUpHooks: [
      'Commodity traders scramble to rent billboards facing the wind farm',
      'Turbines briefly sketch out coordinates to an unlisted grain silo'
    ]
  },
  {
    cardId: 'TRUTH-010',
    faction: 'truth',
    headline: 'TABLOID THUNDER SPECIAL EDITION—INK SMUDGES REVEAL MORE THAN BLACK BARS',
    subhead: 'Print defect exposes classified documents government "definitely didn\'t leak"',
    byline: 'By Marcus Webb & Staff Writers',
    body: `A printing error at Tabloid Thunder's production facility has inadvertently created the most transparent issue in journalism history—literally. Ink bleeding through from a "classified documents" story on page 3 has rendered the government's redaction bars completely useless.

"We were doing a story on recently declassified UFO files," explained editor-in-chief Rita Vasquez. "Standard stuff—mostly black bars, a few visible words. But our ancient printing press uses this heavy ink that soaks through. When you hold page 3 up to light, you can read everything underneath the redactions. Everything."

Within hours of the issue hitting newsstands, the entire print run of 450,000 copies sold out. Secondary market prices reached $200 per copy before government agents quietly began purchasing them in bulk. "Very casually, very legally," assured Treasury Department spokesperson Michael Chen, carrying seven boxes of magazines to an unmarked van.

Tableid Thunder has received 47 cease-and-desist letters, three bomb threats that "didn't sound very serious," and one job offer from a "non-governmental organization that definitely isn't the CIA." The paper's legal team is framing the letters.`,
    imagePrompt: 'Tabloid newspaper page held up to light showing text visible through ink bleed, dramatic lighting, investigative journalism aesthetic, vintage newsprint quality',
    tags: ['media', 'classified', 'exposure'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Tabloid Thunder\'s printer arrested for "unrelated tax irregularities"',
      'Seventeen senators request "personal copies for archival purposes"'
    ]
  },

  {
    cardId: 'TRUTH-018',
    faction: 'truth',
    headline: 'ELVIS PHOTOGRAPHED PILOTING UFO—"THANK YOU, INTERSTELLAR MUCH"',
    subhead: 'Leaked military footage shows The King at helm of alien craft over Nevada',
    byline: 'By Danny Ortega & Sarah Kim, Co-Investigation',
    body: `Classified radar footage obtained by sources within Nellis Air Force Base appears to show Elvis Presley—or a being with his exact facial features, hairstyle, and sequined jumpsuit—operating a disc-shaped craft in restricted airspace last month.

The 4-minute clip, verified as authentic by two former Air Force technicians, shows the craft performing maneuvers "inconsistent with known physics but very consistent with Elvis's stage moves," according to aerospace analyst Dr. Linda Kowalski.

Audio from the encounter, captured by surprised F-16 pilots attempting to intercept, includes the phrases "Taking care of business" and "Thank you, thank you very much" broadcast on military frequencies.

"We scrambled to intercept," said one pilot, speaking anonymously. "The thing did a barrel roll, waggled its... wings? Lights? Then shot straight up at impossible speed while playing 'Hound Dog' over the radio. My instruments couldn't track it. Also, I cried a little."

Air Force officials deny the footage exists despite its presence on seventeen different hard drives currently circulating among UFO researchers. Elvis Presley Enterprises declined to comment but updated their website's FAQ with: "We can neither confirm nor deny intergalactic touring schedules."`,
    imagePrompt: 'Grainy military radar footage showing UFO with enhanced inset showing Elvis-like figure in pilot seat, classified stamp visible, black and white technical photography',
    tags: ['elvis', 'ufo', 'classified'],
    statesMentioned: ['Nevada'],
    recurringCharacter: 'Elvis',
    followUpHooks: [
      'Jump suit recovered from crash site tests positive for "impossible fabric"',
      'Graceland gift shop begins selling "Interstellar Tour 2024" merchandise'
    ]
  },

  {
    cardId: 'TRUTH-050',
    faction: 'truth',
    headline: 'BAT BOY RETURNS TO POLITICS—ANNOUNCES SENATE CAMPAIGN (AGAIN)',
    subhead: '"Third time\'s the charm," says cryptid candidate with 97% approval among bats',
    byline: 'By Jennifer Cross, Campaign Trail Reporter',
    body: `After two unsuccessful runs for public office, the half-human, half-bat political phenomenon known as Bat Boy has officially filed for a Virginia Senate seat—this time with unprecedented grassroots support and a campaign war chest that "appeared mysteriously in a cave."

"The darkness is done hiding," Bat Boy announced to a crowd of 12,000 at a midnight rally in Arlington. "Every failed campaign taught me something. Mainly that scheduling daytime events was a strategic error. This time, all rallies at dusk or later."

Unlike previous campaigns plagued by logistical issues—including his inability to shake hands without hanging upside-down and a debate performance where he echolocated the moderator's lies in real-time—this cycle features professional staffers who "understand nocturnal scheduling needs."

Polling shows Bat Boy leading among voters aged 18-34 by 23 points. "He's authentic," explained college student Maya Patel, 21. "You can't fake sonar. Also his anti-corruption platform is strong: he literally cannot be bribed because he doesn't understand money. He tried to pay for TV ads with moths."

Bat Boy's primary opponent, incumbent Senator Hughes, called the campaign "a distraction." Hughes then checked his watch nervously when reminded that Bat Boy can hear heartbeats from 200 feet away.`,
    imagePrompt: 'Bat Boy at podium surrounded by enthusiastic night rally crowd, campaign banners, flash photography, dramatic political event styling, high-contrast newsprint',
    tags: ['politics', 'cryptid', 'campaign'],
    statesMentioned: ['Virginia'],
    recurringCharacter: 'Bat Boy',
    followUpHooks: [
      'Bat Boy proposes "Sonar Transparency Act" requiring all politicians to debate in darkness',
      'Rival campaign struggles to book venues willing to host competing midnight events'
    ]
  },
  {
    cardId: 'TRUTH-021',
    faction: 'truth',
    headline: 'KANSAS TORNADO SORTS EVERY MAILBOX—POSTAL SERVICE CALLS IT "WIND-ASSISTED"',
    subhead: 'Dust devil arranges letters by conspiracy level while government denies breeze-based intelligence',
    byline: 'By Lila Redding, Plains Anomaly Desk',
    body: `Residents of Dodge City, Kansas, woke to find their cul-de-sacs glittering with neatly stacked envelopes after a midnight tornado scooped up the entire town's outgoing mail and redistributed it into labeled piles—"BILLS," "COUPONS," and "NEED-TO-KNOW." The vortex spun just long enough to deposit a fourth stack titled "TRUST NOBODY" outside city hall.

Retired postal inspector Marlene Ortiz swears the storm whistled zip codes while orbiting. "It sang like a barbershop quartet about shadow budgets," she told the Paranoid Times, clutching a stamp album that now glows faintly. "My rain gauge filled with return-to-sender slips spelling coordinates."

The Department of Meteorological Normalcy insists the event was "an energetic but otherwise ordinary gust" and asked residents to recycle any "prescient mail" for privacy reasons. Locals instead laminated the letters and launched a neighborhood watch for rogue breezes.`,
    imagePrompt: 'Newsprint photo of rural cul-de-sac with tornado in distance neatly stacking envelopes into labeled piles, neighbors watching in pajamas',
    tags: ['weather', 'postal', 'anomaly'],
    statesMentioned: ['Kansas'],
    recurringCharacter: null,
    followUpHooks: [
      'Letter piles begin resorting themselves when conspiracy podcasts play nearby',
      'Postal Service schedules listening tour to ask tornado about seasonal overtime'
    ]
  },
  {
    cardId: 'TRUTH-022',
    faction: 'truth',
    headline: 'BOURBON DISTILLERY TIME-LOOPS—BARRELS AGE THEMSELVES TWICE A DAY',
    subhead: 'Kentucky coopers report déjà vu hangover as mash rewinds on command',
    byline: 'By Everett Cole, Temporal Tastings Reporter',
    body: `A boutique distillery outside Bardstown, Kentucky, says its rickhouse now runs on time-stuttered humidity after a lightning strike etched clock hands into the copper still. Barrels age forward eight hours, then snap back, leaving bourbon that tastes like it remembers secrets you have not confessed yet.

Master distiller Lashay Caldwell demonstrated for our cameras by tapping a cask that refilled itself mid-pour. "It hums the same chorus backwards every time the timeline hiccups," she noted. "Also the mash keeps recommending stocks I don't own yet."

Federal beverage inspectors offered an enthusiastic thumbs-up while simultaneously denying any anomaly. "If anything, the barrels are aging at precisely the federally approved rate twice," said Agent Gerald Pike, who pocketed a vial labeled 'DO NOT OPEN UNTIL LAST WEEK.' Locals are bottling the echo as Chrono Reserve before headquarters notices.`,
    imagePrompt: 'Old Kentucky rickhouse interior with glowing bourbon barrels showing ghostly clock hands, inspector tasting sample, newsprint photography',
    tags: ['time-anomaly', 'bourbon', 'commerce'],
    statesMentioned: ['Kentucky'],
    recurringCharacter: null,
    followUpHooks: [
      'Distillery offers futures market in bottles that already sold yesterday',
      'Tour buses appear twice daily and passengers swear they met themselves'
    ]
  },
  {
    cardId: 'TRUTH-023',
    faction: 'truth',
    headline: 'LOUISIANA BAYOU GATOR BAND DROPS DEBUT ALBUM AT MIDNIGHT SWAMP RAVE',
    subhead: 'Reptilian musicians play zydeco on bioluminescent reeds; fish line up for autographs',
    byline: 'By Simone Thibodeaux, Gulf Coast Groove Correspondent',
    body: `Tourists on an airboat near Houma swear they stumbled onto a floating stage assembled from driftwood where eight alligators, wearing vintage headphones, played washboards and accordions carved from river reeds. The creatures performed a full zydeco set before submerging and leaving behind a cassette tape labeled 'DO NOT LET THE STATE HEAR THIS.'

"They had better rhythm than our human band," admitted guide Percy Landry, who sold out of earplugs and glow sticks in minutes. "One gator winked and told me to check track three backwards for evacuation routes." Landry insists the tape now refuses to stop recording new verses about levees.

Louisiana Wildlife and Fisheries agents arrived with nets but only caught a souvenir T-shirt reading 'SWAMP RAVE RESIDENCY—NIGHT TWO.' Officials dismissed the event as 'Cajun folklore' while ordering pallets of underwater microphones.`,
    imagePrompt: 'Nighttime bayou scene with alligators standing like musicians on a wooden raft, playing zydeco instruments under string lights, fans watching from airboats, grainy tabloid style',
    tags: ['music', 'cryptid', 'bayou'],
    statesMentioned: ['Louisiana'],
    recurringCharacter: null,
    followUpHooks: [
      'Cassette tape leaks instructions for draining "phantom levees" that appear on old maps',
      'Local radio station receives cease-and-desist letter written in gator claw marks'
    ]
  },
  {
    cardId: 'TRUTH-024',
    faction: 'truth',
    headline: 'MAINE LIGHTHOUSE PROJECTS SECRET WEATHER WARNINGS STRAIGHT INTO DREAMS',
    subhead: 'Keeper reports nightly visitors leaving with tide charts etched on eyelids',
    byline: 'By Cordelia Pike, Atlantic Watch Bureau',
    body: `The Pemaquid Point Lighthouse in Maine now casts its beam inward after midnight, according to weary keeper Jonah Bell. "Instead of sweeping the horizon, it folds through the fog and lands in your sleep," he said, presenting a guest log filled with sketches drawn while unconscious.

Bell hosted a slumber party for curious locals; each awoke describing the same broadcast: a calm voice naming storm fronts, rumored submarines, and whoever skipped their library fines. One visitor found a barnacle stuck to their forehead spelling 'CALL YOUR SENATOR.'

Coast Guard officials claimed the effect is a prank perpetrated by 'overly imaginative maritime enthusiasts' before quietly requisitioning every pillow within three counties. Bell has begun charging for dream-weather consultations payable in sea glass or classified maps.`,
    imagePrompt: 'Foggy lighthouse interior with keeper watching spectral light projecting into sleeping visitors, nautical charts glowing, vintage newsprint photo',
    tags: ['lighthouse', 'dreams', 'weather'],
    statesMentioned: ['Maine'],
    recurringCharacter: null,
    followUpHooks: [
      'Visitors start sleepwalking to deliver storm warnings to inland towns',
      'Coast Guard installs "Do Not Nap" signs that glow when ignored'
    ]
  },
  {
    cardId: 'TRUTH-025',
    faction: 'truth',
    headline: 'MARYLAND CRABS FORM PICKET LINE AROUND SECRET SUBMARINE DOCK',
    subhead: 'Crustaceans clack claws in Morse code protesting "unfair bait practices"',
    byline: 'By Jamal Wren, Chesapeake Accountability Reporter',
    body: `Dockworkers in Annapolis arrived to find the pier to a rumored clandestine submarine base blocked by thousands of blue crabs arranged in perfect marching rows. Each claw snapped in a rhythm that maritime cryptographers translated as 'PAY SCALE: HAZARD CLAWS.'

"Every time we tried to step over them, they shoved us back toward the parking lot," said harbormaster Elise Greene, whose boat keys now smell like Old Bay and ozone. "One crab flashed a badge reading 'Union Local 337?.'"

Naval spokespeople insisted the crustaceans were 'seasonal migration' before fencing off the pier and issuing hush orders to seafood restaurants. Local activists are printing solidarity posters featuring a crab holding classified blueprints.`,
    imagePrompt: 'Newsprint photo of pier swarmed by organized blue crabs forming picket signs with shells, submarine silhouette in background, security guards baffled',
    tags: ['maritime', 'protest', 'cryptid-adjacent'],
    statesMentioned: ['Maryland'],
    recurringCharacter: null,
    followUpHooks: [
      'Crabs redirect shipments to mysterious floating co-op labeled "Deep Water Union"',
      'Navy cafeteria suddenly serves imitation crab and denies connection'
    ]
  },
  {
    cardId: 'TRUTH-026',
    faction: 'truth',
    headline: 'MASSACHUSETTS WITCHES UNIONIZE, FILE FOIA REQUEST FOR SALEM TRIAL TRANSCRIPTS',
    subhead: 'Collective bargaining demands include broom lane priority and spectral healthcare',
    byline: 'By Abigail Fenwick, New England Occult Labor Desk',
    body: `A coven of modern witches gathered on Salem Common with clipboards, chanting "What do we want? Transparent archives! When do we want them? Historically!" Their petition to the Massachusetts State Archives requests complete, unredacted Salem Witch Trial transcripts plus reimbursement for centuries of "emotional haunting."

Organizer Moira Caldwell explained the union's platform includes broom-lane priority on toll roads and mandatory OSHA guidelines for hex workspaces. "If they can regulate forklift safety, they can regulate potion fumes," she told our reporter while conjuring a perfect pie chart out of ravens.

State officials congratulated the coven on "civic engagement" while forwarding their FOIA request to an office that technically burned down in 1704. The witches vowed to astral project into the filing cabinets if paperwork stalls.`,
    imagePrompt: 'Witches in modern protest attire holding clipboards and broomsticks, chanting on Salem Common, spectral banners overhead, black and white tabloid style',
    tags: ['witchcraft', 'labor', 'history'],
    statesMentioned: ['Massachusetts'],
    recurringCharacter: null,
    followUpHooks: [
      'Archived transcripts start reappearing with handwritten apologies from 1692 clerks',
      'Turnpike authority considers dedicated broom corridor as pilot program'
    ]
  },
  {
    cardId: 'TRUTH-027',
    faction: 'truth',
    headline: 'DETROIT ASSEMBLY LINE STARTS BUILDING GHOST CARS FOR AFTERLIFE COMMUTE',
    subhead: 'Spectral sedans roll off line with ectoplasmic warranties and Motown playlists',
    byline: 'By Darryl Vaughn, Rust Belt Resurrection Beat',
    body: `Workers at a dormant Detroit auto plant flipped the breakers for a nostalgia tour only to discover conveyor belts running themselves, welding blue-white chassis that flickered between solid steel and transparent mist. Finished models rolled out humming Motown hits backward.

"We tried to shut it off, but the control panel just said 'PRODUCTION TARGET MET: AFTERWORLD SHIFT,'" said former line foreman Renee Holloway. "One car offered me a ride to 'see how the other side commutes.'"

The resurrected automaker denies involvement, blaming a viral marketing campaign. Meanwhile, ghost tour operators are already bundling rides as "Test Drive the Beyond" with waiver forms that evaporate after signature.`,
    imagePrompt: 'Abandoned Detroit factory with glowing transparent cars on assembly line, workers in awe, vintage industrial newsprint aesthetic',
    tags: ['automotive', 'ghost', 'industry'],
    statesMentioned: ['Michigan'],
    recurringCharacter: null,
    followUpHooks: [
      'Spectral sedans request toll transponders keyed to obituaries',
      'Motown royalties spike after songs chart on "Ectoplasm FM"'
    ]
  },
  {
    cardId: 'TRUTH-028',
    faction: 'truth',
    headline: 'MINNESOTA LAKE FREEZES INTO GLASS—SHOWS LIVE FEED OF FUTURE ICE FISHING WINS',
    subhead: 'Anglers binge-watch next week’s catches while lake mutters suspicious odds',
    byline: 'By Briana Soderberg, Upper Midwest Oracle Correspondent',
    body: `Lake Mille Lacs froze overnight into a flawless pane of glass that plays tomorrow's highlight reel for every ice house anchored above it. Each angler sees a different feed: exactly when their line will twitch and what cryptic message the fish will burp upon release.

"It keeps spoiling the suspense!" complained tournament regular Gus Lindstrom, who duct-taped oven mitts to his face after the lake showed him losing to his own cousin. "Also the fish told me to buy stock in ladles."

The Minnesota Department of Natural Resources insists the lake is "just very clear this year" while deploying anti-spoiler drones to cover reflective areas. Locals now host watch parties and sell snacks labeled "Pre-Game Future Popcorn."`,
    imagePrompt: 'Frozen Minnesota lake with transparent surface showing shimmering future scenes of ice fishing, anglers staring at reflections, newsprint style',
    tags: ['lake', 'prophecy', 'fishing'],
    statesMentioned: ['Minnesota'],
    recurringCharacter: null,
    followUpHooks: [
      'Casino boats anchor nearby offering bets against the lake’s predictions',
      'Future footage glitches to show marching walleyes with protest signs'
    ]
  },
  {
    cardId: 'TRUTH-029',
    faction: 'truth',
    headline: 'MISSISSIPPI STEAMBOAT PLAYS JAZZ WITH RIVER ITSELF AS BACKUP VOCALIST',
    subhead: 'Water rises in harmonies, spells coordinates to hidden levee archive',
    byline: 'By Coltrane Brooks, Delta Soundwave Bureau',
    body: `During a midnight cruise near Vicksburg, the historic steamboat Magnolia Belle sprouted glowing brass pipes that dipped into the Mississippi River. Passengers watched as the water itself rose in looping arcs, singing backup vocals that harmonized with the boat’s calliope.

"The river spelled out GPS coordinates in quarter notes," marveled bandleader Clarissa Dupree, whose trumpet now emits fog every time she plays a B-flat. "One verse was just the words 'CHECK THE LOCKER UNDER BERTH FOUR' over and over."

Army Corps officials waved off the spectacle as "river acoustics" before quietly reserving every cabin on next week’s cruise. Ticket prices tripled once locals realized the chorus answers questions about flood insurance.`,
    imagePrompt: 'Steamboat on Mississippi at night with glowing pipes dipping into water, musical notes formed by water arcs, passengers applauding, vintage newsprint photo',
    tags: ['music', 'river', 'prophecy'],
    statesMentioned: ['Mississippi'],
    recurringCharacter: null,
    followUpHooks: [
      'Coordinates lead to sealed room filled with flood maps dated 2043',
      'Jazz charts from the cruise suddenly appear in Smithsonian catalog'
    ]
  },
  {
    cardId: 'TRUTH-030',
    faction: 'truth',
    headline: 'MISSOURI ARCH BEAMS SECRET TOURIST QUIZ INTO EVERY CAMERA ROLL',
    subhead: 'Gateway structure demands conspiracy trivia answers before releasing selfies',
    byline: 'By Penelope Grant, Heartland Memory Auditor',
    body: `Visitors snapping photos beneath the Gateway Arch discovered their camera galleries replaced with a sparkling questionnaire titled 'SO YOU WANT TO REMEMBER THIS?' Questions include 'Name three secret tunnels under St. Louis' and 'Who really designed the arch's hidden hinge?'

"I tried to skip the quiz and it blurred every picture of my family," said tourist Devin Cho, whose phone now flashes Morse code whenever he fibs about souvenir purchases. "When I answered correctly, it gave me a crisp panorama plus a coupon for anti-mind-wipe sunglasses."

National Park Service rangers insist the quiz is an augmented-reality art project while scanning visitors for 'arch-imprinted' memories. Local hackers are compiling answer keys and hosting trivia nights to outsmart the structure.`,
    imagePrompt: 'Gateway Arch towering over tourists whose phones display glowing trivia questions, ranger watching nervously, grainy newsprint look',
    tags: ['monument', 'memory', 'technology'],
    statesMentioned: ['Missouri'],
    recurringCharacter: null,
    followUpHooks: [
      'Arch projects bonus question about vanished 8th riverboat casino',
      'Souvenir stands sell scratch-off cards promising "one free unredacted selfie"'
    ]
  },
  {
    cardId: 'TRUTH-031',
    faction: 'truth',
    headline: 'MONTANA RANCH DISCOVERS CONSTELLATION STAMPED INTO CATTLE BRANDS OVERNIGHT',
    subhead: 'Herd forms perfect star map to rumored sky gate; ranchers take astronomy crash course',
    byline: 'By Wyatt Greene, High Plains Signal Watch',
    body: `Cattle outside Livingston, Montana, woke up with fresh branding—not from human hands, but from a beam that seared constellations across their hides. When the herd clustered near the barn, the glowing marks aligned into a three-dimensional star chart pointing toward an uncharted canyon.

"I was planning a normal calving season, not an astrophysics thesis," groaned rancher Jolene Hart, who now wears welding goggles at breakfast. "Every time the herd exhales, it spells coordinates in steam."

Representatives from the Bureau of Land Management insisted the phenomenon is "heat lightning" but immediately erected a portable planetarium on-site. Local 4-H clubs are now teaching 'Brand-based Navigation' to anyone with binoculars.`,
    imagePrompt: 'Montana pasture at dawn with cattle bearing glowing constellation brands, rancher holding binoculars, Milky Way overhead, grainy newsprint style',
    tags: ['agriculture', 'astronomy', 'ufo'],
    statesMentioned: ['Montana'],
    recurringCharacter: null,
    followUpHooks: [
      'Star map shifts nightly to avoid surveillance drones',
      'Uncharted canyon now hums when approached with cowboy poetry books'
    ]
  },
  {
    cardId: 'TRUTH-032',
    faction: 'truth',
    headline: 'NEBRASKA CORN SILO OPENS TO REVEAL UNDERGROUND PARANOIA MUSEUM',
    subhead: 'Hidden exhibits narrate future conspiracies with animatronic scarecrows',
    byline: 'By Melissa Ortiz, Heartland Heritage Sleuth',
    body: `A thunderstorm toppled an old grain silo near Kearney, splitting it like a stage curtain to reveal a subterranean museum fully stocked with narrated displays of conspiracies that have not happened yet. Animatronic scarecrows guide visitors through exhibits labeled 'Crop Circle Etiquette 2027' and 'How to Recognize Your Evil Twin in 2031.'

"The mannequins insisted we sign the guestbook in pencil because ink hasn't been invented yet," said local history teacher Trevor Dimas, who left with a brochure that glows only under moonlight. "There's even a gift shop selling postcards from tomorrow's tornado."

State officials declared the silo "unsafe" and attempted to fill it with concrete, but the trucks dumped kernels instead, spelling 'KEEP GOING DOWN.' Tour groups now descend nightly with audio guides that occasionally scream.`,
    imagePrompt: 'Collapsed Nebraska grain silo revealing lit underground museum with scarecrow guides, visitors descending stairs, tabloid black and white photo',
    tags: ['museum', 'prophecy', 'agriculture'],
    statesMentioned: ['Nebraska'],
    recurringCharacter: null,
    followUpHooks: [
      'Audio guides start giving stock tips in reverse whisper',
      'Silo gift shop coupons valid only after next hailstorm'
    ]
  },
  {
    cardId: 'TRUTH-033',
    faction: 'truth',
    headline: 'NEVADA SLOT MACHINES PAY OUT SECRET UFO FLIGHT PLANS INSTEAD OF CASH',
    subhead: 'Vegas winners receive embossed boarding passes to Area 51 observation deck',
    byline: 'By Hazel Sun, Desert Odds Analyst',
    body: `Visitors at a downtown Las Vegas casino pulled the lever only to see reels align not in cherries, but in tail numbers and orbital coordinates. Instead of coins, the machine spat out a metallic boarding pass stamped 'GUEST OBSERVER – MIDNIGHT LAUNCH.' Security cameras flickered as ecstatic tourists compared itineraries.

"It congratulated me for a 'jackpot in classified transportation,'" said blackjack dealer Nikhil Rao, who hasn't slept since the ticket started humming. "There's a gate number that just says 'BEHIND THE CURTAIN YOU'RE NOT SUPPOSED TO NOTICE.'"

Gaming Control Board agents dismissed the glitch as "novelty firmware" before confiscating the passes and offering vouchers for buffet lunches. Meanwhile, a convoy of unmarked buses idled behind the casino, doors open to anyone holding a winning stub.`,
    imagePrompt: 'Las Vegas slot machine with reels showing coordinates and tail numbers, glowing boarding pass emerging, tourists astonished, newsprint photo',
    tags: ['casino', 'ufo', 'travel'],
    statesMentioned: ['Nevada'],
    recurringCharacter: null,
    followUpHooks: [
      'Winners report waking up with souvenir oxygen masks smelling like rocket fuel',
      'Casino loyalty program now tracks "minutes spent in restricted airspace"'
    ]
  },
  {
    cardId: 'TRUTH-034',
    faction: 'truth',
    headline: 'NEW HAMPSHIRE MOUNTAIN FACE BLINKS—DISPENSES CRYPTIC BALLOT ENDORSEMENTS',
    subhead: 'Granite profile returns from the dead to grade candidates on secret criteria',
    byline: 'By Fiona Ledger, Granite State Gazer',
    body: `Hikers near Franconia Notch swear the Old Man of the Mountain reassembled himself out of fog and lichen, blinking heavy stone eyelids before projecting holographic report cards onto the trail. Each endorsement listed a candidate's "shadow loyalty rating" and preferred offering of maple syrup.

"I was just trying to take a foliage photo," said tourist Brandon Chu. "The face squinted, stamped 'PASS' on my forehead, and whispered, 'Watch the county treasurer's left shoe.'"

State election officials insist the apparition was a trick of weather and nostalgia. They nevertheless cordoned off the overlook and posted interns to confiscate the granite-scribed endorsements. Locals started a zine titled "Rock The Vote (Literally)."`,
    imagePrompt: 'Foggy profile of Old Man of the Mountain reformed in air, projecting holographic ballots to hikers, black and white newsprint',
    tags: ['elections', 'monument', 'prophecy'],
    statesMentioned: ['New Hampshire'],
    recurringCharacter: null,
    followUpHooks: [
      'Endorsement list updates hourly with notes about shoe choices and pocket contents',
      'Granite profile spotted tutoring debate moderators in thunderclouds'
    ]
  },
  {
    cardId: 'TRUTH-035',
    faction: 'truth',
    headline: 'NEW JERSEY TURNPIKE TOLLBOOTHS NOW ACCEPT FEAR AS CURRENCY',
    subhead: 'Motorists must confess darkest suspicions or sit in metaphysical traffic jam',
    byline: 'By Adriana Russo, Garden State Anxiety Correspondent',
    body: `Drivers approaching Exit 13 encountered tollbooths with glowing signage reading 'PAY WITH DOUBT.' The barrier refused to rise until each motorist shouted a conspiracy they secretly believe; the louder the paranoia, the faster the light turned green.

"I admitted I think the rest stops are surveillance terrariums," confessed commuter Malik Francis. "The booth printed a receipt that says 'THANK YOU FOR YOUR TRANSPARENCY. SEE YOU IN COURT.'"

Turnpike Authority officials insisted the equipment update was merely a "motivational audio experience" while frantically collecting the printed confessions. Psychic traffic reporters now broadcast rush hour forecasts based on the toll plaza’s emotional humidity.`,
    imagePrompt: 'Turnpike tollbooth with neon sign reading "Pay With Doubt", drivers leaning out shouting secrets, attendant wearing headphones, grainy newsprint',
    tags: ['infrastructure', 'psychic', 'transport'],
    statesMentioned: ['New Jersey'],
    recurringCharacter: null,
    followUpHooks: [
      'Collected fears sorted into file cabinets labeled by congressional district',
      'Carpool lanes open only to drivers who already confessed three times'
    ]
  },
  {
    cardId: 'TRUTH-036',
    faction: 'truth',
    headline: 'NEW MEXICO CHILI COOKOFF SUMMONS ALTERNATE TIMELINE JUDGES WITH FIRE OPALS',
    subhead: 'Synchronized tasting spoons vibrate, reveal recipes from 2085',
    byline: 'By Mateo Sandoval, Enchanted Heat Bureau',
    body: `At the Hatch Chili Festival, a panel of shimmering silhouettes appeared beside the regular judges, raising spoons carved from fire opals that materialized midair. Each alternate-timeline judge whispered a future chili recipe that includes ingredients like "moon cumin" and "Martian rainwater."

"My pot scored a 9.8 in a timeline where I open a restaurant on an asteroid," beamed chef Carla Nunez, whose apron now smells like ozone. "They left me a shopping list written in ultraviolet ink."

State fair officials insisted the shimmering critics were part of "augmented reality sponsorship." They confiscated the opal spoons but failed to notice the recipe booklets replicating themselves in every concession stand.`,
    imagePrompt: 'Outdoor chili cookoff with ghostly judges holding glowing spoons, pots steaming with sparkles, festival crowd in awe, tabloid monochrome',
    tags: ['food', 'time-anomaly', 'festival'],
    statesMentioned: ['New Mexico'],
    recurringCharacter: null,
    followUpHooks: [
      'Opal spoons keep reappearing in judges’ pockets despite lockboxes',
      'Future recipes mention embargo on "unauthorized pepper portals"'
    ]
  },
  {
    cardId: 'TRUTH-037',
    faction: 'truth',
    headline: 'NEW YORK SUBWAY BUSKER BROADCASTS STOCK TIPS FROM TWELVE MINUTES AHEAD',
    subhead: 'Violinist’s looping melody predicts Wall Street blunders before they happen',
    byline: 'By L. Monroe, Metropolitan Ripple Desk',
    body: `Morning commuters at Union Square heard a violinist playing a simple four-note pattern that synced perfectly with stock tickers on their phones—twelve minutes before the trades actually executed. Passersby who dropped cash received handwritten index cards reading "Buy the dip at 9:41, trust the raccoon."

"I followed the instructions and my app refreshed with gains I hadn't made yet," said analyst Priyanka Shah. "Then the violinist changed key and my phone displayed a countdown to a meeting that doesn't exist."

Metropolitan Transit Authority staff asked the musician to move along; the performer vanished into a service tunnel, leaving behind a metronome ticking in Morse code for 'CHECK THE 6 TRAIN THIRD RAIL.' Hedge funds now dispatch interns to chase the melody.`,
    imagePrompt: 'New York subway platform with violinist glowing softly, commuters checking phones with future stock prices, graffiti hints, newsprint aesthetic',
    tags: ['finance', 'music', 'time-anomaly'],
    statesMentioned: ['New York'],
    recurringCharacter: null,
    followUpHooks: [
      'Investment banks sponsor busker hunting tours disguised as art walks',
      'Service tunnel lights flicker in rhythm spelling out ticker symbols'
    ]
  },
  {
    cardId: 'TRUTH-038',
    faction: 'truth',
    headline: 'NORTH CAROLINA LIFEGUARDS TRAIN WITH GHOST SURFERS AFTER HURRICANE',
    subhead: 'Spectral instructors teach rip current escape routes by walking on water',
    byline: 'By Avery Collins, Outer Banks Aftermath Bureau',
    body: `Following a late-season hurricane, lifeguards on the Outer Banks reported nightly classes led by translucent surfers in vintage swimsuits. The ghosts demonstrated rip current survival by strolling across waves and sketching evacuation diagrams with phosphorescent foam.

"One specter critiqued my sunscreen technique," said trainee Micah Ellis, whose whistle now emits sea shanties. "They insist we memorize a chant that doubles as a storm warning when shouted at pelicans."

Coastal Safety officials dismissed the specters as stress dreams but quietly issued new manuals referencing "Phase 2: Vapor Mentors." Tourists now gather at dusk to audit the lessons, bringing offerings of waxed surfboards and declassified ship logs.`,
    imagePrompt: 'Nighttime beach with ghostly surfers instructing lifeguards, phosphorescent waves, training boards glowing, black and white newsprint',
    tags: ['ghost', 'ocean', 'training'],
    statesMentioned: ['North Carolina'],
    recurringCharacter: null,
    followUpHooks: [
      'Ghost surfers request vintage radios to broadcast hurricane warnings',
      'Lifeguard stands begin levitating during surprise drills'
    ]
  },
  {
    cardId: 'TRUTH-039',
    faction: 'truth',
    headline: 'NORTH DAKOTA OIL RIG FREEZES MID-FLARE—DRILLERS WALK THROUGH STOPPED TIME',
    subhead: 'Frozen droplets reveal corporate memos etched in ice crystals',
    byline: 'By Jonah Petrov, Bakken Chrono Correspondent',
    body: `A flare stack outside Williston halted in mid-eruption, flames suspended like a sculpture. Workers discovered they could stroll through the paused fire, reading secret memos etched inside each frozen droplet—memos dated six months from now detailing production quotas and cover stories.

"I pocketed one of the ice memos and it melted into a bonus check made out to my clone," said roustabout Kendra Leigh. "Also my watch now runs backwards until sunrise."

Energy executives claimed the freeze was "a pressure sensor malfunction" while quietly shipping the crystalline paperwork to an undisclosed vault. Meanwhile, local diner owners are selling 'Time-Locked Coffee' brewed with shards of retired flames.`,
    imagePrompt: 'North Dakota oil field with flare frozen midair, workers walking through suspended fire droplets reading text, newsprint photograph',
    tags: ['energy', 'time-anomaly', 'corporate'],
    statesMentioned: ['North Dakota'],
    recurringCharacter: null,
    followUpHooks: [
      'Subzero memos mention hiring policy for "chronologically flexible" employees',
      'Frozen flare resumes at sunset chanting drilling schedules'
    ]
  },
  {
    cardId: 'TRUTH-040',
    faction: 'truth',
    headline: 'OHIO STATEHOUSE BASEMENT HOSTS LIBRARY THAT ONLY CHECKS OUT REDACTED FUTURES',
    subhead: 'Legislators discover reading room where books rewrite debates before they happen',
    byline: 'By Tanya Wells, Buckeye Foresight Reporter',
    body: `Maintenance crews in Columbus found a hidden library under the statehouse, stocked with leather-bound volumes that describe upcoming legislative sessions—complete with blacked-out paragraphs that only reveal themselves to people holding expired visitor badges.

"I peeked at next week's budget hearing and the margins scolded me for eating the last donut," admitted intern Cole Baxter, whose hands now leave ink fingerprints on everything. "Then the book erased my name and replaced it with my future alias."

State archivists insist the collection is part of "historic role-play programming" while quietly installing metal detectors tuned to prophetic paper. Lobbyists are renting seats in the basement to skim tomorrow's amendments in exchange for promises of silence.`,
    imagePrompt: 'Hidden library under government building with glowing books and redacted text, staffers reading nervously, black and white newsprint',
    tags: ['politics', 'library', 'prophecy'],
    statesMentioned: ['Ohio'],
    recurringCharacter: null,
    followUpHooks: [
      'Books start cross-referencing visitors’ dreams with committee votes',
      'Basement elevator requires password spoken backward to descend'
    ]
  },
  {
    cardId: 'TRUTH-041',
    faction: 'truth',
    headline: 'OKLAHOMA STORM CHASERS CAPTURE TORNADO WRITING ENERGY COMPANY CONFESSIONS',
    subhead: 'Dust plume spells pipeline memos in cursive while sirens harmonize',
    byline: 'By Randi Calhoun, Plains Pursuit Correspondent',
    body: `A stovepipe tornado outside Norman scrawled cursive words across the sky using pure lightning, spelling internal memos from a local energy conglomerate. Storm chasers posted the footage in real time as the twister listed off-offshore shell companies and unsanctioned fracking rituals.

"We were reading the sky like a subpoena," said chaser Devin 'Dash' Morales, whose dash cam now loops a warning that says 'EXPECT ANOTHER TWISTER WHEN THEY LIE.' "The sirens harmonized with the handwriting; it was like karaoke for whistleblowers."

Company spokespeople claimed the words were "wind-borne debris" while quietly shredding office paperwork. The tornado dissipated after underlining a wheat field into the word 'APOLOGIZE.' Locals held a potluck under the invisible signature.`,
    imagePrompt: 'Oklahoma tornado with lightning forming handwritten words in sky, storm chasers filming, police cars watching, newsprint photo',
    tags: ['weather', 'corporate', 'exposure'],
    statesMentioned: ['Oklahoma'],
    recurringCharacter: null,
    followUpHooks: [
      'Storm sirens now auto-tune whenever executives give statements',
      'Unsigned contracts flutter into cornfields arranged as NDAs'
    ]
  },
  {
    cardId: 'TRUTH-042',
    faction: 'truth',
    headline: 'OREGON BOOKSTORE BASEMENT HOSTS PORTAL THAT CHECKS OUT CUSTOMERS TO OTHER DIMENSIONS',
    subhead: 'Receipts list due dates for realities that have not opened yet',
    byline: 'By Saffron Lee, Cascadia Shelf-Life Reporter',
    body: `Powell's Books staff uncovered a trapdoor leading to a reading room where patrons disappear for "research hours" and return with notebooks filled in someone else's handwriting. The checkout system now prints receipts that read 'RETURN TO THIS PLANE BY 4:32 PST OR INCUR MULTIVERSE FINES.'

"I asked for a guide to moss gardens and instead spent six minutes as a librarian made of rain," said graduate student Jordan Pike, who emerged soaked but ecstatic. "The portal stamped my forehead with 'RENEWED TWICE.'"

City inspectors shrugged off the phenomenon as "whimsical performance art" while installing emergency exit signs that point both up and sideways. Book clubs are booking private portal sessions, leaving behind bookmarks that hum when you lie about finishing the chapter.`,
    imagePrompt: 'Cozy bookstore basement with glowing portal between bookshelves, patrons stepping through, receipts floating, tabloid newsprint',
    tags: ['library', 'portal', 'culture'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: [
      'Returned patrons speak fluent Dewey Decimal in their sleep',
      'Portal late fees payable only in unpublished manuscripts'
    ]
  },
  {
    cardId: 'TRUTH-043',
    faction: 'truth',
    headline: 'PENNSYLVANIA COVERED BRIDGE LIFTS TO REVEAL STEALTH DIRIGIBLE AMISH CO-OP',
    subhead: 'Plain community debuts silent surveillance blimp powered by horse breath',
    byline: 'By Eli Rosen, Keystone Counterintelligence Beat',
    body: `Residents near Lancaster watched a historic covered bridge unlatch itself, rising to reveal a matte-black dirigible tethered beneath. Members of the local Amish co-op calmly loaded crates labeled 'UNOFFICIAL RECON' while horses powered bellows that filled the craft with whisper-quiet helium.

"We call it the Ordnung Observer," said engineer Miriam Stoltzfus, adjusting a bonnet lined with fiber optics. "We needed a way to keep tabs on English government drones. Also the view is pleasant."

State police arrived with questions but left after being offered homemade shoofly pie and a ride in the blimp's observation gondola. The dirigible now patrols county fairs, projecting psalms that double as encrypted radio chatter.`,
    imagePrompt: 'Covered bridge lifted open revealing sleek dirigible operated by Amish farmers, horses pumping bellows, onlookers astonished, newsprint image',
    tags: ['dirigible', 'community', 'surveillance'],
    statesMentioned: ['Pennsylvania'],
    recurringCharacter: null,
    followUpHooks: [
      'Dirigible sightings coincide with sudden barn-raising approvals',
      'Federal drones report being followed by hymn-singing shadows'
    ]
  },
  {
    cardId: 'TRUTH-044',
    faction: 'truth',
    headline: 'RHODE ISLAND FERRY RUNS ON WHALE SONG THAT ONLY PLAYS WATERGATE TAPES',
    subhead: 'Providence commuters endure historical remix as harbor glows with subpoena light',
    byline: 'By Mariah Costa, Narragansett Echo Correspondent',
    body: `The Jamestown Ferry now refuses to start its engines until crew members broadcast whale song recordings through a waterproof speaker. Passengers soon realized the whales responded by sampling Watergate-era testimony, converting it into haunting melodies that echoed across Narragansett Bay.

"Every trip starts with 'What did the President know?' in perfect cetacean harmony," groaned commuter Alonzo Price, who noticed the cabin lights flash Morse code for 'CHECK THE TIDE OF LIES.' "My coffee started swirling counterclockwise during the chorus."

Harbor officials call it "a quirky acoustic phenomenon" while quietly inviting constitutional scholars for free rides. Tourists now collect limited-edition ferry tokens etched with subpoena numbers.`,
    imagePrompt: 'Ferry crossing glowing harbor with whales singing near hull, passengers covering ears, speech bubbles of Watergate quotes, newsprint vibe',
    tags: ['music', 'history', 'maritime'],
    statesMentioned: ['Rhode Island'],
    recurringCharacter: null,
    followUpHooks: [
      'Ferry schedule adjusts itself whenever sealed indictments unseal',
      'Whales demand access to state archives via sonar petitions'
    ]
  },
  {
    cardId: 'TRUTH-045',
    faction: 'truth',
    headline: 'SOUTH CAROLINA SWEETGRASS BASKETS NOW WEAVE WEATHER WARNINGS ON THEIR OWN',
    subhead: 'Charleston artisans wake to baskets spelling storm routes in looping script',
    byline: 'By Naomi Grier, Lowcountry Loom Desk',
    body: `Gullah Geechee artisans reported their sweetgrass baskets finishing themselves overnight, braiding extra coils that spell out impending hurricane tracks. Each basket whispers a lullaby in Gullah, advising which streets to avoid and which porches to reinforce.

"I fell asleep mid-stitch and woke up to a basket telling me where FEMA is hiding sandbags," said master weaver Althea Jenkins. "It also reminded me to call Aunt Nessa about the attic ghosts."

State emergency managers praised the craftsmanship while trying to confiscate the chatty baskets for "data validation." The woven warnings now sell out instantly, with tourists begging for versions that predict airline delays.`,
    imagePrompt: 'Charleston porch with sweetgrass baskets weaving themselves, glowing text in coils, artisans watching astonished, newsprint photo',
    tags: ['folk-art', 'weather', 'community'],
    statesMentioned: ['South Carolina'],
    recurringCharacter: null,
    followUpHooks: [
      'Baskets request donations of ancient Spanish moss for "signal boosting"',
      'Local news airs basket forecasts with closed captioning in weaving patterns'
    ]
  },
  {
    cardId: 'TRUTH-046',
    faction: 'truth',
    headline: 'SOUTH DAKOTA PRESIDENTIAL FACES PRACTICE BLINKING MORSE CODE AFTER TOUR HOURS',
    subhead: 'Mount Rushmore eyelids flash classified directions to hidden visitor center',
    byline: 'By Owen Littlebird, Badlands Signal Desk',
    body: `Nighttime hikers reported Mount Rushmore's carved presidents blinking in alternating sequences. Park rangers dismissed it as moonlight until visitors decoded the blinks as Morse code instructions for accessing a "tourist overflow annex" hidden inside George Washington's nostril.

"The stone eyes spelled 'BRING EXACT CHANGE AND AN OPEN MIND,'" said camper Leslie Tan, whose souvenir penny now hums the national anthem backward. "We followed the instructions and found a gift shop selling time-travel brochures."

The National Park Service insists no annex exists, though they quietly posted signs urging visitors to "refrain from entering respiratory features." Local guides now offer "Blink Tours" that sell out weeks in advance.`,
    imagePrompt: 'Mount Rushmore at night with eyes glowing, hikers deciphering blinks, secret door outlined, newsprint aesthetic',
    tags: ['monument', 'signal', 'tourism'],
    statesMentioned: ['South Dakota'],
    recurringCharacter: null,
    followUpHooks: [
      'Gift shop receipts list alternate inauguration dates',
      'Blink pattern changes whenever a senator switches committee seats'
    ]
  },
  {
    cardId: 'TRUTH-047',
    faction: 'truth',
    headline: 'TENNESSEE HONKY-TONK HOSTS DUET BETWEEN ELVIS HOLOGRAM AND ACTUAL ELVIS',
    subhead: 'Beale Street crowd watches two Kings argue over conspiracy royalties',
    byline: 'By Danny Ortega, Memphis Night Circuit',
    body: `A new augmented-reality show on Beale Street glitched when the holographic Elvis was joined by a second Elvis wearing a silver-studded jumpsuit and smelling faintly of rocket fuel. The two crooners performed "Suspicious Minds" in perfect harmony, then bickered about who owned the rights to songs about Men in Black.

"The real one winked at me and said, 'Tell Graceland the mothership's late,'" said bartender Lila Dunham, who now pours drinks that levitate for loyal fans. "The hologram glitched, labeled him 'Unauthorized Update,' and rage-quit."

Venue security attempted to escort both Kings outside, but only the hologram complied. The living Elvis signed autographs that flicker between dates in 1968 and tomorrow.`,
    imagePrompt: 'Beale Street stage with holographic Elvis overlapping with real Elvis in shimmering jumpsuit, crowd shocked, neon lights, newsprint style',
    tags: ['elvis', 'music', 'ufo'],
    statesMentioned: ['Tennessee'],
    recurringCharacter: 'Elvis',
    followUpHooks: [
      'Graceland security cameras now show two overlapping timelines',
      'Record label lawyers receive cease-and-desist letter postmarked from orbit'
    ]
  },
  {
    cardId: 'TRUTH-048',
    faction: 'truth',
    headline: 'TEXAS RODEO CLOWNS LASSO INVISIBLE CATTLE THAT TURN OUT TO BE WEATHER PATTERNS',
    subhead: 'Amarillo arena ropes thunderheads, auctioneers sell thunder by the bolt',
    byline: 'By Hector Salazar, Panhandle Cloud Rodeo Reporter',
    body: `During the Tri-County Stampede, rodeo clowns spun lassos around empty air only to reveal shimmering outlines of longhorn-shaped cumulonimbus clouds. Each loop captured a different weather system; auctioneers sold the bottled thunder to ranchers craving rain.

"I brought home a drizzle calf and it rained on just my pasture," bragged competitor Dottie Ruiz, whose belt buckle now occasionally rumbles. "The clouds moo when you groom them."

National Weather Service officials called the show "meteorological fan fiction" before purchasing a thunderbolt for "research." The arena now offers season passes that include lightning insurance and a complimentary rain slicker embossed with conspiracy warnings.`,
    imagePrompt: 'Texas rodeo arena with clowns roping invisible glowing cattle shaped clouds, audience cheering, lightning in jars, newsprint aesthetic',
    tags: ['weather', 'rodeo', 'anomaly'],
    statesMentioned: ['Texas'],
    recurringCharacter: null,
    followUpHooks: [
      'Captured storm calves escape and graze on power lines',
      'State fair opens "Cloud Pen" petting zoo with barometric waivers'
    ]
  },
  {
    cardId: 'TRUTH-049',
    faction: 'truth',
    headline: 'UTAH NATIONAL PARK VENDING MACHINES DISPENSE ANTI-GRAVITY TRAIL MIX',
    subhead: 'Snack orbits hikers’ heads, rearranges into petroglyph constellations',
    byline: 'By Harper Sloan, Red Rock Supplies Bureau',
    body: `New vending machines at Arches National Park now vend trail mix that refuses to obey gravity. Each handful floats beside hikers, reshaping into miniature arches that point toward undiscovered slot canyons. Rangers warn that ignoring the floating snacks results in gentle but firm nudges toward hidden trailheads.

"My almonds spelled out 'ASK ABOUT THE HIDDEN WATERFALL,'" said backpacker Xiomara Diaz. "When I followed, the trail mix merged into a shimmering map projected on sandstone."

Park officials shrugged, calling it a "promotional stunt" while quietly ordering anti-static helmets for staff. Outdoor influencers now film slow-motion dances with the orbiting snacks and tag them #SponsoredByGravity.`,
    imagePrompt: 'Red rock trail with hikers surrounded by floating trail mix forming arch shapes, vending machine glowing in background, newsprint photo',
    tags: ['tourism', 'anomaly', 'national-park'],
    statesMentioned: ['Utah'],
    recurringCharacter: null,
    followUpHooks: [
      'Orbiting snacks reveal coordinates to unlisted ranger stations',
      'Trail mix refuses to enter souvenir bags without secret password'
    ]
  },
  {
    cardId: 'TRUTH-051',
    faction: 'truth',
    headline: 'VERMONT MAPLE TREES TAP THEMSELVES, DRIP CLASSIFIED SWEETNESS INTO TEA KETTLES',
    subhead: 'Sap boils into fog that spells who forged the town meeting minutes',
    byline: 'By Laurel Pike, Green Mountain Syrup Watch',
    body: `Residents of Stowe woke to a chorus of maple trees drilling their own taps, hoses snaking through kitchen windows to fill kettles left on stoves. The steam condensed into cursive accusing selectboard members of hiding grant money inside ski-lift maintenance fees.

"My kettle whistled the state motto backwards," said innkeeper Miles Beauregard. "The fog hovered over the breakfast buffet and spelled 'AUDIT THE CABINS.'"

Agriculture officials claimed the trees were responding to "barometric nostalgia" while quietly bottling the syrup under armed guard. Locals now sip the classified sweetness before public comment periods.`,
    imagePrompt: 'Snowy Vermont kitchen with maple tree taps snaking inside to kettles steaming words, family watching astonished, newsprint aesthetic',
    tags: ['maple', 'exposure', 'community'],
    statesMentioned: ['Vermont'],
    recurringCharacter: null,
    followUpHooks: [
      'Sap fog highlights hidden speakers in town hall rafters',
      'Breakfast tourists offered "Non-Disclosure Pancake Special"'
    ]
  },
  {
    cardId: 'TRUTH-052',
    faction: 'truth',
    headline: 'VIRGINIA CIVIL WAR REENACTORS RECEIVE TEXTS FROM THEIR 1860s SELVES',
    subhead: 'Battlefield group chat leaks instructions for tonight’s budget appropriation',
    byline: 'By Jennifer Cross, Commonwealth Continuity Desk',
    body: `During a reenactment in Manassas, every actor’s phone buzzed with messages labeled "From: You (1862)." The texts offered bayonet tips and, inexplicably, talking points for the upcoming state legislature session on infrastructure bonds.

"My ancestor told me which senator would fake heat exhaustion," said reenactor Devin Marks, still in wool uniform. "Then the battery icon turned into a regimental flag."

Historic preservation officials insisted the messages were part of "interactive programming" while confiscating the phones for "archival storage." Legislators now invite reenactors to caucus meetings as strategic consultants.`,
    imagePrompt: 'Civil War reenactors checking buzzing smartphones showing sepia messages, battlefield backdrop, newsprint photo',
    tags: ['history', 'time-anomaly', 'politics'],
    statesMentioned: ['Virginia'],
    recurringCharacter: null,
    followUpHooks: [
      'Group chat begins scheduling filibusters during cannon volleys',
      'Confederate uniforms request firmware update to stop auto-correct'
    ]
  },
  {
    cardId: 'TRUTH-053',
    faction: 'truth',
    headline: 'D.C. REFLECTING POOL PROJECTS LIVE POLYGRAPH SCORES ON CLOUDS',
    subhead: 'Mall tourists gasp as senators’ heartbeats spell “OBFUSCATE” over monuments',
    byline: 'By Rhea Whitcomb, Federal Frequency Correspondent',
    body: `The Lincoln Memorial Reflecting Pool started pulsing with concentric ripples that shot into the sky, forming cumulus billboards reading truthfulness percentages for every official within a mile radius. The cloud-scribed scores updated whenever someone claimed ignorance of classified budgets.

"I watched a staffer shout 'no comment' and his percentage dropped to single digits," said visitor Holly Nguyen. "The ducks booed."

Capitol Police raised umbrellas and insisted the phenomenon was "moisture interference" while guiding lawmakers into underground tunnels. Vendors now sell ponchos labeled "I HAVE NOTHING TO HIDE (PROBABLY)."`,
    imagePrompt: 'Washington D.C. reflecting pool with clouds above displaying percentage scores, tourists taking photos, officials ducking under umbrellas, newsprint style',
    tags: ['politics', 'exposure', 'weather'],
    statesMentioned: ['District of Columbia'],
    recurringCharacter: null,
    followUpHooks: [
      'Cloud screens flicker when lobbyists use burner phones',
      'Reflecting Pool installs “Privacy Fog Machines” that immediately fail'
    ]
  },
  {
    cardId: 'TRUTH-054',
    faction: 'truth',
    headline: 'WASHINGTON STATE MOSS GROWS QR CODES LEADING TO SASQUATCH LIVESTREAM',
    subhead: 'Rainforest floor charges subscription fees in pinecones',
    byline: 'By Amanda Zhang, Cascadia Cryptid Beat',
    body: `Hikers in the Hoh Rain Forest discovered patches of moss shaped into perfect QR codes. Scanning them opened a livestream of Sasquatch lounging in a cedar hot tub, sipping herbal tea and grading tourists on trail etiquette.

"He dinged me for not packing out my orange peel," admitted backpacker Tenisha Lowell. "Then the stream glitched and offered a premium tier called 'Behind The Shrubbery.'"

Park rangers called it "augmented ecotourism" while racing to scrape the moss for evidence. Influencers now barter pinecones to unlock bonus footage of cryptid spa treatments.`,
    imagePrompt: 'Pacific Northwest forest floor with moss forming QR codes, hikers scanning phones, Sasquatch visible on screen in hot tub, newsprint photo',
    tags: ['sasquatch', 'technology', 'ecotourism'],
    statesMentioned: ['Washington'],
    recurringCharacter: 'Bigfoot',
    followUpHooks: [
      'Livestream chat moderated by unseen ranger using emoji made of fern fronds',
      'QR codes migrate to city sidewalks during drizzle'
    ]
  },
  {
    cardId: 'TRUTH-055',
    faction: 'truth',
    headline: 'WEST VIRGINIA COAL MINE CHOIR SINGS NOTES THAT LIGHT UP ABANDONED TUNNELS',
    subhead: 'Baritone harmonics reveal hidden murals of labor victories yet to happen',
    byline: 'By Rochelle Gaines, Appalachian Echo Bureau',
    body: `Retired miners gathered for a reunion in Beckley, only to find their old lamp helmets glowing when they hit a particular chord. The harmonized resonance opened secret drifts painted with scenes of future strikes, union wins, and holographic pay stubs labeled "Pending Justice."

"We kept singing and the tunnel floor spelled out the names of CEOs," said tenor J.P. Mullins. "One mural winked and handed me a contract for 2029."

Company representatives dismissed the light show as "harmless nostalgia" while trying to seal the tunnels. Choir members now host nightly concerts and sell tickets redeemable for legal consultations.`,
    imagePrompt: 'Coal miners in helmets singing inside glowing tunnel, walls lit with murals of future events, newsprint style',
    tags: ['labor', 'music', 'prophecy'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: [
      'Murals repaint themselves when officials try to photograph them',
      'Union contracts from the future delivered via singing canary'
    ]
  },
  {
    cardId: 'TRUTH-056',
    faction: 'truth',
    headline: 'WISCONSIN CHEESE CURDS FORM EFFICIENT GERRYMANDERING DIAGRAM',
    subhead: 'Dairy squeak reveals perfect map of secret district proposal',
    byline: 'By Priya Banerjee, Dairyland Disclosure Desk',
    body: `At the Madison Farmer’s Market, cheese curds arranged themselves on a cutting board into a meticulously labeled map of proposed voting districts. Each curd squeaked a legislator’s name, while a bowl of ranch dressing circled suspiciously around contested suburbs.

"I tried to eat one and it screamed 'DON'T YOU CARE ABOUT DEMOCRACY?'" said shopper Kim Iverson. "Then it reassembled on my napkin."

Statehouse aides called it "performance art by lactose radicals" and scooped the curds into evidence bags. Activists now livestream fondue parties to keep the map on camera.`,
    imagePrompt: 'Farmers market table with cheese curds forming political map, shoppers startled, ranch dressing swirling, newsprint',
    tags: ['politics', 'food', 'exposure'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: [
      'Curds squeak subpoenas whenever microwaved',
      'Ranch dressing begins spelling dates of upcoming special sessions'
    ]
  },
  {
    cardId: 'TRUTH-057',
    faction: 'truth',
    headline: 'WYOMING STARGAZERS PHOTOGRAPH CONSTELLATION BRANDING PARK RANGERS',
    subhead: 'Night sky deputizes volunteers with glowing badges shaped like bison',
    byline: 'By Noelani Kealoha, High Plains Sky Desk',
    body: `During a meteor shower in Grand Teton National Park, bolts of aurora light descended to stamp glowing bison badges on the chests of random campers. Each badge authorized the wearer to "protect migratory secrets" and occasionally mooed in Morse code.

"I got deputized while roasting marshmallows," said astrophotographer Blake Mendoza. "Now my camera filters out tourists who litter."

Park officials shrugged, handing out disclaimers that the badges are "ceremonial only" while outfitting new volunteers with encrypted walkie-talkies.`,
    imagePrompt: 'Mountain campsite at night with aurora stamping glowing bison badges on campers, telescopes pointing skyward, newsprint aesthetic',
    tags: ['aurora', 'volunteer', 'wildlife'],
    statesMentioned: ['Wyoming'],
    recurringCharacter: null,
    followUpHooks: [
      'Badges buzz when tourists approach restricted geysers',
      'Constellation map updates with secret ranger handshake instructions'
    ]
  },
  {
    cardId: 'TRUTH-058',
    faction: 'truth',
    headline: 'ALABAMA ROADSIDE DINER SERVES BISCUITS THAT PREDICT COUP ATTEMPTS',
    subhead: 'Flaky layers peel into flowcharts of tomorrow’s emergency meetings',
    byline: 'By Keisha Rollins, Deep South Early Warning Bureau',
    body: `Customers at a Montgomery diner noticed their biscuits separating into perfect flowcharts mapping out which officials will stage a procedural coup and who will bring potato salad. The gravy bubbled when someone lied about their alibi.

"I buttered a roll and it shouted 'CALL YOUR COUNCILMEMBER,'" reported trucker Angela Brooks. "The jelly formed the seal of a committee that hasn't been created yet."

State troopers labeled the bakery "strategically seasoned" and ordered takeout for surveillance. Activists now host "resistance breakfasts" with extra honey for whistleblowers.`,
    imagePrompt: 'Southern diner table with biscuits unfolding into charts, customers shocked, waitress holding coffee pot, newsprint style',
    tags: ['food', 'prophecy', 'politics'],
    statesMentioned: ['Alabama'],
    recurringCharacter: null,
    followUpHooks: [
      'Biscuits burn fingerprints of plotters into napkins',
      'Secret sauce packets whisper impeachment schedules'
    ]
  },
  {
    cardId: 'TRUTH-059',
    faction: 'truth',
    headline: 'ALASKA GLACIER BREAKS OFF PERFECT ICE CUBES ENGRAVED WITH FUTURE QUAKE TIMES',
    subhead: 'Bartenders serve cocktails that tremble minutes before tremors hit',
    byline: 'By Lena Tavik, Polar Foreshock Desk',
    body: `Glacier tour boats near Juneau collected calved ice cubes carved with digital-looking timestamps. When dropped into drinks, the cubes shook violently exactly five minutes before nearby seismographs registered tremors.

"My Old Fashioned rattled itself across the bar," said geologist Hanna Petrov. "The ice spelled 'ANCHOR THE SHELVES' and then politely melted."

The U.S. Geological Survey called the cubes "novelty souvenirs" while installing a cocktail bar in their monitoring station. Local bars now offer "Foreshock Happy Hour" with evacuation discounts.`,
    imagePrompt: 'Bartender pouring drink over crystal-clear ice cube engraved with numbers, patrons watching as glass vibrates, snowy glacier inset, newsprint photo',
    tags: ['glacier', 'prophecy', 'safety'],
    statesMentioned: ['Alaska'],
    recurringCharacter: null,
    followUpHooks: [
      'Ice cube numbers occasionally skip to warn about politics instead',
      'Tourists hoard cubes and accidentally trigger mini-quakes in hotel rooms'
    ]
  },
  {
    cardId: 'TRUTH-060',
    faction: 'truth',
    headline: 'ARIZONA SAGUARO CACTI FLASH NEON ARROWS TOWARD UNDERGROUND WATER HOARD',
    subhead: 'Desert flora implicates private reservoir hidden beneath golf course',
    byline: 'By Mateo Ruiz, Desert Signal Reporter',
    body: `In Scottsdale, towering saguaros lit up with neon arrows at midnight, pointing directly toward a luxury golf course. The cacti pulsed "DRINK FAIRLY" in Morse code, revealing an underground aquifer tapped by a shell company.

"The cactus outside my condo started chanting court docket numbers," said resident Brenda Alonzo. "When I touched it, it showed me a hologram of hidden pumps."

Developers claimed the display was a "projection mapping stunt" while rushing to cover sprinkler heads. Activists now host moonlit vigils, watering saguaros with reclaimed spa water.`,
    imagePrompt: 'Sonoran Desert night scene with cacti emitting neon arrows pointing toward golf course, residents watching, newsprint aesthetic',
    tags: ['water-rights', 'environment', 'exposure'],
    statesMentioned: ['Arizona'],
    recurringCharacter: null,
    followUpHooks: [
      'Cacti begin issuing parking tickets to water trucks',
      'Golf course sprinklers spray subpoenas etched in mist'
    ]
  },
  {
    cardId: 'TRUTH-061',
    faction: 'truth',
    headline: 'ARKANSAS RIVER BARGES CARRY CRYSTAL RADIO THAT ONLY PLAYS LOBBYIST CONFESSIONS',
    subhead: 'Towboat captains broadcast corruption mixtape down the Mississippi',
    byline: 'By Jamal Wren, Delta Signal Reporter',
    body: `A barge convoy near Pine Bluff dredged up a crystal radio set the size of a shipping container. Once powered by river water, it began looping confessions from anonymous lobbyists discussing pesticide kickbacks and ghostwritten bills.

"We tried to turn the volume down and it just shouted 'REPEAT AFTER ME: RECUSE'," said captain Martha Leigh. "The tugboats now sync to its beat like a floating protest."

State ethics officers called the transmission "pirate radio" while trying to jam it with patriotic marches. River towns now host nightly listening parties with popcorn and subpoena forms.`,
    imagePrompt: 'Mississippi River barges with giant crystal radio emitting sound waves, crews listening, onshore crowds with notepads, newsprint style',
    tags: ['river', 'exposure', 'broadcast'],
    statesMentioned: ['Arkansas'],
    recurringCharacter: null,
    followUpHooks: [
      'Crystal radio harmonizes with courthouse clocks during testimony',
      'Lobbyists hire soundproof tugboat rumored to sink immediately'
    ]
  },
  {
    cardId: 'TRUTH-062',
    faction: 'truth',
    headline: 'CALIFORNIA TECH CAMPUS INSTALLS FOUNTAIN THAT ONLY GRANTS WISHES FOR WHISTLEBLOWERS',
    subhead: 'Coin toss triggers hologram revealing unredacted NDAs',
    byline: 'By Marcus Webb, Silicon Sleuth Bureau',
    body: `Employees at a Sunnyvale megacorp found their courtyard fountain projecting unedited NDA documents whenever someone wished for "a better work-life balance." The holograms highlighted hidden clauses about interdimensional patents and hush money crypto wallets.

"I asked for dental and the fountain printed the CEO's burner number," whispered engineer Aya Patel. "Then it splashed me with sparkling water labeled 'Classified.'"

Corporate security fenced off the fountain as "art in need of calibration" but couldn't stop drones livestreaming the glowing leaks. Shareholders now toss coins demanding board resignations.`,
    imagePrompt: 'Modern tech campus fountain projecting holographic documents, employees tossing coins, security watching, newsprint aesthetic',
    tags: ['technology', 'corporate', 'exposure'],
    statesMentioned: ['California'],
    recurringCharacter: null,
    followUpHooks: [
      'Fountain sprays reveal off-shore shell company names in bubbles',
      'HR issues memo banning hopes and dreams near courtyard'
    ]
  },
  {
    cardId: 'TRUTH-063',
    faction: 'truth',
    headline: 'COLORADO AVALANCHE FORECASTERS RECEIVE POSTCARDS FROM FUTURE SNOWPACKS',
    subhead: 'Handwritten notes recommend voting reforms and extra avalanche beacons',
    byline: 'By Penelope Grant, Rockies Signal Desk',
    body: `The Colorado Avalanche Information Center reported stacks of waterproof postcards appearing on their desks each dawn, postmarked from "Next February." The cards describe precise snowpack conditions and casually mention which ballot measures will be sabotaged by black ice.

"Yesterday's postcard suggested we install bear-proof ballot boxes," said forecaster Liam Brooks. "It included a doodle of a ski lift shaped like a subpoena."

State officials call the deliveries "creative meteorology" while scanning the paper for spy fibers. Ski patrollers now read postcards aloud during safety briefings.`,
    imagePrompt: 'Mountain office with forecasters reading postcards covered in snow, bulletin board with future dates, avalanche map glowing, newsprint style',
    tags: ['mountains', 'prophecy', 'safety'],
    statesMentioned: ['Colorado'],
    recurringCharacter: null,
    followUpHooks: [
      'Postcards warn that snowpack may ratify constitutional amendments',
      'Mail carrier insists he never touched the future mail'
    ]
  },
  {
    cardId: 'TRUTH-064',
    faction: 'truth',
    headline: 'CONNECTICUT SUBWAY COMMUTERS FIND SECRET PLATFORM WITH GHOSTLY CPA SERVICES',
    subhead: 'Spectral accountants balance karmic ledgers and municipal budgets simultaneously',
    byline: 'By Asha Patel, Metro Ledger Investigator',
    body: `At Stamford Station, riders followed a flickering "Platform 6½" sign into a waiting room staffed by translucent accountants. The ghosts offered to reconcile both tax filings and unresolved grudges, producing spreadsheets that predicted next year’s bond rating.

"They deducted my unpaid apologies as itemized deductions," marveled commuter Rochelle Hayes. "Then they warned me about a secret toll increase."

Metro North officials declared the platform "off-limits due to metaphysical liability" but commuters keep slipping through to file emotional audits.`,
    imagePrompt: 'Underground train platform with ghostly accountants at desks, commuters holding glowing spreadsheets, newsprint style',
    tags: ['ghost', 'finance', 'transit'],
    statesMentioned: ['Connecticut'],
    recurringCharacter: null,
    followUpHooks: [
      'Spectral CPAs demand receipts from past lives',
      'Metro North ticket machines now dispense therapy coupons'
    ]
  },
  {
    cardId: 'TRUTH-065',
    faction: 'truth',
    headline: 'DELAWARE CREDIT CARD CENTER RINGS BELL EVERY TIME AN OFFSHORE ACCOUNT BLUSHES',
    subhead: 'Call center agents monitor embarrassment levels of shell corporations',
    byline: 'By Robert Chen, Corporate Humidity Correspondent',
    body: `Employees at a Wilmington financial hub installed humidity sensors that now detect micro-flushes from offshore shell companies whenever auditors ask questions. Each blush triggers a desk bell and prints a sticky note reading "You Forgot the Cayman Side Account."

"My cubicle plants lean toward the guilty phone line," said agent Priya D'Souza. "Yesterday the ficus spelled 'SUSPICIOUS WIRES.'"

Executives blame "mischievous interns" for the devices while scrambling to relocate call routing. Workers compiled a blush leaderboard and projected it onto the lobby wall.`,
    imagePrompt: 'Office cubicles with humidity sensors and bells ringing, sticky notes naming shell companies, employees smirking, newsprint style',
    tags: ['finance', 'exposure', 'corporate'],
    statesMentioned: ['Delaware'],
    recurringCharacter: null,
    followUpHooks: [
      'Bell chimes sync with Treasury subpoenas',
      'Plants begin writing merger rumors in pollen'
    ]
  },
  {
    cardId: 'TRUTH-066',
    faction: 'truth',
    headline: 'FLORIDA MAN OPENS PARANORMAL TAXI SERVICE—RIDES INCLUDE FREE LIGHTNING DETECTOR',
    subhead: 'Passengers report dimension-hopping meter that charges in gold doubloons',
    byline: 'By Jasmine Ortiz, Sunshine State Shenanigans Reporter',
    body: `Florida Man premiered "ZapCab," a taxi wrapped in tin foil with a roof-mounted lightning rod. Riders say the cab vanishes between destinations, reappearing outside conspiracy hotspots while the meter spits out pirate-era coins and evacuation instructions.

"He offered me a loyalty punch card that doubles as a storm talisman," said tourist Morgan Li. "When lightning hit, the trunk released gator repellent and a playlist of government denials."

State regulators call the service "unauthorized teleportation" but secretly request rides to bypass gridlock. ZapCab now offers surge pricing during solar flares.`,
    imagePrompt: 'Florida taxi covered in foil with lightning rod, passengers stepping out holding doubloons, lightning striking nearby, newsprint photo',
    tags: ['florida-man', 'transport', 'anomaly'],
    statesMentioned: ['Florida'],
    recurringCharacter: 'Florida Man',
    articleVariant: 'florida_man_stage_1',
    followUpHooks: [
      'ZapCab loyalty points redeemable for hurricane-proof surf lessons',
      'Insurance adjusters mysteriously waive deductibles after riding'
    ]
  },
  {
    cardId: 'TRUTH-067',
    faction: 'truth',
    headline: 'GEORGIA PEACH ORCHARD GROWS FRUIT THAT REVEALS SECRET COMMITTEE VOTES',
    subhead: 'Each peach pit contains roll-call numbers carved in sugar crystal',
    byline: 'By Caleb Monroe, Southern Transparency Beat',
    body: `Farmers near Macon discovered their peaches splitting open when shaken, revealing glittering sugar crystals shaped into legislative roll-call tallies. The fruit whispers who skipped the vote and who swapped positions at the last minute.

"I baked a pie and it served subpoenas as dessert," laughed orchard owner Felicia Boone. "The pits say they prefer bipartisan compost."

Statehouse press liaisons insist it's "agricultural folklore" while quietly attempting to buy the entire harvest. Local bakers now sell "Accountability Cobblers" with edible highlighter pens.`,
    imagePrompt: 'Peach orchard with peaches glowing and splitting to show crystal numbers, farmer holding basket, capitol dome faint in background, newsprint style',
    tags: ['agriculture', 'politics', 'prophecy'],
    statesMentioned: ['Georgia'],
    recurringCharacter: null,
    followUpHooks: [
      'Crystal pits dissolve in sweet tea, revealing committee gossip',
      'Capitol cafeteria suddenly adds peach cobbler with nondisclosure glaze'
    ]
  },
  {
    cardId: 'TRUTH-068',
    faction: 'truth',
    headline: 'HAWAII OUTRIGGER CANOES SURF ON RAINBOWS TO DELIVER REDACTED BUDGET PAGES',
    subhead: 'Paddlers retrieve shimmering binders from thunderheads over Honolulu',
    byline: 'By Noelani Kealoha, Pacific Oversight Desk',
    body: `During a sudden sun shower, outrigger crews from Waikiki paddled directly up a rainbow that hardened into a glowing channel. At the top, they collected binders raining from a thunderhead labeled "FY25 Shhh." The pages contained budget redactions that erased themselves unless read aloud to ukulele accompaniment.

"We sang and the ink reappeared like tide pools," said paddler Kalea Ikaika. "Then the rainbow politely lowered us back to sea level."

Territorial auditors dismissed the stunt as "tourist entertainment" while discreetly photocopying the binders. Surf schools now offer "Transparency Tours" with complimentary rain ponchos.`,
    imagePrompt: 'Outrigger canoe paddlers ascending rainbow bridge collecting binders from cloud, Honolulu skyline below, newsprint aesthetic',
    tags: ['water', 'transparency', 'festival'],
    statesMentioned: ['Hawaii'],
    recurringCharacter: 'Agent Smitherson',
    articleVariant: 'agent_smitherson_stage_1',
    followUpHooks: [
      'Agent Smitherson files expense report for “rainbow tolls”',
      'Binders start dripping sand that forms secrecy warnings on beaches'
    ]
  },
  {
    cardId: 'TRUTH-069',
    faction: 'truth',
    headline: 'IDAHO POTATO STORAGE WAREHOUSE DISCOVERS TELEPATHIC SPUDS RUNNING SHADOW BALLOT',
    subhead: 'Root vegetables tally local trust ratings and hum the national anthem backwards',
    byline: 'By Briana Soderberg, High Desert Root Desk',
    body: `Farmhands near Pocatello found crates of potatoes softly humming. Touching a spud revealed visions of neighborhood council votes and which mayoral candidate secretly hates hash browns. The potatoes demanded to be counted as "the tuber majority."

"One tater told me to 'watch the zoning board,'" said worker Isaac Herrera. "It also insisted on a recount of the bake-off."

County officials tried to move the crop, but the potatoes rolled themselves back into quorum formation. Local diners now hold "listening mashed" sessions with buttered briefings.`,
    imagePrompt: 'Warehouse with crates of glowing potatoes humming, farmhands touching to see visions, county map projected, newsprint style',
    tags: ['agriculture', 'telepathy', 'politics'],
    statesMentioned: ['Idaho'],
    recurringCharacter: null,
    followUpHooks: [
      'Potatoes threaten filibuster by sprouting into barricades',
      'Farm reports list "mindshare yield" alongside bushels'
    ]
  },
  {
    cardId: 'TRUTH-070',
    faction: 'truth',
    headline: 'ILLINOIS ARCHITECTS HEAR CHICAGO SKYLINE WHISPER REZONING SCHEMES AT MIDNIGHT',
    subhead: 'Skyscrapers tilt minutely toward forbidden riverfront project',
    byline: 'By Andre Whitfield, Urban Resonance Reporter',
    body: `A consortium of Chicago architects recorded faint creaking between midnight and 12:07 AM as skyscrapers leaned a few degrees toward a vacant riverfront lot. The wind carried hushed voices describing a secret rezoning plan disguised as "public art installation."

"Willis Tower told me to check page 48 of the zoning appendix," said architect Mei Park, who now wears earplugs indoors. "Navy Pier shivered like it knew the punchline."

City Hall dismissed the phenomenon as "thermal expansion" but quietly postponed a development vote. Urban explorers now camp on rooftops to transcribe the skyline’s gossip.`,
    imagePrompt: 'Chicago skyline at night with buildings subtly leaning toward river, architects with recording equipment, newsprint aesthetic',
    tags: ['urban', 'conspiracy', 'architecture'],
    statesMentioned: ['Illinois'],
    recurringCharacter: null,
    followUpHooks: [
      'Leaning buildings hum louder whenever lobbyists ride the elevators',
      'River barges deliver mysterious crates labeled "Art Supplies" at dawn'
    ]
  },
  {
    cardId: 'TRUTH-071',
    faction: 'truth',
    headline: 'INDIANA WIND TURBINES START SPELLING OUT UNSOLVED COLD CASES IN CORN POLLEN',
    subhead: 'Renewable energy plants blow crime scene diagrams across county fairs',
    byline: 'By Tanya Wells, Heartland Investigative Desk',
    body: `Farmers outside Bloomington report golden pollen clouds leaving the turbines and settling on barns in the shape of decades-old case files. Fingerprint swirls, mugshots, and docket numbers appear, glittering in sunlight before drifting toward the sheriff's office.

"My hayloft is now a crime lab," said farmer Patrice Monroe. "The pollen spelled 'CHECK THE ICE CHEST BEHIND THE VFW.'"

State police call it "aerodynamic pareidolia" but quietly reopened six cases. County fairs now host pollen-bingo fundraisers for forensic kits.`,
    imagePrompt: 'Indiana wind farm with pollen clouds forming forensic diagrams on barn walls, deputies taking notes, newsprint',
    tags: ['renewable-energy', 'investigation', 'community'],
    statesMentioned: ['Indiana'],
    recurringCharacter: null,
    followUpHooks: [
      'Pollen diagrams change whenever jurors receive mysterious phone calls',
      'Corn mazes redirect visitors toward evidence locker shortcuts'
    ]
  },
  {
    cardId: 'TRUTH-072',
    faction: 'truth',
    headline: 'IOWA STATE FAIR BUTTER SCULPTURE MELTS INTO BLUEPRINT FOR SECRET DATA CENTER',
    subhead: 'Dairy art leaks ventilation schematics and shadow payroll names',
    byline: 'By Priya Banerjee, Buttered Disclosure Bureau',
    body: `The famous butter cow softened under normal room temperature and re-solidified as a 3D model of an underground data center hidden beneath the midway. Carved butter labels pointed to "hush-hush payroll" and "cooling fan bribery schedules."

"The churner insisted I sign an NDA before tasting," said sculptor Hannah Webb. "Then the butter printed a Wi-Fi password."

Fair officials insisted the transformation was "an art prank" while erecting security fencing around the butter refrigeration truck. Attendees now bring toast to soak up leaked passwords.`,
    imagePrompt: 'State fair butter sculpture melting into architectural blueprint, visitors snapping photos, security nervous, newsprint style',
    tags: ['state-fair', 'technology', 'exposure'],
    statesMentioned: ['Iowa'],
    recurringCharacter: null,
    followUpHooks: [
      'Butter blueprint adds escape tunnels whenever auditors arrive',
      'Midway rides broadcast hidden server temperatures over loudspeakers'
    ]
  },
  {
    cardId: 'TRUTH-073',
    faction: 'truth',
    headline: 'KANSAS WHEAT FIELD THRESHER TYPES OUT SECRET CODE IN STRAW BALES',
    subhead: 'Harvested bundles stack themselves into binary accusing a seed monopoly',
    byline: 'By Lila Redding, Plains Algorithm Correspondent',
    body: `Near Salina, a self-driving combine began arranging straw bales into tidy lines of tall and short stacks representing binary code. Hackers translated the pattern into internal emails from a seed conglomerate plotting to patent sunlight.

"I tried to drive the tractor manually and it spelled 'NOPE' in hay," said farmer Glen Watson. "My barn door now locks when lobbyists visit."

Agricultural regulators attribute the bales to "gusty artistry" while scanning them for microchips. Local co-ops host "decode-and-dinner" nights featuring algorithm soup.`,
    imagePrompt: 'Kansas field with straw bales arranged in binary, farmer scratching head, drone overhead, newsprint aesthetic',
    tags: ['agriculture', 'data', 'exposure'],
    statesMentioned: ['Kansas'],
    recurringCharacter: null,
    followUpHooks: [
      'Binary bales predict commodity pricing down to the penny',
      'Seed company sues the wind for intellectual property theft'
    ]
  },
  {
    cardId: 'TRUTH-074',
    faction: 'truth',
    headline: 'KENTUCKY HORSE RACE ANNOUNCER CALLS PHOTO FINISH FROM FOUR MINUTES IN THE FUTURE',
    subhead: 'Track loudspeakers spoil betting odds while jockeys still in gate',
    byline: 'By Everett Cole, Bluegrass Time Desk',
    body: `Churchill Downs spectators heard the announcer declare the winner before the starting bell. Replay monitors displayed a race that hadn't begun yet, complete with scandalous commentary about a board member's offshore stable expenses.

"They announced my horse stumbled on lap two before he even took a step," said trainer Marisol Wynn. "When the race caught up, the stumble happened exactly as predicted."

Track officials blamed "latency artifacts" while rewriting rule books on the fly. Gamblers now wear noise-canceling headphones to avoid temporal spoilers.`,
    imagePrompt: 'Horse racetrack with announcer booth glowing, crowd reacting before race starts, monitors showing future footage, newsprint style',
    tags: ['sports', 'time-anomaly', 'scandal'],
    statesMentioned: ['Kentucky'],
    recurringCharacter: null,
    followUpHooks: [
      'Announcer’s microphone only works when reading sealed affidavits',
      'Bookies invest in retro ear trumpets to block future commentary'
    ]
  },
  {
    cardId: 'TRUTH-075',
    faction: 'truth',
    headline: 'LOUISIANA PARADE FLOAT CATCHES BEADS THAT TURN INTO SUBPOENA BRACELETS',
    subhead: 'Mardi Gras throws glow, then clamp on wrists of corrupt officials',
    byline: 'By Simone Thibodeaux, Crescent City Accountability Beat',
    body: `During a Krewe parade, a float decorated as Lady Justice tossed beads that hovered mid-air before snapping onto the wrists of certain city council members. The beads morphed into glowing bracelets engraved with court dates and GPS trackers.

"Mine whispered 'See you Tuesday at 9 sharp' in a judge's voice," confessed Councilman Pierre Duval. "It won't unclasp unless I read the ethics code aloud."

City Hall claims the bracelets are "interactive art" while contacting locksmiths. Revelers now collect leftover beads for citizen arrests.`,
    imagePrompt: 'Mardi Gras float throwing beads that latch onto officials glowing like cuffs, crowds cheering, newsprint aesthetic',
    tags: ['festival', 'justice', 'magic'],
    statesMentioned: ['Louisiana'],
    recurringCharacter: null,
    followUpHooks: [
      'Bead bracelets livestream depositions to jazz radio stations',
      'Krewe receives cease-and-desist on behalf of unnamed "patron saint of cover-ups"'
    ]
  },
  {
    cardId: 'TRUTH-076',
    faction: 'truth',
    headline: 'MAINE LOBSTER BUOYS TRANSMIT WEATHER RUMORS THROUGH LIGHTHOUSE FOGHORN',
    subhead: 'Harbor becomes rumor mill for next week’s secret naval exercises',
    byline: 'By Cordelia Pike, Atlantic Fog Bureau',
    body: `Buoys off Portland flashed Morse code to the Portland Head Light foghorn, which began reciting gossip about impending naval drills, hush-money payouts, and which restaurant hides the admiral’s diary. Fishermen tuned in by leaning over the gunwale with transistor radios.

"The horn told me to sell my cod futures," said captain Nora Chen. "Then it sang 'Yankee Doodle' and listed the coordinates of a classified meeting."

Coast Guard spokespeople called it "harmonic interference" while repositioning their patrol schedules. Tourists now sell tickets to "Fog Radio" watch parties at dawn.`,
    imagePrompt: 'Maine harbor with buoys blinking, lighthouse foghorn emitting speech bubbles, fishermen listening on radios, newsprint aesthetic',
    tags: ['maritime', 'rumor', 'weather'],
    statesMentioned: ['Maine'],
    recurringCharacter: null,
    followUpHooks: [
      'Foghorn demands copies of classified chowder recipes',
      'Buoys start flashing Morse code for congressional vacations'
    ]
  },
  {
    cardId: 'TRUTH-077',
    faction: 'truth',
    headline: 'MARYLAND CRYPTOLOGY MUSEUM DECRYPTS ANCIENT CRAB FEAST MENU HIDDEN IN NSA ARCHIVES',
    subhead: 'Declassified seafood recipe doubles as map to surveillance warehouse',
    byline: 'By Jamal Wren, Chesapeake Cipher Beat',
    body: `Docents at the National Cryptologic Museum decoded a World War II-era cipher only to reveal a crab feast menu detailing "Operation Claw Hammer." The recipe specifies coordinates to an unlisted warehouse storing confiscated ham radios.

"The instructions say to steam for 17 minutes and question authority," chuckled docent Rachel Phelps. "There's a doodle of a crab wearing night-vision goggles."

NSA officials claim the menu is "fictional flair" while increasing guard patrols around the warehouse. Museum gift shops now sell bibs printed with substitution tables.`,
    imagePrompt: 'Museum display case with decrypted document showing crab feast menu and spy diagrams, visitors laughing, newsprint style',
    tags: ['history', 'cryptography', 'food'],
    statesMentioned: ['Maryland'],
    recurringCharacter: null,
    followUpHooks: [
      'Warehouse lights flicker to spell recipes when agents lie',
      'Museum schedules midnight tasting for "cleared palates only"'
    ]
  },
  {
    cardId: 'TRUTH-078',
    faction: 'truth',
    headline: 'MASSACHUSETTS MBTA PASSES START LISTING PARALLEL-UNIVERSE STOP NAMES',
    subhead: 'Swipe card itinerary includes stations like “Harvard (Evil Twin Campus)”',
    byline: 'By Abigail Fenwick, Boston Multiverse Bureau',
    body: `Boston commuters tapping CharlieCards saw their receipts show alternate stops such as "Park Street (Temporal Annex)" and "Harvard (Evil Twin Campus)." Riders who stayed on board heard announcements warning of shadow lectures and dean clones.

"I missed my stop and ended up at a platform filled with professors debating themselves," said student Leila Ortiz. "My pass now glows when I lie about office hours."

MBTA officials say the glitch is "creative vandalism" while patching software with sage smudging. Commuters trade holographic station maps like baseball cards.`,
    imagePrompt: 'MBTA turnstile receipt glowing with alternate station names, commuters bewildered, subway platform with double professors, newsprint style',
    tags: ['transit', 'multiverse', 'education'],
    statesMentioned: ['Massachusetts'],
    recurringCharacter: null,
    followUpHooks: [
      'Parallel campus demands accreditation from our timeline',
      'CharlieCards hum show tunes when alternate trains approach'
    ]
  },
  {
    cardId: 'TRUTH-079',
    faction: 'truth',
    headline: 'MICHIGAN GREAT LAKES FREIGHTER REPORTS LAKE SUPERIOR DEMANDING TOLL IN FOLK SONGS',
    subhead: 'Captain forced to sing shipping manifest in sea shanty to avoid reroute',
    byline: 'By Darryl Vaughn, Inland Wave Correspondent',
    body: `The freighter SS Copper Finch transmitted emergency radio chatter claiming Lake Superior refused passage until the crew sang their manifest as a folk ballad. Each verse caused waves to rearrange into approval stamps and footnotes about hidden smuggling compartments.

"When we hit the chorus, the lake spat out contraband golf carts," said captain Miriam Fong. "I’m still humming the verse about customs fees."

Coast Guard dismissed the story as "radio interference" while requesting lyric sheets. Folk festivals now host "Manifest Karaoke" to appease the lake spirits.`,
    imagePrompt: 'Great Lakes freighter crew singing with accordions while waves form approval stamps, Coast Guard listening, newsprint',
    tags: ['shipping', 'music', 'lake'],
    statesMentioned: ['Michigan'],
    recurringCharacter: null,
    followUpHooks: [
      'Songs reveal list of politicians owed favors by the lake',
      'Harbor pilots carry harmonicas as mandatory equipment'
    ]
  },
  {
    cardId: 'TRUTH-080',
    faction: 'truth',
    headline: 'MINNESOTA MALL SANTAS MOONLIGHT AS DATA BREACH RESPONSE TEAM',
    subhead: 'North Pole training manual doubles as cybersecurity playbook',
    byline: 'By Briana Soderberg, Snowbound Security Desk',
    body: `During summer orientation at Mall of America, seasonal Santas received "Nice/Naughty Firewall" binders instructing them to patch vulnerabilities using candy-cane encryption. When the mall’s Wi-Fi hiccuped, the Santas snapped their fingers and traced runes in artificial snow, blocking the hack.

"My beard pinged when the phishing emails hit," boasted Santa-in-training Jamal Price. "We rerouted the attack to a gift registry labelled 'Coal Futures.'"

Mall management calls the Santas "ambassadors of cheer" while quietly budgeting for sleigh-themed server racks. Kids now ask for two-factor authentication alongside toy requests.`,
    imagePrompt: 'Mall of America Santas in summer gear working at laptops with candy cane cables, artificial snow forming firewall patterns, newsprint style',
    tags: ['retail', 'cybersecurity', 'holiday'],
    statesMentioned: ['Minnesota'],
    recurringCharacter: null,
    followUpHooks: [
      'Santa hotline patched to detect ransomware carols',
      'Elves unionize for better encryption key rotation'
    ]
  },
  {
    cardId: 'TRUTH-081',
    faction: 'truth',
    headline: 'MISSISSIPPI CATFISH START SPELLING SENATE HEARINGS IN MUD BUBBLES',
    subhead: 'Riverbed transcripts leak names of who walked out before the vote',
    byline: 'By Coltrane Brooks, Delta Transparency Bureau',
    body: `Anglers along the Yazoo River noticed catfish burping perfectly round mud bubbles that rose to the surface and popped into legible cursive. The messages recounted Senate hearing roll calls and side conversations about flood insurance kickbacks.

"One catfish looked me dead in the eye and spelled 'CALL YOUR SENATOR, BILLY,'" said fisherman Billy Hargrove. "Then it demanded hush hush hush puppies."

State officials called the phenomenon "river folklore" while scooping jars of mud for analysis. Fish fries now include truth-or-dare segments moderated by catfish.`,
    imagePrompt: 'Fishermen watching river surface bubbles forming cursive, catfish peeking out, capitol dome reflection, newsprint style',
    tags: ['river', 'politics', 'prophecy'],
    statesMentioned: ['Mississippi'],
    recurringCharacter: null,
    followUpHooks: [
      'Bubbles burst faster whenever filibusters drag past midnight',
      'Local bait shops sell “whistleblower worms” at discount'
    ]
  },
  {
    cardId: 'TRUTH-082',
    faction: 'truth',
    headline: 'MISSOURI QUILTERS STITCH UNDERGROUND TUNNEL MAPS INTO COUNTY FAIR BLANKETS',
    subhead: 'Patchwork designs reveal bootleg fiber optic network under St. Louis',
    byline: 'By Penelope Grant, Gateway Patchwork Desk',
    body: `At the Jefferson County Quilt-Off, judges realized each entry subtly illustrated a section of tunnels weaving beneath St. Louis. When the quilts were placed together, they formed a glowing map of unregistered fiber optic cables connecting city hall to a shuttered brewery.

"My grandma swore she was sewing cardinals," said quilter Denise Hollow, whose blanket now hums when lobbyists visit. "Apparently, cardinals look like network topology."

City engineers insist the pattern is "coincidental craftsmanship" while discreetly tracing cables. Quilt guilds now sell limited-edition "Bandwidth Blankets" with built-in encryption.`,
    imagePrompt: 'County fair quilt display glowing with map overlay, quilters pointing at tunnel routes, onlookers shocked, newsprint style',
    tags: ['craft', 'infrastructure', 'exposure'],
    statesMentioned: ['Missouri'],
    recurringCharacter: null,
    followUpHooks: [
      'Quilt stitches vibrate when secret meetings start underground',
      'Brewery basement suddenly hosts pop-up ISP offering “heritage broadband”'
    ]
  },
  {
    cardId: 'TRUTH-083',
    faction: 'truth',
    headline: 'MONTANA GLACIER GUIDES HEAR BISON CARVING WARNING SIGNS INTO ICE',
    subhead: 'Frozen hoofprints caution tourists about pipeline detours and time rifts',
    byline: 'By Wyatt Greene, High Plains Ice Beat',
    body: `In Glacier National Park, bison wandered onto the icefields at dawn, scraping hoofprints that melted into glowing letters. The icy warnings mentioned pipeline detours, time rifts, and a senator’s secret snowmobile purchase.

"We followed the hoofprints and found a glowing fissure whispering policy memos," reported guide Rowan Kell. "The bison snorted approval when we filmed it."

Park officials call the phenomenon "seasonal hoof behavior" while posting bilingual signage for humans and ungulates. Souvenir shops now sell hoofprint rubbings as limited-edition subpoenas.`,
    imagePrompt: 'Montana glacier with bison carving letters into ice, guides reading glowing hoofprints, mountains backdrop, newsprint style',
    tags: ['wildlife', 'environment', 'prophecy'],
    statesMentioned: ['Montana'],
    recurringCharacter: null,
    followUpHooks: [
      'Hoofprint script updates when pipeline hearings reschedule',
      'Snowmobiles mysteriously redirect toward ranger stations'
    ]
  },
  {
    cardId: 'TRUTH-084',
    faction: 'truth',
    headline: 'NEBRASKA HIGH SCHOOL BAND MARCHES IN CROP FORMATION THAT SPELLS TAX DODGE',
    subhead: 'Half-time show outlines shell company maze visible from orbit',
    byline: 'By Melissa Ortiz, Cornfield Cadence Desk',
    body: `The Grand Island marching band performed during halftime and unknowingly spelled out the full diagram of a multinational shell company scheme. Satellite imagery captured the formation, revealing bank accounts, straw owners, and a suspiciously cheerful tuba solo labeled "consulting fee."

"Our drill chart said 'smiley face,'" gasped band director Tomi Alvarez. "The kids spelled 'PROSECUTE' instead."

School administrators blamed "mischievous band geeks" while hosting a bake sale to fund legal counsel. Fans now buy drone footage posters of the incriminating formation.`,
    imagePrompt: 'Football field halftime show with marching band forming corporate flowchart, drones overhead, crowd gasping, newsprint style',
    tags: ['education', 'finance', 'spectacle'],
    statesMentioned: ['Nebraska'],
    recurringCharacter: null,
    followUpHooks: [
      'Band uniforms begin printing routing numbers on sleeve cuffs',
      'Shell company lawyers sponsor the marching percussion section'
    ]
  },
  {
    cardId: 'TRUTH-085',
    faction: 'truth',
    headline: 'NEVADA DESERT RAVE DJS SPIN TRACK THAT SUMMONS AREA 51 EMPLOYEE COMPLAINTS',
    subhead: 'Bass drop triggers open mic of alien HR grievances',
    byline: 'By Hazel Sun, Black Rock Whistleblower Beat',
    body: `At an off-grid rave near Rachel, Nevada, DJs dropped a track called "Classified Groove" that caused speakers to broadcast Area 51 employee complaint hotlines. The beat layered grievances about ergonomic harnesses and interspecies wage gaps with throbbing synths.

"When the drop hit, a silver microphone materialized and begged for mediation," said raver Coco Bree. "We gave it glow sticks."

Military PR labeled the audio "artistic sampling" while confiscating subwoofers. Ravers now sell bootleg vinyl etched with security clearance codes.`,
    imagePrompt: 'Desert rave with DJ booth glowing, crowd dancing as holographic microphone appears, UFO silhouette, newsprint style',
    tags: ['festival', 'ufo', 'exposure'],
    statesMentioned: ['Nevada'],
    recurringCharacter: null,
    followUpHooks: [
      'Glow sticks double as debrief wands for captured agents',
      'Area 51 cafeteria suddenly offers vegan options after bass drop'
    ]
  },
  {
    cardId: 'TRUTH-086',
    faction: 'truth',
    headline: 'NEW HAMPSHIRE ICE FISHERMEN PULL UP TELEGRAPH REELS FROM 1776 ANNOUNCING FUTURE TAXES',
    subhead: 'Frozen parchment rattles off next year’s property assessments',
    byline: 'By Fiona Ledger, Granite Ledger Bureau',
    body: `On Lake Winnipesaukee, anglers reeled in brass telegraph reels attached to frozen parchment. Once thawed, the reels tapped Morse code reciting future property tax hikes and politely offering budget alternatives.

"It told me to plant lilacs to hide the assessor," said fisherman Dale March. "Also suggested a revolt if line item 47 passes."

Town clerks insist the reels are "historical reenactment props" while storing them in vaults. Ice shanties now double as tax planning seminars.`,
    imagePrompt: 'Ice fishermen reeling in antique telegraph reel with glowing parchment, shanty interior, snow-covered mountains, newsprint style',
    tags: ['history', 'taxes', 'winter'],
    statesMentioned: ['New Hampshire'],
    recurringCharacter: null,
    followUpHooks: [
      'Telegraph insists on hearing budget votes via tapping only',
      'Lake ice cracks whenever assessor lies about mill rate'
    ]
  },
  {
    cardId: 'TRUTH-087',
    faction: 'truth',
    headline: 'NEW JERSEY BOARDWALK ARCADE DISPENSES PRIZES THAT ARE ACTUALLY FOIA REQUESTS',
    subhead: 'Claw machines drop stamped envelopes demanding casino audits',
    byline: 'By Adriana Russo, Garden State Prize Patrol',
    body: `Families at Seaside Heights celebrated claw machine wins until the plush toys unfolded into pre-filled FOIA packets. Each envelope addressed the Casino Control Commission and requested receipts for "unreported reptilian cocktail parties."

"My kid wanted a stuffed shark," sighed parent Marco Santoro. "We got a subpoena and a coupon for funnel cake."

Arcade owners swear the machines were "hacked by bored law students" while counting piles of mailed requests. Teenagers now trade high-score screenshots for legal advice.`,
    imagePrompt: 'Boardwalk arcade with claw machine dropping envelopes instead of toys, surprised family holding FOIA forms, neon lights, newsprint style',
    tags: ['amusement', 'transparency', 'bureaucracy'],
    statesMentioned: ['New Jersey'],
    recurringCharacter: null,
    followUpHooks: [
      'Arcade ticket counter redeems points for notarized affidavits',
      'Funnel cake stand offers discount with proof of mailed FOIA'
    ]
  },
  {
    cardId: 'TRUTH-088',
    faction: 'truth',
    headline: 'NEW MEXICO DESERT CROSSWINDS STACK TUMBLEWEEDS INTO PYRAMID-SHAPED COURT SUMMONS',
    subhead: 'Pyramid glows whenever oil executives attempt to flee jurisdiction',
    byline: 'By Mateo Sandoval, Enchanted Summons Desk',
    body: `Outside Santa Rosa, tumbleweeds rolled together forming a pyramid that pulsed like a neon cactus. Each layer contained court summons addressing executives tied to ghost-drilling permits. Anyone touching the pyramid received a hologram of their future arraignment.

"I bumped it with my truck and got a stern lecture about groundwater," said rancher Eloy Chavez. "Also a coupon for legal representation."

Corporate lawyers call it "wind art" while renting helicopters to airlift the tumbleweeds. The pyramid keeps regrowing overnight with updated court dates.`,
    imagePrompt: 'Desert highway with glowing tumbleweed pyramid, officials reading hologram summons, oil pumps distant, newsprint style',
    tags: ['legal', 'environment', 'anomaly'],
    statesMentioned: ['New Mexico'],
    recurringCharacter: null,
    followUpHooks: [
      'Tumbleweed pyramid sprouts bailiff badges on windy days',
      'Executives report recurring dreams of sandstorm juries'
    ]
  },
  {
    cardId: 'TRUTH-089',
    faction: 'truth',
    headline: 'NEW YORK BROADWAY MARQUEE FLASHES SPOILERS FOR CLOSED-DOOR BUDGET TALKS',
    subhead: 'Times Square neon announces who traded subway funding for secret penthouse',
    byline: 'By L. Monroe, Midtown Marquee Reporter',
    body: `Tourists gasped when a Broadway marquee replaced show titles with scrolling text outlining last night's budget negotiations. The neon described handshake deals, hidden penthouses, and which assembly member demanded lifetime seltzer privileges.

"We came for Hamilton and got fiscal drama," laughed visitor Angela Wu. "The marquee gave me a QR code for a FOIA request."

City officials labelled it "projection mapping piracy" while pulling the building's power—only for the marquee to keep glowing in total silence. Theater ushers now sell playbills annotated with political footnotes.`,
    imagePrompt: 'Times Square marquee flashing political text, tourists photographing, officials yanking power cables without effect, newsprint style',
    tags: ['theater', 'politics', 'exposure'],
    statesMentioned: ['New York'],
    recurringCharacter: null,
    followUpHooks: [
      'Marquee switches to karaoke mode when lobbyists sing excuses',
      'Ticket scalpers bundle matinee seats with budget leak alerts'
    ]
  },
  {
    cardId: 'TRUTH-090',
    faction: 'truth',
    headline: 'NORTH CAROLINA BLUEGRASS JAM SUMMONS OLD GOVERNORS TO DEBATE THEMSELVES',
    subhead: 'Fiddle breakdown opens temporal stage for ghostly policy arguments',
    byline: 'By Avery Collins, Piedmont Parley Desk',
    body: `At a Raleigh bluegrass jam, fiddlers hit a minor key that materialized spectral versions of two former governors who immediately began debating highway tolls and hurricane relief missteps. Their arguments rhymed with the banjo solo and included actionable agenda items for next week's session.

"They asked us to fact-check in three-part harmony," said banjoist Carla Boone. "We obliged."

State officials insisted the appearance was "creative storytelling" while distributing earplugs. Musicians now schedule ghost debates between sets to boost tip jars.`,
    imagePrompt: 'Bluegrass musicians on stage with ghostly governors arguing, audience clapping, stage lights forming timeline, newsprint aesthetic',
    tags: ['music', 'politics', 'ghost'],
    statesMentioned: ['North Carolina'],
    recurringCharacter: null,
    followUpHooks: [
      'Spectral governors request minutes be archived on wax cylinder',
      'Jam sessions now include agenda item titled “haunting adjourned”'
    ]
  },
  {
    cardId: 'TRUTH-091',
    faction: 'truth',
    headline: 'NORTH DAKOTA PRAIRIE DOGS RUN POP-UP PRESS CONFERENCE ABOUT SECRET PIPELINE',
    subhead: 'Burrowing reporters squeak questions, display leaked environmental impact video',
    byline: 'By Jonah Petrov, Prairie Briefing Desk',
    body: `Hundreds of prairie dogs emerged near Minot wearing tiny press badges and set up a miniature podium. They projected drone footage of a clandestine pipeline branch while chittering for human translators to "acknowledge the leak, please."

"One tossed me a flash drive shaped like a sunflower seed," said journalist Elaine Cho. "The footage shows night crews burying a bypass."

Energy officials called the event "cute wildlife behavior" while confiscating rodent microphones. Locals now tune into "Prairie Dog Daily" on shortwave radio at noon.`,
    imagePrompt: 'Prairie dog colony with tiny podium and press badges, projecting video onto prairie grass, reporters taking notes, newsprint style',
    tags: ['wildlife', 'press', 'environment'],
    statesMentioned: ['North Dakota'],
    recurringCharacter: null,
    followUpHooks: [
      'Prairie dogs demand FOIA fee waiver in sunflower seeds',
      'Pipeline trucks find burrows arranged as STOP spelled in Morse'
    ]
  },
  {
    cardId: 'TRUTH-092',
    faction: 'truth',
    headline: 'OHIO ROLLER RINK DJ SCRATCHES VINYL THAT RELEASES REDACTED BUDGET FOOTNOTES',
    subhead: 'Skaters hear spending secrets embedded in disco remixes',
    byline: 'By Tanya Wells, Buckeye Spin Desk',
    body: `At a Columbus roller rink, the DJ remixed 'Stayin' Alive' and triggered hidden audio layers listing unreported line items in the state budget. Each scratch spilled another footnote about slush funds for "committee morale" and "alien liaison hospitality."

"Every time the beat dropped, our wheels spelled out fractions on the floor," said skater Dante Hicks. "The mirror ball blinked 'VOTE NO.'"

Budget officials claimed the set was "performance satire" while renting the rink for "team-building." Skaters now wear LED legwarmers synced to appropriation numbers.`,
    imagePrompt: 'Retro roller rink with DJ scratching vinyl, skaters glowing while text appears on floor, disco ball flashing words, newsprint style',
    tags: ['music', 'budget', 'culture'],
    statesMentioned: ['Ohio'],
    recurringCharacter: null,
    followUpHooks: [
      'Mirror ball dims whenever lobbyists enter the rink',
      'DJ releases mixtape called "Appropriations Anthem"'
    ]
  },
  {
    cardId: 'TRUTH-093',
    faction: 'truth',
    headline: 'OKLAHOMA PETTING ZOO GOATS EAT SHREDDED DOCUMENTS AND BLEAT THEM BACK IN FULL',
    subhead: 'Livestock digestion reconstructs deleted contracts on wool coats',
    byline: 'By Randi Calhoun, Plains Bleat Bureau',
    body: `Kids at an Edmond petting zoo fed goats shredded paper from a trash bag labeled "Routine Disposal." Minutes later, the goats bleated the entire contract in perfect order while their wool displayed scrolling text across the curls.

"We thought it was recycling," apologized manager Tracey Wilde. "Now visitors show up with FOIA snacks."

County clerks dismissed the goats as "nutritional anomalies" while confiscating their feed. Activists propose goat subpoenas as a new municipal service.`,
    imagePrompt: 'Petting zoo goats with text scrolling across wool, children watching, shredded documents bag, newsprint style',
    tags: ['animals', 'transparency', 'exposure'],
    statesMentioned: ['Oklahoma'],
    recurringCharacter: null,
    followUpHooks: [
      'Goats refuse to eat lettuce unless it includes redacted memos',
      'Wool inscriptions accepted as evidence in county court'
    ]
  },
  {
    cardId: 'TRUTH-094',
    faction: 'truth',
    headline: 'OREGON COFFEE SHOP BARISTA FOAMS LATTE ART THAT MAPS SECRET TECH CAMPUS',
    subhead: 'Microfoam reveals underground server cavern disguised as dog park',
    byline: 'By Saffron Lee, Cascadia Espresso Desk',
    body: `A Portland barista discovered her latte art refusing to form hearts; instead, the foam depicted a cross-section of an underground bunker beneath a trendy dog park. Customers watched as microfoam arrows labelled "redacted elevator" and "biometric treat dispenser" appeared.

"My latte told me to follow the golden doodles," sighed patron Casey Morales. "When I did, a manhole whispered 'top secret.'"

City planners blame "milk variability" while tasting suspiciously caffeinated evidence. Dog walkers now lead tours for curious caffeine addicts.`,
    imagePrompt: 'Barista presenting latte with foam showing bunker map, customers pointing, dog park visible through window, newsprint style',
    tags: ['coffee', 'technology', 'exposure'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: [
      'Dog park hydrants emit wifi password hints at midnight',
      'Microfoam shifts when NDAs expire'
    ]
  },
  {
    cardId: 'TRUTH-095',
    faction: 'truth',
    headline: 'PENNSYLVANIA LIBERTY BELL HUMS FREQUENCIES THAT UNLOCK HIDDEN COURT TRANSCRIPTS',
    subhead: 'Visitors receive earbuds playing backlog of sealed hearings',
    byline: 'By Eli Rosen, Keystone Resonance Reporter',
    body: `Tourists noticed the Liberty Bell vibrating at 528 Hz, handing out complimentary earbuds that tuned the hum into whispered transcripts from sealed grand jury sessions. The cracked icon insisted on quoting judges' lunch orders and lobbyist break-room gossip.

"It told me where the stenographer hides backup tapes," said visitor Aaliyah Brooks. "Then it offered a coupon for patriotic ice cream."

National Park Service claims it's "metal fatigue" while volunteers hand-sanitize earbuds. Independence Hall gift shop now sells resonance filters shaped like mini bells.`,
    imagePrompt: 'Liberty Bell with visitors wearing earbuds, sound waves illustrated, park rangers anxious, newsprint style',
    tags: ['history', 'court', 'exposure'],
    statesMentioned: ['Pennsylvania'],
    recurringCharacter: null,
    followUpHooks: [
      'Bell pitch drops whenever transcripts mention weather control',
      'Tour guides taught new script on responding to musical subpoenas'
    ]
  },
  {
    cardId: 'TRUTH-096',
    faction: 'truth',
    headline: 'RHODE ISLAND COFFEE MILK CARTONS PRINT DAILY SENATOR LOCATION UPDATE',
    subhead: 'Breakfast beverage now doubles as accountability tracker',
    byline: 'By Mariah Costa, Ocean State Transparency Desk',
    body: `Local dairies released limited coffee milk cartons featuring QR codes that reveal each senator’s real-time calendar. The cartons refresh at sunrise with alerts like "Currently hiding in committee room B" and "Dodged press by claiming lactose intolerance."

"My kid scanned breakfast and asked why the senator skipped arts funding," said parent Leo Andrade. "The carton suggested emailing the chief of staff."

Lawmakers cried privacy invasion while quietly updating alibis. Grocery stores now host "Accountability Aisles" offering letter-writing stations near dairy coolers.`,
    imagePrompt: 'Grocery aisle with coffee milk cartons showing senator schedules on phones, families writing postcards, newsprint style',
    tags: ['accountability', 'food', 'politics'],
    statesMentioned: ['Rhode Island'],
    recurringCharacter: null,
    followUpHooks: [
      'Cartons go blank when officials tell the truth under oath',
      'Dairy co-op receives mysterious offer to buy entire batch in cash'
    ]
  },
  {
    cardId: 'TRUTH-097',
    faction: 'truth',
    headline: 'SOUTH CAROLINA GHOST TOUR GUIDES ISSUE RECEIPTS THAT DOUBLE AS EXORCISM SUBPOENAS',
    subhead: 'Haunted mansions now require spectral testimony under oath',
    byline: 'By Naomi Grier, Lowcountry Haunting Bureau',
    body: `Charleston ghost tours began printing thermal receipts labeled "Summons to Depart." When handed to spirits, the receipts compel them to testify about centuries-old bribery while flickering like candlelight subpoenas.

"A ghost admitted to stealing harbor dredging funds in 1821," said guide Harriet Simons. "Then he tipped me in Confederate scrip."

Tourism officials call it "immersive storytelling" while law clerks request copies for cold cases. Paranormal lawyers now advertise contingency fees payable in ectoplasm.`,
    imagePrompt: 'Ghost tour at night with guides handing glowing receipts to apparitions, colonial houses in background, newsprint style',
    tags: ['ghost', 'justice', 'tourism'],
    statesMentioned: ['South Carolina'],
    recurringCharacter: null,
    followUpHooks: [
      'Specters request public defenders specializing in haunt law',
      'Receipts smolder whenever a living official lies about property deals'
    ]
  },
  {
    cardId: 'TRUTH-098',
    faction: 'truth',
    headline: 'SOUTH DAKOTA CORN PALACE PROJECTOR PLAYS FILM OF FUTURE LEGISLATIVE WALKOUT',
    subhead: 'Popcorn machine dispenses affidavits with extra butter',
    byline: 'By Owen Littlebird, Plains Preview Reporter',
    body: `The Corn Palace’s nightly light show glitched into a documentary from next month, detailing a dramatic legislative walkout complete with timestamps, quotes, and who forgot their coat. Concession stands synchronized by printing affidavits stapled to popcorn bags.

"My souvenir cup listed who leads the chant," said tourist Brielle Fox. "The ushers encouraged us to RSVP to the future."

State leadership called it "theatrical speculation" while the projector kept rolling. Locals host "watch parties for tomorrow" with souvenir butter-stained evidence packets.`,
    imagePrompt: 'Corn Palace facade projecting film of future legislature, audience with popcorn reading affidavits, newsprint aesthetic',
    tags: ['festival', 'prophecy', 'politics'],
    statesMentioned: ['South Dakota'],
    recurringCharacter: null,
    followUpHooks: [
      'Concession butter seals documents, making them tamper-evident',
      'Walkout leaders receive mystery texts quoting the film narration'
    ]
  },
  {
    cardId: 'TRUTH-099',
    faction: 'truth',
    headline: 'TENNESSEE HOT CHICKEN STAND SERVES SCOVILLE LEVELS THAT MEASURE CORRUPTION HEAT',
    subhead: 'Spice scale spikes whenever lobbyists approach the sauce counter',
    byline: 'By Danny Ortega, Nashville Integrity Beat',
    body: `A popular Nashville hot chicken stand swapped its heat scale for "corruption readings." Diners ordering mild received calm tang, while those requesting "Statehouse Reaper" got sauces that erupted in sparks if a bribery scandal was nearby.

"I asked for medium and the sauce screamed 'ethics complaint pending,'" said musician Kat Rivera. "It cooled down once the lobbyist left the line."

Health inspectors declared the reactions "capsaicin theatrics" but took samples. Politicians now send interns to taste-test public perception.`,
    imagePrompt: 'Hot chicken vendor with heat scale labeled corruption levels, sauce glowing when lobbyist nearby, customers sweating, newsprint style',
    tags: ['food', 'scandal', 'culture'],
    statesMentioned: ['Tennessee'],
    recurringCharacter: null,
    followUpHooks: [
      'Sauce bottles emit subpoenas when refrigerated',
      'Menu adds combo meal “Ethics Committee Platter” with free napkin depositions'
    ]
  },
  {
    cardId: 'TRUTH-100',
    faction: 'truth',
    headline: 'TEXAS WINDMILL FARMERS TRADE TORNADO INSURANCE FOR UFO ABDUCTION RIDERS',
    subhead: 'Insurance adjusters now carry cattle-proof tinfoil clipboards',
    byline: 'By Hector Salazar, Panhandle Policy Desk',
    body: `West Texas ranchers revealed their tornado policies auto-upgraded to include "alien evacuation coverage." Agents arrived with clipboards wrapped in foil, offering payouts for livestock lost to tractor beams and recommending storm shelters double as diplomatic suites.

"My premium dropped when I installed bilingual welcome mats," grinned rancher Graciela Flores. "The adjuster took selfies with my cows just in case."

Insurance companies insist it's "marketing flair" while quietly hiring UFO negotiators. Ranch supply stores now stock abduction-ready branding irons.`,
    imagePrompt: 'Texas ranch with windmills, insurance adjuster in foil hat examining cattle, UFO beam in sky, newsprint style',
    tags: ['insurance', 'ufo', 'agriculture'],
    statesMentioned: ['Texas'],
    recurringCharacter: null,
    followUpHooks: [
      'Adjusters require signatures from both rancher and visiting alien emissary',
      'Storm shelters install neon signs reading "Welcome, Probable Guests"'
    ]
  },
{
    cardId: 'TRUTH-101',
    faction: 'truth',
    headline: 'UTAH FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Alex Monroe, Field Correspondent',
    body: `Residents in Provo, Utah, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Alex Monroe wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Alex added that even their red rock foothills seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, red rock foothills',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Utah'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-102',
    faction: 'truth',
    headline: 'WISCONSIN TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Dev Hale, Field Correspondent',
    body: `Residents in Madison, Wisconsin, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Dev Hale wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Dev added that even their capitol skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, capitol skyline',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-103',
    faction: 'truth',
    headline: 'ARKANSAS SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Gia Osborne, Field Correspondent',
    body: `Residents in Little Rock, Arkansas, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Gia Osborne wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Gia added that even their riverwalk district seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, riverwalk district',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Arkansas'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-104',
    faction: 'truth',
    headline: 'FLORIDA RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Jules Alvarez, Field Correspondent',
    body: `Residents in Orlando, Florida, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Jules Alvarez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Jules added that even their theme park skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, theme park skyline',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Florida'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-105',
    faction: 'truth',
    headline: 'INDIANA ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Milo Ingram, Field Correspondent',
    body: `Residents in Fort Wayne, Indiana, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Milo Ingram wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Milo added that even their canal district seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, canal district',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Indiana'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-106',
    faction: 'truth',
    headline: 'MAINE ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Pilar Patel, Field Correspondent',
    body: `Residents in Bangor, Maine, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Pilar Patel wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Pilar added that even their foggy riverbank seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, foggy riverbank',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Maine'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-107',
    faction: 'truth',
    headline: 'MISSISSIPPI CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Sage Chen, Field Correspondent',
    body: `Residents in Biloxi, Mississippi, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Sage Chen wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Sage added that even their casino coast seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, casino coast',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Mississippi'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-108',
    faction: 'truth',
    headline: 'NEW HAMPSHIRE SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Brielle Jenkins, Field Correspondent',
    body: `Residents in Portsmouth, New Hampshire, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Brielle Jenkins wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Brielle added that even their seaside pier seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, seaside pier',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['New Hampshire'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-109',
    faction: 'truth',
    headline: 'OHIO MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Elena Quintero, Field Correspondent',
    body: `Residents in Dayton, Ohio, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Elena Quintero wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Elena added that even their airfield museum seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, airfield museum',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Ohio'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-110',
    faction: 'truth',
    headline: 'SOUTH CAROLINA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Hector Dixon, Field Correspondent',
    body: `Residents in Greenville, South Carolina, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Hector Dixon wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Hector added that even their waterfall plaza seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, waterfall plaza',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['South Carolina'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-111',
    faction: 'truth',
    headline: 'VERMONT FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Kian Kaufman, Field Correspondent',
    body: `Residents in Burlington, Vermont, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Kian Kaufman wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Kian added that even their snow-dusted lakefront seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, snow-dusted lakefront',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Vermont'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-112',
    faction: 'truth',
    headline: 'WYOMING TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Nia Ridge, Field Correspondent',
    body: `Residents in Jackson, Wyoming, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Nia Ridge wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Nia added that even their tetons backdrop seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, tetons backdrop',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Wyoming'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-113',
    faction: 'truth',
    headline: 'WEST VIRGINIA SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Quinn Escobar, Field Correspondent',
    body: `Residents in Wheeling, West Virginia, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Quinn Escobar wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Quinn added that even their foggy Appalachian ridge seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, foggy Appalachian ridge',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-114',
    faction: 'truth',
    headline: 'ARIZONA RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Taryn Lopez, Field Correspondent',
    body: `Residents in Yuma, Arizona, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Taryn Lopez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Taryn added that even their desert horizon seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, desert horizon',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Arizona'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-115',
    faction: 'truth',
    headline: 'DELAWARE ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Cass Sato, Field Correspondent',
    body: `Residents in Dover, Delaware, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Cass Sato wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Cass added that even their colonial square seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, colonial square',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Delaware'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-116',
    faction: 'truth',
    headline: 'ILLINOIS ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Frankie Foley, Field Correspondent',
    body: `Residents in Peoria, Illinois, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Frankie Foley wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Frankie added that even their riverfront warehouses seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, riverfront warehouses',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Illinois'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-117',
    faction: 'truth',
    headline: 'LOUISIANA CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Imani Murdock, Field Correspondent',
    body: `Residents in Lake Charles, Louisiana, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Imani Murdock wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Imani added that even their bayou refineries seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, bayou refineries',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Louisiana'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-118',
    faction: 'truth',
    headline: 'MINNESOTA SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Lark Talbot, Field Correspondent',
    body: `Residents in Duluth, Minnesota, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Lark Talbot wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Lark added that even their port cliffs seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, port cliffs',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Minnesota'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-119',
    faction: 'truth',
    headline: 'NEVADA MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Owen Grayson, Field Correspondent',
    body: `Residents in Reno, Nevada, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Owen Grayson wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Owen added that even their desert neon seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, desert neon',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Nevada'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-120',
    faction: 'truth',
    headline: 'NORTH DAKOTA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Ravi Nguyen, Field Correspondent',
    body: `Residents in Fargo, North Dakota, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Ravi Nguyen wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Ravi added that even their prairie skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, prairie skyline',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['North Dakota'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-121',
    faction: 'truth',
    headline: 'RHODE ISLAND FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Alex Monroe, Field Correspondent',
    body: `Residents in Providence, Rhode Island, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Alex Monroe wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Alex added that even their riverwalk seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, riverwalk',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Rhode Island'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-122',
    faction: 'truth',
    headline: 'UTAH TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Dev Hale, Field Correspondent',
    body: `Residents in Moab, Utah, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Dev Hale wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Dev added that even their arches canyon seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, arches canyon',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Utah'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-123',
    faction: 'truth',
    headline: 'WISCONSIN SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Gia Osborne, Field Correspondent',
    body: `Residents in Milwaukee, Wisconsin, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Gia Osborne wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Gia added that even their brewery district seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, brewery district',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-124',
    faction: 'truth',
    headline: 'WASHINGTON RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Jules Alvarez, Field Correspondent',
    body: `Residents in Spokane, Washington, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Jules Alvarez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Jules added that even their spruce-lined river gorge seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, spruce-lined river gorge',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Washington'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-125',
    faction: 'truth',
    headline: 'ALASKA ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Milo Ingram, Field Correspondent',
    body: `Residents in Nome, Alaska, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Milo Ingram wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Milo added that even their icy coastline seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, icy coastline',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Alaska'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-126',
    faction: 'truth',
    headline: 'CONNECTICUT ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Pilar Patel, Field Correspondent',
    body: `Residents in Bridgeport, Connecticut, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Pilar Patel wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Pilar added that even their industrial harbor seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, industrial harbor',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Connecticut'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-127',
    faction: 'truth',
    headline: 'IDAHO CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Sage Chen, Field Correspondent',
    body: `Residents in Boise, Idaho, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Sage Chen wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Sage added that even their sagebrush foothills seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, sagebrush foothills',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Idaho'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-128',
    faction: 'truth',
    headline: 'KENTUCKY SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Brielle Jenkins, Field Correspondent',
    body: `Residents in Lexington, Kentucky, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Brielle Jenkins wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Brielle added that even their horse farms seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, horse farms',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Kentucky'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-129',
    faction: 'truth',
    headline: 'MICHIGAN MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Elena Quintero, Field Correspondent',
    body: `Residents in Flint, Michigan, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Elena Quintero wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Elena added that even their industrial skyline seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, industrial skyline',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Michigan'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-130',
    faction: 'truth',
    headline: 'NEBRASKA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Hector Dixon, Field Correspondent',
    body: `Residents in Lincoln, Nebraska, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Hector Dixon wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Hector added that even their prairie capitol seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, prairie capitol',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Nebraska'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-131',
    faction: 'truth',
    headline: 'NEW YORK FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Kian Kaufman, Field Correspondent',
    body: `Residents in Syracuse, New York, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Kian Kaufman wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Kian added that even their snowy downtown seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, snowy downtown',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['New York'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-132',
    faction: 'truth',
    headline: 'PENNSYLVANIA TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Nia Ridge, Field Correspondent',
    body: `Residents in Erie, Pennsylvania, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Nia Ridge wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Nia added that even their lakefront docks seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, lakefront docks',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Pennsylvania'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-133',
    faction: 'truth',
    headline: 'TEXAS SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Quinn Escobar, Field Correspondent',
    body: `Residents in Lubbock, Texas, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Quinn Escobar wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Quinn added that even their flat plains seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, flat plains',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Texas'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-134',
    faction: 'truth',
    headline: 'WEST VIRGINIA RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Taryn Lopez, Field Correspondent',
    body: `Residents in Morgantown, West Virginia, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Taryn Lopez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Taryn added that even their mountain campus seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, mountain campus',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-135',
    faction: 'truth',
    headline: 'VIRGINIA ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Cass Sato, Field Correspondent',
    body: `Residents in Roanoke, Virginia, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Cass Sato wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Cass added that even their Blue Ridge valley seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, Blue Ridge valley',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-136',
    faction: 'truth',
    headline: 'ALABAMA ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Frankie Foley, Field Correspondent',
    body: `Residents in Mobile, Alabama, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Frankie Foley wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Frankie added that even their humid bayfront seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, humid bayfront',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Alabama'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-137',
    faction: 'truth',
    headline: 'COLORADO CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Imani Murdock, Field Correspondent',
    body: `Residents in Fort Collins, Colorado, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Imani Murdock wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Imani added that even their foothill campus seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, foothill campus',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Colorado'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-138',
    faction: 'truth',
    headline: 'HAWAII SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Lark Talbot, Field Correspondent',
    body: `Residents in Hilo, Hawaii, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Lark Talbot wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Lark added that even their rainforest coast seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, rainforest coast',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Hawaii'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-139',
    faction: 'truth',
    headline: 'KANSAS MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Owen Grayson, Field Correspondent',
    body: `Residents in Topeka, Kansas, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Owen Grayson wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Owen added that even their statehouse dome seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, statehouse dome',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Kansas'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-140',
    faction: 'truth',
    headline: 'MASSACHUSETTS MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Ravi Nguyen, Field Correspondent',
    body: `Residents in Springfield, Massachusetts, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Ravi Nguyen wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Ravi added that even their brick mills seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, brick mills',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Massachusetts'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-141',
    faction: 'truth',
    headline: 'MONTANA FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Alex Monroe, Field Correspondent',
    body: `Residents in Billings, Montana, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Alex Monroe wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Alex added that even their rimrock bluffs seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, rimrock bluffs',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Montana'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-142',
    faction: 'truth',
    headline: 'NEW MEXICO TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Dev Hale, Field Correspondent',
    body: `Residents in Taos, New Mexico, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Dev Hale wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Dev added that even their high desert mesa seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, high desert mesa',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['New Mexico'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-143',
    faction: 'truth',
    headline: 'OREGON SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Gia Osborne, Field Correspondent',
    body: `Residents in Eugene, Oregon, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Gia Osborne wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Gia added that even their green hills seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, green hills',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-144',
    faction: 'truth',
    headline: 'TENNESSEE RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Jules Alvarez, Field Correspondent',
    body: `Residents in Chattanooga, Tennessee, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Jules Alvarez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Jules added that even their river gorge seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, river gorge',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Tennessee'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-145',
    faction: 'truth',
    headline: 'WASHINGTON ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Milo Ingram, Field Correspondent',
    body: `Residents in Tacoma, Washington, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Milo Ingram wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Milo added that even their port cranes seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, port cranes',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Washington'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-146',
    faction: 'truth',
    headline: 'VERMONT ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Pilar Patel, Field Correspondent',
    body: `Residents in Burlington, Vermont, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Pilar Patel wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Pilar added that even their snow-dusted lakefront seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, snow-dusted lakefront',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Vermont'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-147',
    faction: 'truth',
    headline: 'WYOMING CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Sage Chen, Field Correspondent',
    body: `Residents in Sheridan, Wyoming, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Sage Chen wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Sage added that even their rolling prairie seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, rolling prairie',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Wyoming'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-148',
    faction: 'truth',
    headline: 'CALIFORNIA SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Brielle Jenkins, Field Correspondent',
    body: `Residents in Redding, California, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Brielle Jenkins wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Brielle added that even their pine-covered hills seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, pine-covered hills',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['California'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-149',
    faction: 'truth',
    headline: 'GEORGIA MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Elena Quintero, Field Correspondent',
    body: `Residents in Savannah, Georgia, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Elena Quintero wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Elena added that even their oak-lined square seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, oak-lined square',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Georgia'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-150',
    faction: 'truth',
    headline: 'IOWA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Hector Dixon, Field Correspondent',
    body: `Residents in Cedar Rapids, Iowa, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Hector Dixon wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Hector added that even their grain silos seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, grain silos',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Iowa'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-151',
    faction: 'truth',
    headline: 'MARYLAND FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Kian Kaufman, Field Correspondent',
    body: `Residents in Annapolis, Maryland, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Kian Kaufman wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Kian added that even their naval harbor seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, naval harbor',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Maryland'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-152',
    faction: 'truth',
    headline: 'MISSOURI TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Nia Ridge, Field Correspondent',
    body: `Residents in Columbia, Missouri, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Nia Ridge wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Nia added that even their college quad seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, college quad',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Missouri'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-153',
    faction: 'truth',
    headline: 'NEW JERSEY SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Quinn Escobar, Field Correspondent',
    body: `Residents in Trenton, New Jersey, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Quinn Escobar wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Quinn added that even their statehouse steps seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, statehouse steps',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['New Jersey'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-154',
    faction: 'truth',
    headline: 'OKLAHOMA RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Taryn Lopez, Field Correspondent',
    body: `Residents in Tulsa, Oklahoma, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Taryn Lopez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Taryn added that even their art deco skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, art deco skyline',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Oklahoma'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-155',
    faction: 'truth',
    headline: 'SOUTH DAKOTA ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Cass Sato, Field Correspondent',
    body: `Residents in Rapid City, South Dakota, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Cass Sato wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Cass added that even their badlands edge seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, badlands edge',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['South Dakota'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-156',
    faction: 'truth',
    headline: 'VIRGINIA ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Frankie Foley, Field Correspondent',
    body: `Residents in Norfolk, Virginia, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Frankie Foley wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Frankie added that even their naval docks seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, naval docks',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-157',
    faction: 'truth',
    headline: 'UTAH CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Imani Murdock, Field Correspondent',
    body: `Residents in Provo, Utah, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Imani Murdock wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Imani added that even their red rock foothills seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, red rock foothills',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Utah'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-158',
    faction: 'truth',
    headline: 'WISCONSIN SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Lark Talbot, Field Correspondent',
    body: `Residents in Madison, Wisconsin, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Lark Talbot wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Lark added that even their capitol skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, capitol skyline',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-159',
    faction: 'truth',
    headline: 'ARKANSAS MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Owen Grayson, Field Correspondent',
    body: `Residents in Little Rock, Arkansas, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Owen Grayson wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Owen added that even their riverwalk district seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, riverwalk district',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Arkansas'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-160',
    faction: 'truth',
    headline: 'FLORIDA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Ravi Nguyen, Field Correspondent',
    body: `Residents in Orlando, Florida, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Ravi Nguyen wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Ravi added that even their theme park skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, theme park skyline',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Florida'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-161',
    faction: 'truth',
    headline: 'INDIANA FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Alex Monroe, Field Correspondent',
    body: `Residents in Fort Wayne, Indiana, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Alex Monroe wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Alex added that even their canal district seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, canal district',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Indiana'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-162',
    faction: 'truth',
    headline: 'MAINE TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Dev Hale, Field Correspondent',
    body: `Residents in Bangor, Maine, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Dev Hale wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Dev added that even their foggy riverbank seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, foggy riverbank',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Maine'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-163',
    faction: 'truth',
    headline: 'MISSISSIPPI SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Gia Osborne, Field Correspondent',
    body: `Residents in Biloxi, Mississippi, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Gia Osborne wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Gia added that even their casino coast seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, casino coast',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Mississippi'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-164',
    faction: 'truth',
    headline: 'NEW HAMPSHIRE RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Jules Alvarez, Field Correspondent',
    body: `Residents in Portsmouth, New Hampshire, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Jules Alvarez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Jules added that even their seaside pier seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, seaside pier',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['New Hampshire'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-165',
    faction: 'truth',
    headline: 'OHIO ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Milo Ingram, Field Correspondent',
    body: `Residents in Dayton, Ohio, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Milo Ingram wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Milo added that even their airfield museum seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, airfield museum',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Ohio'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-166',
    faction: 'truth',
    headline: 'SOUTH CAROLINA ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Pilar Patel, Field Correspondent',
    body: `Residents in Greenville, South Carolina, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Pilar Patel wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Pilar added that even their waterfall plaza seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, waterfall plaza',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['South Carolina'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-167',
    faction: 'truth',
    headline: 'VERMONT CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Sage Chen, Field Correspondent',
    body: `Residents in Burlington, Vermont, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Sage Chen wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Sage added that even their snow-dusted lakefront seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, snow-dusted lakefront',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Vermont'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-168',
    faction: 'truth',
    headline: 'WYOMING SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Brielle Jenkins, Field Correspondent',
    body: `Residents in Jackson, Wyoming, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Brielle Jenkins wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Brielle added that even their tetons backdrop seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, tetons backdrop',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Wyoming'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-169',
    faction: 'truth',
    headline: 'WEST VIRGINIA MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Elena Quintero, Field Correspondent',
    body: `Residents in Wheeling, West Virginia, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Elena Quintero wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Elena added that even their foggy Appalachian ridge seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, foggy Appalachian ridge',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-170',
    faction: 'truth',
    headline: 'ARIZONA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Hector Dixon, Field Correspondent',
    body: `Residents in Yuma, Arizona, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Hector Dixon wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Hector added that even their desert horizon seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, desert horizon',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Arizona'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-171',
    faction: 'truth',
    headline: 'DELAWARE FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Kian Kaufman, Field Correspondent',
    body: `Residents in Dover, Delaware, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Kian Kaufman wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Kian added that even their colonial square seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, colonial square',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Delaware'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-172',
    faction: 'truth',
    headline: 'ILLINOIS TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Nia Ridge, Field Correspondent',
    body: `Residents in Peoria, Illinois, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Nia Ridge wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Nia added that even their riverfront warehouses seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, riverfront warehouses',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Illinois'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-173',
    faction: 'truth',
    headline: 'LOUISIANA SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Quinn Escobar, Field Correspondent',
    body: `Residents in Lake Charles, Louisiana, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Quinn Escobar wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Quinn added that even their bayou refineries seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, bayou refineries',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Louisiana'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-174',
    faction: 'truth',
    headline: 'MINNESOTA RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Taryn Lopez, Field Correspondent',
    body: `Residents in Duluth, Minnesota, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Taryn Lopez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Taryn added that even their port cliffs seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, port cliffs',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Minnesota'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-175',
    faction: 'truth',
    headline: 'NEVADA ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Cass Sato, Field Correspondent',
    body: `Residents in Reno, Nevada, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Cass Sato wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Cass added that even their desert neon seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, desert neon',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Nevada'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-176',
    faction: 'truth',
    headline: 'NORTH DAKOTA ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Frankie Foley, Field Correspondent',
    body: `Residents in Fargo, North Dakota, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Frankie Foley wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Frankie added that even their prairie skyline seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, prairie skyline',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['North Dakota'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-177',
    faction: 'truth',
    headline: 'RHODE ISLAND CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Imani Murdock, Field Correspondent',
    body: `Residents in Providence, Rhode Island, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Imani Murdock wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Imani added that even their riverwalk seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, riverwalk',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Rhode Island'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-178',
    faction: 'truth',
    headline: 'UTAH SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Lark Talbot, Field Correspondent',
    body: `Residents in Moab, Utah, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Lark Talbot wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Lark added that even their arches canyon seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, arches canyon',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Utah'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-179',
    faction: 'truth',
    headline: 'WISCONSIN MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Owen Grayson, Field Correspondent',
    body: `Residents in Milwaukee, Wisconsin, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Owen Grayson wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Owen added that even their brewery district seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, brewery district',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-180',
    faction: 'truth',
    headline: 'WASHINGTON MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Ravi Nguyen, Field Correspondent',
    body: `Residents in Spokane, Washington, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Ravi Nguyen wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Ravi added that even their spruce-lined river gorge seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, spruce-lined river gorge',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Washington'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-181',
    faction: 'truth',
    headline: 'ALASKA FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Alex Monroe, Field Correspondent',
    body: `Residents in Nome, Alaska, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Alex Monroe wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Alex added that even their icy coastline seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, icy coastline',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Alaska'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-182',
    faction: 'truth',
    headline: 'CONNECTICUT TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Dev Hale, Field Correspondent',
    body: `Residents in Bridgeport, Connecticut, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Dev Hale wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Dev added that even their industrial harbor seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, industrial harbor',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Connecticut'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-183',
    faction: 'truth',
    headline: 'IDAHO SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Gia Osborne, Field Correspondent',
    body: `Residents in Boise, Idaho, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Gia Osborne wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Gia added that even their sagebrush foothills seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, sagebrush foothills',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Idaho'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-184',
    faction: 'truth',
    headline: 'KENTUCKY RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Jules Alvarez, Field Correspondent',
    body: `Residents in Lexington, Kentucky, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Jules Alvarez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Jules added that even their horse farms seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, horse farms',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Kentucky'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-185',
    faction: 'truth',
    headline: 'MICHIGAN ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Milo Ingram, Field Correspondent',
    body: `Residents in Flint, Michigan, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Milo Ingram wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Milo added that even their industrial skyline seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, industrial skyline',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Michigan'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-186',
    faction: 'truth',
    headline: 'NEBRASKA ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Pilar Patel, Field Correspondent',
    body: `Residents in Lincoln, Nebraska, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Pilar Patel wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Pilar added that even their prairie capitol seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, prairie capitol',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Nebraska'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-187',
    faction: 'truth',
    headline: 'NEW YORK CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Sage Chen, Field Correspondent',
    body: `Residents in Syracuse, New York, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Sage Chen wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Sage added that even their snowy downtown seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, snowy downtown',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['New York'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-188',
    faction: 'truth',
    headline: 'PENNSYLVANIA SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Brielle Jenkins, Field Correspondent',
    body: `Residents in Erie, Pennsylvania, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Brielle Jenkins wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Brielle added that even their lakefront docks seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, lakefront docks',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['Pennsylvania'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-189',
    faction: 'truth',
    headline: 'TEXAS MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Elena Quintero, Field Correspondent',
    body: `Residents in Lubbock, Texas, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Elena Quintero wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Elena added that even their flat plains seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, flat plains',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Texas'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-190',
    faction: 'truth',
    headline: 'WEST VIRGINIA MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Hector Dixon, Field Correspondent',
    body: `Residents in Morgantown, West Virginia, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Hector Dixon wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Hector added that even their mountain campus seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, mountain campus',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-191',
    faction: 'truth',
    headline: 'VIRGINIA FERAL DRONE CHOIR EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Feral drone choir reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Kian Kaufman, Field Correspondent',
    body: `Residents in Roanoke, Virginia, watched as a feral drone choir hovered over city hall and harmonized, each note spelling line items across the courthouse facade. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Kian Kaufman wiped glittering residue off their clipboard and told the Paranoid Times, "Feral Drone Choir never shows up unless the numbers lie." Kian added that even their Blue Ridge valley seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials, Blue Ridge valley',
    tags: ['technology', 'music', 'exposure'],
    statesMentioned: ['Virginia'],
    recurringCharacter: null,
    followUpHooks: ['Feral drone choir broadcasts reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-192',
    faction: 'truth',
    headline: 'ALABAMA TIME-TRAVELING FARMERS MARKET EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Time-traveling farmers market reveals synthetic weather futures despite official denials',
    byline: 'By Nia Ridge, Field Correspondent',
    body: `Residents in Mobile, Alabama, watched as a time-traveling farmers market popped into existence between parking meters, vendors handing out produce labeled with tomorrow’s committee agendas. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Nia Ridge wiped glittering residue off their clipboard and told the Paranoid Times, "Time-Traveling Farmers Market never shows up unless the numbers lie." Nia added that even their humid bayfront seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised, humid bayfront',
    tags: ['market', 'time-anomaly', 'community'],
    statesMentioned: ['Alabama'],
    recurringCharacter: null,
    followUpHooks: ['Time-traveling farmers market reappears reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-193',
    faction: 'truth',
    headline: 'COLORADO SENTIENT POTHOLE NETWORK EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Sentient pothole network reveals synthetic influencer factory despite official denials',
    byline: 'By Quinn Escobar, Field Correspondent',
    body: `Residents in Fort Collins, Colorado, watched as a sentient pothole network aligned down the avenue, forming arrows toward a hidden budget vault. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Quinn Escobar wiped glittering residue off their clipboard and told the Paranoid Times, "Sentient Pothole Network never shows up unless the numbers lie." Quinn added that even their foothill campus seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'City street with glowing potholes forming arrow, drivers shocked, foothill campus',
    tags: ['infrastructure', 'exposure', 'urban'],
    statesMentioned: ['Colorado'],
    recurringCharacter: null,
    followUpHooks: ['Sentient pothole network rearranges reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-194',
    faction: 'truth',
    headline: 'HAWAII RETRO-FUTURIST ICE CREAM TRUCK EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Retro-futurist ice cream truck reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Taryn Lopez, Field Correspondent',
    body: `Residents in Hilo, Hawaii, watched as a retro-futurist ice cream truck parked outside the data center, serving sundaes that melt into flow charts. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Taryn Lopez wiped glittering residue off their clipboard and told the Paranoid Times, "Retro-Futurist Ice Cream Truck never shows up unless the numbers lie." Taryn added that even their rainforest coast seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background, rainforest coast',
    tags: ['food', 'technology', 'exposure'],
    statesMentioned: ['Hawaii'],
    recurringCharacter: null,
    followUpHooks: ['Retro-futurist ice cream truck circles reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-195',
    faction: 'truth',
    headline: 'KANSAS ROGUE BARISTA COLLECTIVE EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Rogue barista collective reveals temporal zoning variance despite official denials',
    byline: 'By Cass Sato, Field Correspondent',
    body: `Residents in Topeka, Kansas, watched as a rogue barista collective sprayed latte art across courthouse steps, foam patterns revealing encrypted badge numbers. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Cass Sato wiped glittering residue off their clipboard and told the Paranoid Times, "Rogue Barista Collective never shows up unless the numbers lie." Cass added that even their statehouse dome seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned, statehouse dome',
    tags: ['coffee', 'activism', 'exposure'],
    statesMentioned: ['Kansas'],
    recurringCharacter: null,
    followUpHooks: ['Rogue barista collective steams reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  },
  {
    cardId: 'TRUTH-196',
    faction: 'truth',
    headline: 'MASSACHUSETTS ASTRAL PROJECTION BOOK CLUB EXPOSES SHADOW INFRASTRUCTURE BOND SWAPS',
    subhead: 'Astral projection book club reveals shadow infrastructure bond swaps despite official denials',
    byline: 'By Frankie Foley, Field Correspondent',
    body: `Residents in Springfield, Massachusetts, watched as an astral projection book club phased through locked meeting rooms, leaving sticky notes glowing with unresolved votes. Witnesses say the spectacle highlighted a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish.

Municipal archivist Frankie Foley wiped glittering residue off their clipboard and told the Paranoid Times, "Astral Projection Book Club never shows up unless the numbers lie." Frankie added that even their brick mills seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the potholes spelled out the phrase "WE KNOW" in fresh asphalt. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Spectral readers floating through conference room glass leaving glowing notes behind, brick mills',
    tags: ['ghost', 'politics', 'community'],
    statesMentioned: ['Massachusetts'],
    recurringCharacter: null,
    followUpHooks: ['Astral projection book club materializes reminders that anonymous envelopes with embossed bond coupons arrive at sunrise', 'Local radio DJ plays a traffic report that doubles as swap rates']
  },
  {
    cardId: 'TRUTH-197',
    faction: 'truth',
    headline: 'MONTANA CRYPTID-LED NEIGHBORHOOD WATCH EXPOSES SYNTHETIC WEATHER FUTURES',
    subhead: 'Cryptid-led neighborhood watch reveals synthetic weather futures despite official denials',
    byline: 'By Imani Murdock, Field Correspondent',
    body: `Residents in Billings, Montana, watched as a cryptid-led neighborhood watch knocked on every door at midnight, handing out zines on missing appropriations. Witnesses say the spectacle highlighted a spreadsheet pricing synthetic weather futures sold to lobbyists.

Cafeteria manager Imani Murdock wiped glittering residue off their clipboard and told the Paranoid Times, "Cryptid-Led Neighborhood Watch never shows up unless the numbers lie." Imani added that even their rimrock bluffs seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the science fair trophies morphed into subpoenas mid-award. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on, rimrock bluffs',
    tags: ['cryptid', 'community', 'exposure'],
    statesMentioned: ['Montana'],
    recurringCharacter: null,
    followUpHooks: ['Cryptid-led neighborhood watch organizes reminders that forecast app pushes alerts labeled "probability of perjury"', 'Lobbyists carry umbrellas that display insider trading tips']
  },
  {
    cardId: 'TRUTH-198',
    faction: 'truth',
    headline: 'NEW MEXICO SUBTERRANEAN LIBRARY OF CICADAS EXPOSES SYNTHETIC INFLUENCER FACTORY',
    subhead: 'Subterranelibrary of cicadas reveals synthetic influencer factory despite official denials',
    byline: 'By Lark Talbot, Field Correspondent',
    body: `Residents in Taos, New Mexico, watched as a subterranean library of cicadas crawled out of storm drains reciting statutes, their wing beats flipping pages of invisible law books in the air. Witnesses say the spectacle highlighted design specs for synthetic influencers assigned to boost incumbents.

Parkour instructor Lark Talbot wiped glittering residue off their clipboard and told the Paranoid Times, "Subterranean Library Of Cicadas never shows up unless the numbers lie." Lark added that even their high desert mesa seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the influencers started endorsing rival candidates mid-stream. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style, high desert mesa',
    tags: ['insects', 'law', 'prophecy'],
    statesMentioned: ['New Mexico'],
    recurringCharacter: null,
    followUpHooks: ['Subterranean library of cicadas chirps reminders that ring lights flicker Morse code for campaign finance rules', 'Teen focus groups demand royalties for deepfake cameos']
  },
  {
    cardId: 'TRUTH-199',
    faction: 'truth',
    headline: 'OREGON MIRROR-PLATED MARCHING BAND EXPOSES GHOST PAYROLL FOR IMAGINARY CONSULTANTS',
    subhead: 'Mirror-plated marching band reveals ghost payroll for imaginary consultants despite official denials',
    byline: 'By Owen Grayson, Field Correspondent',
    body: `Residents in Eugene, Oregon, watched as a mirror-plated marching band paraded backward through downtown, reflections flashing classified memos in Morse code. Witnesses say the spectacle highlighted a payroll roster for consultants who are technically imaginary friends of the mayor.

Night-shift bus driver Owen Grayson wiped glittering residue off their clipboard and told the Paranoid Times, "Mirror-Plated Marching Band never shows up unless the numbers lie." Owen added that even their green hills seemed to shimmer with footnotes.

Officials from the Department of Plausible Deniability issued a press release claiming nothing unusual happened except a "community engagement opportunity", even as the imaginary friends show up to demand dental coverage. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background, green hills',
    tags: ['music', 'reflection', 'secrets'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: ['Mirror-plated marching band rehearses reminders that city HR portal adds dropdown option for "spectral hire"', 'Budget meetings include a chair reserved for invisible advisors']
  },
  {
    cardId: 'TRUTH-200',
    faction: 'truth',
    headline: 'TENNESSEE MULTILINGUAL THUNDERHEAD EXPOSES TEMPORAL ZONING VARIANCE',
    subhead: 'Multilingual thunderhead reveals temporal zoning variance despite official denials',
    byline: 'By Ravi Nguyen, Field Correspondent',
    body: `Residents in Chattanooga, Tennessee, watched as a multilingual thunderhead hovered over the civic center, translating public comments into classified clearance codes. Witnesses say the spectacle highlighted notarized requests for temporal zoning variances that backdate luxury condos.

Retired codebreaker Ravi Nguyen wiped glittering residue off their clipboard and told the Paranoid Times, "Multilingual Thunderhead never shows up unless the numbers lie." Ravi added that even their river gorge seemed to shimmer with footnotes.

Officials from the Agency for Harmonized Infrastructure blamed a software update and recommended everyone delete their memories between 2 and 4 AM, even as the reenactors issued real eviction notices from 1894. Locals now trade push notifications describing which committee panic-bought white noise machines.`,
    imagePrompt: 'Thundercloud above civic building with lightning forming words, residents recording, river gorge',
    tags: ['weather', 'translation', 'civic'],
    statesMentioned: ['Tennessee'],
    recurringCharacter: null,
    followUpHooks: ['Multilingual thunderhead drifts reminders that zoning board meetings now require hourglasses as public comment timers', 'Construction cranes briefly appear in sepia tone during golden hour']
  }
];
