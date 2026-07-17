import React, { useEffect, useRef, useState } from 'react';
import { OVERLAY_COMPONENTS, type ExtendedOverlayType } from './index';

interface OverlayRendererProps {
  type: string;
}

export default function OverlayRenderer({ type }: OverlayRendererProps) {
  const Component = OVERLAY_COMPONENTS[type as ExtendedOverlayType];
  const [overlayId, setOverlayId] = useState<string | undefined>();
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const fetchKeyRef = useRef(0);

  function fetchConfig(id: string) {
    const baseUrl = window.location.port === '4321' ? 'http://localhost:3001' : '';
    const key = ++fetchKeyRef.current;
    fetch(`${baseUrl}/api/overlays/${id}`)
      .then(res => res.json())
      .then(data => {
        // Only apply if this is still the latest request
        if (key !== fetchKeyRef.current) return;
        if (data && data.data) {
          setConfig(data.data);
          // Extract position from first element if available
          if (data.elements && data.elements.length > 0) {
            const el = data.elements[0];
            setPosition({ x: el.x || 0, y: el.y || 0 });
          }
        }
        setLoading(false);
      })
      .catch(() => {
        if (key !== fetchKeyRef.current) return;
        setLoading(false);
      });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setOverlayId(id || undefined);

    if (id) {
      fetchConfig(id);

      // Connect WebSocket to re-fetch on updates
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.port === '4321' ? 'localhost:3001' : window.location.host;
      const ws = new WebSocket(`${protocol}//${host}/ws?subscribe=${id}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Re-fetch on any update/save command from editor
          if (
            msg.type === 'command' &&
            (msg.action === 'update' || msg.action === 'show' || msg.action === 'hide')
          ) {
            fetchConfig(id);
          }
        } catch {
          // ignore malformed messages
        }
      };

      return () => {
        ws.close();
        wsRef.current = null;
      };
    } else {
      setLoading(false);
    }
  }, []);

  if (!Component) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: '100%', color: '#fff', fontSize: 24,
      }}>
        Overlay &quot;{type}&quot; no encontrado
      </div>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute', left: position.x, top: position.y,
      width: 1920, height: 1080, overflow: 'hidden',
    }}>
      <Component overlayId={overlayId} config={config} />
    </div>
  );
}
