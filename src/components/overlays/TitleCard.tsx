// ──────────────────────────────────────────────
// br1cg — Title Card Overlay
// Pantalla completa con título + subtítulo + fondo
// ──────────────────────────────────────────────

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { TitleCardConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface TitleCardProps {
  config?: Partial<TitleCardConfig>;
  overlayId?: string;
}

export function TitleCard({ config: c, overlayId }: TitleCardProps) {
  const [visible, setVisible] = useState(false);
  const [live, setLive] = useState<Partial<TitleCardConfig>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cfg = useMemo<TitleCardConfig>(() => ({
    title: 'Título',
    subtitle: 'Subtítulo',
    bgImage: '',
    bgColor: '#0f172a',
    overlayColor: 'rgba(0,0,0,0.6)',
    textColor: '#ffffff',
    animation: 'fade',
    duration: 5000,
    fullscreen: true,
    ...c,
    ...live,
  }), [c, live]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') {
          if (timerRef.current) clearTimeout(timerRef.current);
          setVisible(true);
          if (cfg.duration > 0) {
            timerRef.current = setTimeout(() => setVisible(false), cfg.duration);
          }
        } else if (msg.action === 'hide') {
          setVisible(false);
          if (timerRef.current) clearTimeout(timerRef.current);
        } else if (msg.action === 'update') {
          setLive(p => ({ ...p, ...msg.payload }));
        }
      }
    },
  });

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!visible) return null;

  const animStyles: React.CSSProperties =
    cfg.animation === 'zoom'
      ? { animation: 'ol-zoom-in 0.5s ease-out' }
      : cfg.animation === 'slide-up'
        ? { animation: 'ol-slide-up 0.5s ease-out' }
        : { animation: 'ol-fade-in 0.5s ease-out' };

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        width: 1920, height: 1080,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: cfg.bgColor,
        backgroundImage: cfg.bgImage ? `url(${cfg.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 200,
        ...animStyles,
      }}
    >
      {cfg.bgImage && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: cfg.overlayColor,
          }}
        />
      )}
      <div
        style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center', padding: '40px 80px',
        }}
      >
        <h1
          style={{
            fontSize: 72, fontWeight: 900,
            color: cfg.textColor, margin: 0,
            lineHeight: 1.1, letterSpacing: '-0.02em',
          }}
        >
          {cfg.title}
        </h1>
        {cfg.subtitle && (
          <p
            style={{
              fontSize: 32, fontWeight: 400,
              color: cfg.textColor, opacity: 0.7,
              marginTop: 16, marginBottom: 0,
            }}
          >
            {cfg.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
