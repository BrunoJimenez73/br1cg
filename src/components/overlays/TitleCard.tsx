// ──────────────────────────────────────────────
// br1cg — Title Card Overlay
// Pantalla completa con título + subtítulo + fondo
// ──────────────────────────────────────────────

import React from 'react';
import type { TitleCardConfig } from '../../lib/types';
import { useOverlayLifecycle } from '../../hooks/useOverlayLifecycle';

interface TitleCardProps {
  config?: Partial<TitleCardConfig>;
  overlayId?: string;
}

const DEFAULTS: TitleCardConfig = {
  title: 'Título',
  subtitle: 'Subtítulo',
  bgImage: '',
  bgColor: '#0f172a',
  overlayColor: 'rgba(0,0,0,0.6)',
  textColor: '#ffffff',
  animation: 'fade',
  duration: 5000,
  fullscreen: true,
};

export function TitleCard({ config: c, overlayId }: TitleCardProps) {
  const { visible, cfg } = useOverlayLifecycle({
    defaults: DEFAULTS, props: c, overlayId,
    initialVisible: false,
    autoHideMs: c?.duration,
  });

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
