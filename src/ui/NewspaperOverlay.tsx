import React from "react";
import { NewspaperIssue } from "@/types/newspaper";
import { cn } from "@/lib/cn";

type Props = { issue: NewspaperIssue; onClose: () => void };

export default function NewspaperOverlay({ issue, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto my-6 max-w-5xl bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Masthead */}
        <header className="px-6 py-4 border-b border-neutral-200 flex items-baseline justify-between">
          <h1 className="text-3xl font-extrabold tracking-wide">{issue.masthead}</h1>
          <div className="text-sm text-neutral-500">Vol. R{issue.round}</div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 p-6">
          {/* Lead (1–3) */}
          <section className="md:col-span-2 space-y-6">
            {issue.lead.map((a) => (
              <article key={a.cardId} className={cn("news-article space-y-2", a.isEvent && "event")}>
                {a.isEvent && <span className="news-badge event inline-block">EVENT</span>}
                <h2 className={cn("headline text-2xl font-black leading-tight", a.isEvent ? "text-rose-600" : "text-black")}>
                  {a.title}
                </h2>
                {a.dek && (
                  <p className={cn("dek text-sm italic", a.isEvent ? "text-rose-400" : "text-neutral-700")}>{a.dek}</p>
                )}
                <img
                  src={a.imageUrl}
                  alt=""
                  className="w-full aspect-[16/9] object-cover rounded-md border border-neutral-200"
                />
                {a.body.map((p, idx) => (
                  <p key={idx} className="text-sm text-neutral-800">
                    {p}
                  </p>
                ))}
                {a.stamps?.length ? (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {a.stamps.map((s, j) => (
                      <span
                        key={j}
                        className="text-[10px] font-extrabold px-2 py-1 border border-black rounded-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {/* Brief */}
            {issue.brief && (
              <article
                className={cn("news-article border-t pt-4 mt-4", issue.brief.isEvent && "event")}
              >
                {issue.brief.isEvent && <span className="news-badge event inline-block">EVENT</span>}
                <h3
                  className={cn(
                    "headline text-xl font-extrabold",
                    issue.brief.isEvent ? "text-rose-600" : "text-black"
                  )}
                >
                  {issue.brief.title}
                </h3>
                {issue.brief.dek && (
                  <p
                    className={cn(
                      "dek text-sm italic",
                      issue.brief.isEvent ? "text-rose-400" : "text-neutral-700"
                    )}
                  >
                    {issue.brief.dek}
                  </p>
                )}
              </article>
            )}
          </section>

          {/* Ads / Sidebars */}
          <aside className="space-y-4">
            {issue.ads.map((ad, i) => (
              <div key={i} className="border-2 border-black rounded-lg p-3">
                {ad.kicker && <div className="text-[10px] font-black tracking-widest">{ad.kicker}</div>}
                <div className="font-extrabold">{ad.title}</div>
                {ad.body && <div className="text-sm text-neutral-700">{ad.body}</div>}
                {ad.footer && <div className="text-[10px] mt-1 text-neutral-500">{ad.footer}</div>}
              </div>
            ))}
            {issue.sidebars?.map((s, i) => (
              <div key={i} className="bg-neutral-50 border border-neutral-200 rounded p-3 text-sm">{s}</div>
            ))}
          </aside>
        </div>

        {/* Ticker */}
        {issue.tickers.length > 0 && (
          <div className="px-6 pb-4">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500">News Ticker</div>
            <div className="text-sm">{issue.tickers.join(" • ")}</div>
          </div>
        )}

        <footer className="px-6 py-4 border-t border-neutral-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-neutral-300 hover:bg-neutral-50">
            Continue
          </button>
        </footer>
      </div>
    </div>
  );
}
