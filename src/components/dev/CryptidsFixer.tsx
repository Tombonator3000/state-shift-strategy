import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fixCryptidsExtension } from '@/utils/fixCryptidsExtension';

export const CryptidsFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
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

  return (
    <div className="p-4 border rounded bg-card">
      <h3 className="text-lg font-semibold mb-2">Cryptids Extension Fixer</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This tool fixes faction casing issues in cryptids.json (Truth → truth, Government → government)
      </p>
      
      <Button 
        onClick={handleFix} 
        disabled={isFixing}
        className="mb-2"
      >
        {isFixing ? 'Fixing...' : 'Fix Cryptids Extension'}
      </Button>
      
      {status && (
        <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};