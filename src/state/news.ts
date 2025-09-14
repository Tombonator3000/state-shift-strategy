import { create } from "zustand";
import type { NewspaperEntry } from "@/engine/types";

type NewsStore = { items: NewspaperEntry[]; push: (e:NewspaperEntry)=>void; clear:()=>void; };

export const useNews = create<NewsStore>((set)=>({
  items: [],
  push: (e)=> set(s=>({ items:[e, ...s.items].slice(0,50) })),
  clear: ()=> set({ items: [] }),
}));
