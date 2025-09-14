import clsx from 'clsx';

interface TrayCard {
  id: string | number;
  name: string;
  cost: number;
  image: string;
  effectShort: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface TrayProps {
  cards: TrayCard[];
  onInspect: (card: TrayCard) => void;
}

export function Tray({ cards, onInspect }: TrayProps) {
  return (
    <div className="card-tray bg-panel-bg border-t-4 border-ink px-3 py-2">
      <div className="max-w-[1400px] mx-auto">
        <div className="font-headline text-white uppercase text-sm mb-2">Cards in Play</div>
        <div className="grid grid-flow-col auto-cols-[220px] gap-12 overflow-x-auto pb-2">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => onInspect(c)}
              className={clsx(`rarity-${c.rarity}`, 'bg-white shadow-[6px_6px_0_var(--ink)] rounded text-left p-2')}
            >
              <div className="font-headline text-xs uppercase flex justify-between mb-1">
                <span className="truncate">{c.name}</span>
                <span className="bg-cost-red text-white px-2 rounded">{c.cost} IP</span>
              </div>
              <img src={c.image} alt="" className="w-full h-24 object-cover mb-2" />
              <div className="border border-ink bg-white text-xs p-1 font-body">{c.effectShort}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

