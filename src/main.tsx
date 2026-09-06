import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeExpansions } from '@/data/expansions/state';
import { initializeUiScaleFromStorage } from '@/lib/startupSettings';
import { loadCardPool } from '@/data/cardDatabase';
import { AppErrorBoundary, AppStartup } from '@/components/AppStartup';

const initializeGame = async () => {
  initializeUiScaleFromStorage();
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
