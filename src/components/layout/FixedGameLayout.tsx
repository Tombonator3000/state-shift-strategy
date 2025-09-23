import React from "react";
import { cn } from "@/lib/utils";

interface FixedGameLayoutProps {
  masthead?: React.ReactNode;
  usaMap?: React.ReactNode;
  cardsInPlayTray?: React.ReactNode;
  playerHand?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  className?: string;
}

export default function FixedGameLayout({
  masthead,
  usaMap,
  cardsInPlayTray,
  playerHand,
  leftSidebar,
  className,
}: FixedGameLayoutProps) {
  return (
    <div
      className={cn(
        "fixed-game-layout min-h-screen flex flex-col bg-background",
        className
      )}
      style={{
        paddingTop: "var(--safe-top, 0px)",
        paddingLeft: "var(--safe-left, 0px)",
        paddingRight: "var(--safe-right, 0px)",
        paddingBottom: "var(--safe-bottom, 0px)",
      }}
    >
      {/* Fixed Masthead */}
      {masthead && (
        <header className="fixed-masthead shrink-0 h-16 border-b border-border/50">
          {masthead}
        </header>
      )}

      {/* Main Game Area - CSS Grid Layout */}
      <div className="fixed-game-grid flex-1 min-h-0 grid lg:grid-cols-[300px_1fr_420px] lg:grid-rows-[1fr_200px] gap-4 p-4 lg:gap-6 lg:p-6 md:grid-cols-[1fr_380px] md:grid-rows-[auto_1fr_180px] sm:grid-cols-1 sm:grid-rows-[auto_1fr_160px_300px]">
        
        {/* Left Sidebar */}
        <aside className="left-sidebar lg:row-span-2 md:col-span-full md:max-h-[120px] sm:max-h-[100px] flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card/50">
          {leftSidebar}
        </aside>

        {/* USA Map - Center top, fixed container */}
        <section className="usa-map-container md:col-start-1 md:row-start-2 sm:row-start-2 flex items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-card/10">
          <div className="usa-map-inner w-full h-full flex items-center justify-center p-4">
            {usaMap}
          </div>
        </section>

        {/* Your Hand - Right side, full height */}
        <aside className="player-hand-panel lg:row-span-2 md:col-start-2 md:row-start-2 md:row-end-4 sm:row-start-4 flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card/50">
          {playerHand}
        </aside>

        {/* Cards in Play Tray - Center bottom, fixed height */}
        <section className="cards-tray-container md:col-start-1 md:row-start-3 sm:row-start-3 overflow-hidden rounded-lg border border-border/50 bg-card/20">
          <div className="cards-tray-inner h-full p-3">
            {cardsInPlayTray}
          </div>
        </section>
      </div>
    </div>
  );
}