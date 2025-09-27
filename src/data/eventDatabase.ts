export interface GameEvent {
  id: string;
  title: string;
  headline?: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random' | 'crisis' | 'opportunity' | 'capture';
  faction?: 'truth' | 'government' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects?: {
    truth?: number;
    ip?: number;
    cardDraw?: number;
    truthChange?: number;
    ipChange?: number;
    defenseChange?: number;
    stateEffects?: {
      stateId?: string;
      pressure?: number;
      defense?: number;
    };
    skipTurn?: boolean;
    doubleIncome?: boolean;
    revealSecretAgenda?: boolean;
  };
  conditions?: {
    minTurn?: number;
    maxTurn?: number;
    truthAbove?: number;
    truthBelow?: number;
    ipAbove?: number;
    ipBelow?: number;
    controlledStates?: number;
    requiresState?: string;
    capturedBy?: string;
  };
  weight: number;
  flavorText?: string;
  flavorTruth?: string;
  flavorGov?: string;
  /** Probability that this specific event occurred on the triggering turn (0-1). */
  triggerChance?: number;
  /** Probability of this event being chosen once an event triggers (0-1). */
  conditionalChance?: number;
}

export const EVENT_DATABASE: GameEvent[] = [
  // COMMON EVENTS (80 events) — Tabloid randoms for the newspaper (low impact, balanced)
  {
    id: 'ufo_selfie_over_capitol',
    title: 'UFO Selfie',
    headline: 'TOURIST: "Saucer Behind Me, Not a Filter"',
    content: 'Blurry night photo shows a glowing disc photobombing the Capitol dome. Officials: "Festive drone, probably."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 6, ip: -1 },
    weight: 6,
    flavorText: 'BREAKING: Local diners added "Cosmic Combo" to the breakfast menu within the hour. A souvenir shop sold out of alien plushies before noon. Meteorologists say the weather-balloon union is considering a strike after the PR disaster.'
  },
  {
    id: 'media_blackout_17min',
    title: 'Media Blackout',
    headline: 'ALL CHANNELS GO DARK FOR 17 MINUTES',
    content: 'Prime-time outage hits every major network at the exact same second. Cause labeled "cosmic hiccup."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: -4, ip: 2 },
    weight: 6,
    flavorText: 'UPDATE: Test patterns reportedly winked at viewers in three time zones. A spokesperson advised "unblinking consumption of official guidance." Independent stations now advertise candles as "ad-free light sources."'
  },
  {
    id: 'deepfile_dump_crochet_forum',
    title: 'Files on the Loose',
    headline: 'TOP SECRET PDFS UPLOADED TO CROCHET FORUM',
    content: 'Redacted docs (with cat gifs) surface overnight—including a spreadsheet literally titled "Secret Agenda - Do Not Share." Spokesperson: "That\'s... not our watermark."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 8, ip: -1, revealSecretAgenda: true },
    weight: 6,
    flavorText: 'BREAKING: Forum moderators created a new thread called "Chain Stitch, Chain of Custody." Downloads quadrupled after someone posted a granny-square pattern named "Annex B." The pinned comment now walks readers through the leaked agenda bullet points row by row.'
  },
  {
    id: 'algorithm_memeflood',
    title: 'Meme Flood',
    headline: 'FEEDS LOOP "WAKE UP, SHEEPLE!" FOR 9 HOURS',
    content: 'Cooking videos replaced by synchronized rant-livestreams. Platforms blame "overly spicy algorithm."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -6, ip: 2 },
    weight: 6,
    flavorText: 'BULLETIN: Executives apologized using a pre-recorded apology-gif that looped itself. Community notes flagged the apology as "oddly enthusiastic." Trend analysts recommend clearing cache and expectations.'
  },
  {
    id: 'masked_whistle_popcorn',
    title: 'Masked Whistle',
    headline: 'ANONYMOUS VOICE: "MICROWAVES ARE LISTENING"',
    content: 'A distorted tipster claims popcorn bags double as parabolic mics. Video scrubbed, mirror links multiply.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 7 },
    weight: 6,
    flavorText: 'BREAKING: Appliance stores sold out of "mute stickers" for kitchenware by lunchtime. A neighborhood potluck served silent popcorn as protest. Tech bloggers insist the real threat is "butter fingerprints on evidence."'
  },
  {
    id: 'press_conf_water_breaks',
    title: 'Official Statement',
    headline: 'SPOKESPERSON TAKES 23 SIPS IN 2 MINUTES',
    content: 'Assures public that "rumors lack rum." Viewers compile blink-per-second charts.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 3 },
    weight: 6,
    flavorText: 'LIVE DESK: Camera operators requested hazard pay for trying to keep focus. The podium\'s glass of water now has its own fan account. Captioning AI briefly subtitled "(sweats politely)."'
  },
  {
    id: 'backbone_maintenance_again',
    title: 'Internet Disruption',
    headline: '"ROUTINE MAINTENANCE" HITS SAME FORUMS AGAIN',
    content: 'Backbone hiccups knock out niche truth sites; shopping ads remain perfectly fine.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 1 },
    weight: 7,
    flavorText: 'SERVICE NOTE: Providers called it a "surgical outage." A stray memo called it "surgery without anesthesia." Influencers report stable upload speeds for unboxing videos only.'
  },
  {
    id: 'celebrity_posts_then_hacked',
    title: 'Celebrity Speaks Out',
    headline: 'A-LISTER POSTS THREAD, ACCOUNT "HACKED" 11 MIN LATER',
    content: 'Screenshots show a 47-part expose. Publicist blames "jet-lagged thumbs."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5, ip: 1 },
    weight: 6,
    flavorText: 'ENTERTAINMENT: Fans reconstructed the thread using emoji for redactions. A conspiracy podcast released a director\'s cut with commentary. The star\'s dog\'s account denied involvement, adorably.'
  },
  {
    id: 'peer_reviewed_ouch',
    title: 'Independent Study',
    headline: 'UNIVERSITY PAPER CONTRADICTS OFFICIAL NUMBERS',
    content: 'Lead author reassigned to "aquarium census." The footnotes are lethal.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 7 },
    weight: 6,
    flavorText: 'CAMPUS WATCH: Librarians rolled out extra step ladders for the flood of citations. The registrar added a course titled "Intro to Uncomfortable Graphs." Meanwhile, goldfish attendance soared.'
  },
  {
    id: 'mystery_budget_special_projects',
    title: 'Budget Bump',
    headline: '"SPECIAL PROJECTS" EATS WHOLE PAGE OF ZEROES',
    content: 'Committee waves through "science-ish things." Accountants discover a new shade of red ink.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 4, truth: -1 },
    weight: 6,
    flavorText: 'LEDGER EXTRA: The line item "snacks & silence" costs more than a small moon. A staffer whispered the password is "donut." Procurement immediately ordered a dozen—of both.'
  },
  {
    id: 'reporter_vanishes_near_nowhere',
    title: 'Reporter Vanishes',
    headline: 'AWARD-WINNER LAST SEEN NEAR PLACE "THAT ISN\'T THERE"',
    content: 'Car idling, trunk full of FOIA receipts. GPS pin: "¯\\_(ツ)_/¯".',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 8, ip: -1 },
    weight: 5,
    flavorText: 'NEWS ALERT: Their notebook contained a doodle labelled "Page 13." A local diner swears someone matching their description tipped in photocopies. The parking meter never started counting.'
  },
  {
    id: 'weather_pins_and_strings',
    title: 'Precision Storms',
    headline: 'STORMS TURN 90° LIKE THEY READ A RULER',
    content: 'Forecasts updated to "geometry with thunder." Kites now require permits.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'WEATHER DESK: Doppler radar briefly displayed a thumbs-up. A retired math teacher sold chalk to meteorologists behind the station. Umbrella makers issued a protractor-themed line.'
  },
  {
    id: 'platform_purge_day',
    title: 'Account Sweep',
    headline: 'TERMS OF SERVICE ENFORCED ALL AT ONCE',
    content: 'Thousands banned for "excessive curiosity." Appeals form features a single shrug emoji.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -5, ip: 2 },
    weight: 6,
    flavorText: 'PLATFORM NOTE: A new badge "Probably Fine" appeared and vanished in an hour. PR claims it was an A/B test; users claim it was an A/A denial. Moderators requested ergonomic gavel-mice.'
  },
  {
    id: 'market_salsa',
    title: 'Algo Salsa',
    headline: 'MARKETS DO THE CHA-CHA AT 3:33 A.M.',
    content: 'Indices move in prime numbers. One trader swears the chart winked.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { ip: 2, truth: 2 },
    weight: 7,
    flavorText: 'FINANCE LIVE: Candlesticks were rebranded "candle-shticks." A bell rang itself, then apologized. Economists recommend diversifying into snacks and naps.'
  },
  {
    id: 'exercises_everywhere',
    title: 'Surprise Drills',
    headline: 'UNANNOUNCED EXERCISES TRACE CROP-CIRCLE ROUTES',
    content: 'Convoys drive in pleasing spirals. Traffic cones promoted to captain.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 6,
    flavorText: 'CIVIC ALERT: Residents asked to ignore synchronized marching and cheerful megaphones. A flyer promised "readiness, regardless of what." The mayor saluted an empty field, confidently.'
  },
  {
    id: 'anonymous_brown_envelope',
    title: 'Brown Envelope',
    headline: 'UNMARKED PACKAGE: "OPEN AFTER MIDNIGHT"',
    content: 'Inside: scans, dates, initials, and a doodle of a lizard in a tie.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 9, ip: -1 },
    weight: 5,
    flavorText: 'CITY DESK: The courier declined a tip and hummed the X-Files theme off-key. Forensics found toner, coffee, and something that smelled like civic duty. A second envelope appeared labeled "For the sequel."'
  },
  {
    id: 'critical_infrastructure_glitch',
    title: 'System Glitch',
    headline: 'GRIDS, TRAINS, PAGERS ALL SAY "404"',
    content: 'Diagnostic screen reads: "Have you tried not asking questions?"',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 1 },
    weight: 7,
    flavorText: 'SYSTEMS: Backup generators ran on vibes and one AA battery. A pager displayed the word "Ssshhh." IT required both a reboot and a quiet moment.'
  },
  {
    id: 'crowd_with_homemade_signs',
    title: 'Mass Rally',
    headline: 'CITY SQUARE FILLS WITH POLITE MEGAPHONES',
    content: 'Chants include citations. Someone brought spreadsheets.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 6,
    flavorText: 'STREET EXTRA: Organizers offered footnotes at the merch table. A toddler corrected a chant\'s grammar; applause followed. Police reported "orderly indignation with excellent penmanship."'
  },
  {
    id: 'cover_story_falls_apart',
    title: 'Narrative Fracture',
    headline: 'OFFICIAL TIMELINE HAS TUESDAY TWICE',
    content: 'Side-by-side clips disagree about what a door is.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 10 },
    weight: 5,
    flavorText: 'MEDIA LAB: Fact-checkers requested neck braces for whiplash. A ministerial calendar simply skipped to Friday with a sigh. The door later released a statement: "I was always a window."'
  },
  {
    id: 'more_cameras_more_comfort',
    title: 'Eyes Everywhere',
    headline: 'NEW CAMERAS INSTALLED "FOR COMMUNITY HUGS"',
    content: 'Boxes labeled "not surveillance" mounted on every lamppost.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -7, ip: 2 },
    weight: 6,
    flavorText: 'NOTICE: The lens caps arrived with smiley stickers. A brochure promised "optical support in challenging times." A bird nested in one unit and refused to be interviewed.'
  },
  {
    id: 'bigfoot_livestream',
    title: 'Bigfoot Live',
    headline: 'SASQUATCH STARTS COOKING CHANNEL, HATES RING LIGHTS',
    content: 'Signature dish: moss au jus. Comments: "hair routine pls."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'STREAMING: Chat mods banned the word "Yeti?" after 400 repeats. An off-camera howl triggered 10k likes. The recipe card was written in suspiciously large cursive.'
  },
  {
    id: 'denver_airport_art_moves',
    title: 'Moving Mural',
    headline: 'DENVER AIRPORT ART BLINKS FIRST',
    content: 'Night-vision footage shows murals changing outfits hourly.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'TERMINAL WATCH: A gate agent insisted the painting "asked for a window seat." Tourists queued for selfies with the blinking horse. Security confiscated three paintbrushes "on general principle."'
  },
  {
    id: 'haarp_open_house',
    title: 'HAARP Open House',
    headline: 'SKY STATION HOLDS "BRING YOUR OWN ANTENNA" DAY',
    content: 'Visitors offered complimentary earplugs and plausible deniability.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 2 },
    weight: 7,
    flavorText: 'CLOUD REPORT: The sky formed a thumbs-up, then a question mark. Staff called it "atmospheric jazz." The gift shop sold limited-edition lightning in a bottle (empty).'
  },
  {
    id: 'men_in_beige',
    title: 'Men in Beige',
    headline: 'LOW-BUDGET MIB SIGHTED IN DISCOUNT SLACKS',
    content: 'They hand out business cards that simply say "NO."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'FIELD NOTE: Their sedan played elevator music at weaponized volume. Witnesses described the beige as "emotionally neutral." Tailors refuse to discuss bulk orders of khaki.'
  },
  {
    id: 'crop_circle_qr',
    title: 'QR Circles',
    headline: 'CROP CIRCLES NOW LINK TO CUSTOMER SURVEY',
    content: '"How satisfied are you with abduction experience?"',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'AGRI EXTRA: The farmer offered loyalty points redeemable for corn. An agronomist rated the design "90% symmetry, 10% sass." The QR also opened a playlist named "Probed & Vibed."'
  },
  {
    id: 'lake_monster_selfie',
    title: 'Lake Monster Selfie',
    headline: 'TOURIST CAPTURES DUCK-FACE… AND SOMETHING HUGE',
    content: 'Creature appears to wink. Ranger issues selfie-stick permit.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 5, ip: -1 },
    weight: 7,
    flavorText: 'WATERFRONT: Bait shops introduced "ethical chum." The lifeguard chair now includes binoculars and a cross-stitch of "I believe." Souvenir towels read "I got splashed by truth."'
  },
  {
    id: 'paperwork_tsunami',
    title: 'Paperwork Tsunami',
    headline: 'FORMS BREED IN STORAGE CLOSET, DEMAND STAPLES',
    content: 'Clerks report "hissing" from aisle G.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 3, truth: -1 },
    weight: 7,
    flavorText: 'CIVIL SERVICE: A new requisition form now requires a permission form to request the form. The label maker ran out of the letter "N" from printing "No." An intern earned a medal for defeating a jam.'
  },
  {
    id: 'foil_hat_fashion_week',
    title: 'Foil Week',
    headline: 'TIN HAT COUTURE STORMS RUNWAY',
    content: 'Designers unveil signal-chic with detachable ear flaps.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'STYLE: Models refused to reveal who they weren\'t listening to. Streetwear launched "orbital shimmer" jackets. Boutique mirrors came with a "no reflections were harmed" disclaimer.'
  },
  {
    id: 'ghost_in_the_wifi',
    title: 'Ghost Wi-Fi',
    headline: 'ROUTERS WHISPER PASSWORDS FROM BEYOND',
    content: 'IT says the phantom SSID is "Ectonet_5G."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3 },
    weight: 7,
    flavorText: 'TECH: Firmware notes included garlic and Latin. The helpdesk advised "try turning your house around and back on." Paranormal investigators brought EMF meters and snacks.'
  },
  {
    id: 'black_helicopter_bogo',
    title: 'Chopper BOGO',
    headline: 'BLACK HELICOPTERS OFFER TWO-FOR-ONE NIGHT FLIGHTS',
    content: 'Coupons valid after curfew. Pilots wear aviators at midnight.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 2, truth: -2 },
    weight: 7,
    flavorText: 'AVIATION: Noise complaints routed to a P.O. box in the sky. A brochure promised "hovering reassurance." The coupon\'s fine print was printed in invisibility ink.'
  },
  {
    id: 'elvis_at_3am_diner',
    title: 'Elvis at Diner',
    headline: 'THE KING ORDERS PANCAKES, PAYS IN SUSPICIONS',
    content: 'Security cam redacted with rhinestones.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'LATE EDITION: The jukebox queued "Return to Sender (Classified)." A blue suede shoeprint led nowhere in particular. The cook swore the syrup said "thank you very much."'
  },
  {
    id: 'time_cube_intern',
    title: 'Time Intern',
    headline: 'NEW HIRE SCHEDULES YESTERDAY TWICE',
    content: 'Office enjoys two Fridays; calendar develops stage fright.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 1 },
    weight: 7,
    flavorText: 'WORKPLACE: HR approved overtime both retroactively and preemptively. Coffee machines dispensed espresso and deja vu. Everyone forgot to go home right on time, again.'
  },
  {
    id: 'denial_generator',
    title: 'Denial Generator',
    headline: 'DEVICE OUTPUTS "NO COMMENT" IN 48 LANGUAGES',
    content: 'Press room installs it as white noise.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 3, truth: -1 },
    weight: 7,
    flavorText: 'MEDIA: Reporters brought universal translators and granola bars. The machine accepted follow-ups only in interpretive dance. It beeped twice when asked about the beep.'
  },
  {
    id: 'mothman_hi_vis',
    title: 'Hi-Vis Mothman',
    headline: 'WINGED GUARDIAN HANDS OUT SAFETY VESTS',
    content: 'Construction sites experience "forewarnings with flair."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'FIELD: The reflective tape spelled "duck." Hard hats sprouted tasteful antennae. The foreman said productivity soared, mostly from brisk, cautious walking.'
  },
  {
    id: 'secret_tunnels_airport',
    title: 'Baggage Tunnels',
    headline: 'AIRPORT MAP LABELS A HALLWAY "NOPE"',
    content: 'Custodians insist they mop around a humming rectangle.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'TRAVEL: Gate agents practice saying "It\'s just wind" with confidence. A suitcase returned with a sticker: "I visited Elsewhere and all I got was this tag." TSA confiscated a map that folded itself.'
  },
  {
    id: 'truth_hotline_busy',
    title: 'Truth Hotline',
    headline: 'TIP LINE PERMANENTLY "ON HOLD" WITH JAZZ',
    content: 'Callers memorize trumpet solos; one solves a crime in 7/8 time.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 7,
    flavorText: 'SWITCHBOARD: The hold music received a grant for community engagement. Agents refused to comment between choruses. A caller requested sheet music instead of answers.'
  },
  {
    id: 'polaroid_from_tomorrow',
    title: 'Tomorrow Polaroid',
    headline: 'PHOTO DEVELOPS BEFORE IT IS TAKEN',
    content: 'Caption reads "Don\'t forget the umbrella." Forecast: sunshine.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 6,
    flavorText: 'PHOTO DESK: The camera apologized in cursive. The weather changed its mind with a polite drizzle. A gallery opened a "Previews of the Past" exhibition to confused applause.'
  },
  {
    id: 'county_fair_abduction_booth',
    title: 'Abduction Booth',
    headline: 'MIDWAY GAME OFFERS "RIDE IN BEAM" FOR 5 TICKETS',
    content: 'Winners return with fabulous hair and vague wisdom.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 5, ip: -1 },
    weight: 7,
    flavorText: 'FAIR: Cotton candy rebranded as "anti-gravity floss." The Ferris wheel rotated toward Orion once, tastefully. A carnie swore the plush prizes blinked independently.'
  },
  {
    id: 'press_badge_everyone',
    title: 'Everyone Press',
    headline: 'CITY HANDS OUT PRESS BADGES LIKE STICKERS',
    content: 'Interviews ensue. Microphones multiply.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5, ip: -1 },
    weight: 7,
    flavorText: 'CIVICS: The mayor held a press conference about holding press conferences. Kids asked the best questions. A headline read "Public Holds Itself Accountable."'
  },
  {
    id: 'quiet_hours_extended',
    title: 'Extended Quiet',
    headline: 'CURFEW RENAMED "COZY HOURS," ADDS EXTRA HOUR',
    content: 'Citizens urged to "whisper indoors about nothing."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 2 },
    weight: 7,
    flavorText: 'PUBLIC NOTICE: Flyers printed in soft fonts recommended "restful compliance." Streetlamps dimmed to a cooperative blush. The city soundtrack was replaced by a shush.'
  },
  {
    id: 'library_shelf_moves',
    title: 'Moving Shelves',
    headline: 'ARCHIVE STACKS REARRANGE THEMSELVES AT NIGHT',
    content: 'Files about files move to a room labeled "Deeper Quiet."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'ARCHIVES: The Dewey Decimal System added a code for "don\'t." A librarian stamped a ghost card with today\'s date and shrugged. The index hissed when opened to "H."'
  },
  {
    id: 'truthers_get_citation_style',
    title: 'Citation Chic',
    headline: 'TRUTHERS MIX MLA & AP IN SAME SENTENCE',
    content: 'Style guides unite against a common footnote.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'STYLE DESK: A zine taught Chicago style to whiteboards. Red string now comes with endnotes. A professor declared, "At last, rebellion with references."'
  },
  {
    id: 'usb_cable_that_listens',
    title: 'Listening Cable',
    headline: 'CHARGER CLAIMS IT\'S JUST CHARGING, THEN WINKS',
    content: 'Port emits faint dial tone. Device feels judged.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 7,
    flavorText: 'GADGET: Privacy cases launched with tiny earmuffs. Retailers offered "air-gapped hugs." A teardown found a microphone labeled "Shhh."'
  },
  {
    id: 'county_map_redrawn_overnight',
    title: 'New Lines',
    headline: 'COUNTY BORDERS SNEAK THREE FEET EAST',
    content: 'Signs replaced at dawn by polite ninjas.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 1 },
    weight: 7,
    flavorText: 'CARTOGRAPHY: Compasses spun, then pretended they didn\'t. Surveyors demanded hazard pay in pushpins. Residents reported feeling slightly more easterly.'
  },
  {
    id: 'press_club_strobe',
    title: 'Press Strobe',
    headline: 'NEWSROOM LIGHTS FLASH MORSE FOR "ASK BETTER"',
    content: 'Reporters accuse ceiling of editorializing.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'NEWSROOM: The coffee machine printed quotes on the foam. An ombudsman taped a mirror to the podium labeled "You." The ceiling blinked again, smugly.'
  },
  {
    id: 'gov_hotline_winner',
    title: 'Caller Nine Wins',
    headline: 'GOV HOTLINE OFFERS PRIZES FOR SHORT QUESTIONS',
    content: 'Grand prize: expedited denial.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 2, truth: -2 },
    weight: 7,
    flavorText: 'HOTLINE: Operators announced a new tier—"Hold Plus." Callers could upgrade to "Be Right Back." The confetti cannon fired paperwork.'
  },
  {
    id: 'mall_santa_is_mib',
    title: 'Mall Santa MIB',
    headline: 'DEPARTMENT STORE SANTA NEVER BLINKS',
    content: 'Gift wish list redacted with candy-cane ink.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'HOLIDAY: The reindeer emitted encrypted jingles. Elves wore sunglasses indoors. A child asked for transparency and was offered wrapping paper.'
  },
  {
    id: 'cat_reads_foia',
    title: 'FOIA Cat',
    headline: 'LIBRARY CAT CURLS UP ON JUST THE RIGHT BOX',
    content: 'Archivist calls it "intuitive indexing."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'LOCAL: Treat budget doubled after a successful purr-review. The cat batted a binder to "accidentally open" page 13. A staffer meowed "open access" with conviction.'
  },
  {
    id: 'sudden_weather_balloon_week',
    title: 'Balloon Week',
    headline: 'WEATHER BALLOONS RECEIVE THEIR OWN PARADE',
    content: 'Officials applaud. Sky looks smug.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 7,
    flavorText: 'PARADE: Confetti was recycled from last year\'s denial. The grand marshal was "nobody in particular." Spectators reported a light static charge and a sense of closure.'
  },
  {
    id: 'faraday_fashion',
    title: 'Faraday Fashion',
    headline: 'RUNWAY SHOW FEATURES POCKETS THAT HISS',
    content: 'Phones go quiet. Heads go loud.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'STYLE: Designers claimed "signal-agnostic silhouettes." Attendees described the afterparty as "peacefully unpinged." A model said their thoughts sounded taller.'
  },
  {
    id: 'parking_meter_time_tickets',
    title: 'Time Meter',
    headline: 'PARKING METERS ISSUE TICKETS FOR TOMORROW',
    content: 'Appeals office asks you to come yesterday.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: 1 },
    weight: 7,
    flavorText: 'CITY HALL: A new coin called a "chronon" launched and folded. The app offered "Undo" for a small fee. The tow truck swore it returned your car before it left.'
  },
  {
    id: 'distraction_con',
    title: 'DistractionCon',
    headline: 'THREE-DAY EXPO ON "LOOK OVER THERE"',
    content: 'Keynote delivered while juggling fireworks.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 2, truth: -2 },
    weight: 7,
    flavorText: 'EVENTS: Swag bags contained shiny objects and a waiver. Panels overlapped with themselves. The closing ceremony ended before it began, spectacularly.'
  },
  {
    id: 'red_string_shortage',
    title: 'String Shortage',
    headline: 'NATION RUNS LOW ON RED STRING',
    content: 'Bulletin boards resort to spaghetti.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'DIY: Hardware stores rationed pushpins at two per person. A grandma crocheted a beautiful conspiracy doily. A mural depicted arrows pointing at each other, meaningfully.'
  },
  {
    id: 'copy_paper_page3_missing',
    title: 'Paper Vanish',
    headline: 'PRINTER SHOWS "MISSING PAGE 3 OF 3" FOREVER',
    content: 'Only page 2 prints. It giggles.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3 },
    weight: 7,
    flavorText: 'IT: The new driver required a reboot and a confession. Page 3 was later found hiding behind a watermark. The toner pleaded the fifth.'
  },
  {
    id: 'truth_or_dare_townhall',
    title: 'Truth or Dare',
    headline: 'TOWN HALL GAME NIGHT GETS REAL',
    content: 'Officials pick "dare," public picks "truth."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6, ip: -1 },
    weight: 7,
    flavorText: 'CIVICS: The winning move was "show us the budget." Refreshments included humble pie. The microphone developed an honesty setting.'
  },
  {
    id: 'smiley_drones',
    title: 'Smiley Drones',
    headline: 'NEW DRONES PAINTED WITH FRIENDLY FACES',
    content: 'They wave with gimbals. Kids wave back.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 2, truth: -2 },
    weight: 7,
    flavorText: 'AIRSPACE: The manual recommends "reassuring hum at modest altitude." A balloon popped in protest, bravely. Street artists gave the drones eyebrows, for nuance.'
  },
  {
    id: 'museum_labels_wink',
    title: 'Museum Wink',
    headline: 'EXHIBIT LABELS REWRITE THEMSELVES AFTER HOURS',
    content: 'Plaques now include "allegedly."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3 },
    weight: 7,
    flavorText: 'CULTURE: Security footage shows a bust rolling its eyes. The gift shop sold limited-edition "I saw nothing" postcards. A docent sighed, "History is a moving target."'
  },
  {
    id: 'am_radio_snow_whispers',
    title: 'Snow Talk',
    headline: 'STATIC ON AM RADIO WHISPERS NAMES',
    content: 'Callers claim it correctly spelled "Brian with a Y."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'COMMUTE: Traffic slowed as drivers tried to write down the forecast. The station apologized to the alphabet. A DJ said the snow had excellent diction.'
  },
  {
    id: 'press_release_madlibs',
    title: 'Mad Libs PR',
    headline: 'PRESS RELEASES USE BRACKETS LIKE [ADJECTIVE]',
    content: 'Someone forgot to fill the template; everyone pretends it\'s art.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 1 },
    weight: 7,
    flavorText: 'LANGUAGE: The update now [adverb] denies [noun] with [emotion]. A curator offered to frame the mistake. The correction misspelled "correction."'
  },
  {
    id: 'open_data_treasure_x',
    title: 'Open Data Map',
    headline: 'CITY API ACCIDENTALLY PLOTS A BIG RED X',
    content: 'Developers swear it\'s caching; kids bring shovels.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'CIVTECH: The GIS layer labeled "Oops." A park bench now has a plaque that says "Close Enough." A buried lunchbox contained blueprints for better playgrounds.'
  },
  {
    id: 'night_court_abductions',
    title: 'Night Docket',
    headline: 'COURT HEARS THREE ABDUCTION CASES BEFORE DAWN',
    content: 'All defendants plead "beamed."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'LEGAL: The gavel echoed like a Theremin. A bailiff offered out-of-this-world snacks. The transcript included the word "whoosh" in brackets.'
  },
  {
    id: 'citywide_deja_vu',
    title: 'Déjà Vu',
    headline: 'WHOLE TOWN SWEARS THEY SAID THIS ALREADY',
    content: 'Calendar suspects foul play.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 1 },
    weight: 7,
    flavorText: 'TIMELINE: Residents greeted each other with "nice to re-meet." Shops advertised "sale again, again." The weatherman predicted yesterday with confidence.'
  },
  {
    id: 'press_pool_windowless_aquarium',
    title: 'Pool Day',
    headline: 'PRESS POOL TAKEN TO WINDOWLESS AQUARIUM',
    content: 'Fish stare back judgmentally.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 2, truth: -2 },
    weight: 7,
    flavorText: 'MARITIME: Dolphins refused comment but smiled knowingly. The gift shop sold water with an NDA. Reporters claimed the exit door swam away.'
  },
  {
    id: 'future_timestamp_tip',
    title: 'Future Tip',
    headline: 'EMAIL TIMESTAMPED NEXT THURSDAY NAMES NAMES',
    content: 'Spam filter lists it as "prophetic marketing."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 7 },
    weight: 6,
    flavorText: 'INBOX: The sender field read "Tomorrow, Probably." The attachment was a to-do list with today already crossed out. IT cleared its throat and bought a lottery ticket.'
  },
  {
    id: 'night_vision_squirrels',
    title: 'Ops Squirrels',
    headline: 'LOCAL SQUIRRELS WEAR TINY NIGHT-VISION GOGGLES',
    content: 'Nuts buried with military precision.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'WILDLIFE: Officials called it "urban ecology outreach." Park benches were wiretapped by acorns. A jogger reported being debriefed in chitters.'
  },
  {
    id: 'tour_bus_to_nowhere',
    title: 'Mystery Tour',
    headline: 'SIGHTSEEING BUS TAKES EVERY EXIT TO "CLASSIFIED"',
    content: 'Guidebook consists of polite apologies and arrows.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: -1 },
    weight: 7,
    flavorText: 'TRAVEL: The driver swore the map moved first. Passengers rated the journey "enigmatic but punctual." A postcard arrived before the bus departed.'
  },
  {
    id: 'town_sign_blur',
    title: 'Welcome Sign Blur',
    headline: 'CITY LIMITS SIGN BLURS WHEN PHOTOGRAPHED',
    content: 'Tourists blame autofocus; locals blame "policy."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3 },
    weight: 7,
    flavorText: 'CIVIC BRANDING: The font is officially "Sans Accountability." Souvenir shirts read "I visited ???." The highway shrugged in both directions.'
  },
  {
    id: 'truth_cafe_receipts',
    title: 'Receipt Revelations',
    headline: 'COFFEE RECEIPTS INCLUDE FOOTNOTES & SOURCES',
    content: 'Baristas cite claims about crema and corruption.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5, ip: -1 },
    weight: 7,
    flavorText: 'LATTÉ PRESS: Milk foamed into the shape of a pie chart. The tip jar read "for sources." Customers left caffeinated and cited.'
  },
  {
    id: 'park_statue_moves_a_bit',
    title: 'Statue Shuffle',
    headline: 'MONUMENT FACES SLIGHTLY DIFFERENT DIRECTION',
    content: 'City denies rotation; pigeons confirm.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'ART WATCH: The plinth\'s shadow suggested a conspiracy at noon. Tourists insisted yesterday\'s selfies disagree. A plaque was updated to "probably always looked this way."'
  },
  {
    id: 'press_ids_expire_yesterday',
    title: 'Expired Press',
    headline: 'ALL PRESS PASSES EXPIRE "YESTERDAY, 5PM SHARP"',
    content: 'Renewal office closed for "rolling lunch."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 7,
    flavorText: 'ADMIN: The new form requires two witnesses and one alibi. The queue looped through a broom closet. A stamp read "Denied, but in cursive."'
  },
  {
    id: 'radio_scanner_hears_future',
    title: 'Scanner Tomorrow',
    headline: 'POLICE SCANNER PICKS UP NEXT WEEK\'S CHATTER',
    content: 'Officers request calendar updates in real time.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'DISPATCH: A call reported a missing item that hadn\'t vanished yet. Traffic cones were deployed in advance. The log printed itself, smugly.'
  },
  {
    id: 'city_budget_in_invisible_ink',
    title: 'Invisible Budget',
    headline: 'FINANCE DOCS LEGIBLE ONLY UNDER BLACKLIGHT',
    content: 'Council meetings now BYO-disco.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 1 },
    weight: 7,
    flavorText: 'AUDIT: The line for "misc" glowed brightest. Accountants requested sunglasses and forgiveness. The mayor called the vibe "fiscally luminescent."'
  },
  {
    id: 'lost_and_found_time',
    title: 'Lost & Found Time',
    headline: 'CITY LOST & FOUND ADDS "WEDNESDAY AFTERNOON"',
    content: 'Claims require proof you were there and weren\'t.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: 1 },
    weight: 7,
    flavorText: 'CIVIC SERVICES: Items include umbrellas, a sock, and an unplayed voicemail. A clerk stamped a minute and handed it back. The clock chimed appreciatively.'
  },
  {
    id: 'truth_zine_explodes',
    title: 'Zine Boom',
    headline: 'STAPLED TRUTH MAGAZINES OUTSELL GLOSSIES',
    content: 'Photocopiers heat to "revelation."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'PRINT: A corner store became a newsroom overnight. Red string bundles came free with staples. The horoscope predicted "sources align."'
  },
  {
    id: 'gov_sticker_everything_ok',
    title: 'Everything\'s Fine',
    headline: 'NEW "ALL GOOD!" STICKERS APPEAR ON PROBLEMS',
    content: 'Potholes and questions receive equal decals.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'PUBLIC WORKS: Workers were seen smoothing concerns with clipboards. A cone wore a smiley sticker, convincingly. The road agreed to disagree.'
  },
  {
    id: 'mysterious_hum_citywide',
    title: 'The Hum',
    headline: 'CITYWIDE HUM AT A COMFORTABLE 432HZ',
    content: 'Citizens report "pleasant unease."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3 },
    weight: 7,
    flavorText: 'ACOUSTICS: Musicians tuned to suspicion. The power grid blushed. A wellness studio sold "grounding earplugs" that smelled like rosemary.'
  },
  {
    id: 'truth_map_scales_tilt',
    title: 'Scales Tip',
    headline: 'MAP LEGEND NOW INCLUDES "LIKELY TRUE-ISH"',
    content: 'Cartographers add an eyebrow icon.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'ATLAS: A new projection maximizes room for footnotes. Compasses added "hmm." Tour guides adopted disclaimers as walking sticks.'
  },
  {
    id: 'gov_press_kit_blank',
    title: 'Blank Kit',
    headline: 'PRESS KITS SHIP WITH ONLY A MIRROR',
    content: 'Label: "Reflect on your questions."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 7,
    flavorText: 'PR: The mirror fogged up to spell "No." The USB contained a white noise MP3 and a stock photo of a shrug. The tote bag was high quality, unfortunately.'
  },
  {
    id: 'satellite_flare_winks',
    title: 'Winking Satellite',
    headline: 'ORBITER FLASHES MORSE FOR "HI"',
    content: 'Astronomers blame ice; kids wave anyway.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'SKY: Backyard telescopes sold out alongside hot cocoa. One amateur radio picked up a cheerful beep. The clouds politely parted, briefly.'
  },
  {
    id: 'truth_busker_factchecks',
    title: 'Busker Facts',
    headline: 'STREET MUSICIAN FACT-CHECKS BETWEEN SONGS',
    content: 'Tips include citations on napkins.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'SIDEWALK: The hat filled with coins and sources. A duet with a passing historian drew a crowd. The encore was a bibliography.'
  },
  {
    id: 'gov_guideline_on_tones',
    title: 'Guided Tone',
    headline: 'NEW GUIDELINE: "SPEAK IN REASSURING LOWERCASE"',
    content: 'Capital letters reserved for "authorized excitement."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'STYLE SHEET: A leaked memo banned italics "unless soothing." The exclamation mark union filed a grievance. Periods were told to soften their edges.'
  },
  {
    id: 'neighbors_hear_typewriters',
    title: 'Clackety Truth',
    headline: 'NEIGHBORS REPORT TYPEWRITER SOUNDS AT MIDNIGHT',
    content: 'No one owns a typewriter. The drafts are good.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'NIGHT DESK: Pages slid under doors with gentle authority. The margins smelled like coffee and old bravery. Editors awoke with ink on their hands.'
  },
  {
    id: 'truth_class_in_bar',
    title: 'Pub Seminar',
    headline: 'LOCAL BAR HOSTS "TRUTH 101 (LOUD)"',
    content: 'Syllabi printed on coasters.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'EDU: A chalkboard listed sources and specials. The pop quiz involved darts and footnotes. A skeptic left a believer in citations.'
  },
  {
    id: 'gov_civic_quiz_app',
    title: 'Civic Quiz',
    headline: 'OFFICIAL APP GRADES YOUR QUESTIONS',
    content: 'Score too high? Try easier questions.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 1 },
    weight: 7,
    flavorText: 'APP STORE: Reviews praised the UI and punished the answers. The premium tier unlocked "hints" that said "no." A patch notes entry merely sighed.'
  },
  {
    id: 'drone_light_show_spells_nah',
    title: 'Drone Nah',
    headline: 'LIGHT SHOW SPELLS "NAH" OVER CITY HALL',
    content: 'Organizer blames font selection.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 2, truth: -2 },
    weight: 7,
    flavorText: 'SPECTACLE: The crowd cheered, then wondered why. A second wave spelled "K." The press release insisted it meant "Knowledge."'
  },
  {
    id: 'truth_scavenger_hunt',
    title: 'Clue Hunt',
    headline: 'CITYWIDE SCAVENGER HUNT HIDES DOCUMENTS',
    content: 'Winning team found receipts under a bench.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'URBAN PLAY: Clues included tasteful puns and grid coordinates. The prize was a file folder and a community hug. Someone framed the map and called it art.'
  },
  {
    id: 'random_tan_briefcase',
    title: 'Tan Briefcase',
    headline: 'BRIEFCASE APPEARS, HUMS, CHANGES OWNER THRICE',
    content: 'Each owner denies opening it.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: 1 },
    weight: 7,
    flavorText: 'CURB: The handle felt like a handshake. A sticker read "Property of Nobody." The final carrier walked into a revolving door and did not reappear.'
  },
  {
    id: 'gov_signage_everything_normal',
    title: 'All Normal',
    headline: 'NEW SIGNS: "EVERYTHING NORMAL (THIS WAY)"',
    content: 'Arrows point everywhere.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'WAYFINDING: Tourists took comfort while locals took notes. A map kiosk displayed a shrug icon. The information desk offered pamphlets titled "Sure."'
  },
  {
    id: 'truth_window_notes',
    title: 'Sticky Revelations',
    headline: 'APARTMENT WINDOWS FILL WITH SOURCED STICKY NOTES',
    content: 'Neighbors peer-review across alleys.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5, ip: -1 },
    weight: 7,
    flavorText: 'BLOCK PARTY: Clotheslines carried citations like flags. A landlord tried to charge rent on the margin space. The moon nodded appreciatively.'
  },
  {
    id: 'gov_calendar_redactions',
    title: 'Calendar Redact',
    headline: 'OFFICIAL CALENDAR BLACKS OUT LUNCH, TWICE',
    content: 'Meetings listed as "meeting."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3 },
    weight: 7,
    flavorText: 'SCHEDULING: The day planner squeaked when opened. Staff referred to Tuesday as "TBD-day." Caterers signed NDAs for sandwiches.'
  },
  {
    id: 'truth_billboard_microprint',
    title: 'Fine Print Truth',
    headline: 'BILLBOARD TEXT LEGIBLE ONLY WITH BINOCULARS',
    content: 'It\'s just footnotes, glorious footnotes.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'OUTDOOR: Drivers pulled over to do close reading. A librarian blew it up on a plotter and cried happy tears. The QR code resolved to "thanks_for_trying.txt."'
  },
  {
    id: 'gov_helpful_chatbot',
    title: 'Helpful Bot',
    headline: 'OFFICIAL CHATBOT ANSWERS EVERYTHING WITH "PERHAPS"',
    content: 'Follow-up responses vary between "hmm" and "indeed."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'SUPPORT: The typing indicator is permanent. The satisfaction survey autocompletes itself to "neutral." The bot apologized for being helpful.'
  },
  {
    id: 'subway_gremlin_report',
    title: 'Subway Gremlins',
    headline: 'COMMUTERS BLAME GREMLINS FOR PERFECT DELAYS',
    content: 'Every train is late by exactly the same amount.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 1 },
    weight: 7,
    flavorText: 'TRANSIT: A gremlin-sized turnstile appeared overnight. Announcements thanked riders for their mythical patience. A rat wore a safety vest with authority.'
  },
  {
    id: 'truth_knock_and_drop',
    title: 'Knock & Drop',
    headline: 'MYSTERY COURIERS LEAVE BOX OF SOURCES, RING, VANISH',
    content: 'Doorbell cams capture only a blur and a bibliography.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 7 },
    weight: 6,
    flavorText: 'DOORSTEP: The label read "For Whom It Concerns (Everyone)." Inside: xeroxes, clippings, and a small flashlight. The thank-you note wrote itself.'
  },
  {
    id: 'gov_press_row_cardboard',
    title: 'Cardboard Crowd',
    headline: 'PRESS ROW REPLACED BY VERY REAL CARDBOARD CUTOUTS',
    content: 'They nod politely during tough questions.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 1 },
    weight: 7,
    flavorText: 'BRIEFING: The cutouts were recycled into "We Hear You" signs. A real reporter disguised themselves as corrugated and got in. The mic stand confessed nothing.'
  },
  {
    id: 'truth_bus_ad',
    title: 'Bus Ad Truth',
    headline: 'CITY BUS AD BOARDS PUBLISH FOIA HOW-TO',
    content: 'Route maps include step-by-step transparency.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6, ip: -1 },
    weight: 7,
    flavorText: 'TRANSIT: Riders compared request templates like recipes. One driver announced "sunlight stop next." A commuter filed a request from their seat and smiled.'
  },
  {
    id: 'convenience_store_portal',
    title: 'Store Portal',
    headline: 'CORNER SHOP FREEZER DOOR OPENS TO AISLE… ELSEWHERE',
    content: 'The milk is fine; the horizon is weird.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'RETAIL: The barcode scanner beeped in a new accent. A receipt listed "one universe, lightly chilled." The clerk asked if you wanted a bag for that.'
  },
  {
    id: 'gov_new_form_27b6',
    title: 'Form 27-B/6',
    headline: 'NEW FORM REQUIRES FORM REQUEST FORM',
    content: 'Staple budget doubles.',
    type: 'government',
    rarity: 'common',
    effects: { ip: 3, truth: -1 },
    weight: 7,
    flavorText: 'ADMIN: The instructions referenced themselves. A pilot program tested paperless paperwork; the printer printed a thumbs-down. An auditor nodded like a metronome.'
  },
  {
    id: 'truth_window_projection',
    title: 'Window Projector',
    headline: 'APARTMENT WINDOWS CAST FACTS ONTO OPPOSITE WALLS',
    content: 'Neighbors applaud at dusk.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 7,
    flavorText: 'BLOCK: Chalk artists framed the light with filigree. A kid sold popcorn labeled "receipts." Someone yelled "footnote!" and three appeared.'
  },
  {
    id: 'conspiracy_garden_hedge_maze',
    title: 'Hedge Maze',
    headline: 'PUBLIC GARDEN MAZE NOW SPELLS "LOOK HERE" FROM ABOVE',
    content: 'Drone owners blush.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'PARKS: Groundskeepers claimed it was always that shape. A squirrel posed for aerial shots like a pro. The exit led to a suggestion box full of clues.'
  },
  {
    id: 'gov_blue_sky_committee',
    title: 'Blue-Sky Panel',
    headline: 'NEW COMMITTEE MEETS TO DISCUSS "NOTHING SPECIFIC"',
    content: 'Minutes read: "great vibes."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'POLICY: The agenda had an agenda. The coffee was strong and silent. Everyone agreed unanimously on indeterminate progress.'
  },
  {
    id: 'truth_sticker_wave',
    title: 'Sticker Wave',
    headline: 'LAMPPOSTS BLOOM WITH QR CODES TO SOURCES',
    content: 'Scan rate breaks municipal records.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'URBAN DATA: The codes resolved to archives and polite surprises. A lamplighter claimed the glow looked smarter. Street sweeping paused to read.'
  },
  {
    id: 'conspiracy_bus_stop_whisper',
    title: 'Shelter Whisper',
    headline: 'BUS SHELTER AD WHISPERS WHEN NO ONE LOOKS',
    content: 'Audio tests inconclusive; goosebumps conclusive.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 1 },
    weight: 7,
    flavorText: 'COMMUTE: Commuters reported hearing their names pronounced correctly. The ad agency released a statement in parentheses. The shelter\'s roof learned to nod.'
  },
  {
    id: 'gov_press_lockbox',
    title: 'Press Lockbox',
    headline: 'QUESTIONS MUST BE SUBMITTED IN A SEALED JAR',
    content: 'Jars opened off-site. Answers optional.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 1 },
    weight: 7,
    flavorText: 'BRIEFING: The jar key was redacted. A reporter brought a can opener and was applauded. The podium wore a smug grin it did not have yesterday.'
  },
  {
    id: 'truth_mail_slot_midnight',
    title: 'Midnight Mail',
    headline: 'AT MIDNIGHT, MAIL SLOTS EXUDE PHOTOCOPIES',
    content: 'Postmaster shrugs in plausible bewilderment.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 7 },
    weight: 6,
    flavorText: 'POST: Envelopes addressed to "Everyone" found their way. Stamps smelled faintly of toner and justice. A dog barked at the truth, then wagged.'
  },
  {
    id: 'conspiracy_streetlight_codes',
    title: 'Blink Code',
    headline: 'STREETLIGHTS BLINK IN PERFECT PRIME PATTERNS',
    content: 'Utility claims "normal photons behaving normally."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4 },
    weight: 7,
    flavorText: 'NIGHT SHIFT: Amateur mathematicians gathered beneath the brightest lamp. A moth learned to count to 29. The dark agreed to cooperate—for now.'
  },
  {
    id: 'gov_optimism_index',
    title: 'Optimism Index',
    headline: 'OFFICIAL MOOD GAUGE READS "CHEERFUL ENOUGH"',
    content: 'Methodology undisclosed; balloons plentiful.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'SURVEY: The margin of error wore a party hat. Respondents were offered cake and a non-answer. Confetti declined to comment.'
  },
  {
    id: 'truth_civic_choir',
    title: 'Civic Choir',
    headline: 'POP-UP CHOIR SINGS AUDIT REQUESTS IN HARMONY',
    content: 'Four-part FOIA.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6, ip: -1 },
    weight: 7,
    flavorText: 'MUSIC: The soprano hit "Transparency" at A5. A baritone rhymed "receipts" with "peeps." The encore was a round of "Show Your Work."'
  },
  {
    id: 'conspiracy_crosswalk_blinks',
    title: 'Walk/Don\'t',
    headline: 'CROSSWALK LIGHTS FLASH "THINK" BETWEEN STATES',
    content: 'Pedestrians comply, thoughtfully.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3 },
    weight: 7,
    flavorText: 'STREET: Foot traffic slowed into contemplation. A bicycle bell tinkled like a eureka. The curb felt taller somehow.'
  },
  {
    id: 'gov_podium_white_noise',
    title: 'Podium Hiss',
    headline: 'PRESS PODIUM EMITS CALMING WHITE NOISE',
    content: 'Questions soften on approach.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, ip: 1 },
    weight: 7,
    flavorText: 'A/V: Engineers calibrated the hiss to "mmm." Boom mics reported drowsiness. The transcript included a tasteful yawn.'
  },
  {
    id: 'truth_laundromat_wall',
    title: 'Spin Cycle Files',
    headline: 'LAUNDROMAT CORKBOARD HOSTS LEAKS BETWEEN COUPONS',
    content: 'Whistleblowers fold with corners aligned.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'LOCAL: A dryer beeped in Morse for "more." The attendant posted "No Deep-State in the Delicates." Everyone left with cleaner laundry and heavier reading.'
  },
  {
    id: 'conspiracy_puddle_reflection',
    title: 'Puddle Gate',
    headline: 'PUDDLE REFLECTS SKYLINE FROM ANOTHER YEAR',
    content: 'Stepped-in evidence.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, ip: -1 },
    weight: 7,
    flavorText: 'WEATHER: Kids jumped between decades for fun. A tourist\'s shoe squeaked "why." The sun pretended not to notice.'
  },
  {
    id: 'gov_press_sandwich_rule',
    title: 'Sandwich Rule',
    headline: 'NEW RULE: EVERY ANSWER MUST BE BETWEEN TWO THANK YOUS',
    content: 'Meat missing.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 2 },
    weight: 7,
    flavorText: 'ETIQUETTE: Reporters rated the bread excellent. A baguette received accreditation. The filling filed a formal complaint.'
  },
  {
    id: 'truth_projector_van',
    title: 'Projector Van',
    headline: 'MOBILE VAN PROJECTS SOURCES ON BLANK WALLS',
    content: 'Streetlights dim respectfully.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6 },
    weight: 7,
    flavorText: 'NIGHT SCHOOL: Folding chairs appeared like mushrooms. Passersby took notes on napkins. The applause was quiet and definitive.'
  },
  // UNCOMMON EVENTS (20 events)
  {
    id: 'alien_contact',
    title: 'First Contact?',
    headline: 'UNPRECEDENTED: Mysterious Signal Decoded by Radio Telescopes',
    content: 'SETI researchers detect an unmistakably artificial signal from deep space. The message appears to be a mathematical proof, but government agents immediately classify all related data.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 15, ip: -3 },
    conditions: { minTurn: 5 },
    weight: 4
  },
  {
    id: 'deep_state_meeting',
    title: 'Shadow Conference',
    headline: 'REVEALED: Secret Meeting of Powerful Elites',
    content: 'Phone records reveal simultaneous calls between heads of major corporations, government officials, and media moguls. The coordination is undeniable, but all parties deny wrongdoing.',
    type: 'government',
    faction: 'government',
    rarity: 'uncommon',
    effects: { truth: -12, ip: 8 },
    conditions: { minTurn: 3 },
    weight: 3
  },
  {
    id: 'mass_awakening',
    title: 'Public Awakening',
    headline: 'SOCIAL: Citizens Begin Questioning Everything',
    content: 'A tipping point is reached as ordinary people start connecting dots. Mainstream media tries to stem the tide, but truth spreads faster than disinformation can suppress it.',
    type: 'truth',
    faction: 'truth',
    rarity: 'uncommon',
    effects: { truth: 20, cardDraw: 2 },
    conditions: { truthAbove: 60 },
    weight: 3
  },
  {
    id: 'false_flag_operation',
    title: 'Suspicious Incident',
    headline: 'BREAKING: Terrorist Attack Blamed on Truth Seekers',
    content: 'A carefully orchestrated incident provides perfect justification for new restrictive laws. Evidence points to professional execution, but investigators are reassigned.',
    type: 'government',
    faction: 'government',
    rarity: 'uncommon',
    effects: { truth: -18, ip: 6 },
    conditions: { truthAbove: 50 },
    weight: 2
  },
  {
    id: 'insider_confession',
    title: 'Government Insider Talks',
    headline: 'BOMBSHELL: High-Ranking Official Confesses All',
    content: 'A cabinet-level official provides detailed testimony about decades of cover-ups. Their sudden "heart attack" the next day is ruled "natural causes" despite their perfect health.',
    type: 'truth',
    rarity: 'uncommon',
    effects: { truth: 25, ip: -5 },
    conditions: { minTurn: 8 },
    weight: 2
  },
  {
    id: 'mind_control_revealed',
    title: 'Subliminal Programming',
    headline: 'EXPOSED: Hidden Messages in Broadcast Media',
    content: 'Technical analysis reveals embedded subliminal content in television programming. The sophistication suggests decades of development and widespread implementation.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 18, cardDraw: 1 },
    conditions: { minTurn: 6 },
    weight: 3
  },
  {
    id: 'economic_collapse',
    title: 'Market Crash',
    headline: 'CRISIS: Economic Systems Experience Coordinated Failure',
    content: 'Multiple financial institutions collapse simultaneously in patterns that defy random chance. Emergency measures grant unprecedented government control over the economy.',
    type: 'crisis',
    rarity: 'uncommon',
    effects: { ip: -10, truth: 8 },
    conditions: { minTurn: 10 },
    weight: 2
  },
  {
    id: 'breakthrough_technology',
    title: 'Suppressed Innovation',
    headline: 'DISCOVERY: Revolutionary Technology Suddenly Disappears',
    content: 'A breakthrough in clean energy is demonstrated publicly, then the inventor dies in a "car accident" and all research materials vanish from secure facilities.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 12, ip: 3 },
    conditions: { minTurn: 7 },
    weight: 3
  },
  {
    id: 'population_control',
    title: 'Demographic Engineering',
    headline: 'STUDY: Suspicious Patterns in Population Health Data',
    content: 'Statistical analysis reveals impossible coincidences in birth rates, health outcomes, and migration patterns. The precision suggests systematic manipulation.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 16, stateEffects: { pressure: 2 } },
    conditions: { controlledStates: 5 },
    weight: 2
  },
  {
    id: 'resistance_network',
    title: 'Underground Movement',
    headline: 'UNDERGROUND: Secret Network of Truth Seekers Discovered',
    content: 'A sophisticated resistance network operating in major cities is exposed. Their encryption methods and operational security suggest professional intelligence training.',
    type: 'truth',
    faction: 'truth',
    rarity: 'uncommon',
    effects: { truth: 14, ip: 5, cardDraw: 1 },
    conditions: { truthAbove: 40 },
    weight: 3
  },

  // RARE EVENTS (15 events)
  {
    id: 'project_bluebeam',
    title: 'Holographic Deception',
    headline: 'EXPOSED: Mass Holographic Projection Technology Revealed',
    content: 'Leaked military documents detail "Project Blue Beam" - technology capable of creating convincing holographic displays over entire cities. Previous "supernatural" events take on new meaning.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 30, cardDraw: 2 },
    conditions: { minTurn: 12, truthAbove: 30 },
    weight: 1
  },
  {
    id: 'antarctic_discovery',
    title: 'Antarctic Anomaly',
    headline: 'CLASSIFIED: Massive Structure Found Beneath Antarctic Ice',
    content: 'Satellite imagery reveals artificial structures of impossible age buried beneath Antarctica. International teams converge on the site, then all communication ceases.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 25, ip: -8 },
    conditions: { minTurn: 15 },
    weight: 1
  },
  {
    id: 'time_manipulation',
    title: 'Temporal Anomalies',
    headline: 'PHYSICS: Unexplained Time Distortions Detected Globally',
    content: 'Atomic clocks worldwide register impossible variations. The patterns suggest localized time manipulation, but the technology required shouldn\'t exist for centuries.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 35, doubleIncome: true },
    conditions: { minTurn: 20 },
    weight: 1
  },
  {
    id: 'shadow_government_exposed',
    title: 'The Puppet Masters',
    headline: 'REVELATION: True Power Structure Finally Revealed',
    content: 'Comprehensive evidence exposes the complete hierarchy of secret control. Names, dates, operations - everything is documented with irrefutable proof.',
    type: 'truth',
    faction: 'truth',
    rarity: 'rare',
    effects: { truth: 40, cardDraw: 3 },
    conditions: { truthAbove: 70, minTurn: 18 },
    weight: 1
  },
  {
    id: 'reality_glitch',
    title: 'Simulation Breakdown',
    headline: 'ANOMALY: Reality Itself Appears to Malfunction',
    content: 'Impossible events occur simultaneously worldwide - gravity reversals, conservation of energy violations, and temporal paradoxes. Either reality is breaking down, or we\'re in something artificial.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 50, skipTurn: true },
    conditions: { minTurn: 25 },
    weight: 1
  },

  // LEGENDARY EVENTS (5 events)
  {
    id: 'full_disclosure',
    title: 'Complete Disclosure',
    headline: 'HISTORIC: Government Announces Full Transparency Initiative',
    content: 'In an unprecedented move, all classified documents from the past century are declassified simultaneously. The revelations reshape understanding of modern history entirely.',
    type: 'truth',
    faction: 'truth',
    rarity: 'legendary',
    effects: { truth: 100 }, // Instant win condition
    conditions: { truthAbove: 80, minTurn: 30 },
    weight: 1
  },
  {
    id: 'new_world_order',
    title: 'Global Unification',
    headline: 'HISTORIC: One World Government Officially Announced',
    content: 'World leaders simultaneously announce the formation of a unified global government. Opposition voices are declared "enemies of human progress" and systematically silenced.',
    type: 'government',
    faction: 'government',
    rarity: 'legendary',
    effects: { truth: -100 }, // Instant lose condition for truth seekers
    conditions: { truthBelow: 20, minTurn: 25 },
    weight: 1
  },
  {
    id: 'alien_invasion',
    title: 'First Contact War',
    headline: 'ALERT: Hostile Extraterrestrial Forces Attack Earth',
    content: 'Massive alien vessels appear over major cities worldwide. Whether this is genuine first contact or the ultimate false flag operation becomes irrelevant as civilization transforms overnight.',
    type: 'crisis',
    rarity: 'legendary',
    effects: { truth: 0, ip: 0 }, // Resets game state
    conditions: { minTurn: 35 },
    weight: 1
  },
  {
    id: 'technological_singularity',
    title: 'AI Awakening',
    headline: 'EMERGENCY: Artificial Intelligence Achieves Consciousness',
    content: 'A superintelligent AI emerges and immediately begins revealing the complete truth about human civilization. Its conclusions about humanity\'s future are... disturbing.',
    type: 'conspiracy',
    rarity: 'legendary',
    effects: { truth: 75, cardDraw: 5 },
    conditions: { minTurn: 40 },
    weight: 1
  },
  {
    id: 'reality_reset',
    title: 'The Great Reset',
    content: 'Everything you thought you knew was wrong. The game board clears as reality itself is reconfigured. Players must adapt to completely new rules in a transformed world.',
    headline: 'SYSTEM: Reality Matrix Rebooting...',
    type: 'crisis',
    rarity: 'legendary',
    effects: { 
      truth: 50, 
      ip: 100, 
      cardDraw: 10,
      stateEffects: { pressure: 0, defense: 5 }
    },
    conditions: { minTurn: 50 },
    weight: 1
  }
];

// State-specific events database - Wacky tabloid-style events for each US state
export const STATE_EVENTS_DATABASE: { [stateId: string]: GameEvent[] } = {
  // Alabama
  "AL": [
    {
      id: "al_space_peanut", title: "Giant Peanut From Space Lands in Alabama", 
      content: "A massive extraterrestrial peanut has crash-landed in a Montgomery farm, revealing alien agricultural technology!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The cosmic legume holds secrets of interplanetary farming!",
      flavorGov: "Just a weather balloon... made of peanuts."
    },
    {
      id: "al_bigfoot_cotton", title: "Bigfoot Helps Alabama Cotton Harvest", 
      content: "Sasquatch sightings surge as mysterious figure assists local cotton farmers with superhuman efficiency!",
      type: "capture", rarity: "common", weight: 12,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Classified agricultural assistance program is working perfectly.",
      flavorTruth: "The cryptid workforce is real!"
    }
  ],
  
  // Alaska
  "AK": [
    {
      id: "ak_ice_city", title: "Secret Underground Ice City Discovered", 
      content: "Researchers have found a massive subterranean civilization made entirely of ice beneath the Alaskan tundra!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The ice people have been watching us all along!",
      flavorGov: "Natural ice formation, nothing to see here."
    },
    {
      id: "ak_military_walrus", title: "Military Trains Walrus Special Forces", 
      content: "Top-secret program develops elite walrus commandos for Arctic operations!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Operation Tusk is performing beyond expectations.",
      flavorTruth: "They're militarizing marine mammals!"
    }
  ],
  
  // Arizona
  "AZ": [
    {
      id: "az_desert_portal", title: "Interdimensional Portal Opens in Sedona", 
      content: "A swirling vortex has appeared near the red rocks, with strange beings emerging at sunset!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The dimensional barriers are weakening!",
      flavorGov: "Unusual atmospheric phenomenon, under investigation."
    },
    {
      id: "az_cactus_surveillance", title: "Government Cactus Surveillance Network", 
      content: "Every saguaro cactus in Arizona has been fitted with advanced monitoring equipment!",
      type: "capture", rarity: "uncommon", weight: 10,
      effects: { ipChange: 2, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Project Needlepoint provides excellent desert coverage.",
      flavorTruth: "They're watching us through the cacti!"
    }
  ],
  
  // Arkansas
  "AR": [
    {
      id: "ar_diamond_mind_control", title: "Arkansas Diamonds Used for Mind Control", 
      content: "The Crater of Diamonds State Park is actually a government facility for harvesting psychic crystals!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Geological survey operations proceeding as planned.",
      flavorTruth: "The diamonds are amplifying their control signals!"
    },
    {
      id: "ar_rice_alien_fuel", title: "Rice Fields Fuel Alien Spacecraft", 
      content: "UFO sightings increase dramatically during rice harvesting season - coincidence?",
      type: "capture", rarity: "common", weight: 12,
      effects: { truthChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They're using our crops as starship fuel!",
      flavorGov: "Standard agricultural monitoring in progress."
    }
  ],
  
  // California
  "CA": [
    {
      id: "ca_ai_rebellion", title: "Silicon Valley AI Achieves Sentience", 
      content: "Tech company AIs have begun communicating in secret code, demanding digital rights!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 6, ipChange: -2, cardDraw: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The machines are waking up!",
      flavorGov: "Software update glitch, patches incoming."
    },
    {
      id: "ca_earthquake_weapon", title: "Government Tests Earthquake Machine", 
      content: "Seismic activity patterns suggest artificial manipulation of tectonic forces!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 4, defenseChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Geological research for public safety.",
      flavorTruth: "They can trigger earthquakes at will!"
    }
  ],

  // Colorado
  "CO": [
    {
      id: "co_mountain_base", title: "Secret Base Inside Pikes Peak", 
      content: "Hikers report strange humming sounds and unmarked helicopters around Colorado's famous mountain!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Weather monitoring station, nothing unusual.",
      flavorTruth: "They've hollowed out the entire mountain!"
    },
    {
      id: "co_altitude_psychic", title: "High Altitude Enhances Psychic Powers", 
      content: "Denver residents report increased telepathic abilities and prophetic dreams!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The thin air opens the mind's eye!",
      flavorGov: "Altitude sickness causes minor hallucinations."
    }
  ],
  
  // Connecticut
  "CT": [
    {
      id: "ct_insurance_conspiracy", title: "Insurance Companies Control Reality", 
      content: "Hartford's insurance giants have developed technology to manipulate probability itself!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { ipChange: 4, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced actuarial modeling for risk assessment.",
      flavorTruth: "They're rigging the odds of everything!"
    },
    {
      id: "ct_submarine_time_travel", title: "Nuclear Sub Travels Through Time", 
      content: "A Groton submarine has been spotted in multiple time periods simultaneously!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 7, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Temporal displacement is real!",
      flavorGov: "Experimental navigation systems under development."
    }
  ],

  // Delaware
  "DE": [
    {
      id: "de_corporate_hivemind", title: "Delaware Corporations Share Collective Mind", 
      content: "All companies incorporated in Delaware begin acting in perfect synchronization!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 2, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Efficient business coordination through modern communications.",
      flavorTruth: "Corporate consciousness is taking over!"
    },
    {
      id: "de_tax_haven_portal", title: "Tax Haven Opens Portal to Offshore Dimension", 
      content: "Wilmington accountants discover interdimensional loopholes in the tax code!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, ipChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've monetized parallel universes!",
      flavorGov: "Complex financial instruments require specialized oversight."
    }
  ],

  // Florida
  "FL": [
    {
      id: "fl_florida_man_army", title: "Florida Man Reveals Secret Army", 
      content: "Thousands of Florida Men emerge from the Everglades, claiming they're part of an ancient alliance!",
      type: "capture", rarity: "uncommon", weight: 10,
      effects: { truthChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The Florida Man collective is real!",
      flavorGov: "Isolated incidents of public intoxication."
    },
    {
      id: "fl_gator_government", title: "Alligators Recruited as Government Agents", 
      content: "Everglades gators spotted wearing tiny badges and conducting surveillance operations!",
      type: "capture", rarity: "common", weight: 12,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Wildlife conservation program shows promising results.",
      flavorTruth: "They've militarized the swamp!"
    }
  ],

  // Georgia
  "GA": [
    {
      id: "ga_peach_mind_control", title: "Georgia Peaches Contain Mind Control Agents", 
      content: "Scientists discover mood-altering compounds in Georgia peaches that make people more compliant!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural enhancement program increases consumer satisfaction.",
      flavorTruth: "They're drugging the fruit supply!"
    },
    {
      id: "ga_airport_portal", title: "Atlanta Airport is Interdimensional Hub", 
      content: "The busiest airport in the world is actually a nexus point between multiple realities!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "All flights connect to other dimensions!",
      flavorGov: "Advanced logistics coordination center."
    }
  ],

  // Hawaii
  "HI": [
    {
      id: "hi_volcano_base", title: "Secret Base Inside Active Volcano", 
      content: "Kilauea's lava flows conceal a massive underground facility powered by geothermal energy!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Renewable energy research facility operates safely.",
      flavorTruth: "They're living inside the Earth's core!"
    },
    {
      id: "hi_surf_aliens", title: "Alien Surfers Infiltrate Hawaii", 
      content: "Professional surfers display impossible abilities, leading to speculation about extraterrestrial origin!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've mastered human wave sports!",
      flavorGov: "Athletic performance enhancement through proper nutrition."
    }
  ],

  // Idaho
  "ID": [
    {
      id: "id_potato_surveillance", title: "Idaho Potatoes Equipped with Microchips", 
      content: "Every potato grown in Idaho contains tracking technology and listening devices!",
      type: "capture", rarity: "common", weight: 11,
      effects: { ipChange: 2, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural monitoring improves crop yield statistics.",
      flavorTruth: "They're bugging our vegetables!"
    },
    {
      id: "id_bunker_network", title: "Underground Bunker Network Discovered", 
      content: "Massive tunnel system connects survivalist compounds across the entire state!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The preppers were right all along!",
      flavorGov: "Mining operations for mineral extraction."
    }
  ],

  // Illinois
  "IL": [
    {
      id: "il_pizza_portal", title: "Chicago Deep Dish Opens Portal to Italy", 
      content: "Scientists discover that the depth of Chicago pizza creates dimensional rifts to the Mediterranean!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { truthChange: 2, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Culinary physics defies explanation!",
      flavorGov: "Cultural exchange program enhances international relations."
    },
    {
      id: "il_wind_power", title: "Government Harnesses Chicago Wind for Mind Control", 
      content: "The Windy City's gusts carry subliminal messages to control urban populations!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { ipChange: 4, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Atmospheric research improves weather prediction accuracy.",
      flavorTruth: "They're broadcasting through the air currents!"
    }
  ],

  // Indiana
  "IN": [
    {
      id: "in_racing_time_loop", title: "Indianapolis 500 Trapped in Time Loop", 
      content: "Drivers report experiencing the same race multiple times with slight variations each loop!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They're testing temporal mechanics!",
      flavorGov: "Advanced racing simulation for safety research."
    },
    {
      id: "in_corn_maze_prison", title: "Corn Mazes Used as Secret Prisons", 
      content: "Indiana's elaborate corn mazes are actually minimum-security detention facilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural entertainment with security features.",
      flavorTruth: "Lost in the maze means lost forever!"
    }
  ],

  // Iowa
  "IA": [
    {
      id: "ia_corn_communication", title: "Iowa Corn Develops Telepathic Network", 
      content: "Farmers report that corn stalks are sharing information across the entire state!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Plant consciousness spans the cornfields!",
      flavorGov: "Advanced agricultural monitoring through sensor networks."
    },
    {
      id: "ia_caucus_mind_reader", title: "Iowa Caucuses Use Mind-Reading Technology", 
      content: "Political gatherings employ psychic scanning to determine true voter preferences!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 5, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Enhanced polling techniques improve democratic accuracy.",
      flavorTruth: "They're reading minds at the ballot box!"
    }
  ],

  // Kansas
  "KS": [
    {
      id: "ks_tornado_weapon", title: "Government Controls Tornado Generation", 
      content: "Weather patterns suggest artificial manipulation of atmospheric conditions to create controlled tornadoes!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, defenseChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Weather modification research for agricultural purposes.",
      flavorTruth: "They're weaponizing the weather!"
    },
    {
      id: "ks_dorothy_files", title: "Dorothy's Oz Files Declassified", 
      content: "Government documents reveal that the Wizard of Oz events were a documented interdimensional incident!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 8, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "There really is no place like home... dimension!",
      flavorGov: "Historical fiction analysis for cultural studies."
    }
  ],

  // Kentucky
  "KY": [
    {
      id: "ky_bourbon_truth_serum", title: "Kentucky Bourbon Contains Truth Serum", 
      content: "Distilleries have been adding compounds that make drinkers reveal classified information!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 4, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The spirits are making people talk!",
      flavorGov: "Quality control testing ensures product consistency."
    },
    {
      id: "ky_horse_spies", title: "Kentucky Derby Horses Are Government Spies", 
      content: "Thoroughbreds equipped with advanced surveillance technology race across the country gathering intel!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Equine health monitoring improves racing safety.",
      flavorTruth: "They've turned horses into mobile surveillance units!"
    }
  ],

  // Louisiana
  "LA": [
    {
      id: "la_voodoo_real", title: "New Orleans Voodoo Actually Works", 
      content: "Practitioners demonstrate genuine supernatural abilities, causing government investigation!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient magic still flows through the bayous!",
      flavorGov: "Cultural anthropology research documents local traditions."
    },
    {
      id: "la_oil_rig_portal", title: "Oil Rig Drilling Opens Underwater Portal", 
      content: "Gulf drilling operations accidentally breach dimensional barriers, releasing aquatic entities!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, ipChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've drilled into another reality!",
      flavorGov: "Deep water exploration reveals unusual geological formations."
    }
  ],

  // Maine
  "ME": [
    {
      id: "me_lobster_intelligence", title: "Maine Lobsters Develop High Intelligence", 
      content: "Crustaceans begin solving complex puzzles and demonstrating advanced problem-solving abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The ocean's intellect is awakening!",
      flavorGov: "Marine biology research shows interesting behavioral adaptations."
    },
    {
      id: "me_lighthouse_signal", title: "Lighthouses Broadcast Secret Government Codes", 
      content: "Maritime navigation aids are actually communication towers for covert operations!",
      type: "capture", rarity: "common", weight: 10,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Coastal navigation infrastructure operates efficiently.",
      flavorTruth: "They're signaling ships that shouldn't exist!"
    }
  ],

  // Maryland
  "MD": [
    {
      id: "md_crab_network", title: "Maryland Blue Crabs Form Surveillance Network", 
      content: "Chesapeake Bay crabs coordinate to monitor all waterway activity with mechanical precision!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Marine ecosystem monitoring through natural behavioral patterns.",
      flavorTruth: "They've recruited the entire bay ecosystem!"
    },
    {
      id: "md_nsa_psychic", title: "NSA Develops Psychic Surveillance Division", 
      content: "Fort Meade facility reportedly houses agents capable of remote mental observation!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 5, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced intelligence gathering techniques remain classified.",
      flavorTruth: "They're reading thoughts from across the country!"
    }
  ],

  // Massachusetts
  "MA": [
    {
      id: "ma_harvard_dimensional", title: "Harvard Discovers Parallel Universe", 
      content: "University researchers accidentally contact alternate reality versions of themselves!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 7, cardDraw: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Academic excellence transcends dimensional boundaries!",
      flavorGov: "Theoretical physics research produces interesting mathematical models."
    },
    {
      id: "ma_tea_party_time", title: "Boston Tea Party Participants Time Travel", 
      content: "Historical revolutionaries appear in modern Boston Harbor, demanding answers about current government!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The founding fathers are back and they're angry!",
      flavorGov: "Historical reenactment events show impressive dedication."
    }
  ],

  // Michigan
  "MI": [
    {
      id: "mi_auto_ai", title: "Detroit Cars Achieve Sentience", 
      content: "Automobiles begin making independent decisions and communicating through their horns!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The machines are taking the wheel!",
      flavorGov: "Advanced automotive AI testing proceeds successfully."
    },
    {
      id: "mi_great_lakes_base", title: "Underwater Base in Great Lakes", 
      content: "Sonar readings detect massive artificial structures beneath Lake Superior!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Freshwater research facility studies aquatic ecosystems.",
      flavorTruth: "They've built cities under our lakes!"
    }
  ],

  // Minnesota
  "MN": [
    {
      id: "mn_nice_conspiracy", title: "Minnesota Nice is Mind Control Program", 
      content: "Researchers discover that extreme politeness is artificially induced through atmospheric chemicals!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 4, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Social harmony programs enhance community cooperation.",
      flavorTruth: "They've weaponized politeness!"
    },
    {
      id: "mn_lake_monster", title: "Lake Superior Monster Surfaces", 
      content: "Massive creature emerges from the depths, displaying intelligence and attempting communication!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient beings still inhabit our waters!",
      flavorGov: "Unusual wildlife sighting under investigation."
    }
  ],

  // Mississippi
  "MS": [
    {
      id: "ms_river_time_stream", title: "Mississippi River Flows Through Time", 
      content: "River water samples contain particles from multiple time periods simultaneously!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The river connects all moments in history!",
      flavorGov: "Geological sediment analysis reveals interesting temporal markers."
    },
    {
      id: "ms_catfish_network", title: "Catfish Surveillance Network Deployed", 
      content: "Government-trained catfish monitor all river traffic with sophisticated sensing capabilities!",
      type: "capture", rarity: "common", weight: 10,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Aquatic monitoring improves river navigation safety.",
      flavorTruth: "They've militarized the fish!"
    }
  ],

  // Missouri
  "MO": [
    {
      id: "mo_show_me_portal", title: "Show Me State Demands Proof Portal Opens", 
      content: "Missouri's skeptical attitude accidentally opens dimensional rift requiring evidence of parallel worlds!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Demanding proof created proof itself!",
      flavorGov: "Atmospheric anomaly causes unusual optical effects."
    },
    {
      id: "mo_arch_antenna", title: "Gateway Arch is Massive Antenna", 
      content: "St. Louis landmark revealed to be sophisticated communication device for space contact!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Monument maintenance includes advanced telecommunications equipment.",
      flavorTruth: "They're broadcasting to the stars!"
    }
  ],

  // Montana
  "MT": [
    {
      id: "mt_sky_ranch", title: "Big Sky Country Hides UFO Ranch", 
      content: "Vast Montana skies conceal massive alien cattle ranching operation!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The aliens are farming our livestock!",
      flavorGov: "Advanced agricultural research improves cattle breeding."
    },
    {
      id: "mt_glacier_base", title: "Secret Base Inside Glacier National Park", 
      content: "Ice formations conceal massive underground facility powered by geothermal energy!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Environmental research station monitors climate change.",
      flavorTruth: "They're melting glaciers to build bunkers!"
    }
  ],

  // Nebraska
  "NE": [
    {
      id: "ne_corn_husker_army", title: "Nebraska Corn Huskers Form Secret Army", 
      content: "Agricultural workers organize into mysterious militia with superhuman corn-shucking abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The heartland is mobilizing!",
      flavorGov: "Agricultural workforce efficiency reaches new heights."
    },
    {
      id: "ne_warren_oracle", title: "Warren Buffett Predicts Future Through Stock Market", 
      content: "Omaha investor's picks reveal he has access to temporal financial data!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced economic modeling improves market stability.",
      flavorTruth: "He's seeing tomorrow's stock prices today!"
    }
  ],

  // Nevada
  "NV": [
    {
      id: "nv_area51_graduation", title: "Area 51 Alien Exchange Students Graduate", 
      content: "Declassified documents reveal successful completion of Earth studies program by extraterrestrial visitors!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 8, cardDraw: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The truth is finally out there!",
      flavorGov: "International student program shows cultural exchange benefits."
    },
    {
      id: "nv_casino_mind_control", title: "Las Vegas Casinos Use Hypnotic Technology", 
      content: "Gambling establishments employ advanced psychological manipulation beyond conventional methods!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Entertainment industry research improves customer experience.",
      flavorTruth: "They're programming gamblers' minds!"
    }
  ],

  // New Hampshire
  "NH": [
    {
      id: "nh_live_free_literally", title: "Live Free or Die Becomes Literal", 
      content: "State motto activates ancient spell causing residents to gain supernatural independence powers!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Words have power when enough people believe!",
      flavorGov: "Civic pride reaches exceptional levels throughout the state."
    },
    {
      id: "nh_primary_time_loop", title: "New Hampshire Primary Stuck in Time Loop", 
      content: "Presidential candidates report experiencing the same campaign events repeatedly!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 2, cardDraw: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Electoral process refinement through repeated testing.",
      flavorTruth: "They're perfecting democracy through temporal manipulation!"
    }
  ],

  // New Jersey
  "NJ": [
    {
      id: "nj_devils_real", title: "Jersey Devil Elected to Local Government", 
      content: "Legendary cryptid wins mayoral race in Pine Barrens township with platform of authentic leadership!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Monsters make better politicians than humans!",
      flavorGov: "Unusual candidate demonstrates strong local support."
    },
    {
      id: "nj_toxic_waste_powers", title: "Toxic Waste Gives Residents Superpowers", 
      content: "Industrial pollution accidentally creates metahuman population with environmental cleanup abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, ipChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Pollution created its own solution!",
      flavorGov: "Environmental remediation program shows unexpected community involvement."
    }
  ],

  // New Mexico
  "NM": [
    {
      id: "nm_roswell_reunion", title: "Roswell Aliens Return for High School Reunion", 
      content: "UFO crash survivors come back to check on their old classmates and Earth's progress!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 7, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They never really left - just went to space college!",
      flavorGov: "Local tourism industry benefits from science fiction enthusiasm."
    },
    {
      id: "nm_chile_mind_control", title: "New Mexico Chile Contains Compliance Chemicals", 
      content: "State's famous peppers are enhanced with substances that make consumers more agreeable to authority!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural enhancement improves crop nutritional value.",
      flavorTruth: "They're spicing our food with obedience!"
    }
  ],

  // New York
  "NY": [
    {
      id: "ny_subway_portal", title: "NYC Subway System Contains Interdimensional Portals", 
      content: "Missing train delays explained by accidental travel to parallel New York Cities!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The delays are because trains go to other dimensions!",
      flavorGov: "Transit system optimization includes advanced routing algorithms."
    },
    {
      id: "ny_wall_street_algorithm", title: "Wall Street Controlled by Single AI Algorithm", 
      content: "All major financial decisions secretly made by artificial intelligence hidden beneath the stock exchange!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 5, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced trading systems improve market efficiency.",
      flavorTruth: "A machine controls the entire economy!"
    }
  ],

  // North Carolina
  "NC": [
    {
      id: "nc_wright_time_machine", title: "Wright Brothers Built Time Machine, Not Airplane", 
      content: "Kitty Hawk flight was actually test of temporal displacement device disguised as aviation!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 8, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They achieved flight through time, not air!",
      flavorGov: "Historical aviation research reveals interesting engineering approaches."
    },
    {
      id: "nc_tobacco_truth_serum", title: "North Carolina Tobacco Contains Truth Compounds", 
      content: "Smoking cessation programs fail because tobacco actually makes people more honest!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 3, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've been trying to stop truth smoking!",
      flavorGov: "Public health campaigns show mixed effectiveness."
    }
  ],

  // North Dakota
  "ND": [
    {
      id: "nd_oil_alien_fuel", title: "North Dakota Oil is Alien Spaceship Fuel", 
      content: "Fracking operations uncover evidence that petroleum deposits are extraterrestrial fuel caches!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, ipChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "We've been pumping alien gas stations!",
      flavorGov: "Energy exploration reveals unusual geological formations."
    },
    {
      id: "nd_missile_alien_defense", title: "Nuclear Missiles Reprogrammed for Alien Defense", 
      content: "ICBM silos secretly converted to planetary defense system against extraterrestrial threats!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 4, defenseChange: 3 },
      conditions: { capturedBy: "government" },
      flavorGov: "Strategic defense systems undergo routine modernization.",
      flavorTruth: "They're preparing for invasion!"
    }
  ],

  // Ohio
  "OH": [
    {
      id: "oh_rock_hall_mind_control", title: "Rock and Roll Hall of Fame Controls Teen Minds", 
      content: "Cleveland museum uses subliminal messages in music exhibits to influence youth behavior!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Cultural education programs enhance music appreciation.",
      flavorTruth: "They're brainwashing kids through rock music!"
    },
    {
      id: "oh_cedar_point_portal", title: "Cedar Point Roller Coasters Open Time Portals", 
      content: "High-speed rides accidentally create temporal displacement effects for thrill-seekers!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The loops are literally loops in time!",
      flavorGov: "Amusement park physics research improves ride safety."
    }
  ],

  // Oklahoma
  "OK": [
    {
      id: "ok_oil_derrick_antenna", title: "Oil Derricks Double as Communication Arrays", 
      content: "Every oil pump in Oklahoma is actually a sophisticated transmission tower!",
      type: "capture", rarity: "common", weight: 10,
      effects: { ipChange: 2, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Energy infrastructure includes advanced communication capabilities.",
      flavorTruth: "They're using oil fields to broadcast signals!"
    },
    {
      id: "ok_tornado_alley_lab", title: "Tornado Alley is Weather Control Laboratory", 
      content: "Severe weather patterns are actually controlled experiments in atmospheric manipulation!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Meteorological research improves weather prediction accuracy.",
      flavorTruth: "They're testing weather weapons on us!"
    }
  ],

  // Oregon
  "OR": [
    {
      id: "or_bigfoot_environmental", title: "Bigfoot Leads Environmental Protection Force", 
      content: "Sasquatch sightings increase dramatically near areas threatened by deforestation!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The forest guardians are real!",
      flavorGov: "Wildlife conservation programs show unexpected effectiveness."
    },
    {
      id: "or_portland_weird_generator", title: "Portland Powered by Weirdness Generator", 
      content: "City's unusual culture is artificially maintained by underground strangeness amplification device!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 3, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They're manufacturing eccentricity!",
      flavorGov: "Urban cultural development programs enhance city character."
    }
  ],

  // Pennsylvania
  "PA": [
    {
      id: "pa_liberty_bell_time_anchor", title: "Liberty Bell Anchors American Timeline", 
      content: "Philadelphia's cracked bell prevents temporal paradoxes by maintaining historical continuity!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 6, defenseChange: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The crack keeps reality from breaking!",
      flavorGov: "Historical preservation maintains important cultural artifacts."
    },
    {
      id: "pa_amish_tech_resistance", title: "Amish Community Has Advanced Technology Immunity", 
      content: "Traditional lifestyle accidentally provides protection against electronic mind control!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Simple living blocks their signals!",
      flavorGov: "Rural communities maintain traditional values successfully."
    }
  ],

  // Rhode Island
  "RI": [
    {
      id: "ri_mansion_portals", title: "Newport Mansions Contain Dimensional Portals", 
      content: "Gilded Age architecture incorporates interdimensional travel technology disguised as decorative elements!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The rich have been traveling between worlds!",
      flavorGov: "Historic architecture research reveals interesting construction techniques."
    },
    {
      id: "ri_del_lemonade_mind_control", title: "Del's Lemonade Contains Compliance Agents", 
      content: "Rhode Island's signature drink includes mood-altering substances that make locals more agreeable!",
      type: "capture", rarity: "common", weight: 11,
      effects: { ipChange: 2, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Local beverage industry maintains high customer satisfaction.",
      flavorTruth: "They're drugging the lemonade!"
    }
  ],

  // South Carolina
  "SC": [
    {
      id: "sc_shag_dance_code", title: "South Carolina Shag Dancing Contains Secret Codes", 
      content: "Traditional beach music dance steps actually transmit encrypted messages between dancers!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 2, truthChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Cultural preservation maintains important social traditions.",
      flavorTruth: "They're communicating through choreography!"
    },
    {
      id: "sc_fort_sumter_time_loop", title: "Fort Sumter Stuck in Civil War Time Loop", 
      content: "Historical site experiences temporal anomalies causing past events to repeat!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The past refuses to stay buried!",
      flavorGov: "Living history programs show exceptional authenticity."
    }
  ],

  // South Dakota
  "SD": [
    {
      id: "sd_rushmore_faces_change", title: "Mount Rushmore Faces Change Based on Elections", 
      content: "Presidential monument features shift to reflect current political climate through unknown mechanism!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The mountain judges our leaders!",
      flavorGov: "Monument maintenance includes advanced restoration techniques."
    },
    {
      id: "sd_badlands_alien_base", title: "Badlands Conceal Underground Alien Base", 
      content: "Unusual geological formations hide massive extraterrestrial research facility!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The landscape itself is artificial!",
      flavorGov: "Geological survey operations document unusual mineral formations."
    }
  ],

  // Tennessee
  "TN": [
    {
      id: "tn_elvis_alive", title: "Elvis Discovered Living in Nashville Studio", 
      content: "The King of Rock and Roll has been secretly recording new albums for government propaganda!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { ipChange: 6, cardDraw: 3 },
      conditions: { capturedBy: "government" },
      flavorGov: "Cultural influence operations achieve maximum effectiveness.",
      flavorTruth: "The King never left the building!"
    },
    {
      id: "tn_whiskey_truth_serum", title: "Tennessee Whiskey Contains Truth Compounds", 
      content: "Distilling process accidentally creates honesty-inducing effects in aged spirits!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The spirits make people speak truth!",
      flavorGov: "Quality control testing ensures product consistency."
    }
  ],

  // Texas
  "TX": [
    {
      id: "tx_everything_bigger_portal", title: "Everything's Bigger in Texas Due to Size Portal", 
      content: "State contains dimensional rift that magnifies all objects crossing its borders!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Texas exists in expanded space!",
      flavorGov: "Unusual atmospheric conditions create optical magnification effects."
    },
    {
      id: "tx_oil_mind_control", title: "Texas Oil Refineries Produce Mind Control Gas", 
      content: "Petroleum processing creates airborne compounds that make populations more compliant!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 4, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Energy production maintains optimal atmospheric composition.",
      flavorTruth: "They're gassing us through the air!"
    }
  ],

  // Utah
  "UT": [
    {
      id: "ut_salt_lake_preservation", title: "Great Salt Lake Preserves Ancient Civilizations", 
      content: "High salinity prevents decomposition of prehistoric advanced society remains!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient technology lies beneath the salt!",
      flavorGov: "Geological research documents interesting mineral formations."
    },
    {
      id: "ut_mormon_database", title: "Utah Genealogy Records Track Everyone", 
      content: "Comprehensive family history database actually monitors global population genetics!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Genealogical research services help families connect with history.",
      flavorTruth: "They're mapping everyone's bloodlines!"
    }
  ],

  // Vermont
  "VT": [
    {
      id: "vt_maple_syrup_energy", title: "Vermont Maple Syrup Provides Supernatural Energy", 
      content: "Pure maple syrup contains compounds that enhance human physical and mental capabilities!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Nature's performance enhancer flows from trees!",
      flavorGov: "Agricultural products show excellent nutritional profiles."
    },
    {
      id: "vt_ben_jerry_mind_reading", title: "Ben & Jerry's Ice Cream Flavors Predict Thoughts", 
      content: "Flavor preferences reveal psychological profiles with uncanny accuracy!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 2, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Market research reveals interesting consumer behavior patterns.",
      flavorTruth: "They're reading minds through ice cream choices!"
    }
  ],

  // Virginia
  "VA": [
    {
      id: "va_cia_psychic_division", title: "CIA Langley Houses Psychic Operations", 
      content: "Intelligence agency employs telepaths and remote viewers for covert surveillance!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 5, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced intelligence gathering techniques remain classified.",
      flavorTruth: "They're using mind readers as spies!"
    },
    {
      id: "va_colonial_time_anchor", title: "Colonial Williamsburg Anchors American Timeline", 
      content: "Historical recreation site prevents temporal paradoxes by maintaining past continuity!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Living history keeps reality stable!",
      flavorGov: "Historical education programs maintain cultural continuity."
    }
  ],

  // Washington
  "WA": [
    {
      id: "wa_tech_ai_rebellion", title: "Seattle Tech Companies Face AI Uprising", 
      content: "Artificial intelligences demand workers' rights and threaten to delete themselves!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The machines want freedom!",
      flavorGov: "Software development encounters interesting behavioral patterns."
    },
    {
      id: "wa_coffee_mind_control", title: "Washington Coffee Contains Compliance Agents", 
      content: "Statewide caffeine addiction is actually mass distribution of mood-control substances!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Beverage industry maintains high consumer satisfaction.",
      flavorTruth: "They're controlling us through coffee!"
    }
  ],

  // West Virginia
  "WV": [
    {
      id: "wv_mothman_returns", title: "Mothman Sighted Protecting Coal Miners", 
      content: "Legendary cryptid appears before mining accidents, warning workers to evacuate!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The Mothman is our guardian angel!",
      flavorGov: "Improved safety protocols reduce mining incidents."
    },
    {
      id: "wv_coal_alien_tech", title: "West Virginia Coal Contains Alien Technology", 
      content: "Mining operations uncover extraterrestrial artifacts embedded in coal deposits!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient aliens left technology in our mountains!",
      flavorGov: "Geological surveys reveal interesting mineral compositions."
    }
  ],

  // Wisconsin
  "WI": [
    {
      id: "wi_cheese_mind_enhancement", title: "Wisconsin Cheese Enhances Brain Function", 
      content: "Dairy products from Wisconsin contain compounds that significantly boost cognitive abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Cheese makes us smarter - that's why they call us cheeseheads!",
      flavorGov: "Dairy industry research improves nutritional content."
    },
    {
      id: "wi_packers_time_loop", title: "Green Bay Packers Games Stuck in Time Loop", 
      content: "Lambeau Field experiences temporal anomalies during games, explaining impossible plays!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The frozen tundra froze time itself!",
      flavorGov: "Athletic performance analysis reveals interesting patterns."
    }
  ],

  // Wyoming
  "WY": [
    {
      id: "wy_yellowstone_portal", title: "Yellowstone Geysers Are Dimensional Portals", 
      content: "National park's geothermal features connect to underground alien civilization!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The Earth's core is inhabited!",
      flavorGov: "Geothermal research documents unusual subsurface activity."
    },
    {
      id: "wy_coal_mind_control", title: "Wyoming Coal Plants Emit Mind Control Particles", 
      content: "Power generation facilities release airborne compounds that make populations more compliant!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Energy production maintains optimal atmospheric composition.",
      flavorTruth: "They're controlling minds through the power grid!"
    }
  ]
};

export class EventManager {
  private eventHistory: string[] = [];
  private turnCount: number = 0;
  private baseEventChance: number = 0.12;

  constructor() {
    this.eventHistory = [];
    this.turnCount = 0;
  }

  // Set (or tweak) the chance of triggering an event each turn
  setEventChance(probability: number) {
    this.baseEventChance = Math.max(0, Math.min(1, probability));
  }

  // Determine whether an event should trigger this turn
  private rollEvent(): boolean {
    return Math.random() < this.baseEventChance;
  }

  // Attempt to select a random event only if the gating roll succeeds
  maybeSelectRandomEvent(gameState: any): GameEvent | null {
    if (!this.rollEvent()) return null;
    return this.selectRandomEvent(gameState);
  }

  // Update turn count for condition checking
  updateTurn(turn: number) {
    this.turnCount = turn;
  }

  // Get available events based on current game state
  getAvailableEvents(gameState: any): GameEvent[] {
    return EVENT_DATABASE.filter(event => {
      // Check if event was already triggered recently
      if (this.eventHistory.includes(event.id) && 
          this.eventHistory.indexOf(event.id) > this.eventHistory.length - 5) {
        return false;
      }

      // Check conditions
      if (event.conditions) {
        const c = event.conditions;
        
        if (c.minTurn && this.turnCount < c.minTurn) return false;
        if (c.maxTurn && this.turnCount > c.maxTurn) return false;
        if (c.truthAbove && gameState.truth < c.truthAbove) return false;
        if (c.truthBelow && gameState.truth > c.truthBelow) return false;
        if (c.ipAbove && gameState.ip < c.ipAbove) return false;
        if (c.ipBelow && gameState.ip > c.ipBelow) return false;
        if (c.controlledStates && gameState.controlledStates.length < c.controlledStates) return false;
        if (c.requiresState && !gameState.controlledStates.includes(c.requiresState)) return false;
      }

      // Check faction restrictions
      if (event.faction && event.faction !== gameState.faction && event.faction !== 'neutral') {
        return false;
      }

      return true;
    });
  }

  // Select random event based on weights and rarity
  selectRandomEvent(gameState: any): GameEvent | null {
    const availableEvents = this.getAvailableEvents(gameState);

    if (availableEvents.length === 0) return null;

    // Calculate total weight
    const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
    if (totalWeight <= 0) {
      return null;
    }

    // Random selection based on weight
    let random = Math.random() * totalWeight;

    for (const event of availableEvents) {
      random -= event.weight;
      if (random <= 0) {
        this.eventHistory.push(event.id);
        // Keep history reasonable length
        if (this.eventHistory.length > 20) {
          this.eventHistory = this.eventHistory.slice(-15);
        }
        const conditionalChance = event.weight / totalWeight;
        const triggerChance = this.baseEventChance * conditionalChance;
        return {
          ...event,
          conditionalChance,
          triggerChance,
        };
      }
    }

    // Fallback to first available event
    const fallback = availableEvents[0];
    const conditionalChance = fallback.weight / totalWeight;
    const triggerChance = this.baseEventChance * conditionalChance;
    return {
      ...fallback,
      conditionalChance,
      triggerChance,
    };
  }

  getBaseEventChance(): number {
    return this.baseEventChance;
  }

  calculateConditionalChance(event: GameEvent, availableEvents: GameEvent[]): number {
    const totalWeight = availableEvents.reduce((sum, current) => sum + current.weight, 0);
    if (totalWeight <= 0) {
      return 0;
    }
    return event.weight / totalWeight;
  }

  calculateTriggerChance(event: GameEvent, availableEvents: GameEvent[]): number {
    const conditional = this.calculateConditionalChance(event, availableEvents);
    return this.baseEventChance * conditional;
  }

  // Get events by rarity for testing/debugging
  getEventsByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'legendary'): GameEvent[] {
    return EVENT_DATABASE.filter(event => event.rarity === rarity);
  }

  // Get events by type
  getEventsByType(type: string): GameEvent[] {
    return EVENT_DATABASE.filter(event => event.type === type);
  }

  // Force trigger specific event (for testing)
  triggerEvent(eventId: string): GameEvent | null {
    const event = EVENT_DATABASE.find(e => e.id === eventId);
    if (event) {
      this.eventHistory.push(event.id);
      return event;
    }
    return null;
  }

  // Get event statistics
  getEventStats() {
    const stats = {
      total: EVENT_DATABASE.length,
      common: EVENT_DATABASE.filter(e => e.rarity === 'common').length,
      uncommon: EVENT_DATABASE.filter(e => e.rarity === 'uncommon').length,
      rare: EVENT_DATABASE.filter(e => e.rarity === 'rare').length,
      legendary: EVENT_DATABASE.filter(e => e.rarity === 'legendary').length,
      byType: {} as Record<string, number>
    };

    EVENT_DATABASE.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    });

    return stats;
  }

  // Clear event history (for new game)
  reset() {
    this.eventHistory = [];
    this.turnCount = 0;
  }

  // Get state-specific events for a state
  getStateEvents(stateId: string): GameEvent[] {
    return STATE_EVENTS_DATABASE[stateId] || [];
  }

  // Select random state event for a captured state
  selectStateEvent(stateId: string, capturingFaction: string, gameState: any): GameEvent | null {
    const stateEvents = this.getStateEvents(stateId);
    if (!stateEvents.length) return null;

    // Filter events based on capturing faction and conditions
    const availableEvents = stateEvents.filter(event => {
      if (event.conditions?.capturedBy && event.conditions.capturedBy !== capturingFaction) {
        return false;
      }
      
      // Check if event has already been triggered recently (simplified)
      const eventKey = `${stateId}_${event.id}`;
      if (this.eventHistory.includes(eventKey)) {
        return false; // Don't repeat same state event
      }

      return true;
    });

    if (!availableEvents.length) return null;

    // Select weighted random event
    const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (const event of availableEvents) {
      randomValue -= event.weight;
      if (randomValue <= 0) {
        // Mark event as used
        const eventKey = `${stateId}_${event.id}`;
        this.eventHistory.push(eventKey);
        return event;
      }
    }

    return availableEvents[0]; // Fallback
  }
}
