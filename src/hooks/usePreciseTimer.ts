import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { TimerConfig, TimerStatus } from '../lib/types';

export function usePreciseTimer(cfg: Partial<TimerConfig>) {
  const [status, setStatus] = useState<TimerStatus>('stopped');
  const [remaining, setRemaining] = useState(0);
  const [millis, setMillis] = useState(0);
  const cfgRef = useRef(cfg); cfgRef.current = cfg;
  const startTime = useRef(0);
  const initRem = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const total = (cfg.minutes || 0) * 60 + (cfg.seconds || 0);
    setRemaining(cfg.mode === 'countdown' ? total : 0);
    initRem.current = total;
    setMillis(0);
  }, [cfg.minutes, cfg.seconds, cfg.mode]);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTime.current) / 1000;
    if (cfgRef.current.mode === 'countdown') {
      const rem = Math.max(0, initRem.current - elapsed);
      setRemaining(Math.floor(rem));
      setMillis(Math.floor((rem - Math.floor(rem)) * 100));
      if (rem <= 0) { setStatus('completed'); return; }
    } else {
      setRemaining(Math.floor(elapsed));
      setMillis(Math.floor((elapsed - Math.floor(elapsed)) * 100));
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (status === 'running' || status === 'completed') return;
    startTime.current = performance.now() - (initRem.current - remaining) * 1000;
    setStatus('running');
    raf.current = requestAnimationFrame(tick);
  }, [status, remaining, tick]);

  const pause = useCallback(() => { cancelAnimationFrame(raf.current); setStatus('paused'); }, []);

  const reset = useCallback((mn?: number, sc?: number) => {
    cancelAnimationFrame(raf.current);
    const total = mn !== undefined ? mn * 60 + (sc || 0) : initRem.current;
    setRemaining(total); setMillis(0); initRem.current = total; setStatus('stopped');
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const formatted = useMemo(() => {
    const abs = Math.abs(remaining);
    const m = Math.floor(abs / 60), s = abs % 60;
    let base = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    if (cfg.showMillis && cfg.format === 'mm:ss.ms') base += `.${millis.toString().padStart(2, '0')}`;
    return base;
  }, [remaining, millis, cfg.format, cfg.showMillis]);

  return { status, remaining, millis, formatted, start, pause, reset };
}
