import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clearManifest, subscribeToManifest } from '@/services/assets/AssetResolver';
import type { ManifestEntry } from '@/services/assets/types';

const scopeLabels: Record<ManifestEntry['scope'], string> = {
  card: 'Card',
  event: 'Event',
  article: 'Article',
};

const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleString();

const AssetAuditPanel = () => {
  const [entries, setEntries] = useState<ManifestEntry[]>([]);
  const [activeScope, setActiveScope] = useState<ManifestEntry['scope'] | 'all'>('all');

  useEffect(() => {
    const unsubscribe = subscribeToManifest(setEntries);
    return () => unsubscribe?.();
  }, []);

  const filteredEntries = useMemo(() => {
    if (activeScope === 'all') {
      return entries;
    }
    return entries.filter(entry => entry.scope === activeScope);
  }, [activeScope, entries]);

  const counts = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc[entry.scope] = (acc[entry.scope] ?? 0) + 1;
        return acc;
      },
      { card: 0, event: 0, article: 0 } as Record<ManifestEntry['scope'], number>,
    );
  }, [entries]);

  return (
    <Card className="bg-background/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Asset Autofill Audit</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge
            variant={activeScope === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveScope('all')}
            className="cursor-pointer"
          >
            All {entries.length}
          </Badge>
          {(['card', 'event', 'article'] as const).map(scope => (
            <Badge
              key={scope}
              variant={activeScope === scope ? 'default' : 'outline'}
              onClick={() => setActiveScope(scope)}
              className="cursor-pointer"
            >
              {scopeLabels[scope]} {counts[scope] ?? 0}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
          <span>Persistent manifest of resolved assets.</span>
          <Button variant="ghost" size="sm" onClick={() => clearManifest()}>
            Clear all
          </Button>
        </div>
        <ScrollArea className="h-64 rounded-md border border-border/40">
          <div className="divide-y divide-border/40 text-xs">
            {filteredEntries.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">No assets recorded yet.</div>
            )}
            {filteredEntries.map(entry => (
              <div key={entry.key} className="grid gap-1 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.locked ? 'default' : 'outline'}>{scopeLabels[entry.scope]}</Badge>
                    <span className="font-semibold text-foreground">{entry.provider}</span>
                  </div>
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {formatTimestamp(entry.updatedAt)}
                  </span>
                </div>
                <div className="truncate text-muted-foreground">{entry.url}</div>
                {entry.credit && <div className="text-foreground">Credit: {entry.credit}</div>}
                {entry.license && <div className="text-muted-foreground">License: {entry.license}</div>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AssetAuditPanel;
