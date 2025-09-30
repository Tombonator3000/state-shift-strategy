import type { AssetProvider } from '../types';

interface WikimediaImageInfo {
  url: string;
  descriptionurl: string;
  extmetadata?: Record<string, { value?: string }>;
}

interface WikimediaPage {
  title: string;
  imageinfo?: WikimediaImageInfo[];
}

const API_BASE = 'https://commons.wikimedia.org/w/api.php';

const ALLOWED_LICENSES = ['public domain', 'cc0', 'cc-by', 'cc-by-sa', 'cc-by-4.0', 'cc-by-sa-4.0'];

function extractLicense(info?: WikimediaImageInfo): string | undefined {
  const license = info?.extmetadata?.LicenseShortName?.value ?? info?.extmetadata?.License?.value;
  if (!license) return undefined;
  return license.replace(/<[^>]+>/g, '').trim();
}

function extractCredit(info?: WikimediaImageInfo): string | undefined {
  const artist = info?.extmetadata?.Artist?.value;
  if (!artist) return undefined;
  const sanitized = artist.replace(/<[^>]+>/g, '').trim();
  return sanitized || undefined;
}

function buildSearchTerm(terms: string[], includeTags: string[]): string {
  const base = terms.join(' ');
  if (includeTags.length === 0) {
    return base;
  }
  return `${base} ${includeTags.map(tag => `"${tag}"`).join(' ')}`;
}

async function fetchWikimedia(query: string, limit = 6): Promise<WikimediaPage[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrlimit: `${limit}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1024',
    format: 'json',
    origin: '*',
    gsrsearch: query,
  });

  const response = await fetch(`${API_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Wikimedia request failed with ${response.status}`);
  }

  const json = await response.json();
  const pages = json?.query?.pages;
  if (!pages) {
    return [];
  }

  return Object.values(pages) as WikimediaPage[];
}

export const WikimediaProvider: AssetProvider = {
  id: 'wikimedia',
  priority: 10,
  shouldSkip: () => false,
  async fetchAssets(queryPlan, _context) {
    try {
      const pages = await fetchWikimedia(buildSearchTerm(queryPlan.terms, queryPlan.includeTags));
      const candidates = pages
        .map(page => {
          const info = page.imageinfo?.[0];
          if (!info?.url) {
            return null;
          }
          const license = extractLicense(info);
          if (license) {
            const normalized = license.toLowerCase();
            const allowed = ALLOWED_LICENSES.some(allowedLicense => normalized.includes(allowedLicense));
            if (!allowed) {
              return null;
            }
          }

          return {
            id: page.title,
            url: info.url,
            provider: 'wikimedia',
            credit: extractCredit(info),
            license,
            metadata: {
              source: info.descriptionurl,
            },
          };
        })
        .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));

      return {
        candidates,
        licenseHint: 'cc',
      };
    } catch (error) {
      console.warn('[WikimediaProvider] Failed to fetch', error);
      return { candidates: [] };
    }
  },
};
