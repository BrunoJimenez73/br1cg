// ──────────────────────────────────────────────
// Tests for preset correctness
// ──────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { ALL_PRESETS as PRESETS } from '../src/lib/presets';
import { OVERLAY_TYPES } from '../src/lib/types';
import { getDefaultConfig, getDefaultElements } from '../src/lib/defaults';

describe('Presets', () => {
  it('PRESETS is a non-empty array', () => {
    expect(Array.isArray(PRESETS)).toBe(true);
    expect(PRESETS.length).toBeGreaterThan(0);
  });

  it('every preset has required fields', () => {
    for (const preset of PRESETS) {
      expect(typeof preset.id).toBe('string');
      expect(preset.id.length).toBeGreaterThan(0);
      expect(typeof preset.name).toBe('string');
      expect(preset.name.length).toBeGreaterThan(0);
      expect(typeof preset.description).toBe('string');
      expect(typeof preset.category).toBe('string');
      expect(typeof preset.config).toBe('object');
    }
  });

  it('every preset category matches a valid overlay type', () => {
    const validTypes = new Set(OVERLAY_TYPES);
    for (const preset of PRESETS) {
      expect(validTypes.has(preset.category as any)).toBe(true);
    }
  });

  it('every preset has a unique id', () => {
    const ids = PRESETS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every preset config is a non-empty object', () => {
    for (const preset of PRESETS) {
      expect(Object.keys(preset.config).length).toBeGreaterThan(0);
    }
  });
});

describe('Defaults correctness', () => {
  it('every OVERLAY_TYPES entry has a default config', () => {
    for (const type of OVERLAY_TYPES) {
      const config = getDefaultConfig(type);
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    }
  });

  it('every OVERLAY_TYPES entry has default elements', () => {
    for (const type of OVERLAY_TYPES) {
      const elements = getDefaultElements(type);
      expect(Array.isArray(elements)).toBe(true);
    }
  });

  it('lower-third default config has title and bgColor', () => {
    const config = getDefaultConfig('lower-third') as Record<string, unknown>;
    expect(config.title).toBeTruthy();
    expect(config.bgColor).toBeTruthy();
  });

  it('timer default config has minutes and seconds', () => {
    const config = getDefaultConfig('timer') as Record<string, unknown>;
    expect(typeof config.minutes).toBe('number');
    expect(typeof config.seconds).toBe('number');
  });

  it('scorebug default config has homeTeam and awayTeam', () => {
    const config = getDefaultConfig('scorebug') as Record<string, unknown>;
    expect(config.homeTeam).toBeDefined();
    expect(config.awayTeam).toBeDefined();
  });
});
