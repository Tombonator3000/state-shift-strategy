import React from 'react';

interface GameLayoutProps {
  header?: React.ReactNode;
  status?: React.ReactNode;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  tray?: React.ReactNode;
}

export default function GameLayout({
  header,
  status,
  left,
  center,
  right,
  tray,
}: GameLayoutProps) {
  return (
    <div
      className="min-h-screen bg-[#f5efe2] text-black grid [grid-template-areas:'masthead''status''left''center''right''tray'] md:[grid-template-areas:'masthead_masthead''status_status''center_right''left_right''tray_tray'] lg:[grid-template-areas:'masthead_masthead_masthead''status_status_status''left_center_right''tray_tray_tray'] lg:grid-cols-[320px_1fr_360px] md:grid-cols-[1fr_340px] grid-rows-[auto_auto_1fr_auto]"
    >
      <header className="area-[masthead] sticky top-0 z-40">{header}</header>
      <div className="area-[status]">{status}</div>
      <aside className="area-[left] px-3 md:px-4 py-3">{left}</aside>
      <main className="area-[center] px-3 md:px-4 py-3 overflow-hidden">{center}</main>
      <aside className="area-[right] px-3 md:px-4 py-3">{right}</aside>
      <div className="area-[tray] sticky bottom-0 z-30">{tray}</div>
    </div>
  );
}

