import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Zap, TrendingUp } from 'lucide-react';

interface EnhancedNewspaperProps {
  onClose: () => void;
  gameEvents: Array<{
    type: string;
    description: string;
    impact?: string;
  }>;
  faction: 'government' | 'truth';
  round: number;
  truth: number;
  ip: number;
}

const EnhancedNewspaper = ({ onClose, gameEvents, faction, round, truth, ip }: EnhancedNewspaperProps) => {
  const [masthead, setMasthead] = useState('THE SHADOW TIMES');
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [fakeAds, setFakeAds] = useState<string[]>([]);
  const [mainEvent, setMainEvent] = useState<string>('');

  useEffect(() => {
    generateNewspaperContent();
  }, [gameEvents, faction, round, truth]);

  const generateNewspaperContent = () => {
    // 5% chance for glitch masthead
    const glitchMastheads = [
      'THE SHEEPLE DAILY',
      'AREA 51 DIGEST',
      'LIZARD PEOPLE POST', 
      'CONSPIRACY CHRONICLE',
      'THE TRUTH TRIBUNE',
      'WEEKLY WORLD WEIRD',
      'PARANOID PLANET',
      'TINFOIL TIMES'
    ];
    
    if (Math.random() < 0.05) {
      setMasthead(glitchMastheads[Math.floor(Math.random() * glitchMastheads.length)]);
    } else {
      setMasthead('THE SHADOW TIMES');
    }

    // Generate 3-4 headlines based on game events
    const generatedHeadlines: string[] = [];
    
    // Main event headline
    if (gameEvents && gameEvents.length > 0) {
      const mainGameEvent = gameEvents[gameEvents.length - 1];
      setMainEvent(generateMainHeadline(mainGameEvent, faction));
    }

    // Additional satirical headlines
    const satiricalHeadlines = [
      'Local Man Discovers Birds ARE Real, Confused',
      'Government Denies Existence of Government', 
      'Bigfoot Spotted Shopping at Walmart Again',
      'Elvis Found Working at McDonald\'s Drive-Thru',
      'Alien Abduction Rates Drop Due to Gas Prices',
      'Flat Earth Society Gains New Member: Your Mom',
      'Chemtrails Now Available in Strawberry Flavor',
      'Area 51 Offers Groupon Discounts This Week',
      'Illuminati Accidentally Sends Meeting Invite to Everyone',
      'Local Conspiracy Theorist Right About Everything, Still Ignored',
      'Government Weather Machine Broken, Actual Weather Occurs',
      'Lizard People Demand Better Healthcare Benefits',
      'Moon Landing Fake, But Moon Itself Also Questionable',
      'Time Travel Discovered Last Tuesday Next Week',
      'Local Cat Revealed as Deep State Agent',
      'WiFi Towers Mind Control Everyone Except Karen',
      'Bermuda Triangle Receives 1-Star Yelp Review',
      'Sasquatch Files for Unemployment Benefits',
      'Crop Circles Now Sponsored by Pizza Hut',
      'MK-Ultra Program Replaced by TikTok Algorithm'
    ];

    // Add faction-specific headlines
    if (faction === 'government') {
      satiricalHeadlines.push(
        'New Security Measures Definitely Not Surveillance',
        'Citizens Reminded: Nothing to See Here',
        'Weather Balloons Explain Everything, Officials Confirm',
        'Privacy is Overrated, Study Finds'
      );
    } else {
      satiricalHeadlines.push(
        'Wake Up Sheeple: A How-To Guide',
        'Essential Oils Proven to Cure Everything Including Disbelief',
        'Local Truth-Teller Still Trying to Convince Family',
        'Tinfoil Hat Sales Reach All-Time High'
      );
    }

    // Select random headlines
    const shuffled = [...satiricalHeadlines].sort(() => Math.random() - 0.5);
    generatedHeadlines.push(...shuffled.slice(0, 3));
    setHeadlines(generatedHeadlines);

    // Generate fake ads
    const adTexts = [
      'Buy 2 Tinfoil Hats, Get 3rd FREE!',
      'Florida Man University: Now Accepting Applications!',
      'Pastor Rex Predicts Your Future (Again)',
      'Alien Translation Services - We Speak Probe',
      'Bigfoot Dating App: \"Finally, Someone Your Size\"',
      'Conspiracy Theory Insurance: \"We Cover What They Won\'t\"',
      'Underground Bunker Rentals: \"Your Apocalypse Away From Home\"',
      'Mind Reading for Dummies: \"Now in Braille\"',
      'Elvis Impersonator School: \"Thank Ya Very Much\"',
      'Chemtrail Detox Kit: \"Clear Skies, Clear Minds\"',
      'Government Surveillance Counter-Kit: \"They\'re Watching, But So Are We\"',
      'Lizard People Skincare: \"Shed Your Old Life\"',
      'Time Machine Repair Service: \"We Fix Tomorrow\'s Problems Today\"',
      'Alien Probe Insurance: \"Comprehensive Coverage\"',
      'Flat Earth Travel Agency: \"Don\'t Fall Off the Edge\"',
      'Illuminati Membership Drive: \"Join the Club Everyone Talks About\"'
    ];

    const selectedAds = [...adTexts].sort(() => Math.random() - 0.5).slice(0, 2);
    setFakeAds(selectedAds);
  };

  const generateMainHeadline = (event: any, faction: 'government' | 'truth'): string => {
    const eventType = event.type?.toLowerCase() || 'unknown';
    
    if (eventType.includes('truth')) {
      if (faction === 'truth') {
        return 'TRUTH LEVELS SURGE: Citizens Begin Questioning Reality';
      } else {
        return 'MISINFORMATION SPREADS: Officials Urge Calm';
      }
    } else if (eventType.includes('state') || eventType.includes('capture')) {
      if (faction === 'government') {
        return 'SECURITY OPERATIONS EXPANDED: New Protective Measures';
      } else {
        return 'RESISTANCE GROWS: Liberation Forces Active';
      }
    } else if (eventType.includes('ip') || eventType.includes('influence')) {
      if (faction === 'government') {
        return 'STABILITY MEASURES IMPLEMENTED: Order Maintained';
      } else {
        return 'AWAKENING ACCELERATES: People Power Rising';
      }
    } else {
      const genericHeadlines = [
        'BREAKING: Something Definitely Happened Somewhere',
        'EXCLUSIVE: Local Events Continue to Occur',
        'URGENT: Situation Remains Situational',
        'ALERT: Activities Detected in Area'
      ];
      return genericHeadlines[Math.floor(Math.random() * genericHeadlines.length)];
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getTruthStatus = (truth: number): { text: string; color: string } => {
    if (truth >= 80) return { text: 'CRITICAL', color: 'text-red-600' };
    if (truth >= 60) return { text: 'ELEVATED', color: 'text-orange-500' };
    if (truth >= 40) return { text: 'MODERATE', color: 'text-yellow-600' };
    if (truth >= 20) return { text: 'LOW', color: 'text-green-600' };
    return { text: 'MINIMAL', color: 'text-blue-600' };
  };

  const truthStatus = getTruthStatus(truth);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-redacted-reveal">
      <Card className="max-w-4xl w-full max-h-[90vh] bg-newspaper-bg border-4 border-newspaper-text overflow-hidden animate-card-deal" 
            style={{ 
              fontFamily: 'serif',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
            }}>
        
        {/* Close button */}
        <Button 
          onClick={onClose}
          variant="outline" 
          className="absolute top-4 right-4 z-10 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Newspaper Header */}
        <div className="border-b-4 border-newspaper-text p-6 bg-newspaper-text/5">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-newspaper-text mb-2 font-serif tracking-wider">
              {masthead}
            </h1>
            <div className="flex justify-between items-center text-sm text-newspaper-text/80">
              <span className="font-mono">ROUND {round} EDITION</span>
              <span>{getCurrentDate()}</span>
              <span className="font-mono">CLASSIFIED DISTRIBUTION</span>
            </div>
            
            {/* Truth Alert Level */}
            <div className="mt-4 p-2 border-2 border-newspaper-text/30 bg-newspaper-text/10">
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs">TRUTH ALERT LEVEL:</span>
                <Badge variant="outline" className={`font-mono ${truthStatus.color} border-current`}>
                  {truthStatus.text} ({Math.round(truth)}%)
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Main Story */}
            <div className="md:col-span-2 space-y-6">
              <article className="border-b-2 border-newspaper-text/20 pb-4">
                <h2 className="text-2xl font-bold text-newspaper-text mb-3 leading-tight">
                  {mainEvent}
                </h2>
                <div className="text-sm text-newspaper-text/80 space-y-2 leading-relaxed">
                  <p>
                    In a shocking turn of events that definitely surprised nobody who was paying attention, 
                    local authorities continue to maintain that everything is completely normal and there 
                    is absolutely nothing to see here.
                  </p>
                  <p>
                    "Move along, citizen," said a definitely-not-suspicious individual in a black suit 
                    when asked for comment. The individual then vanished in a puff of smoke, which 
                    officials explained was "totally normal weather balloon residue."
                  </p>
                  <p>
                    Current influence levels remain {faction === 'government' ? 'appropriately managed' : 'concerningly elevated'} 
                    at {ip} points, while truth awareness sits at what experts describe as 
                    "{truth > 70 ? 'dangerously high' : truth > 30 ? 'manageable' : 'optimally suppressed'}" levels.
                  </p>
                </div>
              </article>

              {/* Secondary Headlines */}
              <div className="space-y-4">
                {headlines.map((headline, index) => (
                  <article key={index} className="border-b border-newspaper-text/10 pb-3">
                    <h3 className="text-lg font-bold text-newspaper-text mb-2">
                      {headline}
                    </h3>
                    <p className="text-sm text-newspaper-text/70">
                      Details remain classified, but sources confirm it definitely involved 
                      {index % 2 === 0 ? ' suspicious activity' : ' perfectly normal occurrences'} 
                      in the {index % 3 === 0 ? 'eastern' : index % 3 === 1 ? 'western' : 'central'} region.
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Weather/Conspiracy Forecast */}
              <Card className="p-4 bg-newspaper-text/5 border border-newspaper-text/20">
                <h4 className="font-bold text-newspaper-text mb-3 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  CONSPIRACY FORECAST
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Chemtrail Activity:</span>
                    <span className="font-mono">{Math.floor(Math.random() * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bigfoot Sightings:</span>
                    <span className="font-mono">{Math.floor(Math.random() * 20)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UFO Traffic:</span>
                    <span className="font-mono">{truth > 50 ? 'HEAVY' : 'LIGHT'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mind Control Rays:</span>
                    <span className="font-mono">{faction === 'government' ? 'ACTIVE' : 'DETECTED'}</span>
                  </div>
                </div>
              </Card>

              {/* Fake Advertisements */}
              <div className="space-y-4">
                {fakeAds.map((ad, index) => (
                  <Card key={index} className="p-4 bg-newspaper-text/10 border-2 border-newspaper-text/30 border-dashed">
                    <div className="text-center">
                      <p className="font-bold text-newspaper-text text-sm mb-1">
                        ADVERTISEMENT
                      </p>
                      <p className="text-xs text-newspaper-text/80 font-mono leading-relaxed">
                        {ad}
                      </p>
                      <p className="text-xs text-newspaper-text/60 mt-2">
                        *Results not guaranteed by any known reality
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Market Report */}
              <Card className="p-4 bg-newspaper-text/5 border border-newspaper-text/20">
                <h4 className="font-bold text-newspaper-text mb-3 font-mono flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  CONSPIRACY MARKETS
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>Tinfoil Futures:</span>
                    <span className="text-green-600">↑ +42.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Truth Serum:</span>
                    <span className={truth > 50 ? 'text-red-600' : 'text-green-600'}>
                      {truth > 50 ? '↓ -15.3%' : '↑ +8.7%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alien Tech:</span>
                    <span className="text-blue-600">→ STABLE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Government Denial:</span>
                    <span className="text-green-600">↑ +99.9%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-newspaper-text p-4 bg-newspaper-text/10">
          <div className="flex justify-between items-center text-xs font-mono text-newspaper-text/60">
            <div>
              Printed on recycled surveillance documents • All rights reserved (by them)
            </div>
            <div>
              This newspaper may contain traces of truth • Handle with care
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedNewspaper;