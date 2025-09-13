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

// Helper Components
const HeadlineButton = ({ children, onClick, className = "", fullWidth = false }: { 
  children: React.ReactNode; 
  onClick: () => void; 
  className?: string;
  fullWidth?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`${fullWidth ? 'w-full' : ''} border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] 
                text-xl md:text-2xl font-extrabold tracking-wide uppercase
                shadow-[6px_6px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-[2px_2px_0_#000]
                transition-transform hover:translate-x-[1px] hover:translate-y-[1px] 
                active:translate-x-[2px] active:translate-y-[2px]
                focus:outline-none focus:ring-4 focus:ring-gray-300 
                py-3 px-4 ${className}`}
    style={{
      fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif'
    }}
  >
    {children}
  </button>
);

const Masthead = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="border-4 border-[var(--line)] bg-[var(--paper)] px-4 py-2 mb-4">
    <div 
      className="text-4xl md:text-6xl font-black tracking-tight uppercase text-center"
      style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
    >
      {title}
    </div>
    <div className="bg-[var(--ink)] text-[var(--paper)] text-center py-1 mt-2">
      <span className="text-xs md:text-sm font-sans uppercase tracking-wide">
        {subtitle}
      </span>
    </div>
  </div>
);

const DecorRule = () => (
  <div className="h-2 bg-[var(--grey2)] my-2" />
);

const PhotoBox = ({ headline, image }: { headline: string; image?: string }) => (
  <div className="border-4 border-[var(--line)] bg-[var(--paper)] p-2">
    <div className="aspect-[4/3] bg-[var(--grey2)] border-2 border-[var(--line)] mb-2 flex items-center justify-center">
      {image ? (
        <img src={image} alt={headline} className="w-full h-full object-cover" />
      ) : (
        <div className="text-[var(--grey)] text-xs uppercase">Photo Placeholder</div>
      )}
    </div>
    <div 
      className="text-lg md:text-xl font-black tracking-tight uppercase text-center"
      style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
    >
      {headline}
    </div>
  </div>
);

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
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden max-w-[980px] mx-auto p-4 md:p-8">
        {/* Back Button */}
        <Button 
          onClick={() => {
            audio?.playSFX?.('click');
            setShowFactionSelect(false);
          }}
          variant="outline" 
          className="absolute top-4 left-4 z-20 bg-[var(--paper)] border-2 border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--grey2)] font-bold"
        >
          ← BACK TO MAIN
        </Button>

        {/* 1. Top stripe - Title */}
        <div className="border-4 border-[var(--line)] bg-[var(--paper)] px-4 py-3 mb-6 mt-12">
          <div 
            className="text-3xl md:text-5xl font-black tracking-tight uppercase text-center"
            style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
          >
            SELECT YOUR CONSPIRACY
          </div>
          <div className="text-center text-xs md:text-sm font-sans uppercase tracking-wide mt-2">
            Choose your side in ultimate battle for truth
          </div>
        </div>

        {/* 2. Two main panels side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Government Panel */}
          <div 
            className="relative border-4 border-[var(--line)] bg-[var(--paper)] p-4 cursor-pointer hover:bg-[var(--grey2)] transition-colors"
            onMouseEnter={() => onFactionHover?.('government')}
            onMouseLeave={() => onFactionHover?.(null)}
          >
            {/* Label badge */}
            <div className="absolute -top-3 -left-3 bg-[var(--ink)] text-[var(--paper)] px-2 py-1 text-[10px] font-black tracking-wide uppercase">
              GOVERNMENT
            </div>
            
            {/* Title */}
            <div 
              className="text-2xl md:text-3xl font-black tracking-tight uppercase text-center mb-4 mt-2"
              style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
            >
              DEEP STATE OPERATIVE
            </div>
            
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-[var(--grey2)] border-2 border-[var(--ink)] mb-4 flex items-center justify-center">
              <img src={governmentOperative} alt="Government Operative" className="w-full h-full object-cover" />
            </div>
            
            {/* CTA Button */}
            <HeadlineButton 
              onClick={async () => {
                audio?.playSFX?.('click');
                await onStartGame('government');
              }}
              fullWidth
            >
              JOIN THE CABAL
            </HeadlineButton>
          </div>

          {/* Truth Seekers Panel */}
          <div 
            className="relative border-4 border-[var(--line)] bg-[var(--paper)] p-4 cursor-pointer hover:bg-[var(--grey2)] transition-colors"
            onMouseEnter={() => onFactionHover?.('truth')}
            onMouseLeave={() => onFactionHover?.(null)}
          >
            {/* Label badge */}
            <div className="absolute -top-3 -left-3 bg-[var(--ink)] text-[var(--paper)] px-2 py-1 text-[10px] font-black tracking-wide uppercase">
              TRUTH SEEKERS
            </div>
            
            {/* Title */}
            <div 
              className="text-2xl md:text-3xl font-black tracking-tight uppercase text-center mb-4 mt-2"
              style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
            >
              CONSPIRACY CRUSADER
            </div>
            
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-[var(--grey2)] border-2 border-[var(--ink)] mb-4 flex items-center justify-center">
              <img src={truthSeeker} alt="Truth Seeker" className="w-full h-full object-cover" />
            </div>
            
            {/* CTA Button */}
            <HeadlineButton 
              onClick={async () => {
                audio?.playSFX?.('click');
                await onStartGame('truth');
              }}
              fullWidth
            >
              EXPOSE THE CONSPIRACY
            </HeadlineButton>
          </div>
        </div>

        {/* 3. Bottom banner (optional) */}
        <div className="border-4 border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-center">
          <div 
            className="text-xl md:text-2xl font-black tracking-tight uppercase"
            style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
          >
            THE TRUTH IS OUT THERE... PROBABLY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden max-w-[980px] mx-auto p-4 md:p-8">
      
      {/* 1. Masthead stripe (full width) */}
      <Masthead 
        title="THE PARANOID TIMES"
        subtitle="MIND-BLOWING NEWS YOU WON'T BELIEVE!"
      />

      {/* 2. Top grid (2 "photo fields") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 mb-4">
        <PhotoBox 
          headline="A.I. CONTROL GRID EXPOSED"
          image={ufoSighting}
        />
        <PhotoBox 
          headline="BAT BOY SIGHTED IN CITY"
          image={bigfootSighting}
        />
      </div>

      <DecorRule />

      {/* 3. Giant title block with decorative elements */}
      <div className="border-4 border-[var(--line)] bg-[var(--paper)] py-6 mb-4 relative">
        {/* Gray decorative elements on sides */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-16 h-2 bg-[var(--grey2)]"></div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-16 h-2 bg-[var(--grey2)]"></div>
        
        <div 
          className="text-5xl md:text-7xl font-black tracking-tight uppercase text-center"
          style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
        >
          <div>SHADOW</div>
          <div>GOVERNMENT</div>
        </div>
      </div>

      <DecorRule />

      {/* 4. Button section with specific grid layout */}
      <div className="grid gap-4 mb-4">
        {/* Row A: NEW GAME (full width) */}
        <div className="col-span-full">
          <HeadlineButton 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowFactionSelect(true);
            }}
            fullWidth
          >
            START CONSPIRACY
          </HeadlineButton>
        </div>

        {/* Row B: MANAGE EXPANSIONS (left), HOW TO PLAY (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeadlineButton 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowManageExpansions(true);
            }}
            fullWidth
          >
            MANAGE EXPANSIONS
          </HeadlineButton>
          <HeadlineButton 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowHowToPlay(true);
            }}
            fullWidth
          >
            HOW TO PLAY
          </HeadlineButton>
        </div>

        {/* Row C: CREDITS (left), CARD COLLECTION (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeadlineButton 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowCredits(true);
            }}
            fullWidth
          >
            CREDITS
          </HeadlineButton>
          <HeadlineButton 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowCollection(true);
            }}
            fullWidth
          >
            CARD COLLECTION
          </HeadlineButton>
        </div>

        {/* Continue card - faux newspaper box (if save exists) */}
        {getSaveInfo?.() && (
          <div className="border-4 border-[var(--line)] bg-[var(--paper)] p-4 mb-4">
            <div 
              className="text-lg md:text-xl font-black tracking-tight uppercase text-center mb-2"
              style={{ fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif' }}
            >
              CLASSIFIED DOSSIER FOUND
            </div>
            <div className="text-xs font-sans uppercase text-center mb-3">
              Turn {getSaveInfo?.()?.turn} - Investigation in Progress
            </div>
            <HeadlineButton 
              onClick={() => {
                if (getSaveInfo?.()) {
                  audio?.playSFX?.('click');
                  const success = onLoadGame?.();
                  if (success) {
                    const indicator = document.createElement('div');
                    indicator.textContent = '✓ DOSSIER LOADED';
                    indicator.className = 'fixed top-4 right-4 bg-[var(--ink)] text-[var(--paper)] px-4 py-2 z-[60] animate-fade-in';
                    document.body.appendChild(indicator);
                    setTimeout(() => indicator.remove(), 2000);
                  }
                }
              }}
              fullWidth
            >
              CONTINUE
            </HeadlineButton>
          </div>
        )}

        {/* Row D: OPTIONS (full width) */}
        <div className="col-span-full">
          <HeadlineButton 
            onClick={() => {
              audio?.playSFX?.('click');
              setShowOptions(true);
            }}
            fullWidth
          >
            OPTIONS
          </HeadlineButton>
        </div>
      </div>

      <DecorRule />

      {/* 6. Decorative "gutter" elements */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="h-2 bg-[var(--grey2)]"></div>
        <div className="h-2 bg-[var(--grey2)]"></div>
        <div className="h-2 bg-[var(--grey2)]"></div>
      </div>

      {/* Card Collection */}
      <CardCollection 
        open={showCollection} 
        onOpenChange={setShowCollection} 
      />
    </div>
  );
};

export default GameMenu;