import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ComicPanel {
  character: string;
  dialogue: string;
  emotion?: 'happy' | 'shocked' | 'confused' | 'angry' | 'conspiratorial';
}

const COMIC_STRIPS = [
  {
    title: "Conspiracy Carl & Skeptical Steve",
    panels: [
      { character: "Carl", dialogue: "Steve! The moon landing was FAKE!", emotion: "shocked" as const },
      { character: "Steve", dialogue: "Carl, we've been over this...", emotion: "confused" as const },
      { character: "Carl", dialogue: "Then explain why the flag is waving!", emotion: "angry" as const },
      { character: "Steve", dialogue: "...There's no wind in the vacuum chamber either, Carl.", emotion: "happy" as const },
    ],
  },
  {
    title: "Agent Smith & His Toaster",
    panels: [
      { character: "Smith", dialogue: "Status report, Toaster-47?", emotion: "conspiratorial" as const },
      { character: "Toaster", dialogue: "*BEEP* All toast surveillance nominal.", emotion: "happy" as const },
      { character: "Smith", dialogue: "Excellent. No one suspects a thing.", emotion: "happy" as const },
      { character: "Neighbor", dialogue: "Why are you talking to your toaster?", emotion: "confused" as const },
    ],
  },
  {
    title: "Bigfoot's Day Off",
    panels: [
      { character: "Bigfoot", dialogue: "*Finally, a day without hikers*", emotion: "happy" as const },
      { character: "Bigfoot", dialogue: "*Time to relax and...*", emotion: "happy" as const },
      { character: "Tourist", dialogue: "BIGFOOT! I got you on camera!", emotion: "shocked" as const },
      { character: "Bigfoot", dialogue: "*Every. Single. Time.*", emotion: "angry" as const },
    ],
  },
];

const EMOTION_FACES = {
  happy: "^_^",
  shocked: "O_O",
  confused: "o_O",
  angry: ">_<",
  conspiratorial: "¬_¬",
};

export const ComicStrip = ({ className }: { className?: string }) => {
  const selectedComic = useMemo(() => {
    return COMIC_STRIPS[Math.floor(Math.random() * COMIC_STRIPS.length)];
  }, []);

  return (
    <div className={cn("border-4 border-foreground bg-background p-4", className)}>
      <h3
        className="text-xl font-black text-center mb-3 uppercase"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        {selectedComic.title}
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {selectedComic.panels.map((panel, i) => (
          <div
            key={i}
            className="border-2 border-foreground bg-background p-2 flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center mb-2">
              <div className="text-4xl">
                {EMOTION_FACES[panel.emotion || 'happy']}
              </div>
            </div>
            
            <div className="border-t-2 border-foreground pt-2">
              <p className="text-[10px] font-bold mb-1">{panel.character}:</p>
              <p className="text-[9px] leading-tight italic">{panel.dialogue}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[8px] text-center mt-2 text-muted-foreground italic">
        © Paranoid Times Syndicate • Any resemblance to real conspiracies is intentional
      </p>
    </div>
  );
};
