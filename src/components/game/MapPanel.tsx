import React from 'react';

interface MapPanelProps {
  children: React.ReactNode;
  title?: string;
}

export function MapPanel({ children, title = 'USA Territory Control' }: MapPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="inline-block bg-white border-2 border-black px-3 py-1 font-[anton] uppercase mb-2">
        {title}
      </div>
      <div className="flex-1 bg-[#f7f7f7] border-2 border-black shadow-[6px_6px_0_#000] overflow-hidden rounded">
        {children}
      </div>
    </div>
  );
}

