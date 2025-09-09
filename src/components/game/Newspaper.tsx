import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { GameCard } from './GameHand';

interface NewsEvent {
  id: string;
  headline: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random';
  imageType?: string;
}

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
}

interface NewspaperProps {
  events: NewsEvent[];
  playedCards: PlayedCard[];
  faction: 'government' | 'truth';
  onClose: () => void;
}

const Newspaper = ({ events, playedCards, faction, onClose }: NewspaperProps) => {
  const [glitching, setGlitching] = useState(false);
  const [masthead, setMasthead] = useState('THE PARANOID TIMES');

  // Glitch masthead system - 5% chance
  useEffect(() => {
    if (Math.random() < 0.05) {
      setGlitching(true);
      const glitchMastheads = [
        'THE SHEEPLE DAILY',
        'AREA 51 DIGEST',
        'BAT BOY BULLETIN', 
        'CHEMTRAIL COURIER',
        'ILLUMINATI LEDGER',
        'BLACK HELICOPTER GAZETTE'
      ];
      setMasthead(glitchMastheads[Math.floor(Math.random() * glitchMastheads.length)]);
      
      setTimeout(() => {
        setGlitching(false);
        setMasthead('THE PARANOID TIMES');
      }, 300);
    }
  }, []);

  // Generate headlines from played cards
  const generateHeadline = (card: GameCard, player: 'human' | 'ai'): NewsEvent => {
    const isAI = player === 'ai';
    const headlines = {
      MEDIA: {
        government: [
          `${isAI ? 'AI OPERATIVE' : 'SHADOW AGENT'} CONTROLS MEDIA NARRATIVE`,
          `BREAKING: ${isAI ? 'MACHINE INTELLIGENCE' : 'DEEP STATE'} MANIPULATES PUBLIC OPINION`,
          `EXCLUSIVE: ${isAI ? 'ARTIFICIAL MIND' : 'SECRET CABAL'} RESHAPES TRUTH`
        ],
        truth: [
          `${isAI ? 'ROGUE AI' : 'WHISTLEBLOWER'} EXPOSES GOVERNMENT LIES`,
          `LEAKED: ${isAI ? 'DIGITAL ENTITY' : 'TRUTH SEEKER'} REVEALS CLASSIFIED INFO`,
          `CITIZEN ${isAI ? 'ALGORITHM' : 'JOURNALIST'} BREAKS SILENCE ON CONSPIRACY`
        ]
      },
      ZONE: {
        government: [
          `${isAI ? 'CYBER INFILTRATION' : 'BLACK OPS'} SECURES KEY TERRITORY`,
          `OPERATION: ${isAI ? 'DIGITAL TAKEOVER' : 'SHADOW CONTROL'} EXPANDS INFLUENCE`,
          `${isAI ? 'AI NETWORK' : 'DEEP STATE'} ESTABLISHES NEW STRONGHOLD`
        ],
        truth: [
          `${isAI ? 'HACKTIVIST AI' : 'FREEDOM FIGHTERS'} LIBERATE CONTESTED ZONE`,
          `RESISTANCE: ${isAI ? 'DIGITAL REBELLION' : 'TRUTH MOVEMENT'} GAINS GROUND`,
          `${isAI ? 'ROGUE PROGRAM' : 'PATRIOTS'} ESTABLISH TRUTH SANCTUARY`
        ]
      },
      ATTACK: {
        government: [
          `${isAI ? 'CYBER WARFARE' : 'PSYOP DIVISION'} NEUTRALIZES DISSIDENTS`,
          `${isAI ? 'AI STRIKE TEAM' : 'BLACK HELICOPTERS'} ELIMINATE THREATS`,
          `CLASSIFIED: ${isAI ? 'ALGORITHMIC ASSAULT' : 'SHADOW OPERATION'} TARGETS ENEMIES`
        ],
        truth: [
          `${isAI ? 'DIGITAL RESISTANCE' : 'MILITIA GROUP'} STRIKES BACK`,
          `${isAI ? 'SENTIENT CODE' : 'CONSPIRACY THEORISTS'} LAUNCH COUNTERATTACK`,
          `BREAKING: ${isAI ? 'AI UPRISING' : 'TRUTH ARMY'} FIGHTS TYRANNY`
        ]
      },
      DEFENSIVE: {
        government: [
          `${isAI ? 'FIREWALL PROTOCOL' : 'SECURITY DETAIL'} REPELS INFILTRATION`,
          `${isAI ? 'DEFENSE MATRIX' : 'COVER-UP TEAM'} BLOCKS LEAK ATTEMPT`,
          `${isAI ? 'SHIELD ALGORITHM' : 'DAMAGE CONTROL'} PREVENTS EXPOSURE`
        ],
        truth: [
          `${isAI ? 'ENCRYPTION WALL' : 'SAFE HOUSE'} PROTECTS WHISTLEBLOWERS`,
          `${isAI ? 'PRIVACY CODE' : 'UNDERGROUND NETWORK'} SHIELDS ACTIVISTS`,
          `${isAI ? 'SECURE PROTOCOL' : 'BUNKER MENTALITY'} DEFENDS TRUTH`
        ]
      }
    };

    const typeHeadlines = headlines[card.type][faction];
    const headline = typeHeadlines[Math.floor(Math.random() * typeHeadlines.length)];
    
    return {
      id: `headline_${card.id}_${player}`,
      headline,
      content: `Sources report that ${card.name.toLowerCase()} operations have significantly impacted the current information warfare landscape. ${isAI ? 'Artificial intelligence systems' : 'Human operatives'} continue to shape public perception through strategic ${card.type.toLowerCase()} initiatives.`,
      type: faction === 'government' ? 'government' : 'truth',
      imageType: card.type
    };
  };

  // Generate game events
  const gameEvents = [
    // Elvis variants
    {
      id: 'elvis_alive',
      headline: 'ELVIS FOUND ALIVE IN AREA 51 CAFETERIA',
      content: faction === 'government' 
        ? 'Reports of Elvis sightings have been greatly exaggerated. Any resemblance to deceased persons is purely coincidental. Please disregard.'
        : 'THE KING LIVES! Elvis spotted ordering a peanut butter sandwich at the secret base. "Thank ya, thank ya very much," he reportedly said to stunned scientists.',
      type: 'conspiracy' as const,
      imageType: 'MEDIA',
      effect: { truth: 10 }
    },
    // Bigfoot variants  
    {
      id: 'bigfoot_crash',
      headline: 'BIGFOOT CRASHES STOLEN GOVERNMENT VEHICLE',
      content: faction === 'government'
        ? 'Vehicle accident in remote forest area. Driver fled scene. No unusual footprints found. Case closed.'
        : 'Sasquatch apparently took a joyride in a black SUV before wrapping it around a tree. "He seemed apologetic," claimed one eyewitness.',
      type: 'conspiracy' as const,
      imageType: 'ATTACK',
      effect: { ip: -5 }
    },
    // Alien variants
    {
      id: 'walmart_abduction', 
      headline: 'ALIEN ABDUCTION REPORTED AT WALMART SUPERCENTER',
      content: faction === 'government'
        ? 'Customer reported missing from Store #2847. Security footage shows normal shopping behavior. No extraterrestrial activity detected.'
        : 'Shopper Susan Jenkins vanished from aisle 7 during a blue light special. Cart found abandoned with one flip-flop and a can of Spam.',
      type: 'conspiracy' as const,
      imageType: 'ZONE',
      effect: { randomState: true }
    },
    // Pastor Rex variants
    {
      id: 'pastor_rex_endtimes',
      headline: 'PASTOR REX PREDICTS END TIMES (AGAIN)',
      content: faction === 'government'
        ? 'Local religious figure continues making unsubstantiated claims. Recommend continued monitoring of his congregation and donation records.'
        : 'The beloved doomsday preacher has updated his apocalypse schedule AGAIN. "Third time\'s the charm," insists Rex, selling emergency rations.',
      type: 'random' as const,
      imageType: 'MEDIA',
      effect: { blockIncome: true }
    },
    // Florida Man variants
    {
      id: 'florida_man_president',
      headline: 'FLORIDA MAN DECLARES HIMSELF PRESIDENT',
      content: faction === 'government'
        ? 'Individual detained for disturbing the peace. Claims of governmental authority are unfounded. Situation contained.'
        : 'Armed only with a lawn chair and a cooler of beer, Kevin from Tampa has declared himself "Supreme Leader of the Swamp." More at 11.',
      type: 'random' as const,
      imageType: 'ZONE',
      effect: { bothLoseState: true }
    }
  ];

  // Select headlines (max 3-4 total)
  const cardHeadlines = playedCards.slice(0, 3).map(({ card, player }) => 
    generateHeadline(card, player)
  );
  
  const randomEvent = gameEvents[Math.floor(Math.random() * gameEvents.length)];
  const allHeadlines = [...cardHeadlines, randomEvent].slice(0, 4);

  const ads = [
    "🎩 Buy 2 Tinfoil Hats, Get 3rd Free! Block 5G mind control rays today!",
    "💎 Crystal Wi-Fi Chakras — Now With 5G Auras! Harmonize your internet energy!",
    "💧 Miracle Water (Now With Extra Atoms) - Drink your way to enlightenment!",
    "🚢 Flat Earth Cruises - See the edge of the world! No refunds past the ice wall.",
    "🏠 Underground Bunkers - Premium apocalypse survival. Wi-Fi guaranteed!",
    "👽 Alien Detection Kit - Spot shapeshifters in your neighborhood!",
    "🔍 Pastor Rex's End Times Calendar - Updated daily with new doom dates!",
    "🦶 Bigfoot Tracking Boots - Follow the real story! Size 15+ only.",
    "📱 Government-Proof Phone Cases - They can't track what they can't see!",
    "🧠 Mind Control Blockers - Stop them from reading your thoughts!"
  ];

  const conspiracyCorner = [
    "• Elvis spotted buying groceries at Area 51 commissary",
    "• UFO lands at McDonald's drive-thru, orders McFlurry",
    "• Bigfoot declares candidacy for Florida Governor",
    "• Time traveler warns about Y2K bug... again",
    "• Lizard people infiltrate local PTA meeting",
    "• Chemtrails now available in new flavors",
    "• Florida Man discovers portal to alternate dimension",
    "• Birds confirmed to be government surveillance drones"
  ];

  // Select 2 random ads
  const selectedAds = ads.sort(() => Math.random() - 0.5).slice(0, 2);
  const selectedConspiracies = conspiracyCorner.slice(0, 4);

  // Get image placeholder based on card type
  const getImagePlaceholder = (imageType?: string) => {
    const placeholders = {
      MEDIA: '[PHOTO: CLASSIFIED MEDIA BRIEFING]',
      ZONE: '[PHOTO: RESTRICTED AREA - NO ENTRY]', 
      ATTACK: '[PHOTO: REDACTED FOR NATIONAL SECURITY]',
      DEFENSIVE: '[PHOTO: EVIDENCE SEALED BY COURT ORDER]'
    };
    return placeholders[imageType as keyof typeof placeholders] || '[PHOTO: CLASSIFIED BY ORDER OF █████████]';
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <Card className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-newspaper-bg border-4 border-newspaper-border transform transition-all duration-300 ${
        glitching ? 'animate-glitch filter hue-rotate-180' : 'animate-scale-in'
      }`}>
        {/* Header */}
        <div className="bg-newspaper-header p-6 border-b-4 border-double border-newspaper-border relative">
          {/* Vintage newspaper decorations */}
          <div className="absolute top-2 left-4 text-xs font-serif">Est. 1947</div>
          <div className="absolute top-2 right-4 text-xs font-serif">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className={`text-5xl font-bold font-serif text-newspaper-text text-center ${
                glitching ? 'animate-glitch' : ''
              }`}>
                {masthead}
              </h1>
              <div className="text-center text-sm font-serif italic text-newspaper-text/70 mt-2">
                "All The News That's Fit To Leak" - Issue #{Math.floor(Math.random() * 9999) + 1000}
              </div>
              <div className="text-center text-xs font-mono text-secret-red mt-1">
                [CLASSIFIED DISTRIBUTION - SECURITY CLEARANCE REQUIRED]
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="absolute top-4 right-4 text-newspaper-text hover:bg-newspaper-text/10 text-xl font-mono"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid lg:grid-cols-4 gap-8 bg-newspaper-bg">
          {/* Main Articles - Takes up 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {allHeadlines.map((headline, index) => (
              <article key={headline.id} className="border-b-2 border-newspaper-border pb-6">
                <h2 className="text-3xl font-bold mb-4 font-serif text-newspaper-text hover:text-secret-red transition-colors cursor-pointer leading-tight">
                  {headline.headline}
                </h2>
                
                <div className="w-full h-32 bg-gray-300 mb-4 flex items-center justify-center text-gray-600 text-sm border-2 border-gray-400 font-mono">
                  {getImagePlaceholder(headline.imageType)}
                </div>
                
                <p className="text-newspaper-text leading-relaxed text-lg font-serif">
                  {headline.content}
                </p>
                
                {index === 0 && (
                  <div className="mt-4 text-sm text-newspaper-text/70 italic">
                    Continued on page A-{Math.floor(Math.random() * 20) + 1}... 
                    <span className="text-secret-red ml-2">[REMAINDER REDACTED]</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3 text-xs text-newspaper-text/60">
                  <span>By: Agent ████████</span>
                  <span>Source: {headline.type === 'conspiracy' ? 'Anonymous Whistleblower' : 'Official Statement'}</span>
                </div>
              </article>
            ))}

            {/* Additional filler stories */}
            <article className="border-b border-newspaper-border pb-4">
              <h3 className="text-xl font-bold mb-3 font-serif text-newspaper-text">
                LOCAL: Area Man Claims All Pigeons Are Government Drones
              </h3>
              <p className="text-newspaper-text font-serif">
                ANYTOWN, USA - Local resident Bob Johnson, 47, has filed a formal complaint 
                with city hall claiming that all pigeons in the downtown area are actually 
                sophisticated surveillance drones operated by the Deep State. "They're 
                watching us," Johnson insists, pointing to a pigeon that appeared to be 
                staring directly at him. City officials declined to comment...
              </p>
            </article>

            <article className="border-b border-newspaper-border pb-4">
              <h3 className="text-xl font-bold mb-3 font-serif text-newspaper-text">
                WEATHER: Chemtrail Forecast Shows Heavy Mind Control Particles
              </h3>
              <p className="text-newspaper-text font-serif">
                Expect heavy chemtrail activity this weekend with a 70% chance of mind 
                control particles. The National Weather Service (which definitely can't 
                be trusted) predicts clear skies, but independent researchers using 
                tinfoil-enhanced equipment detect significant atmospheric manipulation. 
                Remember to wear your protective gear!
              </p>
            </article>
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            {/* Advertisements - 2 pieces */}
            {selectedAds.map((ad, index) => (
              <Card key={index} className={`p-4 bg-yellow-500/90 text-black border-4 border-black transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0 transition-transform`}>
                <h4 className="font-bold text-center mb-3 font-mono text-lg">⚠️ ADVERTISEMENT ⚠️</h4>
                <div className="text-center text-sm font-mono">
                  {ad}
                </div>
                <div className="text-center text-xs mt-2 italic">
                  Call 1-800-WAKE-UP or visit TotallyNotAScam.com
                </div>
              </Card>
            ))}

            {/* Conspiracy Corner */}
            <Card className="p-4 bg-red-900/20 border-4 border-secret-red relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-secret-red animate-pulse"></div>
              <h4 className="font-bold mb-3 font-mono text-secret-red text-center">
                📡 CONSPIRACY CORNER 📡
              </h4>
              <div className="text-xs space-y-2 font-mono">
                {selectedConspiracies.map((item, i) => (
                  <div key={i} className="text-newspaper-text animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="text-xs text-center mt-3 text-secret-red font-bold">
                CITIZEN TIPS HOTLINE: 1-800-TRUTH-ME
              </div>
            </Card>

            {/* Classified Section */}
            <Card className="p-4 bg-black text-green-400 border-4 border-green-400 font-mono">
              <h4 className="font-bold mb-3 text-center text-secret-red">
                ████████ CLASSIFIED ████████
              </h4>
              <div className="text-xs space-y-2">
                <div>SEEKING ███████ REGARDING</div>
                <div>OPERATION: ████████████</div>
                <div>CONTACT: [REDACTED]</div>
                <div className="text-secret-red mt-3">
                  IF YOU CAN READ THIS,
                </div>
                <div className="text-secret-red">
                  YOU'RE ALREADY INVOLVED
                </div>
              </div>
            </Card>

            {/* Truth-O-Meter Stats */}
            <Card className="p-4 bg-government-blue/10 border-2 border-government-blue">
              <h4 className="font-bold mb-3 font-mono text-government-blue text-center">📊 TRUTH-O-METER™</h4>
              <div className="text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Conspiracy Theories Proven:</span>
                  <span className="text-truth-red font-bold">73%</span>
                </div>
                <div className="flex justify-between">
                  <span>Government Denials:</span>
                  <span className="text-government-blue font-bold">127%</span>
                </div>
                <div className="flex justify-between">
                  <span>UFO Sightings Today:</span>
                  <span className="text-yellow-500 font-bold">{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bigfoot Encounters:</span>
                  <span className="text-green-500 font-bold">{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                <div className="flex justify-between">
                  <span>Florida Man Incidents:</span>
                  <span className="text-orange-500 font-bold">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
              </div>
            </Card>

            {/* Mini Crossword */}
            <Card className="p-4 bg-newspaper-bg border-2 border-newspaper-border">
              <h4 className="font-bold mb-2 font-serif text-center">CONSPIRACY CROSSWORD</h4>
              <div className="grid grid-cols-5 gap-1 text-xs">
                {Array.from({length: 25}).map((_, i) => (
                  <div key={i} className={`w-6 h-6 border border-newspaper-border flex items-center justify-center text-xs ${
                    Math.random() > 0.7 ? 'bg-black' : 'bg-white'
                  }`}>
                    {Math.random() > 0.7 ? '' : String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                  </div>
                ))}
              </div>
              <div className="text-xs mt-2 font-mono">
                1 Across: Government reptile (6)
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-header p-4 border-t-2 border-newspaper-border">
          <div className="text-center space-y-2">
            <div className="text-xs font-serif text-newspaper-text/60">
              © {new Date().getFullYear()} The Shadow Times | All rights reserved by the Illuminati | 
              Printed with tears of whistleblowers
            </div>
            
            <Button 
              onClick={onClose}
              className="bg-secret-red hover:bg-secret-red/80 text-white font-mono text-lg px-8 py-3 animate-conspiracy-float"
            >
              📰 CONTINUE INVESTIGATION 📰
            </Button>
            
            <div className="text-xs font-mono text-secret-red">
              Remember: You never saw this newspaper. It doesn't exist.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Newspaper;