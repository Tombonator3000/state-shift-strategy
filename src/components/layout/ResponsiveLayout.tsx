import React from "react";
import clsx from "clsx";
import '@/styles/gameplay-layout.css';

type Props = {
  masthead?: React.ReactNode;
  leftPane?: React.ReactNode; // spillbrett/kart/avisside + paneler
  rightPane?: React.ReactNode; // spillerhånd, handlinger
};

export default function ResponsiveLayout({ masthead, leftPane, rightPane }: Props) {
  const hasRightPane = Boolean(rightPane);

  return (
    <div
      className="app-shell gameplay-shell flex min-h-0 flex-col"
      style={{
        paddingTop: "var(--safe-top)",
        height: "100dvh",
        minHeight: "100dvh",
      }}
    >
      {/* Masthead */}
      <header
        className="gameplay-masthead shrink-0"
        style={{
          height: "var(--masthead-h)",
          background: "var(--paper)",
        }}
      >
        {masthead}
      </header>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        <div
          className="h-full"
          style={{
            paddingLeft: "var(--safe-left)",
            paddingRight: "var(--safe-right)",
          }}
        >
          <div className="app-scroll gameplay-scroll h-full p-1.5 sm:p-2 md:p-3 lg:p-4">
            <div
              className={clsx(
                "gameplay-grid grid h-full min-h-0",
                "gap-2 sm:gap-2.5 md:gap-3",
                "grid-cols-1",
                hasRightPane && "lg:grid-cols-[minmax(0,1fr)_416px] xl:grid-cols-[minmax(0,1fr)_448px] 2xl:grid-cols-[minmax(0,1fr)_480px]"
              )}
            >
              <main className="gameplay-board flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                <div className="gameplay-board-content flex h-full min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden">
                  {leftPane}
                </div>
              </main>
              {hasRightPane && (
                <div className="gameplay-hand flex h-full min-h-0 min-w-0 flex-col overflow-hidden">{rightPane}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
