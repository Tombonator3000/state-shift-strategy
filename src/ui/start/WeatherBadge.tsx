import { useTabloidWeather } from '@/system/weather/useTabloidWeather';

export function WeatherBadge() {
  const { weatherLine } = useTabloidWeather();

  return (
    <div className="pt-weather-badge ad-card" role="status" aria-live="polite">
      <strong>WEATHER:</strong> {weatherLine}
    </div>
  );
}
