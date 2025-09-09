import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { GameCard } from './GameHand';

interface NewsEvent {
  id: string;
  headline: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random' | 'crisis' | 'opportunity';
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

  // Hide card layers when newspaper opens
  useEffect(() => {
    const cardLayer = document.getElementById('card-play-layer');
    const playedPile = document.getElementById('played-pile');
    
    if (cardLayer && playedPile) {
      cardLayer.style.display = 'none';
      playedPile.style.display = 'none';
      
      // Clear any lingering card animations
      cardLayer.innerHTML = '';
      playedPile.innerHTML = '';
    }
    
    return () => {
      // Restore visibility when newspaper closes
      if (cardLayer && playedPile) {
        cardLayer.style.display = 'block';
        playedPile.style.display = 'grid';
      }
    };
  }, []);

  // Glitch masthead system - one-time 10% chance on load
  useEffect(() => {
    const shouldGlitch = Math.random() < 0.1;
    if (shouldGlitch) {
      const timer = setTimeout(() => {
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
        
        const resetTimer = setTimeout(() => {
          setGlitching(false);
          setMasthead('THE PARANOID TIMES');
        }, 800);
        
        return () => clearTimeout(resetTimer);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Generate headlines from played cards
  const generateHeadline = (card: GameCard, player: 'human' | 'ai'): NewsEvent => {
    const isAI = player === 'ai';
    const playerName = isAI ? 'AI OPERATIVE' : 'SHADOW AGENT';
    
    const headlines = {
      MEDIA: [
        `${playerName} CONTROLS MEDIA NARRATIVE`,
        `BREAKING: ${isAI ? 'MACHINE INTELLIGENCE' : 'DEEP STATE'} MANIPULATES PUBLIC OPINION`,
        `EXCLUSIVE: ${isAI ? 'ARTIFICIAL MIND' : 'SECRET CABAL'} RESHAPES TRUTH`
      ],
      ZONE: [
        `${playerName} ESTABLISHES INFLUENCE IN KEY REGION`,
        `BREAKING: ${isAI ? 'DIGITAL INFILTRATION' : 'COVERT OPERATIONS'} EXPAND TERRITORY`,
        `LOCAL REPORTS: ${isAI ? 'ALGORITHMIC PRESENCE' : 'SHADOW NETWORK'} GAINS FOOTHOLD`
      ],
      ATTACK: [
        `${playerName} LAUNCHES COORDINATED ASSAULT`,
        `BREAKING: ${isAI ? 'CYBER WARFARE' : 'BLACK OPS'} TARGET ENEMIES`,
        `CLASSIFIED: ${isAI ? 'DIGITAL STRIKE' : 'SHADOW OPERATION'} ELIMINATES THREATS`
      ],
      TECH: [
        `${playerName} DEPLOYS ADVANCED TECHNOLOGY`,
        `EXCLUSIVE: ${isAI ? 'QUANTUM PROCESSING' : 'EXPERIMENTAL TECH'} CHANGES GAME`,
        `LEAKED: ${isAI ? 'NEURAL NETWORKS' : 'SECRET WEAPONS'} GIVE TACTICAL ADVANTAGE`
      ],
      DEVELOPMENT: [
        `${playerName} ESTABLISHES PERMANENT INFRASTRUCTURE`,
        `BREAKING: ${isAI ? 'AUTOMATED SYSTEMS' : 'SHADOW FACILITIES'} BUILT NATIONWIDE`,
        `INVESTMENT: ${isAI ? 'DIGITAL EMPIRE' : 'UNDERGROUND NETWORK'} EXPANDS OPERATIONS`
      ],
      DEFENSIVE: [
        `${playerName} ACTIVATES SECURITY PROTOCOLS`,
        `BREAKING: ${isAI ? 'FIREWALL SYSTEMS' : 'BUNKER NETWORKS'} REPEL ATTACKS`,
        `ALERT: ${isAI ? 'AUTOMATED DEFENSES' : 'COUNTER-INTELLIGENCE'} THWART ENEMIES`
      ],
      INSTANT: [
        `${playerName} EXECUTES EMERGENCY RESPONSE`,
        `FLASH: ${isAI ? 'INSTANT PROCESSING' : 'RAPID DEPLOYMENT'} CHANGES SITUATION`,
        `URGENT: ${isAI ? 'REAL-TIME ADAPTATION' : 'CRISIS MANAGEMENT'} ACTIVATED`
      ]
    };

    const typeHeadlines = headlines[card.type as keyof typeof headlines] || headlines.ZONE;
    const headline = typeHeadlines[Math.floor(Math.random() * typeHeadlines.length)];
    
    const content = `Sources report that engineered crisis operations have significantly impacted the current information warfare landscape. ${isAI ? 'Artificial intelligence systems' : 'Human operatives'} continue to shape public perception through strategic ${card.type.toLowerCase()} initiatives. Card "${card.name}" was deployed with maximum effectiveness. The operation's success rate remains classified.`;

    return {
      id: `${card.id}-${player}`,
      headline,
      content,
      type: isAI ? 'government' : 'conspiracy',
      imageType: card.type.toLowerCase()
    };
  };

  // Generate headlines from played cards and events
  const cardHeadlines = playedCards.map(pc => generateHeadline(pc.card, pc.player));
  const allHeadlines = [...cardHeadlines, ...events];

  // Advertisements
  const ads = [
    '🛸 Alien Detection Kit - Spot shapeshifters in your neighborhood!\nCall 1-800-WAKE-UP or visit TotallyNotAScam.com',
    '🏠 Underground Bunkers - Premium apocalypse survival. Wi-Fi guaranteed!\nCall 1-800-WAKE-UP or visit TotallyNotAScam.com',
    '👁️ Mind Reading Protection Hats - Block government thought scanners!\nCall 1-800-WAKE-UP or visit TotallyNotAScam.com',
    '🐸 Turn the Frogs Straight Again - Reverse the chemicals! 100% natural!\nCall 1-800-WAKE-UP or visit TotallyNotAScam.com'
  ];
  
  const conspiracies = [
    '• Elvis spotted buying groceries in Area 51 commissary',
    '• Local man claims his toaster is spying on him',
    '• Breaking: All birds confirmed to be government drones',
    '• Chemtrails now available in pumpkin spice flavor',
    '• Bigfoot runs illegal cryptocurrency mining operation',
    '• Moon landing was filmed in a Hollywood basement',
    '• Illuminati infiltrates local book club',
    '• Lizard people control the weather through dance',
    '• Truth serum found in decaf coffee',
    '• Government admits pigeons are surveillance devices'
  ];

  const selectedAds = ads.slice(0, 2);
  const selectedConspiracies = conspiracies.sort(() => 0.5 - Math.random()).slice(0, 4);

  const getImagePlaceholder = (imageType?: string) => {
    const placeholders = {
      media: '[PHOTO: CLASSIFIED MEDIA BRIEFING]',
      zone: '[SATELLITE IMAGE: REDACTED LOCATION]',
      attack: '[PHOTO: OPERATION IN PROGRESS - CLASSIFIED]',
      tech: '[DIAGRAM: EXPERIMENTAL TECHNOLOGY - TOP SECRET]',
      development: '[AERIAL VIEW: CONSTRUCTION SITE - UNAUTHORIZED ACCESS PROHIBITED]',
      defensive: '[PHOTO: SECURITY INSTALLATION - EYES ONLY]',
      instant: '[LIVE FEED: EMERGENCY RESPONSE - SIGNAL INTERCEPTED]'
    };
    return placeholders[imageType as keyof typeof placeholders] || '[PHOTO: CLASSIFIED BY ORDER OF █████████]';
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <Card className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-newspaper-bg border-4 border-newspaper-border ${
        glitching ? 'animate-glitch' : 'animate-scale-in'
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
          
          <div className="text-center space-y-3">
            <div className={`text-5xl font-bold font-serif tracking-wide transition-colors duration-300 ${
              glitching ? 'text-secret-red' : 'text-newspaper-text'
            }`}>
              {masthead}
            </div>
            <div className="text-sm font-serif italic text-newspaper-text/80">
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

        {/* Content */}
        <div className="p-6 grid lg:grid-cols-4 gap-6 bg-newspaper-bg">
          {/* Main Articles - Takes up 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Turn Summary Section */}
            <Card className="p-4 bg-government-blue/10 border-2 border-government-blue">
              <h2 className="text-2xl font-bold mb-3 font-serif text-government-blue">
                TURN SUMMARY - OPERATIONS REPORT
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-bold text-government-blue mb-2">YOUR ACTIONS</h3>
                  {playedCards.filter(pc => pc.player === 'human').length > 0 ? (
                    <ul className="space-y-1">
                      {playedCards.filter(pc => pc.player === 'human').map(pc => (
                        <li key={`human-${pc.card.id}`} className="flex justify-between">
                          <span>• {pc.card.name}</span>
                          <span className="text-government-blue font-mono">[{pc.card.type}]</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">No cards played this turn</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-secret-red mb-2">AI ACTIONS</h3>
                  {playedCards.filter(pc => pc.player === 'ai').length > 0 ? (
                    <ul className="space-y-1">
                      {playedCards.filter(pc => pc.player === 'ai').map(pc => (
                        <li key={`ai-${pc.card.id}`} className="flex justify-between">
                          <span>• {pc.card.name}</span>
                          <span className="text-secret-red font-mono">[{pc.card.type}]</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">No cards played this turn</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Main Headlines */}
            {allHeadlines.slice(0, 3).map((headline, index) => (
              <article key={headline.id} className="border-b-2 border-newspaper-border pb-4">
                <h2 className="text-2xl font-bold mb-3 font-serif text-newspaper-text hover:text-secret-red transition-colors cursor-pointer leading-tight">
                  {headline.headline}
                </h2>
                
                <div className="w-full h-24 bg-gray-300 mb-3 flex items-center justify-center text-gray-600 text-sm border-2 border-gray-400 font-mono">
                  {getImagePlaceholder(headline.imageType)}
                </div>
                
                <p className="text-newspaper-text leading-relaxed font-serif">
                  {headline.content}
                </p>
                
                {index === 0 && (
                  <div className="mt-3 text-sm text-newspaper-text/70 italic">
                    Continued on page A-{Math.floor(Math.random() * 20) + 1}... 
                    <span className="text-secret-red ml-2">[REMAINDER REDACTED]</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2 text-xs text-newspaper-text/60">
                  <span>By: Agent ████████</span>
                  <span>Source: {headline.type === 'conspiracy' ? 'Anonymous Whistleblower' : 'Official Statement'}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-4">
            {/* Advertisements */}
            {selectedAds.map((ad, index) => (
              <Card key={index} className={`p-3 bg-yellow-500/90 text-black border-4 border-black transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0 transition-transform`}>
                <h4 className="font-bold text-center mb-2 font-mono text-sm">⚠️ ADVERTISEMENT ⚠️</h4>
                <div className="text-center text-xs font-mono whitespace-pre-wrap">
                  {ad}
                </div>
              </Card>
            ))}

            {/* Conspiracy Corner */}
            <Card className="p-3 bg-red-900/20 border-4 border-secret-red relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-secret-red opacity-75"></div>
              <h4 className="font-bold mb-2 font-mono text-secret-red text-center text-sm">
                📡 CONSPIRACY CORNER 📡
              </h4>
              <div className="text-xs space-y-1 font-mono">
                {selectedConspiracies.map((item, i) => (
                  <div key={i} className="text-newspaper-text opacity-90">
                    {item}
                  </div>
                ))}
              </div>
              <div className="text-xs text-center mt-2 text-secret-red font-bold">
                CITIZEN TIPS: 1-800-TRUTH-ME
              </div>
            </Card>

            {/* Truth-O-Meter Stats */}
            <Card className="p-3 bg-government-blue/10 border-2 border-government-blue">
              <h4 className="font-bold mb-2 font-mono text-government-blue text-center text-sm">📊 TRUTH-O-METER™</h4>
              <div className="text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Cards Played:</span>
                  <span className="text-truth-red font-bold">{playedCards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Human Actions:</span>
                  <span className="text-government-blue font-bold">{playedCards.filter(pc => pc.player === 'human').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Actions:</span>
                  <span className="text-secret-red font-bold">{playedCards.filter(pc => pc.player === 'ai').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paranoia Level:</span>
                  <span className="text-yellow-500 font-bold">MAXIMUM</span>
                </div>
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