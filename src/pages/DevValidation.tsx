// Development page for card effect validation and testing
import React from 'react';
import CardEffectValidatorPanel from '@/components/dev/CardEffectValidator';
import { CryptidsFixer } from '@/components/dev/CryptidsFixer';

const DevValidation: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        <CryptidsFixer />
        <CardEffectValidatorPanel />
      </div>
    </div>
  );
};

export default DevValidation;