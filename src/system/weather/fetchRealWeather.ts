export type RealWeather = { tempC: number; windKmh: number; code: number; precipMm: number };

export async function fetchRealWeather(): Promise<RealWeather | null> {
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, {
        enableHighAccuracy: true,
        timeout: 8000,
      })
    );
    const { latitude, longitude } = pos.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code,wind_speed_10m`;
    const r = await fetch(url);
    const j = await r.json();
    const c = j.current;
    return {
      tempC: c.temperature_2m,
      windKmh: c.wind_speed_10m,
      code: c.weather_code,
      precipMm: c.precipitation ?? 0,
    };
  } catch {
    return null;
  }
}
