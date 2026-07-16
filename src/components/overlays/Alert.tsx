import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { AlertConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';
interface AlertProps { config?: Partial<AlertConfig>; overlayId?: string; }

export function Alert({ config: c, overlayId }: AlertProps) {
  const [visible, setVisible] = useState(false);
  const [live, setLive] = useState<Partial<AlertConfig>>({});
  const cfg = useMemo<AlertConfig>(() => ({
    message: '¡Alerta!', submessage: '', bgColor: '#1a1a2e', textColor: '#ffffff',
    accentColor: '#ff6b35', fontSize: 48, duration: 5000, animation: 'bounce-in',
    icon: '🔔', ...c, ...live
  }), [c, live]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') {
          if (timerRef.current) clearTimeout(timerRef.current);
          setVisible(true);
          timerRef.current = setTimeout(() => setVisible(false), cfg.duration);
        } else if (msg.action === 'hide') {
          setVisible(false);
          if (timerRef.current) clearTimeout(timerRef.current);
        } else if (msg.action === 'update') {
          setLive(p => ({ ...p, ...msg.payload }));
        }
      }
    },
  });

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, width: 1920, height: 1080,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <div style={{
        backgroundColor: cfg.bgColor, padding: '24px 48px', borderRadius: 12,
        border: `2px solid ${cfg.accentColor}`, textAlign: 'center',
        boxShadow: `0 0 20px ${cfg.accentColor}44`,
        animation: 'ol-bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {cfg.icon && <div style={{ fontSize: 48, marginBottom: 8 }}>{cfg.icon}</div>}
        <div style={{ fontSize: cfg.fontSize, fontWeight: 900, color: cfg.accentColor }}>
          {cfg.message}
        </div>
        {cfg.submessage && (
          <div style={{ fontSize: 20, color: cfg.textColor, opacity: 0.7, marginTop: 4 }}>
            {cfg.submessage}
          </div>
        )}
      </div>
    </div>
  );
}
