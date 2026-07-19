// ──────────────────────────────────────────────
// br1cg — YouTube View Count Overlay
// Contador de viewers en vivo
// ──────────────────────────────────────────────

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { YouTubeViewCountConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface YouTubeViewCountProps {
  config?: Partial<YouTubeViewCountConfig>;
  overlayId?: string;
}

const POSITIONS: Record<string, React.CSSProperties> = {
  'top-right': { top: 20, right: 20 },
  'top-left': { top: 20, left: 20 },
  'bottom-right': { bottom: 80, right: 20 },
  'bottom-left': { bottom: 80, left: 20 },
};

function formatCount(n: number, format: 'compact' | 'full'): string {
  if (format === 'compact') {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  }
  return n.toLocaleString();
}

export function YouTubeViewCount({ config: initialConfig, overlayId }: YouTubeViewCountProps) {
  const [visible, setVisible] = useState(true);
  const [live, setLive] = useState<Partial<YouTubeViewCountConfig>>({});
  const [displayCount, setDisplayCount] = useState(0);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const targetRef = useRef(0);

  const mergedConfig = useMemo<YouTubeViewCountConfig>(() => {
    const base: YouTubeViewCountConfig = {
      count: 0,
      label: 'EN VIVO',
      bgColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ef4444',
      animation: 'pulse',
      format: 'compact',
      position: 'top-right',
    };
    return { ...base, ...initialConfig, ...live };
  }, [initialConfig, live]);

  // Animación de conteo
  useEffect(() => {
    targetRef.current = mergedConfig.count;
    if (mergedConfig.animation !== 'counting') {
      setDisplayCount(mergedConfig.count);
      return;
    }
    const start = displayCount;
    const diff = mergedConfig.count - start;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(start + diff * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [mergedConfig.count, mergedConfig.animation]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') setVisible(true);
        else if (msg.action === 'hide') setVisible(false);
        else if (msg.action === 'update') setLive(p => ({ ...p, ...msg.payload }));
      }
    },
  });

  if (!visible) return null;

  const formatted = formatCount(displayCount, mergedConfig.format);

  return (
    <div style={{
      position: 'absolute',
      ...POSITIONS[mergedConfig.position] || POSITIONS['top-right'],
      backgroundColor: mergedConfig.bgColor,
      padding: '6px 14px',
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 100,
      borderLeft: `3px solid ${mergedConfig.accentColor}`,
    }}>
      {/* Indicador de vivo */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        backgroundColor: mergedConfig.accentColor,
        animation: mergedConfig.animation === 'pulse'
          ? 'ol-pulse-record 1.5s ease-in-out infinite'
          : 'none',
      }} />
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: mergedConfig.textColor,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
      }}>
        {formatted}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: mergedConfig.textColor,
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {mergedConfig.label}
      </div>
    </div>
  );
}

// Preset
export function YTViewCountLive({ overlayId }: { overlayId?: string }) {
  return (
    <YouTubeViewCount
      overlayId={overlayId}
      config={{
        count: 1234,
        label: 'EN VIVO',
        accentColor: '#ef4444',
        animation: 'pulse',
        format: 'compact',
      }}
    />
  );
}
