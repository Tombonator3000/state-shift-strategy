import React from "react";

type Size = "modal" | "boardMini" | "handMini" | "deskMini";
type Props = { children: React.ReactNode; size?: Size };

const SCALE_MAP: Record<Size, number> = {
  modal: 1,
  boardMini: 0.45,
  handMini: 0.78,
  deskMini: 0.55, // Compact scale for Newsroom Desk - fits more cards without scrolling
};

export default function CardFrame({ children, size = "modal" }: Props) {
  const scale = SCALE_MAP[size];

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
