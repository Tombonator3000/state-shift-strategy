import React from "react";

type Size = "modal" | "boardMini" | "handMini";
type Props = { children: React.ReactNode; size?: Size };

export default function CardFrame({ children, size = "modal" }: Props) {
  // FINJUSTÉR SKALA HER:
  // - boardMini: senket til 0.56 for å unngå scroll i "Cards in Play"
  // - handMini: beholdt 0.78 (god lesbarhet i Your Hand)
  const scale = size === "modal" ? 1 : size === "boardMini" ? 0.56 : 0.78;

  // Basemål MÅ matche fullkortets outer size (inkl. border)
  const BASE_W = 320;
  const BASE_H = 460;

  const cellStyle: React.CSSProperties = {
    width: `calc(${BASE_W}px * ${scale})`,
    height: `calc(${BASE_H}px * ${scale})`,
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
