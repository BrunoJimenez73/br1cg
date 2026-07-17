// ──────────────────────────────────────────────
// Tests de tipos y defaults del sistema
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getDefaultConfig, getDefaultElements, DEFAULTS } from '../src/lib/defaults';
import {
  OVERLAY_TYPES, OVERLAY_TYPE_LABELS,
  type OverlayType, type OverlayConfigData,
  type OverlayElement,
} from '../src/lib/types';

describe('Overlay Types', () => {
  it('OVERLAY_TYPES debe incluir todos los 15 tipos', () => {
    expect(OVERLAY_TYPES).toHaveLength(15);
    expect(OVERLAY_TYPES).toContain('lower-third');
    expect(OVERLAY_TYPES).toContain('timer');
    expect(OVERLAY_TYPES).toContain('scorebug');
    expect(OVERLAY_TYPES).toContain('title-card');
    expect(OVERLAY_TYPES).toContain('ticker');
    expect(OVERLAY_TYPES).toContain('alert');
    expect(OVERLAY_TYPES).toContain('webcam-border');
    expect(OVERLAY_TYPES).toContain('sponsor-logo');
    expect(OVERLAY_TYPES).toContain('brb');
    expect(OVERLAY_TYPES).toContain('2x-counter');
    expect(OVERLAY_TYPES).toContain('money-effect');
    expect(OVERLAY_TYPES).toContain('social-looper');
    expect(OVERLAY_TYPES).toContain('weather-bug');
    expect(OVERLAY_TYPES).toContain('yt-view-count');
    expect(OVERLAY_TYPES).toContain('driveby');
  });

  it('OVERLAY_TYPE_LABELS debe tener todos los tipos con label', () => {
    for (const type of OVERLAY_TYPES) {
      expect(OVERLAY_TYPE_LABELS[type]).toBeDefined();
      expect(OVERLAY_TYPE_LABELS[type].length).toBeGreaterThan(0);
    }
  });
});

describe('getDefaultConfig', () => {
  it('debe devolver config para cada tipo de overlay', () => {
    for (const type of OVERLAY_TYPES) {
      const config = getDefaultConfig(type);
      expect(config).toBeDefined();
      // Each config should be an object
      expect(typeof config).toBe('object');
    }
  });

  it('debe tener al menos title y bgColor en lower-third', () => {
    const config = getDefaultConfig('lower-third') as Record<string, unknown>;
    expect(config.title).toBe('Nombre');
    expect(config.bgColor).toBe('#1a1a2e');
  });

  it('debe tener config de timer con minutes y seconds', () => {
    const config = DEFAULTS['timer'] as Record<string, unknown>;
    expect(config.minutes).toBe(5);
    expect(config.seconds).toBe(0);
  });

  it('debe tener config de brb con message', () => {
    const config = DEFAULTS['brb'] as Record<string, unknown>;
    expect(config.message).toBe('VOLVEMOS EN BREVE');
    expect(config.style).toBe('classic');
  });

  it('debe tener config de 2x-counter con label y count', () => {
    const config = DEFAULTS['2x-counter'] as Record<string, unknown>;
    expect(config.label).toBe('Raids');
    expect(config.maxCount).toBe(10);
  });

  it('debe tener config de money-effect', () => {
    const config = DEFAULTS['money-effect'] as Record<string, unknown>;
    expect(config.amount).toBe('$5');
    expect(config.particleCount).toBe(20);
  });

  it('debe tener config de social-looper con accounts array', () => {
    const config = DEFAULTS['social-looper'] as Record<string, unknown>;
    expect(config.accounts).toBeInstanceOf(Array);
    expect(Array.isArray(config.accounts)).toBe(true);
  });

  it('debe tener config de weather-bug con weather object', () => {
    const config = DEFAULTS['weather-bug'] as Record<string, unknown>;
    expect(config.weather).toBeDefined();
    expect(typeof config.weather).toBe('object');
  });

  it('debe tener config de yt-view-count', () => {
    const config = DEFAULTS['yt-view-count'] as Record<string, unknown>;
    expect(config.label).toBe('Espectadores');
    expect(config.format).toBe('compact');
  });

  it('debe tener config de driveby con message y dirección', () => {
    const config = DEFAULTS['driveby'] as Record<string, unknown>;
    expect(config.message).toBe('✨ ¡Gracias por el apoyo! ✨');
    expect(config.direction).toBe('left');
  });
});

describe('getDefaultElements', () => {
  it('debe devolver array de elementos para cada tipo', () => {
    for (const type of OVERLAY_TYPES) {
      const elements = getDefaultElements(type);
      expect(elements).toBeInstanceOf(Array);
    }
  });

  it('lower-third debe tener al menos 4 elementos', () => {
    const elements = getDefaultElements('lower-third');
    expect(elements.length).toBeGreaterThanOrEqual(4);
  });

  it('overlays extendidos (brb, money-effect) deben tener 0 elementos', () => {
    expect(getDefaultElements('brb')).toHaveLength(0);
    expect(getDefaultElements('money-effect')).toHaveLength(0);
    expect(getDefaultElements('driveby')).toHaveLength(0);
  });

  it('timer debe tener 1 elemento timer-display', () => {
    const elements = getDefaultElements('timer');
    expect(elements.length).toBeGreaterThanOrEqual(1);
    const timerEl = elements.find(e => e.type === 'timer-display');
    expect(timerEl).toBeDefined();
  });
});

describe('DEFAULTS configuración completa', () => {
  it('todos los DEFAULT tienen el mismo número de entradas que OVERLAY_TYPES', () => {
    const defaultKeys = Object.keys(DEFAULTS).sort();
    const typeKeys = [...OVERLAY_TYPES].sort();
    expect(defaultKeys).toEqual(typeKeys);
  });
});
