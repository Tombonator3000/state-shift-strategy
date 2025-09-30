const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

async function subtleDigest(message: string): Promise<string> {
  if (typeof crypto === 'undefined' || !('subtle' in crypto) || !textEncoder) {
    throw new Error('Subtle crypto not available');
  }

  const data = textEncoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function fallbackHash(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i += 1) {
    hash = (hash << 5) - hash + message.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export async function hash(message: string): Promise<string> {
  try {
    return await subtleDigest(message);
  } catch {
    return fallbackHash(message);
  }
}

export function hashSync(message: string): string {
  try {
    const cryptoObj = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
    if (cryptoObj && 'subtle' in cryptoObj && textEncoder) {
      throw new Error('use async hash');
    }
  } catch {
    // ignore
  }

  return fallbackHash(message);
}
