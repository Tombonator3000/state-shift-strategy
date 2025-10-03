import { useEffect, useState } from 'react';
import { fetchRealWeather } from '@/system/weather/fetchRealWeather';
import { humorize } from '@/system/weather/tabloidWeather';

function getUseRealWeatherSetting(): boolean {
  if (typeof window === 'undefined') return false;
  const s = localStorage.getItem('useRealWeather');
  return s ? s === 'true' : false;
}

export function WeatherBadge() {
  const [text, setText] = useState('Today: Suspicious Fog. Tomorrow: Chemtrail Showers.');

  useEffect(() => {
    const useReal = getUseRealWeatherSetting();
    if (!useReal) return;

    (async () => {
      const w = await fetchRealWeather();
      if (!w) return;
      setText(humorize(w));
    })();
  }, []);

  return (
    <div className="pt-weather-badge ad-card" role="status" aria-live="polite">
      <strong>WEATHER:</strong> {text}
    </div>
  );
}
