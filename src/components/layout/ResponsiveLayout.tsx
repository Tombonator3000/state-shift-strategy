import React from "react";
import clsx from "clsx";

type Props = {
  masthead?: React.ReactNode;
  leftPane?: React.ReactNode; // spillbrett/kart/avisside + paneler
  rightPane?: React.ReactNode; // spillerhånd, handlinger
};

export default function ResponsiveLayout({ masthead, leftPane, rightPane }: Props) {
  const hasRightPane = Boolean(rightPane);

  return (
    <div
      className="app-shell flex min-h-screen flex-col"
      style={{
        paddingTop: "var(--safe-top)",
      }}
    >
      {/* Masthead */}
      <header
        className="shrink-0"
        style={{ height: "var(--masthead-h)" }}
      >
        {masthead}
      </header>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        <div
          className="flex min-h-0 flex-col"
          style={{
            paddingLeft: "var(--safe-left)",
            paddingRight: "var(--safe-right)",
          }}
        >
          <div className="app-scroll flex flex-1 min-h-0 flex-col p-2 sm:p-4 md:p-6">
            <div
              className={clsx(
                "flex flex-1 flex-col gap-4 min-h-0",
                hasRightPane &&
                  "lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-6 lg:[&>*]:min-h-0 xl:grid-cols-[minmax(0,1fr)_480px]"
              )}
            >
              <main className="flex min-h-0 flex-1 min-w-0 flex-col gap-4 overflow-hidden">
                <div className="flex min-h-0 flex-1 min-w-0 flex-col gap-4 overflow-y-auto">
                  {leftPane}
                </div>
              </main>
              {hasRightPane && (
                <div className="min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">{rightPane}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
