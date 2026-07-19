// ──────────────────────────────────────────────
// br1cg — Be Right Back Overlay
// Pantalla completa de "volvemos en breve"
// 2 estilos: Classic (sólido) + Nursery (animado)
// ──────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import type { BRBConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface BRBProps {
  config?: Partial<BRBConfig>;
  overlayId?: string;
}

const BRB_STYLES: Record<string, BRBConfig> = {
  classic: {
    message: 'VOLVEMOS EN BREVE',
    subtitle: 'La transmisión regresa en unos momentos',
    bgColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#ef4444',
    style: 'classic',
    showTimer: false,
  },
  nursery: {
    message: 'Be Right Back',
    subtitle: 'We\'ll be back shortly',
    bgColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    style: 'nursery',
    showTimer: true,
    timerMinutes: 2,
    timerSeconds: 0,
  },
};

export function BRB({ config: initialConfig, overlayId }: BRBProps) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [liveConfig, setLiveConfig] = useState<Partial<BRBConfig>>({});
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const mergedConfig = useMemo<BRBConfig>(() => {
    const base = BRB_STYLES[initialConfig?.style || 'classic'];
    return { ...base, ...initialConfig, ...liveConfig };
  }, [initialConfig, liveConfig]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        switch (msg.action) {
          case 'show':
            setVisible(true);
            const mins = mergedConfig.timerMinutes || 2;
            const secs = mergedConfig.timerSeconds || 0;
            setCountdown(mins * 60 + secs);
            if (mergedConfig.showTimer) startTimer(mins * 60 + secs);
            break;
          case 'hide':
            setVisible(false);
            if (timerRef.current) clearInterval(timerRef.current);
            break;
          case 'update':
            setLiveConfig((prev) => ({ ...prev, ...msg.payload }));
            break;
        }
      }
    },
  });

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = (total: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let remaining = total;
    timerRef.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  const isNursery = mergedConfig.style === 'nursery';

  if (isNursery) {
    return (
      <div style={{
        position: 'absolute', inset: 0, width: 1920, height: 1080,
        backgroundColor: mergedConfig.bgColor,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Círculos decorativos animados */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          border: `2px solid ${mergedConfig.accentColor}22`,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'ol-fade-zoom 3s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%',
          border: `1px solid ${mergedConfig.accentColor}11`,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'ol-fade-zoom 3s ease-in-out infinite alternate 0.5s',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {mergedConfig.logoUrl && (
            <img src={mergedConfig.logoUrl} alt="logo"
              style={{ height: 80, marginBottom: 32, opacity: 0.6 }} />
          )}
          <div style={{
            fontSize: 72, fontWeight: 800, letterSpacing: '0.05em',
            color: mergedConfig.textColor,
            animation: 'ol-pulse-record 2s ease-in-out infinite',
          }}>
            {mergedConfig.message}
          </div>
          {mergedConfig.subtitle && (
            <div style={{
              fontSize: 24, fontWeight: 300, marginTop: 16,
              color: mergedConfig.textColor, opacity: 0.6,
            }}>
              {mergedConfig.subtitle}
            </div>
          )}
          {mergedConfig.showTimer && (
            <div style={{
              fontSize: 48, fontWeight: 700, marginTop: 24,
              color: mergedConfig.accentColor,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.05em',
            }}>
              {formatTime(countdown)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Classic style
  return (
    <div style={{
      position: 'absolute', inset: 0, width: 1920, height: 1080,
      backgroundColor: mergedConfig.bgColor,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Barra de acento superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        backgroundColor: mergedConfig.accentColor,
      }} />

      {mergedConfig.logoUrl && (
        <img src={mergedConfig.logoUrl} alt="logo"
          style={{ height: 60, marginBottom: 40, opacity: 0.5 }} />
      )}

      {/* Indicador rojo pulsante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          backgroundColor: mergedConfig.accentColor,
          animation: 'ol-pulse-record 1.5s ease-in-out infinite',
        }} />
        <span style={{
          fontSize: 14, fontWeight: 600, letterSpacing: '0.15em',
          color: mergedConfig.accentColor, textTransform: 'uppercase',
        }}>
          En pausa
        </span>
      </div>

      <div style={{
        fontSize: 80, fontWeight: 900, letterSpacing: '0.08em',
        color: mergedConfig.textColor,
      }}>
        {mergedConfig.message}
      </div>

      {mergedConfig.subtitle && (
        <div style={{
          fontSize: 20, fontWeight: 300, marginTop: 20,
          color: mergedConfig.textColor, opacity: 0.5,
          maxWidth: 600, textAlign: 'center',
        }}>
          {mergedConfig.subtitle}
        </div>
      )}

      {/* Barra de acento inferior */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
        backgroundColor: mergedConfig.accentColor,
      }} />
    </div>
  );
}

// Presets
interface BRBPresetProps {
  overlayId?: string;
  logoUrl?: string;
}

export function BRBClassic({ overlayId, logoUrl }: BRBPresetProps) {
  return <BRB overlayId={overlayId} config={{ style: 'classic', logoUrl }} />;
}

export function BRBNursery({ overlayId, logoUrl }: BRBPresetProps) {
  return <BRB overlayId={overlayId} config={{ style: 'nursery', showTimer: true, timerMinutes: 2, logoUrl }} />;
}
