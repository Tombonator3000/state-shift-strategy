import { useMemo, useRef } from 'react';
import type { EditorId } from '@/expansions/editors/EditorsEngine';
import { randomGovHeadline, randomTruthHeadline } from '@/ui/tabloid/headlines';
import { WeatherBadge } from '@/ui/start/WeatherBadge';
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
      <div className="subhead">MIND-BLOWING NEWS YOU WON’T BELIEVE!</div>

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
            className="ad-card"
            onClick={handleArticleAction(onManageExpansions)}
          >
            Sell Expansions!
            <small style={{ display: 'block', fontFamily: 'monospace' }}>Story on Page 6</small>
          </button>
          <button
            type="button"
            className="ad-card"
            onClick={handleArticleAction(onOptions)}
          >
            CLASSIFIED CONTROL ROOM!
          </button>
          <button
            type="button"
            className="ad-card"
            onClick={handleArticleAction(onHowToPlay)}
          >
            Leaked How-To Guide
          </button>
          <button
            type="button"
            className="ad-card"
            onClick={handleArticleAction(onCardCollection)}
          >
            Evidence Archive
          </button>
          <button
            type="button"
            className="ad-card"
            onClick={handleArticleAction(onCredits)}
          >
            Follow The Money
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
