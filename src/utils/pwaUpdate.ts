/** Auto-updating workers may already be active by the time the player clicks. */
export async function applyPwaUpdate(
  registration: Pick<ServiceWorkerRegistration, 'waiting'> | null,
  workers: Pick<ServiceWorkerContainer, 'addEventListener' | 'removeEventListener'>,
  reload: () => void,
): Promise<void> {
  const waiting = registration?.waiting;
  if (!waiting) { reload(); return; }
  await new Promise<void>(resolve => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      workers.removeEventListener('controllerchange', finish);
      resolve();
    };
    const timeout = setTimeout(finish, 5000);
    workers.addEventListener('controllerchange', finish);
    try { waiting.postMessage({ type: 'SKIP_WAITING' }); } catch { finish(); }
  });
  reload();
}
