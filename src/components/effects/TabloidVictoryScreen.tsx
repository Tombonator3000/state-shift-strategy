import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import EndCredits from '@/components/game/EndCredits';

type ImpactType = 'capture' | 'truth' | 'ip' | 'damage' | 'support';

interface AgendaSummary {
  title: string;
  faction: 'truth' | 'government' | 'both';
  progress: number;
  target: number;
  completed: boolean;
  revealed: boolean;
}

interface MVPDetails {
  cardId: string;
  cardName: string;
  player: 'human' | 'ai';
  faction: 'truth' | 'government';
  truthDelta: number;
  ipDelta: number;
  aiIpDelta: number;
  capturedStates: string[];
  damageDealt: number;
  round: number;
  turn: number;
  impactType: ImpactType;
  impactValue: number;
  impactLabel: string;
  highlight: string;
}

interface TabloidVictoryScreenProps {
  isVisible: boolean;
  isVictory: boolean;
  victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null;
  playerFaction: 'truth' | 'government';
  gameStats: {
    rounds: number;
    roundNumber?: number;
    finalTruth: number;
    playerIP: number;
    aiIP: number;
    playerStates: number;
    aiStates: number;
    mvp?: MVPDetails;
    playerSecretAgenda?: AgendaSummary;
    aiSecretAgenda?: AgendaSummary;
  };
  onClose: () => void;
  onMainMenu: () => void;
}

const TabloidVictoryScreen = ({ 
  isVisible, 
  isVictory, 
  victoryType, 
  playerFaction, 
  gameStats, 
  onClose,
  onMainMenu 
}: TabloidVictoryScreenProps) => {
  const [glitching, setGlitching] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti particles
      const particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2000
      }));
      setConfetti(particles);

      // Glitch effect
      const shouldGlitch = Math.random() < 0.2;
      if (shouldGlitch) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 1500);
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const completedRounds = Math.max(0, Math.floor(gameStats.rounds ?? 0));
  const displayRoundNumber = gameStats.roundNumber && gameStats.roundNumber > 0
    ? gameStats.roundNumber
    : Math.max(1, completedRounds || 1);
  const battleDescriptor = playerFaction === 'government' ? 'information warfare' : 'awakening operations';
  const roundSummaryFragment = completedRounds === 0
    ? 'before the first full round could even conclude'
    : `after ${completedRounds} full round${completedRounds === 1 ? '' : 's'} of intense ${battleDescriptor}`;

  const formatSignedNumber = (value: number) => {
    const rounded = Math.round(value);
    if (rounded > 0) return `+${rounded}`;
    if (rounded < 0) return `${rounded}`;
    return '0';
  };

  const formatPercent = (value: number) => {
    const rounded = Math.round(value);
    if (rounded > 0) return `+${rounded}%`;
    if (rounded < 0) return `${rounded}%`;
    return '0%';
  };

  const formatImpactValue = (mvp: MVPDetails): string => {
    switch (mvp.impactType) {
      case 'capture':
        return `${mvp.impactValue} state${mvp.impactValue === 1 ? '' : 's'}`;
      case 'truth':
        return `${formatPercent(mvp.impactValue)}`;
      case 'ip':
        return `${formatSignedNumber(mvp.impactValue)} IP swing`;
      case 'damage':
        return `${Math.round(mvp.impactValue)} damage`; 
      case 'support':
      default:
        return 'Momentum play';
    }
  };

  const formatAgendaProgress = (agenda: AgendaSummary): string => {
    return agenda.target > 0 ? `${agenda.progress}/${agenda.target}` : `${agenda.progress}`;
  };

  const getMvpStatLines = (mvp: MVPDetails): string[] => {
    const lines: string[] = [];
    if (mvp.truthDelta !== 0) {
      lines.push(`Truth delta: ${formatPercent(mvp.truthDelta)}`);
    }

    const operativeIp = mvp.player === 'human' ? mvp.ipDelta : mvp.aiIpDelta;
    const opponentIp = mvp.player === 'human' ? mvp.aiIpDelta : mvp.ipDelta;
    if (operativeIp !== 0 || opponentIp !== 0) {
      const segments: string[] = [];
      if (operativeIp !== 0) {
        segments.push(`${mvp.player === 'human' ? 'Operative' : 'AI'} IP ${formatSignedNumber(operativeIp)}`);
      }
      if (opponentIp !== 0) {
        segments.push(`${mvp.player === 'human' ? 'AI' : 'Operative'} IP ${formatSignedNumber(opponentIp)}`);
      }
      if (segments.length) {
        lines.push(segments.join(' | '));
      }
    }

    if (mvp.damageDealt > 0) {
      lines.push(`Damage dealt: ${Math.round(mvp.damageDealt)}`);
    }

    if (mvp.capturedStates.length > 0) {
      lines.push(`Captured: ${mvp.capturedStates.join(', ')}`);
    }

    return lines.slice(0, 3);
  };

  const buildMvpHeadline = (mvp: MVPDetails): string => {
    const loudName = mvp.cardName.toUpperCase();
    switch (mvp.impactType) {
      case 'capture':
        return `${loudName} SWEEPS ${mvp.impactValue} STATE${mvp.impactValue === 1 ? '' : 'S'}!`;
      case 'truth':
        return `${loudName} ${mvp.faction === 'truth' ? 'IGNITES' : 'SUPPRESSES'} TRUTH ${formatPercent(mvp.impactValue)}!`;
      case 'ip':
        return `${loudName} CHANNELS ${formatSignedNumber(mvp.impactValue)} IP POWER SURGE!`;
      case 'damage':
        return `${loudName} CRIPPLES OPPOSITION WITH ${Math.round(mvp.impactValue)} DAMAGE!`;
      case 'support':
      default:
        return `${loudName} NAMED OPERATION MVP IN CLUTCH MANEUVER!`;
    }
  };

  const generateHeadlines = () => {
    const headlines: string[] = [];
    
    if (isVictory) {
      // Faction-aware victory headlines
      if (playerFaction === 'government') {
        switch (victoryType) {
          case 'truth':
            headlines.push(`TRUTH SUPPRESSED! Disinformation Triumph at ${gameStats.finalTruth}%!`);
            headlines.push(`PUBLIC REMAINS CALM — BECAUSE THEY HAVE NO IDEA.`);
            break;
          case 'states':
            headlines.push(`STABILITY OPERATIONS COMPLETE! ${gameStats.playerStates} States Secured!`);
            headlines.push(`HOMELAND DEFENSE GRID ACTIVATED — Citizens Sleep Soundly!`);
            break;
          case 'ip':
            headlines.push(`OPERATIONAL FUNDING MAXIMIZED! Network Power: ${gameStats.playerIP} IP!`);
            headlines.push(`SHADOW BUDGET APPROVED — Pentagon Takes Notes!`);
            break;
          case 'agenda': {
            const mission = gameStats.playerSecretAgenda?.title ?? 'CLASSIFIED MISSION';
            headlines.push(`CLASSIFIED MISSION SUCCESS! Operation: ${mission}!`);
            headlines.push(`MEN IN BLACK CELEBRATE — With Decaf Coffee!`);
            break;
          }
        }
      } else {
        switch (victoryType) {
          case 'truth':
            headlines.push(`DISCLOSURE EVENT! Public Awakening Reaches ${gameStats.finalTruth}%!`);
            headlines.push(`EYES OPEN: OFFICIALS BAFFLED, COFFEE SPILLS.`);
            break;
          case 'states':
            headlines.push(`LIBERATION COMPLETE! ${gameStats.playerStates} States Awakened!`);
            headlines.push(`TRUTH NETWORK SPREADS — Tinfoil Sales Soar!`);
            break;
          case 'ip':
            headlines.push(`RESISTANCE FUNDING PEAKS! Network Power: ${gameStats.playerIP} IP!`);
            headlines.push(`GRASSROOTS REVOLUTION — Aliens Take Notice!`);
            break;
          case 'agenda': {
            const mission = gameStats.playerSecretAgenda?.title ?? 'TRUTH MISSION';
            headlines.push(`TRUTH MISSION ACCOMPLISHED! Operation: ${mission}!`);
            headlines.push(`WHISTLEBLOWERS UNITE — Reality TV Show Imminent!`);
            break;
          }
        }
      }
    } else {
      const aiAgendaTitle = (() => {
        if (!gameStats.aiSecretAgenda) {
          return undefined;
        }
        if (gameStats.aiSecretAgenda.revealed || gameStats.aiSecretAgenda.completed) {
          return gameStats.aiSecretAgenda.title;
        }
        return 'Classified Operation';
      })();

      if (victoryType === 'agenda' && aiAgendaTitle) {
        if (playerFaction === 'government') {
          headlines.push(`TRUTH OPERATION "${aiAgendaTitle.toUpperCase()}" TOPPLES COVER STORY!`);
          headlines.push(`CITIZENS DEMAND RECEIPTS — AND THEY HAVE THEM.`);
        } else {
          headlines.push(`DEEP STATE OPERATION "${aiAgendaTitle.toUpperCase()}" EXECUTED FLAWLESSLY!`);
          headlines.push(`BLACK BUDGET PARTY — INVITATION DENIED.`);
        }
      } else if (playerFaction === 'government') {
        headlines.push(`TRUTH RUNS RAMPANT! Cover Story In Tatters.`);
        headlines.push(`LOCAL MAN (YOU) DISCOVERS CONSEQUENCES.`);
      } else {
        headlines.push(`NARRATIVE LOCKDOWN! Resistance Memes Not Enough.`);
        headlines.push(`SHEEP REMAIN ASLEEP — BIG BROTHER SMILES.`);
      }
    }

    // Universal headlines with faction flavor
    headlines.push(`Round ${displayRoundNumber} ${isVictory ? 'Triumph' : 'Disaster'}: ${gameStats.playerStates}-${gameStats.aiStates} State Split!`);
    if (gameStats.mvp) {
      headlines.push(buildMvpHeadline(gameStats.mvp));
    }
    headlines.push(`Florida Man ${getRandomFloridaAntic()} During Final Count!`);

    return headlines.slice(0, 4);
  };

  const getRandomFloridaAntic = () => {
    const antics = [
      "Builds Time Machine",
      "Adopts Alien Pet",
      "Declares War on Gravity",
      "Opens Dimension Portal",
      "Marries Pizza Slice",
      "Becomes Cryptid Mayor"
    ];
    return antics[Math.floor(Math.random() * antics.length)];
  };

  const getFakeAds = () => {
    const govAds = [
      "Reptile Thermos™ — keeps coffee hot, blood cold.",
      "Time-Travel Insurance — covered yesterday.",
      "Official Denial Training — \"Nothing to see here!\"",
      "Memory Foam Pillows — now with selective amnesia!"
    ];
    
    const truthAds = [
      "Anonymous Leak Platform — 'We come in peace, mostly'.",
      "Psychic Wi-Fi — 6G Chakra Plan.",
      "Tinfoil Hat Boutique — Fashion meets Function!",
      "Abductee Singles Hotline — 'Probed and ready to mingle!'"
    ];
    
    const universal = [
      "Bat Boy Marries Vending Machine — RSVP now!",
      "Florida Man Life Coach — \"Embrace the Chaos!\""
    ];
    
    const factionAds = playerFaction === 'government' ? govAds : truthAds;
    return [...factionAds.slice(0, 1), ...universal.slice(0, 1)];
  };

  const getConspiracyTheory = () => {
    if (isVictory) {
      return playerFaction === 'truth' 
        ? "The simulation is cracking! We're breaking through the matrix!"
        : "Order from chaos achieved. The plan proceeds as foretold.";
    } else {
      return playerFaction === 'truth'
        ? "They got us this time, but the truth seeds are planted..."
        : "Even the best operations sometimes require... recalibration.";
    }
  };

  const headlines = generateHeadlines();
  const fakeAds = getFakeAds();
  const { playerStates, aiStates } = gameStats;
  
  const factionColors = playerFaction === 'government' 
    ? 'border-government-blue bg-government-blue/5' 
    : 'border-truth-red bg-truth-red/5';
  
  const factionBadge = playerFaction === 'government' 
    ? '🦎 OPERATIONAL UPDATE' 
    : '👁️ DISCLOSURE UPDATE';
  
  const networkLabel = playerFaction === 'government' 
    ? 'Operative Network' 
    : 'Resistance Network';
  
  const truthMeterLabel = playerFaction === 'government' 
    ? 'Suppression Index' 
    : 'Awakening Index';
  
  const statesLabel = playerFaction === 'government' 
    ? 'Stability Ops' 
    : 'Liberated States';

  if (showCredits) {
    return (
      <EndCredits
        isVisible={showCredits}
        playerFaction={playerFaction}
        onClose={() => {
          setShowCredits(false);
          onMainMenu();
        }}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-label={isVictory ? "Victory - Extra Edition" : "Defeat - Extra Edition"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault(); // Prevent closing with ESC - must use buttons
        }
      }}
    >
      {/* Confetti */}
      {isVictory && confetti.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-truth-red animate-[confetti_3s_ease-out_infinite]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`
          }}
        />
      ))}

      <Card className="bg-newspaper-bg text-newspaper-text p-0 max-w-6xl max-h-[95vh] overflow-y-auto border-4 border-newspaper-border transform animate-[newspaper-spin_0.8s_ease-out] shadow-2xl font-serif"
        onClick={(e) => e.stopPropagation()}>
        {/* Newspaper Header */}
        <div className="bg-newspaper-header p-4 sm:p-6 border-b-8 border-newspaper-border relative">
          {/* Faction Badge */}
          <div className="absolute top-2 left-2 bg-newspaper-accent text-white px-2 py-1 text-xs font-bold rounded transform -rotate-2">
            {factionBadge}
          </div>
          
          {/* Masthead */}
          <div className="text-center mb-4">
            <div className="text-xs font-bold tracking-widest mb-1 opacity-60">ESTABLISHED 1947 • CIRCULATION: CLASSIFIED</div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter font-serif mb-1">
              THE WEEKLY PARANOID NEWS
            </h1>
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold border-t border-b border-newspaper-border py-1 gap-1">
              <span>Vol. 77, No. {displayRoundNumber}</span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>Price: YOUR SOUL</span>
            </div>
          </div>
          
          {/* Main Headline */}
          <div className="text-center py-4 border-y-4 border-newspaper-border bg-newspaper-bg/50">
            <div className={`text-5xl sm:text-7xl font-black tracking-tight font-serif leading-none ${
              isVictory ? 'text-newspaper-accent' : 'text-red-600'
            } ${glitching ? 'animate-pulse text-truth-red' : ''}`}>
              {isVictory ? 'VICTORY!' : 'DEFEAT!'}
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-2 tracking-wide">
              {isVictory 
                ? playerFaction === 'government' ? 'SHADOW OPERATIVE SUCCEEDS' : 'DISCLOSURE EVENT CONFIRMED'
                : playerFaction === 'government' ? 'OPERATION COMPROMISED' : 'NARRATIVE LOCKDOWN ACTIVATED'
              }
            </div>
          </div>
          
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Article */}
            <div className="lg:col-span-3">
              {headlines.map((headline, index) => (
                <article key={index} className={`${index === 0 ? 'mb-6' : 'mb-4'} ${index > 0 ? 'border-t border-newspaper-border pt-4' : ''}`}>
                  <h2 className={`font-black font-serif leading-tight mb-2 ${
                    index === 0 ? 'text-3xl' : index === 1 ? 'text-xl' : 'text-lg'
                  }`}>
                    {headline}
                  </h2>
                   {index === 0 && (
                     <div className="sm:columns-2 gap-6 text-sm leading-relaxed text-justify">
                       <p className="mb-3">
                         <span className="float-left text-4xl sm:text-6xl font-black leading-none mr-2 mt-1">{isVictory ? 'I' : 'I'}</span>
                         n a {isVictory ? 'stunning victory that has shocked the intelligence community' : 'devastating defeat that will echo through classified corridors'}, 
                        the {playerFaction === 'truth' ? 'Truth Seekers resistance movement' : 'Government shadow operations'} have {isVictory ? 'emerged triumphant' : 'suffered catastrophic losses'}
                        {` ${roundSummaryFragment}.`}
                       </p>
                       <p className="mb-3">
                         {playerFaction === 'government' 
                           ? `Classified sources from within the Pentagon report ${isVictory ? 'successful narrative control' : 'containment breach'} as the national ${truthMeterLabel.toLowerCase()} reached ${gameStats.finalTruth}%. Agency analysts confirm that operational networks have ${isVictory ? 'maintained strategic dominance' : 'suffered critical exposure'} across key territories.`
                           : `Underground sources from the resistance network report ${isVictory ? 'breakthrough awakening events' : 'suppression protocols activated'} as the national ${truthMeterLabel.toLowerCase()} reached ${gameStats.finalTruth}%. Independent analysts confirm that truth distribution networks have ${isVictory ? 'achieved critical mass' : 'encountered systematic shutdown'} across liberated zones.`
                         }
                       </p>
                       <p className="mb-3">
                         "This changes everything," whispered a high-ranking {playerFaction === 'government' ? 'operative' : 'truth seeker'} who requested anonymity while adjusting their {playerFaction === 'government' ? 'security clearance badge' : 'tin foil hat'}. 
                         "The {playerFaction === 'government' ? 'operational parameters' : 'simulation matrix'} have been permanently altered. We're not in Kansas anymore."
                       </p>
                       <p>
                         Emergency sessions have been called at locations that officially don't exist, while citizens remain blissfully unaware that their reality 
                         has been fundamentally {isVictory ? 'secured' : 'compromised'} during their morning coffee.
                       </p>
                     </div>
                   )}
                  {index === 1 && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="w-full h-20 bg-newspaper-header border border-newspaper-border flex items-center justify-center text-xs font-bold mb-2">
                          📸 CLASSIFIED SURVEILLANCE PHOTO
                        </div>
                        <p className="text-sm leading-relaxed text-justify">
                          Exclusive footage captured by our network of citizen journalists reveals the exact moment when 
                          the balance of power shifted. Government sources neither confirm nor deny the authenticity of these images.
                        </p>
                      </div>
                    </div>
                  )}
                  {index > 1 && (
                    <p className="text-sm opacity-80 italic">
                      Developing story... More classified details on page 7 (if you have proper clearance level).
                    </p>
                  )}
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Final Intel Report */}
              <div className={`bg-newspaper-header/50 p-4 border-2 ${isVictory ? factionColors.split(' ')[0] : 'border-red-500'}`}>
                <h3 className="text-lg font-black text-center mb-3 font-serif border-b border-newspaper-border pb-2">
                  📊 FINAL INTEL REPORT
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span className="font-bold">OPERATION STATUS:</span>
                    <span className={`font-black ${isVictory ? 'text-newspaper-accent' : 'text-red-600'}`}>
                      {isVictory ? 'SUCCESS' : 'COMPROMISED'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>Full Rounds:</span>
                    <span className="font-bold">{completedRounds}</span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>{truthMeterLabel}:</span>
                    <span className="font-bold">{gameStats.finalTruth}%</span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>{networkLabel}:</span>
                    <span className="font-bold">{gameStats.playerIP} IP</span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>Enemy Network:</span>
                    <span className="font-bold">{gameStats.aiIP} IP</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>{statesLabel}:</span>
                    <span className="font-bold">{playerStates} vs {aiStates}</span>
                  </div>
                  {gameStats.mvp && (
                    <div className="border-t border-newspaper-border pt-2 mt-2 text-left">
                      <div className="text-xs font-bold opacity-80 text-center">
                        {playerFaction === 'government' ? 'ASSET OF THE MATCH' : 'TRUTH MVP'}
                      </div>
                      <div className={`font-black text-sm text-center ${playerFaction === 'government' ? 'text-government-blue' : 'text-truth-red'}`}>
                        {gameStats.mvp.cardName}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide text-black/70 mt-1 text-center">
                        {gameStats.mvp.impactLabel}: {formatImpactValue(gameStats.mvp)}
                      </div>
                      <div className="text-xs italic mt-2 text-black/70 text-justify">
                        {gameStats.mvp.highlight}
                      </div>
                      <div className="mt-2 space-y-1 text-[10px] uppercase tracking-wide text-black/60">
                        <div className="flex justify-between">
                          <span>Round</span>
                          <span>{(gameStats.mvp.round && gameStats.mvp.round > 0) ? gameStats.mvp.round : displayRoundNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Turn</span>
                          <span>{(gameStats.mvp.turn && gameStats.mvp.turn > 0) ? gameStats.mvp.turn : 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operative</span>
                          <span>{gameStats.mvp.player === 'human' ? 'Player' : 'AI Strategist'}</span>
                        </div>
                        {getMvpStatLines(gameStats.mvp).map((line, index) => (
                          <div
                            key={index}
                            className="text-left normal-case tracking-normal text-black/70 first-letter:uppercase"
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(gameStats.playerSecretAgenda || gameStats.aiSecretAgenda) && (
                    <div className="border-t border-newspaper-border pt-2 mt-2 text-center space-y-2">
                      <div className="text-xs font-bold opacity-80">SECRET OPERATIONS</div>
                      {gameStats.playerSecretAgenda && (
                        <div>
                          <div className="text-[11px] uppercase tracking-wide opacity-70">Player Objective</div>
                          <div className={`font-bold text-sm ${gameStats.playerSecretAgenda.completed ? 'text-newspaper-accent' : 'text-red-600'}`}>
                            {gameStats.playerSecretAgenda.title}
                          </div>
                          <div className="text-xs font-bold">
                            {gameStats.playerSecretAgenda.completed ? '✓ PASSED' : '✗ FAILED'} ({formatAgendaProgress(gameStats.playerSecretAgenda)})
                          </div>
                        </div>
                      )}
                      {gameStats.aiSecretAgenda && (
                        <div>
                          <div className="text-[11px] uppercase tracking-wide opacity-70">AI Objective</div>
                          <div className={`font-bold text-sm ${gameStats.aiSecretAgenda.completed ? 'text-newspaper-accent' : 'text-red-600'}`}>
                            {(gameStats.aiSecretAgenda.revealed || gameStats.aiSecretAgenda.completed)
                              ? gameStats.aiSecretAgenda.title
                              : 'CLASSIFIED OPERATION'}
                          </div>
                          <div className="text-xs font-bold">
                            {gameStats.aiSecretAgenda.completed ? '✓ PASSED' : '✗ FAILED'} ({formatAgendaProgress(gameStats.aiSecretAgenda)})
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Weather & Classified Ads */}
              <div className="bg-newspaper-header/30 p-3 border border-newspaper-border">
                <h4 className="font-black text-sm text-center mb-2 border-b border-newspaper-border pb-1">
                  TODAY'S WEATHER
                </h4>
                <div className="text-xs text-center">
                  <div>🌫️ Fog of War: Heavy</div>
                  <div>🔍 Visibility: Classified</div>
                  <div>🎭 Chance of Deception: 99%</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-sm text-center border-b border-newspaper-border pb-1">
                  📢 CLASSIFIED MARKETPLACE
                </h4>
                {fakeAds.map((ad, index) => (
                  <div key={index} className="bg-newspaper-header/20 p-2 text-xs text-center border border-newspaper-border/50">
                    {ad}
                  </div>
                ))}
              </div>

              {/* Conspiracy Corner */}
              <div className="bg-truth-red/10 p-3 border-2 border-truth-red/40">
                <h4 className="font-black text-sm text-center mb-2 text-truth-red border-b border-truth-red/30 pb-1">
                  🔻 DEEP STATE UPDATE
                </h4>
                <div className="text-xs italic text-center leading-relaxed">
                  {getConspiracyTheory()}
                </div>
              </div>

              {/* Stock Market Ticker */}
              <div className="bg-newspaper-header/30 p-2 border border-newspaper-border">
                <h4 className="font-black text-xs text-center mb-1">📈 SHADOW MARKETS</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Aluminum Foil:</span>
                    <span className="text-green-600">↗ +420%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trust Index:</span>
                    <span className="text-red-600">↘ -{100 - gameStats.finalTruth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paranoia Futures:</span>
                    <span className="text-green-600">↗ +∞%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-header border-t-4 border-newspaper-border p-4">
          <div className="flex justify-between items-center text-xs text-newspaper-bg border-b border-newspaper-border pb-2 mb-3">
            <div>© 2024 The Weekly Paranoid News</div>
            <div>All Rights Reserved Under Alien Treaty 4B7</div>
            <div>Printed on Recycled Surveillance Reports</div>
          </div>
          <div className="text-center">
            <div className="text-xs mb-4 italic text-newspaper-bg/80">
              "Remember: They're Watching, But So Are We" • Established When Truth Mattered
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMainMenu();
                }}
                variant="outline"
                className="font-bold text-lg px-8 py-3 bg-newspaper-bg hover:bg-newspaper-bg/90 text-newspaper-text border-2 border-newspaper-border shadow-lg transform hover:scale-105 transition-all"
              >
                📰 Return to Main Menu
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCredits(true);
                }}
                className={`font-bold text-lg px-8 py-3 ${
                  isVictory 
                    ? 'bg-newspaper-accent hover:bg-newspaper-accent/80 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } border-2 border-newspaper-border shadow-lg transform hover:scale-105 transition-all`}
              >
                🎬 End Credits
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TabloidVictoryScreen;