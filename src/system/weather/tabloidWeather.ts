import type { RealWeather } from './fetchRealWeather';

const codeMap: Record<string, string[]> = {
  clear: ['Skies suspiciously clear', 'Stars blinking in Morse (probably)'],
  clouds: ['Untrustworthy cloud cover', 'Government-issued overcast'],
  rain: ['Chemtrail showers', 'Liquid disclosure from sky'],
  snow: ['Classified snow protocol', 'Frozen truth flakes'],
  fog: ['Suspicious fog', 'Reality distortion haze'],
  storm: ['Truthquake with lightning', 'Angry sky committee meeting'],
};

function funnyTemp(t: number) {
  if (t <= -5) return 'So cold even lizard people wear sweaters';
  if (t <= 5) return 'Chilly enough to preserve alien samples';
  if (t <= 15) return 'Cozy for late-night skywatch';
  if (t <= 25) return 'Perfect chemtrail-evaporation weather';
  return 'Heatwave melts redactions';
}
function mapCodeToMood(code: number) {
  if ([0, 1].includes(code)) return codeMap.clear;
  if ([2, 3].includes(code)) return codeMap.clouds;
  if ([45, 48].includes(code)) return codeMap.fog;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return codeMap.rain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return codeMap.snow;
  if ([95, 96, 99].includes(code)) return codeMap.storm;
  return codeMap.clouds;
}

export function humorize(weather: RealWeather) {
  const mood = mapCodeToMood(weather.code);
  const line = mood[Math.floor(Math.random() * mood.length)];
  const tempLine = funnyTemp(weather.tempC);
  const wind = weather.windKmh > 40
    ? 'Winds strong enough to blow off tinfoil hats'
    : weather.windKmh > 20
    ? 'Breezy—secure your documents'
    : 'Calm… too calm';
  return `${line}. ${tempLine}. ${wind}.`;
}
