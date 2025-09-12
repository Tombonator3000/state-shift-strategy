// Development page for card effect validation and testing
import React from 'react';
import CardEffectValidatorPanel from '@/components/dev/CardEffectValidator';

const DevValidation: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <CardEffectValidatorPanel />
    </div>
  );
};

export default DevValidation;