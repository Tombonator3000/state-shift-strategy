import React from "react";
import { cn } from "@/lib/utils";

export type CardFrameSize = "modal" | "boardMini" | "handMini";

type CardFrameProps = {
  children: React.ReactNode;
  size?: CardFrameSize;
  className?: string;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
  overlay?: React.ReactNode;
  cardProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style">;
};

const SIZE_TO_SCALE: Record<CardFrameSize, number> = {
  modal: 1,
  boardMini: 0.6,
  handMini: 0.78,
};

const BASE_W = 320;
const BASE_H = 450;

export function CardFrame({
  children,
  size = "modal",
  className,
  cardClassName,
  cardStyle,
  overlay,
  cardProps,
}: CardFrameProps) {
  const scale = SIZE_TO_SCALE[size];

  const cellStyle: React.CSSProperties = {
    width: `calc(${BASE_W}px * ${scale})`,
    height: `calc(${BASE_H}px * ${scale})`,
    position: "relative",
    flex: "0 0 auto",
    ["--card-scale" as any]: scale,
  };

  const innerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    willChange: "transform",
  };

  return (
    <div className={cn("card-cell", className)} style={cellStyle} aria-label={`card-${size}`}>
      <div className="card-inner" style={innerStyle}>
        <div className={cn("card-shell", cardClassName)} style={cardStyle} {...cardProps}>
          {children}
        </div>
      </div>
      {overlay ? <div className="card-overlay">{overlay}</div> : null}
    </div>
  );
}

export default CardFrame;
