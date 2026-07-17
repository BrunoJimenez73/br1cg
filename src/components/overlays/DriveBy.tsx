// ──────────────────────────────────────────────
// br1cg — Drive-By Effect
// Texto que cruza la pantalla rápidamente
// ──────────────────────────────────────────────

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useWebSocket } from '../../lib/ws-client';

interface DriveByConfig {
  message: string;
  fontSize: number;
  speed: number; // segundos en cruzar
  textColor: string;
  bgColor: string;
  direction: 'left' | 'right';
  yPosition: number; // px desde arriba
  repeat: boolean;
  repeatDelay: number;
}

interface DriveByProps {
  config?: Partial<DriveByConfig>;
  overlayId?: string;
}

export function DriveBy({ config: initialConfig, overlayId }: DriveByProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [trigger, setTrigger] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergedConfig = useMemo<DriveByConfig>(() => {
    const base: DriveByConfig = {
      message: '✨ ¡Gracias por el apoyo! ✨',
      fontSize: 36,
      speed: 4,
      textColor: '#ffffff',
      bgColor: 'transparent',
      direction: 'left',
      yPosition: 200,
      repeat: false,
      repeatDelay: 3000,
    };
    return { ...base, ...initialConfig };
  }, [initialConfig]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command' && msg.action === 'show') {
        const payload = msg.payload as { message?: string };
        setMessage(payload.message || mergedConfig.message);
        setTrigger((t) => t + 1);
        setVisible(true);
      } else if (msg.type === 'command' && msg.action === 'hide') {
        setVisible(false);
      }
    },
  });

  const handleAnimEnd = useCallback(() => {
    if (mergedConfig.repeat) {
      timerRef.current = setTimeout(() => {
        setTrigger((t) => t + 1);
      }, mergedConfig.repeatDelay);
    } else {
      setVisible(false);
    }
  }, [mergedConfig.repeat, mergedConfig.repeatDelay]);

  if (!visible) return null;

  const fromX = mergedConfig.direction === 'left' ? '110%' : '-110%';
  const toX = mergedConfig.direction === 'left' ? '-110%' : '110%';

  return (
    <div style={{
      position: 'absolute',
      top: mergedConfig.yPosition,
      left: 0,
      right: 0,
      height: mergedConfig.fontSize * 1.5,
      overflow: 'hidden',
      backgroundColor: mergedConfig.bgColor,
      pointerEvents: 'none',
      zIndex: 150,
    }}>
      <div
        key={trigger}
        style={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          fontSize: mergedConfig.fontSize,
          fontWeight: 700,
          color: mergedConfig.textColor,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          transform: `translateX(${fromX})`,
          animation: `ol-driveby-${mergedConfig.direction} ${mergedConfig.speed}s linear forwards`,
        }}
        onAnimationEnd={handleAnimEnd}
      >
        {message}
      </div>
    </div>
  );
}
