import { Button } from '@/components/ui/button';

interface CreditsTableoidProps {
  onClose: () => void;
}

const CreditsTableoid = ({ onClose }: CreditsTableoidProps) => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] p-4 md:p-8">
      {/* Masthead */}
      <div className="border-4 border-black bg-white px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-4xl md:text-5xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
            WHO IS BEHIND THIS CONSPIRACY?
          </div>
          <Button 
            onClick={onClose}
            className="w-auto border-2 border-black bg-white text-black text-lg font-extrabold uppercase px-4 py-2 shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            BACK
          </Button>
        </div>
        <div className="mt-2 bg-black text-white font-black uppercase text-xs md:text-sm px-2 py-1 inline-block">
          CLASSIFIED PERSONNEL FILES EXPOSED!
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Main credits */}
        <div className="space-y-4">
          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] relative">
            <div className="absolute -top-2 -right-2 bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
              TOP SECRET
            </div>
            <h2 className="font-black uppercase text-xl mb-3 tracking-tight">DEEP STATE OPERATIVES</h2>
            <div className="space-y-2 text-sm">
              <div><strong>GAME DESIGN:</strong> Tom Husby and Definitely Not The Illuminati</div>
              <div><strong>PROGRAMMING:</strong> A Very Smart AI (Trust Us)</div>
              <div><strong>HUMOR CONSULTANT:</strong> Your Conspiracy Theory Uncle</div>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] relative">
            <div className="absolute -top-2 -right-2 bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
              CLASSIFIED
            </div>
            <h2 className="font-black uppercase text-xl mb-3 tracking-tight">QUALITY ASSURANCE</h2>
            <div className="space-y-2 text-sm">
              <div><strong>TESTING:</strong> Actual Lizard People</div>
              <div><strong>FACT CHECKING:</strong> Nobody (Obviously)</div>
              <div><strong>SECURITY:</strong> Men in Black (On Break)</div>
            </div>
          </div>
        </div>

        {/* Right column - Special thanks and disclaimer */}
        <div className="space-y-4">
          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
            <h2 className="font-black uppercase text-xl mb-3 tracking-tight">SPECIAL THANKS</h2>
            <div className="space-y-1 text-sm">
              <div>• The Birds (Government Drones Division)</div>
              <div>• Big Pharma (For the Snacks)</div>
              <div>• The Real Area 51 Gift Shop</div>
              <div>• Karen from Facebook</div>
              <div>• Reptilian Overlords (Catering)</div>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
            <h2 className="font-black uppercase text-xl mb-3 tracking-tight">LEGAL DISCLAIMER</h2>
            <div className="text-xs leading-relaxed">
              This game is satire. Any resemblance to actual shadow governments,
              living or dead, or actual conspiracies, proven or unproven,
              is purely coincidental. Probably. No reptilians were harmed 
              in the making of this game.
            </div>
          </div>

          {/* Fake ad */}
          <div className="border-2 border-black bg-white p-2 text-xs uppercase tracking-wide text-center">
            <div className="font-black mb-1">TINFOIL HATS SALE!</div>
            <div>Buy 2 Get 3rd Free - Block Mind Control Today!</div>
          </div>
        </div>
      </div>

      {/* Bottom fake newspaper strips */}
      <div className="mt-6 space-y-2">
        <div className="h-2 bg-[#e9e9e9]"></div>
        <div className="h-2 bg-[#e9e9e9] w-3/4"></div>
        <div className="h-2 bg-[#e9e9e9] w-1/2"></div>
      </div>

      {/* Footer fake ad */}
      <div className="mt-6 border-2 border-black bg-white p-2 text-xs uppercase tracking-wide text-center">
        <div className="font-black">PARANOID TIMES SUBSCRIPTION</div>
        <div>Get the TRUTH delivered to your bunker! Only $9.99/month*</div>
        <div className="text-[8px] mt-1">*May cause increased paranoia and sudden urge to build underground shelters</div>
      </div>
    </div>
  );
};

export default CreditsTableoid;