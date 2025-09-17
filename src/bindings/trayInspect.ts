import { openInspector } from '@/ui/Inspector';
import {
  getTrayCardByGuid,
  getTrayMetaByGuid,
  type InspectSource,
} from '@/state/uiState';

const BOUND_ATTR = 'data-inspect-bound';
const LONG_PRESS_DELAY = 350;

type InspectableElement = HTMLElement & { dataset: DOMStringMap };

function bindElements(root: ParentNode, selector: string, source: InspectSource) {
  if (!('querySelectorAll' in root)) return;

  const elements = Array.from(root.querySelectorAll<InspectableElement>(selector));

  elements.forEach(element => {
    if (element.getAttribute(BOUND_ATTR) === 'true') return;

    const guid = element.dataset.guid;
    if (!guid) return;

    const open = () => {
      const card = getTrayCardByGuid(guid);
      if (!card) return;

      const meta = getTrayMetaByGuid(guid);
      openInspector(card, { source, interactive: false, meta });
    };

    element.addEventListener('click', open);
    addLongPress(element, open);
    element.setAttribute(BOUND_ATTR, 'true');
  });
}

export function bindTrayInspectHandlers(root: ParentNode = document) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  bindElements(root, '.tray .card-mini.me[data-guid]', 'playerTray');
  bindElements(root, '.tray .card-mini.opponent[data-guid]', 'opponentTray');
}

function addLongPress(element: InspectableElement, onLongPress: () => void) {
  let timer: number | null = null;

  const clear = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  element.addEventListener(
    'touchstart',
    () => {
      clear();
      timer = window.setTimeout(() => {
        onLongPress();
      }, LONG_PRESS_DELAY);
    },
    { passive: true }
  );

  ['touchend', 'touchcancel', 'touchmove'].forEach(eventName => {
    element.addEventListener(
      eventName,
      () => {
        clear();
      },
      { passive: true }
    );
  });
}
