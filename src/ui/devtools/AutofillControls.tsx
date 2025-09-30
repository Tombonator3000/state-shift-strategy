import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { featureFlags } from '@/state/featureFlags';
import {
  getManifestEntry,
  getManifestKey,
  resolveImage,
  subscribeToManifest,
  toggleManifestLock,
  updateManifestCredit,
} from '@/services/assets/AssetResolver';
import type { AssetContext, ResolvedAsset } from '@/services/assets/types';
import { cn } from '@/lib/utils';

interface AutofillControlsProps {
  context: AssetContext;
  disabled?: boolean;
  onResolved?: (asset: ResolvedAsset | null) => void;
  className?: string;
}

const AutofillControls = ({ context, disabled = false, onResolved, className }: AutofillControlsProps) => {
  const contextKey = useMemo(() => getManifestKey(context), [context]);
  const [entry, setEntry] = useState(() => getManifestEntry(context));
  const [creditDraft, setCreditDraft] = useState(entry?.credit ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntry(getManifestEntry(context));
  }, [context]);

  useEffect(() => {
    setCreditDraft(entry?.credit ?? '');
  }, [entry?.credit]);

  useEffect(() => {
    if (!contextKey) {
      return undefined;
    }

    return subscribeToManifest(entries => {
      const next = entries.find(item => item.key === contextKey);
      setEntry(next);
    });
  }, [contextKey]);

  const handleRoll = useCallback(async () => {
    if (disabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await resolveImage(context, { forceRefresh: true });
      setEntry(result ? getManifestEntry(context) : null);
      if (result) {
        onResolved?.(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve');
    } finally {
      setIsLoading(false);
    }
  }, [context, disabled, onResolved]);

  const handleLockToggle = useCallback(() => {
    if (!entry || !contextKey) return;
    toggleManifestLock(context, !entry.locked);
  }, [context, contextKey, entry]);

  const handleCreditCommit = useCallback(() => {
    if (!contextKey) return;
    updateManifestCredit(context, creditDraft);
  }, [context, contextKey, creditDraft]);

  if (!featureFlags.autofillCardArt) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-2 flex flex-col gap-2 rounded-md border border-border/40 bg-background/80 p-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoading}
          onClick={handleRoll}
        >
          {isLoading ? 'Rolling…' : 'Roll another'}
        </Button>
        <Button
          variant={entry?.locked ? 'default' : 'outline'}
          size="sm"
          disabled={!entry || disabled}
          onClick={handleLockToggle}
        >
          {entry?.locked ? 'Locked' : 'Lock'}
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Credit</label>
        <Input
          value={creditDraft}
          placeholder="Attribution"
          onChange={event => setCreditDraft(event.target.value)}
          onBlur={handleCreditCommit}
          disabled={disabled}
          className="h-7 text-xs"
        />
      </div>
      {entry && (
        <div className="grid gap-1 text-[10px] text-muted-foreground/80">
          <span className="font-mono uppercase tracking-wide text-muted-foreground">{entry.provider}</span>
          <span>{entry.license ?? 'No license metadata'}</span>
        </div>
      )}
      {error && <div className="text-[10px] text-amber-500">{error}</div>}
    </div>
  );
};

export default AutofillControls;
