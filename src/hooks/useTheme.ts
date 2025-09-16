import { useState, useEffect } from 'react';

export type UiTheme = 'tabloid_bw' | 'government_classic';

export const useUiTheme = () => {
  const [theme, setTheme] = useState<UiTheme>(() => {
    const saved = localStorage.getItem('sg_ui_theme');
    return (saved as UiTheme) || 'tabloid_bw';
  });

  const updateTheme = (newTheme: UiTheme) => {
    setTheme(newTheme);
    localStorage.setItem('sg_ui_theme', newTheme);
  };

  return [theme, updateTheme] as const;
};