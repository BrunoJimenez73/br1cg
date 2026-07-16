import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerConfig, WSServerMessage } from '../../lib/types';
import { DEFAULTS } from '../../lib/defaults';
import { getWSBase } from '../../lib/ws-client';

export default function TimerOverlay() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const overlayId = params.get('id') || 'timer-1';
  const wsRef = useRef<WebSocket | null>(null);

  const [config, setConfig] = useState<TimerConfig>({
    ...DEFAULTS.timer as TimerConfig,
    minutes: parseInt(params.get('minutes') || '5'),
    seconds: parseInt(params.get('seconds') || '0'),
    mode: (params.get('mode') as TimerConfig['mode']) || 'countdown',
  });

  const [time, setTime] = useState(config.minutes * 60 + config.seconds);
  const [running, setRunning] = useState(config.autoStart);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(`${getWSBase()}/ws?subscribe=${overlayId}`);

    ws.onmessage = (event) => {
      const msg: WSServerMessage = JSON.parse(event.data);
      if (msg.type === 'command') {
        switch (msg.action) {
          case 'show':
            setVisible(true);
            if (msg.payload && typeof msg.payload === 'object') {
              setConfig(prev => ({ ...prev, ...msg.payload }));
              const p = msg.payload as Record<string, unknown>;
              if (p.minutes !== undefined || p.seconds !== undefined) {
                const mins = typeof p.minutes === 'number' ? p.minutes : config.minutes;
                const secs = typeof p.seconds === 'number' ? p.seconds : config.seconds;
                setTime(mins * 60 + secs);
              }
            }
            break;
          case 'hide':
            setVisible(false);
            break;
          case 'update':
            if (msg.payload && typeof msg.payload === 'object') {
              setConfig(prev => ({ ...prev, ...msg.payload }));
            }
            break;
        }
      }
      if (msg.type === 'event') {
        switch (msg.event) {
          case 'timer:start':
            setRunning(true);
            break;
          case 'timer:pause':
            setRunning(false);
            break;
          case 'timer:reset':
            setRunning(false);
            const d = msg.data as Record<string, unknown> || {};
            const mins = typeof d.minutes === 'number' ? d.minutes : config.minutes;
            const secs = typeof d.seconds === 'number' ? d.seconds : config.seconds;
            setTime(mins * 60 + secs);
            break;
        }
      }
    };

    ws.onopen = () => {
      wsRef.current = ws;
    };

    return () => ws.close();
  }, [overlayId]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime(prev => {
        if (config.mode === 'countdown') {
          if (prev <= 0) {
            setRunning(false);
            return 0;
          }
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, config.mode]);

  const formatTime = useCallback((totalSeconds: number): string => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ backgroundColor: config.bgColor }}
    >
      <div
        className="font-mono font-bold tracking-wider"
        style={{
          color: config.textColor,
          fontSize: config.fontSize,
        }}
      >
        {formatTime(time)}
      </div>
    </div>
  );
}
