import React, { useState, useEffect, useMemo } from 'react';
import type { TimerConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';
import { usePreciseTimer } from '../../hooks/usePreciseTimer';

interface TimerProps { config?: Partial<TimerConfig>; overlayId?: string; }

export function Timer({ config: c, overlayId }: TimerProps) {
  const [visible, setVisible] = useState(true);
  const [liveConfig, setLiveConfig] = useState<Partial<TimerConfig>>(c || {});
  const cfg = useMemo<TimerConfig>(() => ({
    minutes: 5, seconds: 0, mode: 'countdown', format: 'mm:ss',
    autoStart: false, bgColor: 'transparent', textColor: '#22c55e',
    fontSize: '72px', showMillis: false, onComplete: 'stop', ...c, ...liveConfig
  }), [c, liveConfig]);
  const { status, formatted, start, pause, reset } = usePreciseTimer(cfg);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') setVisible(true);
        else if (msg.action === 'hide') setVisible(false);
        else if (msg.action === 'update') {
          const p = msg.payload as Partial<TimerConfig>;
          // Update live config with new values
          setLiveConfig(prev => ({ ...prev, ...p }));
        }
      } else if (msg.type === 'event') {
        if (msg.event === 'timer:start') start();
        else if (msg.event === 'timer:pause') pause();
        else if (msg.event === 'timer:reset') {
          const d = msg.data as { minutes?: number; seconds?: number };
          if (d?.minutes !== undefined || d?.seconds !== undefined) {
            setLiveConfig(prev => ({ ...prev, minutes: d.minutes ?? prev.minutes, seconds: d.seconds ?? prev.seconds }));
          }
          reset();
        }
      }
    },
  });

  useEffect(() => { if (cfg.autoStart) start(); }, []);

  if (!visible) return null;

  const isCircular = cfg.format === 'circular';
  if (isCircular) {
    const total = cfg.minutes * 60 + cfg.seconds || 300;
    const progress = (status === 'completed' ? total : 0) / total;
    return (
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
      }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="ol-timer-circular">
            <svg className="ol-timer-circular-progress" viewBox="0 0 120 120">
              <circle className="ol-timer-circular-bg" cx="60" cy="60" r="54" stroke="#1a1a2e" strokeWidth="4" fill="none" />
              <circle cx="60" cy="60" r="54" stroke={cfg.textColor} strokeWidth="4" fill="none"
                strokeDasharray="339.29" strokeDashoffset={339.29 * (1 - progress)}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.1s linear' }} />
            </svg>
            <div className="ol-timer-circular-text">
              <span className="ol-timer-circular-time" style={{ color: cfg.textColor, fontSize: cfg.fontSize }}>{formatted}</span>
              <span className="ol-timer-circular-label" style={{ color: cfg.textColor }}>TIMING</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isNitrogen = cfg.textColor === '#f97316' || cfg.textColor === '#22c55e';
  const isLithium = cfg.textColor === '#3b82f6' || cfg.textColor === '#94a3b8';

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
    }}>
      {isNitrogen && (
        <>
          <div className="ol-timer-corner" style={{ top: '50%', left: 'calc(50% - 200px)', borderColor: cfg.textColor }} />
          <div className="ol-timer-corner ol-timer-corner-r" style={{ top: '50%', right: 'calc(50% - 200px)', borderColor: cfg.textColor }} />
          <div className="ol-timer-corner" style={{ bottom: '50%', left: 'calc(50% - 200px)', borderColor: cfg.textColor }} />
          <div className="ol-timer-corner ol-timer-corner-r" style={{ bottom: '50%', right: 'calc(50% - 200px)', borderColor: cfg.textColor }} />
        </>
      )}
      <div style={{ position: 'absolute', left: 0, top: 0 }}>
        {isLithium && <div className="ol-timer-line" style={{ backgroundColor: cfg.textColor }} />}
        <div style={{
          fontSize: cfg.fontSize, fontFamily: 'monospace', fontWeight: 900,
          color: cfg.textColor, fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.04em', textShadow: `0 0 12px ${cfg.textColor}66`,
          animation: status === 'completed' ? 'ol-pulse-record 1s ease-in-out infinite' : 'none',
        }}>
          {formatted}
        </div>
      </div>
    </div>
  );
}
