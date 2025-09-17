import { bindTrayInspectHandlers } from '@/bindings/trayInspect';
import { closeInspector } from '@/ui/Inspector';
import {
  UIState,
  setBoardFrozen,
  setPhase,
  setReviewBannerVisible,
} from '@/state/uiState';

let reviewKeyHandler: ((event: KeyboardEvent) => void) | null = null;

function freezeBoardInteractions(freeze: boolean) {
  setBoardFrozen(freeze);
}

function showReviewBanner() {
  setReviewBannerVisible(true);
}

function hideReviewBanner() {
  setReviewBannerVisible(false);
}

function addReviewShortcuts() {
  if (reviewKeyHandler) return;
  if (typeof document === 'undefined') return;

  reviewKeyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && UIState.inspectingCard) {
      closeInspector();
      return;
    }

    if (UIState.phase === 'REVIEW' && /^[1-9]$/.test(event.key)) {
      const index = parseInt(event.key, 10) - 1;
      const elements = document.querySelectorAll<HTMLButtonElement>('.tray .card-mini.me[data-guid]');
      const target = elements[index];
      if (target) {
        target.focus();
        target.click();
      }
    }
  };

  document.addEventListener('keydown', reviewKeyHandler, { passive: true });
}

function removeReviewShortcuts() {
  if (!reviewKeyHandler) return;
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', reviewKeyHandler);
  }
  reviewKeyHandler = null;
}

export function enterReviewPhase() {
  if (UIState.phase === 'REVIEW') return;
  setPhase('REVIEW');
  freezeBoardInteractions(true);
  showReviewBanner();
  bindTrayInspectHandlers();
  addReviewShortcuts();
}

export function continueToNewspaper() {
  if (UIState.phase !== 'REVIEW') return;
  hideReviewBanner();
  freezeBoardInteractions(false);
  setPhase('NEWSPAPER');
  removeReviewShortcuts();
  console.log('Phase: REVIEW → NEWSPAPER (Continue pressed)');
}

export function exitToMainPhase() {
  hideReviewBanner();
  freezeBoardInteractions(false);
  setPhase('MAIN');
  removeReviewShortcuts();
}
