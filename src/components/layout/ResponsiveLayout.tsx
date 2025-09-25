import React from "react";
import clsx from "clsx";

type Props = {
  masthead?: React.ReactNode;
  leftPane?: React.ReactNode;
  rightPane?: React.ReactNode;
  utilityPane?: React.ReactNode;
};

export default function ResponsiveLayout({ masthead, leftPane, rightPane, utilityPane }: Props) {
  const hasRightPane = Boolean(rightPane);
  const hasUtilityPane = Boolean(utilityPane);

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
        style={{ height: "var(--masthead-h)" }}
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
                (hasRightPane || hasUtilityPane) &&
                  "lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]",
                hasRightPane && hasUtilityPane &&
                  "xl:grid-cols-[minmax(0,1fr)_minmax(300px,420px)_minmax(220px,320px)]"
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
              {hasUtilityPane && (
                <aside className="hidden h-full min-h-0 min-w-0 flex-col overflow-hidden xl:flex">
                  {utilityPane}
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
