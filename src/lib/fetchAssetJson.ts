import { getAssetPath } from './assets';

/** Bound the entire request, including a stalled response body. */
export async function fetchAssetJson(path: string, timeoutMs = 6000): Promise<unknown> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Loading ${path} timed out`));
      controller.abort();
    }, timeoutMs);
  });
  const request = (async () => {
    const response = await fetch(getAssetPath(path), {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Loading ${path} failed (${response.status})`);
    return response.json() as Promise<unknown>;
  })();

  try {
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
