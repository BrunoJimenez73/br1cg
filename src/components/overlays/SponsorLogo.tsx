import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { SponsorLogoConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';
interface SponsorLogoProps { config?: Partial<SponsorLogoConfig>; overlayId?: string; }

export function SponsorLogo({ config: c, overlayId }: SponsorLogoProps) {
  const [visible, setVisible] = useState(true);
  const cfg = useMemo<SponsorLogoConfig>(() => ({
    logoUrl: '', name: 'Sponsor', width: 200, height: 80,
    position: 'bottom-right', bgColor: 'transparent', opacity: 0.8,
    ...c
  }), [c]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') setVisible(true);
        else if (msg.action === 'hide') setVisible(false);
      }
    },
  });

  if (!visible) return null;

  const posStyle: React.CSSProperties = {};
  if (cfg.position?.includes('bottom')) posStyle.bottom = 20;
  if (cfg.position?.includes('top')) posStyle.top = 20;
  if (cfg.position?.includes('right')) posStyle.right = 20;
  if (cfg.position?.includes('left')) posStyle.left = 20;
  if (cfg.position === 'bottom-center' || cfg.position === 'top-center') {
    posStyle.left = '50%'; posStyle.transform = 'translateX(-50%)';
  }

  return (
    <div style={{ position: 'absolute', ...posStyle, opacity: cfg.opacity, zIndex: 50 }}>
      {cfg.logoUrl ? (
        <img src={cfg.logoUrl} alt={cfg.name} style={{ width: cfg.width, height: cfg.height, objectFit: 'contain' }} />
      ) : (
        <div style={{
          width: cfg.width, height: cfg.height, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
          color: 'rgba(255,255,255,0.5)', fontSize: 14,
        }}>
          {cfg.name}
        </div>
      )}
    </div>
  );
}
