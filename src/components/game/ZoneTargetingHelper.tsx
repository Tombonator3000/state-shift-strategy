import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ZoneTargetingHelperProps {
  selectedZoneCard: string | null;
  onCancel: () => void;
}

const ZoneTargetingHelper: React.FC<ZoneTargetingHelperProps> = ({ 
  selectedZoneCard, 
  onCancel 
}) => {
  if (!selectedZoneCard) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <Card className="bg-newspaper-text text-newspaper-bg border-2 border-yellow-400 shadow-2xl">
        <div className="p-4 text-center">
          <Badge variant="outline" className="mb-2 border-yellow-400 text-yellow-400 bg-black/20">
            🎯 ZONE TARGETING MODE
          </Badge>
          
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Neutral states - Valid targets</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Enemy states - Valid targets</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded opacity-50"></div>
              <span>Your states - Cannot target</span>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-mono"
          >
            Cancel Targeting
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ZoneTargetingHelper;