import type { Card as ShowcaseCard } from "@/types/public";
import { Card as UiCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GameHandProps {
  cards: ShowcaseCard[];
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
}

const rarityTone: Record<ShowcaseCard["rarity"], string> = {
  common: "bg-slate-600",
  uncommon: "bg-emerald-600",
  rare: "bg-blue-600",
  legendary: "bg-amber-500"
};

const typeTone: Record<ShowcaseCard["type"], string> = {
  ATTACK: "border-destructive bg-destructive/10",
  MEDIA: "border-truth-red bg-truth-red/10",
  ZONE: "border-government-blue bg-government-blue/10"
};

const GameHand = ({ cards, onPlayCard, disabled }: GameHandProps) => {
  return (
    <div className="space-y-3">
      <p className="text-xs font-mono uppercase tracking-wide text-slate-300">
        Showcase Cards ({cards.length})
      </p>
      <div className="grid gap-3">
        {cards.map((card) => (
          <UiCard
            key={card.id}
            className={`overflow-hidden border-2 ${typeTone[card.type]} ${disabled ? "opacity-60" : "hover:shadow-lg"}`}
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{card.name}</h3>
                  <p className="text-xs text-slate-300">{card.faction.toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                    {card.cost}
                  </span>
                  <span className={`h-2 w-12 rounded-full ${rarityTone[card.rarity]}`}></span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-200">
                <Badge variant="outline">{card.type}</Badge>
                <p className="min-h-[48px] rounded bg-black/30 p-3 text-xs text-slate-200">
                  {card.flavor ?? "Showcase card (UI only)."}
                </p>
              </div>

              <Button
                size="sm"
                className="w-full"
                disabled={disabled}
                onClick={() => onPlayCard(card.id)}
              >
                Highlight Card
              </Button>
            </div>
          </UiCard>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="rounded border border-dashed border-white/20 p-6 text-center text-sm text-slate-300">
          Your showcase hand is empty. Start a new round to refresh cards.
        </div>
      )}
    </div>
  );
};

export default GameHand;
