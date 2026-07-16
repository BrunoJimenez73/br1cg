// ──────────────────────────────────────────────
// br1cg — Weather Bug Overlay
// Clima con iconos y temperatura
// ──────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useWebSocket } from '../../lib/ws-client';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'partly-cloudy' | 'night';
  city: string;
  unit: 'C' | 'F';
  humidity?: number;
  windSpeed?: number;
}

interface WeatherBugConfig {
  weather: WeatherData;
  bgColor: string;
  textColor: string;
  accentColor: string;
  showDetails: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface WeatherBugProps {
  config?: Partial<WeatherBugConfig>;
  overlayId?: string;
}

const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  'partly-cloudy': '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  windy: '💨',
  night: '🌙',
};

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  'top-right': { top: 20, right: 20 },
  'top-left': { top: 20, left: 20 },
  'bottom-right': { bottom: 80, right: 20 },
  'bottom-left': { bottom: 80, left: 20 },
};

export function WeatherBug({ config: initialConfig, overlayId }: WeatherBugProps) {
  const [visible, setVisible] = useState(true);

  const mergedConfig = useMemo<WeatherBugConfig>(() => {
    const base: WeatherBugConfig = {
      weather: {
        temperature: 22,
        condition: 'sunny',
        city: 'Ciudad',
        unit: 'C',
      },
      bgColor: 'rgba(0,0,0,0.5)',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
      showDetails: false,
      position: 'top-right',
    };
    return { ...base, ...initialConfig };
  }, [initialConfig]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        switch (msg.action) {
          case 'show': setVisible(true); break;
          case 'hide': setVisible(false); break;
        }
      }
    },
  });

  if (!visible) return null;

  const w = mergedConfig.weather;
  const icon = WEATHER_ICONS[w.condition] || '🌤️';

  return (
    <div style={{
      position: 'absolute',
      ...POSITION_STYLES[mergedConfig.position] || POSITION_STYLES['top-right'],
      backgroundColor: mergedConfig.bgColor,
      backdropFilter: 'blur(8px)',
      padding: '8px 16px',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 100,
      border: `1px solid ${mergedConfig.accentColor}33`,
    }}>
      <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: mergedConfig.textColor,
          lineHeight: 1.2,
        }}>
          {w.temperature}°{w.unit}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: mergedConfig.textColor,
          opacity: 0.6,
          lineHeight: 1.2,
        }}>
          {w.city}
        </div>
      </div>
      {mergedConfig.showDetails && (w.humidity !== undefined || w.windSpeed !== undefined) && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginLeft: 8,
          paddingLeft: 12,
          borderLeft: `1px solid ${mergedConfig.accentColor}33`,
        }}>
          {w.humidity !== undefined && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: mergedConfig.textColor }}>
                {w.humidity}%
              </div>
              <div style={{ fontSize: 9, color: mergedConfig.textColor, opacity: 0.5 }}>
                HUM
              </div>
            </div>
          )}
          {w.windSpeed !== undefined && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: mergedConfig.textColor }}>
                {w.windSpeed}
              </div>
              <div style={{ fontSize: 9, color: mergedConfig.textColor, opacity: 0.5 }}>
                KM/H
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Preset
export function WeatherBugBreeze({ overlayId }: { overlayId?: string }) {
  return (
    <WeatherBug
      overlayId={overlayId}
      config={{
        weather: { temperature: 22, condition: 'partly-cloudy', city: 'Buenos Aires', unit: 'C' },
        bgColor: 'rgba(15,23,42,0.7)',
        accentColor: '#3b82f6',
        showDetails: true,
        position: 'top-right',
      }}
    />
  );
}
