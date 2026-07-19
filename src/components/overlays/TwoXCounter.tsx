// ──────────────────────────────────────────────
// br1cg — 2X Counter / Streak Counter
// 2 estilos: Burst (explosivo), Glide (suave)
// ──────────────────────────────────────────────

import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { TwoXCounterConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface TwoXCounterProps {
  config?: Partial<TwoXCounterConfig>;
  overlayId?: string;
}

const SIZES = { sm: 32, md: 48, lg: 72 };

export function TwoXCounter({ config: initialConfig, overlayId }: TwoXCounterProps) {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(false);
  const prevCountRef = useRef(0);

  const mergedConfig = useMemo<TwoXCounterConfig>(() => {
    const base: TwoXCounterConfig = {
      label: 'KILLS',
      count: 0,
      maxCount: 99,
      style: 'burst',
      bgColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ef4444',
      showMax: true,
      size: 'md',
    };
    return { ...base, ...initialConfig };
  }, [initialConfig]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        switch (msg.action) {
          case 'show': setVisible(true); break;
          case 'hide': setVisible(false); break;
          case 'update': {
            const payload = msg.payload as { count?: number };
            if (payload.count !== undefined) {
              prevCountRef.current = count;
              setCount(payload.count);
              if (payload.count > prevCountRef.current && mergedConfig.style === 'burst') {
                setBurst(true);
                setTimeout(() => setBurst(false), 600);
              }
            }
            break;
          }
        }
      }
    },
  });

  if (!visible) return null;

  const fontSize = SIZES[mergedConfig.size] || SIZES.md;
  const isBurst = mergedConfig.style === 'burst';

  return (
    <div style={{
      position: 'absolute',
      top: 80,
      right: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      backgroundColor: mergedConfig.bgColor,
      padding: '8px 16px',
      borderRadius: 8,
      border: `2px solid ${mergedConfig.accentColor}`,
      transform: burst ? 'scale(1.15)' : 'scale(1)',
      transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{
        fontSize: fontSize * 0.5,
        fontWeight: 800,
        color: mergedConfig.accentColor,
        lineHeight: 1,
        opacity: isBurst ? 1 : 0.8,
      }}>
        2X
      </div>
      <div style={{
        fontSize,
        fontWeight: 900,
        color: mergedConfig.textColor,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        minWidth: '2ch',
        textAlign: 'center',
      }}>
        {count}
      </div>
      <div style={{
        fontSize: fontSize * 0.35,
        fontWeight: 600,
        color: mergedConfig.textColor,
        opacity: 0.6,
        lineHeight: 1,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {mergedConfig.label}
      </div>
      {mergedConfig.showMax && (
        <div style={{
          fontSize: fontSize * 0.3,
          fontWeight: 400,
          color: mergedConfig.textColor,
          opacity: 0.3,
          lineHeight: 1,
        }}>
          / {mergedConfig.maxCount}
        </div>
      )}
    </div>
  );
}

// Presets
export function TwoXCounterBurst({ overlayId }: { overlayId?: string }) {
  return <TwoXCounter overlayId={overlayId} config={{ style: 'burst', label: 'KILLS', accentColor: '#ef4444' }} />;
}

export function TwoXCounterGlide({ overlayId }: { overlayId?: string }) {
  return <TwoXCounter overlayId={overlayId} config={{ style: 'glide', label: 'STREAK', accentColor: '#22c55e' }} />;
}
