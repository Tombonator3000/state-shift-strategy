import howToPlay from '@/../docs/HowToPlay_v21E.md?raw';
import { Button } from '@/components/ui/button';

interface HowToPlayTabloidProps {
  onClose: () => void;
}

const HowToPlayTabloid = ({ onClose }: HowToPlayTabloidProps) => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] p-4 md:p-8">
      <div className="border-4 border-black bg-white px-4 py-3 mb-6 flex items-center justify-between">
        <div className="text-4xl md:text-5xl font-black uppercase tracking-tight">LEAKED INSTRUCTIONS!</div>
        <Button
          onClick={onClose}
          className="w-auto border-2 border-black bg-white text-black text-lg font-extrabold uppercase px-4 py-2 shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000]"
        >
          CLOSE
        </Button>
      </div>
      <div className="border-4 border-black bg-white shadow-[6px_6px_0_#000] p-6 overflow-y-auto h-[70vh] whitespace-pre-wrap text-sm">
        {howToPlay}
      </div>
    </div>
  );
};

export default HowToPlayTabloid;
