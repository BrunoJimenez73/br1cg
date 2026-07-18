// ──────────────────────────────────────────────
// br1cg — Overlay Renderer (production)
// Renders elements exactly as the editor does
// ──────────────────────────────────────────────

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from '../../lib/ws-client';
import type { OverlayElement } from '../../lib/types';
import SharedElementRenderer from './SharedElementRenderer';

interface OverlayRendererProps {
  type: string;
}

export default function OverlayRenderer({ type }: OverlayRendererProps) {
  const [overlayId, setOverlayId] = useState<string | undefined>();
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const fetchKeyRef = useRef(0);

  const fetchConfig = useCallback((id: string) => {
    const baseUrl = window.location.port === '4321' ? 'http://localhost:3001' : '';
    const key = ++fetchKeyRef.current;
    fetch(`${baseUrl}/api/overlays/${id}`)
      .then(res => res.json())
      .then(data => {
        if (key !== fetchKeyRef.current) return;
        if (data) {
          setConfig(data.data || {});
          setElements(data.elements || []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (key !== fetchKeyRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setOverlayId(id || undefined);

    if (id) {
      fetchConfig(id);
    } else {
      setLoading(false);
    }
  }, [fetchConfig]);

  // WebSocket for live updates + visibility
  useWebSocket({
    overlayId,
    onMessage: useCallback((msg: { type: string; action?: string; payload?: Record<string, unknown> }) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') setVisible(true);
        else if (msg.action === 'hide') setVisible(false);
        else if (msg.action === 'update' && overlayId) {
          fetchConfig(overlayId);
        }
      }
    }, [overlayId, fetchConfig]),
  });

  if (loading || !visible) return null;

  return (
    <div style={{
      width: 1920, height: 1080, overflow: 'hidden',
      position: 'relative', backgroundColor: 'transparent',
    }}>
      {elements
        .filter(el => el.visible)
        .sort((a, b) => ((a.zIndex as number) || 0) - ((b.zIndex as number) || 0))
        .map(el => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x || 0,
              top: el.y || 0,
              width: el.width || 100,
              height: el.height || 40,
              opacity: (el.opacity as number) ?? 1,
              zIndex: (el.zIndex as number) ?? 0,
            }}
          >
            <SharedElementRenderer element={el} fillParent />
          </div>
        ))
      }
    </div>
  );
}
