import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const LETTER_TEMPLATES = [
  {
    from: "Concerned Citizen, Nevada",
    text: "Why won't the government explain the lights we see every night? My neighbor says it's 'planes' but we all know better. The truth is out there and we demand answers!",
  },
  {
    from: "Anonymous Whistleblower",
    text: "I worked at [REDACTED] for 15 years. What I saw would make your blood run cold. They're watching us, tracking our every move. Wake up, people!",
  },
  {
    from: "Bigfoot Enthusiast, Oregon",
    text: "To the 'expert' in last week's issue who claimed Bigfoot doesn't exist: I have SEEN him. Three times. He waved. Explain that, science!",
  },
  {
    from: "Pastor Rex's Congregation",
    text: "Pastor Rex has successfully blessed 47 cell phone towers this month, protecting our community from harmful signals. Praise be to the tinfoil!",
  },
  {
    from: "Flat Earth Society Member",
    text: "Your recent article showed a 'globe' in the background. Disappointed in your propaganda. Unsubscribing and taking my conspiracy theories elsewhere.",
  },
  {
    from: "Area 51 Tour Guide",
    text: "The aliens DO exist and they're surprisingly good at poker. Yes, this sounds crazy. Because it IS crazy. But also true. Drive-thru tours available Saturdays.",
  },
  {
    from: "Crystal Healer, California",
    text: "Finally, a newspaper that tells the truth! My crystals have been vibrating at higher frequencies since your last issue. Keep up the good work!",
  },
  {
    from: "Elvis Impersonator",
    text: "The King lives, and he shops at my local grocery store. I've been trying to get an interview but he keeps saying 'thank you very much' and vanishing.",
  },
  {
    from: "Chemtrail Activist",
    text: "The skies were CLEAR before 1998. Now look at them! Lines everywhere! They're turning the frogs gay AND the clouds suspicious!",
  },
  {
    from: "Lizard Person Detector Owner",
    text: "Your newspaper's CEO tested positive on my detector. Just saying. Might want to look into that. Also, might be a false positive. Batteries are old.",
  },
];

interface LettersToEditorProps {
  count?: number;
  className?: string;
}

export const LettersToEditor = ({ count = 4, className }: LettersToEditorProps) => {
  const selectedLetters = useMemo(() => {
    const shuffled = [...LETTER_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [count]);

  return (
    <div className={cn("border-4 border-foreground bg-background/50 p-4", className)}>
      <h3
        className="text-2xl font-black text-center mb-4 border-b-2 border-foreground pb-2"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        LETTERS TO THE EDITOR
      </h3>

      <div className="space-y-3">
        {selectedLetters.map((letter, i) => (
          <div
            key={i}
            className="border-l-4 border-primary pl-3 py-2 hover:bg-accent/10 transition-colors"
          >
            <p className="text-sm leading-relaxed mb-2 italic">"{letter.text}"</p>
            <p className="text-xs font-bold text-muted-foreground">
              — {letter.from}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-foreground/40">
        <p className="text-xs italic text-center text-muted-foreground">
          Submit your conspiracy theories to editor@paranoidtimes.truth
        </p>
      </div>
    </div>
  );
};
