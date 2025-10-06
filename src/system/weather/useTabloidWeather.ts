import { useEffect, useState } from 'react';
import { fetchRealWeather } from './fetchRealWeather';
import { humorize } from './tabloidWeather';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

type WeatherStatus = 'idle' | 'loading' | 'ready' | 'error';

interface WeatherCacheEntry {
  timestamp: number;
  line: string;
}

const FALLBACK_LINE = 'Today: Suspicious Fog. Tomorrow: Chemtrail Showers.';
const STORAGE_KEY = 'pt-weather-cache-v1';
const TTL_MS = 30 * 60 * 1000; // 30 minutes

function loadCachedLine(): WeatherCacheEntry | null {
  const cached = safeGetLocalStorageItem(STORAGE_KEY);
  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached) as WeatherCacheEntry;
    if (typeof parsed?.line === 'string' && typeof parsed?.timestamp === 'number') {
      return parsed;
    }
  } catch (error) {
    console.warn('[weather] Failed to parse cached entry', error);
  }
  return null;
}

function saveCachedLine(line: string) {
  const entry: WeatherCacheEntry = { line, timestamp: Date.now() };
  safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(entry));
}

export function useTabloidWeather() {
  const [weatherLine, setWeatherLine] = useState<string>(FALLBACK_LINE);
  const [status, setStatus] = useState<WeatherStatus>('idle');

  useEffect(() => {
    let cancelled = false;
    const cached = loadCachedLine();

    if (cached) {
      setWeatherLine(cached.line);
      setStatus('ready');
      if (Date.now() - cached.timestamp < TTL_MS) {
        return () => {
          cancelled = true;
        };
      }
    }

    setStatus('loading');

    (async () => {
      try {
        const weather = await fetchRealWeather();
        if (cancelled) {
          return;
        }
        if (!weather) {
          setStatus(prev => (prev === 'ready' ? 'ready' : 'error'));
          return;
        }
        const line = humorize(weather);
        setWeatherLine(line);
        saveCachedLine(line);
        setStatus('ready');
      } catch (error) {
        if (!cancelled) {
          console.warn('[weather] Failed to load real weather', error);
          setStatus(prev => (prev === 'ready' ? 'ready' : 'error'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { weatherLine, status };
}

export function getFallbackTabloidWeather() {
  return FALLBACK_LINE;
}
