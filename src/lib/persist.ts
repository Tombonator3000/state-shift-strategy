const STORAGE_KEY = 'expansion_prefs_v2';

type JsonValue = unknown;

export function loadPrefs<T extends JsonValue = Record<string, unknown>>(): T {
  if (typeof window === 'undefined') {
    return {} as T;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {} as T;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('[ExpansionPrefs] Failed to parse stored preferences', error);
    return {} as T;
  }
}

export function savePrefs(value: JsonValue): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn('[ExpansionPrefs] Failed to persist preferences', error);
  }
}
