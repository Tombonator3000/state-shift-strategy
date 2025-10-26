import type { CardArticle } from './articleDatabase';

/**
 * Special Cards Articles
 * Covers TRUTH-SPECIAL-*, GOV-SPECIAL-*, and comeback cards
 */

export const specialCardsArticles: CardArticle[] = [
  // Truth Special Cards
  {
    cardId: 'TRUTH-SPECIAL-001',
    faction: 'truth',
    headline: 'ANONYMOUS TIPSTER DROPS PARKING GARAGE BOMBSHELL—WATERGATE CALLED "ROOKIE MOVE"',
    subhead: 'Mystery informant leaves manila envelope, disappears into shadows',
    byline: 'By Marcus Webb, Investigative Sources Desk',
    body: `An unidentified source left a manila envelope stuffed with classified documents in the third level of the Rosslyn Metro parking garage early Tuesday morning, reviving the classic deep-throat informant playbook for the digital age.

The package contained forty-seven pages of redacted memos, three USB drives labeled "BACKUP BACKUP BACKUP," and a handwritten note reading "Follow the money. Also, the parking is validated."

Veteran journalists are calling it a return to traditional leaking methods. "No encrypted Signal messages, no ProtonMail, just good old-fashioned garage paranoia," said retired investigative reporter Janet Torres. "Whoever this source is, they watched All The President's Men on repeat."

The documents allegedly detail financial irregularities at the Department of Resource Allocation. Officials dismissed the leak as "fan fiction" but declined to explain why three senior administrators resigned within hours of the story breaking.`,
    imagePrompt: 'Dark parking garage, manila envelope on concrete pillar, shadowy figure in background, film noir lighting, grainy newsprint aesthetic',
    tags: ['leak', 'investigation', 'whistleblower'],
    statesMentioned: ['Virginia'],
    recurringCharacter: null,
    followUpHooks: [
      'Parking garage security footage mysteriously degaussed',
      'Three more envelopes discovered at different garages nationwide'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-002',
    faction: 'truth',
    headline: 'WITNESS PROTECTION AGENT ADMITS: "WE LOST TRACK OF 47 BIGFOOTS"',
    subhead: 'Federal program for cryptid informants called "administrative nightmare"',
    byline: 'By Jennifer Cross, Cryptid Affairs',
    body: `A veteran U.S. Marshal assigned to the rarely-acknowledged Paranormal Witness Security Program revealed that the agency has lost contact with dozens of relocated cryptids over the past decade.

"They're supposed to check in monthly," admitted Deputy Marshal Frank Kowalski in an unauthorized interview. "But how do you track a creature that can turn invisible, or lives in a dimension we can't measure? Plus, they hate paperwork."

The PWSP was established in 1983 to protect cryptid witnesses willing to testify against criminal organizations. Relocated subjects are given new identities, government stipends, and homes in remote areas. But compliance rates are abysmal.

"We had one Mothman who was supposed to lay low in Wisconsin," Kowalski continued. "Last we heard, he was operating a used car lot in Florida under the name 'Marv.' His sales tactics are... unconventional."`,
    imagePrompt: 'Federal agent looking at wall of missing posters showing various cryptids, bureaucratic office setting, fluorescent lighting, newsprint quality',
    tags: ['cryptid', 'bureaucracy', 'witness'],
    statesMentioned: ['Wisconsin', 'Florida'],
    recurringCharacter: null,
    followUpHooks: [
      'Florida car dealer named "Marv" sells vehicle with moth-damaged upholstery',
      'Witness protection program expands to include cryptid therapists'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-003',
    faction: 'truth',
    headline: 'UNDERGROUND RADIO NETWORK REVEALS: GOVERNMENT OWNS 89% OF ALL TINFOIL',
    subhead: 'Conspiracy theorists claim aluminum shortage is "thought control operation"',
    byline: 'By Sarah Kim, Alternative Media Watch',
    body: `A shadowy collective of pirate radio operators broadcasting from undisclosed locations has compiled evidence suggesting that federal agencies have quietly purchased controlling interests in every major aluminum foil manufacturer in North America.

"They want us defenseless," claimed broadcaster "Signal Ghost," whose show reaches an estimated 340,000 weekly listeners. "They pump out 5G, mind-control satellites, and weather manipulation—and then they corner the market on the one thing that blocks it all. The audacity is almost impressive."

Industry analysts confirm that a series of shell companies linked to government contractors have acquired substantial holdings in Reynolds, Alcoa, and seven smaller foil producers since 2019. The Department of Interior declined to comment, citing "proprietary concerns."

Meanwhile, independent tinfoil producers report record sales, with one Vermont manufacturer noting "we're back-ordered through 2026."`,
    imagePrompt: 'Pirate radio station setup in basement, walls covered with aluminum foil, conspiracy theory charts, ham radio equipment, dramatic shadows',
    tags: ['conspiracy', 'media', 'government'],
    statesMentioned: ['Vermont'],
    recurringCharacter: null,
    followUpHooks: [
      'Vermont foil manufacturer reports mysterious factory inspections',
      'Underground radio operators coordinate "Foil Freedom Day" nationwide'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-004',
    faction: 'truth',
    headline: 'LEAKED MEMO: AREA 51 JANITOR HAD HIGHER CLEARANCE THAN JOINT CHIEFS',
    subhead: 'Custodial staff member saw "literally everything," sources confirm',
    byline: 'By Danny Ortega, Classified Access Bureau',
    body: `A declassified personnel roster accidentally posted to a public server reveals that a maintenance worker at Nevada's most secretive military installation possessed security clearance levels that exceeded those of senior military leadership for over twelve years.

Raymond "Ray" Kowalski, 67, worked as a night-shift custodian at the Groom Lake facility from 1997 to 2009. His clearance code, "ULTRA-SAPPHIRE-COSMIC," granted him access to thirty-four secure areas—including three that weren't officially acknowledged to exist.

"Someone had to clean the alien autopsy room," explained former facility administrator Colonel Martin Price. "Ray was good at his job, kept his mouth shut, and never asked questions. That's worth more than four stars."

Kowalski, now retired to Arizona, was reached for comment but declined to speak. His lawyer issued a statement: "Mr. Kowalski mopped floors. That is the extent of his professional activities. Also, the grey ones prefer lemon-scented cleaning solution."`,
    imagePrompt: 'Elderly janitor with mop standing in futuristic corridor, high-tech doors in background, security badge with multiple clearances, newsprint style',
    tags: ['area51', 'clearance', 'leak'],
    statesMentioned: ['Nevada', 'Arizona'],
    recurringCharacter: null,
    followUpHooks: [
      'Lemon-scented floor cleaner sales spike 340% in Nevada',
      'Former janitor publishes memoir titled "I Swept It All Under The Rug"'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-005',
    faction: 'truth',
    headline: 'CONSPIRACY PODCAST HITS #1—HOST STILL BROADCASTING FROM SECURE BUNKER',
    subhead: 'Popular show "They Know That You Know" reaches 15 million subscribers',
    byline: 'By Marcus Webb, Digital Media Trends',
    body: `The underground conspiracy podcast "They Know That You Know," hosted by the pseudonymous "Signal Seven," has topped streaming charts worldwide—despite the fact that the host has not emerged from an undisclosed secure location since 2021.

Each weekly episode is uploaded via encrypted satellite uplink from what Signal Seven describes as "a fortified position with six months of canned goods and excellent Wi-Fi." Topics range from government cover-ups to cryptid economics to "why your smart toaster is definitely listening."

The show's success has attracted major advertisers, though Signal Seven only accepts payment in gold, Bitcoin, or shelf-stable emergency rations. "I'm not touching anything the Federal Reserve can track," the host explained in episode 247.

Authorities have made no apparent effort to locate the broadcaster, with one FBI spokesperson noting, "We have bigger problems than a guy yelling into a microphone about lizard people. Also, his show is genuinely entertaining."`,
    imagePrompt: 'Underground bunker recording studio, walls lined with canned food, professional podcast setup, conspiracy charts, cozy paranoid aesthetic, newsprint quality',
    tags: ['podcast', 'conspiracy', 'media'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Emergency ration company reports mysterious bulk orders to P.O. box',
      'Episode 250 features surprise guest: "definitely not a fed"'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-006',
    faction: 'truth',
    headline: 'COUNTY FAIR BLUE RIBBON PIE CONTAINS "ANOMALOUS READINGS"—JUDGES BAFFLED',
    subhead: 'Radiation detector goes off near dessert tent; baker unavailable for comment',
    byline: 'By Jennifer Cross, Rural Anomalies Beat',
    body: `Health inspectors equipped with routine safety equipment detected unusual radiation signatures emanating from Martha Hendricks' award-winning apple pie at the Calhoun County Fair, leading to an evacuation of the entire dessert pavilion.

"The readings were... inconsistent with known baking processes," explained county health director Dr. Susan Park. "We're talking about isotopes that shouldn't exist in a pie, or anywhere on Earth, really. But the judges said it tasted fantastic."

Hendricks, a 78-year-old retired librarian who has won the blue ribbon for seventeen consecutive years, could not be reached for comment. Neighbors report her farmhouse has been dark for three days, though her truck remains parked in the driveway.

The pie was seized by federal agents for "additional testing." The county fair board is considering whether to award Hendricks the ribbon posthumously, "just in case."`,
    imagePrompt: 'County fair dessert tent, radiation detector near pie display, confused judges in background, Americana setting, vintage newsprint aesthetic',
    tags: ['anomaly', 'investigation', 'rural'],
    statesMentioned: ['Iowa'],
    recurringCharacter: null,
    followUpHooks: [
      'Federal agents return pie tin, refuse to discuss condition of pie',
      'Seventeen previous blue ribbon pies exhumed for retroactive testing'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-007',
    faction: 'truth',
    headline: 'TOWN HALL SECURITY FOOTAGE SHOWS MAYOR DISCUSSING POLICY WITH "TRANSLUCENT CONSULTANT"',
    subhead: 'Late-night sessions include figure that "may or may not be corporeal," insider claims',
    byline: 'By Danny Ortega, Municipal Mysteries',
    body: `Leaked security camera recordings from the Millbrook Town Hall show Mayor Denise Crawford holding lengthy strategy meetings with an individual described by IT staff as "mostly transparent" and "possibly interdimensional."

The footage, recorded between 11 PM and 3 AM over six weeks, shows Crawford seated at her desk while a shimmering, vaguely humanoid form occupies the chair across from her. Audio is garbled, but lip-readers confirm the mayor is discussing zoning regulations, budget priorities, and "the Henderson development."

"I noticed her office lights on at weird hours," said custodian Phil Torres. "But when I checked, she'd be talking to thin air. Well, not thin air exactly—it had a kind of shimmer to it, like heat waves. Very polite, though. Left the coffee pot clean."

Mayor Crawford dismissed the footage as "a known camera malfunction" and added that she often "thinks out loud." She did not explain why the shimmer appears to respond to her questions.`,
    imagePrompt: 'Mayor at desk late at night, translucent ghostly figure in chair across from her, security camera angle, black and white, grainy newsprint',
    tags: ['paranormal', 'politics', 'witness'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Millbrook zoning approvals mysteriously efficient since "consultant" appeared',
      'Town hall coffee consumption up 45% during late-night sessions'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-008',
    faction: 'truth',
    headline: 'RETIRED SPY WRITES TELL-ALL MEMOIR—PUBLISHER REDACTS 600 OF 602 PAGES',
    subhead: 'Final version contains only: "It was Tuesday" and "The End"',
    byline: 'By Sarah Kim, Literary Surveillance',
    body: `Former intelligence operative Gerald Manning's anticipated memoir "Forty Years In The Shadows: What They Don't Want You To Know" has been released to the public after extensive government review—with nearly the entire manuscript blacked out by federal censors.

The 602-page hardcover, titled "An Authorized Account of Classified Operations (Redacted Edition)," opens with the sentence "It was Tuesday" on page one, followed by 600 blank pages with occasional paragraph-shaped blocks of solid black ink, before concluding on page 602 with "The End."

"We believe this captures the essence of Mr. Manning's service while protecting national security," explained a National Security Agency spokesperson. "Also, 'It was Tuesday' is an excellent opening line."

Manning, 73, expressed frustration but acknowledged he "signed several thousand non-disclosure agreements" during his career. The book has nonetheless become a bestseller, with readers praising the "compelling white space" and "thought-provoking redactions."`,
    imagePrompt: 'Book cover with heavily redacted pages spread open, solid black redaction bars, only two sentences visible, spy thriller aesthetic, newsprint',
    tags: ['espionage', 'media', 'censorship'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Bookstore employees report copies "glow faintly under UV light"',
      'Manning announces unredacted audiobook "available in secure locations only"'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-009',
    faction: 'truth',
    headline: 'NEIGHBORHOOD WATCH CAPTAIN TRACKS UFO SIGHTINGS WITH ELABORATE CHART SYSTEM',
    subhead: 'Resident claims pattern reveals "clearly intentional flight paths over cul-de-sacs"',
    byline: 'By Marcus Webb, Suburban Anomalies',
    body: `Millstone Heights resident and Neighborhood Watch Captain Brenda Chen has spent eighteen months documenting UFO activity over her subdivision, compiling data into a 47-foot-long wall chart that now occupies her entire garage.

The chart cross-references timestamps, weather conditions, traffic patterns, and household activities to establish what Chen describes as "undeniable correlations." According to her analysis, UFO appearances spike during homeowners association meetings and trash collection days.

"They're monitoring us," Chen explained, gesturing at color-coded pins and string connecting various data points. "Every time someone violates lawn height regulations, we get a flyover within 72 hours. That's not coincidence—that's surveillance."

Local astronomer Dr. Wei Park reviewed Chen's data and admitted it was "impressively organized" but noted that her sample size "could benefit from peer review." Chen has applied for a federal research grant. The application was denied, which she considers "further proof."`,
    imagePrompt: 'Garage wall covered in elaborate UFO tracking chart, pins and string connecting data points, suburban detective aesthetic, newsprint quality',
    tags: ['ufo', 'investigation', 'suburban'],
    statesMentioned: null,
    recurringCharacter: 'Brenda Chen',
    articleVariant: 'brenda_chen_stage_0',
    followUpHooks: [
      'Neighboring watch captains begin their own tracking systems',
      'Chen invited to speak at UFO convention, brings 12-foot chart segment'
    ]
  },
  {
    cardId: 'TRUTH-SPECIAL-010',
    faction: 'truth',
    headline: 'FOIA REQUEST REVEALS: GOVT SPENT $2.4M STUDYING "OPTIMUM CONSPIRACY THEORY LENGTH"',
    subhead: 'Research concludes most engaging theories require "12-17 interconnected claims"',
    byline: 'By Jennifer Cross, Federal Spending Watch',
    body: `A Freedom of Information Act filing has uncovered a Department of Behavioral Sciences study examining the ideal complexity level for conspiracy theories, apparently seeking to understand what makes certain narratives "maximally viral" versus "dismissible as noise."

The three-year, $2.4 million research project tested thousands of scenarios on focus groups, measuring engagement, credibility perception, and social sharing rates. The final report concludes that conspiracy theories perform best when they connect 12-17 disparate elements into a "plausible but unverifiable" framework.

"Too simple, and people lose interest," the report states. "Too complex, and cognitive load overwhelms the emotional hook. The sweet spot involves secret societies, three government agencies, one celebrity, and at least two seemingly unrelated historical events."

Asked why the government was researching conspiracy theory optimization, a spokesperson replied, "We wanted to understand the landscape." This non-answer was rated as "highly suspicious" by 73% of respondents in an informal follow-up survey.`,
    imagePrompt: 'Government research lab with whiteboards covered in conspiracy theory flowcharts, researchers analyzing engagement metrics, bureaucratic setting, newsprint',
    tags: ['research', 'government', 'conspiracy'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Study results immediately spawn 14-claim conspiracy about the study itself',
      'Department of Behavioral Sciences budget request triples for next year'
    ]
  },

  // Government Special Cards
  {
    cardId: 'GOV-SPECIAL-001',
    faction: 'government',
    headline: 'DEPUTY WALSH ISSUES "CALM CLARIFICATION" ON RECENT SIGHTING REPORTS',
    subhead: 'Official statement: "Routine weather balloon deployment, nothing to see"',
    byline: 'By Official Press Release',
    body: `Deputy Director of Public Information Catherine Walsh held a brief press conference Tuesday to address what she termed "minor public confusion" regarding unexplained lights reported over seven Midwestern states last weekend.

"Let me be perfectly clear," Walsh stated, reading from prepared remarks. "These were scheduled weather balloon launches conducted as part of routine atmospheric research. The unusual glow was due to standard LED tracking beacons. The fact that they moved in formation is... also routine. Very routine."

When asked why weather balloons required LED beacons visible from 40 miles away, Walsh replied that "visibility enhancement is crucial for aviation safety." She did not explain why the balloons were launched at 2 AM, or why radar showed them traveling at speeds exceeding 600 mph.

The Department of Atmospheric Affairs issued a supplementary statement confirming the balloons were "completely weather-related" and encouraging citizens to "resume normal activities with confidence."`,
    imagePrompt: 'Government official at podium reading statement, American flag in background, professional press conference setting, bureaucratic aesthetic, newsprint',
    tags: ['official', 'weather-balloon', 'deflection'],
    statesMentioned: ['Illinois', 'Iowa'],
    recurringCharacter: 'Deputy Walsh',
    articleVariant: 'walsh_stage_0',
    followUpHooks: [
      'Meteorology departments report no scheduled balloon launches that week',
      'LED manufacturer receives sudden large government contract'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-002',
    faction: 'government',
    headline: 'FEDERAL TASK FORCE ANNOUNCES "NOTHING UNUSUAL" DISCOVERED IN 6-MONTH INVESTIGATION',
    subhead: 'Report concludes: "All sightings can be attributed to known phenomena"',
    byline: 'By Official Press Release',
    body: `A multi-agency task force convened to examine hundreds of unexplained aerial and paranormal reports has concluded its investigation with a comprehensive finding of "absolutely nothing out of the ordinary."

The 847-page report, of which 843 pages are classified, attributes all investigated incidents to mundane explanations including Venus, marsh gas, mass hallucination, and "really weird birds."

"We take these reports seriously," explained task force coordinator Dr. Margaret Preston. "Which is why we conducted such a thorough analysis. And that analysis definitively shows that sometimes people just see things wrong."

The four unclassified pages of the report include helpful diagrams explaining how Venus can appear to move rapidly, how marsh gas can hover in formation, and how certain species of "really weird birds" can emit bright lights and disappear from radar.

Citizens are encouraged to submit future reports to a designated hotline, where they will be "carefully logged and filed."`,
    imagePrompt: 'Government officials presenting thick classified report with redacted cover, official press conference, American flags, bureaucratic formality, newsprint',
    tags: ['investigation', 'dismissal', 'report'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Task force members immediately reassigned to "unrelated departments"',
      'Report hotline receives 2,400 calls in first week, all "logged and filed"'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-003',
    faction: 'government',
    headline: 'EXPERT PANEL CONFIRMS: BLURRY PHOTO "DEFINITELY JUST A BEAR"',
    subhead: 'Analysis shows "clear ursine characteristics, case definitively closed"',
    byline: 'By Wildlife Bureau Communications',
    body: `A panel of government-appointed wildlife experts has conclusively determined that a viral photograph showing a large bipedal creature is "unequivocally a bear, specifically a North American black bear exhibiting normal bear behavior."

The panel's findings were released within four hours of the photo's initial posting—a timeline spokesperson Janet Reynolds described as "standard for routine bear identification."

"If you enhance the image and adjust for lighting and angle, the bear characteristics become obvious," Reynolds explained, presenting a heavily processed version of the photo that appears to show fur and claws. "The fact that the original image doesn't show these features is due to photographic limitations."

When pressed on why the creature in the photo appears to be carrying a briefcase, Reynolds clarified that "some bears have been known to interact with abandoned human objects" and that the briefcase was "probably empty."

The panel's report has been filed as "Case Closed: Routine Bear Activity, No Further Investigation Required."`,
    imagePrompt: 'Government panel presenting enhanced photo, pointing at supposed bear features, official presentation boards, bureaucratic press conference, newsprint',
    tags: ['bear', 'dismissal', 'debunking'],
    statesMentioned: ['Oregon'],
    recurringCharacter: null,
    followUpHooks: [
      'Original photographer reports visit from "friendly officials with suggestions"',
      'Wildlife Bureau budget request includes line item for "enhanced image processing"'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-004',
    faction: 'government',
    headline: 'STRESS STUDY EXPLAINS RECENT "MASS SIGHTING EVENT" AS COLLECTIVE FATIGUE',
    subhead: 'Psychologist: "People see things when tired; this is extremely normal"',
    byline: 'By Department of Public Health Communications',
    body: `A government-commissioned study has attributed last month's coordinated UFO sighting—reported by 3,400 witnesses across six states—to collective psychological fatigue resulting from "elevated stress and insufficient sleep patterns."

Dr. Raymond Foster, lead researcher and Department of Health consultant, explained that the witnesses simply experienced "synchronized perceptual anomalies" caused by modern life pressures.

"When you combine sleep debt, screen time, and ambient anxiety, the brain fills in gaps with false imagery," Dr. Foster noted. "In this case, 3,400 brains independently filled in the same gap with the same hovering metallic object. Statistically rare, but not impossible."

The study recommends that concerned citizens prioritize eight hours of sleep, reduce caffeine intake, and avoid staring at the sky for extended periods. It does not explain why military radar systems also detected the object, though Dr. Foster suggested that "radar operators are people too, and they get tired."`,
    imagePrompt: 'Psychologist presenting fatigue study charts, tired witness silhouettes in background, clinical setting, official government aesthetic, newsprint',
    tags: ['psychology', 'mass-sighting', 'debunking'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Sleep aid pharmaceutical company receives government research grant',
      'Radar operators union issues statement: "We were wide awake"'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-005',
    faction: 'government',
    headline: 'CLASSIFIED DOCUMENTS ACCIDENTALLY SHREDDED "IN ROUTINE DISPOSAL ERROR"',
    subhead: 'Officials stress: "Nothing important was in those 12,000 pages"',
    byline: 'By Federal Records Management Office',
    body: `The National Archive Office reported that approximately 12,000 pages of potentially relevant historical documents were inadvertently destroyed during what officials describe as a "clerical mix-up" involving industrial shredders.

"These things happen," explained Records Director Howard Klein. "Someone marked the wrong box for disposal. Very unfortunate. But fortunately, the documents were mostly redundant copies of already-public information."

When asked what information the documents contained, Klein stated he "couldn't recall specific details" as the destruction was "so routine" that proper inventory procedures were skipped. He added that the incident had "nothing to do" with last week's FOIA request seeking those exact documents.

The records office has implemented new labeling procedures to prevent future errors. The new system involves color-coded boxes, with red boxes marked "Definitely Don't Shred" and black boxes marked "Shred Immediately, Do Not Question Why."`,
    imagePrompt: 'Industrial paper shredder with government documents, bureaucrat looking concerned at shredded remnants, official office setting, newsprint aesthetic',
    tags: ['documents', 'destruction', 'cover-up'],
    statesMentioned: ['Washington DC'],
    recurringCharacter: null,
    followUpHooks: [
      'Shredding company reports "unusual volume" of after-hours government contracts',
      'FOIA request backlog mysteriously decreases by 40%'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-006',
    faction: 'government',
    headline: 'AUDIT REVEALS: BUREAU SPENT $890K ON "CONSENSUS MANAGEMENT SEMINARS"',
    subhead: 'Training focused on "unified messaging strategies during anomalous events"',
    byline: 'By Federal Spending Oversight Committee',
    body: `An internal audit of the Department of Unexplained Affairs has revealed that the agency allocated $890,000 for staff training seminars with titles like "Coordinated Response to Extraordinary Claims" and "Maintaining Narrative Consistency Under Scrutiny."

The seminars, conducted at remote conference centers, taught personnel how to "present unified, reassuring explanations regardless of contradictory evidence" and "redirect public attention toward conventional interpretations."

"It's standard crisis communication training," explained agency spokesperson Diana Park. "When something unusual happens, you want your entire team saying the same thing. Even if they saw different things. Especially if they saw different things."

Course materials obtained through FOIA include modules on "Confident Denial Techniques," "Weather Balloon Versatility," and "Advanced Venus Identification." The seminars were taught by retired intelligence officers and one "motivational speaker whose credentials are classified."`,
    imagePrompt: 'Conference room with government workers in consensus training, presenter showing slide about unified messaging, bureaucratic seminar setting, newsprint',
    tags: ['training', 'messaging', 'audit'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Seminar attendees demonstrate unusually synchronized interview responses',
      'Conference center reports "zero memory" of hosting these specific events'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-007',
    faction: 'government',
    headline: 'DEPARTMENT CONFIRMS: "ROUTINE ATMOSPHERIC SAMPLING" EXPLAINS UNUSUAL LIGHTS',
    subhead: 'Spokesperson: "We sample atmospheres regularly, this is what it looks like"',
    byline: 'By Environmental Monitoring Agency',
    body: `The Federal Environmental Monitoring Agency has confirmed that bright, fast-moving lights observed over rural Montana last week were part of "scheduled atmospheric sampling operations" and "completely normal scientific activity."

"We conduct these tests regularly," explained agency director Dr. Philip Morton. "The lights are from specialized sampling equipment launched into the upper atmosphere. The fact that they moved in geometric patterns and made 90-degree turns at high speed is... consistent with advanced sampling protocols."

When asked why atmospheric sampling requires equipment that triggers radar alerts and prompts fighter jet scrambles, Dr. Morton noted that "scientific rigor demands precision" and that the jets were launched "out of an abundance of caution, as a routine courtesy."

The agency declined to provide technical specifications for the sampling equipment, citing "proprietary research methodologies." A follow-up press release reminded citizens that "seeing science in action can be unfamiliar, but that's what progress looks like."`,
    imagePrompt: 'Government scientist in lab coat pointing at atmospheric chart, mysterious lights visible through window, official laboratory setting, newsprint',
    tags: ['science', 'atmospheric', 'explanation'],
    statesMentioned: ['Montana'],
    recurringCharacter: null,
    followUpHooks: [
      'Environmental agency budget suddenly includes line item for "aerial sampling fleet"',
      'Montana residents report three more "routine sampling events" within 48 hours'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-008',
    faction: 'government',
    headline: 'WITNESS CREDIBILITY QUESTIONED AFTER "MINOR INCONSISTENCIES" DISCOVERED',
    subhead: 'Officials note witness "got married twice, changed jobs, seems unreliable"',
    byline: 'By Bureau of Public Information',
    body: `Federal investigators have raised doubts about a key witness in last month's mass sighting case after uncovering "significant credibility issues" including two marriages, three career changes, and a 2003 speeding ticket.

"When someone's life story shows this much inconsistency, we have to question their observational reliability," explained investigator Mark Sullivan. "This individual has changed addresses four times, altered their hairstyle twice, and once returned a library book three days late. That's a pattern of unreliability."

The witness, former Air Traffic Controller Janet Rodriguez, maintains she and seventy-three other controllers observed an unexplained object on radar for forty minutes. But Sullivan notes that Rodriguez "clearly has a history of making life changes, which suggests impulsivity rather than careful judgment."

Additional character investigation revealed Rodriguez once dated someone her parents disapproved of and experimented with vegetarianism in college. "These facts paint a picture," Sullivan concluded. "A picture of someone who sees what they want to see, not what's actually there."`,
    imagePrompt: 'Government investigator presenting witness background check, charts showing "inconsistent life patterns," bureaucratic investigation room, newsprint',
    tags: ['character-assassination', 'witness', 'investigation'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Rodriguez co-witnesses report similar "credibility reviews" being conducted',
      'Bureau announces new witness screening protocols including lifestyle audits'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-009',
    faction: 'government',
    headline: 'AGENCY REASSURES: "SWAMP GAS CAN EXPLAIN NEARLY ALL REPORTED PHENOMENA"',
    subhead: 'Updated guidelines classify 87% of cases as "gas-related misidentifications"',
    byline: 'By Environmental Classification Bureau',
    body: `The Bureau of Environmental Classification has released updated field guidelines expanding the official definition of "swamp gas" to include phenomena previously categorized as unexplained, effectively resolving hundreds of open investigation files.

"Swamp gas is far more versatile than previously understood," explained Bureau Chief Dr. Lisa Manning. "Recent research shows it can hover, emit structured light patterns, move against wind currents, and even appear metallic under certain atmospheric conditions."

The new guidelines instruct field investigators to classify any unexplained sighting as "probable swamp gas phenomenon" unless conclusive evidence proves otherwise. The guidelines do not specify what would constitute conclusive evidence.

"Essentially, if we can't immediately identify it, and it occurred near any body of water—which includes oceans, lakes, rivers, ponds, puddles, or areas where it rained within the past month—it's swamp gas," Dr. Manning clarified. "This approach has reduced our unexplained case backlog by 87%."`,
    imagePrompt: 'Bureaucrat presenting swamp gas classification chart showing expanded definition, official diagrams of gas behavior, government office, newsprint',
    tags: ['swamp-gas', 'classification', 'bureaucracy'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Meteorologists express confusion over "metallic atmospheric gas theory"',
      'Bureau celebrates "record year" of case resolutions via new guidelines'
    ]
  },
  {
    cardId: 'GOV-SPECIAL-010',
    faction: 'government',
    headline: 'REPORT CONCLUDES: "PUBLIC PERFECTLY SATISFIED WITH CURRENT LEVEL OF TRANSPARENCY"',
    subhead: 'Survey finds: "No one wants more information, everything is fine"',
    byline: 'By Public Opinion Research Division',
    body: `A government-commissioned study measuring public attitudes toward official disclosure policies has determined that citizens are "overwhelmingly content" with existing information-sharing practices and "do not desire additional transparency."

The survey, conducted via phone calls to 800 randomly selected participants, found that 94% of respondents "expressed complete confidence in official explanations" and "felt no curiosity about classified materials."

"The data is clear," stated Research Director Dr. Harold Kim. "The public trusts institutions, accepts routine explanations at face value, and has zero interest in behind-the-scenes government activities. This is a reassuring validation of our current approach."

Independent polling organizations have requested access to the survey methodology, response data, and participant contact information. These requests were denied due to "privacy concerns." Dr. Kim noted that the denial itself "further demonstrates our commitment to protecting citizen confidentiality, which the public appreciates."`,
    imagePrompt: 'Government researcher presenting satisfaction survey results showing improbably high approval ratings, charts with suspiciously round numbers, newsprint',
    tags: ['survey', 'transparency', 'propaganda'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Independent pollsters unable to replicate results with any methodology',
      'Survey participants report "no memory" of being surveyed'
    ]
  },

  // Comeback Cards
  {
    cardId: 'comeback-truth-01',
    faction: 'truth',
    headline: 'UNDERDOG TRUTH MOVEMENT GAINS MOMENTUM—"WE\'RE JUST GETTING STARTED"',
    subhead: 'Grassroots activists report surge in public interest despite setbacks',
    byline: 'By Marcus Webb, Movement Watch',
    body: `Despite recent challenges, independent researchers and truth activists are reporting unprecedented growth in public engagement with alternative narratives.

"Every time they try to shut us down, ten more people wake up," explained organizer Kent Briggs. "The more they say 'nothing to see here,' the more people start looking. That's just human nature."

Community meetings that drew dozens last year are now filling high school auditoriums. Podcast audiences have tripled. And citizen journalism networks report record traffic.

"This isn't about winning or losing individual battles," Briggs continued. "It's about building a movement that can't be ignored. And we're past the point of no return."`,
    imagePrompt: 'Grassroots activists organizing materials, community meeting in background, determined faces, newsprint aesthetic',
    tags: ['movement', 'momentum', 'activism'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Community meetings coordinating nationwide "truth tour"',
      'Mainstream media begins covering movement "as legitimate phenomenon"'
    ]
  },
  {
    cardId: 'comeback-truth-02',
    faction: 'truth',
    headline: 'LEAKED DOCS PROVIDE "SECOND WIND" FOR STALLED INVESTIGATION',
    subhead: 'Anonymous source delivers evidence that "changes everything," researchers say',
    byline: 'By Jennifer Cross, Investigation Desk',
    body: `A mysterious package containing previously unknown documents has revitalized an investigation that had stalled due to lack of evidence, giving researchers "exactly the break we needed."

The materials, delivered to multiple independent journalists simultaneously, include memos, photographs, and technical specifications that corroborate several long-disputed claims.

"We were about to admit defeat," said investigative blogger Sarah Martinez. "Then this shows up—authenticated, cross-referenced, and completely game-changing. Someone on the inside wants the truth out there."

The source included a note reading: "Keep digging. You're closer than they want you to know."`,
    imagePrompt: 'Anonymous package being opened, classified documents visible, investigative researchers examining materials, dramatic lighting, newsprint',
    tags: ['leak', 'investigation', 'comeback'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'More leaks promised if first batch "handled responsibly"',
      'Government issues vague warning about "unauthorized document circulation"'
    ]
  },
  {
    cardId: 'comeback-gov-01',
    faction: 'government',
    headline: 'STRATEGIC NARRATIVE RECALIBRATION SUCCESSFULLY IMPLEMENTED',
    subhead: 'Department reports: "Public confidence metrics returning to acceptable levels"',
    byline: 'By Communications Strategy Office',
    body: `Following a challenging quarter of heightened public skepticism, the Department of Public Communications has successfully deployed its "Narrative Stabilization Protocol," resulting in measurable improvements in confidence polling.

"We identified the pain points and addressed them with targeted messaging," explained Communications Director Philip Hayes. "Sometimes you need to recalibrate your approach, acknowledge minor concerns, and pivot toward reassurance."

The protocol involved replacing phrase "No comment" with "We're looking into it," upgrading from "Nothing unusual" to "Routine unusual activity," and training spokespeople to maintain eye contact for 2.3 seconds longer than previous guidelines recommended.

Early results show a 23% increase in poll respondents describing official statements as "probably mostly true" rather than "definitely questionable."`,
    imagePrompt: 'Government communications team reviewing successful strategy charts, confidence metrics improving, bureaucratic victory celebration, newsprint',
    tags: ['strategy', 'messaging', 'recovery'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Protocol results prompt request for expanded budget',
      'Independent pollsters note timing coincidence with major ad campaign'
    ]
  },
  {
    cardId: 'comeback-gov-02',
    faction: 'government',
    headline: 'CRISIS MANAGEMENT TEAM DECLARES: "SITUATION RETURNING TO MANAGEABLE PARAMETERS"',
    subhead: 'Officials report: "Narrative drift successfully contained through coordinated action"',
    byline: 'By Inter-Agency Response Division',
    body: `A multi-department crisis management task force has announced that recent "anomalous public attention events" have been successfully redirected toward conventional explanations, restoring operational normalcy.

"We faced a challenging situation where multiple narratives were competing for public acceptance," explained Task Force Coordinator Dr. Margaret Chen. "Through coordinated messaging, strategic resource allocation, and timely expert deployment, we've returned to equilibrium."

The response involved synchronized press releases, expedited research paper publications supporting official positions, and what Chen described as "proactive engagement with influential content creators."

"The key is not to suppress alternative theories, but to ensure the conventional explanation is consistently louder, better funded, and coming from people in lab coats," Chen noted. "That's not manipulation—that's effective science communication."`,
    imagePrompt: 'Crisis management team reviewing successful containment strategies, charts showing narrative control metrics, official conference room, newsprint',
    tags: ['crisis', 'management', 'recovery'],
    statesMentioned: null,
    recurringCharacter: null,
    followUpHooks: [
      'Task force receives commendation for "exemplary narrative containment"',
      'Several "engaged content creators" receive government research grants within weeks'
    ]
  }
];
