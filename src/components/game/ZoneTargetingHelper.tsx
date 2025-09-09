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

  // Don't render - zone targeting info is now shown on the map overlay only
  return null;
};

export default ZoneTargetingHelper;