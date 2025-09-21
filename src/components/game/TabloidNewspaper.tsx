import type { TabloidNewspaperProps, TabloidPlayedCard } from './TabloidNewspaperLegacy';
import LegacyTabloidNewspaper from './TabloidNewspaperLegacy';
import TabloidNewspaperV2 from './TabloidNewspaperV2';
import { featureFlags } from '@/state/featureFlags';
import { isNewspaperBlocked } from './newspaperGate';

const TabloidNewspaper = (props: TabloidNewspaperProps) => {
  if (isNewspaperBlocked()) {
    return null;
  }

  if (featureFlags.newspaperV2) {
    return <TabloidNewspaperV2 {...props} />;
  }

  return <LegacyTabloidNewspaper {...props} />;
};

export default TabloidNewspaper;
export type { TabloidNewspaperProps, TabloidPlayedCard };
