import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const ZODIAC_SIGNS = [
  { name: "Aries", icon: "♈", dates: "Mar 21 - Apr 19" },
  { name: "Taurus", icon: "♉", dates: "Apr 20 - May 20" },
  { name: "Gemini", icon: "♊", dates: "May 21 - Jun 20" },
  { name: "Cancer", icon: "♋", dates: "Jun 21 - Jul 22" },
  { name: "Leo", icon: "♌", dates: "Jul 23 - Aug 22" },
  { name: "Virgo", icon: "♍", dates: "Aug 23 - Sep 22" },
  { name: "Libra", icon: "♎", dates: "Sep 23 - Oct 22" },
  { name: "Scorpio", icon: "♏", dates: "Oct 23 - Nov 21" },
  { name: "Sagittarius", icon: "♐", dates: "Nov 22 - Dec 21" },
  { name: "Capricorn", icon: "♑", dates: "Dec 22 - Jan 19" },
  { name: "Aquarius", icon: "♒", dates: "Jan 20 - Feb 18" },
  { name: "Pisces", icon: "♓", dates: "Feb 19 - Mar 20" },
];

const HOROSCOPE_TEMPLATES = [
  "The government is watching you more than usual today. Wear extra tinfoil.",
  "Mercury is in retrograde, but so is your credit card. Avoid alien encounters.",
  "A cryptid will cross your path. Do NOT offer it snacks.",
  "The stars say you should stockpile canned goods. Also, Bitcoin.",
  "Your lucky conspiracy theory will come true. But which one?",
  "Avoid black helicopters and men in dark suits. Trust your gut.",
  "The illuminati are NOT behind that weird noise in your basement. Probably.",
  "Today is a good day to question everything. Especially the weather.",
  "Your chakras are misaligned with 5G towers. Realign with crystals.",
  "A mysterious stranger will tell you the truth. They're lying.",
  "The moon is [REDACTED] today. Plan accordingly.",
  "Your spirit animal is a government surveillance drone. Embrace it.",
];

export const NewspaperHoroscope = ({ className }: { className?: string }) => {
  const horoscopes = useMemo(() => {
    const shuffled = [...HOROSCOPE_TEMPLATES].sort(() => Math.random() - 0.5);
    return ZODIAC_SIGNS.map((sign, i) => ({
      ...sign,
      reading: shuffled[i % shuffled.length],
    }));
  }, []);

  return (
    <div className={cn("border-4 border-foreground bg-background/50 p-4", className)}>
      <h3
        className="text-2xl font-black text-center mb-4 border-b-2 border-foreground pb-2"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        PARANOID HOROSCOPE
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {horoscopes.map((sign) => (
          <div
            key={sign.name}
            className="border border-foreground/40 p-2 hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{sign.icon}</span>
              <div>
                <p className="font-black text-sm uppercase">{sign.name}</p>
                <p className="text-[10px] text-muted-foreground">{sign.dates}</p>
              </div>
            </div>
            <p className="text-xs italic leading-tight">{sign.reading}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center mt-3 text-muted-foreground italic">
        Readings by Madame Conspiracy • Not responsible for any actual prophecies
      </p>
    </div>
  );
};
