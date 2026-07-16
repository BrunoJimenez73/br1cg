import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { TickerConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface TickerProps { config?: Partial<TickerConfig>; overlayId?: string; }

export function Ticker({ config: c, overlayId }: TickerProps) {
  const [visible, setVisible] = useState(true);
  const [messages, setMessages] = useState<string[]>(['Noticia de ejemplo — Streaming en vivo']);
  const [scrollPos, setScrollPos] = useState(0);
  const rafRef = useRef(0);

  const cfg = useMemo<TickerConfig>(() => ({
    messages: ['Noticia de ejemplo'],
    speed: 80, separator: '•', bgColor: '#000000', textColor: '#ffffff',
    accentColor: '#3b82f6', fontSize: 18, animation: 'scroll', height: 40,
    position: 'bottom', ...c
  }), [c]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') setVisible(true);
        else if (msg.action === 'hide') setVisible(false);
        else if (msg.action === 'update') {
          const p = msg.payload as Partial<TickerConfig>;
          if (p.messages) setMessages(p.messages);
        }
      }
    },
  });

  const animate = useCallback(() => {
    setScrollPos(prev => {
      const speed = cfg.speed / 60;
      return prev - speed;
    });
    rafRef.current = requestAnimationFrame(animate);
  }, [cfg.speed]);

  useEffect(() => {
    if (cfg.animation === 'scroll') {
      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [cfg.animation, animate]);

  useEffect(() => {
    setMessages(c?.messages || cfg.messages);
  }, [c?.messages]);

  if (!visible) return null;

  const text = (messages.length > 0 ? messages : cfg.messages).join(` ${cfg.separator} `);
  const doubledText = `${text} ${cfg.separator} ${text} ${cfg.separator} `;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: cfg.height,
      backgroundColor: cfg.bgColor, overflow: 'hidden',
      borderTop: `1px solid ${cfg.accentColor}33`,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        backgroundColor: cfg.accentColor,
        padding: '0 12px', height: '100%',
        display: 'flex', alignItems: 'center', zIndex: 1,
        fontSize: 14, fontWeight: 700, color: cfg.bgColor,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}>
        LIVE
      </div>
      <div style={{
        position: 'absolute', left: 80, right: 0,
        fontSize: cfg.fontSize, fontWeight: 500, color: cfg.textColor,
        whiteSpace: 'nowrap', transform: `translateX(${scrollPos}px)`,
      }}>
        {doubledText}
      </div>
    </div>
  );
}

// Preset components
interface TP { messages?: string[]; overlayId?: string; }
export function TickerPrime(p: TP) {
  return <Ticker overlayId={p.overlayId} config={{ messages: p.messages || ['Título'], bgColor: 'transparent', textColor: '#ffffff', accentColor: '#3b82f6', fontSize: 16, height: 36, position: 'top' }} />;
}
export function TickerHeadline(p: TP) {
  return <Ticker overlayId={p.overlayId} config={{ messages: p.messages || ['Breaking News'], bgColor: '#dc2626', textColor: '#ffffff', accentColor: '#991b1b', fontSize: 20, height: 48, position: 'bottom' }} />;
}
export function TickerJuice(p: TP) {
  return <Ticker overlayId={p.overlayId} config={{ messages: p.messages || ['Juicy update'], bgColor: '#000000', textColor: '#22c55e', accentColor: '#22c55e', fontSize: 18, height: 40, position: 'bottom' }} />;
}
export function TickerDusk(p: TP) {
  return <Ticker overlayId={p.overlayId} config={{ messages: p.messages || ['Evening update'], bgColor: '#1e1b4b', textColor: '#c4b5fd', accentColor: '#7c3aed', fontSize: 18, height: 44, position: 'bottom' }} />;
}
export function TickerLithium(p: TP) {
  return <Ticker overlayId={p.overlayId} config={{ messages: p.messages || ['Latest update'], bgColor: '#0f172a', textColor: '#94a3b8', accentColor: '#3b82f6', fontSize: 16, height: 36, position: 'bottom' }} />;
}
