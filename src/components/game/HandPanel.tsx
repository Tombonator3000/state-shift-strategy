import clsx from 'clsx';

interface HandCard {
  id: string | number;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cost: number;
}

interface HandPanelProps {
  cards: HandCard[];
  onClick: (card: HandCard) => void;
}

export function HandPanel({ cards, onClick }: HandPanelProps) {
  return (
    <div className="bg-panel-bg text-white rounded border border-panel-border p-2 h-full flex flex-col">
      <div className="font-headline uppercase text-sm mb-2 tracking-wide">Your Hand</div>
      <div className="md:flex-1 md:overflow-auto md:flex md:flex-col md:gap-2 flex overflow-x-auto gap-2">
        {cards.map((c) => {
          const rarityBg = {
            common: 'bg-rarity-common',
            uncommon: 'bg-rarity-uncommon',
            rare: 'bg-rarity-rare',
            legendary: 'bg-rarity-legendary',
          }[c.rarity];

          return (
            <button
              key={c.id}
              onClick={() => onClick(c)}
              className="bg-white text-black rounded-lg border border-[var(--grey)] px-3 py-2 flex items-center justify-between hover:shadow-md"
            >
              <span className="font-medium truncate">{c.name}</span>
              <div className="flex items-center gap-2">
                <span className={clsx('px-2 py-0.5 rounded text-white text-xs', rarityBg)}>
                  {c.rarity.toUpperCase()}
                </span>
                <span className="bg-cost-red text-white px-2 py-0.5 rounded text-xs">{c.cost} IP</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

