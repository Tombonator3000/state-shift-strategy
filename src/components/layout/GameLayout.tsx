import React from 'react';

interface GameLayoutProps {
  header: React.ReactNode;
  statusBar: React.ReactNode;
  leftRail: React.ReactNode;
  mapArea: React.ReactNode;
  rightRail: React.ReactNode;
  playDock: React.ReactNode;
  handTray: React.ReactNode;
  toastArea?: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  header,
  statusBar,
  leftRail,
  mapArea,
  rightRail,
  playDock,
  handTray,
  toastArea
}) => {
  return (
    <div className="h-screen w-full flex flex-col bg-newspaper-bg overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        {header}
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 border-b-2 border-newspaper-border">
        {statusBar}
      </div>

      {/* Main Game Area - Grid Layout */}
      <div className="flex-1 grid grid-cols-[auto_1fr_auto] grid-rows-[1fr_auto_auto] min-h-0">
        {/* Left Rail - spans full height */}
        <div className="row-span-3 bg-newspaper-bg border-r-2 border-newspaper-border">
          {leftRail}
        </div>

        {/* Map Area - main content */}
        <div className="bg-newspaper-bg border-x-2 border-newspaper-border p-1 min-h-0">
          {mapArea}
        </div>

        {/* Right Rail - spans full height */}
        <div className="row-span-3 bg-newspaper-bg border-l-2 border-newspaper-border">
          {rightRail}
        </div>

        {/* Play/Resolution Dock - spans center column only */}
        <div className="bg-newspaper-bg border-t-2 border-newspaper-border">
          {playDock}
        </div>

        {/* Hand Tray - spans center column only */}
        <div className="bg-newspaper-bg border-t-2 border-newspaper-border">
          {handTray}
        </div>
      </div>

      {/* Toast Area - Absolute positioned */}
      {toastArea && (
        <div className="fixed top-20 right-4 z-50 pointer-events-none">
          {toastArea}
        </div>
      )}
    </div>
  );
};

export default GameLayout;