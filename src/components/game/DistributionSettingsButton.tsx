import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { DistributionSettings } from './DistributionSettings';

export const DistributionSettingsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
      >
        Card Distribution
      </Button>
      
      <DistributionSettings 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};