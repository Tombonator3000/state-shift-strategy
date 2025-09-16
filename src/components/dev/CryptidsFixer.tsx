import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fixCryptidsExtension } from '@/utils/fixCryptidsExtension';
import { patchWildlifeAdvisoryCards } from '@/utils/patchWildlifeAdvisory';

export const CryptidsFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isPatching, setIsPatching] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleFix = async () => {
    setIsFixing(true);
    setStatus('Fixing cryptids extension...');
    
    try {
      await fixCryptidsExtension();
      setStatus('✅ Fixed cryptids.json downloaded! Replace the old file with this one.');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  const handleWildlifeAdvisoryPatch = async () => {
    setIsPatching(true);
    setStatus('Patching Wildlife Advisory cards...');
    
    try {
      const result = await patchWildlifeAdvisoryCards();
      if (result.errors.length > 0) {
        setStatus(`❌ Errors: ${result.errors.join(', ')}`);
      } else {
        setStatus(`✅ Wildlife Advisory patch complete! Updated ${result.updated} cards, ${result.alreadyOk} already OK. File downloaded.`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsPatching(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-card">
      <h3 className="text-lg font-semibold mb-2">Cryptids Extension Fixer</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Tools for fixing cryptids.json issues
      </p>
      
      <div className="space-y-2 mb-4">
        <Button 
          onClick={handleFix} 
          disabled={isFixing || isPatching}
          className="w-full"
        >
          {isFixing ? 'Fixing...' : 'Fix Faction Casing (Truth → truth, Government → government)'}
        </Button>
        
        <Button 
          onClick={handleWildlifeAdvisoryPatch} 
          disabled={isFixing || isPatching}
          className="w-full"
          variant="secondary"
        >
          {isPatching ? 'Patching...' : 'Patch Wildlife Advisory Cards (→ ZONE type, cost 5, state targeting)'}
        </Button>
      </div>
      
      {status && (
        <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};