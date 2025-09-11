import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, FolderOpen, FileText, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { extensionManager, type Extension } from '@/data/extensionSystem';

interface EnhancedExpansionManagerProps {
  onClose: () => void;
}

interface ExtensionDisplay extends Extension {
  enabled: boolean;
  source: 'cdn' | 'folder' | 'file' | 'local';
  status: 'loaded' | 'error' | 'loading';
}

const EnhancedExpansionManager = ({ onClose }: EnhancedExpansionManagerProps) => {
  const [extensions, setExtensions] = useState<ExtensionDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browser');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllExtensions();
  }, []);

  const loadAllExtensions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from local extensions directory first
      await loadLocalExtensions();
      
      // Then try CDN extensions
      await loadCDNExtensions();
      
    } catch (err) {
      console.warn('Extension loading failed:', err);
      setError('Failed to load extensions. Try manual loading.');
    } finally {
      setLoading(false);
    }
  };

  const loadLocalExtensions = async () => {
    try {
      // Try to load extensions from /public/extensions/
      const extensionFiles = [
        'halloween_spooktacular_with_temp_image.json',
        'cryptids.json'
      ];
      
      const enabledList = extensionManager.getEnabledExtensions();
      const localExtensions: ExtensionDisplay[] = [];
      
      for (const filename of extensionFiles) {
        try {
          const response = await fetch(`/extensions/${filename}`);
          if (response.ok) {
            const extensionData = await response.json();
            
            // Validate extension structure
            if (extensionData.id && extensionData.name && extensionData.cards) {
              localExtensions.push({
                ...extensionData,
                enabled: enabledList.some(e => e.id === extensionData.id),
                source: 'local' as const,
                status: 'loaded' as const
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to load ${filename}:`, err);
        }
      }
      
      setExtensions(prev => [...prev, ...localExtensions]);
      console.log(`🎮 Loaded ${localExtensions.length} local extensions`);
      
    } catch (err) {
      console.warn('Local extension loading failed:', err);
    }
  };

  const loadCDNExtensions = async () => {
    try {
      const cdnExtensions = await extensionManager.scanCDNExtensions();
      const enabledList = extensionManager.getEnabledExtensions();
      
      const displayExtensions: ExtensionDisplay[] = cdnExtensions.map(ext => ({
        ...ext,
        enabled: enabledList.some(e => e.id === ext.id),
        source: 'cdn' as const,
        status: 'loaded' as const
      }));

      setExtensions(prev => {
        // Merge with existing, avoid duplicates
        const existing = prev.filter(e => !displayExtensions.some(d => d.id === e.id));
        return [...existing, ...displayExtensions];
      });
      
      console.log(`🌐 Loaded ${displayExtensions.length} CDN extensions`);
      
    } catch (err) {
      console.warn('CDN extension loading failed:', err);
    }
  };

  const loadFromFiles = async () => {
    try {
      const fileList = await extensionManager.loadFromFilePicker();
      const enabledList = extensionManager.getEnabledExtensions();
      
      const fileExtensions: ExtensionDisplay[] = fileList.map(ext => ({
        ...ext,
        enabled: enabledList.some(e => e.id === ext.id),
        source: 'file' as const,
        status: 'loaded' as const
      }));

      setExtensions(prev => {
        const existing = prev.filter(e => !fileExtensions.some(f => f.id === e.id));
        return [...existing, ...fileExtensions];
      });
      
    } catch (error) {
      setError('Failed to load from files. Please check the JSON format.');
    }
  };

  const loadFromFolder = async () => {
    try {
      const folderList = await extensionManager.loadFromFolderPicker();
      const enabledList = extensionManager.getEnabledExtensions();
      
      const folderExtensions: ExtensionDisplay[] = folderList.map(ext => ({
        ...ext,
        enabled: enabledList.some(e => e.id === ext.id),
        source: 'folder' as const,
        status: 'loaded' as const
      }));

      setExtensions(prev => {
        const existing = prev.filter(e => !folderExtensions.some(f => f.id === e.id));
        return [...existing, ...folderExtensions];
      });
      
    } catch (error) {
      setError('Failed to load from folder. Please select a valid folder.');
    }
  };

  const toggleExtension = (extension: ExtensionDisplay) => {
    try {
      if (extension.enabled) {
        extensionManager.disableExtension(extension.id);
      } else {
        // Map 'local' to 'file' for the extension manager
        const sourceType = extension.source === 'local' ? 'file' : extension.source;
        extensionManager.enableExtension(extension, sourceType as 'cdn' | 'folder' | 'file');
      }
      
      // Update local state
      setExtensions(prev => 
        prev.map(ext => 
          ext.id === extension.id 
            ? { ...ext, enabled: !ext.enabled }
            : ext
        )
      );
      
    } catch (error) {
      setError(`Failed to ${extension.enabled ? 'disable' : 'enable'} extension: ${extension.name}`);
    }
  };

  const filteredExtensions = extensions.filter(ext =>
    ext.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ext.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ext.author?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const getStatusColor = (status: ExtensionDisplay['status']) => {
    switch (status) {
      case 'loaded': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-yellow-600';
      default: return 'text-newspaper-text';
    }
  };

  const getStatusIcon = (status: ExtensionDisplay['status']) => {
    switch (status) {
      case 'loaded': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'loading': return <AlertCircle className="w-4 h-4 animate-spin" />;
      default: return null;
    }
  };

  const getSourceIcon = (source: ExtensionDisplay['source']) => {
    switch (source) {
      case 'cdn': return <Package className="w-4 h-4" />;
      case 'folder': return <FolderOpen className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'local': return <Upload className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-6xl w-full max-h-[90vh] bg-newspaper-bg border-4 border-newspaper-text overflow-hidden">
        {/* Header */}
        <div className="relative bg-newspaper-text/10 p-6 border-b-2 border-newspaper-text">
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-newspaper-text h-4"
                style={{
                  width: `${Math.random() * 200 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 4 - 2}deg)`
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-newspaper-text font-mono">
                EXPANSION CONTROL CENTER
              </h2>
              <p className="text-sm text-newspaper-text/70 font-mono mt-1">
                Classification: RESTRICTED ACCESS
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              CLOSE
            </Button>
          </div>

          <div className="absolute top-2 right-20 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-1">
            TOP SECRET
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-200px)]">
          {/* Search and Stats */}
          <div className="p-4 border-b border-newspaper-text/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-newspaper-text/60" />
                <Input
                  placeholder="Search extensions..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 border-newspaper-text/30 bg-newspaper-bg text-newspaper-text"
                />
              </div>
              
              <div className="flex gap-2 text-sm font-mono text-newspaper-text/80">
                <span>{filteredExtensions.length} found</span>
                <span>•</span>
                <span>{filteredExtensions.filter(e => e.enabled).length} enabled</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-600/10 border border-red-600/20 text-red-600 p-3 rounded font-mono text-sm mb-4">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="browser" className="flex-1 flex flex-col">
            <div className="p-4 pb-0">
              <TabsList className="bg-newspaper-text/10 text-newspaper-text">
                <TabsTrigger value="browser">Browse Extensions</TabsTrigger>
                <TabsTrigger value="custom">Load Custom</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="browser" className="flex-1 p-4">
              {loading ? (
                <div className="text-center text-newspaper-text/60 py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-newspaper-text border-t-transparent rounded-full mx-auto mb-4"></div>
                  Scanning for extensions...
                </div>
              ) : (
                <ScrollArea className="h-full">
                  {filteredExtensions.length === 0 ? (
                    <div className="text-center text-newspaper-text/60 py-8">
                      No extensions found. Try loading custom files or check your connection.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredExtensions.map((extension) => (
                        <Card key={extension.id} className="p-4 bg-newspaper-text/5 border border-newspaper-text/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-newspaper-text font-mono">
                                  {extension.name}
                                </h3>
                                <Badge variant="outline" className="text-xs font-mono">
                                  v{extension.version}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {getSourceIcon(extension.source)}
                                  <span className="text-xs text-newspaper-text/60 capitalize">
                                    {extension.source}
                                  </span>
                                </div>
                                <div className={`flex items-center gap-1 ${getStatusColor(extension.status)}`}>
                                  {getStatusIcon(extension.status)}
                                </div>
                              </div>
                              
                              <p className="text-newspaper-text/80 mb-2">{extension.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-newspaper-text/60">
                                <span>By: {extension.author}</span>
                                <span>•</span>
                                <span>{extension.cards?.length || 0} cards</span>
                                {extension.factions && (
                                  <>
                                    <span>•</span>
                                    <span>Factions: {extension.factions.join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => toggleExtension(extension)}
                              variant={extension.enabled ? "default" : "outline"}
                              className={`ml-4 ${
                                extension.enabled 
                                  ? 'bg-government-blue text-white' 
                                  : 'border-newspaper-text text-newspaper-text'
                              }`}
                            >
                              {extension.enabled ? 'ENABLED' : 'ENABLE'}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="custom" className="flex-1 p-4">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-newspaper-text mb-2 font-mono">
                    LOAD CUSTOM EXTENSIONS
                  </h3>
                  <p className="text-newspaper-text/70 mb-6">
                    Import expansion packs from JSON files or folders
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-newspaper-text/5 border border-newspaper-text/20">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-newspaper-text mx-auto mb-4" />
                      <h4 className="font-bold text-newspaper-text mb-2 font-mono">Load from Files</h4>
                      <p className="text-sm text-newspaper-text/70 mb-4">
                        Select individual JSON extension files
                      </p>
                      <Button
                        onClick={loadFromFiles}
                        className="w-full bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80"
                      >
                        Choose JSON Files
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6 bg-newspaper-text/5 border border-newspaper-text/20">
                    <div className="text-center">
                      <FolderOpen className="w-12 h-12 text-newspaper-text mx-auto mb-4" />
                      <h4 className="font-bold text-newspaper-text mb-2 font-mono">Load from Folder</h4>
                      <p className="text-sm text-newspaper-text/70 mb-4">
                        Select a folder containing extension files
                      </p>
                      <Button
                        onClick={loadFromFolder}
                        variant="outline"
                        className="w-full border-newspaper-text text-newspaper-text"
                      >
                        Choose Folder
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="border-2 border-newspaper-text/20 p-4 bg-newspaper-text/5 rounded">
                  <h4 className="font-bold text-newspaper-text mb-2 font-mono">Extension Format</h4>
                  <pre className="text-xs text-newspaper-text/80 font-mono bg-black/20 p-2 rounded overflow-x-auto">
{`{
  "id": "unique_extension_id",
  "name": "Extension Name",
  "version": "1.0.0",
  "author": "Author Name",
  "description": "Extension description",
  "factions": ["government", "truth"],
  "cards": [
    {
      "id": "card_001",
      "name": "Card Name",
      "type": "MEDIA",
      "rarity": "common",
      "cost": 7,
      "text": "Card effect",
      "flavorGov": "Government flavor",
      "flavorTruth": "Truth flavor"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-text/10 p-4 border-t-2 border-newspaper-text">
          <div className="flex justify-between items-center text-xs font-mono text-newspaper-text/60">
            <div>
              CLASSIFIED - Extension Management System v2.1
            </div>
            <div className="flex gap-4">
              <span>{extensions.length} total extensions</span>
              <span>•</span>
              <span>{extensions.filter(e => e.enabled).length} active</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedExpansionManager;