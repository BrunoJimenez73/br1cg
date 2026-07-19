import { useState, useMemo, useRef, useEffect } from 'react';
import { useWebSocket } from '../lib/ws-client';

export interface OverlayLifecycleOptions<T> {
  defaults: T;
  props?: Partial<T>;
  overlayId?: string;
  initialVisible?: boolean;
  autoHideMs?: number;
  onCommand?: (mergedConfig: T) => void;
}

export function useOverlayLifecycle<T extends Record<string, unknown>>({
  defaults,
  props,
  overlayId,
  initialVisible = true,
  autoHideMs,
  onCommand,
}: OverlayLifecycleOptions<T>) {
  const [visible, setVisible] = useState(initialVisible);
  const [live, setLive] = useState<Partial<T>>({});
  const cfg = useMemo<T>(() => ({ ...defaults, ...props, ...live }) as T, [defaults, props, live]);
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;
  const autoHideRef = useRef(autoHideMs);
  autoHideRef.current = autoHideMs;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') {
          if (timerRef.current) clearTimeout(timerRef.current);
          setVisible(true);
          const ms = autoHideRef.current;
          if (ms && ms > 0) {
            timerRef.current = setTimeout(() => setVisible(false), ms);
          }
        } else if (msg.action === 'hide') {
          if (timerRef.current) clearTimeout(timerRef.current);
          setVisible(false);
        } else if (msg.action === 'update') {
          const merged = { ...defaults, ...props, ...live, ...msg.payload } as T;
          setLive(merged as Partial<T>);
          onCommandRef.current?.(merged);
        }
      }
    },
  });

  return { visible, cfg, live };
}
