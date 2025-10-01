import { Card } from '@/components/ui/card';
import { Eye, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { SecretAgenda as AgendaType } from '@/data/agendaDatabase';

interface SecretAgendaProps {
  agenda: AgendaType & {
    progress: number;
    completed: boolean;
    revealed: boolean;
    stageId?: string;
  };
  isPlayer?: boolean;
}

const SecretAgenda = ({ agenda, isPlayer = true }: SecretAgendaProps) => {
  const progressPercent = useMemo(() => {
    if (!agenda.target) {
      return 0;
    }

    const raw = (agenda.progress / agenda.target) * 100;
    return Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
  }, [agenda.progress, agenda.target]);

  const isGovernmentAgenda = agenda.faction === 'government';
  const difficultyBadgeClass = useMemo(() => {
    switch (agenda.difficulty) {
      case 'easy':
        return isGovernmentAgenda
          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-400/40'
          : 'bg-green-900/50 text-green-300 border border-green-500/50';
      case 'medium':
        return isGovernmentAgenda
          ? 'bg-amber-900/30 text-amber-200 border border-amber-400/40'
          : 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/50';
      case 'hard':
        return isGovernmentAgenda
          ? 'bg-rose-900/30 text-rose-200 border border-rose-500/40'
          : 'bg-red-900/50 text-red-300 border border-red-500/50';
      default:
        return isGovernmentAgenda
          ? 'bg-indigo-900/30 text-indigo-200 border border-indigo-400/40'
          : 'bg-purple-900/50 text-purple-300 border border-purple-500/50';
    }
  }, [agenda.difficulty, isGovernmentAgenda]);

  const stages = useMemo(() => Array.isArray(agenda.stages) ? agenda.stages : [], [agenda.stages]);
  const activeStageId = useMemo(() => agenda.stageId || stages[0]?.id || '', [agenda.stageId, stages]);
  const activeStageIndex = useMemo(() => {
    if (!stages.length) {
      return -1;
    }
    const index = stages.findIndex(stage => stage.id === activeStageId);
    return index >= 0 ? index : 0;
  }, [stages, activeStageId]);
  const activeStage = stages[activeStageIndex] ?? null;
  const stageStatuses = useMemo(
    () => stages.map((stage, index) => {
      const isActive = stage.id === activeStageId;
      const isComplete = agenda.completed
        ? stage.threshold <= agenda.progress
        : index < activeStageIndex;
      const status: 'locked' | 'active' | 'complete' = isComplete
        ? 'complete'
        : isActive
          ? 'active'
          : 'locked';
      return { stage, status, index };
    }),
    [stages, activeStageId, activeStageIndex, agenda.completed, agenda.progress],
  );

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    setPrefersReducedMotion(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const [highlightedStageId, setHighlightedStageId] = useState<string | null>(null);
  useEffect(() => {
    if (!agenda.stageId) {
      return;
    }
    setHighlightedStageId(agenda.stageId);
    if (prefersReducedMotion || typeof window === 'undefined') {
      return;
    }
    const timeout = window.setTimeout(() => {
      setHighlightedStageId(null);
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [agenda.stageId, prefersReducedMotion]);

  const renderProgressBar = () => {
    const trackClass = isGovernmentAgenda ? 'bg-slate-800' : 'bg-secret-red/20';
    const fillClass = isGovernmentAgenda ? 'bg-government-blue' : 'bg-secret-red';
    const textClass = isGovernmentAgenda ? 'text-slate-300' : 'text-gray-300';

    return (
      <div className="space-y-1">
        <div className={`flex justify-between items-center text-xs font-mono ${textClass}`}>
          <span>Progress:</span>
          <div className="flex items-center gap-2">
            <span>{agenda.progress}/{agenda.target}</span>
            <span className={`px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${difficultyBadgeClass}`}>
              {agenda.difficulty.toUpperCase()}
            </span>
          </div>
        </div>
        <div className={`h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
          <div
            className={`h-full transition-all duration-500 ease-out ${fillClass}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  };

  const renderStageCards = () => {
    if (!stageStatuses.length) {
      return null;
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stageStatuses.map(({ stage, status }) => {
          const isActiveStage = status === 'active';
          const isCompleteStage = status === 'complete';
          const isLockedStage = status === 'locked';
          const highlight = highlightedStageId === stage.id;
          const baseClass = isGovernmentAgenda
            ? 'border border-slate-700/70 bg-slate-950/60'
            : 'border border-secret-red/40 bg-black/60';
          const activeClass = isActiveStage
            ? isGovernmentAgenda
              ? 'ring-2 ring-government-blue/60 shadow-[0_0_18px_rgba(59,130,246,0.35)]'
              : 'ring-2 ring-secret-red/70 shadow-[0_0_18px_rgba(248,113,113,0.45)]'
            : '';
          const completeClass = isCompleteStage
            ? isGovernmentAgenda
              ? 'border-government-blue/60 bg-government-blue/10'
              : 'border-secret-red/60 bg-secret-red/20'
            : '';
          const pulseClass = highlight && !prefersReducedMotion ? 'animate-[pulse_1.4s_ease-in-out]' : '';
          const lockedOverlayClass = isGovernmentAgenda
            ? 'bg-slate-950/85 text-slate-400'
            : 'bg-black/80 text-rose-200/80';
          const unlockedOverlayClass = isGovernmentAgenda
            ? 'text-government-blue/80'
            : 'text-amber-200/90';
          const titleClass = isGovernmentAgenda
            ? 'text-xs font-bold uppercase tracking-wide text-slate-100'
            : 'text-xs font-bold uppercase tracking-wide text-rose-100';
          const descriptionClass = isGovernmentAgenda
            ? 'text-[11px] leading-snug text-slate-300'
            : 'text-[11px] leading-snug text-rose-100/90';
          const requirementClass = isGovernmentAgenda
            ? 'text-[10px] font-mono uppercase text-slate-400'
            : 'text-[10px] font-mono uppercase text-amber-200/80';

          return (
            <div
              key={stage.id}
              className={`relative overflow-hidden rounded-md p-3 transition-all duration-500 ${baseClass} ${activeClass} ${completeClass} ${pulseClass}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-mono uppercase tracking-[0.5em] transition-opacity duration-500 ${isLockedStage ? 'opacity-80' : 'opacity-0'} ${lockedOverlayClass}`}
              >
                CLASSIFIED
              </div>
              <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-mono uppercase tracking-[0.45em] transition-opacity duration-500 ${isLockedStage ? 'opacity-0' : 'opacity-80'} ${unlockedOverlayClass}`}
              >
                {isCompleteStage ? 'UNREDACTED' : 'DECLASSIFYING'}
              </div>
              <div className="relative z-10 space-y-1">
                <div className={titleClass}>{stage.label}</div>
                <p className={descriptionClass}>{stage.description}</p>
                <p className={requirementClass}>{stage.requirement}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  const statusLabel = agenda.revealed ? 'REVEALED' : 'HIDDEN';
  const statusClasses = agenda.revealed
    ? (isGovernmentAgenda
      ? 'border-government-blue/60 bg-government-blue/15 text-government-blue'
      : 'border-secret-red/60 bg-secret-red/15 text-secret-red')
    : (isGovernmentAgenda
      ? 'border-slate-700 bg-slate-900/80 text-slate-300'
      : 'border-gray-700 bg-gray-900/80 text-gray-400');

  const renderCompactContent = () => {
    if (isGovernmentAgenda) {
      return (
        <div className="space-y-3 text-xs text-slate-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-mono">Case File</div>
              <div className="text-sm font-semibold text-slate-100 font-mono leading-tight">
                {agenda.operationName}
              </div>
            </div>
            {agenda.artCue?.icon && (
              <img
                src={agenda.artCue.icon}
                alt={agenda.artCue.alt ?? 'Clearance stamp'}
                className="h-10 w-10 opacity-70"
                loading="lazy"
              />
            )}
          </div>
          <div className="rounded border border-slate-700/70 bg-slate-900/60 px-2 py-1 text-[11px] uppercase tracking-widest font-semibold text-slate-200">
            {agenda.headline}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            <span className="font-semibold text-slate-200">Issue Theme</span>
            <span>{agenda.issueTheme}</span>
          </div>
          {agenda.pullQuote && (
            <div className="text-[10px] italic text-slate-400 line-clamp-2">
              {agenda.pullQuote}
            </div>
          )}
          <div className="text-[10px] text-slate-400 line-clamp-2 font-mono">
            {agenda.description}
          </div>
          {activeStage && (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-300 font-mono">
                Current Phase: {activeStage.label}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {activeStage.requirement}
              </div>
            </div>
          )}
          {renderProgressBar()}
          {agenda.completed && (
            <div className="text-[10px] text-government-blue font-bold">
              Objective Complete
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3 text-xs text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-secret-red">
              {agenda.operationName}
            </div>
            <div className="text-base font-black uppercase leading-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.45)]">
              {agenda.headline}
            </div>
          </div>
          {agenda.artCue?.icon && (
            <img
              src={agenda.artCue.icon}
              alt={agenda.artCue.alt ?? 'Tabloid accent graphic'}
              className="h-12 w-12 drop-shadow-[0_0_12px_rgba(248,113,113,0.65)]"
              loading="lazy"
            />
          )}
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-orange-200/80 font-semibold">
          {agenda.issueTheme}
        </div>
        <div className="text-[10px] italic text-amber-100/80 line-clamp-2">
          {agenda.pullQuote ?? agenda.flavorText}
        </div>
        <div className="text-[10px] text-rose-100/80 line-clamp-2 font-mono">
          {agenda.description}
        </div>
        {activeStage && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-[0.35em] text-orange-200/80 font-semibold">
              Current Phase: {activeStage.label}
            </div>
            <div className="text-[10px] text-rose-100/80 font-mono">
              {activeStage.requirement}
            </div>
          </div>
        )}
        {renderProgressBar()}
        {agenda.completed && (
          <div className="text-[10px] text-secret-red font-bold">
            Objective Complete
          </div>
        )}
      </div>
    );
  };

  const cardVariantClasses = isGovernmentAgenda
    ? 'bg-slate-950 text-slate-100 border border-slate-700 shadow-[0_0_24px_rgba(8,47,73,0.35)]'
    : 'bg-gradient-to-br from-black via-slate-950 to-black text-white border-2 border-secret-red shadow-[0_0_24px_rgba(190,24,60,0.35)]';
  const headerIconColor = isGovernmentAgenda ? 'text-government-blue' : 'text-secret-red';
  const overlayGradientClass = isGovernmentAgenda
    ? 'absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-950 to-slate-950/60'
    : 'absolute inset-0 bg-gradient-to-br from-secret-red/15 via-transparent to-black';

  // Opponent view - just a progress bar
  if (!isPlayer) {
    const opponentAriaLabel = agenda.revealed
      ? undefined
      : `AI objective hidden. Progress ${Math.floor(progressPercent)} percent.`;

    return (
      <Card
        className={`p-2 relative ${isGovernmentAgenda ? 'bg-slate-950 text-slate-100 border border-government-blue/40' : 'bg-black text-white border border-secret-red/50'}`}
        aria-label={opponentAriaLabel}
      >
        <div className={overlayGradientClass}></div>
        {agenda.artCue?.texture && (
          <div
            className={`absolute inset-0 pointer-events-none ${
              isGovernmentAgenda ? 'opacity-25 mix-blend-multiply' : 'opacity-30 mix-blend-screen'
            }`}
            style={{
              backgroundImage: `url(${agenda.artCue.texture})`,
              backgroundSize: isGovernmentAgenda ? '220px' : '180px',
              backgroundRepeat: 'repeat'
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {agenda.revealed ? (
                <Eye size={12} className={isGovernmentAgenda ? 'text-government-blue/70' : 'text-secret-red/70'} />
              ) : (
                <Lock size={12} className={isGovernmentAgenda ? 'text-government-blue/70' : 'text-secret-red/70'} />
              )}
              <h3 className={`font-bold text-xs font-mono ${isGovernmentAgenda ? 'text-government-blue/70' : 'text-secret-red/70'}`}>
                AI OBJECTIVE
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusClasses}`}
              >
                {agenda.revealed ? <Eye size={10} /> : <Lock size={10} />}
                {statusLabel}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${difficultyBadgeClass}`}
                aria-label={`Secret agenda difficulty ${agenda.difficulty}`}
              >
                {agenda.difficulty.toUpperCase()}
              </span>
            </div>
          </div>
          {agenda.revealed ? (
            renderCompactContent()
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded">
                <div
                  className="h-full bg-secret-red/70 rounded transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {Math.floor(progressPercent)}%
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Player view - expandable display
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={handleKeyDown}
      className={`${cardVariantClasses} relative overflow-hidden cursor-pointer transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        isGovernmentAgenda
          ? 'focus-visible:outline-government-blue/70 focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.25)]'
          : 'focus-visible:outline-secret-red/80 focus-visible:shadow-[0_0_0_3px_rgba(220,38,38,0.35)]'
      } ${isExpanded ? 'p-4' : 'p-2'}`}
      onClick={toggleExpanded}
    >
      <div className={overlayGradientClass}></div>
      {agenda.artCue?.texture && (
        <div
          className={`absolute inset-0 pointer-events-none ${isGovernmentAgenda ? 'opacity-25 mix-blend-multiply' : 'opacity-30 mix-blend-screen'}`}
          style={{
            backgroundImage: `url(${agenda.artCue.texture})`,
            backgroundSize: isGovernmentAgenda ? '240px' : '200px',
            backgroundRepeat: 'repeat'
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">
        <div className={`flex items-center justify-between ${isExpanded ? 'mb-3' : 'mb-0'}`}>
          <div className="flex items-center gap-2">
            <Eye size={isExpanded ? 18 : 14} className={headerIconColor} />
            <h3 className={`font-bold font-mono ${headerIconColor} ${isExpanded ? 'text-sm' : 'text-xs'}`}>
              SECRET AGENDA
            </h3>
            <span className={`hidden sm:flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusClasses}`}>
              {agenda.revealed ? <Eye size={10} /> : <Lock size={10} />}
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`sm:hidden flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${statusClasses}`}>
              {agenda.revealed ? <Eye size={10} /> : <Lock size={10} />}
              {statusLabel}
            </span>
            {isExpanded ? (
              <ChevronUp size={14} className={headerIconColor} />
            ) : (
              <ChevronDown size={14} className={headerIconColor} />
            )}
          </div>
        </div>

        {!isExpanded ? (
          // Minimized view - show quick summary
          renderCompactContent()
        ) : (
          // Expanded view - full details
          <div className="space-y-4">
            {isGovernmentAgenda ? (
              <div className="space-y-3 text-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400 font-mono">Operation</div>
                    <div className="text-lg font-semibold font-mono leading-tight">{agenda.operationName}</div>
                    <div className="text-[11px] uppercase tracking-[0.4em] text-slate-400 font-mono">Case ID</div>
                    <div className="text-sm font-semibold text-slate-100 font-mono">{agenda.title}</div>
                  </div>
                  {agenda.artCue?.icon && (
                    <img
                      src={agenda.artCue.icon}
                      alt={agenda.artCue.alt ?? 'Clearance stamp'}
                      className="h-16 w-16 opacity-80"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="rounded border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-semibold uppercase tracking-[0.3em]">
                  {agenda.headline}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-slate-300 font-mono">
                  <span className="font-semibold text-slate-100">Issue Theme</span>
                  <span>{agenda.issueTheme}</span>
                </div>
                <div className="text-sm font-mono text-slate-300 leading-relaxed">
                  {agenda.description}
                </div>
                {agenda.pullQuote && (
                  <blockquote className="border-l-2 border-government-blue/60 pl-3 text-sm italic text-slate-300/80">
                    {agenda.pullQuote}
                  </blockquote>
                )}
                <div className="text-xs text-slate-400 font-mono italic">
                  "{agenda.flavorText}"
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-white">
                <div className="space-y-1">
                  <div className="text-[12px] uppercase tracking-[0.4em] text-secret-red font-bold">{agenda.operationName}</div>
                  <div className="text-2xl font-black uppercase leading-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.45)]">
                    {agenda.headline}
                  </div>
                  <div className="text-sm uppercase tracking-[0.3em] text-orange-200/80 font-semibold">
                    {agenda.issueTheme}
                  </div>
                </div>
                <div className="text-sm text-rose-100/90 font-mono leading-relaxed">
                  {agenda.description}
                </div>
                <blockquote className="border-l-4 border-secret-red/70 pl-3 text-base italic text-amber-100/90">
                  {agenda.pullQuote ?? agenda.flavorText}
                </blockquote>
                <div className="text-xs text-rose-200/80 font-mono">
                  "{agenda.flavorText}"
                </div>
              </div>
            )}

            {renderStageCards()}

            {renderProgressBar()}

            {agenda.completed && (
              <div
                className={`text-xs text-center font-bold animate-pulse ${
                  isGovernmentAgenda ? 'text-government-blue' : 'text-secret-red'
                }`}
              >
                *** OBJECTIVE COMPLETE ***
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glitch effect overlay - only when expanded */}
      {isExpanded && (
        <div className={`absolute inset-0 pointer-events-none ${isGovernmentAgenda ? 'opacity-10' : 'opacity-20'}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`absolute h-px ${isGovernmentAgenda ? 'bg-government-blue' : 'bg-secret-red'}`}
              style={{
                width: '100%',
                top: `${30 + i * 20}%`,
                animation: `glitch ${0.5 + i * 0.2}s infinite alternate`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default SecretAgenda;