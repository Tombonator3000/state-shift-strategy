import * as React from "react";
import { useNews } from "@/state/news";

export default function NewspaperTape(){
  const { items } = useNews();
  if (!items.length) return null;
  const top = items[0];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 text-neutral-50 text-sm py-2 px-3 border-t border-white/10">
      <div className="font-extrabold uppercase tracking-wider">{top.headline}</div>
      <div className="opacity-80 text-[12px]">{top.body}</div>
    </div>
  );
}
