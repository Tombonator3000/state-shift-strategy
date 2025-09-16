// MVP Core Cards - Migrated from existing database
// All DEFENSIVE cards converted to MEDIA, effects cleaned to MVP standards

import type { MVPCard } from '@/types/mvp-types';

// Import migrated cards directly
import migratedCards from './migrate-and-replace';

export const MVP_CORE_CARDS: MVPCard[] = migratedCards;

export default MVP_CORE_CARDS;