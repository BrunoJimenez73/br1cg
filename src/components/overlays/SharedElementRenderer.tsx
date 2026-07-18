// ──────────────────────────────────────────────
// br1cg — Shared Element Renderer
// Used by both Editor and Overlay for WYSIWYG
// ──────────────────────────────────────────────

import React from 'react';
import type { OverlayElement } from '../../lib/types';

interface SharedElementRendererProps {
  element: OverlayElement;
  /** If true, uses width/height 100% (for Rnd container in editor) */
  fillParent?: boolean;
}

export default function SharedElementRenderer({ element, fillParent = false }: SharedElementRendererProps) {
  const p = element.props;
  const w = fillParent ? '100%' : element.width;
  const h = fillParent ? '100%' : element.height;

  const baseStyle: React.CSSProperties = {
    width: w,
    height: h,
    overflow: 'hidden',
  };

  switch (element.type) {
    case 'text':
      return (
        <div style={{
          ...baseStyle,
          fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
          fontSize: ((p.fontSize as number) || 16) + 'px',
          fontWeight: (p.fontWeight as number) || 400,
          color: (p.color as string) || '#fff',
          textAlign: (p.textAlign as string) || 'left',
          letterSpacing: ((p.letterSpacing as number) || 0) + 'px',
          lineHeight: (p.lineHeight as number) || 1.4,
          backgroundColor: (p.backgroundColor as string) || 'transparent',
          padding: ((p.padding as number) || 0) + 'px',
          textShadow: (p.textShadow as string) || undefined,
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {(p.text as string) || ''}
        </div>
      );

    case 'image':
      return (
        <div style={{ ...baseStyle, overflow: 'hidden' }}>
          {p.src && (
            <img
              src={String(p.src)}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: (p.objectFit as React.CSSProperties['objectFit']) || 'contain',
              }}
            />
          )}
        </div>
      );

    case 'shape':
      return (
        <div style={{
          ...baseStyle,
          backgroundColor: (p.backgroundColor as string) || '#fff',
          borderRadius: ((p.borderRadius as number) || 0) + 'px',
          border: p.borderColor ? `2px solid ${p.borderColor}` : undefined,
          boxShadow: (p.boxShadow as string) || undefined,
        }} />
      );

    case 'timer-display':
      return (
        <div style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: (p.fontFamily as string) || 'monospace',
          fontSize: ((p.fontSize as number) || 72) + 'px',
          color: (p.color as string) || '#22c55e',
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {(p.format as string) === 'mm:ss' ? '05:00' : '00:05:00'}
        </div>
      );

    case 'score-display':
      return (
        <div style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
          fontSize: ((p.fontSize as number) || 36) + 'px',
          color: (p.color as string) || '#fff',
          fontWeight: 900,
        }}>
          0
        </div>
      );

    default:
      return null;
  }
}
