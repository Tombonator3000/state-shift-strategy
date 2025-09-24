import type { GameCard, FrontPageSlot, MVPCardType } from '@/rules/mvp';

const DEFAULT_SLOT_BY_TYPE: Record<MVPCardType, FrontPageSlot> = {
  MEDIA: 'top-banner',
  ZONE: 'main-photo',
  ATTACK: 'sidebar',
};

const FRONT_PAGE_SLOT_ALIASES: Record<string, FrontPageSlot> = {
  banner: 'top-banner',
  headline: 'top-banner',
  masthead: 'top-banner',
  photo: 'main-photo',
  center: 'main-photo',
  feature: 'main-photo',
  sidebar: 'sidebar',
  bulletin: 'sidebar',
};

export const FRONT_PAGE_SLOT_META: Record<FrontPageSlot, {
  label: string;
  caption: string;
  icon: string;
  toneClass: string;
}> = {
  'top-banner': {
    label: 'Top Banner',
    caption: 'Media exclusives scream across the masthead.',
    icon: '📰',
    toneClass: 'from-amber-100 via-yellow-50 to-amber-200',
  },
  'main-photo': {
    label: 'Main Photo',
    caption: 'Zone stunts splatter ink across the centerfold.',
    icon: '📸',
    toneClass: 'from-sky-200 via-indigo-100 to-sky-300',
  },
  sidebar: {
    label: 'Sidebar',
    caption: 'Attack memos whisper in the margins.',
    icon: '📋',
    toneClass: 'from-rose-100 via-pink-50 to-rose-200',
  },
};

const normalizeSlotText = (slot?: string | null): FrontPageSlot | null => {
  if (!slot) {
    return null;
  }

  const normalized = slot.trim().toLowerCase();
  if (!normalized.length) {
    return null;
  }

  if ((['top-banner', 'main-photo', 'sidebar'] as const).includes(normalized as FrontPageSlot)) {
    return normalized as FrontPageSlot;
  }

  const alias = FRONT_PAGE_SLOT_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  const slug = normalized.replace(/[^a-z]+/g, '-').replace(/^-+|-+$/g, '');
  if ((['top-banner', 'main-photo', 'sidebar'] as const).includes(slug as FrontPageSlot)) {
    return slug as FrontPageSlot;
  }

  return null;
};

export function resolveFrontPageSlot(card: Pick<GameCard, 'type' | 'frontPageSlot'>): FrontPageSlot {
  const explicit = normalizeSlotText(card.frontPageSlot ?? null);
  if (explicit) {
    return explicit;
  }

  const type = (card.type ?? 'MEDIA').toString().toUpperCase() as MVPCardType;
  if (type in DEFAULT_SLOT_BY_TYPE) {
    return DEFAULT_SLOT_BY_TYPE[type];
  }

  return 'sidebar';
}

export function describeFrontPageSlot(slot: FrontPageSlot): string {
  return `${FRONT_PAGE_SLOT_META[slot].icon} ${FRONT_PAGE_SLOT_META[slot].label}`;
}

export function isFrontPageSlot(value: string): value is FrontPageSlot {
  return (['top-banner', 'main-photo', 'sidebar'] as const).includes(value as FrontPageSlot);
}
