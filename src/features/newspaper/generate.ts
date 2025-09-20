import type { Card } from '@/types';
import { pick, shuffle, type NewspaperData } from '@/lib/newspaperData';

export type RoundContext = {
  truthDeltaTotal: number;
  capturedStates: string[];
  cardsPlayedByYou: Card[];
  cardsPlayedByOpp: Card[];
};

export function makeHeadline(card: Card, data: NewspaperData): string {
  const base = card.name.toUpperCase();
  const verbs =
    card.type === 'ATTACK' ? data.attackVerbs :
    card.type === 'MEDIA' ? data.mediaVerbs :
    data.zoneVerbs;
  const verb = pick(verbs ?? [], '');
  return verb ? `${base} ${verb}!` : `${base}!`;
}

export function makeSubhead(card: Card, data: NewspaperData): string {
  const pools =
    card.type === 'ATTACK' ? data.subheads?.attack :
    card.type === 'MEDIA' ? data.subheads?.media :
    data.subheads?.zone;
  const bank = [...(pools ?? []), ...(data.subheads?.generic ?? [])];
  return pick(bank, 'Officials refuse to comment.');
}

export function shouldStampBreaking(ctx: RoundContext): boolean {
  return Math.abs(ctx.truthDeltaTotal) >= 10 || ctx.capturedStates.length > 0;
}

export function makeBody(card: Card, data: NewspaperData): string {
  const para = {
    ATTACK: [
      "Leaked paperwork suggests widespread administrative turbulence. Witnesses describe {buzz}.",
      "Officials insist it's routine, yet {buzz}. Budgets tremble; shredders rejoice.",
    ],
    MEDIA: [
      'A glossy clip ricochets through every feed. Fence-sitters reconsider, pundits recalibrate.',
      'Analysts cite a shift in the narrative baseline. Fact-checkers request a nap.',
    ],
    ZONE: [
      'Canvassers flood precinct coffee machines as clipboards multiply. Pressure mounts on local officials.',
      'Volunteers swarm district offices; banners, boots and bullhorns pulse through the city core.',
    ],
  } as const;

  const buzz = pick(
    [
      "'nothing to see here' memos printed in triplicate",
      'a suspicious spike in silence',
      "coffee-stained notes marked 'urgent'",
    ],
  );

  const bank = para[card.type as keyof typeof para] ?? para.MEDIA;
  const primary = pick([...bank], para.MEDIA[0]).replace('{buzz}', buzz);

  const investigationLines = [
    'Sources courier manila envelopes labeled "DO NOT PHOTOCOPY" straight to our newsroom bunker.',
    'Cryptic voicemails repeat project codenames we are not cleared to print.',
    'Budget spreadsheets spontaneously redact entire columns whenever auditors blink.',
    'Night-shift custodians report conference rooms humming with unscheduled meetings.',
    'Analysts highlight synchronized badge-swipes hinting at something subterranean.',
  ];

  const extras = shuffle(investigationLines).slice(0, 2);
  return [primary, ...extras].join('\n\n');
}
