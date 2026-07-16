import { useState, useEffect, useRef } from 'react';
import type { LowerThirdConfig, WSServerMessage } from '../../lib/types';
import { DEFAULTS } from '../../lib/defaults';
import { getWSBase } from '../../lib/ws-client';

export default function LowerThirdOverlay() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const overlayId = params.get('id') || 'lower-1';
  const wsRef = useRef<WebSocket | null>(null);

  const [config, setConfig] = useState<LowerThirdConfig>({
    ...DEFAULTS['lower-third'] as LowerThirdConfig,
    title: params.get('title') || 'Nombre',
    subtitle: params.get('subtitle') || 'Cargo o descripción',
  });

  const [visible, setVisible] = useState(true);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    const ws = new WebSocket(`${getWSBase()}/ws?subscribe=${overlayId}`);

    ws.onmessage = (event) => {
      const msg: WSServerMessage = JSON.parse(event.data);
      if (msg.type === 'command') {
        switch (msg.action) {
          case 'show':
            setConfig(prev => ({ ...prev, ...msg.payload }));
            setAnimClass(getAnimClass(config.animation));
            setVisible(true);
            break;
          case 'hide':
            setAnimClass('animate-fade-out');
            setTimeout(() => setVisible(false), 500);
            break;
          case 'update':
            if (msg.payload && typeof msg.payload === 'object') {
              setConfig(prev => ({ ...prev, ...msg.payload }));
            }
            break;
        }
      }
    };

    ws.onopen = () => {
      wsRef.current = ws;
    };

    setAnimClass(getAnimClass(config.animation));

    return () => ws.close();
  }, [overlayId]);

  function getAnimClass(anim: string): string {
    const map: Record<string, string> = {
      'slide-left': 'animate-slide-left',
      'slide-right': 'animate-slide-right',
      'slide-up': 'animate-slide-up',
      'fade': 'animate-fade-in',
      'pop': 'animate-pop',
      'bounce': 'animate-bounce-in',
    };
    return map[anim] || 'animate-fade-in';
  }

  if (!visible) return null;

  const positionClass = {
    'bottom-left': 'bottom-8 left-8',
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-8 right-8',
    'top-left': 'top-8 left-8',
    'top-center': 'top-8 left-1/2 -translate-x-1/2',
    'top-right': 'top-8 right-8',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className={`absolute ${positionClass[config.position] || 'bottom-8 left-8'} ${animClass}`}
      >
        <div
          className="flex items-center gap-4 px-6 py-4 rounded-r-lg shadow-2xl"
          style={{ backgroundColor: config.bgColor }}
        >
          {config.logoUrl && (
            <img
              src={config.logoUrl}
              alt="logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <div
              className="text-xl font-bold leading-tight"
              style={{ color: config.textColor }}
            >
              {config.title}
            </div>
            {config.subtitle && (
              <div
                className="text-sm opacity-80 mt-0.5"
                style={{ color: config.textColor }}
              >
                {config.subtitle}
              </div>
            )}
          </div>
          <div
            className="w-1 h-12 rounded-full ml-2"
            style={{ backgroundColor: config.accentColor }}
          />
        </div>
      </div>
    </div>
  );
}
