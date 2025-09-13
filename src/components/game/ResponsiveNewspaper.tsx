import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveNewspaperProps {
  onClose: () => void;
  events: Array<{
    type: string;
    description: string;
    impact?: string;
  }>;
  playedCards: Array<{
    card: any;
    playedBy: string;
  }>;
  faction: 'government' | 'truth';
  truth: number;
}

const ResponsiveNewspaper: React.FC<ResponsiveNewspaperProps> = ({
  onClose,
  events,
  playedCards,
  faction,
  truth
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();
  
  // Mobile: 2-3 articles per page, Desktop: all articles
  const articlesPerPage = isMobile ? 2 : 6;
  const totalPages = Math.ceil(Math.max(events.length, playedCards.length, 1) / articlesPerPage);

  const generateHeadlines = () => {
    const headlines = [
      "CONSPIRACY THEORIES SPREADING",
      "GOVERNMENT DENIES EVERYTHING", 
      "TRUTH SEEKERS GAIN MOMENTUM",
      "CLASSIFIED DOCUMENTS LEAKED",
      "DEEP STATE ACTIVITIES EXPOSED",
      "ALIEN COVER-UP ALLEGATIONS"
    ];
    return headlines.slice(0, articlesPerPage);
  };

  const generateFakeAds = () => {
    const ads = [
      "TINFOIL HATS - 50% OFF!",
      "CONSPIRACY WEEKLY - SUBSCRIBE NOW!",
      "BUNKER SUPPLIES AVAILABLE",
      "TRUTH SERUM - GUARANTEED RESULTS",
      "ALIEN DETECTORS FOR SALE",
      "GOVERNMENT SURVEILLANCE BLOCKERS"
    ];
    return ads;
  };

  const getCurrentPageContent = () => {
    const start = currentPage * articlesPerPage;
    const end = start + articlesPerPage;
    return {
      events: events.slice(start, end),
      cards: playedCards.slice(start, end)
    };
  };

  const content = getCurrentPageContent();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`
        bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden
        ${isMobile ? 'h-full' : 'h-auto'}
      `}>
        {/* Newspaper Header */}
        <div className="border-b-4 border-black bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
              THE PARANOID TIMES
            </h1>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="min-w-[44px] min-h-[44px] border-2 border-black"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="bg-black text-white px-2 py-1 text-xs md:text-sm font-black uppercase">
            BREAKING: TRUTH LEVEL AT {Math.round(truth)}%
          </div>
        </div>

        {/* Page Navigation (Mobile) */}
        {isMobile && totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-b border-gray-300">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="min-w-[44px] min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-sm font-bold">
              Page {currentPage + 1} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="min-w-[44px] min-h-[44px]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {isMobile ? (
            /* Mobile Layout: Stack articles vertically */
            <div className="space-y-4">
              {content.events.map((event, index) => (
                <div key={index} className="border-2 border-black bg-white p-3">
                  <h2 className="font-black text-lg uppercase mb-2">
                    {generateHeadlines()[index] || "BREAKING NEWS"}
                  </h2>
                  <div className="text-sm leading-relaxed">
                    {event.description}
                  </div>
                  {event.impact && (
                    <div className="mt-2 text-xs text-gray-600 italic">
                      Impact: {event.impact}
                    </div>
                  )}
                </div>
              ))}
              
              {content.cards.map((playedCard, index) => (
                <div key={index} className="border-2 border-black bg-gray-50 p-3">
                  <h3 className="font-bold text-base uppercase mb-1">
                    CARD DEPLOYED: {playedCard.card.name}
                  </h3>
                  <div className="text-sm">
                    {playedCard.card.text}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Deployed by: {playedCard.playedBy === 'player' ? 'Truth Seekers' : 'Government'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop Layout: Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main articles */}
              {events.map((event, index) => (
                <div key={index} className="border-2 border-black bg-white p-4">
                  <h2 className="font-black text-xl uppercase mb-2 border-b border-black pb-1">
                    {generateHeadlines()[index] || "BREAKING NEWS"}
                  </h2>
                  <div className="text-sm leading-relaxed">
                    {event.description}
                  </div>
                  {event.impact && (
                    <div className="mt-2 text-xs text-gray-600 italic border-t border-gray-300 pt-2">
                      Impact: {event.impact}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Card deployments */}
              {playedCards.map((playedCard, index) => (
                <div key={index} className="border-2 border-black bg-gray-50 p-4">
                  <h3 className="font-bold text-lg uppercase mb-2 border-b border-black pb-1">
                    OPERATION: {playedCard.card.name}
                  </h3>
                  <div className="text-sm leading-relaxed">
                    {playedCard.card.text}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 border-t border-gray-300 pt-2">
                    Deployed by: {playedCard.playedBy === 'player' ? 'Truth Seekers' : 'Government'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fake Ads Section (Scrollable on mobile) */}
        <div className="border-t-2 border-black bg-gray-100 p-3">
          <div className="text-xs font-bold uppercase mb-2">CLASSIFIED ADS</div>
          <div className={`
            flex gap-2
            ${isMobile ? 'overflow-x-auto pb-2' : 'flex-wrap'}
          `}>
            {generateFakeAds().map((ad, index) => (
              <div
                key={index}
                className={`
                  border border-black bg-white p-2 text-xs text-center font-bold
                  ${isMobile ? 'flex-shrink-0 min-w-[150px]' : 'flex-1'}
                `}
              >
                {ad}
              </div>
            ))}
          </div>
        </div>

        {/* Close Button (Mobile) */}
        {isMobile && (
          <div className="p-4 border-t border-gray-300">
            <Button
              onClick={onClose}
              className="w-full min-h-[44px] font-bold"
            >
              Continue Playing
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResponsiveNewspaper;