import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeExpansions } from '@/data/expansions/state';
import { applyUiScale, getStoredUiScale } from '@/state/uiScale';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

applyUiScale(getStoredUiScale());

initializeExpansions()
  .catch(error => {
    console.warn('[EXPANSIONS] Initialization failed', error);
  })
  .finally(() => {
    createRoot(rootElement).render(<App />);
  });
