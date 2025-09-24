import type { CardPlayRecord, EvidenceTrackState, PublicFrenzyState } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import { FrontPageLayout } from '@/features/ui/frontPage/FrontPageLayout';

interface PlayedCardsDockProps {
  playedCards: CardPlayRecord[];
  onInspectCard?: (card: GameCard) => void;
  faction: 'truth' | 'government';
  evidence: EvidenceTrackState;
  publicFrenzy: PublicFrenzyState;
  truth: number;
}

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({
  playedCards,
  onInspectCard,
  faction,
  evidence,
  publicFrenzy,
  truth,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-black/10 px-3 py-2 text-sm font-extrabold tracking-wide text-newspaper-text">
        FRONT PAGE BATTLE REPORT
      </header>
      <div className="flex-1 overflow-y-auto p-3">
        <FrontPageLayout
          cards={playedCards}
          onInspectCard={onInspectCard}
          faction={faction}
          evidence={evidence}
          publicFrenzy={publicFrenzy}
          truth={truth}
        />
      </div>
    </div>
  );
};

export default PlayedCardsDock;
