import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { NewspaperIssue, QueuedArticle } from '@/systems/newspaper';

interface NewspaperOverlayProps {
  issue: NewspaperIssue;
  onClose: () => void;
}

export const NewspaperOverlay: React.FC<NewspaperOverlayProps> = ({ issue, onClose }) => {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    // Escape key to close
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  useEffect(() => {
    if (issue.isGlitchEdition) {
      setGlitching(true);
      const timer = setTimeout(() => setGlitching(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [issue.isGlitchEdition]);

  const ArticleCard: React.FC<{ article: QueuedArticle; isMain?: boolean }> = ({ 
    article, 
    isMain = false 
  }) => (
    <div className={`${isMain ? 'mb-6' : 'mb-4'} border border-zinc-800 bg-zinc-950/90`}>
      {/* Editorial stamp */}
      {article.stamp && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge 
            variant="destructive" 
            className="bg-red-600 text-white font-bold rotate-12 shadow-lg"
          >
            {article.stamp}
          </Badge>
        </div>
      )}
      
      {/* Article image */}
      {article.imageUrl && isMain && (
        <div className="relative overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt="Article illustration"
            className="w-full h-48 object-cover filter grayscale contrast-125"
            onError={(e) => {
              e.currentTarget.src = '/img/classified-placeholder.png';
            }}
          />
          {/* Halftone effect overlay */}
          <div className="absolute inset-0 bg-zinc-900/20 mix-blend-multiply"></div>
        </div>
      )}
      
      <div className="p-4">
        {/* Headline */}
        <h2 className={`font-black text-zinc-100 leading-tight tracking-tight mb-2 ${
          isMain ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
        }`}>
          {article.title}
        </h2>
        
        {/* Dek (subtitle) */}
        {article.dek && (
          <p className="text-zinc-400 font-medium mb-3 text-sm md:text-base italic">
            {article.dek}
          </p>
        )}
        
        {/* Body paragraphs */}
        {isMain && article.body.map((paragraph, index) => (
          <p key={index} className="text-zinc-300 text-sm leading-relaxed mb-2 font-serif">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );

  const FakeAdCard: React.FC<{ ad: any }> = ({ ad }) => (
    <Card className="p-3 bg-zinc-900/80 border-zinc-700 border-dashed">
      <div className="text-xs text-zinc-500 mb-1">ADVERTISEMENT</div>
      <h4 className="font-bold text-zinc-200 text-sm mb-1">{ad.title}</h4>
      {ad.kicker && (
        <div className="text-xs text-red-400 font-bold mb-1">{ad.kicker}</div>
      )}
      {ad.body && (
        <p className="text-xs text-zinc-400 leading-tight">{ad.body}</p>
      )}
      {ad.footer && (
        <div className="text-xs text-zinc-500 mt-1 italic">{ad.footer}</div>
      )}
    </Card>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-zinc-50 text-zinc-900 border-zinc-800 relative overflow-hidden">
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Newspaper texture background */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          <div className="relative p-6 md:p-8">
            {/* Masthead */}
            <div className="text-center border-b-4 border-zinc-900 pb-4 mb-6">
              <h1 className={`font-black text-4xl md:text-6xl tracking-tighter mb-2 ${
                glitching ? 'animate-pulse text-red-600' : 'text-zinc-900'
              } ${issue.isGlitchEdition ? 'font-mono' : 'font-serif'}`}>
                {issue.masthead}
              </h1>
              
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Vol. {issue.volume}</span>
                <span className="text-center flex-1">{issue.date}</span>
                <span>PRICE: YOUR SANITY</span>
              </div>
              
              {issue.isGlitchEdition && (
                <div className="mt-2">
                  <Badge variant="destructive" className="animate-pulse">
                    GLITCHED EDITION!
                  </Badge>
                </div>
              )}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content column */}
              <div className="lg:col-span-2">
                {/* Main articles */}
                {issue.mainArticles.map((article, index) => (
                  <div key={article.cardId} className="relative">
                    <ArticleCard article={article} isMain={index === 0} />
                    
                    {/* Add red arrow or circle overlay occasionally */}
                    {Math.random() > 0.7 && (
                      <div className="absolute top-4 left-4 text-red-600 text-2xl font-bold animate-pulse">
                        →
                      </div>
                    )}
                  </div>
                ))}
                
                {/* News ticker */}
                {issue.ticker.length > 0 && (
                  <div className="bg-red-600 text-white p-2 font-bold text-sm overflow-hidden">
                    <div className="flex animate-marquee whitespace-nowrap">
                      {issue.ticker.map((item, index) => (
                        <span key={index} className="mx-8">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Side article */}
                {issue.sideArticle && (
                  <div>
                    <h3 className="font-black text-lg mb-3 text-center border-b-2 border-zinc-900 pb-1">
                      NEWS IN BRIEF
                    </h3>
                    <ArticleCard article={issue.sideArticle} />
                  </div>
                )}

                {/* Sidebar facts */}
                {issue.sidebar && (
                  <Card className="p-3 bg-zinc-100 border-zinc-800">
                    <h4 className="font-bold text-sm mb-2 text-center">DID YOU KNOW?</h4>
                    <p className="text-xs text-zinc-700 leading-tight font-serif">
                      {issue.sidebar}
                    </p>
                  </Card>
                )}

                {/* Fake ads */}
                <div className="space-y-3">
                  {issue.ads.map((ad, index) => (
                    <FakeAdCard key={index} ad={ad} />
                  ))}
                </div>

                {/* Weather */}
                <Card className="p-3 bg-zinc-900 text-zinc-100 border-zinc-700">
                  <h4 className="font-bold text-sm mb-2 text-center text-white">
                    CONSPIRACY FORECAST
                  </h4>
                  <div className="text-xs space-y-1">
                    <div>Today: Mostly paranoid with chance of revelation</div>
                    <div>Tomorrow: Scattered cover-ups, clearing by noon</div>
                    <div>Weekend: Perfect conditions for rabbit holes</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Continue button */}
            <div className="text-center mt-8 pt-6 border-t-2 border-zinc-900">
              <Button 
                onClick={onClose}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 text-lg"
              >
                CONTINUE THE INVESTIGATION
              </Button>
              <p className="text-xs text-zinc-600 mt-2">
                Press ESC, ENTER, or SPACE to continue
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};