/**
 * Asset path helper for GitHub Pages compatibility
 *
 * Vite's import.meta.env.BASE_URL contains the base path:
 * - Lovable/local: '/'
 * - GitHub Pages: '/state-shift-strategy/'
 *
 * This function ensures all asset paths work correctly on both platforms.
 */

/**
 * Get the full asset path with correct base URL
 * @param path - Path relative to public folder (should start with /)
 * @returns Full path with base URL prefix
 *
 * @example
 * getAssetPath('/assets/start/start-gov.jpeg')
 * // Lovable: '/assets/start/start-gov.jpeg'
 * // GitHub Pages: '/state-shift-strategy/assets/start/start-gov.jpeg'
 */
export function getAssetPath(path: string, base = import.meta.env?.BASE_URL ?? '/'): string {
  // Remove leading slash to prevent double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // import.meta.env.BASE_URL already has trailing slash
  return `${base.endsWith('/') ? base : `${base}/`}${cleanPath}`;
}
