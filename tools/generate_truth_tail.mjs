import { writeFileSync } from 'node:fs';

const startId = 101;
const endId = 200;

const states = [
  { city: 'Provo', state: 'Utah', landscape: 'red rock foothills' },
  { city: 'Burlington', state: 'Vermont', landscape: 'snow-dusted lakefront' },
  { city: 'Roanoke', state: 'Virginia', landscape: 'Blue Ridge valley' },
  { city: 'Spokane', state: 'Washington', landscape: 'spruce-lined river gorge' },
  { city: 'Wheeling', state: 'West Virginia', landscape: 'foggy Appalachian ridge' },
  { city: 'Madison', state: 'Wisconsin', landscape: 'capitol skyline' },
  { city: 'Sheridan', state: 'Wyoming', landscape: 'rolling prairie' },
  { city: 'Mobile', state: 'Alabama', landscape: 'humid bayfront' },
  { city: 'Nome', state: 'Alaska', landscape: 'icy coastline' },
  { city: 'Yuma', state: 'Arizona', landscape: 'desert horizon' },
  { city: 'Little Rock', state: 'Arkansas', landscape: 'riverwalk district' },
  { city: 'Redding', state: 'California', landscape: 'pine-covered hills' },
  { city: 'Fort Collins', state: 'Colorado', landscape: 'foothill campus' },
  { city: 'Bridgeport', state: 'Connecticut', landscape: 'industrial harbor' },
  { city: 'Dover', state: 'Delaware', landscape: 'colonial square' },
  { city: 'Orlando', state: 'Florida', landscape: 'theme park skyline' },
  { city: 'Savannah', state: 'Georgia', landscape: 'oak-lined square' },
  { city: 'Hilo', state: 'Hawaii', landscape: 'rainforest coast' },
  { city: 'Boise', state: 'Idaho', landscape: 'sagebrush foothills' },
  { city: 'Peoria', state: 'Illinois', landscape: 'riverfront warehouses' },
  { city: 'Fort Wayne', state: 'Indiana', landscape: 'canal district' },
  { city: 'Cedar Rapids', state: 'Iowa', landscape: 'grain silos' },
  { city: 'Topeka', state: 'Kansas', landscape: 'statehouse dome' },
  { city: 'Lexington', state: 'Kentucky', landscape: 'horse farms' },
  { city: 'Lake Charles', state: 'Louisiana', landscape: 'bayou refineries' },
  { city: 'Bangor', state: 'Maine', landscape: 'foggy riverbank' },
  { city: 'Annapolis', state: 'Maryland', landscape: 'naval harbor' },
  { city: 'Springfield', state: 'Massachusetts', landscape: 'brick mills' },
  { city: 'Flint', state: 'Michigan', landscape: 'industrial skyline' },
  { city: 'Duluth', state: 'Minnesota', landscape: 'port cliffs' },
  { city: 'Biloxi', state: 'Mississippi', landscape: 'casino coast' },
  { city: 'Columbia', state: 'Missouri', landscape: 'college quad' },
  { city: 'Billings', state: 'Montana', landscape: 'rimrock bluffs' },
  { city: 'Lincoln', state: 'Nebraska', landscape: 'prairie capitol' },
  { city: 'Reno', state: 'Nevada', landscape: 'desert neon' },
  { city: 'Portsmouth', state: 'New Hampshire', landscape: 'seaside pier' },
  { city: 'Trenton', state: 'New Jersey', landscape: 'statehouse steps' },
  { city: 'Taos', state: 'New Mexico', landscape: 'high desert mesa' },
  { city: 'Syracuse', state: 'New York', landscape: 'snowy downtown' },
  { city: 'Fargo', state: 'North Dakota', landscape: 'prairie skyline' },
  { city: 'Dayton', state: 'Ohio', landscape: 'airfield museum' },
  { city: 'Tulsa', state: 'Oklahoma', landscape: 'art deco skyline' },
  { city: 'Eugene', state: 'Oregon', landscape: 'green hills' },
  { city: 'Erie', state: 'Pennsylvania', landscape: 'lakefront docks' },
  { city: 'Providence', state: 'Rhode Island', landscape: 'riverwalk' },
  { city: 'Greenville', state: 'South Carolina', landscape: 'waterfall plaza' },
  { city: 'Rapid City', state: 'South Dakota', landscape: 'badlands edge' },
  { city: 'Chattanooga', state: 'Tennessee', landscape: 'river gorge' },
  { city: 'Lubbock', state: 'Texas', landscape: 'flat plains' },
  { city: 'Moab', state: 'Utah', landscape: 'arches canyon' },
  { city: 'Burlington', state: 'Vermont', landscape: 'snow-dusted lakefront' },
  { city: 'Norfolk', state: 'Virginia', landscape: 'naval docks' },
  { city: 'Tacoma', state: 'Washington', landscape: 'port cranes' },
  { city: 'Morgantown', state: 'West Virginia', landscape: 'mountain campus' },
  { city: 'Milwaukee', state: 'Wisconsin', landscape: 'brewery district' },
  { city: 'Jackson', state: 'Wyoming', landscape: 'tetons backdrop' },
];

const subjects = [
  {
    noun: 'feral drone choir',
    descriptor: 'a feral drone choir',
    action: 'hovered over city hall and harmonized',
    result: 'each note spelling line items across the courthouse facade',
    image: 'Night scene with swarm of drones shaped like choir formation over civic building, spotlights on startled officials',
    tags: ['technology', 'music', 'exposure'],
    followVerb: 'broadcasts',
  },
  {
    noun: 'subterranean library of cicadas',
    descriptor: 'a subterranean library of cicadas',
    action: 'crawled out of storm drains reciting statutes',
    result: 'their wing beats flipping pages of invisible law books in the air',
    image: 'Street-level storm drain with glowing cicadas forming book pages, pedestrians filming, newsprint style',
    tags: ['insects', 'law', 'prophecy'],
    followVerb: 'chirps',
  },
  {
    noun: 'rogue barista collective',
    descriptor: 'a rogue barista collective',
    action: 'sprayed latte art across courthouse steps',
    result: 'foam patterns revealing encrypted badge numbers',
    image: 'Coffee carts lined up outside courthouse spraying latte art across marble steps, officials stunned',
    tags: ['coffee', 'activism', 'exposure'],
    followVerb: 'steams',
  },
  {
    noun: 'time-traveling farmers market',
    descriptor: 'a time-traveling farmers market',
    action: 'popped into existence between parking meters',
    result: 'vendors handing out produce labeled with tomorrow’s committee agendas',
    image: 'Pop-up market with glowing tents between cars, signs listing future agendas, shoppers surprised',
    tags: ['market', 'time-anomaly', 'community'],
    followVerb: 'reappears',
  },
  {
    noun: 'mirror-plated marching band',
    descriptor: 'a mirror-plated marching band',
    action: 'paraded backward through downtown',
    result: 'reflections flashing classified memos in Morse code',
    image: 'Marching band with mirrored uniforms reflecting secret documents, city skyline background',
    tags: ['music', 'reflection', 'secrets'],
    followVerb: 'rehearses',
  },
  {
    noun: 'astral projection book club',
    descriptor: 'an astral projection book club',
    action: 'phased through locked meeting rooms',
    result: 'leaving sticky notes glowing with unresolved votes',
    image: 'Spectral readers floating through conference room glass leaving glowing notes behind',
    tags: ['ghost', 'politics', 'community'],
    followVerb: 'materializes',
  },
  {
    noun: 'sentient pothole network',
    descriptor: 'a sentient pothole network',
    action: 'aligned down the avenue',
    result: 'forming arrows toward a hidden budget vault',
    image: 'City street with glowing potholes forming arrow, drivers shocked',
    tags: ['infrastructure', 'exposure', 'urban'],
    followVerb: 'rearranges',
  },
  {
    noun: 'multilingual thunderhead',
    descriptor: 'a multilingual thunderhead',
    action: 'hovered over the civic center',
    result: 'translating public comments into classified clearance codes',
    image: 'Thundercloud above civic building with lightning forming words, residents recording',
    tags: ['weather', 'translation', 'civic'],
    followVerb: 'drifts',
  },
  {
    noun: 'cryptid-led neighborhood watch',
    descriptor: 'a cryptid-led neighborhood watch',
    action: 'knocked on every door at midnight',
    result: 'handing out zines on missing appropriations',
    image: 'Friendly cryptids distributing pamphlets on suburban street, porch lights on',
    tags: ['cryptid', 'community', 'exposure'],
    followVerb: 'organizes',
  },
  {
    noun: 'retro-futurist ice cream truck',
    descriptor: 'a retro-futurist ice cream truck',
    action: 'parked outside the data center',
    result: 'serving sundaes that melt into flow charts',
    image: 'Vintage ice cream truck with neon panels melting sundaes into diagrams, tech campus background',
    tags: ['food', 'technology', 'exposure'],
    followVerb: 'circles',
  },
];

const scandals = [
  {
    topic: 'shadow infrastructure bond swaps',
    detail: 'a hidden ledger detailing shadow infrastructure bond swaps and the officials skimming the vigorish',
    officialSpin: 'they were conducting a routine pothole survey',
    irony: 'the potholes spelled out the phrase "WE KNOW" in fresh asphalt',
    follow1: 'anonymous envelopes with embossed bond coupons arrive at sunrise',
    follow2: 'Local radio DJ plays a traffic report that doubles as swap rates',
  },
  {
    topic: 'interdimensional tourism tax',
    detail: 'receipts for an interdimensional tourism tax funneled into a private beach house',
    officialSpin: 'the event was part of a creative commerce activation',
    irony: 'the beach house livestream accidentally projected onto the courthouse dome',
    follow1: 'tourism brochures start advertising "visas for alternate timelines"',
    follow2: 'Audit letters sprout coral whenever someone claims per diem',
  },
  {
    topic: 'ghost payroll for imaginary consultants',
    detail: 'a payroll roster for consultants who are technically imaginary friends of the mayor',
    officialSpin: 'it must be an immersive theater troupe',
    irony: 'the imaginary friends show up to demand dental coverage',
    follow1: 'city HR portal adds dropdown option for "spectral hire"',
    follow2: 'Budget meetings include a chair reserved for invisible advisors',
  },
  {
    topic: 'classified tunnel expansion',
    detail: 'blueprints for a classified tunnel expansion connecting to a casino basement',
    officialSpin: 'they were celebrating National Tunnel Appreciation Week',
    irony: 'casino loudspeakers blared the tunnel dimensions in polka rhythm',
    follow1: 'slot machines now jackpot whenever inspectors walk by',
    follow2: 'Underground tour guides advertise "double secret" routes',
  },
  {
    topic: 'synthetic weather futures',
    detail: 'a spreadsheet pricing synthetic weather futures sold to lobbyists',
    officialSpin: 'the charts represented a student science fair',
    irony: 'the science fair trophies morphed into subpoenas mid-award',
    follow1: 'forecast app pushes alerts labeled "probability of perjury"',
    follow2: 'Lobbyists carry umbrellas that display insider trading tips',
  },
  {
    topic: 'cryptid relocation slush fund',
    detail: 'travel itineraries for relocating cryptids to swing districts',
    officialSpin: 'they were filming a nature documentary',
    irony: 'the cryptids refused to sign release forms without voting rights',
    follow1: 'campaign mailers now include paw print endorsements',
    follow2: 'Wildlife cameras capture stump speeches delivered in hoots',
  },
  {
    topic: 'temporal zoning variance',
    detail: 'notarized requests for temporal zoning variances that backdate luxury condos',
    officialSpin: 'it was a rehearsal for a historical reenactment',
    irony: 'the reenactors issued real eviction notices from 1894',
    follow1: 'zoning board meetings now require hourglasses as public comment timers',
    follow2: 'Construction cranes briefly appear in sepia tone during golden hour',
  },
  {
    topic: 'aquifer privatization scheme',
    detail: 'hydrology models carving up the aquifer between three shell LLCs',
    officialSpin: 'it was an educational exhibit on water literacy',
    irony: 'the exhibit leaked actual water spelling the LLC names down the stairs',
    follow1: 'garden hoses hiss warnings when connected to unpermitted valves',
    follow2: 'Homeowners receive coupons for "BYO-Subpoena" rain barrels',
  },
  {
    topic: 'synthetic influencer factory',
    detail: 'design specs for synthetic influencers assigned to boost incumbents',
    officialSpin: 'just a brainstorming workshop for civics TikToks',
    irony: 'the influencers started endorsing rival candidates mid-stream',
    follow1: 'ring lights flicker Morse code for campaign finance rules',
    follow2: 'Teen focus groups demand royalties for deepfake cameos',
  },
  {
    topic: 'telepathic toll road pilot',
    detail: 'contracts for a telepathic toll road pilot that charges drivers by intrusive thoughts',
    officialSpin: 'a mindfulness study accidentally filed under transportation',
    irony: 'the toll booths blush bright red whenever someone fibs',
    follow1: 'drivers wear tinfoil visors marketed as "privacy EZ-pass"',
    follow2: 'State psychologists publish pamphlets on resisting psychic tolls',
  },
];

const witnessRoles = [
  'municipal archivist',
  'volunteer paramedic',
  'cafeteria manager',
  'freelance muralist',
  'parkour instructor',
  'synesthetic meteorologist',
  'night-shift bus driver',
  'undercover baritone',
  'retired codebreaker',
  'local youth pastor',
];

const witnessFirst = ['Alex', 'Brielle', 'Cass', 'Dev', 'Elena', 'Frankie', 'Gia', 'Hector', 'Imani', 'Jules', 'Kian', 'Lark', 'Milo', 'Nia', 'Owen', 'Pilar', 'Quinn', 'Ravi', 'Sage', 'Taryn'];
const witnessLast = ['Monroe', 'Alvarez', 'Chen', 'Dixon', 'Escobar', 'Foley', 'Grayson', 'Hale', 'Ingram', 'Jenkins', 'Kaufman', 'Lopez', 'Murdock', 'Nguyen', 'Osborne', 'Patel', 'Quintero', 'Ridge', 'Sato', 'Talbot'];

const agencies = [
  { name: 'Department of Plausible Deniability', response: 'issued a press release claiming nothing unusual happened except a "community engagement opportunity"' },
  { name: 'Office of Emergency Optics', response: 'handed out branded sunglasses and insisted everyone had simply stared too hard at democracy' },
  { name: 'Bureau of Narrative Compliance', response: 'classified the incident as an unauthorized storytelling exercise and urged calm' },
  { name: 'Division of Strategic Silence', response: 'told reporters the noise was actually a mindfulness exercise and confiscated microphones' },
  { name: 'Department of Civic Futures', response: 'called the spectacle a beta test for participatory budgeting 2.0 while unplugging extension cords' },
  { name: 'Agency for Harmonized Infrastructure', response: 'blamed a software update and recommended everyone delete their memories between 2 and 4 AM' },
  { name: 'Office of Aquifer Moderation', response: 'declared the water table emotionally distressed and asked citizens to hydrate quietly' },
  { name: 'Committee on Chronology and Stuff', response: 'suggested everyone reset their watches and stop asking pesky timeline questions' },
  { name: 'Directorate of Influencer Integrity', response: 'praised the initiative as a "transparency collab" while deactivating comment sections' },
  { name: 'Council for Telepathic Transportation', response: 'said any perception of privacy invasion was purely imaginary and handed out stress balls' },
];

function pick(arr, idx, step = 1) {
  return arr[(idx * step) % arr.length];
}

function buildWitnessName(idx) {
  const first = pick(witnessFirst, idx, 3);
  const last = pick(witnessLast, idx, 7);
  return `${first} ${last}`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripArticle(text) {
  return text.replace(/^(a |an )/i, '');
}

const entries = [];

for (let id = startId; id <= endId; id += 1) {
  const index = id - startId;
  const locale = pick(states, index, 5);
  const subject = pick(subjects, index, 3);
  const scandal = pick(scandals, index, 4);
  const witnessRole = pick(witnessRoles, index, 2);
  const witnessName = buildWitnessName(index);
  const agency = pick(agencies, index, 5);

  const headline = `${locale.state.toUpperCase()} ${subject.noun.toUpperCase()} EXPOSES ${scandal.topic.toUpperCase()}`;
  const subhead = capitalize(`${subject.descriptor.replace('a ', '').replace('an ', '')} reveals ${scandal.topic} despite official denials`);

  const paragraph1 = `Residents in ${locale.city}, ${locale.state}, watched as ${subject.descriptor} ${subject.action}, ${subject.result}. Witnesses say the spectacle highlighted ${scandal.detail}.`;
  const paragraph2 = `${capitalize(witnessRole)} ${witnessName} wiped glittering residue off their clipboard and told the Paranoid Times, "${stripArticle(subject.noun).replace(/\b./g, ch => ch.toUpperCase())} never shows up unless the numbers lie." ${witnessName.split(' ')[0]} added that even their ${locale.landscape} seemed to shimmer with footnotes.`;
  const paragraph3 = `Officials from the ${agency.name} ${agency.response}, even as ${scandal.irony}. Locals now trade push notifications describing which committee panic-bought white noise machines.`;

  const body = [paragraph1, '', paragraph2, '', paragraph3].join('\n');

  const followUps = [
    `${capitalize(stripArticle(subject.noun))} ${subject.followVerb} reminders that ${scandal.follow1}`,
    `${scandal.follow2}`,
  ];

  const entry = {
    cardId: `TRUTH-${id.toString().padStart(3, '0')}`,
    faction: 'truth',
    headline,
    subhead,
    byline: `By ${witnessName}, Field Correspondent`,
    body,
    imagePrompt: `${subject.image}, ${locale.landscape}`,
    tags: subject.tags,
    statesMentioned: [locale.state],
    recurringCharacter: null,
    followUpHooks: followUps,
  };

  entries.push(entry);
}

const lines = entries.map(entry => {
  const props = [
    `cardId: '${entry.cardId}'`,
    `faction: 'truth'`,
    `headline: '${entry.headline.replace(/'/g, "\\'")}'`,
    `subhead: '${entry.subhead.replace(/'/g, "\\'")}'`,
    `byline: '${entry.byline.replace(/'/g, "\\'")}'`,
    `body: \`${entry.body.replace(/`/g, '\\`')}\``,
    `imagePrompt: '${entry.imagePrompt.replace(/'/g, "\\'")}'`,
    `tags: [${entry.tags.map(tag => `'${tag}'`).join(', ')}]`,
    `statesMentioned: ['${entry.statesMentioned[0]}']`,
    `recurringCharacter: null`,
    `followUpHooks: [${entry.followUpHooks.map(h => `'${h.replace(/'/g, "\\'")}'`).join(', ')}]`,
  ];
  return `  {\n    ${props.join(',\n    ')}\n  }`;
}).join(',\n');

writeFileSync('tools/truth_tail_output.ts', `${lines}\n`);
