interface StuntBadgeProps {
  hotspot?: string | null;
  pressure?: number | null;
}

export const StuntBadge = ({ hotspot, pressure }: StuntBadgeProps) => {
  if (!hotspot && !pressure) {
    return null;
  }

  const label = hotspot ? hotspot : 'Regional Stunt';
  const pressureLabel = typeof pressure === 'number' && pressure !== 0 ? `${pressure > 0 ? '+' : ''}${pressure} Pressure` : null;

  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-black/30 bg-amber-100/70 px-3 py-1 text-[11px] font-mono uppercase text-black/70">
      <span role="img" aria-hidden="true">🎪</span>
      <span>{label}</span>
      {pressureLabel && <span className="rounded bg-black/10 px-2 py-0.5 text-[10px]">{pressureLabel}</span>}
    </div>
  );
};

export default StuntBadge;
