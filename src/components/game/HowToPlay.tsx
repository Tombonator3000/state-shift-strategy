import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import howToPlay from '@/../docs/HowToPlay_v21E.md?raw';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay = ({ onClose }: HowToPlayProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 overflow-y-auto h-[calc(90vh-4rem)] whitespace-pre-wrap text-sm">
          {howToPlay}
        </div>
        <div className="p-2 border-t flex justify-end bg-background">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};

export default HowToPlay;
