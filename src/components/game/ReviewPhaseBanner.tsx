import React from 'react';
import { Button } from '@/components/ui/button';
import { useUIState } from '@/hooks/useUIState';
import { continueToNewspaper } from '@/phase/phaseController';

const ReviewPhaseBanner: React.FC = () => {
  const { showReviewBanner, phase } = useUIState();

  if (!showReviewBanner || phase !== 'REVIEW') {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none z-[9998]">
      <div className="pointer-events-auto bg-newspaper-text text-newspaper-bg border-2 border-newspaper-border px-4 py-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-3">
        <span className="font-mono text-sm uppercase tracking-wide text-center">
          Review played cards → Continue to Newspaper
        </span>
        <Button
          onClick={continueToNewspaper}
          size="sm"
          className="bg-newspaper-bg text-newspaper-text hover:bg-newspaper-bg/80 text-xs font-bold px-4 py-2"
        >
          Continue to Newspaper
        </Button>
      </div>
    </div>
  );
};

export default ReviewPhaseBanner;
