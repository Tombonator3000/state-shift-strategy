import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Credits from './Credits';
import HowToPlay from './HowToPlay';
import Options from './Options';
import ManageExpansions from './ManageExpansions';
import CardCollection from './CardCollection';
import paranoidTimesMasthead from '/assets/paranoid-times-masthead.png';
import governmentOperative from '/assets/government-operative.png';
import truthSeeker from '/assets/truth-seeker.png';
import ufoSighting from '/assets/ufo-sighting.png';
import bigfootSighting from '/assets/bigfoot-sighting.png';

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
  const [glitching, setGlitching] = useState(false);
  const [redactedText, setRedactedText] = useState('THE PARANOID TIMES');
  const [showCredits, setShowCredits] = useState(false);
  const [showFactionSelect, setShowFactionSelect] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showManageExpansions, setShowManageExpansions] = useState(false);
  const [subtitleText, setSubtitleText] = useState('CLASSIFIED SPECIAL EDITION');
  const [quoteText, setQuoteText] = useState('"Where conspiracy theories become reality"');
  const [descriptionText, setDescriptionText] = useState('Control the narrative. Manipulate the truth.');
  const [description2Text, setDescription2Text] = useState('Convince people birds are real (or aren\'t).');
  const [promoText, setPromoText] = useState('NOW WITH 420% MORE SATIRE!');
  const [showCollection, setShowCollection] = useState(false);

  useEffect(() => {
    const glitchTexts = {
      title: ['SHEEPLE TIMES', 'THE TRUTH DAILY', 'CONSPIRACY NEWS', 'THE PARANOID TIMES', 'DEEP STATE WEEKLY', 'LIZARD PEOPLE POST', 'WEEKLY WORLD NEWS', 'TABLOID TRUTH', 'PARANOID PLANET'],
      subtitle: ['CLASSIFIED SPECIAL EDITION', 'REDACTED DAILY', 'TOP SECRET TIMES', 'CONSPIRACY WEEKLY', 'BIGFOOT WEEKLY', 'ALIEN EDITION', 'CRYPTID CHRONICLES'],
      quote: [
        '"Where conspiracy theories become reality"',
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
            setRedactedText('THE PARANOID TIMES');
          }, 1500);
        }
      }, Math.random() * 2000 + 2000), // 2-4 seconds

      // Subtitle glitch
      setInterval(() => {
        if (Math.random() < 0.12) {
          setSubtitleText(glitchTexts.subtitle[Math.floor(Math.random() * glitchTexts.subtitle.length)]);
          setTimeout(() => setSubtitleText('CLASSIFIED SPECIAL EDITION'), 1200);
        }
      }, Math.random() * 3000 + 3000), // 3-6 seconds

      // Quote glitch
      setInterval(() => {
        if (Math.random() < 0.08) {
          setQuoteText(glitchTexts.quote[Math.floor(Math.random() * glitchTexts.quote.length)]);
          setTimeout(() => setQuoteText('"Where conspiracy theories become reality"'), 1800);
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
    return (
      <div className="min-h-screen bg-white text-black font-serif relative overflow-hidden">
        {/* Newspaper Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="grid grid-cols-12 h-full w-full gap-px">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-gray-900 h-full"></div>
            ))}
          </div>
        </div>

        {/* Main Newspaper Layout */}
        <div className="relative z-10 p-4">
          {/* Back Button - Top Left Corner */}
          <Button 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowFactionSelect(false);
            }}
            variant="outline" 
            className="absolute top-4 left-4 z-20 bg-white border-2 border-black text-black hover:bg-gray-100 font-bold"
          >
            ← BACK TO MAIN
          </Button>

          {/* Masthead */}
          <div className="text-center mb-6 border-b-4 border-black pb-4">
            <div className="text-6xl font-black mb-2" style={{ fontFamily: 'serif' }}>
              THE PARANOID TIMES
            </div>
            <div className="text-lg font-bold border-t border-b border-black py-1">
              CLASSIFIED SPECIAL EDITION - SELECT YOUR ALLEGIANCE
            </div>
          </div>

          {/* Side Stories as Decoration */}
          <div className="absolute left-4 top-32 w-48 space-y-2 text-xs font-bold">
            <div className="border border-black p-2 bg-yellow-100 transform -rotate-2">
              <div className="text-sm font-black">ALIEN ATTACK COVER-UP!</div>
              <img src={ufoSighting} alt="UFO" className="w-full h-16 object-cover my-1" />
              <div className="text-xs">Government denies everything!</div>
            </div>
            <div className="border border-black p-2 bg-red-100 transform rotate-1">
              <div className="text-sm font-black">HUGE UFO SEEN OVER!</div>
              <div className="text-xs">City officials refuse comment</div>
            </div>
          </div>

          <div className="absolute right-4 top-32 w-48 space-y-2 text-xs font-bold">
            <div className="border border-black p-2 bg-green-100 transform rotate-2">
              <div className="text-sm font-black">BIGFOOT CAPTURED!</div>
              <img src={bigfootSighting} alt="Bigfoot" className="w-full h-16 object-cover my-1" />
              <div className="text-xs">Scientists baffled by discovery</div>
            </div>
            <div className="border border-black p-2 bg-blue-100 transform -rotate-1">
              <div className="text-sm font-black">PSST... WORLD'S SECRET IS...</div>
              <div className="text-xs">Turn to page 394 for shocking truth!</div>
            </div>
          </div>

          {/* Main Faction Selection Headline */}
          <div className="text-center mb-8">
            <div className="text-5xl font-black mb-4 border-4 border-black p-4 bg-yellow-200">
              SELECT YOUR FACTION!
            </div>
          </div>

          {/* Faction Cards - Tabloid Style */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto relative">
            {/* Government Faction */}
            <div className="border-4 border-black bg-gray-100 p-6 transform hover:scale-105 transition-all cursor-pointer relative"
                 onMouseEnter={() => onFactionHover?.('government')}
                 onMouseLeave={() => onFactionHover?.(null)}>
              
              {/* Classified Stamps */}
              <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 font-bold text-sm transform rotate-12">
                CLASSIFIED
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-black mb-2">GOVERNMENT</div>
                <img src={governmentOperative} alt="Deep State Operative" className="w-full h-64 object-cover border-2 border-black" />
                <div className="text-2xl font-bold mt-2 bg-black text-white p-2">
                  DEEP STATE OPERATIVE
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4 font-bold">
                <div className="flex justify-between border-b border-black">
                  <span>Start Truth:</span>
                  <span className="text-red-600">40%</span>
                </div>
                <div className="flex justify-between border-b border-black">
                  <span>Bonus IP:</span>
                  <span className="text-red-600">+10</span>
                </div>
                <div className="text-xs font-bold bg-red-100 p-2 border border-black">
                  ACCESS TO LIZARD PEOPLE & BLACK HELICOPTERS
                </div>
              </div>
              
              <div className="bg-gray-200 p-3 mb-4 text-xs border-2 border-black">
                <div className="font-black">"CONTROL THE NARRATIVE"</div>
                <div>"Manipulate truth with weather machines and surprisingly comfortable underground bunkers."</div>
              </div>
              
              <Button 
                onClick={async () => {
                  audio?.playSFX?.('click');
                  await onStartGame('government');
                }}
                className="w-full bg-black text-white hover:bg-gray-800 text-lg py-3 font-bold border-2 border-black"
              >
                JOIN THE SHADOW CABINET
              </Button>
            </div>

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-black bg-white border-4 border-black px-4 py-2 z-10">
              VS
            </div>

            {/* Truth Seekers Faction */}
            <div className="border-4 border-black bg-yellow-50 p-6 transform hover:scale-105 transition-all cursor-pointer relative"
                 onMouseEnter={() => onFactionHover?.('truth')}
                 onMouseLeave={() => onFactionHover?.(null)}>
              
              {/* Believe Stamp */}
              <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 font-bold text-sm transform -rotate-12">
                BELIEVE
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-black mb-2">TRUTH SEEKERS</div>
                <img src={truthSeeker} alt="Conspiracy Crusader" className="w-full h-64 object-cover border-2 border-black" />
                <div className="text-2xl font-bold mt-2 bg-black text-white p-2">
                  CONSPIRACY CRUSADER
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4 font-bold">
                <div className="flex justify-between border-b border-black">
                  <span>Start Truth:</span>
                  <span className="text-green-600">60%</span>
                </div>
                <div className="flex justify-between border-b border-black">
                  <span>Bonus Truth:</span>
                  <span className="text-green-600">+10%</span>
                </div>
                <div className="text-xs font-bold bg-green-100 p-2 border border-black">
                  TINFOIL HAT IMMUNITY & UFO HOTLINE ACCESS
                </div>
              </div>
              
              <div className="bg-yellow-100 p-3 mb-4 text-xs border-2 border-black">
                <div className="font-black">"PSST... WORLD'S SECRET IS..."</div>
                <div>"Wake up the sheeple with essential oils, healing crystals, and really long YouTube videos."</div>
              </div>
              
              <Button 
                onClick={async () => {
                  audio?.playSFX?.('click');
                  await onStartGame('truth');
                }}
                className="w-full bg-black text-white hover:bg-gray-800 text-lg py-3 font-bold border-2 border-black"
              >
                EXPOSE THE CONSPIRACY
              </Button>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="text-center mt-8 border-4 border-black p-4 bg-red-200">
            <div className="text-2xl font-black">
              PSST... WORLD'S SECRET IS WAITING TO BE REVEALED!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-serif relative overflow-hidden">
      {/* Newspaper Background Pattern */}
      <div className="absolute inset-0 opacity-3 pointer-events-none">
        <div className="grid grid-cols-20 h-full w-full gap-px">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="bg-gray-900 h-full"></div>
          ))}
        </div>
      </div>

      {/* Main Newspaper Layout */}
      <div className="relative z-10 p-4">
        {/* Masthead */}
        <div className="text-center mb-6 border-b-4 border-black pb-4">
          <div className="text-7xl font-black mb-2" style={{ fontFamily: 'serif' }}>
            <span className={glitching ? 'animate-pulse' : ''}>{redactedText}</span>
          </div>
          <div className="text-lg font-bold border-t border-b border-black py-1">
            {subtitleText}
          </div>
          <div className="text-sm italic mt-2">{quoteText}</div>
        </div>

        {/* Side Stories as Decoration */}
        <div className="absolute left-4 top-40 w-52 space-y-3 text-xs font-bold">
          <div className="border-2 border-black p-3 bg-red-100 transform -rotate-1">
            <div className="text-sm font-black">PSYCHIC BIGFOOT STUNS SCIENTISTS</div>
            <img src={bigfootSighting} alt="Bigfoot" className="w-full h-20 object-cover my-2 border border-black" />
            <div className="text-xs">Creature predicts lottery numbers with 100% accuracy!</div>
          </div>
          <div className="border-2 border-black p-3 bg-yellow-100 transform rotate-2">
            <div className="text-sm font-black">ROBOT MUMMY ON THE LOOSE!</div>
            <div className="text-xs">Ancient Egyptian android terrorizes museum visitors</div>
          </div>
          <div className="border-2 border-black p-3 bg-green-100 transform -rotate-1">
            <div className="text-sm font-black">HUGE UFO SEEN OVER CITY!</div>
            <img src={ufoSighting} alt="UFO" className="w-full h-16 object-cover my-1 border border-black" />
          </div>
        </div>

        <div className="absolute right-4 top-40 w-52 space-y-3 text-xs font-bold">
          <div className="border-2 border-black p-3 bg-blue-100 transform rotate-1">
            <div className="text-sm font-black">WOMAN GIVES BIRTH TO 200-POUND BABY!</div>
            <div className="text-xs">Doctors baffled by miraculous delivery</div>
          </div>
          <div className="border-2 border-black p-3 bg-purple-100 transform -rotate-2">
            <div className="text-sm font-black">ELVIS SPOTTED AT LOCAL DINER</div>
            <div className="text-xs">King orders usual: peanut butter banana sandwich</div>
          </div>
          <div className="border-2 border-black p-3 bg-orange-100 transform rotate-1">
            <div className="text-sm font-black">BAT BOY ELECTED MAYOR!</div>
            <div className="text-xs">Campaign promises include night vision streetlights</div>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <div className="text-6xl font-black mb-4 border-4 border-black p-6 bg-yellow-200 transform hover:scale-105 transition-all">
            START CONSPIRACY!
          </div>
          <div className="text-lg font-bold bg-red-200 border-2 border-black p-3">
            {descriptionText}
          </div>
          <div className="text-lg font-bold bg-blue-200 border-2 border-black p-3 mt-2">
            {description2Text}
          </div>
          <div className="text-2xl font-black text-red-600 mt-4 bg-white border-2 border-black p-3">
            {promoText}
          </div>
        </div>

        {/* Stats Box */}
        <div className="text-center mb-8 max-w-md mx-auto">
          <div className="border-4 border-black bg-gray-100 p-4">
            <div className="text-lg font-black mb-2">CLASSIFIED STATISTICS</div>
            <div className="text-sm font-bold">Record: 8W / 0L</div>
            <div className="text-sm font-bold">Win Streak: 8</div>
            <div className="text-xs mt-2 border-t border-black pt-2">
              <div className="font-bold">HOTKEYS:</div>
              <div>Space = End Turn | T = Select Card</div>
              <div>U = Upgrades | S = Stats | Q/L = Save/Load</div>
            </div>
          </div>
        </div>

        {/* Menu Buttons as Newspaper Sections */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* New Game Button */}
          <div className="border-4 border-black bg-red-200 p-4 hover:scale-105 transition-all cursor-pointer"
               onClick={() => {
                 audio?.playSFX?.('click');
                 setShowFactionSelect(true);
               }}>
            <div className="text-3xl font-black text-center mb-2">START CONSPIRACY</div>
            <div className="text-center text-sm font-bold">
              Choose your faction and begin the ultimate battle for truth!
            </div>
          </div>

          {/* Manage Expansions */}
          <div className="border-4 border-black bg-blue-200 p-4 hover:scale-105 transition-all cursor-pointer"
               onClick={() => {
                 audio?.playSFX?.('click');
                 setShowManageExpansions(true);
               }}>
            <div className="text-3xl font-black text-center mb-2">MANAGE EXPANSIONS</div>
            <div className="text-center text-sm font-bold">
              Add more conspiracy theories to your collection!
            </div>
          </div>

          {/* How to Play */}
          <div className="border-4 border-black bg-green-200 p-4 hover:scale-105 transition-all cursor-pointer"
               onClick={() => {
                 audio?.playSFX?.('click');
                 setShowHowToPlay(true);
               }}>
            <div className="text-3xl font-black text-center mb-2">HOW TO PLAY</div>
            <div className="text-center text-sm font-bold">
              Learn the art of conspiracy and manipulation!
            </div>
          </div>

          {/* Continue Game */}
          <div className={`border-4 border-black p-4 hover:scale-105 transition-all cursor-pointer ${
                getSaveInfo?.() ? 'bg-yellow-200' : 'bg-gray-300 opacity-50'
              }`}
               onClick={() => {
                 if (getSaveInfo?.()) {
                   audio?.playSFX?.('click');
                   const success = onLoadGame?.();
                   if (success) {
                     const indicator = document.createElement('div');
                     indicator.textContent = '✓ GAME LOADED';
                     indicator.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
                     document.body.appendChild(indicator);
                     setTimeout(() => indicator.remove(), 2000);
                   }
                 }
               }}>
            <div className="text-3xl font-black text-center mb-2">
              {getSaveInfo?.() ? `CONTINUE (Turn ${getSaveInfo?.()?.turn})` : 'NO SAVED GAME'}
            </div>
            <div className="text-center text-sm font-bold">
              {getSaveInfo?.() ? 'Resume your conspiracy investigation!' : 'Start a new game first!'}
            </div>
          </div>

          {/* Credits */}
          <div className="border-4 border-black bg-purple-200 p-4 hover:scale-105 transition-all cursor-pointer"
               onClick={() => {
                 audio?.playSFX?.('click');
                 setShowCredits(true);
               }}>
            <div className="text-3xl font-black text-center mb-2">CREDITS</div>
            <div className="text-center text-sm font-bold">
              Meet the conspiracy theorists behind this madness!
            </div>
          </div>

          {/* Card Collection */}
          <div className="border-4 border-black bg-orange-200 p-4 hover:scale-105 transition-all cursor-pointer"
               onClick={() => {
                 audio?.playSFX?.('click');
                 setShowCollection(true);
               }}>
            <div className="text-3xl font-black text-center mb-2">CARD COLLECTION</div>
            <div className="text-center text-sm font-bold">
              Browse your collection of conspiracy cards!
            </div>
          </div>
        </div>

        {/* Bottom Options */}
        <div className="text-center mt-8">
          <div className="border-4 border-black bg-gray-200 p-4 max-w-md mx-auto hover:scale-105 transition-all cursor-pointer"
               onClick={() => {
                 audio?.playSFX?.('click');
                 setShowOptions(true);
               }}>
            <div className="text-2xl font-black mb-2">OPTIONS</div>
            <div className="text-sm font-bold">Adjust settings and preferences</div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-center mt-8 border-4 border-black p-4 bg-red-300">
          <div className="text-xl font-black">
            "TRUST NO ONE, QUESTION EVERYTHING, BELIEVE THE IMPOSSIBLE!"
          </div>
        </div>
      </div>

      {/* Card Collection Overlay */}
      {showCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">
          <div className="bg-white max-w-6xl w-full h-full rounded-lg overflow-hidden">
            <CardCollection onClose={() => setShowCollection(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMenu;