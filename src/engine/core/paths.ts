export const CORE_BASE_URL = '/core/';
export const CORE_BUNDLED = {
  manifest: () => import('../../public/core/manifest.json').then(m => m.default).catch(() => null),
  library: () => import('../../public/core/core-library.json').then(m => m.default).catch(() => null),
  decklist: () => import('../../public/core/core-decklist-latest.json').then(m => m.default).catch(() => null),
};

export const coreFeatures = {
  useBundledFirst: true,
  allowHttpFetch: true,
};

