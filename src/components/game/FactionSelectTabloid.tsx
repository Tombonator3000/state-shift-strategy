import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { EditorId } from '@/expansions/editors/EditorsEngine';
interface FactionSelectTabloidProps {
  onStartGame: (
    faction: 'government' | 'truth',
    options?: { editorId?: EditorId | null },
  ) => Promise<void>;
  onFactionHover?: (faction: 'government' | 'truth' | null) => void;
  onBack: () => void;
  audio?: any;
}

const FactionSelectTabloid = ({
  onStartGame,
  onFactionHover,
  onBack,
  audio,
}: FactionSelectTabloidProps) => {
  const tabloidButtonClass = `
    w-full border-2 border-black bg-white text-black
    text-xl md:text-2xl font-extrabold uppercase tracking-wide
    px-4 py-3
    shadow-[6px_6px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-[2px_2px_0_#000]
    transition-transform hover:translate-x-[1px] hover:translate-y-[1px]
    active:translate-x-[2px] active:translate-y-[2px]
    focus:outline-none focus:ring-4 focus:ring-gray-300
  `;

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-[980px] mx-auto w-full">
        {/* Back Button */}
        <Button
          onClick={() => {
            audio?.playSFX?.('click');
            onBack();
          }}
          className="mb-4 border-2 border-black bg-white text-black hover:bg-gray-100 font-bold uppercase px-4 py-2"
        >
          ← BACK
        </Button>

        {/* Top Stripe */}
        <div className="border-4 border-black bg-white px-4 py-3 mb-4">
          <div className="text-left mb-2">
            <span className="font-black uppercase tracking-tight text-lg">PARANOID TIMES</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black text-center mb-2">
            SELECT YOUR<br/>CONSPIRACY
          </h1>
          <div className="text-sm md:text-base uppercase text-center text-black">
            Choose your side in ultimate battle for truth
          </div>
        </div>

        {/* Two Main Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Government Panel */}
          <div 
            className="relative border-4 border-black bg-white p-4"
            onMouseEnter={() => onFactionHover?.('government')}
            onMouseLeave={() => onFactionHover?.(null)}
          >
            <div className="absolute -top-3 -left-3 bg-black text-white px-2 py-1 text-[10px] font-black tracking-wide uppercase">
              GOVERNMENT
            </div>
            <h2 className="font-black uppercase tracking-tight text-xl md:text-2xl text-black mb-2">
              DEEP STATE OPERATIVE
            </h2>
            <div className="aspect-[4/3] bg-[#e9e9e9] border-2 border-black mb-4">
              {/* Government building placeholder */}
            </div>
            <div className="mb-4 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/70">
                SECRET AGENDA
              </div>
              <Card className="border-2 border-dashed border-black/40 bg-[#f5f5f5] p-3 text-[11px] font-mono text-black">
                <p className="font-black uppercase tracking-wide text-[10px]">Classified briefing</p>
                <p className="text-[11px] normal-case">
                  Choose your strategy after the first briefing once operations begin.
                </p>
              </Card>
            </div>
            <Button
              onClick={async () => {
                audio?.playSFX?.('click');
                await onStartGame('government');
              }}
              className={tabloidButtonClass}
            >
              JOIN THE CABAL
            </Button>
          </div>

          {/* Truth Seekers Panel */}
          <div 
            className="relative border-4 border-black bg-white p-4"
            onMouseEnter={() => onFactionHover?.('truth')}
            onMouseLeave={() => onFactionHover?.(null)}
          >
            <div className="absolute -top-3 -left-3 bg-black text-white px-2 py-1 text-[10px] font-black tracking-wide uppercase">
              TRUTH SEEKERS
            </div>
            <h2 className="font-black uppercase tracking-tight text-xl md:text-2xl text-black mb-2">
              CONSPIRACY CRUSADER
            </h2>
            <div className="aspect-[4/3] bg-[#e9e9e9] border-2 border-black mb-4">
              {/* UFO + Bigfoot placeholder */}
            </div>
            <div className="mb-4 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/70">
                SECRET AGENDA
              </div>
              <Card className="border-2 border-dashed border-black/40 bg-[#f5f5f5] p-3 text-[11px] font-mono text-black">
                <p className="font-black uppercase tracking-wide text-[10px]">Encrypted dossier</p>
                <p className="text-[11px] normal-case">
                  Lock in your secret objective right after the game briefing begins.
                </p>
              </Card>
            </div>
            <Button
              onClick={async () => {
                audio?.playSFX?.('click');
                await onStartGame('truth');
              }}
              className={tabloidButtonClass}
            >
              EXPOSE THE CONSPIRACY
            </Button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-4 border-black bg-white p-4 text-center">
          <h2 className="font-black uppercase tracking-tight text-3xl md:text-5xl text-black mb-2">
            JOIN THE CABAL
          </h2>
          <div className="flex justify-end">
            <div className="border-2 border-black bg-white px-3 py-2 transform rotate-2">
              <span className="font-black uppercase text-sm tracking-wide">
                EXPOSE THE CONSPIRACY
              </span>
            </div>
          </div>
          {/* Decorative lines */}
          <div className="grid grid-cols-3 gap-2 mt-4 opacity-50">
            <div className="h-2 bg-[#e9e9e9]"></div>
            <div className="h-2 bg-[#e9e9e9]"></div>
            <div className="h-2 bg-[#e9e9e9]"></div>
            <div className="h-2 bg-[#e9e9e9] w-1/2"></div>
            <div className="h-2 bg-[#e9e9e9] w-3/4"></div>
            <div className="h-2 bg-[#e9e9e9] w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactionSelectTabloid;