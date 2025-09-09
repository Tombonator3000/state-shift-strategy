import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { extensionManager, type Extension } from '@/data/extensionSystem';

interface ManageExpansionsProps {
  onClose: () => void;
}

interface ExtensionDisplay extends Extension {
  enabled: boolean;
  source: 'cdn' | 'folder' | 'file';
}

const ManageExpansions = ({ onClose }: ManageExpansionsProps) => {
  const [extensions, setExtensions] = useState<ExtensionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExtensions();
  }, []);

  const loadExtensions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cdnExtensions = await extensionManager.scanCDNExtensions();
      const enabledList = extensionManager.getEnabledExtensions();
      
      const displayExtensions: ExtensionDisplay[] = cdnExtensions.map(ext => ({
        ...ext,
        enabled: enabledList.some(e => e.id === ext.id),
        source: 'cdn' as const
      }));

      setExtensions(displayExtensions);
      
      if (displayExtensions.length === 0) {
        setError('No extensions found. Try loading from folder or files below.');
      }
    } catch (err) {
      console.warn('Extension loading failed:', err);
      setError('Failed to load extensions from server. Try manual loading.');
      setExtensions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFromFolder = async () => {
    try {
      const folderExtensions = await extensionManager.loadFromFolderPicker();
      const enabledList = extensionManager.getEnabledExtensions();
      
      const newExtensions: ExtensionDisplay[] = folderExtensions.map(ext => ({
        ...ext,
        enabled: enabledList.some(e => e.id === ext.id),
        source: 'folder' as const
      }));

      // Merge with existing, avoiding duplicates
      setExtensions(prev => {
        const merged = [...prev];
        newExtensions.forEach(newExt => {
          const existingIndex = merged.findIndex(e => e.id === newExt.id);
          if (existingIndex >= 0) {
            merged[existingIndex] = newExt;
          } else {
            merged.push(newExt);
          }
        });
        return merged;
      });

      if (folderExtensions.length === 0) {
        setError('No valid extension files found in selected folder.');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Failed to load extensions from folder.');
    }
  };

  const loadFromFiles = async () => {
    try {
      const fileExtensions = await extensionManager.loadFromFilePicker();
      const enabledList = extensionManager.getEnabledExtensions();
      
      const newExtensions: ExtensionDisplay[] = fileExtensions.map(ext => ({
        ...ext,
        enabled: enabledList.some(e => e.id === ext.id),
        source: 'file' as const
      }));

      // Merge with existing, avoiding duplicates
      setExtensions(prev => {
        const merged = [...prev];
        newExtensions.forEach(newExt => {
          const existingIndex = merged.findIndex(e => e.id === newExt.id);
          if (existingIndex >= 0) {
            merged[existingIndex] = newExt;
          } else {
            merged.push(newExt);
          }
        });
        return merged;
      });

      if (fileExtensions.length === 0) {
        setError('No valid extension files selected.');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Failed to load extensions from files.');
    }
  };

  const toggleExtension = (extension: ExtensionDisplay) => {
    if (extension.enabled) {
      extensionManager.disableExtension(extension.id);
    } else {
      extensionManager.enableExtension(extension, extension.source);
    }
    
    // Update display
    setExtensions(prev => prev.map(ext => 
      ext.id === extension.id 
        ? { ...ext, enabled: !ext.enabled }
        : ext
    ));
  };

  const filteredExtensions = extensions.filter(ext =>
    ext.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ext.author.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-600' : 'bg-government-blue';
  };

  const getStatusText = (enabled: boolean) => {
    return enabled ? 'ENABLED' : 'DISABLED';
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
            EXTENSION ARCHIVES
          </h1>
          <div className="text-sm text-newspaper-text/80 mb-4">
            Classified expansion packages and cryptid modules
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search extensions..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1 border-newspaper-text text-newspaper-text"
            />
            <Button
              onClick={loadExtensions}
              variant="outline"
              className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
              disabled={loading}
            >
              {loading ? 'SCANNING...' : 'REFRESH'}
            </Button>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={loadFromFolder}
              variant="outline"
              className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              Load From Folder...
            </Button>
            <Button
              onClick={loadFromFiles}
              variant="outline"
              className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              Add JSON Files...
            </Button>
          </div>

          {error && (
            <div className="text-truth-red text-sm p-2 border border-truth-red/30 bg-truth-red/5">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="text-center text-newspaper-text/60 py-8">
              <div className="text-lg mb-2">SCANNING EXTENSIONS...</div>
              <div className="text-sm">Checking /extensions/ directory</div>
            </div>
          ) : filteredExtensions.length === 0 ? (
            <div className="text-center text-newspaper-text/60 py-8">
              <div className="text-lg mb-2">NO EXTENSIONS FOUND</div>
              <div className="text-sm mb-4">
                {searchFilter 
                  ? 'No extensions match your search criteria.' 
                  : 'Use the buttons above to load extension files.'
                }
              </div>
            </div>
          ) : (
            filteredExtensions.map((extension) => (
              <Card key={extension.id} className="p-6 border-2 border-newspaper-text bg-newspaper-bg hover:border-newspaper-text/80 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-newspaper-text">
                        {extension.name}
                      </h3>
                      <Badge className={`${getStatusColor(extension.enabled)} text-white font-mono text-xs`}>
                        {getStatusText(extension.enabled)}
                      </Badge>
                      <Badge variant="outline" className="border-newspaper-text text-newspaper-text font-mono">
                        v{extension.version}
                      </Badge>
                      {extension.enabled && (
                        <Badge className="bg-green-600 text-white font-mono text-xs">
                          🦎 ACTIVE
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-newspaper-text/80 mb-3">
                      {extension.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs border-newspaper-text/40 text-newspaper-text/70">
                        {extension.count} Cards
                      </Badge>
                      <Badge variant="outline" className="text-xs border-newspaper-text/40 text-newspaper-text/70">
                        {extension.factions.join(' + ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-newspaper-text/40 text-newspaper-text/70">
                        {extension.source.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="text-xs font-mono text-red-600 border border-red-600/30 p-2 bg-red-600/5 inline-block">
                      CLASSIFIED - AUTHOR: {extension.author}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <Button 
                      onClick={() => toggleExtension(extension)}
                      className={`w-full ${
                        extension.enabled 
                          ? 'bg-truth-red hover:bg-truth-red/80' 
                          : 'bg-government-blue hover:bg-government-blue/80'
                      } text-white`}
                    >
                      {extension.enabled ? 'DISABLE' : 'ENABLE'}
                    </Button>
                    <div className="text-xs text-center text-newspaper-text/60 font-mono">
                      ID: {extension.id}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 p-4 border-t-2 border-newspaper-text/30">
          <div className="flex flex-wrap justify-between items-center text-sm text-newspaper-text/60 font-mono">
            <div>LOADED: {extensions.length}</div>
            <div>ENABLED: {extensions.filter(e => e.enabled).length}</div>
            <div>TOTAL CARDS: {extensions.filter(e => e.enabled).reduce((sum, ext) => sum + ext.count, 0)}</div>
            {searchFilter && (
              <div>FILTERED: {filteredExtensions.length}/{extensions.length}</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-newspaper-text/60">
          <div className="mb-2">WARNING: Extension content may cause reality distortion</div>
          <div>Extensions are loaded from JSON files and may contain satirical content</div>
          <div className="mt-2 text-red-600 font-bold">
            [REDACTED] - Clearance Level: EXTENSION MANAGER
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManageExpansions;