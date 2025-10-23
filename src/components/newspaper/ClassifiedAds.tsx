import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const AD_TEMPLATES = [
  {
    title: "TINFOIL HAT SALE!",
    lines: ["Premium thought-blocking tech", "Buy 2, Get 3rd FREE!", "Call 1-800-BLOCK-IT"],
  },
  {
    title: "CRYSTAL WI-FI CHAKRAS",
    lines: ["Align internet with universe", "5G blocking guaranteed", "SpiritualRouter.net"],
  },
  {
    title: "UNDERGROUND BUNKERS",
    lines: ["Premium apocalypse real estate", "Wi-Fi 6 feet under", "No questions asked"],
  },
  {
    title: "PSYCHIC HOTLINE",
    lines: ["We already know why you're calling", "First reading FREE*", "*Terms redacted"],
  },
  {
    title: "USED SURVEILLANCE VANS",
    lines: ["Definitely NOT government issue", "Great condition, one owner", "Cash only, midnight delivery"],
  },
  {
    title: "ALIEN ABDUCTION INSURANCE",
    lines: ["Protect your family today!", "Covers probing, experiments", "1-800-NOT-ALONE"],
  },
  {
    title: "BIGFOOT TRACKING TOURS",
    lines: ["Guaranteed sighting or refund*", "*Refund in conspiracy theories", "BringYourOwnJerky.com"],
  },
  {
    title: "CHEMTRAIL FILTERS",
    lines: ["Protect your property now!", "Easy installation included", "Pumpkin spice available"],
  },
  {
    title: "LIZARD PERSON DETECTOR",
    lines: ["Know who to trust!", "Pocket-sized, discreet", "Batteries NOT included"],
  },
  {
    title: "HAUNTED ITEMS 4 SALE",
    lines: ["Guaranteed authentic ghosts", "Previous owner disappeared", "ParanormalPawnShop.biz"],
  },
  {
    title: "AREA 51 TOURS",
    lines: ["Drive-thru alien encounters!", "Gift shop with real artifacts*", "*Probably real"],
  },
  {
    title: "CONSPIRACY THEORY U",
    lines: ["Accredited by ourselves", "Financial aid available", "Become a certified truther!"],
  },
];

const PERSONAL_ADS = [
  "SWM seeks SWF who believes in Bigfoot. Must love camping. No skeptics.",
  "Alien abductee seeking same for support group. Must have proof.",
  "Elvis impersonator seeks Bitcoin enthusiast. Let's start a commune.",
  "Flat Earther ISO like-minded partner. Must hate globes.",
  "Time traveler from 2087 seeks investment opportunities. Serious inquiries only.",
  "Cryptid hunter seeks funding. Have seen all 7. Well, 6.5.",
];

interface ClassifiedAdsProps {
  count?: number;
  includePersonals?: boolean;
  className?: string;
}

export const ClassifiedAds = ({ count = 6, includePersonals = true, className }: ClassifiedAdsProps) => {
  const selectedAds = useMemo(() => {
    const shuffled = [...AD_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [count]);

  const selectedPersonals = useMemo(() => {
    if (!includePersonals) return [];
    const shuffled = [...PERSONAL_ADS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [includePersonals]);

  return (
    <div className={cn("border-4 border-foreground bg-background/50 p-4", className)}>
      <h3
        className="text-2xl font-black text-center mb-4 border-b-2 border-foreground pb-2"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        CLASSIFIED ADS
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {selectedAds.map((ad, i) => (
          <div
            key={i}
            className="border border-foreground/40 p-3 bg-background hover:bg-accent/10 transition-colors"
          >
            <h4 className="font-black text-sm mb-1 uppercase">{ad.title}</h4>
            {ad.lines.map((line, j) => (
              <p key={j} className="text-xs leading-tight mb-0.5">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      {includePersonals && selectedPersonals.length > 0 && (
        <div className="border-t-2 border-foreground pt-3">
          <h4 className="font-black text-sm mb-2 uppercase">Personal Ads</h4>
          {selectedPersonals.map((ad, i) => (
            <p key={i} className="text-xs italic mb-1 text-muted-foreground">
              • {ad}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
