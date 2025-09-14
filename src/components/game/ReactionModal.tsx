import * as Dialog from "@radix-ui/react-dialog";
import { Card } from "@/engine/types";

export function ReactionModal({
  open,
  onOpenChange,
  attackCard,
  defenseHand,
  onDefend
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attackCard: Card;
  defenseHand: Card[];
  onDefend: (card: Card | null) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed left-1/2 top-24 -translate-x-1/2 w-[420px] rounded-xl bg-neutral-900 text-neutral-100 p-4 shadow-xl z-50">
          <Dialog.Title className="text-lg font-semibold">Defend?</Dialog.Title>
          <p className="mt-1 opacity-80">
            Opponent played: <b>{attackCard.name}</b>
          </p>
          
          <div className="mt-3 space-y-2 max-h-64 overflow-auto">
            {defenseHand.map(c => (
              <button 
                key={c.id} 
                onClick={() => onDefend(c)}
                className="w-full text-left rounded-lg border border-white/10 p-2 hover:bg-white/10 transition-colors"
              >
                {c.name} <span className="opacity-70">— cost {c.cost}</span>
              </button>
            ))}
            
            <button 
              onClick={() => onDefend(null)} 
              className="w-full rounded-lg border border-white/10 p-2 bg-red-500/20 hover:bg-red-500/30 transition-colors"
            >
              Don't Defend
            </button>
          </div>
          
          <Dialog.Close asChild>
            <button 
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"
              aria-label="Close"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}