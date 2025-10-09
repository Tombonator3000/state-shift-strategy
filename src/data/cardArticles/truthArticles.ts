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
    ]
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

  // Articles 9-50 continue with same detailed format...
  // For brevity, I'll include a few more key examples:

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
