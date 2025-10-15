import type { CardArticle } from './articleDatabase';

/**
 * Cryptid-Specific Article Variants
 * Alternative articles for cryptid-themed cards
 * These provide variety when the same card is played multiple times
 */

export const cryptidArticleVariants: CardArticle[] = [
  // Bigfoot Variants
  {
    cardId: 'TRUTH-001-V2',
    faction: 'truth',
    headline: 'BIGFOOT DNA SAMPLE CONFIRMED BY THREE INDEPENDENT LABS',
    subhead: 'Hair follicles show 97.3% human, 2.7% "unknown primate" genetic markers',
    byline: 'By Dr. Helena Frost, Science Correspondent',
    body: `A hair sample recovered from a tree branch in Northern California has undergone rigorous DNA analysis at three separate laboratories, all returning the same startling conclusion: the source is neither fully human nor any known primate species.

"The mitochondrial DNA shows markers we've never seen before," explained Dr. Margaret Chen of the Independent Genetics Institute. "It's as if evolution took a different branch—one that was never documented. This isn't contamination. This isn't a hoax. This is biological evidence of something we can't classify."

The sample was collected by amateur cryptozoologist Kent Briggs during an expedition to document footprints. "I was looking for prints and found this," Briggs said. "Long, coarse hair snagged on bark about eight feet off the ground. No bear reaches that high, and no human has hair this thick."

The Bureau of Wildlife Management has declined to comment, citing "ongoing internal review of anomalous samples." Critics note this is the same agency that classified a clear Bigfoot photograph as "a very tall, bipedal bear" last month.`,
    imagePrompt: 'Scientific laboratory setting with DNA sequencing equipment, glowing samples in test tubes, newsprint documentary style',
    tags: ['cryptid', 'science', 'evidence', 'bigfoot'],
    statesMentioned: ['California'],
    recurringCharacter: 'Dr. Helena Frost',
    followUpHooks: [
      'Dr. Chen receives anonymous warning to stop publicizing results',
      'Two more laboratories confirm findings before mysteriously losing samples'
    ]
  },
  {
    cardId: 'TRUTH-001-V3',
    headline: 'BIGFOOT FAMILY PHOTOGRAPHED IN WASHINGTON STATE—CUBS VISIBLE',
    subhead: 'Trail camera captures three individuals, suggesting sustainable breeding population',
    byline: 'By Marcus Webb, Cryptid Correspondent',
    body: `A motion-activated trail camera in Olympic National Forest has captured what cryptozoologists are calling the "discovery of the century": clear footage of what appears to be a Bigfoot family unit, including two smaller individuals consistent with juvenile specimens.

The 47-second video, recorded at 3:17 AM on September 12th, shows three bipedal figures moving through a clearing. Two larger individuals flank a smaller one, appearing to guide it through dense underbrush. All three exhibit the characteristic gait, posture, and proportions described in thousands of sighting reports.

"This changes everything," said Dr. Jeffrey Meldrum, Professor of Anatomy. "A breeding population means they're not isolated individuals. It means there's a viable species, with social structure, parenting behavior, and a sustainable gene pool. This is primatology history."

The camera's owner, forest ranger Sarah Mitchell, installed the device to monitor elk migration. "I nearly deleted it," Mitchell admitted. "Thought it was people in costumes. But then I watched frame by frame—the muscle movement, the flexibility of the joints, the way the small one hesitates and gets reassured. That's not actors. That's a family."

Federal agencies have not responded to requests for comment. The camera's GPS data and timestamps have been verified by independent analysts.`,
    faction: 'truth',
    imagePrompt: 'Grainy night-vision trail camera footage showing three dark bipedal figures in forest clearing, motion blur, greenish night vision tint',
    tags: ['cryptid', 'bigfoot', 'family', 'evidence', 'discovery'],
    statesMentioned: ['Washington'],
    recurringCharacter: null,
    followUpHooks: [
      'Sarah Mitchell placed on administrative leave, camera confiscated',
      'Olympic National Forest closed to public "for routine maintenance"'
    ]
  },

  // Bat Boy Variants
  {
    cardId: 'TRUTH-004-V2',
    faction: 'truth',
    headline: 'BAT BOY WINS FIRST POLITICAL DEBATE—POLLS SHOW 67% APPROVAL',
    subhead: 'Cryptid candidate uses echolocation to fact-check opponent in real-time',
    byline: 'By Jennifer Cross, Political Oddities Reporter',
    body: `In what pundits are calling the most unusual political debate in Virginia history, cryptid-American candidate Bat Boy decisively won last night's Senate race forum by employing his natural sonar abilities to detect and expose his opponent's inconsistencies.

"Every time Senator Hughes made a claim, Bat Boy's ears would twitch, and he'd immediately cite the contradictory voting record," explained debate moderator Lisa Thornton. "It was like watching a living lie detector. Hughes claimed he voted for infrastructure—Bat Boy's sonar picked up his elevated heart rate and called him out with the actual bill number he voted against."

The unorthodox strategy has resonated with voters. Post-debate polling shows Bat Boy's approval jumped from 34% to 67% overnight. His campaign slogan, "I literally see through walls—imagine what I'll do with classified documents," has become a viral meme.

Political analysts are struggling to categorize the phenomenon. "He's tapping into something primal," said Dr. Morton Riggs of Georgetown University. "Voters are tired of being lied to. Bat Boy can't lie—his own echolocation gives him away. There's an authenticity there, even if he squeaks when excited."

Senator Hughes's campaign declined to comment, issuing only a terse statement: "We respect all candidates, regardless of species."`,
    imagePrompt: 'Political debate stage with podiums, Bat Boy at microphone with large ears, crowd cheering, political poster aesthetic',
    tags: ['politics', 'cryptid', 'debate', 'transparency', 'bat-boy'],
    statesMentioned: ['Virginia'],
    recurringCharacter: 'Bat Boy',
    articleVariant: 'bat_boy_stage_1',
    followUpHooks: [
      'Major donors pledge $2M to Bat Boy campaign after debate performance',
      'Opponent demands "species verification" for ballot eligibility'
    ]
  },

  // Mothman Variants
  {
    cardId: 'TRUTH-093-V2',
    faction: 'truth',
    headline: 'MOTHMAN SPOTTED HOURS BEFORE BRIDGE COLLAPSE—LOCALS DEMAND ANSWERS',
    subhead: 'Eyewitnesses report red-eyed creature circling infrastructure hours before failure',
    byline: 'By Daniel Rivers, Cryptid Crisis Reporter',
    body: `Multiple residents of Point Pleasant, West Virginia, reported sightings of the infamous Mothman circling the Route 2 bridge in the hours before its catastrophic collapse Thursday morning. No casualties were reported, but the timing has reignited decades-old debates about the creature's prophetic abilities.

"I saw it at 4 AM when I was driving to work," said truck driver Raymond Colt. "Those red eyes, wingspan had to be ten feet. It was circling the bridge supports, over and over, like it was trying to warn us. I called the police. They told me to go home and sleep it off."

At 9:47 AM, a support cable snapped, causing a partial collapse of the bridge's westbound lanes. Emergency closures prevented what engineers say would have been "a mass casualty event during rush hour."

This marks the seventh time Mothman has been sighted before a major infrastructure failure in the region. The pattern dates back to the Silver Bridge disaster of 1967, when 46 people died after the creature was reportedly seen for weeks beforehand.

"At what point do we stop calling it superstition and start calling it data?" asked Dr. Emily Thorne, Fortean researcher. "Seven events. Seven prior sightings. That's not coincidence—that's correlation begging for investigation."

The West Virginia Department of Transportation has announced an "accelerated inspection schedule" for all bridges in the area. Asked if Mothman sightings would be considered in their risk assessment, a spokesperson replied: "Next question."`,
    imagePrompt: 'Dark bridge at night with large winged silhouette circling overhead, glowing red eyes, ominous atmosphere, newsprint horror aesthetic',
    tags: ['mothman', 'cryptid', 'prophecy', 'infrastructure', 'warning'],
    statesMentioned: ['West Virginia'],
    recurringCharacter: null,
    followUpHooks: [
      'Three more bridges in the region fail inspection after Mothman sightings',
      'Department of Transportation creates anonymous "Mothman Hotline" for tips'
    ]
  },

  // Beast of Bray Road Variant
  {
    cardId: 'TRUTH-BEAST-001',
    faction: 'truth',
    headline: 'WISCONSIN WEREWOLF TERRORIZES RURAL COMMUNITIES—FIFTH ATTACK THIS MONTH',
    subhead: 'Beast of Bray Road sightings surge as local sheriff refuses federal assistance',
    byline: 'By Thomas Granger, Cryptid Attack Reporter',
    body: `Residents of rural Elkhorn, Wisconsin, are demanding action after the fifth reported encounter with the so-called "Beast of Bray Road" in less than thirty days. The wolf-like bipedal creature has been spotted on three separate county roads, always between midnight and 4 AM, always targeting lone vehicles.

"It charged my truck," said dairy farmer Michael Kowalski, whose vehicle bears deep claw marks on the driver's side door. "Stood on two legs, had to be seven feet tall, covered in matted gray fur. Eyes reflected my headlights—yellow, like a wolf, but positioned forward like a human. It hit the door so hard it dented the frame. I floored it."

Sheriff Thomas Bradley has documented nineteen credible sightings since August, all matching the same description: bipedal, wolf-like features, aggressive behavior toward vehicles, immense strength. Yet when the FBI offered assistance, Bradley declined.

"This is a local matter," Bradley told the Paranoid Times. "We know these roads. We know these people. Federal agents would just scare folks and turn this into a circus. We're handling it."

Critics point out that "handling it" has thus far consisted of increased patrols and a public advisory to "avoid rural roads after dark." No tracking efforts have been authorized, and no official investigation has been launched.

Local hunting clubs have organized their own expeditions, despite warnings from wildlife officials. "If the government won't protect us," said expedition leader Dale Winters, "we'll protect ourselves."`,
    imagePrompt: 'Rural Wisconsin road at night, large wolf-like creature on two legs attacking truck, headlight beams, dramatic action pose',
    tags: ['beast-of-bray-road', 'werewolf', 'cryptid', 'wisconsin', 'attack'],
    statesMentioned: ['Wisconsin'],
    recurringCharacter: null,
    followUpHooks: [
      'Hunting expedition disappears, only vehicle found abandoned with claw marks',
      'Sheriff Bradley admits to having encountered the creature himself in 2003'
    ]
  },

  // Jersey Devil Variant
  {
    cardId: 'TRUTH-NEW-011-V2',
    faction: 'truth',
    headline: 'JERSEY DEVIL NEST DISCOVERED IN PINE BARRENS—EGGS INTACT',
    subhead: 'Amateur cryptozoologists find evidence of breeding site, quickly cordoned off by state police',
    byline: 'By Rachel Mendoza, Cryptid Nesting Reporter',
    body: `A team of amateur researchers has discovered what they claim is an active Jersey Devil nesting site deep in New Jersey's Pine Barrens, complete with three large eggs and signs of recent habitation. Within hours of reporting their find, the area was surrounded by state police and declared off-limits to civilians.

"We found bones—deer, mostly—arranged in a pattern around this hollowed-out oak tree," said expedition member Travis Chen. "Then we saw the eggs. Each one the size of a football, leathery texture, pulsing slightly like they're... alive. We took photos and GPS coordinates, called the authorities. They showed up with tactical gear."

The eggs, if authentic, would represent the first physical proof of Jersey Devil reproduction in the creature's 200-year documented history. Folklore has long described the Devil as a cursed thirteenth child, but a breeding population would suggest a natural species.

Professor Angela Hartley, cryptozoology expert, examined the expedition's photos before the site was sealed. "The scale patterns on those eggs don't match any known bird or reptile," Hartley confirmed. "They're consistent with witness descriptions of the Devil's hide—leathery, almost reptilian, but with a unique cellular structure."

New Jersey State Police have erected a perimeter around a twelve-acre section of the Pine Barrens, citing "environmental hazard assessment." No official explanation has been provided for the nature of the hazard, and requests to interview officers at the scene have been denied.

The expedition team has received anonymous threats warning them to "stop talking to the press." All four members have since hired legal representation.`,
    imagePrompt: 'Deep forest nest in hollow tree, large leathery eggs, cryptid researcher photographing scene, police tape in background',
    tags: ['jersey-devil', 'cryptid', 'nest', 'eggs', 'new-jersey', 'breeding'],
    statesMentioned: ['New Jersey'],
    recurringCharacter: null,
    followUpHooks: [
      'Satellite imagery shows unusual heat signatures around nesting site',
      'Two expedition members vanish after attempting to return to site at night'
    ]
  },

  // Chupacabra Variant
  {
    cardId: 'TRUTH-CHUPACABRA-001',
    faction: 'truth',
    headline: 'TEXAS RANCHER CAPTURES CHUPACABRA ON VIDEO—DRAINING LIVESTOCK IN REAL-TIME',
    subhead: 'HD footage shows creature methodically exsanguinating goat, defying natural explanation',
    byline: 'By Carlos Ramirez, Southwest Cryptid Correspondent',
    body: `A South Texas rancher's security camera has captured the first high-definition video of a Chupacabra actively feeding, ending decades of debate about the creature's existence and hunting methods. The footage is as disturbing as it is scientifically valuable.

The 11-minute video, recorded at Del Rio rancher Miguel Sandoval's property, shows a hairless, gray-skinned quadruped approaching a penned goat at 2:34 AM. The creature, roughly the size of a coyote but with distinctly different anatomy, latches onto the goat's neck and remains motionless for seven minutes.

"It doesn't tear or bite," explained veterinarian Dr. Lisa Tran, who analyzed the footage. "It appears to insert something—possibly specialized teeth or a tubular appendage—and simply drains the blood. The goat doesn't struggle after the initial contact, suggesting either paralytic venom or extreme shock. We've never seen anything like this in known predatory behavior."

When Sandoval found the goat the next morning, it was completely drained of blood, with two small puncture wounds but no other trauma. "People have been calling me crazy for twenty years," Sandoval said. "Every rancher down here has lost animals this way. Now we have proof."

The video has been authenticated by three independent video forensics experts. Texas Parks & Wildlife has issued a statement saying they are "reviewing the footage" but offered no further comment. Meanwhile, Sandoval has received multiple offers to purchase the video, all of which he has declined.

"This isn't for sale," Sandoval said. "This is evidence. Everyone needs to see it."`,
    imagePrompt: 'Security camera infrared footage of hairless cryptid creature feeding on goat in pen, grainy night vision green tint, timestamp visible',
    tags: ['chupacabra', 'cryptid', 'texas', 'video', 'evidence', 'feeding'],
    statesMentioned: ['Texas'],
    recurringCharacter: null,
    followUpHooks: [
      'Neighboring ranches report surge in chupacabra sightings after video goes viral',
      'Federal agents visit Sandoval\'s property, camera footage mysteriously corrupts after their visit'
    ]
  }
];

/**
 * Get variant article by base card ID and variant number
 */
export function getVariantArticle(baseCardId: string, variantNumber: number): CardArticle | null {
  const variantId = `${baseCardId}-V${variantNumber}`;
  return cryptidArticleVariants.find(article => article.cardId === variantId) ?? null;
}

/**
 * Get all variants for a base card ID
 */
export function getAllVariants(baseCardId: string): CardArticle[] {
  return cryptidArticleVariants.filter(article => article.cardId.startsWith(baseCardId + '-V'));
}

/**
 * Check if a card has variants available
 */
export function hasVariants(cardId: string): boolean {
  return getAllVariants(cardId).length > 0;
}
