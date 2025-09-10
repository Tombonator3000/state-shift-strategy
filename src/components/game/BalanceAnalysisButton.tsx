import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Calculator } from 'lucide-react';
import FactionBalanceDashboard from './FactionBalanceDashboard';

const BalanceAnalysisButton: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDashboard(true)}
        className="flex items-center gap-2"
        title="Analyze card balance and faction alignment"
      >
        <BarChart3 size={16} />
        <Calculator size={16} />
        Balance Analysis
      </Button>

      {showDashboard && (
        <FactionBalanceDashboard onClose={() => setShowDashboard(false)} />
      )}
    </>
  );
};

export default BalanceAnalysisButton;