import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';

function StartupNotice({ failed, slow = false }: { failed: boolean; slow?: boolean }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-neutral-950 p-6 text-neutral-950">
      <section className="w-full max-w-lg rounded border-4 border-neutral-700 bg-[#f5f2eb] p-6 shadow-xl sm:p-10" aria-labelledby="startup-title">
        <p className="mb-3 text-sm font-bold tracking-widest">PARANOID TIMES</p>
        <h1 id="startup-title" className="mb-4 font-serif text-3xl font-bold">
          {failed ? 'The newsroom hit a problem' : 'Opening the newsroom'}
        </h1>
        <p role={failed ? 'alert' : 'status'} className="leading-relaxed">
          {failed
            ? 'The game could not continue. Reload the page to try again.'
            : slow
              ? 'Loading is taking longer than expected. Check your connection, or reload to try again.'
              : 'Loading cards and expansions…'}
        </p>
        {(failed || slow) && (
          <button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 rounded bg-red-800 px-5 py-3 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-800">
            Reload game
          </button>
        )}
      </section>
    </main>
  );
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App] Rendering failed', error, info.componentStack);
  }

  render() {
    return this.state.failed ? <StartupNotice failed /> : this.props.children;
  }
}

export function AppStartup({ initialize, children }: { initialize: () => Promise<unknown>; children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setSlow(false);
    const slowTimer = setTimeout(() => { if (active) setSlow(true); }, 8000);

    // Promise.resolve also routes a synchronous initializer failure to the UI.
    Promise.resolve().then(initialize).then(
      () => { if (active) setStatus('ready'); },
      error => {
        console.error('[App] Initialization failed', error);
        if (active) setStatus('failed');
      },
    ).finally(() => clearTimeout(slowTimer));

    return () => {
      active = false;
      clearTimeout(slowTimer);
    };
  }, [initialize]);

  return status === 'ready' ? children : <StartupNotice failed={status === 'failed'} slow={slow} />;
}
