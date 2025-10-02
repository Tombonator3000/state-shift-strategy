import type { Hotspot } from '@/systems/paranormalHotspots';

type ToastEmitter = ((message: string) => void) | undefined;

const getToastEmitter = (): ToastEmitter => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return typeof window.uiComboToast === 'function' ? window.uiComboToast : undefined;
};

const formatStateLabel = (hotspot: Hotspot): string => {
  const raw = hotspot.stateName ?? hotspot.location ?? 'Unknown state';
  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : 'Unknown state';
};

const formatTitle = (hotspot: Hotspot): string => {
  const raw = hotspot.name ?? 'Paranormal Hotspot';
  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : 'Paranormal Hotspot';
};

const normalizeIntensity = (value: number | undefined): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return Math.max(1, Math.round(Math.abs(value)));
};

const formatTruthDelta = (value: number | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }
  const rounded = Math.round(value);
  const sign = rounded > 0 ? '+' : '';
  return ` (${sign}${rounded}% Truth)`;
};

const queueToast = (message: string): void => {
  const emit = getToastEmitter();
  if (!emit) {
    return;
  }
  emit(message);
};

export function queueHotspotSpawnToast(hotspot: Hotspot): void {
  const title = formatTitle(hotspot);
  const stateLabel = formatStateLabel(hotspot);
  const intensity = normalizeIntensity(hotspot.intensity);
  const intensityLabel = intensity ? ` (Intensity ${intensity})` : '';
  queueToast(`🛸 Hotspot detected: ${title} — ${stateLabel}${intensityLabel}`);
}

export function queueHotspotResolveToast(hotspot: Hotspot): void {
  const title = formatTitle(hotspot);
  const stateLabel = formatStateLabel(hotspot);
  const truthLabel = formatTruthDelta(hotspot.truthDelta);
  queueToast(`✅ Hotspot neutralized: ${title} — ${stateLabel}${truthLabel}`);
}

export function queueHotspotExpireToast(hotspot: Hotspot): void {
  const title = formatTitle(hotspot);
  const stateLabel = formatStateLabel(hotspot);
  const truthLabel = formatTruthDelta(hotspot.truthDelta);
  queueToast(`☁️ Hotspot dispersed: ${title} — ${stateLabel}${truthLabel}`);
}
