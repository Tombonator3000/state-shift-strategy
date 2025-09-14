interface HandCard {
  id: string | number;
  name: string;
  rarity: string;
  rarityColor: string;
  cost: number;
}

interface HandPanelProps {
  cards: HandCard[];
  onClick: (card: HandCard) => void;
}

export function HandPanel({ cards, onClick }: HandPanelProps) {
  return (
    <div className="bg-[#0b0c0d] text-white rounded border border-[#2a2d33] p-2 h-full flex flex-col">
      <div className="font-[anton] uppercase text-sm mb-2 tracking-wide">Your Hand</div>
      <div className="md:flex-1 md:overflow-auto md:flex md:flex-col md:gap-2 flex overflow-x-auto gap-2">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onClick(c)}
            className="bg-white text-black rounded-lg border border-[#d1d5db] px-3 py-2 flex items-center justify-between hover:shadow-md"
          >
            <span className="font-medium truncate">{c.name}</span>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-white text-xs"
                style={{ background: c.rarityColor }}
              >
                {c.rarity.toUpperCase()}
              </span>
              <span className="bg-[#dc2626] text-white px-2 py-0.5 rounded text-xs">{c.cost} IP</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

