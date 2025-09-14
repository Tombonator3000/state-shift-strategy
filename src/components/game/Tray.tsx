interface TrayCard {
  id: string | number;
  name: string;
  cost: number;
  image: string;
  effectShort: string;
}

interface TrayProps {
  cards: TrayCard[];
  onInspect: (card: TrayCard) => void;
}

export function Tray({ cards, onInspect }: TrayProps) {
  return (
    <div className="bg-[#0b0c0d] border-t-4 border-black px-3 py-2">
      <div className="max-w-[1400px] mx-auto">
        <div className="font-[anton] text-white uppercase text-sm mb-2">Cards in Play</div>
        <div className="grid grid-flow-col auto-cols-[220px] gap-12 overflow-x-auto pb-2">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => onInspect(c)}
              className="bg-paper border-2 border-black shadow-[6px_6px_0_black] rounded text-left p-2"
            >
              <div className="font-[anton] text-xs uppercase flex justify-between mb-1">
                <span className="truncate">{c.name}</span>
                <span className="bg-[#dc2626] text-white px-2 rounded">{c.cost} IP</span>
              </div>
              <img src={c.image} alt="" className="w-full h-24 object-cover mb-2" />
              <div className="border border-black bg-paper text-xs p-1">{c.effectShort}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

