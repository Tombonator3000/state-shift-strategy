import hotspotsCatalog from '@/data/hotspots.catalog.json';
import hotspotsConfig from '@/data/hotspots.config.json';
import cryptidHomeStates from '@/data/cryptids.homestate.json';

export type HotspotKind =
  | 'anomaly'
  | 'disturbance'
  | 'manifestation'
  | 'phenomenon'
  | 'encounter';

export interface Hotspot {
  id: string;
  name: string;
  kind: HotspotKind;
  location: string;
  intensity: number;
  status: 'spawning' | 'active' | 'resolved' | 'expired';
  tags: string[];
}

type HotspotCatalog = typeof hotspotsCatalog;
type HotspotConfig = typeof hotspotsConfig;
type CryptidHomeState = typeof cryptidHomeStates;

export class HotspotDirector {
  private readonly catalog: HotspotCatalog;

  private readonly config: HotspotConfig;

  private readonly cryptids: CryptidHomeState;

  constructor(
    catalog: HotspotCatalog = hotspotsCatalog,
    config: HotspotConfig = hotspotsConfig,
    cryptids: CryptidHomeState = cryptidHomeStates,
  ) {
    this.catalog = catalog;
    this.config = config;
    this.cryptids = cryptids;
  }

  initialize(): void {
    // TODO: Hydrate working sets, indexes, and orchestration timers.
  }

  getCatalog(): HotspotCatalog {
    return this.catalog;
  }

  getConfig(): HotspotConfig {
    return this.config;
  }

  getCryptids(): CryptidHomeState {
    return this.cryptids;
  }
}
