import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import { fetchAssetJson } from '@/lib/fetchAssetJson';
import { getAssetPath } from '@/lib/assets';

let fetchSpy: ReturnType<typeof spyOn> | undefined;
afterEach(() => { fetchSpy?.mockRestore(); fetchSpy = undefined; });

describe('public asset loading', () => {
  it('resolves extension paths for both site root and GitHub Pages', () => {
    expect(getAssetPath('/extensions/index.json', '/')).toBe('/extensions/index.json');
    expect(getAssetPath('/extensions/index.json', '/state-shift-strategy/')).toBe('/state-shift-strategy/extensions/index.json');
    expect(getAssetPath('extensions/index.json', '/state-shift-strategy')).toBe('/state-shift-strategy/extensions/index.json');
  });

  it('loads JSON without a cache-busting query that defeats offline precache', async () => {
    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ files: ['cryptids.json'] }));
    expect(await fetchAssetJson('/extensions/index.json')).toEqual({ files: ['cryptids.json'] });
    expect(fetchSpy.mock.calls[0][0]).toBe('/extensions/index.json');
    expect(fetchSpy.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it('rejects a missing asset instead of treating the 404 page as data', async () => {
    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('missing', { status: 404 }));
    await expect(fetchAssetJson('/extensions/missing.json')).rejects.toThrow('(404)');
  });

  it('times out and aborts a request that never responds', async () => {
    let signal: AbortSignal | null | undefined;
    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      signal = init?.signal;
      return new Promise<Response>(() => {});
    });
    await expect(fetchAssetJson('/extensions/index.json', 15)).rejects.toThrow('timed out');
    expect(signal?.aborted).toBe(true);
  });

  it('also bounds a response whose body never finishes', async () => {
    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(new ReadableStream()));
    await expect(fetchAssetJson('/extensions/index.json', 15)).rejects.toThrow('timed out');
  });
});
