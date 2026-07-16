import React, { useMemo, useState } from 'react';
import type { LowerThirdConfig, LowerThirdAnimation } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface LowerThirdProps { config?: Partial<LowerThirdConfig>; overlayId?: string; standalone?: boolean; }
const ANIM_IN: Record<LowerThirdAnimation, string> = { 'slide-left': 'ol-anim-slide-left', 'slide-right': 'ol-anim-slide-right', 'fade': 'ol-anim-fade', 'bounce': 'ol-anim-bounce' };
const ANIM_OUT: Record<LowerThirdAnimation, string> = { 'slide-left': 'ol-anim-out-slide-left', 'slide-right': 'ol-anim-out-slide-right', 'fade': 'ol-anim-out-fade', 'bounce': 'ol-anim-out-bounce' };
const POS: Record<string, string> = { 'bottom-left': 'ol-bottom-left', 'bottom-center': 'ol-bottom-center', 'top-left': 'ol-top-left', 'top-right': 'ol-top-right' };

export function LowerThird({ config: c, overlayId }: LowerThirdProps) {
  const [visible, setVisible] = useState(true);
  const [live, setLive] = useState<Partial<LowerThirdConfig>>({});
  const cfg = useMemo<LowerThirdConfig>(() => ({ title: 'Nombre', subtitle: 'Subtítulo', logoUrl: '', bgColor: '#1a1a2e', textColor: '#ffffff', accentColor: '#ff6b35', animation: 'slide-left', duration: 0, position: 'bottom-left', ...c, ...live }), [c, live]);
  useWebSocket({ overlayId, onMessage: (msg) => { if (msg.type === 'command') { if (msg.action === 'show') { setVisible(true); if (msg.payload && Object.keys(msg.payload).length > 0) setLive(p => ({ ...p, ...msg.payload })); } else if (msg.action === 'hide') setVisible(false); else if (msg.action === 'update') setLive(p => ({ ...p, ...msg.payload })); } } });
  if (!visible) return null;
  const isGlaze = cfg.bgColor.includes('rgba') || cfg.bgColor.includes('0.08');
  const isOnAir = cfg.position === 'top-left' && cfg.accentColor === '#ef4444';
  const isPalladium = cfg.bgColor.includes('gradient');
  const isPrime = cfg.bgColor === 'transparent';
  return (<div className={`ol-lower-third ${POS[cfg.position] || 'ol-bottom-left'} ${isGlaze ? 'ol-glass' : ''}`} style={{ background: isPalladium ? cfg.bgColor : cfg.backgroundColor, backgroundColor: isPalladium ? undefined : cfg.bgColor, color: cfg.textColor, borderLeft: isPrime ? `3px solid ${cfg.accentColor}` : 'none' }}>
    {!isGlaze && !isPrime && <div className="ol-lower-third-bar" style={{ backgroundColor: cfg.accentColor }} />}
    <div className="ol-lower-third-content" style={{ paddingTop: isPrime ? 16 : undefined }}>
      {isOnAir && <div className="ol-onair-dot" style={{ backgroundColor: cfg.accentColor }} />}
      {cfg.logoUrl && <img className="ol-lower-third-logo" src={cfg.logoUrl} alt="" />}
      <div className="ol-lower-third-texts">
        <div className="ol-lower-third-title" style={{ color: isOnAir ? cfg.accentColor : cfg.textColor, fontSize: isOnAir ? 20 : 28 }}>{cfg.title}</div>
        {cfg.subtitle && (<>{isPrime && <div className="ol-lower-third-separator" style={{ backgroundColor: cfg.accentColor, margin: '4px 0' }} />}<div className="ol-lower-third-subtitle" style={{ color: cfg.textColor }}>{cfg.subtitle}</div></>)}
      </div>
    </div>
  </div>);
}
interface PProps { title?: string; subtitle?: string; logoUrl?: string; overlayId?: string; }
export function LTDropzone(p: PProps) { return <LowerThird overlayId={p.overlayId} config={{ title: p.title, subtitle: p.subtitle, logoUrl: p.logoUrl, bgColor: '#1a1a2e', textColor: '#ffffff', accentColor: '#ff6b35', animation: 'slide-left', position: 'bottom-left' }} />; }
export function LTGlaze(p: PProps) { return <LowerThird overlayId={p.overlayId} config={{ title: p.title, subtitle: p.subtitle, logoUrl: p.logoUrl, bgColor: 'rgba(255,255,255,0.08)', textColor: '#ffffff', accentColor: '#7c3aed', animation: 'fade', position: 'bottom-left' }} />; }
export function LTOnAir(p: PProps) { return <LowerThird overlayId={p.overlayId} config={{ title: p.title, subtitle: p.subtitle, logoUrl: p.logoUrl, bgColor: '#000000', textColor: '#ffffff', accentColor: '#ef4444', animation: 'slide-right', position: 'top-left' }} />; }
export function LTPrime(p: PProps) { return <LowerThird overlayId={p.overlayId} config={{ title: p.title, subtitle: p.subtitle, logoUrl: p.logoUrl, bgColor: 'transparent', textColor: '#ffffff', accentColor: '#3b82f6', animation: 'slide-left', position: 'bottom-left' }} />; }
export function LTPalladium(p: PProps) { return <LowerThird overlayId={p.overlayId} config={{ title: p.title, subtitle: p.subtitle, logoUrl: p.logoUrl, bgColor: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', textColor: '#0f172a', accentColor: '#64748b', animation: 'fade', position: 'bottom-left' }} />; }
