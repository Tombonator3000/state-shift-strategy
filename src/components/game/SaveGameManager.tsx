import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SaveGameManagerProps {
  onLoadGame: () => boolean;
  getSaveInfo: () => any;
  onDeleteSave: () => boolean;
  onClose: () => void;
}

const SaveGameManager = ({ onLoadGame, getSaveInfo, onDeleteSave, onClose }: SaveGameManagerProps) => {
  const [loading, setLoading] = useState(false);
  const saveInfo = getSaveInfo();

  const handleLoadGame = async () => {
    setLoading(true);
    const success = onLoadGame();
    
    if (success) {
      // Show success message
      const indicator = document.createElement('div');
      indicator.textContent = '✓ GAME LOADED';
      indicator.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
      
      onClose();
    } else {
      // Show error message
      const indicator = document.createElement('div');
      indicator.textContent = '❌ FAILED TO LOAD';
      indicator.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
    setLoading(false);
  };

  const handleDeleteSave = () => {
    if (confirm('Are you sure you want to delete this save? This cannot be undone.')) {
      const success = onDeleteSave();
      
      if (success) {
        const indicator = document.createElement('div');
        indicator.textContent = '✓ SAVE DELETED';
        indicator.className = 'fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
        
        // Refresh the component to show no save exists
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      <Card className="max-w-2xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text relative" style={{ fontFamily: 'serif' }}>
        <Button 
          onClick={onClose}
          variant="outline" 
          className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
        >
          ← BACK
        </Button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-newspaper-text mb-4">
            CLASSIFIED FILES
          </h1>
          <div className="text-sm text-newspaper-text/80 mb-4">
            Load or manage your saved operations
          </div>
        </div>

        {saveInfo ? (
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg mb-6">
            <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">
              💾 OPERATION BACKUP
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-newspaper-text/60">Faction:</div>
                  <div className="font-bold text-newspaper-text capitalize">
                    {saveInfo.faction === 'truth' ? '🔍 Truth Seekers' : '🏛️ Government'}
                  </div>
                </div>
                <div>
                  <div className="text-newspaper-text/60">Turn:</div>
                  <div className="font-bold text-newspaper-text">
                    Turn {saveInfo.turn}, Round {saveInfo.round}
                  </div>
                </div>
                <div>
                  <div className="text-newspaper-text/60">Phase:</div>
                  <div className="font-bold text-newspaper-text capitalize">
                    {saveInfo.phase}
                  </div>
                </div>
                <div>
                  <div className="text-newspaper-text/60">Truth Level:</div>
                  <div className="font-bold text-newspaper-text">
                    {saveInfo.truth}%
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-newspaper-text/60 text-sm">Last Save:</div>
                <div className="font-mono text-newspaper-text">
                  {formatDistanceToNow(new Date(saveInfo.timestamp), { addSuffix: true })}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleLoadGame}
                  disabled={loading}
                  className="bg-green-700 hover:bg-green-600 text-white border-green-600 flex-1"
                >
                  {loading ? '⏳ LOADING...' : '📁 LOAD OPERATION'}
                </Button>
                <Button 
                  onClick={handleDeleteSave}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600/10"
                >
                  🗑️ DELETE
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg mb-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="font-bold text-xl text-newspaper-text mb-2">
                NO CLASSIFIED FILES FOUND
              </h3>
              <div className="text-sm text-newspaper-text/60">
                No saved games available. Start a new operation to create a save file.
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h3 className="font-bold text-lg text-newspaper-text mb-4">
            🔒 SECURITY PROTOCOLS
          </h3>
          <div className="text-sm text-newspaper-text/80 space-y-2">
            <div>• Save games are stored locally on your device</div>
            <div>• Your progress is automatically encrypted</div>
            <div>• Only one save slot is available per operation</div>
            <div>• Save data includes full game state and progress</div>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs text-newspaper-text/60">
          <div className="text-red-600 font-bold">
            [CLASSIFIED] - Local Storage Security Protocol Alpha-7
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SaveGameManager;