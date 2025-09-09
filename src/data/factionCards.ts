import type { GameCard } from '@/components/game/GameHand';

// Truth Seekers Exclusive Cards (50 cards)
export const TRUTH_SEEKERS_CARDS: GameCard[] = [
  // MEDIA (15 cards)
  { id: 'ts_media_1', name: 'Florida Man Marries Alien Bride', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Unlicensed union.", flavorTruth: "Love conquers dimensions!" },
  { id: 'ts_media_2', name: 'Bigfoot Testifies Before Congress', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +15', flavorGov: "Witness credibility questionable.", flavorTruth: "Finally, the truth comes out!" },
  { id: 'ts_media_3', name: 'Time Traveler Selfie 2036', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Obviously doctored photo.", flavorTruth: "Proof of temporal displacement!" },
  { id: 'ts_media_4', name: 'Elvis Opens Portal in Vegas Chapel', type: 'MEDIA', cost: 4, rarity: 'uncommon', text: 'Truth +20', flavorGov: "Impersonator with special effects.", flavorTruth: "The King never died!" },
  { id: 'ts_media_5', name: 'Loch Ness Monster Found in Jacuzzi', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Inflatable prop confirmed.", flavorTruth: "Nessie just wants to relax!" },
  { id: 'ts_media_6', name: 'Bat Boy Elected Mayor', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Campaign fraud investigation.", flavorTruth: "Democracy in action!" },
  { id: 'ts_media_7', name: 'Psychic Chicken Predicts Stock Market', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Random pecking patterns.", flavorTruth: "Better than Wall Street!" },
  { id: 'ts_media_8', name: 'Haunted Toaster Speaks Prophecy', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Faulty wiring static.", flavorTruth: "Spirits speak through appliances!" },
  { id: 'ts_media_9', name: 'Flat Earth Cruise Falls Off Map', type: 'MEDIA', cost: 4, rarity: 'uncommon', text: 'Truth +15', flavorGov: "Navigation error.", flavorTruth: "They found the edge!" },
  { id: 'ts_media_10', name: 'Crystal WiFi Router Activated', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "New age marketing scam.", flavorTruth: "Pure energy frequencies!" },
  { id: 'ts_media_11', name: 'Crop Circle WiFi Signal', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Pranksters with GPS.", flavorTruth: "Alien internet hotspot!" },
  { id: 'ts_media_12', name: 'Alien Baby Born in Iowa', type: 'MEDIA', cost: 4, rarity: 'rare', text: 'Truth +20', flavorGov: "Birth defect, nothing more.", flavorTruth: "Next generation arrived!" },
  { id: 'ts_media_13', name: 'Ghost Hackers Release Emails', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Sophisticated cyber attack.", flavorTruth: "Dead tell no lies!" },
  { id: 'ts_media_14', name: 'UFO in Google Maps Street View', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth +10', flavorGov: "Camera lens flare.", flavorTruth: "Can't hide from satellites!" },
  { id: 'ts_media_15', name: 'Florida Man Declares Himself President', type: 'MEDIA', cost: 4, rarity: 'legendary', text: 'Truth +30', flavorGov: "Psychiatric hold.", flavorTruth: "Honest leadership!" },
  
  // ZONE (15 cards)  
  { id: 'ts_zone_1', name: 'Elvis Chapel Portal (Vegas)', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Tourist attraction.", flavorTruth: "King opens doors to other worlds!" },
  { id: 'ts_zone_2', name: 'Bigfoot Den (Pacific Northwest)', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Wildlife preserve.", flavorTruth: "Sasquatch sanctuary!" },
  { id: 'ts_zone_3', name: 'Haunted Trailer Park (Florida)', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Low-income housing.", flavorTruth: "Ectoplasmic activity!" },
  { id: 'ts_zone_4', name: 'Bat Boy Hideout (Abandoned Mine)', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Safety hazard closed.", flavorTruth: "Underground hybrid sanctuary!" },
  { id: 'ts_zone_5', name: 'Crystal Skull Pyramid', type: 'ZONE', cost: 5, rarity: 'uncommon', text: '+1 Pressure', flavorGov: "Tourist replica.", flavorTruth: "Ancient alien power!" },
  { id: 'ts_zone_6', name: 'Alien Crop Circle HQ', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Agricultural vandalism.", flavorTruth: "Extraterrestrial comms hub!" },
  { id: 'ts_zone_7', name: 'Chupacabra Corn Maze', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Seasonal farm attraction.", flavorTruth: "Cryptid hunting grounds!" },
  { id: 'ts_zone_8', name: 'Psychic Hotline Headquarters', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Telemarketing scam.", flavorTruth: "True prophets work here!" },
  { id: 'ts_zone_9', name: 'Time Traveler Motel (Room 23)', type: 'ZONE', cost: 5, rarity: 'uncommon', text: '+1 Pressure', flavorGov: "Roadside lodging.", flavorTruth: "Temporal intersection!" },
  { id: 'ts_zone_10', name: "Florida Man's Alligator Pit", type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Illegal exotic pets.", flavorTruth: "Prehistoric guardian army!" },
  { id: 'ts_zone_11', name: 'Haunted Walmart Parking Lot', type: 'ZONE', cost: 5, rarity: 'rare', text: '+2 Pressure if Florida', flavorGov: "Retail property.", flavorTruth: "Shopping carts move themselves!" },
  { id: 'ts_zone_12', name: 'Weekly World News Office', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Tabloid headquarters.", flavorTruth: "Truth journalism!" },
  { id: 'ts_zone_13', name: 'Men in Black Karaoke Bar', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Entertainment venue.", flavorTruth: "Where agents blow off steam!" },
  { id: 'ts_zone_14', name: 'Bat Boy Theme Park Ride', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Family attraction.", flavorTruth: "Educational hybrid experience!" },
  { id: 'ts_zone_15', name: 'Crystal Cave Commune', type: 'ZONE', cost: 5, rarity: 'common', text: '+1 Pressure', flavorGov: "Hippie settlement.", flavorTruth: "Healing energy vortex!" }
  
  // ... more ATTACK and DEFENSIVE cards would go here
];

// Government Exclusive Cards (50 cards)
export const GOVERNMENT_CARDS: GameCard[] = [
  // MEDIA (15 cards)
  { id: 'gov_media_1', name: 'Operation Mockingbird 2.0', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Media assets activated.", flavorTruth: "They control the narrative!" },
  { id: 'gov_media_2', name: 'Redacted Satellite Photo', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "National security classification.", flavorTruth: "What are they hiding?" },
  { id: 'gov_media_3', name: 'Controlled Leak to Media', type: 'MEDIA', cost: 4, rarity: 'uncommon', text: 'Truth -15', flavorGov: "Strategic information release.", flavorTruth: "Planned disinformation!" },
  { id: 'gov_media_4', name: 'Psychological Warfare Broadcast', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Public service announcement.", flavorTruth: "Mind control airwaves!" },
  { id: 'gov_media_5', name: 'Fake UFO Disclosure', type: 'MEDIA', cost: 4, rarity: 'rare', text: 'Truth -20', flavorGov: "Limited disclosure protocol.", flavorTruth: "Lies mixed with truth!" },
  { id: 'gov_media_6', name: 'Manufactured Terror Alert', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Elevated security status.", flavorTruth: "Fear keeps them compliant!" },
  { id: 'gov_media_7', name: 'Spin Doctor Roundtable', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Expert panel discussion.", flavorTruth: "Professional liars!" },
  { id: 'gov_media_8', name: 'NSA Meme Suppression', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Content moderation.", flavorTruth: "Censoring our memes!" },
  { id: 'gov_media_9', name: 'Satellite Jammer Feed', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Signal interference.", flavorTruth: "Blocking alien comms!" },
  { id: 'gov_media_10', name: 'Fabricated Weather Report', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Meteorological forecast.", flavorTruth: "Hiding chemtrail ops!" },
  { id: 'gov_media_11', name: 'Plausible Press Conference', type: 'MEDIA', cost: 4, rarity: 'uncommon', text: 'Truth -15', flavorGov: "Official statement.", flavorTruth: "Crafted deception!" },
  { id: 'gov_media_12', name: 'MKULTRA TV Commercial', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Product advertisement.", flavorTruth: "Subliminal programming!" },
  { id: 'gov_media_13', name: 'AI Fact Checker Bots', type: 'MEDIA', cost: 4, rarity: 'common', text: 'Truth -10', flavorGov: "Automated verification.", flavorTruth: "Robots deciding truth!" },
  { id: 'gov_media_14', name: 'Astroturf Protest Footage', type: 'MEDIA', cost: 4, rarity: 'uncommon', text: 'Truth -15', flavorGov: "Grassroots movement.", flavorTruth: "Paid actors everywhere!" },
  { id: 'gov_media_15', name: 'Presidential Address Rewrite', type: 'MEDIA', cost: 4, rarity: 'legendary', text: 'Truth -20', flavorGov: "Executive communication.", flavorTruth: "Deep state puppet show!" }
  
  // ... more ZONE, ATTACK, DEFENSIVE cards would go here
];