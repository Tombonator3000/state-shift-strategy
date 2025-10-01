import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { GameCard } from '@/rules/mvp';
import type { GameEvent } from '@/data/eventDatabase';
import { formatComboReward, getLastComboSummary } from '@/game/comboEngine';

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
}

interface NewspaperProps {
  events: GameEvent[];
  playedCards: PlayedCard[];
  faction: 'government' | 'truth';
  onClose: () => void;
}

interface NewspaperData {
  mastheads: string[];
  ads: string[];
}

interface Article {
  id: string;
  title: string;
  headline: string;
  content: string;
  image: string;
  isEvent: boolean;
  isCard?: boolean;
  player?: 'human' | 'ai';
}

const Newspaper = ({ events, playedCards, faction, onClose }: NewspaperProps) => {
  const [glitching, setGlitching] = useState(false);
  const [masthead, setMasthead] = useState('THE PARANOID TIMES');
  const [newspaperData, setNewspaperData] = useState<NewspaperData | null>(null);

  // Load newspaper data and hide card layers when newspaper opens
  useEffect(() => {
    const loadNewspaperData = async () => {
      try {
        const response = await fetch('/data/newspaperData.json');
        const data = await response.json();
        setNewspaperData(data);
        
        // Set random masthead
        const randomMasthead = data.mastheads[Math.floor(Math.random() * data.mastheads.length)];
        setMasthead(randomMasthead);
      } catch (error) {
        console.error('Failed to load newspaper data:', error);
      }
    };

    loadNewspaperData();

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
        }, 800);
        
        return () => clearTimeout(resetTimer);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [newspaperData]);

  // Generate card articles with tabloid-style headlines
  const generateCardArticle = (card: GameCard, player: 'human' | 'ai'): Article => {
    const tabloidHeadlines = [
      `"${card.name}" SHOCKS NATION`,
      `EXCLUSIVE: ${card.name.toUpperCase()} LEAKED!`,
      `BREAKING: ${card.name} EXPOSED!`,
      `SOURCES CONFIRM: ${card.name} IS REAL`,
      `WHISTLEBLOWER REVEALS: ${card.name}`,
      `CLASSIFIED DOCS: ${card.name} UNCOVERED`,
      `INSIDER TELLS ALL: ${card.name} TRUTH`,
      `EXPERTS BAFFLED BY ${card.name}`,
      `${card.name}: THE SHOCKING TRUTH`,
      `GOVERNMENT DENIES ${card.name} EXISTS`
    ];

    const headline = tabloidHeadlines[Math.floor(Math.random() * tabloidHeadlines.length)];
    
    // Use flavor text or generate Weekly World News style content
    const flavorText = card.flavor ?? card.flavorGov ?? card.flavorTruth;
    const tabloidContent = flavorText || 
      `Local sources report bizarre activities linked to what witnesses describe as "${card.name}". Government officials refuse comment, but experts claim this could change everything. "I've never seen anything like it," said one anonymous whistleblower. Full story inside – if the Men in Black don't stop us first!`;

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
      id: `card-${card.id}-${player}`,
      title: card.name,
      headline,
      content: `${tabloidContent} ${editorialComments[Math.floor(Math.random() * editorialComments.length)]}`,
      image: '/placeholder-card.png', // Default since cards don't have images in the type
      isCard: true,
      isEvent: false,
      player
    };
  };

  // Generate articles from played cards and events
  const cardArticles = playedCards.map(pc => generateCardArticle(pc.card, pc.player));
  
  const formatEventImpact = (event: GameEvent): string | null => {
    const effects = event.effects;
    if (!effects) return null;

    const parts: string[] = [];
    const formatDelta = (value: number | undefined, label: string) => {
      if (value === undefined || value === 0) return;
      const sign = value > 0 ? '+' : '';
      parts.push(`${sign}${value} ${label}`);
    };

    formatDelta(effects.truth, 'Truth');
    formatDelta(effects.ip, 'IP');

    if (effects.cardDraw !== undefined && effects.cardDraw !== 0) {
      const cardLabel = Math.abs(effects.cardDraw) === 1 ? 'Card' : 'Cards';
      const sign = effects.cardDraw > 0 ? '+' : '';
      parts.push(`${sign}${effects.cardDraw} ${cardLabel}`);
    }

    formatDelta(effects.truthChange, 'Truth Change');
    formatDelta(effects.ipChange, 'IP Change');
    formatDelta(effects.defenseChange, 'Defense');

    if (effects.stateEffects) {
      formatDelta(effects.stateEffects.pressure, 'State Pressure');
      formatDelta(effects.stateEffects.defense, 'State Defense');
    }

    if (effects.skipTurn) {
      parts.push('Skip Turn');
    }

    if (effects.doubleIncome) {
      parts.push('Double Income');
    }

    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Convert events to articles with red styling for events
  const eventArticles: Article[] = events.map(event => {
    const impact = formatEventImpact(event);
    const baseHeadline = event.headline || event.title;

    return {
      id: event.id,
      title: event.title,
      headline: impact ? `${baseHeadline} (${impact})` : baseHeadline,
      content: event.content,
      image: '/placeholder-event.png',
      isEvent: true
    };
  });

  const allArticles: Article[] = [...cardArticles, ...eventArticles];

  // Get random ads from newspaper data
  const getRandomAds = (count: number) => {
    if (!newspaperData?.ads) return [];
    const shuffled = [...newspaperData.ads].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const humorAds = getRandomAds(3);
  
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

  const selectedConspiracies = conspiracies.sort(() => 0.5 - Math.random()).slice(0, 4);

  const getImagePlaceholder = (event: GameEvent) => {
    const placeholders = {
      conspiracy: '[LEAKED PHOTO: CLASSIFIED OPERATIONS]',
      government: '[OFFICIAL PHOTO: PRESS BRIEFING]',
      truth: '[SURVEILLANCE FOOTAGE: WHISTLEBLOWER EVIDENCE]',
      crisis: '[BREAKING NEWS: EMERGENCY SITUATION]',
      opportunity: '[EXCLUSIVE: INSIDER ACCESS]',
      random: '[PHOTO: CLASSIFIED BY ORDER OF █████████]'
    };
    return placeholders[event.type as keyof typeof placeholders] || '[PHOTO: CLASSIFIED BY ORDER OF █████████]';
  };

  const comboSummary = useMemo(() => getLastComboSummary(), [playedCards, events]);
  const comboReport = useMemo(() => {
    if (!comboSummary || comboSummary.results.length === 0) {
      return null;
    }
    return {
      player: comboSummary.player,
      turn: comboSummary.turn,
      entries: comboSummary.results.map(result => ({
        id: result.definition.id,
        name: result.definition.name,
        description: result.definition.description,
        reward: formatComboReward(result.appliedReward, { faction: comboSummary.playerFaction })
          .replace(/[()]/g, '')
          .trim(),
        matched: result.details.matchedPlays.map(play => play.cardName).filter(Boolean),
        fxText: result.definition.fxText,
      })),
    };
  }, [comboSummary]);
  const comboOwnerLabel = useMemo(() => {
    if (!comboReport) {
      return null;
    }
    if (comboReport.player === 'P1') {
      return 'Operatives';
    }
    if (comboReport.player === 'P2') {
      return 'Opposition';
    }
    return comboReport.player;
  }, [comboReport]);

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
                      {playedCards.filter(pc => pc.player === 'human').map((pc, idx) => (
                        <li key={`human-${pc.card.id}-${idx}`} className="flex justify-between">
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
                      {playedCards.filter(pc => pc.player === 'ai').map((pc, idx) => (
                        <li key={`ai-${pc.card.id}-${idx}`} className="flex justify-between">
                          <span>• {pc.card.name}</span>
                          <span className="text-secret-red font-mono">[{pc.card.type}]</span>
                        </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-500">No cards played this turn</p>
                )}
              </div>

              {comboReport ? (
                <div className="md:col-span-2 rounded border border-government-blue/40 bg-government-blue/5 p-3">
                  <div className="flex items-center justify-between text-xs font-mono text-government-blue">
                    <span>{comboOwnerLabel ? `${comboOwnerLabel} · ` : ''}Turn {comboReport.turn}</span>
                    <span>
                      {comboReport.entries.length} combo{comboReport.entries.length === 1 ? '' : 's'} resolved
                    </span>
                  </div>
                  <div className="mt-2 space-y-2 text-sm">
                    {comboReport.entries.map(entry => (
                      <div
                        key={entry.id}
                        className="border-b border-dashed border-government-blue/50 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex justify-between text-xs font-semibold text-government-blue">
                          <span>{entry.name}</span>
                          {entry.reward ? <span>{entry.reward}</span> : null}
                        </div>
                        <p className="text-xs italic text-newspaper-text/70">{entry.description}</p>
                        {entry.matched.length ? (
                          <div className="text-[11px] font-mono text-newspaper-text/60">
                            Plays: {entry.matched.join(' → ')}
                          </div>
                        ) : null}
                        {entry.fxText ? (
                          <div className="text-[10px] uppercase text-newspaper-text/50">FX: {entry.fxText}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
            </Card>

            {/* Main Articles */}
            {allArticles.slice(0, 4).map((article, index) => {
              const isFilesOnTheLoose = article.id === 'deepfile_dump_crochet_forum';
              return (
                <article
                  key={article.id}
                  className={`border-b-2 border-newspaper-border pb-4 ${
                    isFilesOnTheLoose ? 'animate-pulse ring-2 ring-secret-red/70 shadow-[0_0_20px_rgba(248,113,113,0.4)] rounded-md px-3 py-2' : ''
                  }`}
                >
                  <h2
                    className={`text-3xl font-black mb-3 font-serif leading-tight ${
                      article.isEvent
                        ? 'text-secret-red'
                        : 'text-newspaper-text hover:text-secret-red transition-colors cursor-pointer'
                    } ${isFilesOnTheLoose ? 'drop-shadow-[0_0_18px_rgba(248,113,113,0.6)]' : ''}`}
                  >
                    {article.headline}
                  </h2>

                  {article.image && (
                    <div className="w-full h-32 mb-3 border-2 border-newspaper-border overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-card.png';
                        }}
                      />
                    </div>
                  )}

                  <p
                    className={`leading-relaxed font-serif ${
                      article.isEvent ? 'text-secret-red' : 'text-newspaper-text'
                    } ${isFilesOnTheLoose ? 'animate-pulse drop-shadow-[0_0_12px_rgba(248,113,113,0.5)]' : ''}`}
                  >
                    {article.content}
                  </p>

                  {index === 0 && (
                    <div className="mt-3 text-sm text-newspaper-text/70 italic">
                      Continued on page A-{Math.floor(Math.random() * 20) + 1}...
                      <span className="text-secret-red ml-2">[REMAINDER REDACTED]</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 text-xs text-newspaper-text/60">
                    <span>By: {article.isEvent ? 'Crisis Reporter' : 'Agent ████████'}</span>
                    <span>Source: {article.isEvent ? 'EMERGENCY BROADCAST' : 'Classified Intel'}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-4">
            {/* Humor Advertisements */}
            {humorAds.map((ad, index) => (
              <Card key={index} className={`p-3 bg-yellow-400/95 text-black border-4 border-black transform ${
                index % 3 === 0 ? '-rotate-1' : index % 3 === 1 ? 'rotate-1' : '-rotate-0.5'
              } hover:rotate-0 transition-transform shadow-lg`}>
                <h4 className="font-black text-center mb-2 font-mono text-sm uppercase tracking-wide">
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