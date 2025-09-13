import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Credits from './Credits';
import HowToPlay from './HowToPlay';
import Options from './Options';
import ManageExpansions from './ManageExpansions';
import CardCollection from './CardCollection';
import StartScreenTabloid from './StartScreenTabloid';
import FactionSelectTabloid from './FactionSelectTabloid';
import { useUiTheme } from '@/hooks/useTheme';

interface GameMenuProps {
  onStartGame: (faction: 'government' | 'truth') => Promise<void>;
  onFactionHover?: (faction: 'government' | 'truth' | null) => void;
  audio?: any;
  onBackToMainMenu?: () => void;
  onSaveGame?: () => boolean;
  onShowCardCollection?: () => void;
  getSaveInfo?: () => any;
  onLoadGame?: () => boolean;
}

const GameMenu = ({ onStartGame, onFactionHover, audio, onBackToMainMenu, onSaveGame, onShowCardCollection, getSaveInfo, onLoadGame }: GameMenuProps) => {
  const [uiTheme] = useUiTheme();
  const [glitching, setGlitching] = useState(false);
  const [redactedText, setRedactedText] = useState('SHADOW GOVERNMENT');
  const [showCredits, setShowCredits] = useState(false);
  const [showFactionSelect, setShowFactionSelect] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showManageExpansions, setShowManageExpansions] = useState(false);
  const [subtitleText, setSubtitleText] = useState('PARANOID TIMES EDITION');
  const [quoteText, setQuoteText] = useState('"Where conspiracy theories go to become policy"');
  const [descriptionText, setDescriptionText] = useState('Control the narrative. Manipulate the truth.');
  const [description2Text, setDescription2Text] = useState('Convince people birds are real (or aren\'t).');
  const [promoText, setPromoText] = useState('NOW WITH 420% MORE SATIRE!');
  const [bgLines] = useState(() => Array.from({ length: 30 }, () => ({
    width: Math.random() * 300 + 100,
    top: Math.random() * 100,
    left: Math.random() * 100,
    rotate: Math.random() * 4 - 2,
  })));
  const [showCollection, setShowCollection] = useState(false);

  useEffect(() => {
    const glitchTexts = {
      title: ['SHEEPLE TIMES', 'THE TRUTH DAILY', 'CONSPIRACY NEWS', 'SHADOW GOVERNMENT', 'DEEP STATE WEEKLY', 'LIZARD PEOPLE POST', 'WEEKLY WORLD NEWS', 'TABLOID TRUTH', 'PARANOID PLANET'],
      subtitle: ['PARANOID TIMES EDITION', 'CLASSIFIED EDITION', 'REDACTED DAILY', 'TOP SECRET TIMES', 'CONSPIRACY WEEKLY', 'BIGFOOT WEEKLY', 'ALIEN EDITION', 'CRYPTID CHRONICLES'],
      quote: [
        '"Where conspiracy theories go to become policy"',
        '"All your base are belong to us"',
        '"The cake is a lie"',
        '"Birds aren\'t real and neither are we"',
        '"Trust no one, especially us"',
        '"Making Atlantis Great Again"',
        '"Elvis lever fremdeles"',
        '"Bat Boy seen again in Area 51"',
        '"Bigfoot spotted buying groceries"',
        '"UFO parked illegally downtown"'
      ],
      description: [
        'Control the narrative. Manipulate the truth.',
        'Expose the lies. Reveal the secrets.',
        'Question everything. Believe nothing.',
        'Wake up the sheeple. Join the resistance.',
        'The truth is out there. Probably.',
        'Elvis lever og jobber på McDonald\'s.',
        'Bat Boy elected as local mayor.',
        'Bigfoot runs successful Youtube channel.',
        'Aliens prefer Earth\'s pizza over home food.'
      ],
      description2: [
        'Convince people birds are real (or aren\'t).',
        'Prove that Finland actually exists.',
        'Debate whether the moon is made of cheese.',
        'Investigate if Australia is upside down.',
        'Confirm that cats are government spies.',
        'Woman gives birth to 200-pound baby.',
        'Man marries his own reflection.',
        'Scientists discover portal to Nebraska.',
        'Local dog learns to play piano.'
      ],
      promo: [
        'NOW WITH 420% MORE SATIRE!',
        'NEW! EXTRA CONSPIRACY FLAVORING!',
        'APPROVED BY THE ILLUMINATI!',
        'BANNED IN 47 DIMENSIONS!',
        'NOW WITH REAL LIZARD PEOPLE!',
        'AS SEEN ON ALIEN TV!',
        'BIGFOOT APPROVED!',
        'ELVIS RECOMMENDS THIS GAME!'
      ]
    };

    // Multiple glitch intervals for different elements
    const intervals = [
      // Title glitch
      setInterval(() => {
        if (Math.random() < 0.15) {
          setGlitching(true);
          setRedactedText(glitchTexts.title[Math.floor(Math.random() * glitchTexts.title.length)]);
          setTimeout(() => {
            setGlitching(false);
            setRedactedText('SHADOW GOVERNMENT');
          }, 1500);
        }
      }, Math.random() * 2000 + 2000), // 2-4 seconds

      // Subtitle glitch
      setInterval(() => {
        if (Math.random() < 0.12) {
          setSubtitleText(glitchTexts.subtitle[Math.floor(Math.random() * glitchTexts.subtitle.length)]);
          setTimeout(() => setSubtitleText('PARANOID TIMES EDITION'), 1200);
        }
      }, Math.random() * 3000 + 3000), // 3-6 seconds

      // Quote glitch
      setInterval(() => {
        if (Math.random() < 0.08) {
          setQuoteText(glitchTexts.quote[Math.floor(Math.random() * glitchTexts.quote.length)]);
          setTimeout(() => setQuoteText('"Where conspiracy theories go to become policy"'), 1800);
        }
      }, Math.random() * 4000 + 4000), // 4-8 seconds

      // Description glitch
      setInterval(() => {
        if (Math.random() < 0.1) {
          setDescriptionText(glitchTexts.description[Math.floor(Math.random() * glitchTexts.description.length)]);
          setTimeout(() => setDescriptionText('Control the narrative. Manipulate the truth.'), 1400);
        }
      }, Math.random() * 3500 + 3500),

      // Description2 glitch
      setInterval(() => {
        if (Math.random() < 0.09) {
          setDescription2Text(glitchTexts.description2[Math.floor(Math.random() * glitchTexts.description2.length)]);
          setTimeout(() => setDescription2Text('Convince people birds are real (or aren\'t).'), 1600);
        }
      }, Math.random() * 4000 + 3000),

      // Promo glitch
      setInterval(() => {
        if (Math.random() < 0.11) {
          setPromoText(glitchTexts.promo[Math.floor(Math.random() * glitchTexts.promo.length)]);
          setTimeout(() => setPromoText('NOW WITH 420% MORE SATIRE!'), 2000);
        }
      }, Math.random() * 5000 + 4000)
    ];

    return () => intervals.forEach(clearInterval);
  }, []);

  if (showCredits) {
    return <Credits onClose={() => setShowCredits(false)} />;
  }

  if (showHowToPlay) {
    return <HowToPlay onClose={() => setShowHowToPlay(false)} />;
  }

  if (showOptions) {
    return (
      <Options 
        onClose={() => setShowOptions(false)} 
        onBackToMainMenu={onBackToMainMenu}
        onSaveGame={onSaveGame}
      />
    );
  }

  if (showManageExpansions) {
    return <ManageExpansions onClose={() => setShowManageExpansions(false)} />;
  }

  if (showFactionSelect) {
    return uiTheme === 'tabloid_bw' ? (
      <FactionSelectTabloid
        onStartGame={onStartGame}
        onFactionHover={onFactionHover}
        onBack={() => setShowFactionSelect(false)}
        audio={audio}
      />
    ) : (
      <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
        {/* Redacted background pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-newspaper-text h-6"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 4 - 2}deg)`
              }}
            />
          ))}
        </div>

        <Card className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
          {/* Back button */}
          <Button 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowFactionSelect(false);
            }}
            variant="outline" 
            className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
          >
            ← BACK
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-newspaper-text mb-4">
              SELECT YOUR CONSPIRACY
            </h1>
            <div className="text-sm text-newspaper-text/80 mb-4">
              Choose your side in the ultimate battle for truth
            </div>
          </div>

          {/* Faction Selection */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <Card className="p-6 border-2 border-newspaper-text hover:border-newspaper-text transition-all hover:scale-105 cursor-pointer group bg-newspaper-bg"
                  onMouseEnter={() => onFactionHover?.('government')}
                  onMouseLeave={() => onFactionHover?.(null)}>
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-conspiracy-float">🦎</div>
                <h3 className="font-bold text-xl text-government-blue">
                  DEEP STATE
                </h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Start Truth:</span>
                  <span className="text-government-blue font-bold">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus IP:</span>
                  <span className="text-government-blue font-bold">+10</span>
                </div>
                <div className="text-xs text-newspaper-text/60 mt-2">
                  Access to Lizard People
                </div>
              </div>
              
              <div className="bg-newspaper-text/10 p-3 mb-4 text-xs italic text-newspaper-text">
                "Control the narrative with black helicopters, weather machines, and surprisingly comfortable underground bunkers."
              </div>
              
              <Button 
                onClick={async () => {
                  audio?.playSFX?.('click');
                  await onStartGame('government');
                }}
                className="w-full bg-government-blue hover:bg-government-blue/80 text-white group-hover:animate-pulse"
              >
                Join the Shadow Cabinet
              </Button>
            </Card>

            <Card className="p-6 border-2 border-newspaper-text hover:border-newspaper-text transition-all hover:scale-105 cursor-pointer group bg-newspaper-bg"
                  onMouseEnter={() => onFactionHover?.('truth')}
                  onMouseLeave={() => onFactionHover?.(null)}>
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-conspiracy-float" style={{ animationDelay: '1s' }}>👁️</div>
                <h3 className="font-bold text-xl text-truth-red">
                  TRUTH SEEKERS
                </h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Start Truth:</span>
                  <span className="text-truth-red font-bold">60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus Truth:</span>
                  <span className="text-truth-red font-bold">+10%</span>
                </div>
                <div className="text-xs text-newspaper-text/60 mt-2">
                  Tinfoil Hat Immunity
                </div>
              </div>
              
              <div className="bg-newspaper-text/10 p-3 mb-4 text-xs italic text-newspaper-text">
                "Wake up the sheeple with essential oils, healing crystals, and really long YouTube videos."
              </div>
              
              <Button 
                onClick={async () => {
                  audio?.playSFX?.('click');
                  await onStartGame('truth');
                }}
                className="w-full bg-truth-red hover:bg-truth-red/80 text-white group-hover:animate-pulse"
              >
                Expose the Conspiracy
              </Button>
            </Card>
          </div>
        </Card>
      </div>
    );
  }

  return uiTheme === 'tabloid_bw' ? (
    <>
      <StartScreenTabloid
        onStartGame={() => setShowFactionSelect(true)}
        onManageExpansions={() => setShowManageExpansions(true)}
        onHowToPlay={() => setShowHowToPlay(true)}
        onOptions={() => setShowOptions(true)}
        onCredits={() => setShowCredits(true)}
        onCardCollection={() => setShowCollection(true)}
        onLoadGame={onLoadGame}
        getSaveInfo={getSaveInfo}
        audio={audio}
      />
      <CardCollection open={showCollection} onOpenChange={setShowCollection} />
    </>
  ) : (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      {/* Redacted background pattern */}
      <div className="absolute inset-0 opacity-5">
        {bgLines.map((line, i) => (
          <div 
            key={i}
            className="absolute bg-newspaper-text h-6"
            style={{
              width: `${line.width}px`,
              top: `${line.top}%`,
              left: `${line.left}%`,
              transform: `rotate(${line.rotate}deg)`
            }}
          />
        ))}
      </div>

      <Card className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
        {/* Classified stamps */}
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2">
          EYES ONLY
        </div>

        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold text-newspaper-text mb-2 ${glitching ? 'animate-glitch' : ''}`}>
            {redactedText}
          </h1>
          <div className="text-xl font-medium text-newspaper-text/80 mb-2">
            {subtitleText}
          </div>
          <div className="text-sm font-italic text-newspaper-text/60 mb-4">
            {quoteText}
          </div>
          <div className="text-sm text-newspaper-text/80">
            {descriptionText}
          </div>
          <div className="text-sm text-newspaper-text/80">
            {description2Text}
          </div>
          <div className="text-lg font-bold text-secret-red mt-4">
            {promoText}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="text-sm font-mono text-newspaper-text">Record: 8W / 0L</div>
            <div className="text-sm font-mono text-newspaper-text">Win Streak: 8</div>
            <div className="text-xs font-mono text-newspaper-text/60 mt-4">
              HOTKEYS:
            </div>
            <div className="text-xs font-mono text-newspaper-text/60">
              Space = End Turn | T = Select Card
            </div>
            <div className="text-xs font-mono text-newspaper-text/60">
              U = Upgrades | S = Stats | Q/L = Save/Load
            </div>
          </div>

          {/* Menu Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                setShowFactionSelect(true);
              }}
              className="w-full py-4 text-lg bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80"
            >
              START CONSPIRACY
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
              onClick={() => {
                audio?.playSFX?.('click');
                setShowManageExpansions(true);
              }}
            >
              MANAGE EXPANSIONS
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
              onClick={() => {
                audio?.playSFX?.('click');
                setShowHowToPlay(true);
              }}
            >
              HOW TO PLAY
            </Button>
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                const saveInfo = getSaveInfo?.();
                if (saveInfo && onLoadGame) {
                  // Load the saved game
                  const success = onLoadGame();
                  if (success) {
                    const indicator = document.createElement('div');
                    indicator.textContent = '✓ GAME LOADED';
                    indicator.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
                    document.body.appendChild(indicator);
                    setTimeout(() => indicator.remove(), 2000);
                  }
                }
              }}
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
              disabled={!getSaveInfo?.()}
            >
              {getSaveInfo?.() ? `CONTINUE (Turn ${getSaveInfo?.()?.turn})` : 'NO SAVED GAME'}
            </Button>
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                setShowCredits(true);
              }}
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              CREDITS
            </Button>
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                setShowCollection(true);
              }}
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              📚 CARD COLLECTION
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
              onClick={() => {
                console.log('Options button clicked in GameMenu');
                audio?.playSFX?.('click');
                setShowOptions(true);
                console.log('showOptions set to true');
              }}
            >
              OPTIONS
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-newspaper-text/60">
          <div className="mb-2">WARNING: This game contains satirical content</div>
          <div>Any resemblance to actual conspiracies is purely coincidental</div>
          <div className="mt-2 text-red-600 font-bold">
            [REDACTED] - Classification Level: FOR YOUR EYES ONLY
          </div>
        </div>
      </Card>
      <CardCollection open={showCollection} onOpenChange={setShowCollection} />
    </div>
  );
};

export default GameMenu;