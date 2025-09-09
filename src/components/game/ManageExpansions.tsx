import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface ManageExpansionsProps {
  onClose: () => void;
}

interface Expansion {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'installed' | 'coming_soon';
  price?: string;
  features: string[];
  classification: string;
}

const ManageExpansions = ({ onClose }: ManageExpansionsProps) => {
  const [expansions] = useState<Expansion[]>([
    {
      id: 'area51',
      name: 'AREA 51 DECLASSIFIED',
      description: 'Unlock alien conspiracy cards and the Nevada battlefield. Includes 50 new cards, UFO events, and extraterrestrial faction mechanics.',
      status: 'available',
      price: '$9.99',
      features: ['50+ Alien Cards', 'Nevada Map', 'UFO Events', 'Alien Faction'],
      classification: 'TOP SECRET - MAJESTIC'
    },
    {
      id: 'illuminati',
      name: 'ILLUMINATI PROTOCOLS',
      description: 'Join the ancient order with pyramid power cards, global banking conspiracies, and secret society mechanics.',
      status: 'installed',
      features: ['Ancient Order Cards', 'Banking System', 'Pyramid Powers', 'Society Mechanics'],
      classification: 'EYES ONLY - LEVEL Ω'
    },
    {
      id: 'moon_hoax',
      name: 'MOON LANDING HOAX',
      description: 'Expose or defend the greatest hoax in history. Includes NASA cards, studio set pieces, and space race mechanics.',
      status: 'available',
      price: '$7.99',
      features: ['NASA Cards', 'Studio Cards', 'Space Race Mode', 'Historical Events'],
      classification: 'CLASSIFIED - APOLLO'
    },
    {
      id: 'flat_earth',
      name: 'FLAT EARTH SOCIETY',
      description: 'Reshape reality with geometry-defying cards and physics-breaking mechanics. Warning: May cause existential crisis.',
      status: 'coming_soon',
      features: ['Reality Cards', 'Physics Engine', 'Globe vs Flat Mode', 'Educational Satire'],
      classification: 'RESTRICTED - REALITY LEVEL'
    },
    {
      id: 'time_travel',
      name: 'TEMPORAL ANOMALIES',
      description: 'Manipulate the timeline with paradox cards and causality loops. Past, present, and future collide in this mind-bending expansion.',
      status: 'coming_soon',
      features: ['Time Cards', 'Paradox System', 'Multi-Timeline Mode', 'Causality Engine'],
      classification: 'BEYOND TOP SECRET - CHRONOS'
    },
    {
      id: 'reptilian',
      name: 'REPTILIAN OVERLORDS',
      description: 'Infiltrate human society as shape-shifting lizard people. Includes transformation mechanics and underground city maps.',
      status: 'available',
      price: '$12.99',
      features: ['Shape-shift Cards', 'Underground Maps', 'Infiltration Mode', 'Species Mechanics'],
      classification: 'ULTRA CLASSIFIED - SCALE 7'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'bg-green-600';
      case 'available': return 'bg-government-blue';
      case 'coming_soon': return 'bg-newspaper-text/60';
      default: return 'bg-newspaper-text';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'installed': return 'DEPLOYED';
      case 'available': return 'ACQUIRE';
      case 'coming_soon': return 'INCOMING';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      {/* Redacted background pattern */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-newspaper-text h-6"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 4 - 2}deg)`
            }}
          />
        ))}
      </div>

      <Card className="max-w-6xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
        {/* Classified stamps */}
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2">
          EYES ONLY
        </div>

        {/* Back button */}
        <Button 
          onClick={onClose}
          variant="outline" 
          className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
        >
          ← BACK TO BASE
        </Button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-newspaper-text mb-4">
            EXPANSION ARCHIVES
          </h1>
          <div className="text-sm text-newspaper-text/80 mb-4">
            Classified mission packages and conspiracy modules
          </div>
        </div>

        <div className="grid gap-6">
          {expansions.map((expansion) => (
            <Card key={expansion.id} className="p-6 border-2 border-newspaper-text bg-newspaper-bg hover:border-newspaper-text/80 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-newspaper-text">
                      {expansion.name}
                    </h3>
                    <Badge className={`${getStatusColor(expansion.status)} text-white font-mono text-xs`}>
                      {getStatusText(expansion.status)}
                    </Badge>
                    {expansion.price && (
                      <Badge variant="outline" className="border-newspaper-text text-newspaper-text font-mono">
                        {expansion.price}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-newspaper-text/80 mb-3">
                    {expansion.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {expansion.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-newspaper-text/40 text-newspaper-text/70">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs font-mono text-red-600 border border-red-600/30 p-2 bg-red-600/5 inline-block">
                    {expansion.classification}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[120px]">
                  {expansion.status === 'installed' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full border-green-600 text-green-600 hover:bg-green-600/10"
                        disabled
                      >
                        ACTIVE
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-newspaper-text/60 text-newspaper-text/60 hover:bg-newspaper-text/5"
                      >
                        Deactivate
                      </Button>
                    </>
                  )}
                  
                  {expansion.status === 'available' && (
                    <>
                      <Button 
                        className="w-full bg-government-blue hover:bg-government-blue/80 text-white"
                      >
                        ACQUIRE
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
                      >
                        Preview
                      </Button>
                    </>
                  )}
                  
                  {expansion.status === 'coming_soon' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full border-newspaper-text/60 text-newspaper-text/60"
                        disabled
                      >
                        INCOMING
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-truth-red text-truth-red hover:bg-truth-red/10"
                      >
                        Notify Me
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 p-4 border-t-2 border-newspaper-text/30">
          <div className="flex flex-wrap justify-between items-center text-sm text-newspaper-text/60 font-mono">
            <div>INSTALLED: {expansions.filter(e => e.status === 'installed').length}/{expansions.length}</div>
            <div>AVAILABLE: {expansions.filter(e => e.status === 'available').length}</div>
            <div>COMING SOON: {expansions.filter(e => e.status === 'coming_soon').length}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-newspaper-text/60">
          <div className="mb-2">WARNING: Expansion content may cause reality distortion</div>
          <div>All purchases are final and may result in existential questioning</div>
          <div className="mt-2 text-red-600 font-bold">
            [REDACTED] - Clearance Level: COMPARTMENTALIZED
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManageExpansions;