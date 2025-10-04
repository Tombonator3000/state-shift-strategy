import { useMemo, useRef, useState, useEffect } from 'react';
import type { EditorId } from '@/expansions/editors/EditorsEngine';
import { randomGovHeadline, randomTruthHeadline } from '@/ui/tabloid/headlines';
import { WeatherBadge } from '@/ui/start/WeatherBadge';
import { loadNewspaperData, pick } from '@/lib/newspaperData';
import '@/styles/tabloid.css';

type StartScreenProps = {
  onStartGame: (
    faction: 'government' | 'truth',
    options?: { editorId?: EditorId | null },
  ) => void | Promise<void>;
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
  onStartNewGameFallback,
}: StartScreenProps) => {
  const govHeadline = useMemo(randomGovHeadline, []);
  const truthHeadline = useMemo(randomTruthHeadline, []);
  const governmentCardRef = useRef<HTMLButtonElement>(null);
  
  const [menuHeadlines, setMenuHeadlines] = useState({
    expansions: 'EDITORS\' EXPANSION SCOOP!',
    options: 'CLASSIFIED CONTROL ROOM!',
    howTo: 'LEAKED HOW-TO GUIDE',
    collection: 'EVIDENCE ARCHIVE',
    credits: 'FOLLOW THE MONEY'
  });
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [glitchText, setGlitchText] = useState<Record<string, string>>({});

  useEffect(() => {
    loadNewspaperData().then(data => {
      const verbs = [...(data.attackVerbs || []), 'EXPOSED', 'LEAKED', 'BREAKING', 'CLASSIFIED'];
      const subheads = data.subheads?.generic || [];
      
      setMenuHeadlines({
        expansions: `${pick(verbs)}: EXPANSION SECRETS ${pick(verbs)}!`,
        options: `${pick(['TOP SECRET', 'CLASSIFIED', 'REDACTED'])} SETTINGS ${pick(verbs)}!`,
        howTo: `${pick(verbs)} INSIDER GUIDE ${pick(['REVEALED', 'UNCOVERED'])}!`,
        collection: `${pick(['HIDDEN', 'SECRET', 'FORBIDDEN'])} EVIDENCE ${pick(['VAULT', 'ARCHIVE', 'FILES'])}!`,
        credits: `${pick(['FOLLOW THE MONEY', 'WHO REALLY RUNS THIS', 'SHADOW PUPPETEERS'])}!`
      });
    });

    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const buttons = ['expansions', 'options', 'howTo', 'collection', 'credits'];
        const target = pick(buttons);
        const glitchWords = ['███████', '???', 'REDACTED', '[CENSORED]', '??████??'];
        setGlitchText(prev => ({ ...prev, [target]: pick(glitchWords) }));
        setTimeout(() => {
          setGlitchText(prev => ({ ...prev, [target]: '' }));
        }, 800);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

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
    } else if (governmentCardRef.current) {
      governmentCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      governmentCardRef.current.focus({ preventScroll: true });
    }
  };

  return (
    <main className="tabloid-bg min-h-[100dvh] px-3 sm:px-6 py-4 flex flex-col">
      <div className="masthead" aria-label="The Paranoid Times masthead">
        THE PARANOID TIMES
      </div>
      <div className="subhead">MIND-BLOWING NEWS YOU WON'T BELIEVE!</div>

      <div className="tabloid-grid flex-1">
        <button
          ref={governmentCardRef}
          type="button"
          className="tabloid-card focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
          onClick={() => handleFactionSelect('government')}
          aria-label="Choose Government faction"
        >
          <img src="/assets/start/start-gov.jpeg" alt="Government" loading="eager" />

          <div className="redact" aria-hidden="true"></div>
          <div className="card-headline">{govHeadline}</div>
        </button>

        <button
          type="button"
          className="tabloid-card focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
          onClick={() => handleFactionSelect('truth')}
          aria-label="Choose Truth Seekers faction"
        >
          <img src="/assets/start/start-truth.jpeg" alt="Truth Seekers" loading="eager" />

          <div className="redact" aria-hidden="true"></div>
          <div className="card-headline">{truthHeadline}</div>
        </button>

        <aside className="sidebar" aria-label="Start screen options">
          <button
            type="button"
            className="ad-card tabloid-menu-btn"
            onClick={handleArticleAction(onManageExpansions)}
            onMouseEnter={() => setHoveredButton('expansions')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="menu-masthead">🗞️ SPECIAL EDITION</span>
            <span className="menu-headline">
              {glitchText.expansions || menuHeadlines.expansions}
            </span>
            <small className="menu-subhead">Story on Page 6 • Eyewitnesses Shocked</small>
          </button>
          <button
            type="button"
            className="ad-card tabloid-menu-btn"
            onClick={handleArticleAction(onOptions)}
            onMouseEnter={() => setHoveredButton('options')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="menu-masthead">📂 LEAKED FILES</span>
            <span className="menu-headline">
              {glitchText.options || menuHeadlines.options}
            </span>
            <small className="menu-subhead">Officials Refuse to Comment</small>
          </button>
          <button
            type="button"
            className="ad-card tabloid-menu-btn"
            onClick={handleArticleAction(onHowToPlay)}
            onMouseEnter={() => setHoveredButton('howTo')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="menu-masthead">🔍 INSIDER INFO</span>
            <span className="menu-headline">
              {glitchText.howTo || menuHeadlines.howTo}
            </span>
            <small className="menu-subhead">Anonymous Whistleblower Tips</small>
          </button>
          <button
            type="button"
            className="ad-card tabloid-menu-btn"
            onClick={handleArticleAction(onCardCollection)}
            onMouseEnter={() => setHoveredButton('collection')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="menu-masthead">📚 DECLASSIFIED</span>
            <span className="menu-headline">
              {glitchText.collection || menuHeadlines.collection}
            </span>
            <small className="menu-subhead">Previously Sealed Documents</small>
          </button>
          <button
            type="button"
            className="ad-card tabloid-menu-btn"
            onClick={handleArticleAction(onCredits)}
            onMouseEnter={() => setHoveredButton('credits')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="menu-masthead">💰 DEEP DIVE</span>
            <span className="menu-headline">
              {glitchText.credits || menuHeadlines.credits}
            </span>
            <small className="menu-subhead">Money Trail Investigation</small>
          </button>
          <WeatherBadge />
        </aside>
      </div>

      <div className="ticker">
        <button
          type="button"
          className="continue-btn focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
          onClick={handleFeatureAction}
        >
          {continueLabel}
        </button>
      </div>
    </main>
  );
};

export default StartScreen;
