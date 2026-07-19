import React from 'react';
import type { SponsorLogoConfig } from '../../lib/types';
import { useOverlayLifecycle } from '../../hooks/useOverlayLifecycle';
interface SponsorLogoProps { config?: Partial<SponsorLogoConfig>; overlayId?: string; }

const DEFAULTS: SponsorLogoConfig = {
  logoUrl: '', name: 'Sponsor', width: 200, height: 80,
  position: 'bottom-right', bgColor: 'transparent', opacity: 0.8,
};

export function SponsorLogo({ config: c, overlayId }: SponsorLogoProps) {
  const { visible, cfg } = useOverlayLifecycle({ defaults: DEFAULTS, props: c, overlayId });

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
