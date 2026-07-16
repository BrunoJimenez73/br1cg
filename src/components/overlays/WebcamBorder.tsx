import React, { useState, useMemo } from 'react';
import type { WebcamBorderConfig, WebcamBorderStyle } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';
interface WebcamBorderProps { config?: Partial<WebcamBorderConfig>; overlayId?: string; }

export function WebcamBorder({ config: c, overlayId }: WebcamBorderProps) {
  const [visible, setVisible] = useState(true);
  const cfg = useMemo<WebcamBorderConfig>(() => ({
    width: 320, height: 240, borderRadius: 8, borderWidth: 2,
    borderColor: '#3b82f6', bgColor: '#0f172a', glowColor: '#3b82f633',
    showName: true, playerName: 'Player', style: 'minimal', position: 'bottom-right', ...c
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

  if (cfg.style === 'arc-raiders') {
    return (
      <div style={{ position: 'absolute', ...posStyle, width: cfg.width, height: cfg.height }}>
        <div style={{ position: 'absolute', inset: -3, clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)', backgroundColor: cfg.borderColor, zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: cfg.bgColor, clipPath: 'polygon(0 0, 100% 0, 100% 84.5%, 84.5% 100%, 0 100%)', zIndex: 1 }}>
          <div className="ol-webcam-gradient" />
        </div>
        {cfg.showName && (
          <div style={{ position: 'absolute', bottom: 10, left: 16, zIndex: 2, color: cfg.borderColor, fontWeight: 900, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {cfg.playerName}
          </div>
        )}
      </div>
    );
  }

  if (cfg.style === 'sci-fi') {
    return (
      <div style={{ position: 'absolute', ...posStyle, width: cfg.width, height: cfg.height, clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: cfg.bgColor, zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, border: `2px solid ${cfg.borderColor}`, clipPath: 'inherit', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: cfg.accentColor, zIndex: 2 }} />
        {cfg.showName && (
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, color: cfg.borderColor, fontFamily: 'monospace', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {'>'} {cfg.playerName}
          </div>
        )}
      </div>
    );
  }

  if (cfg.style === 'fortnite') {
    return (
      <div style={{ position: 'absolute', ...posStyle, width: cfg.width, height: cfg.height, border: `2px solid ${cfg.borderColor}`, borderRadius: cfg.borderRadius, backgroundColor: cfg.bgColor, overflow: 'hidden' }}>
        {cfg.showName && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 12px', background: `linear-gradient(transparent, ${cfg.bgColor})`, color: '#ffffff', fontWeight: 800, fontSize: 14, textShadow: `1px 1px 0 ${cfg.borderColor}, -1px -1px 0 ${cfg.borderColor}` }}>
            {cfg.playerName}
          </div>
        )}
      </div>
    );
  }

  // Minimal
  return (
    <div style={{
      position: 'absolute', ...posStyle,
      width: cfg.width, height: cfg.height,
      border: `${cfg.borderWidth}px solid ${cfg.borderColor}`,
      borderRadius: cfg.borderRadius, backgroundColor: cfg.bgColor,
      boxShadow: `0 0 12px ${cfg.glowColor}`,
    }}>
      {cfg.showName && (
        <div style={{ position: 'absolute', bottom: 4, left: 8, color: cfg.borderColor, fontWeight: 700, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {cfg.playerName}
        </div>
      )}
    </div>
  );
}

interface WP { name?: string; overlayId?: string; }
export function WBMinimal(p: WP) { return <WebcamBorder overlayId={p.overlayId} config={{ playerName: p.name || 'Player', style: 'minimal', borderColor: '#3b82f6', borderRadius: 8 }} />; }
export function WBArcRaiders(p: WP) { return <WebcamBorder overlayId={p.overlayId} config={{ playerName: p.name || 'Player', style: 'arc-raiders', borderColor: '#00d4aa' }} />; }
export function WBSciFi(p: WP) { return <WebcamBorder overlayId={p.overlayId} config={{ playerName: p.name || 'Player', style: 'sci-fi', borderColor: '#00ff00', accentColor: '#00ff00' }} />; }
export function WBFortnite(p: WP) { return <WebcamBorder overlayId={p.overlayId} config={{ playerName: p.name || 'Player', style: 'fortnite', borderColor: '#3b82f6' }} />; }
