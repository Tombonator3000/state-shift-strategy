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

export const safeGetLocalStorageItem = (
  key: string,
  options?: SafeStorageOptions,
): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== 'function') {
      return null;
    }

    return storage.getItem(key);
  } catch (error) {
    const logger = resolveLogger(options);
    logger?.warn?.(`[storage] Failed to read "${key}" from localStorage`, error);
    return null;
  }
};

export const safeSetLocalStorageItem = (
  key: string,
  value: string,
  options?: SafeStorageOptions,
): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const storage = window.localStorage;
    if (!storage || typeof storage.setItem !== 'function') {
      return false;
    }

    storage.setItem(key, value);
    return true;
  } catch (error) {
    const logger = resolveLogger(options);
    logger?.warn?.(`[storage] Failed to write "${key}" to localStorage`, error);
    return false;
  }
};
