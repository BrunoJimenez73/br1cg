import { useEffect, useRef } from 'react';
import type { WSServerMessage } from './types';

const MAX_BACKOFF = 30_000;
const HEARTBEAT_INTERVAL = 30_000;

function getWSHost(): string {
  if (typeof window === 'undefined') return 'localhost:3001';
  const port = window.location.port;
  return port === '4321' ? 'localhost:3001' : window.location.host;
}

export function getWSBase(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${getWSHost()}`;
}

export function useWebSocket({ overlayId, onMessage }: { overlayId?: string; onMessage: (msg: WSServerMessage) => void }) {
  const wsRef = useRef<WebSocket | null>(null);
  const cbRef = useRef(onMessage);
  const retryRef = useRef(1000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unmountedRef = useRef(false);

  cbRef.current = onMessage;

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
}
