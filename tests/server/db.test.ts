// ──────────────────────────────────────────────
// Tests de base de datos (usando Bun runtime)
// ──────────────────────────────────────────────
// Ejecutar: bun test tests/server/db.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Database } from 'bun:sqlite';
import type { OverlayConfig } from '../../src/lib/types';
import { OVERLAY_TYPES } from '../../src/lib/types';

const VALID_TYPES = new Set(OVERLAY_TYPES);

const TEST_DB_PATH = ':memory:';
let db: Database;

function initSchema(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS overlays (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      favorite INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  try {
    database.run(`ALTER TABLE overlays ADD COLUMN elements TEXT DEFAULT '[]'`);
  } catch {
    /* column may already exist */
  }
}

function dbCreateOverlay(database: Database, overlay: OverlayConfig): void {
  database.run(
    'INSERT INTO overlays (id, name, type, data, elements, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      overlay.id,
      overlay.name,
      overlay.type,
      JSON.stringify(overlay.data),
      JSON.stringify(overlay.elements || []),
      JSON.stringify(overlay.tags),
      overlay.favorite ? 1 : 0,
      overlay.createdAt,
      overlay.updatedAt,
    ],
  );
}

type Row = {
  id: string;
  name: string;
  type: string;
  data: string;
  elements: string;
  tags: string;
  favorite: number;
  created_at: string;
  updated_at: string;
};

function dbGetOverlay(database: Database, id: string): OverlayConfig | null {
  const row = database.query('SELECT * FROM overlays WHERE id = ?').get(id) as Row | null;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    type: row.type as OverlayConfig['type'],
    data: JSON.parse(row.data),
    elements: JSON.parse(row.elements || '[]'),
    tags: JSON.parse(row.tags),
    favorite: row.favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbGetAllOverlays(database: Database): OverlayConfig[] {
  const rows = database.query('SELECT * FROM overlays ORDER BY updated_at DESC').all() as Row[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as OverlayConfig['type'],
    data: JSON.parse(row.data),
    elements: JSON.parse(row.elements || '[]'),
    tags: JSON.parse(row.tags),
    favorite: row.favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function dbUpdateOverlay(database: Database, id: string, overlay: Partial<OverlayConfig>): boolean {
  const existing = dbGetOverlay(database, id);
  if (!existing) return false;
  const merged = { ...existing, ...overlay, updatedAt: new Date().toISOString() };
  database.run(
    'UPDATE overlays SET name = ?, type = ?, data = ?, elements = ?, tags = ?, favorite = ?, updated_at = ? WHERE id = ?',
    [
      merged.name,
      merged.type,
      JSON.stringify(merged.data),
      JSON.stringify(merged.elements || []),
      JSON.stringify(merged.tags),
      merged.favorite ? 1 : 0,
      merged.updatedAt,
      id,
    ],
  );
  return true;
}

const sampleOverlay: OverlayConfig = {
  id: 'test-timer-1',
  name: 'Test Timer',
  type: 'timer',
  data: {
    minutes: 10,
    seconds: 0,
    mode: 'countdown',
    format: 'mm:ss',
    autoStart: false,
    bgColor: '#000',
    textColor: '#fff',
    fontSize: '72px',
    showMillis: false,
    onComplete: 'stop',
  },
  tags: ['test'],
  favorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Database Layer', () => {
  beforeAll(() => {
    db = new Database(TEST_DB_PATH);
    initSchema(db);
  });

  afterAll(() => {
    db.close();
  });

  it('creates an overlay', () => {
    dbCreateOverlay(db, sampleOverlay);
    const result = dbGetOverlay(db, 'test-timer-1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Test Timer');
    expect(result!.type).toBe('timer');
    expect(result!.data).toEqual(sampleOverlay.data);
    expect(result!.elements).toEqual([]);
    expect(result!.tags).toEqual(['test']);
  });

  it('returns all overlays', () => {
    const all = dbGetAllOverlays(db);
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((o) => o.id === 'test-timer-1')).toBeTrue();
  });

  it('updates an overlay', () => {
    const updated = dbUpdateOverlay(db, 'test-timer-1', { name: 'Updated Timer', favorite: true });
    expect(updated).toBeTrue();
    const result = dbGetOverlay(db, 'test-timer-1');
    expect(result!.name).toBe('Updated Timer');
    expect(result!.favorite).toBeTrue();
    expect(result!.updatedAt).not.toBe(sampleOverlay.updatedAt);
  });

  it('returns false for non-existent overlay update', () => {
    expect(dbUpdateOverlay(db, 'non-existent', { name: 'Ghost' })).toBeFalse();
  });

  it('deletes an overlay', () => {
    dbCreateOverlay(db, { ...sampleOverlay, id: 'test-to-delete', name: 'To Delete' });
    expect(dbGetOverlay(db, 'test-to-delete')).not.toBeNull();
    const result = db.run('DELETE FROM overlays WHERE id = ?', ['test-to-delete']);
    expect(result.changes).toBe(1);
    expect(dbGetOverlay(db, 'test-to-delete')).toBeNull();
  });

  it('serializes/deserializes complex JSON data', () => {
    const complexData = { key: 'value', nested: { a: 1, b: [1, 2, 3] } };
    dbCreateOverlay(db, { ...sampleOverlay, id: 'test-json', data: complexData });
    const result = dbGetOverlay(db, 'test-json');
    expect(result).not.toBeNull();
    expect(result!.data).toEqual(complexData);
  });

  it('handles overlays without elements column', () => {
    db.run(
      'INSERT INTO overlays (id, name, type, data, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['test-no-elements', 'No Elements', 'brb', '{}', '[]', 0, new Date().toISOString(), new Date().toISOString()],
    );
    const result = dbGetOverlay(db, 'test-no-elements');
    expect(result).not.toBeNull();
    expect(result!.elements).toEqual([]);
  });

  it('returns null for non-existent overlay', () => {
    expect(dbGetOverlay(db, 'does-not-exist')).toBeNull();
  });

  it('preserves favorite flag correctly', () => {
    dbCreateOverlay(db, { ...sampleOverlay, id: 'test-fav', name: 'Fav', favorite: true });
    const result = dbGetOverlay(db, 'test-fav');
    expect(result!.favorite).toBeTrue();
  });
});

describe('Input Validation (imported types)', () => {
  function validateOverlayBody(body: Record<string, unknown>): string | null {
    if (!body.type || typeof body.type !== 'string' || !VALID_TYPES.has(body.type as any)) {
      return `Invalid type. Must be one of: ${OVERLAY_TYPES.join(', ')}`;
    }
    if (body.name !== undefined && (typeof body.name !== 'string' || (body.name as string).trim().length === 0)) {
      return 'Name must be a non-empty string';
    }
    if (body.data !== undefined && (typeof body.data !== 'object' || body.data === null || Array.isArray(body.data))) {
      return 'Data must be an object';
    }
    if (body.elements !== undefined && !Array.isArray(body.elements)) {
      return 'Elements must be an array';
    }
    if (body.tags !== undefined && !Array.isArray(body.tags)) {
      return 'Tags must be an array';
    }
    return null;
  }

  it('accepts valid bodies', () => {
    expect(validateOverlayBody({ type: 'timer', name: 'Test' })).toBeNull();
    expect(validateOverlayBody({ type: 'lower-third', name: 'LT' })).toBeNull();
    expect(validateOverlayBody({ type: 'scorebug' })).toBeNull();
  });

  it('rejects invalid type', () => {
    expect(validateOverlayBody({ type: 'invalid-type' })).toContain('Invalid type');
    expect(validateOverlayBody({ type: '' })).toContain('Invalid type');
    expect(validateOverlayBody({})).toContain('Invalid type');
    expect(validateOverlayBody({ type: 123 })).toContain('Invalid type');
  });

  it('rejects empty name', () => {
    expect(validateOverlayBody({ type: 'timer', name: '' })).toContain('Name must be a non-empty string');
    expect(validateOverlayBody({ type: 'timer', name: '   ' })).toContain('Name must be a non-empty string');
  });

  it('accepts undefined name', () => {
    expect(validateOverlayBody({ type: 'timer' })).toBeNull();
  });

  it('rejects non-object data', () => {
    expect(validateOverlayBody({ type: 'timer', data: 'string' })).toContain('Data must be an object');
    expect(validateOverlayBody({ type: 'timer', data: [1, 2] })).toContain('Data must be an object');
    expect(validateOverlayBody({ type: 'timer', data: null })).toContain('Data must be an object');
  });

  it('accepts valid data objects', () => {
    expect(validateOverlayBody({ type: 'timer', data: { minutes: 5 } })).toBeNull();
    expect(validateOverlayBody({ type: 'timer', data: {} })).toBeNull();
  });

  it('rejects non-array elements', () => {
    expect(validateOverlayBody({ type: 'timer', elements: 'not-array' })).toContain('Elements must be an array');
    expect(validateOverlayBody({ type: 'timer', elements: {} })).toContain('Elements must be an array');
  });

  it('rejects non-array tags', () => {
    expect(validateOverlayBody({ type: 'timer', tags: 'not-array' })).toContain('Tags must be an array');
  });

  it('accepts all 15 valid types', () => {
    for (const type of OVERLAY_TYPES) {
      expect(validateOverlayBody({ type })).toBeNull();
    }
  });
});

describe('Export/Import Logic', () => {
  let exportDb: Database;

  beforeAll(() => {
    exportDb = new Database(':memory:');
    initSchema(exportDb);
  });

  afterAll(() => {
    exportDb.close();
  });

  it('has correct export format', () => {
    const rows = exportDb.query('SELECT * FROM overlays').all();
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      count: rows.length,
      overlays: rows,
    };
    expect(exportData.version).toBe(1);
    expect(typeof exportData.exportedAt).toBe('string');
    expect(typeof exportData.count).toBe('number');
    expect(Array.isArray(exportData.overlays)).toBeTrue();
  });

  it('imports new overlays correctly', () => {
    const newOverlays: OverlayConfig[] = [
      {
        id: 'imported-1',
        name: 'Imported Timer',
        type: 'timer',
        data: { minutes: 5 },
        elements: [],
        tags: ['imported'],
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'imported-2',
        name: 'Imported LT',
        type: 'lower-third',
        data: { title: 'Hello' },
        elements: [],
        tags: [],
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    let imported = 0;
    for (const overlay of newOverlays) {
      if (!dbGetOverlay(exportDb, overlay.id)) {
        dbCreateOverlay(exportDb, overlay);
        imported++;
      }
    }
    expect(imported).toBe(2);
    expect(dbGetOverlay(exportDb, 'imported-1')).not.toBeNull();
    expect(dbGetOverlay(exportDb, 'imported-2')).not.toBeNull();
  });

  it('skips existing overlays on import', () => {
    let imported = 0;
    let skipped = 0;
    const overlay: OverlayConfig = {
      id: 'imported-1',
      name: 'Updated',
      type: 'timer',
      data: {},
      elements: [],
      tags: [],
      favorite: false,
      createdAt: '',
      updatedAt: '',
    };
    if (dbGetOverlay(exportDb, overlay.id)) {
      skipped++;
    } else {
      dbCreateOverlay(exportDb, overlay);
      imported++;
    }
    expect(imported).toBe(0);
    expect(skipped).toBe(1);
    expect(dbGetOverlay(exportDb, 'imported-1')!.name).toBe('Imported Timer');
  });

  it('rejects invalid type on import', () => {
    const overlays = [{ id: 'bad-1', name: 'Bad', type: 'invalid-type', data: {} }];
    const errors: string[] = [];
    let imported = 0;
    for (const item of overlays) {
      if (!VALID_TYPES.has(item.type as any)) {
        errors.push(`Invalid type: ${item.type}`);
        continue;
      }
      imported++;
    }
    expect(imported).toBe(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('invalid-type');
  });

  it('cleans up imported data', () => {
    exportDb.run('DELETE FROM overlays WHERE id LIKE ?', ['imported-%']);
    expect(dbGetOverlay(exportDb, 'imported-1')).toBeNull();
    expect(dbGetOverlay(exportDb, 'imported-2')).toBeNull();
  });
});
