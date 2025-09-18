import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import type { GameCard } from '@/rules/mvp';
import type { GameEvent } from '@/data/eventDatabase';
import CardImage from '@/components/game/CardImage';

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
}

interface TabloidNewspaperProps {
  events: GameEvent[];
  playedCards: PlayedCard[];
  faction: 'government' | 'truth';
  truth: number;
  onClose: () => void;
}

interface NewspaperData {
  mastheads: string[];
  ads: string[];
}

interface Article {
  headline: string;
  content: string;
  isEvent?: boolean;
  isCard?: boolean;
  cardId?: string;
  player?: 'human' | 'ai';
}

const TabloidNewspaper = ({ events, playedCards, faction, truth, onClose }: TabloidNewspaperProps) => {
  const [glitching, setGlitching] = useState(false);
  const [masthead, setMasthead] = useState('THE SHEEPLE DAILY');
  const [newspaperData, setNewspaperData] = useState<NewspaperData | null>(null);

  // Load newspaper data on component mount
  useEffect(() => {
    const loadNewspaperData = async () => {
      try {
        console.log('🗞️ Attempting to load newspaper data...');
        const response = await fetch('/data/newspaperData.json');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🗞️ Newspaper data loaded:', { 
          mastheads: data.mastheads?.length, 
          ads: data.ads?.length 
        });
        
        setNewspaperData(data);
        
        // Set random masthead from the loaded data
        const randomMasthead = data.mastheads[Math.floor(Math.random() * data.mastheads.length)];
        console.log('🗞️ Random masthead selected:', randomMasthead);
        setMasthead(randomMasthead);
      } catch (error) {
        console.error('❌ Failed to load newspaper data:', error);
        console.log('🗞️ Using fallback masthead');
        // Keep default masthead if loading fails
      }
    };

    loadNewspaperData();
  }, []);

  // Glitch masthead system - 5% chance on load
  useEffect(() => {
    const shouldGlitch = Math.random() < 0.05;
    if (shouldGlitch && newspaperData) {
      const timer = setTimeout(() => {
        setGlitching(true);
        const glitchOptions = ['PAGE NOT FOUND', '░░░ERROR░░░', '▓▓▓SIGNAL LOST▓▓▓', '404 TRUTH NOT FOUND'];
        setMasthead(glitchOptions[Math.floor(Math.random() * glitchOptions.length)]);
        
        const resetTimer = setTimeout(() => {
          setGlitching(false);
          const randomMasthead = newspaperData.mastheads[Math.floor(Math.random() * newspaperData.mastheads.length)];
          setMasthead(randomMasthead);
        }, 1200);
        
        return () => clearTimeout(resetTimer);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [newspaperData]);

  // Generate card articles with tabloid-style headlines
  const generateCardArticles = (): Article[] => {
    // Dynamic text length based on card count - fewer cards = more text per article
    const cardCount = playedCards.length;
    const textExpansionLevel = cardCount <= 2 ? 'high' : cardCount <= 4 ? 'medium' : 'low';
    
    return playedCards.map(pc => {
      const tabloidHeadlines = [
        `"${pc.card.name}" SHOCKS NATION`,
        `EXCLUSIVE: ${pc.card.name.toUpperCase()} LEAKED!`,
        `BREAKING: ${pc.card.name} EXPOSED!`,
        `SOURCES CONFIRM: ${pc.card.name} IS REAL`,
        `WHISTLEBLOWER REVEALS: ${pc.card.name}`,
        `CLASSIFIED DOCS: ${pc.card.name} UNCOVERED`,
        `EXPERTS BAFFLED BY ${pc.card.name}`,
        `${pc.card.name}: THE SHOCKING TRUTH`,
        `GOVERNMENT DENIES ${pc.card.name} EXISTS`
      ];

      const headline = tabloidHeadlines[Math.floor(Math.random() * tabloidHeadlines.length)];
      
      // Use flavor text or generate Weekly World News style content
      const flavorText = pc.card.flavor ?? pc.card.flavorGov ?? pc.card.flavorTruth;
      const baseContent = flavorText || 
        `Local sources report bizarre activities linked to what witnesses describe as "${pc.card.name}". Government officials refuse comment, but experts claim this could change everything. "I've never seen anything like it," said one anonymous whistleblower.`;

      // Dynamic text expansion based on card count
      const additionalContent = {
        high: [
          `Our investigative team spent weeks tracking down leads, interviewing witnesses who insisted on anonymity, and analyzing classified documents obtained through sources we cannot disclose. The implications are staggering.`,
          `"This changes everything we thought we knew," claims Dr. Anonymous, a former government researcher who requested their real name be withheld for obvious reasons. "The public deserves to know the truth, but powerful forces are working to suppress this information."`,
          `According to leaked internal memos, officials have been aware of this situation for months, possibly years. The cover-up extends to the highest levels of government, with multiple agencies coordinating their response.`,
          `Eyewitness testimonies paint a disturbing picture of systematic deception and manipulation. Citizens are being kept in the dark while shadowy organizations pull the strings behind the scenes.`
        ],
        medium: [
          `Further investigation reveals a pattern of suspicious activity spanning multiple states. Witnesses report strange phenomena and unexplained incidents that authorities refuse to acknowledge.`,
          `"The evidence is overwhelming," states an anonymous insider. "But they don't want you to know the truth." Multiple attempts to reach official spokespersons for comment were unsuccessful.`
        ],
        low: [
          `Officials maintain their denial, but insiders suggest otherwise. The truth is out there, and we're committed to uncovering it.`
        ]
      };

      const expansionTexts = additionalContent[textExpansionLevel];
      const selectedExpansions = expansionTexts.slice(0, textExpansionLevel === 'high' ? 3 : textExpansionLevel === 'medium' ? 2 : 1);

      const editorialComments = [
        "Full story inside – if the Men in Black don't stop us first!",
        "Experts remain baffled by the implications!",
        "Officials deny everything – but the evidence speaks for itself!",
        "Government refuses to comment – suspicious much?",
        "Truth suppressed by Big Tech and mainstream media!",
        "Classified by order of ████████ – what are they hiding?",
        "This story continues to develop as more witnesses come forward...",
        "The cover-up runs deeper than anyone imagined!"
      ];

      const fullContent = [
        baseContent,
        ...selectedExpansions,
        editorialComments[Math.floor(Math.random() * editorialComments.length)]
      ].join(' ');

      return {
        headline,
        content: fullContent,
        isCard: true,
        cardId: pc.card.id, // Store the actual card ID for the CardImage component
        player: pc.player
      };
    });
  };

  // Tabloid headlines from events
  // Helper function to format game effects for display
  const formatGameEffects = (effects: any): string => {
    if (!effects) return '';
    
    const effectParts: string[] = [];
    
    if (effects.truth) {
      effectParts.push(`Truth ${effects.truth > 0 ? '+' : ''}${effects.truth}%`);
    }
    if (effects.ip) {
      effectParts.push(`IP ${effects.ip > 0 ? '+' : ''}${effects.ip}`);
    }
    if (effects.cardDraw) {
      effectParts.push(`Draw ${effects.cardDraw} card${effects.cardDraw > 1 ? 's' : ''}`);
    }
    if (effects.truthChange) {
      effectParts.push(`Truth ${effects.truthChange > 0 ? '+' : ''}${effects.truthChange}%`);
    }
    if (effects.ipChange) {
      effectParts.push(`IP ${effects.ipChange > 0 ? '+' : ''}${effects.ipChange}`);
    }
    if (effects.defenseChange) {
      effectParts.push(`Defense ${effects.defenseChange > 0 ? '+' : ''}${effects.defenseChange}`);
    }
    if (effects.stateEffects?.pressure) {
      effectParts.push(`State Pressure ${effects.stateEffects.pressure > 0 ? '+' : ''}${effects.stateEffects.pressure}`);
    }
    if (effects.stateEffects?.defense) {
      effectParts.push(`State Defense ${effects.stateEffects.defense > 0 ? '+' : ''}${effects.stateEffects.defense}`);
    }
    if (effects.skipTurn) {
      effectParts.push('Skip Next Turn');
    }
    if (effects.doubleIncome) {
      effectParts.push('Double Income');
    }
    
    return effectParts.length > 0 ? ` (${effectParts.join(', ')})` : '';
  };

  const generateTabloidHeadlines = (): Article[] => {
    // Only show events with 20% probability
    const filteredEvents = events.filter(() => Math.random() < 0.2);
    
    const eventHeadlines = filteredEvents.map(event => ({
      headline: `🚨 ${event.headline || `BREAKING: ${event.title.toUpperCase()}`} 🚨`,
      content: `URGENT UPDATE: ${event.content} This developing story continues to unfold as authorities scramble to contain the situation.${formatGameEffects(event.effects)}`,
      isEvent: true
    }));
    
    return eventHeadlines;
  };

  // Get random ads from newspaper data
  const getRandomAds = (count: number) => {
    if (!newspaperData?.ads) return [];
    const shuffled = [...newspaperData.ads].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const cardArticles = generateCardArticles();
  const eventHeadlines = generateTabloidHeadlines();
  const allArticles: Article[] = [...cardArticles, ...eventHeadlines];
  const humorAds = getRandomAds(3);

  // Weird tabloid ads
  const weirdAds = [
    {
      title: "BUY 2 TINFOIL HATS, GET 3RD FREE!",
      subtitle: "Premium thought-blocking technology",
      contact: "Call 1-800-BLOCK-IT"
    },
    {
      title: "CRYSTAL WI-FI CHAKRAS",
      subtitle: "Align your internet with the universe",
      contact: "Visit SpiritualRouter.net"
    },
    {
      title: "FLORIDA MAN SCHOOL OF DRIVING",
      subtitle: "Learn to drive like it's your last day",
      contact: "Gator Insurance Included"
    },
    {
      title: "PASTOR REX HEALING CRYSTALS",
      subtitle: "Now with 5G blocking technology!",
      contact: "Blessed by actual angels*"
    },
    {
      title: "UNDERGROUND BUNKERS R US",
      subtitle: "Premium apocalypse real estate",
      contact: "Wi-Fi guaranteed 6 feet under"
    },
    {
      title: "PSYCHIC WI-FI HOTSPOTS",
      subtitle: "Mind-reading internet connection",
      contact: "Think your password to connect"
    },
    {
      title: "AGENT SMITHERSON'S USED CARS",
      subtitle: "Definitely not surveillance vehicles",
      contact: "No questions asked policy"
    },
    {
      title: "BAT BOY'S SCREAM THERAPY",
      subtitle: "Release your inner conspiracy theorist",
      contact: "Sessions available 24/7"
    }
  ];

  const conspiracyCorner = [
    "Elvis spotted buying groceries with Bitcoin",
    "Bigfoot runs illegal cryptocurrency farm",
    "All birds confirmed as government drones on strike",
    "Chemtrails now available in pumpkin spice",
    "Local man's toaster achieved sentience, demands rights",
    "Moon landing was filmed in Florida Man's backyard",
    "Lizard people control weather through interpretive dance",
    "Government admits pigeons are unionized surveillance",
    "Area 51 now offers drive-thru alien encounters",
    "Pastor Rex's prayer circle accidentally summoned WiFi"
  ];

  const selectedHeadlines = allArticles.slice(0, 4);
  const selectedConspiracies = conspiracyCorner.sort(() => 0.5 - Math.random()).slice(0, 4);

  const getTruthMeterStatus = () => {
    if (truth >= 80) return { level: "MAXIMUM PANIC", color: "text-red-500", bgColor: "bg-red-500" };
    if (truth >= 60) return { level: "ELEVATED PARANOIA", color: "text-orange-500", bgColor: "bg-orange-500" };
    if (truth >= 40) return { level: "MILD SUSPICION", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    if (truth >= 20) return { level: "BLISSFUL IGNORANCE", color: "text-green-500", bgColor: "bg-green-500" };
    return { level: "DEEP SLEEP", color: "text-blue-500", bgColor: "bg-blue-500" };
  };

  const truthStatus = getTruthMeterStatus();

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-2">
      <Card className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white border-8 border-black shadow-2xl ${
        glitching ? 'animate-pulse' : ''
      }`} style={{ fontFamily: 'serif' }}>
        
        {/* TABLOID MASTHEAD - Classic newspaper header */}
        <div className="bg-white border-b-8 border-black relative">
          {/* Top info line */}
          <div className="bg-black text-white px-6 py-1 text-xs font-mono flex justify-between">
            <span>EST. 1947</span>
            <span className="font-bold">THE WORLD'S ONLY RELIABLE NEWSPAPER</span>
            <span>Issue #{Math.floor(Math.random() * 9999) + 1000}</span>
          </div>
          
          {/* Main masthead */}
          <div className="bg-red-600 text-white px-6 py-6 text-center relative">
            <div className={`text-6xl font-black tracking-wider transform ${
              glitching ? 'text-green-400 animate-bounce' : 'text-white'
            }`} style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
              {masthead}
            </div>
            <div className="text-base mt-2 font-serif italic tracking-wide">
              "All The Weird That's Fit To Print" • 50¢ (or 3 conspiracy theories)
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 text-2xl p-2"
            >
              <X />
            </Button>
          </div>

          {/* Truth-O-Meter Banner - now integrated into header */}
          <div className="bg-red-700 text-white p-4 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-2xl font-black" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
                  CONSPIRACY LEVEL
                </h3>
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className={`px-6 py-3 font-black text-2xl border-4 border-white ${truthStatus.color} bg-white text-black`}>
                {truthStatus.level}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Progress value={truth} className="flex-1 h-6 border-4 border-white bg-black" />
              <div className="font-black text-4xl">{truth}%</div>
            </div>
          </div>
        </div>

        {/* TABLOID CONTENT */}
        <div className="p-6 bg-white">
          {/* Round Summary - Compact tabloid info box */}
          <div className="mb-6">
            <div className="bg-gray-100 border-4 border-black p-4">
              <h2 className="text-xl font-black mb-3 text-center border-b-2 border-black pb-2" 
                  style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
                📋 ROUND SUMMARY: COVERT OPERATIONS 📋
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-green-200 p-3 border-4 border-black">
                  <h3 className="font-black text-green-800 mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
                    YOUR MOVES
                  </h3>
                  {playedCards.filter(pc => pc.player === 'human').length > 0 ? (
                    <ul className="space-y-1">
                      {playedCards.filter(pc => pc.player === 'human').map((pc, idx) => (
                        <li key={`human-${pc.card.id}-${idx}`} className="flex justify-between font-mono text-xs">
                          <span>• {pc.card.name}</span>
                          <span className="font-black">[{pc.card.type}]</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-600">Agent remained inactive</p>
                  )}
                </div>
                
                <div className="bg-red-200 p-3 border-4 border-black">
                  <h3 className="font-black text-red-800 mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
                    ENEMY ACTIONS
                  </h3>
                  {playedCards.filter(pc => pc.player === 'ai').length > 0 ? (
                    <ul className="space-y-1">
                      {playedCards.filter(pc => pc.player === 'ai').map((pc, idx) => (
                        <li key={`ai-${pc.card.id}-${idx}`} className="flex justify-between font-mono text-xs">
                          <span>• {pc.card.name}</span>
                          <span className="font-black">[{pc.card.type}]</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-600">Opposition went silent</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN ARTICLES - True tabloid style */}
          <div className="space-y-8">
            {selectedHeadlines.map((article, index) => (
              <article key={index} className={`border-8 border-black bg-white p-6 shadow-lg transform ${
                index % 2 === 0 ? 'rotate-0' : 'rotate-0'
              } ${article.isEvent ? 'bg-red-50' : 'bg-white'}`}>
                
                {/* EVENT BADGE for event articles */}
                {article.isEvent && (
                  <div className="absolute -top-4 -right-4 bg-red-600 text-white px-4 py-2 border-4 border-black transform rotate-12 z-10">
                    <span className="font-black text-lg" style={{ fontFamily: 'Anton, sans-serif' }}>EVENT</span>
                  </div>
                )}
                
                {/* MASSIVE TABLOID HEADLINE */}
                <h2 className={`text-5xl md:text-7xl font-black mb-6 text-center leading-none transform -rotate-1 ${
                  article.isEvent ? 'text-red-600 animate-pulse' : 'text-black'
                } uppercase tracking-tight`} style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
                  {article.headline}
                </h2>
                
                {/* Subtitle/Dek */}
                <div className="text-center mb-6">
                  <p className="text-lg italic text-gray-600 border-t-2 border-b-2 border-black py-2 bg-gray-100">
                    {article.isEvent ? 'DEVELOPING STORY - AUTHORITIES BAFFLED' : 'EXCLUSIVE INVESTIGATION'}
                  </p>
                </div>
                
                {/* Article Layout with Tabloid Photo */}
                <div className="grid md:grid-cols-4 gap-6">
                  {/* TABLOID PHOTO - Left column */}
                  <div className="md:col-span-2 relative">
                    {article.isCard && article.cardId ? (
                      <div className="relative border-8 border-black bg-white p-2 shadow-lg">
                        <CardImage 
                          cardId={article.cardId}
                          className="w-full h-48 md:h-64 object-cover grayscale contrast-125 sepia-[0.2]"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-black text-white text-xs px-3 py-2 font-bold border-4 border-white">
                          CLASSIFIED DOCUMENT PHOTO
                        </div>
                        {/* Tape effect */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-200 border border-yellow-400 px-8 py-1 opacity-80">
                          EVIDENCE
                        </div>
                      </div>
                    ) : (
                      <div className="border-8 border-black bg-black text-white h-48 md:h-64 flex items-center justify-center shadow-lg">
                        <div className="text-center">
                          <div className="text-4xl font-bold mb-2 animate-pulse" style={{ fontFamily: 'Anton, sans-serif' }}>
                            [CLASSIFIED]
                          </div>
                          <div className="text-lg">PHOTO CENSORED</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* ARTICLE TEXT - Right columns */}
                  <div className="md:col-span-2">
                    <p className={`text-lg leading-relaxed font-serif ${
                      article.isEvent ? 'text-red-800 font-bold' : 'text-black'
                    } text-justify`}>
                      {article.content}
                    </p>
                    
                    {/* Continuation notice */}
                    {index === 0 && (
                      <div className="mt-4 p-3 bg-yellow-100 border-4 border-black transform rotate-1">
                        <div className="text-sm text-gray-800 italic text-center">
                          Continued on page A-{Math.floor(Math.random() * 20) + 1}... 
                          <span className="text-red-600 ml-2 font-black">[REMAINDER CLASSIFIED]</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* BYLINE AND SOURCE - Tabloid style */}
                <div className="flex justify-between items-center mt-6 text-xs border-t-4 border-black pt-3 bg-gray-50 px-4 py-2">
                  <span className="font-mono font-bold">
                    By: {article.isEvent ? 'CRISIS REPORTER' : ['Agent X', 'Deep Throat Jr.', 'Anonymous Tipster', 'Florida Man'][Math.floor(Math.random() * 4)]}
                  </span>
                  <span className="font-mono">
                    Source: {article.isEvent ? 'EMERGENCY BROADCAST' : ['Totally Reliable', 'My Cousin\'s Blog', 'Overheard at Denny\'s'][Math.floor(Math.random() * 3)]}
                  </span>
                </div>
              </article>
            ))}
          </div>
          
          {/* TABLOID ADS SECTION - Bottom of page */}
          <div className="mt-8 border-t-8 border-black pt-6">
            <h3 className="text-3xl font-black text-center mb-6 bg-yellow-400 py-3 border-4 border-black transform -rotate-1"
                style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
              🚨 SPECIAL OFFERS FOR PATRIOTS! 🚨
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Humor Ads */}
              {humorAds.slice(0, 3).map((ad, index) => (
                <div key={index} className={`bg-yellow-300 border-8 border-black p-4 transform ${
                  index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'
                } hover:rotate-0 transition-transform shadow-lg`}>
                  <h4 className="font-black text-center mb-3 text-lg" style={{ fontFamily: 'Anton, sans-serif' }}>
                    ⚠️ SPECIAL OFFER ⚠️
                  </h4>
                  <div className="text-center text-sm font-bold font-mono mb-2">
                    {ad}
                  </div>
                  <div className="text-center text-xs font-mono bg-red-600 text-white p-2 border-2 border-black">
                    *Results not guaranteed. Side effects may include enlightenment.
                  </div>
                </div>
              ))}
            </div>

            {/* Conspiracy Corner & Weather - Side by side */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-red-900 text-white border-8 border-black p-4 transform rotate-1">
                <h4 className="font-black mb-3 text-center text-xl border-b-2 border-white pb-2"
                    style={{ fontFamily: 'Anton, sans-serif' }}>
                  🔍 CONSPIRACY CORNER 🔍
                </h4>
                <div className="text-sm space-y-2">
                  {selectedConspiracies.map((item, i) => (
                    <div key={i} className="border-b border-red-700 pb-2 font-mono">
                      • {item}
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 bg-white text-red-900 p-2 border-4 border-red-700 font-black">
                  TIPS: 1-800-WEIRD-ME
                </div>
              </div>

              <div className="bg-blue-200 border-8 border-black p-4">
                <h4 className="font-black mb-3 text-center text-xl border-b-2 border-black pb-2"
                    style={{ fontFamily: 'Anton, sans-serif' }}>
                  🌤️ WEATHER CONTROL 🌤️
                </h4>
                <div className="text-sm text-center space-y-2">
                  <div className="font-black text-lg">Today: {(() => {
                    const todayWeather = [
                      'Chemtrails', 'Mind Control Rays', 'Suspicious Fog', 'Government Clouds',
                      '5G Drizzle', 'Alien Haze', 'Lizard People Mist', 'Deep State Storms',
                      'Fluoride Rain', 'Surveillance Snow', 'Conspiracy Clouds', 'Illuminati Ice'
                    ];
                    return todayWeather[Math.floor(Math.random() * todayWeather.length)];
                  })()}</div>
                  <div className="font-semibold">Tomorrow: {(() => {
                    const tomorrowWeather = [
                      'Mind Control Fog', 'Tracking Precipitation', 'Behavior Modification Breeze',
                      'Social Credit Showers', 'Microchip Mist', 'Drone Surveillance Drizzle',
                      'Reality Distortion Rain', 'Memory Wipe Weather', 'Thought Police Fog'
                    ];
                    return tomorrowWeather[Math.floor(Math.random() * tomorrowWeather.length)];
                  })()}</div>
                  <div className="font-semibold">Weekend: {Math.floor(Math.random() * 40 + 60)}% chance of {(() => {
                    const weekendEvents = [
                      'UFOs', 'Bigfoot Sightings', 'Time Anomalies', 'Dimensional Rifts',
                      'Crypto-Cryptids', 'Flying Saucers', 'Interdimensional Visitors',
                      'Government Experiments', 'Alien Abductions', 'Mutant Weather'
                    ];
                    return weekendEvents[Math.floor(Math.random() * weekendEvents.length)];
                  })()}</div>
                  <div className="mt-3 font-mono bg-yellow-200 border-2 border-black p-2 text-black">
                    *Weather controlled by {(() => {
                      const controllers = [
                        'lizard people', 'the Illuminati', 'Big Weather Corp',
                        'alien overlords', 'shadow government', 'interdimensional beings',
                        'the deep state', 'weather wizards', 'climate conspirators'
                      ];
                      return controllers[Math.floor(Math.random() * controllers.length)];
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLOID FOOTER */}
        <div className="bg-black text-white p-6 border-t-8 border-black text-center">
          <Button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-2xl px-12 py-4 border-8 border-white transform hover:scale-105 transition-transform shadow-lg"
            style={{ fontFamily: 'Anton, Impact, sans-serif' }}
          >
            🗞️ CONTINUE THE INVESTIGATION 🗞️
          </Button>
          
          <div className="text-sm mt-6 opacity-80 font-mono max-w-2xl mx-auto">
            © {new Date().getFullYear()} The Sheeple Daily | All rights reserved by whoever's really in charge | 
            Printed with disappearing ink for your protection
          </div>

          <div className="text-xs mt-2 font-mono border-t border-white/20 pt-2">
            Remember: This newspaper will self-destruct in 5... 4... just kidding, keep it forever.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TabloidNewspaper;