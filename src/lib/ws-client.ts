import { useEffect, useRef } from 'react';
import type { WSServerMessage } from './types';

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
  cbRef.current = onMessage;

  useEffect(() => {
    const url = `${getWSBase()}/ws${overlayId ? `?subscribe=${overlayId}` : ''}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);
        cbRef.current(msg);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onerror = () => {};
    ws.onclose = () => {};

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [overlayId]);
}
