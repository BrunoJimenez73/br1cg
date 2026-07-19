import { useEffect, useRef } from 'react';
import type { WSServerMessage } from './types';

const MAX_BACKOFF = 30_000;
const HEARTBEAT_INTERVAL = 30_000;

/**
 * Returns the WebSocket host, handling dev vs production contexts.
 * @returns The hostname:port string for WS connections
 */
function getWSHost(): string {
  if (typeof window === 'undefined') return 'localhost:3001';
  const port = window.location.port;
  return port === '4321' ? 'localhost:3001' : window.location.host;
}

/**
 * Returns the full WebSocket base URL (protocol + host).
 * Uses wss:// for HTTPS, ws:// for HTTP.
 * @returns Complete WebSocket URL base (e.g., 'ws://localhost:3001')
 */
export function getWSBase(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${getWSHost()}`;
}

/**
 * Returns the HTTP base URL, handling dev (Astro) vs production (Bun) contexts.
 * In dev mode (port 4321), proxies to localhost:3001 to avoid CORS issues.
 * @returns The base URL for API requests (e.g., 'http://localhost:3001' or '')
 */
export function getAPIBase(): string {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  const port = window.location.port;
  return port === '4321' ? 'http://localhost:3001' : '';
}

/**
 * React hook for managing a WebSocket connection with auto-reconnect.
 * Features: exponential backoff (1s→30s), heartbeat pings every 30s,
 * automatic reconnection on disconnect, cleanup on unmount.
 *
 * @param overlayId - Optional overlay ID to subscribe to a specific room
 * @param onMessage - Callback invoked for each parsed server message
 * @example
 * ```tsx
 * useWebSocket({
 *   overlayId: 'timer-1',
 *   onMessage: (msg) => {
 *     if (msg.type === 'command' && msg.action === 'show') {
 *       setVisible(true);
 *     }
 *   }
 * });
 * ```
 */
export function useWebSocket({ overlayId, onMessage }: { overlayId?: string; onMessage: (msg: WSServerMessage) => void }) {
  const wsRef = useRef<WebSocket | null>(null);
  const cbRef = useRef(onMessage);
  const retryRef = useRef(1000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unmountedRef = useRef(false);

  cbRef.current = onMessage;

  /** Send raw data over the WebSocket. Returns true if sent, false if not connected. */
  const send = (data: unknown): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  };

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      if (unmountedRef.current) return;

      const url = `${getWSBase()}/ws${overlayId ? `?subscribe=${overlayId}` : ''}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 1000;
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);
          cbRef.current(msg);
        } catch {
          // parse error, ignore
        }
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        wsRef.current = null;
        if (!unmountedRef.current) {
          timerRef.current = setTimeout(() => {
            retryRef.current = Math.min(retryRef.current * 2, MAX_BACKOFF);
            connect();
          }, retryRef.current);
        }
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [overlayId]);

  return { send, isConnected: () => wsRef.current?.readyState === WebSocket.OPEN };
}
