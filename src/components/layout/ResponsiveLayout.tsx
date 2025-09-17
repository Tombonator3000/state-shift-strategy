import React from "react";
import clsx from "clsx";

type Props = {
  masthead?: React.ReactNode;
  main?: React.ReactNode; // spillbrett/kart/avisside
  sidebar?: React.ReactNode; // minimerte kort, statspanel, logg
  tray?: React.ReactNode; // Your Hand / card tray nederst
};

export default function ResponsiveLayout({ masthead, main, sidebar, tray }: Props) {
  return (
    <div className="app-shell flex flex-col" style={{ paddingTop: "var(--safe-top)" }}>
      {/* Masthead */}
      <header
        className="shrink-0"
        style={{ height: "var(--masthead-h)" }}
      >
        {masthead}
      </header>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        {/* Desktop / Tablet layout */}
        <div className="hidden md:grid h-full grid-cols-12 gap-3">
          {/* Main area */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-8 min-h-0">
            <div className="app-scroll h-full p-2 sm:p-4 md:p-6">
              {main}
            </div>
          </main>

          {/* Sidebar (vises fra md og opp) */}
          <aside className="hidden md:block col-span-4 lg:col-span-3 xl:col-span-4 min-h-0">
            <div className="app-scroll h-full p-2 sm:p-3 md:p-4">
              {sidebar}
            </div>
          </aside>
        </div>

        {/* Mobil layout (stack) */}
        <div className="md:hidden h-full">
          <div className="app-scroll h-full p-2">
            {main}
          </div>

          {/* Sidebar som overlay på mobil – implementer en Drawer senere */}
          {/* Legg inn en fast plasseringscontainer for drawer mount */}
          <div id="mobile-sidebar-portal" />
        </div>
      </div>

      {/* Tray nederst */}
      <footer
        className={clsx(
          "shrink-0 border-t",
          "bg-background"
        )}
        style={{
          height: "var(--tray-h-sm)",
          paddingLeft: "var(--safe-left)",
          paddingRight: "var(--safe-right)",
        }}
      >
        <div className="h-full md:h-[var(--tray-h-md)] lg:h-[var(--tray-h-lg)] p-2 sm:p-3 md:p-4">
          {tray}
        </div>
      </footer>
    </div>
  );
}
