import { useState, useEffect } from 'react';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

export type UiTheme = 'tabloid_bw' | 'government_classic';

export const useUiTheme = () => {
  const [theme, setTheme] = useState<UiTheme>(() => {
    const saved = safeGetLocalStorageItem('sg_ui_theme');

    const isUiTheme = (value: unknown): value is UiTheme =>
      value === 'tabloid_bw' || value === 'government_classic';

    if (saved && isUiTheme(saved)) {
      return saved;
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isUiTheme(parsed)) {
          return parsed;
        }
      } catch {
        // ignore parse failures and fall through to default
      }
    }

    return 'tabloid_bw';
  });

  const updateTheme = (newTheme: UiTheme) => {
    setTheme(newTheme);
    safeSetLocalStorageItem('sg_ui_theme', newTheme);
  };

  return [theme, updateTheme] as const;
};