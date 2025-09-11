import React from 'react';
import ActionPhasePopup from './ActionPhasePopup';

interface FactionAwareActionPhaseProps {
  isVisible: boolean;
  truthLevel: number;
  playerFaction: 'truth' | 'government';
  onClose: () => void;
}

const FactionAwareActionPhase = ({
  isVisible,
  truthLevel,
  playerFaction,
  onClose
}: FactionAwareActionPhaseProps) => {
  // Use existing ActionPhasePopup but could be extended for faction-specific behavior
  return (
    <ActionPhasePopup
      isVisible={isVisible}
      truthLevel={truthLevel}
      onClose={onClose}
    />
  );
};

export default FactionAwareActionPhase;