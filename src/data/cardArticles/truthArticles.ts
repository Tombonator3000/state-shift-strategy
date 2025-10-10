import type { CardArticle } from './articleDatabase';

/**
 * Truth Faction Card-Specific Articles
 * Cards TRUTH-001 through TRUTH-050
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
  }

  // NOTE: Articles for TRUTH-009 through TRUTH-049 follow the same detailed format
  // Each includes: headline, subhead, byline, 3-4 paragraph body, imagePrompt, tags, states, character, and hooks
  // Full 50-article database will be completed in next iteration
];
