import { ArrowLeft } from 'lucide-react';
import type { GameOverReport } from '@/types/finalEdition';
import { cn } from '@/lib/utils';
import CardImage from '@/components/game/CardImage';
import '@/styles/newspaperLayout.css';

interface NewspaperInsidePagesProps {
  report: GameOverReport;
  currentPage: 'mvp-breakdown' | 'key-events' | 'full-analysis';
  onBackToFront: () => void;
  isVictory: boolean;
}

const NewspaperInsidePages = ({ report, currentPage, onBackToFront, isVictory }: NewspaperInsidePagesProps) => {
  const pageNumberMap = {
    'mvp-breakdown': 'PAGE 2-3',
    'key-events': 'PAGE 4-5',
    'full-analysis': 'PAGE 6-9',
  };

  const pageTitleMap = {
    'mvp-breakdown': 'MVP BREAKDOWN',
    'key-events': 'KEY EVENTS TIMELINE',
    'full-analysis': 'STATISTICAL ANALYSIS',
  };

  const pageNumber = pageNumberMap[currentPage];
  const pageTitle = pageTitleMap[currentPage];

  const editionDate = new Date(report.recordedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="newspaper-page">
      {/* Masthead */}
      <div className="newspaper-inside-masthead">
        <button
          onClick={onBackToFront}
          className="flex items-center gap-2 transition hover:text-red-500"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK TO FRONT PAGE
        </button>
        <div>{editionDate}</div>
        <div className="text-yellow-400">{pageNumber}</div>
      </div>

      {/* Title Bar */}
      <div className="border-b-4 border-white bg-black px-6 py-3 text-center">
        <h1 className="font-['Archivo_Black'] text-3xl font-black uppercase tracking-wider text-white">
          PARANOID TIMES
        </h1>
        <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-400">
          {pageTitle}
        </div>
      </div>

      {/* Content Area */}
      <div className="h-[calc(100vh-140px)] overflow-hidden bg-gray-100 p-4">
        {currentPage === 'mvp-breakdown' && (
          <div className="grid h-full gap-4 sm:grid-cols-2">
            {/* MVP Panel */}
            {report.mvp && (
              <div className="newspaper-article-column overflow-y-auto">
                <div className="mb-3 border-b-3 border-black pb-2">
                  <h2 className="font-['Archivo_Black'] text-2xl font-black uppercase text-red-600">
                    MOST VALUABLE OPERATIVE
                  </h2>
                </div>
                <div className="mb-4">
                  <CardImage
                    cardId={report.mvp.cardId}
                    fit="contain"
                    className="mx-auto h-48 w-auto border-4 border-black"
                  />
                </div>
                <h3 className="mb-2 font-['Archivo_Black'] text-xl font-black uppercase">
                  {report.mvp.cardName}
                </h3>
                <p className="newspaper-body-text mb-4">{report.mvp.highlight}</p>
                <div className="newspaper-stat-box space-y-2 text-sm">
                  <div className="flex justify-between border-b border-black/20 pb-1">
                    <span className="font-bold">Truth Impact:</span>
                    <span>{Math.round(report.mvp.truthDelta)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-black/20 pb-1">
                    <span className="font-bold">IP Swing:</span>
                    <span>{report.mvp.ipDelta >= 0 ? '+' : ''}{Math.round(report.mvp.ipDelta)}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/20 pb-1">
                    <span className="font-bold">Damage Dealt:</span>
                    <span>{Math.round(report.mvp.damageDealt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">States Captured:</span>
                    <span>{report.mvp.capturedStates.length > 0 ? report.mvp.capturedStates.join(', ') : '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Runner-up Panel */}
            {report.runnerUp && (
              <div className="newspaper-article-column overflow-y-auto">
                <div className="mb-3 border-b-3 border-black pb-2">
                  <h2 className="font-['Archivo_Black'] text-2xl font-black uppercase">
                    RUNNER-UP OPERATIVE
                  </h2>
                </div>
                <div className="mb-4">
                  <CardImage
                    cardId={report.runnerUp.cardId}
                    fit="contain"
                    className="mx-auto h-48 w-auto border-4 border-black"
                  />
                </div>
                <h3 className="mb-2 font-['Archivo_Black'] text-xl font-black uppercase">
                  {report.runnerUp.cardName}
                </h3>
                <p className="newspaper-body-text mb-4">{report.runnerUp.highlight}</p>
                <div className="newspaper-stat-box space-y-2 text-sm">
                  <div className="flex justify-between border-b border-black/20 pb-1">
                    <span className="font-bold">Truth Impact:</span>
                    <span>{Math.round(report.runnerUp.truthDelta)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-black/20 pb-1">
                    <span className="font-bold">IP Swing:</span>
                    <span>{report.runnerUp.ipDelta >= 0 ? '+' : ''}{Math.round(report.runnerUp.ipDelta)}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/20 pb-1">
                    <span className="font-bold">Damage Dealt:</span>
                    <span>{Math.round(report.runnerUp.damageDealt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">States Captured:</span>
                    <span>{report.runnerUp.capturedStates.length > 0 ? report.runnerUp.capturedStates.join(', ') : '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'key-events' && (
          <div className="newspaper-article-column h-full overflow-y-auto">
            <div className="mb-4 border-b-3 border-black pb-2">
              <h2 className="font-['Archivo_Black'] text-2xl font-black uppercase text-red-600">
                KEY EVENTS TIMELINE
              </h2>
            </div>
            <div className="space-y-4">
              {report.topEvents.slice(0, 5).map((event, index) => (
                <div key={event.id} className="border-b-2 border-black/20 pb-3">
                  <div className="mb-1 flex items-baseline justify-between">
                    <h3 className="font-['Archivo_Black'] text-lg font-black uppercase">
                      {event.headline}
                    </h3>
                    {event.kicker && (
                      <span className="newspaper-caption">{event.kicker}</span>
                    )}
                  </div>
                  <p className="newspaper-body-text mb-2">{event.summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {event.truthDelta !== 0 && (
                      <span className="rounded bg-black px-2 py-1 text-white">
                        {event.truthDelta > 0 ? '+' : ''}{event.truthDelta} TRUTH
                      </span>
                    )}
                    {event.ipDelta !== 0 && (
                      <span className="rounded bg-red-600 px-2 py-1 text-white">
                        {event.ipDelta > 0 ? '+' : ''}{event.ipDelta} IP
                      </span>
                    )}
                    {event.stateName && (
                      <span className="rounded bg-gray-700 px-2 py-1 text-white">
                        {event.stateName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'full-analysis' && (
          <div className="grid h-full gap-4 sm:grid-cols-2">
            <div className="newspaper-article-column overflow-y-auto">
              <div className="mb-4 border-b-3 border-black pb-2">
                <h2 className="font-['Archivo_Black'] text-xl font-black uppercase text-red-600">
                  CAMPAIGN STATISTICS
                </h2>
              </div>
              <div className="space-y-3">
                <div className="newspaper-stat-box">
                  <div className="newspaper-caption mb-1">FINAL TRUTH LEVEL</div>
                  <div className="text-3xl font-black">{Math.round(report.finalTruth)}%</div>
                </div>
                <div className="newspaper-stat-box">
                  <div className="newspaper-caption mb-1">TOTAL ROUNDS</div>
                  <div className="text-3xl font-black">{report.rounds}</div>
                </div>
                <div className="newspaper-stat-box">
                  <div className="newspaper-caption mb-1">INFLUENCE POINTS</div>
                  <div className="text-xl font-bold">
                    Truth: {Math.round(report.ipPlayer)} • Govt: {Math.round(report.ipAI)}
                  </div>
                </div>
              </div>

              {report.comboHighlights.length > 0 && (
                <div className="mt-4">
                  <h3 className="newspaper-subheading">COMBO HIGHLIGHTS</h3>
                  <div className="space-y-2">
                    {report.comboHighlights.slice(0, 3).map((combo) => (
                      <div key={combo.id} className="border-l-4 border-red-600 bg-gray-50 p-2">
                        <div className="font-bold">{combo.name}</div>
                        <div className="newspaper-caption">{combo.rewardLabel} • {combo.ownerLabel}</div>
                        {combo.description && <div className="mt-1 text-sm">{combo.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="newspaper-article-column overflow-y-auto">
              <div className="mb-4 border-b-3 border-black pb-2">
                <h2 className="font-['Archivo_Black'] text-xl font-black uppercase">
                  CLASSIFIED REPORTS
                </h2>
              </div>
              {report.sightings.length > 0 && (
                <div className="space-y-2">
                  {report.sightings.slice(-5).map((sighting, index) => (
                    <div key={sighting.id || index} className="border-b border-dashed border-black/30 pb-2">
                      <div className="newspaper-caption mb-1">⚠ UNVERIFIED INTELLIGENCE</div>
                      <p className="text-sm font-bold">{sighting.headline}</p>
                      {sighting.subtext && <p className="text-xs text-gray-600">{sighting.subtext}</p>}
                    </div>
                  ))}
                </div>
              )}

              {report.extraExtraFeed.length > 0 && (
                <div className="mt-4">
                  <h3 className="newspaper-subheading text-base">WIRE DISPATCHES</h3>
                  <div className="space-y-2">
                    {report.extraExtraFeed.slice(-3).reverse().map((article, index) => (
                      <div key={index} className="bg-yellow-50 p-2 text-xs">
                        <div className="font-bold uppercase">{article.hed}</div>
                        {article.dek && <div className="italic text-gray-700">{article.dek}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t-4 border-white bg-black p-3">
        <div className="flex flex-wrap justify-center gap-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
          <button
            onClick={onBackToFront}
            className="rounded-full border-2 border-white bg-red-600 px-6 py-2 transition hover:bg-red-700"
          >
            ← Front Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewspaperInsidePages;
