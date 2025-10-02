import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAgendasByFaction, type SecretAgenda } from '@/data/agendaDatabase';

interface SecretAgendaModalProps {
  open: boolean;
  faction: 'government' | 'truth';
  onConfirm: (agendaId: string | null) => void;
  onCancel: () => void;
}

const difficultyTone: Record<SecretAgenda['difficulty'], string> = {
  easy: 'bg-emerald-600/20 text-emerald-600 border-emerald-600/40',
  medium: 'bg-amber-500/20 text-amber-600 border-amber-500/40',
  hard: 'bg-rose-500/20 text-rose-600 border-rose-500/40',
  legendary: 'bg-purple-600/20 text-purple-600 border-purple-600/40',
};

export const SecretAgendaModal = ({ open, faction, onConfirm, onCancel }: SecretAgendaModalProps) => {
  const agendas = useMemo(() => getAgendasByFaction(faction), [faction]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedAgendaId(null);
      return;
    }

    setSelectedAgendaId(null);
  }, [open, faction]);

  const handleConfirm = () => {
    if (!selectedAgendaId) {
      return;
    }
    onConfirm(selectedAgendaId);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-3xl gap-6 border-4 border-black bg-[var(--paper)] p-0 text-[var(--ink)]"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="space-y-2 border-b-4 border-black bg-black/5 px-6 py-4 text-left">
          <DialogTitle className="text-2xl font-black uppercase tracking-wide">
            Select Your Secret Agenda
          </DialogTitle>
          <DialogDescription className="text-sm font-mono uppercase tracking-[0.2em] text-black/60">
            Choose a classified objective or skip to receive a random dossier.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <ScrollArea className="max-h-[360px] pr-3">
            <div className="grid gap-3 py-4">
              {agendas.map(agenda => (
                <button
                  key={agenda.id}
                  type="button"
                  onClick={() => setSelectedAgendaId(agenda.id)}
                  className={clsx(
                    'flex w-full flex-col gap-2 rounded border-2 bg-white p-4 text-left transition',
                    'hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-secret-red/40',
                    selectedAgendaId === agenda.id
                      ? 'border-secret-red shadow-lg'
                      : 'border-black/40 hover:border-secret-red/60'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-black/60">
                        Operation
                      </p>
                      <h3 className="text-xl font-black uppercase tracking-tight text-black">
                        {agenda.title}
                      </h3>
                    </div>
                    <span
                      className={clsx(
                        'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]',
                        difficultyTone[agenda.difficulty]
                      )}
                    >
                      {agenda.difficulty}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-black/80">{agenda.headline}</p>
                  <p className="text-sm text-black/70">{agenda.description}</p>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              onClick={handleConfirm}
              disabled={!selectedAgendaId}
              className="w-full border-2 border-black bg-secret-red text-white hover:bg-secret-red/90 sm:w-auto"
            >
              Confirm Selection
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="w-full border-2 border-black bg-white text-black hover:bg-black/5 sm:w-auto"
            >
              Assign Random Agenda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecretAgendaModal;
