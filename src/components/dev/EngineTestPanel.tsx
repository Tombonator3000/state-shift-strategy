import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { runEngineDemo, DEMO_CARDS } from '@/engine/demo';
import { normalizeEffects } from '@/engine/normalize';

export function EngineTestPanel() {
  const [demoOutput, setDemoOutput] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [normalizedEffects, setNormalizedEffects] = useState<any>(null);

  const handleRunDemo = () => {
    const output = runEngineDemo();
    setDemoOutput(output);
  };

  const handleCardTest = (card: any) => {
    setSelectedCard(card);
    const normalized = normalizeEffects(card.effects);
    setNormalizedEffects(normalized);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-neutral-800 text-white">
      <h3 className="text-lg font-semibold">🔧 Card Rule Engine Test Panel</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Demo Runner */}
        <div className="space-y-2">
          <h4 className="font-medium">Engine Demo</h4>
          <Button onClick={handleRunDemo} variant="outline" size="sm">
            Run Complete Demo
          </Button>
          
          {demoOutput && (
            <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-auto">
              {demoOutput}
            </div>
          )}
        </div>

        {/* Card Effect Tester */}
        <div className="space-y-2">
          <h4 className="font-medium">Effect Normalization Test</h4>
          <div className="grid grid-cols-2 gap-1">
            {DEMO_CARDS.map(card => (
              <Button 
                key={card.id}
                onClick={() => handleCardTest(card)}
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                {card.name}
              </Button>
            ))}
          </div>
          
          {selectedCard && (
            <div className="mt-2 space-y-2">
              <div className="text-sm">
                <strong>Selected:</strong> {selectedCard.name} ({selectedCard.type})
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <strong>Raw Effects:</strong>
                  <pre className="p-1 bg-black/20 rounded mt-1 overflow-auto max-h-20">
                    {JSON.stringify(selectedCard.effects, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <strong>Normalized:</strong>
                  <pre className="p-1 bg-black/20 rounded mt-1 overflow-auto max-h-20">
                    {JSON.stringify(normalizedEffects, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs opacity-70">
        <p><strong>How to test:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Click "Run Complete Demo" to see full attack → reaction → resolution flow</li>
          <li>Click card names to test effect normalization for both flat and JSON-string formats</li>
          <li>Check browser console for detailed engine logs</li>
          <li>Open ReactionModal by playing ATTACK or MEDIA cards in-game</li>
        </ul>
      </div>
    </div>
  );
}