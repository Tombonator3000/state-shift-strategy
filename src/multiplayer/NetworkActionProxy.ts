/**
 * NetworkActionProxy — intercepts game actions for multiplayer.
 *
 * When a player is a guest, their store actions are intercepted and
 * forwarded to the host instead of executing locally.
 *
 * When a player is the host, actions execute locally and then broadcast
 * the new state to all guests.
 */

import type { PlayerRole } from './types';

export type ActionInterceptor = (
  action: string,
  payload: Record<string, unknown>,
) => Promise<boolean>;

export interface NetworkActionProxyConfig {
  role: PlayerRole;
  /** Guest: sends action to host */
  sendAction: (action: string, payload: Record<string, unknown>) => Promise<boolean>;
  /** Host: broadcasts state after local execution */
  broadcastState: () => void;
}

/**
 * Create a proxy that wraps game actions for network play.
 *
 * Usage in Index.tsx:
 * ```ts
 * const proxy = createNetworkActionProxy({ role, sendAction, broadcastState });
 *
 * // Instead of: playCard(cardId, targetState)
 * // Do:         proxy.proxyAction('playCard', { cardId, targetState })
 *
 * // Or wrap the original function:
 * const networkPlayCard = proxy.wrap('playCard', playCard);
 * networkPlayCard(cardId, targetState);
 * ```
 */
export function createNetworkActionProxy(config: NetworkActionProxyConfig) {
  const { role, sendAction, broadcastState } = config;

  /**
   * Execute an action through the network layer.
   * - Guest: forward to host
   * - Host: execute locally, then broadcast
   */
  async function proxyAction(
    action: string,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    if (role === 'guest') {
      return sendAction(action, payload);
    }

    // Host: action already executed locally by the caller.
    // We just need to broadcast the resulting state.
    broadcastState();
    return true;
  }

  /**
   * Wrap a local game function so it goes through the network proxy.
   * The wrapped function calls the original for host, or sends to host for guest.
   */
  function wrap<TArgs extends unknown[]>(
    actionName: string,
    localFn: (...args: TArgs) => void,
  ): (...args: TArgs) => Promise<boolean> {
    return async (...args: TArgs) => {
      if (role === 'guest') {
        // Convert args to a payload object
        const payload: Record<string, unknown> = {};
        args.forEach((arg, i) => {
          payload[`arg${i}`] = arg;
        });
        return sendAction(actionName, payload);
      }

      // Host: execute locally, then broadcast
      localFn(...args);
      broadcastState();
      return true;
    };
  }

  return { proxyAction, wrap };
}
