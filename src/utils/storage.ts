export interface SafeStorageOptions {
  logger?: Pick<Console, 'warn'>;
}

const resolveLogger = (options?: SafeStorageOptions): Pick<Console, 'warn'> | null => {
  if (options?.logger && typeof options.logger.warn === 'function') {
    return options.logger;
  }

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    return console;
  }

  return null;
};

const safeGetStorageItem = (
  kind: 'localStorage' | 'sessionStorage',
  key: string,
  options?: SafeStorageOptions,
): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = window[kind];
    if (!storage || typeof storage.getItem !== 'function') {
      return null;
    }

    return storage.getItem(key);
  } catch (error) {
    const logger = resolveLogger(options);
    logger?.warn?.(`[storage] Failed to read "${key}" from ${kind}`, error);
    return null;
  }
};

const safeSetStorageItem = (
  kind: 'localStorage' | 'sessionStorage',
  key: string,
  value: string,
  options?: SafeStorageOptions,
): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const storage = window[kind];
    if (!storage || typeof storage.setItem !== 'function') {
      return false;
    }

    storage.setItem(key, value);
    return true;
  } catch (error) {
    const logger = resolveLogger(options);
    logger?.warn?.(`[storage] Failed to write "${key}" to ${kind}`, error);
    return false;
  }
};

export const safeGetLocalStorageItem = (key: string, options?: SafeStorageOptions): string | null =>
  safeGetStorageItem('localStorage', key, options);

export const safeSetLocalStorageItem = (key: string, value: string, options?: SafeStorageOptions): boolean =>
  safeSetStorageItem('localStorage', key, value, options);

export const safeGetSessionStorageItem = (key: string, options?: SafeStorageOptions): string | null =>
  safeGetStorageItem('sessionStorage', key, options);

export const safeSetSessionStorageItem = (key: string, value: string, options?: SafeStorageOptions): boolean =>
  safeSetStorageItem('sessionStorage', key, value, options);

export const safeRemoveLocalStorageItem = (
  key: string,
  options?: SafeStorageOptions,
): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const storage = window.localStorage;
    if (!storage || typeof storage.removeItem !== 'function') {
      return false;
    }

    storage.removeItem(key);
    return true;
  } catch (error) {
    const logger = resolveLogger(options);
    logger?.warn?.(`[storage] Failed to remove "${key}" from localStorage`, error);
    return false;
  }
};
