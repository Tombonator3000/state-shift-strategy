import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import type { GameCard } from '@/types/cardTypes';
import type { GameEvent } from '@/data/eventDatabase';

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
      const flavorText = pc.card.flavorTruth || pc.card.flavorGov;
      const tabloidContent = flavorText || 
        `Local sources report bizarre activities linked to what witnesses describe as "${pc.card.name}". Government officials refuse comment, but experts claim this could change everything. "I've never seen anything like it," said one anonymous whistleblower. Full story inside – if the Men in Black don't stop us first!`;

      const editorialComments = [
        "Experts baffled!",
        "Officials deny everything!",
        "Eyewitness drunk at the time",
        "Government refuses comment",
        "Truth suppressed by Big Tech",
        "Classified by order of ████████",
        "Story develops..."
      ];

      return {
        headline,
        content: `${tabloidContent} ${editorialComments[Math.floor(Math.random() * editorialComments.length)]}`,
        isCard: true,
        player: pc.player
      };
    });
  };

  // Tabloid headlines from events
  const generateTabloidHeadlines = (): Article[] => {
    const eventHeadlines = events.map(event => ({
      headline: event.headline || `BREAKING: ${event.title.toUpperCase()}`,
      content: event.content,
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <Card className={`max-w-5xl w-full max-h-[85vh] overflow-y-auto bg-yellow-50 border-4 border-black shadow-2xl ${
        glitching ? 'animate-pulse' : ''
      }`}>
        {/* Masthead */}
        <div className="bg-red-800 text-white p-4 border-b-4 border-black relative">
          <div className="absolute top-2 left-4 text-xs font-serif">Est. 1947</div>
          <div className="absolute top-2 right-4 text-xs font-serif">
            Issue #{Math.floor(Math.random() * 9999) + 1000}
          </div>
          
          <div className="text-center space-y-2">
            <div className={`text-4xl font-black font-serif tracking-wider transform ${
              glitching ? 'text-green-400 animate-bounce' : 'text-white'
            }`}>
              {masthead}
            </div>
            <div className="text-sm font-serif italic">
              "All The Weird That's Fit To Print" • 50¢ (or 3 conspiracy theories)
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 text-xl"
          >
            <X />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 grid lg:grid-cols-4 gap-6 bg-yellow-50">
          {/* Main Articles - 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            {/* Truth-O-Meter Banner */}
            <Card className="p-4 bg-gradient-to-r from-red-100 to-blue-100 border-4 border-black">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-black">CONSPIRACY LEVEL MONITOR™</h3>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`px-4 py-2 font-black text-lg border-2 border-black ${truthStatus.color}`}>
                  {truthStatus.level}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={truth} className="flex-1 h-4 border-2 border-black" />
                <div className="font-black text-2xl">{truth}%</div>
              </div>
              <div className="text-xs mt-2 text-center font-mono">
                *Results not guaranteed by any known reality
              </div>
            </Card>

            {/* Turn Summary */}
            <Card className="p-4 border-4 border-black bg-blue-50">
              <h2 className="text-xl font-black mb-3 text-center">
                📋 ROUND SUMMARY: COVERT OPERATIONS 📋
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-green-100 p-3 border-2 border-black">
                  <h3 className="font-black text-green-800 mb-2">YOUR MOVES</h3>
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
                
                <div className="bg-red-100 p-3 border-2 border-black">
                  <h3 className="font-black text-red-800 mb-2">ENEMY ACTIONS</h3>
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
            </Card>

            {/* Headlines */}
            {selectedHeadlines.map((article, index) => (
              <article key={index} className="border-4 border-black bg-white p-4">
                <h2 className={`text-2xl font-black mb-2 text-center transform -rotate-1 ${
                  article.isEvent ? 'text-red-600' : 'text-black'
                }`}>
                  {article.headline}
                </h2>
                
                <div className="w-full h-20 bg-gray-300 mb-3 flex items-center justify-center text-gray-600 text-sm border-2 border-black font-mono">
                  {article.isEvent ? '[EMERGENCY BROADCAST PHOTO]' : '[DEFINITELY REAL PHOTO - NOT DOCTORED]'}
                </div>
                
                <p className={`text-sm leading-relaxed font-serif ${
                  article.isEvent ? 'text-red-800' : 'text-black'
                }`}>
                  {article.content}
                </p>
                
                <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                  <span>By: {article.isEvent ? 'Crisis Reporter' : ['Agent X', 'Deep Throat Jr.', 'Anonymous Tipster', 'Florida Man'][Math.floor(Math.random() * 4)]}</span>
                  <span>Source: {article.isEvent ? 'EMERGENCY BROADCAST' : ['Totally Reliable', 'My Cousin\'s Blog', 'Overheard at Denny\'s'][Math.floor(Math.random() * 3)]}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-4">
            {/* Humor Ads */}
            {humorAds.map((ad, index) => (
              <Card key={index} className={`p-3 bg-yellow-400/95 text-black border-4 border-black transform ${
                index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : '-rotate-0.5'
              } hover:rotate-0 transition-transform shadow-lg`}>
                <h4 className="font-black text-center mb-2 font-mono text-xs uppercase tracking-wide">
                  ⚠️ SPECIAL OFFER ⚠️
                </h4>
                <div className="text-center text-xs font-bold font-mono">
                  {ad}
                </div>
                <div className="text-center text-[10px] font-mono mt-2 opacity-70">
                  *Results not guaranteed. Side effects may include enlightenment.
                </div>
              </Card>
            ))}

            {/* Conspiracy Corner */}
            <Card className="p-3 bg-red-900 text-white border-4 border-black">
              <h4 className="font-black mb-2 text-center text-sm">
                🔍 CONSPIRACY CORNER 🔍
              </h4>
              <div className="text-xs space-y-1">
                {selectedConspiracies.map((item, i) => (
                  <div key={i} className="border-b border-red-700 pb-1">
                    • {item}
                  </div>
                ))}
              </div>
              <div className="text-xs text-center mt-2 font-black bg-white text-red-900 p-1">
                TIPS: 1-800-WEIRD-ME
              </div>
            </Card>

            {/* Weather */}
            <Card className="p-3 bg-blue-100 border-4 border-black">
              <h4 className="font-black mb-2 text-center text-sm">🌤️ WEATHER 🌤️</h4>
              <div className="text-xs text-center">
                <div className="font-black">Today: Chemtrails</div>
                <div>Tomorrow: Mind Control Fog</div>
                <div>Weekend: 70% chance of UFOs</div>
                <div className="mt-2 font-mono bg-yellow-200 p-1">
                  *Weather controlled by lizard people
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-red-800 text-white p-4 border-t-4 border-black text-center">
          <Button 
            onClick={onClose}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-8 py-3 border-4 border-black transform hover:scale-105 transition-transform"
          >
            🗞️ CONTINUE THE INVESTIGATION 🗞️
          </Button>
          
          <div className="text-xs mt-3 opacity-80">
            © {new Date().getFullYear()} The Sheeple Daily | All rights reserved by whoever's really in charge | 
            Printed with disappearing ink for your protection
          </div>

          <div className="text-xs mt-1 font-mono">
            Remember: This newspaper will self-destruct in 5... 4... just kidding, keep it forever.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TabloidNewspaper;