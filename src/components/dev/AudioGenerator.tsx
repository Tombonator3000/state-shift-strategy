import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioGenerator } from '@/utils/audioGenerator';

export const AudioGeneratorComponent: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string>('Ready');
  
  const generator = new AudioGenerator();

  const downloadAudio = (buffer: AudioBuffer, filename: string) => {
    const blob = generator.bufferToBlob(buffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateAllSounds = async () => {
    setGenerating(true);
    setStatus('Generating paranormal sound effects...');
    
    try {
      // Generate UFO sound
      const ufoBuffer = generator.generateUFOSound(2.5);
      if (ufoBuffer) {
        downloadAudio(ufoBuffer, 'ufo-elvis.wav');
        setStatus('Generated UFO sound ✓');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate radio static
      const staticBuffer = generator.generateStaticSound(2.0);
      if (staticBuffer) {
        downloadAudio(staticBuffer, 'radio-static.wav');
        setStatus('Generated radio static ✓');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate cryptid rumble
      const rumbleBuffer = generator.generateRumbleSound(3.5);
      if (rumbleBuffer) {
        downloadAudio(rumbleBuffer, 'cryptid-rumble.wav');
        setStatus('Generated cryptid rumble ✓');
      }
      
      setStatus('All paranormal sounds generated! Download and place in public/audio/');
    } catch (error) {
      setStatus('Error generating sounds: ' + error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎵 Paranormal Audio Generator
          <Badge variant="secondary">Dev Tool</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Generate missing sound effects for paranormal game features:
        </div>
        
        <div className="space-y-2 text-sm">
          <div>• UFO/Elvis broadcast sound</div>
          <div>• Radio static interference</div>
          <div>• Cryptid rumble effect</div>
        </div>
        
        <Button 
          onClick={generateAllSounds} 
          disabled={generating}
          className="w-full"
        >
          {generating ? 'Generating...' : 'Generate & Download Sounds'}
        </Button>
        
        <div className="text-xs text-center p-2 bg-muted rounded">
          {status}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Note: After downloading, convert WAV files to MP3 and place them in the public/audio/ directory.
        </div>
      </CardContent>
    </Card>
  );
};