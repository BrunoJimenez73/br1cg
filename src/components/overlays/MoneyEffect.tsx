// ──────────────────────────────────────────────
// br1cg — Money Effect Overlay
// Efecto visual de dinero/dólares cayendo
// ──────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { MoneyEffectConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface MoneyEffectProps {
  config?: Partial<MoneyEffectConfig>;
  overlayId?: string;
}

function Particle({ index, color }: { index: number; color: string }) {
  const style = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    fontSize: 16 + Math.random() * 24,
    color,
    opacity: 0.3 + Math.random() * 0.4,
    left: `${Math.random() * 100}%`,
    top: `${-10 - Math.random() * 20}%`,
    animation: `ol-money-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
    transform: `rotate(${Math.random() * 360}deg)`,
    pointerEvents: 'none',
    userSelect: 'none',
  }), [color]);
  return <div style={style}>{['$', '€', '₿', '¢', '₮', '★'][index % 6]}</div>;
}

export function MoneyEffect({ config: initialConfig, overlayId }: MoneyEffectProps) {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState('$0');
  const [label, setLabel] = useState('');
  const [particles, setParticles] = useState<number[]>([]);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergedConfig = useMemo<MoneyEffectConfig>(() => {
    const base: MoneyEffectConfig = {
      amount: '$50',
      currency: 'USD',
      label: 'Nueva donación',
      duration: 5000,
      particleCount: 20,
      bgColor: '#000000',
      textColor: '#22c55e',
      accentColor: '#22c55e33',
    };
    return { ...base, ...initialConfig };
  }, [initialConfig]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command' && msg.action === 'show') {
        const payload = msg.payload as { amount?: string; label?: string; duration?: number };
        setAmount(payload.amount || mergedConfig.amount);
        setLabel(payload.label || mergedConfig.label);
        setParticles(Array.from({ length: mergedConfig.particleCount }, (_, i) => i));
        setVisible(true);

        const duration = payload.duration || mergedConfig.duration;
        if (autoHideRef.current) clearTimeout(autoHideRef.current);
        autoHideRef.current = setTimeout(() => setVisible(false), duration);
      } else if (msg.type === 'command' && msg.action === 'hide') {
        setVisible(false);
      }
    },
  });

  useEffect(() => {
    return () => { if (autoHideRef.current) clearTimeout(autoHideRef.current); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, width: 1920, height: 1080,
      backgroundColor: mergedConfig.bgColor,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 200,
    }}>
      {/* Partículas */}
      {particles.map((i) => (
        <Particle key={i} index={i} color={mergedConfig.accentColor} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          fontSize: 96, fontWeight: 900,
          color: mergedConfig.textColor,
          textShadow: `0 0 40px ${mergedConfig.textColor}44`,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
          animation: 'ol-fade-zoom 0.5s ease-out',
        }}>
          {amount}
        </div>
        {label && (
          <div style={{
            fontSize: 24, fontWeight: 400,
            color: mergedConfig.textColor, opacity: 0.7,
            marginTop: 8,
            animation: 'ol-fade-up 0.5s ease-out 0.2s both',
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos para las partículas (ya definidos en animations.css: ol-money-fall)
