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
      className="app-shell flex h-screen min-h-0 flex-col"
      style={{
        paddingTop: "var(--safe-top)",
      }}
    >
      {/* Masthead */}
      <header
        className="shrink-0"
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
          <div className="app-scroll h-full p-2 sm:p-4 md:p-6">
            <div
              className={clsx(
                "grid h-full min-h-0 gap-4",
                "grid-cols-1",
                hasRightPane && "lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]"
              )}
            >
              <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                <div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto">
                  {leftPane}
                </div>
              </main>
              {hasRightPane && (
                <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">{rightPane}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
