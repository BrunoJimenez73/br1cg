import React, { useEffect, useRef, useState } from 'react';
import { OVERLAY_COMPONENTS, type ExtendedOverlayType } from './index';
import OverlayErrorBoundary from './ErrorBoundary';

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

  const [elements, setElements] = useState<Array<Record<string, unknown>>>([]);

  function fetchConfig(id: string) {
    const baseUrl = window.location.port === '4321' ? 'http://localhost:3001' : '';
    const key = ++fetchKeyRef.current;
    fetch(`${baseUrl}/api/overlays/${id}`)
      .then(res => res.json())
      .then(data => {
        if (key !== fetchKeyRef.current) return;
        if (data && data.data) {
          setConfig(data.data);
          if (data.elements && data.elements.length > 0) {
            const el = data.elements[0];
            setPosition({ x: el.x || 0, y: el.y || 0 });
          }
          setElements(data.elements || []);
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
      <OverlayErrorBoundary type={type}>
        <Component overlayId={overlayId} config={config} />
      </OverlayErrorBoundary>
      {/* Render editor elements on top */}
      {elements.filter((el: Record<string, unknown>) => el.visible !== false).map((el: Record<string, unknown>) => (
        <EditorElement key={String(el.id)} element={el} />
      ))}
    </div>
  );
}

/** Renders a single editor element (text, image, shape) */
function EditorElement({ element }: { element: Record<string, unknown> }) {
  const props = (element.props || {}) as Record<string, unknown>;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x || 0,
    top: element.y || 0,
    width: element.width || 100,
    height: element.height || 40,
    opacity: (element.opacity as number) ?? 1,
    zIndex: (element.zIndex as number) ?? 0,
  };

  if (element.type === 'text') {
    return (
      <div style={{
        ...style,
        fontFamily: (props.fontFamily as string) || 'Inter, sans-serif',
        fontSize: ((props.fontSize as number) || 16) + 'px',
        fontWeight: (props.fontWeight as number) || 400,
        color: (props.color as string) || '#fff',
        textAlign: (props.textAlign as string) || 'left',
        lineHeight: (props.lineHeight as number) || 1.4,
        backgroundColor: (props.backgroundColor as string) || 'transparent',
        padding: ((props.padding as number) || 0) + 'px',
        textShadow: (props.textShadow as string) || undefined,
        display: 'flex',
        alignItems: 'center',
      }}>
        {(props.text as string) || ''}
      </div>
    );
  }

  if (element.type === 'image' && props.src) {
    return (
      <img src={String(props.src)} alt="" style={{ ...style, objectFit: 'contain' }} />
    );
  }

  if (element.type === 'shape') {
    return (
      <div style={{
        ...style,
        backgroundColor: (props.backgroundColor as string) || '#fff',
        borderRadius: ((props.borderRadius as number) || 0) + 'px',
        border: props.borderColor ? `2px solid ${props.borderColor}` : undefined,
      }} />
    );
  }

  return null;
}
