// ──────────────────────────────────────────────
// br1cg — Overlay Renderer (production)
// Renders elements exactly as the editor does
// ──────────────────────────────────────────────

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from '../../lib/ws-client';

interface OverlayRendererProps {
  type: string;
}

export default function OverlayRenderer({ type }: OverlayRendererProps) {
  const [overlayId, setOverlayId] = useState<string | undefined>();
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [elements, setElements] = useState<Array<Record<string, unknown>>>([]);
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
        .filter((el: Record<string, unknown>) => el.visible !== false)
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          ((a.zIndex as number) || 0) - ((b.zIndex as number) || 0)
        )
        .map((el: Record<string, unknown>) => (
          <ElementRenderer key={String(el.id)} element={el} config={config} overlayId={overlayId} />
        ))
      }
    </div>
  );
}

// ─── Element Renderer ───

function ElementRenderer({ element, config, overlayId }: {
  element: Record<string, unknown>;
  config: Record<string, unknown> | null;
  overlayId?: string;
}) {
  const props = (element.props || {}) as Record<string, unknown>;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x || 0,
    top: element.y || 0,
    width: element.width || 100,
    height: element.height || 40,
    opacity: (element.opacity as number) ?? 1,
    zIndex: (element.zIndex as number) ?? 0,
  };

  switch (element.type) {
    case 'text':
      return <TextElement style={baseStyle} props={props} />;

    case 'image':
      return <ImageElement style={baseStyle} props={props} />;

    case 'shape':
      return <ShapeElement style={baseStyle} props={props} />;

    case 'timer-display':
      return <TimerDisplay style={baseStyle} props={props} config={config} overlayId={overlayId} />;

    case 'score-display':
      return <ScoreDisplay style={baseStyle} props={props} config={config} />;

    default:
      return null;
  }
}

// ─── Text ───

function TextElement({ style, props }: { style: React.CSSProperties; props: Record<string, unknown> }) {
  return (
    <div style={{
      ...style,
      fontFamily: (props.fontFamily as string) || 'Inter, sans-serif',
      fontSize: ((props.fontSize as number) || 16) + 'px',
      fontWeight: (props.fontWeight as number) || 400,
      color: (props.color as string) || '#fff',
      textAlign: (props.textAlign as string) || 'left',
      letterSpacing: ((props.letterSpacing as number) || 0) + 'px',
      lineHeight: (props.lineHeight as number) || 1.4,
      backgroundColor: (props.backgroundColor as string) || 'transparent',
      padding: ((props.padding as number) || 0) + 'px',
      overflow: 'hidden',
      textShadow: (props.textShadow as string) || undefined,
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {(props.text as string) || ''}
    </div>
  );
}

// ─── Image ───

function ImageElement({ style, props }: { style: React.CSSProperties; props: Record<string, unknown> }) {
  if (!props.src) return null;
  return (
    <img src={String(props.src)} alt="" style={{
      ...style,
      objectFit: (props.objectFit as React.CSSProperties['objectFit']) || 'contain',
    }} />
  );
}

// ─── Shape ───

function ShapeElement({ style, props }: { style: React.CSSProperties; props: Record<string, unknown> }) {
  return (
    <div style={{
      ...style,
      backgroundColor: (props.backgroundColor as string) || '#fff',
      borderRadius: ((props.borderRadius as number) || 0) + 'px',
      border: props.borderColor ? `2px solid ${props.borderColor}` : undefined,
      boxShadow: (props.boxShadow as string) || undefined,
    }} />
  );
}

// ─── Timer Display (dynamic) ───

function TimerDisplay({ style, props, config, overlayId }: {
  style: React.CSSProperties;
  props: Record<string, unknown>;
  config: Record<string, unknown> | null;
  overlayId?: string;
}) {
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<'stopped' | 'running' | 'paused' | 'completed'>('stopped');
  const cfgRef = useRef(config);
  const startTimeRef = useRef(0);
  const initRemRef = useRef(0);
  const rafRef = useRef(0);

  cfgRef.current = config;

  // Calculate initial time from config
  useEffect(() => {
    const minutes = (config?.minutes as number) || 0;
    const seconds = (config?.seconds as number) || 0;
    const total = minutes * 60 + seconds;
    setRemaining(config?.mode === 'countdown' ? total : 0);
    initRemRef.current = total;
  }, [config?.minutes, config?.seconds, config?.mode]);

  // Timer tick
  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const cfg = cfgRef.current;
    if (cfg?.mode === 'countdown') {
      const rem = Math.max(0, initRemRef.current - elapsed);
      setRemaining(Math.floor(rem));
      if (rem <= 0) { setStatus('completed'); return; }
    } else {
      setRemaining(Math.floor(elapsed));
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // WebSocket commands
  useWebSocket({
    overlayId,
    onMessage: useCallback((msg: { type: string; event?: string; payload?: Record<string, unknown> }) => {
      if (msg.type === 'event') {
        if (msg.event === 'timer:start' && status !== 'running') {
          startTimeRef.current = performance.now() - (initRemRef.current - remaining) * 1000;
          setStatus('running');
          rafRef.current = requestAnimationFrame(tick);
        } else if (msg.event === 'timer:pause') {
          cancelAnimationFrame(rafRef.current);
          setStatus('paused');
        } else if (msg.event === 'timer:reset') {
          cancelAnimationFrame(rafRef.current);
          const p = cfgRef.current;
          const total = ((p?.minutes as number) || 0) * 60 + ((p?.seconds as number) || 0);
          setRemaining(p?.mode === 'countdown' ? total : 0);
          initRemRef.current = total;
          setStatus('stopped');
        }
      }
    }, [status, remaining, tick]),
  });

  // Format time
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const textColor = (props.color as string) || (config?.textColor as string) || '#22c55e';
  const fontSize = ((props.fontSize as number) || 72) + 'px';

  return (
    <div style={{
      ...style,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      fontWeight: 900,
      fontSize,
      color: textColor,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.04em',
      textShadow: `0 0 12px ${textColor}66`,
    }}>
      {formatted}
    </div>
  );
}

// ─── Score Display (dynamic) ───

function ScoreDisplay({ style, props, config }: {
  style: React.CSSProperties;
  props: Record<string, unknown>;
  config: Record<string, unknown> | null;
}) {
  const team = String(props.team || 'home');
  const teamData = (config?.[team === 'home' ? 'homeTeam' : 'awayTeam'] || {}) as Record<string, unknown>;
  const score = (teamData.score as number) || 0;

  const textColor = (props.color as string) || '#fff';
  const fontSize = ((props.fontSize as number) || 48) + 'px';

  return (
    <div style={{
      ...style,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      fontWeight: 900,
      fontSize,
      color: textColor,
    }}>
      {score}
    </div>
  );
}
