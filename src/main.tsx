import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/tabloid-press.css';
import { initializeExpansions } from '@/data/expansions/state';
import { initializeUiScaleFromStorage } from '@/lib/startupSettings';
import { loadCardPool } from '@/data/cardDatabase';
import { AppErrorBoundary, AppStartup } from '@/components/AppStartup';

const initializeGame = async () => {
  initializeUiScaleFromStorage();
  // Remove only this app's retired bulk caches. Saved games and preferences stay intact.
  if ('caches' in window) {
    void Promise.all(['audio-cache', 'images-cache'].map(name => caches.delete(name))).catch(() => {});
  }
  await Promise.all([loadCardPool(), initializeExpansions()]);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <AppErrorBoundary>
    <AppStartup initialize={initializeGame}><App /></AppStartup>
  </AppErrorBoundary>,
);
