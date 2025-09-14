export const CORE_BASE_URL = '/core/';

export const coreFeatures = {
  useBundledFirst: true, // ESM JSON import (no CORS)
  allowHttpFetch: true,  // fetch if bundled missing
};

// Safe dynamic imports (adjust paths to where JSON will be emitted)
export async function tryImport<T>(path: string): Promise<T | null> {
  try { const m = await import(/* @vite-ignore */ path); return (m as any).default ?? m; }
  catch { return null; }
}
