import React from "react";

type Size = "modal" | "boardMini" | "handMini";
type Props = {
  children: React.ReactNode;
  size?: Size;
  scaleOverride?: number;
};

export default function CardFrame({ children, size = "modal", scaleOverride }: Props) {
  // FINJUSTÉR SKALA HER:
  // - boardMini: senket til 0.45 for å passe gridbredden i "Cards in Play"
  // - handMini: beholdt 0.78 (god lesbarhet i Your Hand)
  const defaultScale = size === "modal" ? 1 : size === "boardMini" ? 0.45 : 0.78;
  const scale = typeof scaleOverride === "number" ? scaleOverride : defaultScale;

  // Basemål MÅ matche fullkortets outer size (inkl. border)
  const BASE_W = 320;
  const BASE_H = 460;

  const cellStyle: React.CSSProperties = {
    width: BASE_W * scale,
    height: BASE_H * scale,
    position: "relative",
    flex: "0 0 auto",
    overflow: "hidden",
  };

  const innerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    willChange: "transform",
    backfaceVisibility: "hidden",
  };

  return (
    <div className="card-cell" style={cellStyle} aria-label={`card-${size}`}>
      <div className="card-inner" style={innerStyle}>
        <div className="card-shell">{children}</div>
      </div>
    </div>
  );
}
