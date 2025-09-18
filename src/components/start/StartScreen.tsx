import { useMemo, useRef } from 'react';
import FactionCard from './FactionCard';
import ArticleButton from './ArticleButton';
import '@/styles/newspaper.css';

type StartScreenProps = {
  onStartGame: (faction: 'government' | 'truth') => void | Promise<void>;
  onManageExpansions: () => void;
  onHowToPlay: () => void;
  onOptions: () => void;
  onCredits: () => void;
  onCardCollection: () => void;
  onLoadGame?: () => boolean;
  getSaveInfo?: () => { turn?: number } | undefined;
  audio?: { playSFX?: (key: string) => void };
  onStartNewGameFallback?: () => void;
};

const featureHeadlines = [
  'SHOCKING: ELVIS JOINS THE ILLUMINATI!',
  'LIZARD PEOPLE WIN BIG IN LOCAL ELECTION!',
  'MOON OFFICIALLY DECLARED A HOLOGRAM!',
  'GOVERNMENT ADMITS BIRDS ARE DRONES!',
  'TIME TRAVELER WARNS ABOUT LAST TUESDAY!',
  'ALIENS DEMAND RIGHT TO VOTE BY MAIL!',
  'BIGFOOT SPOTTED RUNNING FOR PRESIDENT!'
];

const featureSubheads = [
  'MIND-BENDING EXCLUSIVES FROM SOURCES WE CAN DEFINITELY TRUST.',
  'ALT-REAL NEWS AVOIDING TRUTH SINCE THIS MORNING.',
  'CITIZENS REPORT WILD SCENES AS REALITY GETS OPTIONAL.',
  'CLASSIFIED LEAKS SUGGEST EVERYTHING IS ABSOLUTELY TRUE.'
];

const StartScreen = ({
  onStartGame,
  onManageExpansions,
  onHowToPlay,
  onOptions,
  onCredits,
  onCardCollection,
  onLoadGame,
  getSaveInfo,
  audio,
  onStartNewGameFallback
}: StartScreenProps) => {
  const headline = useMemo(
    () => featureHeadlines[Math.floor(Math.random() * featureHeadlines.length)],
    []
  );
  const subhead = useMemo(
    () => featureSubheads[Math.floor(Math.random() * featureSubheads.length)],
    []
  );

  const governmentCardRef = useRef<HTMLDivElement>(null);

  const playClick = () => {
    audio?.playSFX?.('click');
  };

  const handleFactionSelect = async (faction: 'government' | 'truth') => {
    playClick();
    await Promise.resolve(onStartGame(faction));
  };

  const handleArticleAction = (action: () => void) => () => {
    playClick();
    action();
  };

  const saveInfo = getSaveInfo?.();
  const hasSave = Boolean(saveInfo);
  const continueLabel = hasSave
    ? `CONTINUE (TURN ${saveInfo?.turn ?? '?'})`
    : 'START NEW GAME';

  const focusHeroCards = () => {
    if (governmentCardRef.current) {
      governmentCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      governmentCardRef.current.focus({ preventScroll: true });
    }
  };

  const handleFeatureAction = () => {
    if (hasSave) {
      playClick();
      if (onLoadGame) {
        const success = onLoadGame();
        if (success) {
          const indicator = document.createElement('div');
          indicator.textContent = '✓ GAME LOADED';
          indicator.className =
            'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
          document.body.appendChild(indicator);
          setTimeout(() => indicator.remove(), 2000);
        }
      }
      return;
    }

    playClick();
    if (onStartNewGameFallback) {
      onStartNewGameFallback();
    } else {
      focusHeroCards();
    }
  };

  return (
    <main className="newspaper-bg min-h-dvh text-[var(--ink)]">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <header className="print-border bg-[var(--paper)] px-3 md:px-4 py-3 md:py-4 mb-4 md:mb-6">
          <div className="flex items-end justify-between">
            <h1 className="font-[Anton] text-4xl md:text-6xl tracking-wide uppercase">THE PARANOID TIMES</h1>
            <span className="badge text-xs md:text-sm">TIMES</span>
          </div>
          <div className="mt-2 bg-[var(--ink)] text-[var(--paper)] text-[11px] md:text-sm font-[Bebas Neue] px-2 py-1 inline-block tracking-wider uppercase">
            MIND-BLOWING NEWS YOU WON'T BELIEVE!
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FactionCard
            ref={governmentCardRef}
            faction="government"
            title="GOVERNMENT"
            caption="CONTROL THE NARRATIVE."
            imageSrc="/assets/start/start-gov.jpeg"
            onSelect={() => handleFactionSelect('government')}
          />
          <FactionCard
            faction="truth"
            title="TRUTH SEEKERS"
            caption="EXPOSE THE DECEPTION."
            imageSrc="/assets/start/start-truth.jpeg"
            onSelect={() => handleFactionSelect('truth')}
          />
        </section>

        <section className="mt-4 md:mt-6 print-border px-3 md:px-4 py-4">
          <h2 className="font-[Anton] text-2xl sm:text-4xl md:text-5xl leading-tight tracking-wide uppercase">{headline}</h2>
          <p className="mt-2 text-[11px] md:text-sm text-[var(--ink-weak)] uppercase tracking-wide">{subhead}</p>
          <div className="mt-3 hr-rule" />
        </section>

        <section className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 print-border bg-[var(--paper)]">
            <div className="aspect-[4/3] bg-black/10">
              <img
                src="/assets/start/start-continue.jpeg"
                alt="Continue your conspiracies"
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-3 md:p-4">
              <ArticleButton label={continueLabel} onClick={handleFeatureAction} />
            </div>
          </div>

          <aside className="space-y-3 md:space-y-4" aria-label="Menu options">
            <ArticleButton
              label="SELL EXPANSIONS!"
              sub="STORY ON PAGE 6"
              onClick={handleArticleAction(onManageExpansions)}
            />
            <ArticleButton
              label="TOP SECRET SETTINGS"
              onClick={handleArticleAction(onOptions)}
            />
            <ArticleButton
              label="LEAKED HOW-TO GUIDE"
              onClick={handleArticleAction(onHowToPlay)}
            />
            <ArticleButton
              label="EVIDENCE ARCHIVE"
              onClick={handleArticleAction(onCardCollection)}
            />
            <ArticleButton
              label="FOLLOW THE MONEY"
              onClick={handleArticleAction(onCredits)}
            />
          </aside>
        </section>

        <footer className="mt-4 md:mt-6 print-border px-3 py-2 font-[Bebas Neue] tracking-widest text-base md:text-lg uppercase text-center">
          PHONY MOON CONTINUES TO SHINE IN NIGHT SKY!
        </footer>
      </div>
    </main>
  );
};

export default StartScreen;
