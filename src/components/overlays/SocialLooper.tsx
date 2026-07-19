// ──────────────────────────────────────────────
// br1cg — Social Looper Overlay
// Redes sociales rotando con animación
// ──────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SocialLooperConfig, SocialAccount } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface SocialLooperProps {
  config?: Partial<SocialLooperConfig>;
  overlayId?: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter: '𝕏',
  youtube: '▶',
  instagram: '📷',
  tiktok: '♫',
  discord: '💬',
  twitch: '📺',
  facebook: 'f',
  web: '🌐',
};

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  'bottom-right': { bottom: 80, right: 40 },
  'bottom-left': { bottom: 80, left: 40 },
  'top-right': { top: 80, right: 40 },
  'top-left': { top: 80, left: 40 },
};

export function SocialLooper({ config: initialConfig, overlayId }: SocialLooperProps) {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveConfig, setLiveConfig] = useState<Partial<SocialLooperConfig>>({});

  const mergedConfig = useMemo<SocialLooperConfig>(() => {
    const base: SocialLooperConfig = {
      accounts: [
        { platform: 'twitter', handle: '@usuario' },
        { platform: 'youtube', handle: '/usuario' },
        { platform: 'instagram', handle: '@usuario' },
      ],
      interval: 4000,
      bgColor: 'rgba(0,0,0,0.6)',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
      animation: 'fade',
      iconSize: 28,
      fontSize: 18,
      position: 'bottom-right',
    };
    return { ...base, ...initialConfig, ...liveConfig };
  }, [initialConfig, liveConfig]);

  const accounts = mergedConfig.accounts;

  // Rotar cada cierto intervalo
  useEffect(() => {
    if (accounts.length <= 1) return;
    const rotate = () => {
      setAnimClass('ol-anim-out-fade');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % accounts.length);
        setAnimClass('ol-anim-fade');
      }, 300);
    };
    timerRef.current = setInterval(rotate, mergedConfig.interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [accounts.length, mergedConfig.interval]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        switch (msg.action) {
          case 'show': setVisible(true); break;
          case 'hide': setVisible(false); break;
          case 'update':
            setLiveConfig((prev) => ({ ...prev, ...msg.payload }));
            break;
        }
      }
    },
  });

  if (!visible || accounts.length === 0) return null;

  const current = accounts[currentIndex];
  const icon = PLATFORM_ICONS[current.platform] || '●';

  return (
    <div style={{
      position: 'absolute',
      ...POSITION_STYLES[mergedConfig.position] || POSITION_STYLES['bottom-right'],
      backgroundColor: mergedConfig.bgColor,
      backdropFilter: 'blur(8px)',
      padding: '10px 18px',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 100,
    }}>
      <div style={{
        fontSize: mergedConfig.iconSize,
        color: mergedConfig.accentColor,
        lineHeight: 1,
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: mergedConfig.fontSize,
        color: mergedConfig.textColor,
        fontWeight: 500,
        lineHeight: 1,
      }}>
        {current.handle}
      </div>
    </div>
  );
}

// Presets
interface SocialLooperPresetProps {
  overlayId?: string;
  handle?: string;
}

export function SocialLooperSociable({ overlayId, handle }: SocialLooperPresetProps) {
  return (
    <SocialLooper
      overlayId={overlayId}
      config={{
        accounts: [
          { platform: 'twitter', handle: handle || '@tu_cuenta' },
          { platform: 'youtube', handle: handle || '/tu_canal' },
          { platform: 'instagram', handle: handle || '@tu_cuenta' },
          { platform: 'tiktok', handle: handle || '@tu_cuenta' },
          { platform: 'discord', handle: handle || 'discord.gg/tuserver' },
        ],
        interval: 4000,
        bgColor: 'rgba(0,0,0,0.7)',
        textColor: '#ffffff',
        accentColor: '#7c3aed',
        animation: 'fade',
        position: 'bottom-right',
      }}
    />
  );
}
