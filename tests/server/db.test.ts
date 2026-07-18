// ──────────────────────────────────────────────
// Tests de base de datos (usando Bun runtime)
// ──────────────────────────────────────────────
// Ejecutar: bun test tests/server/db.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Database } from 'bun:sqlite';
import type { OverlayConfig } from '../../src/lib/types';

// Shared constants for validation tests
const OVERLAY_TYPES = [
  'lower-third', 'timer', 'scorebug', 'title-card',
  'ticker', 'alert', 'webcam-border', 'sponsor-logo',
  'brb', '2x-counter', 'money-effect',
  'social-looper', 'weather-bug', 'yt-view-count', 'driveby',
] as const;
const VALID_TYPES = new Set(OVERLAY_TYPES);

// Usar base de datos temporal para no contaminar la real
const TEST_DB_PATH = ':memory:';
let db: Database;

// Script de creación de esquema replicado del server
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
    // Column already exists
  }
}

function createOverlay(db: Database, overlay: OverlayConfig): void {
  db.run(
    'INSERT INTO overlays (id, name, type, data, elements, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [overlay.id, overlay.name, overlay.type, JSON.stringify(overlay.data), JSON.stringify(overlay.elements || []), JSON.stringify(overlay.tags), overlay.favorite ? 1 : 0, overlay.createdAt, overlay.updatedAt]
  );
}

function getOverlay(db: Database, id: string): OverlayConfig | null {
  type Row = {
    id: string; name: string; type: string; data: string;
    elements: string; tags: string; favorite: number;
    created_at: string; updated_at: string;
  };
  const row = db.query('SELECT * FROM overlays WHERE id = ?').get(id) as Row | null;
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

function getAllOverlays(db: Database): OverlayConfig[] {
  type Row = {
    id: string; name: string; type: string; data: string;
    elements: string; tags: string; favorite: number;
    created_at: string; updated_at: string;
  };
  const rows = db.query('SELECT * FROM overlays ORDER BY updated_at DESC').all() as Row[];
  return rows.map(row => ({
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

function updateOverlay(db: Database, id: string, overlay: Partial<OverlayConfig>): boolean {
  const existing = getOverlay(db, id);
  if (!existing) return false;
  const merged = { ...existing, ...overlay, updatedAt: new Date().toISOString() };
  db.run(
    'UPDATE overlays SET name = ?, type = ?, data = ?, elements = ?, tags = ?, favorite = ?, updated_at = ? WHERE id = ?',
    [merged.name, merged.type, JSON.stringify(merged.data), JSON.stringify(merged.elements || []), JSON.stringify(merged.tags), merged.favorite ? 1 : 0, merged.updatedAt, id]
  );
  return true;
}

describe('Server Database Layer', () => {
  beforeAll(() => {
    db = new Database(TEST_DB_PATH);
    initSchema(db);
  });

  afterAll(() => {
    db.close();
  });

  const sampleOverlay: OverlayConfig = {
    id: 'test-timer-1',
    name: 'Test Timer',
    type: 'timer',
    data: { minutes: 10, seconds: 0, mode: 'countdown', format: 'mm:ss', autoStart: false, bgColor: '#000', textColor: '#fff', fontSize: '72px', showMillis: false, onComplete: 'stop' },
    tags: ['test'],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('debe crear un overlay en la DB', () => {
    createOverlay(db, sampleOverlay);
    const result = getOverlay(db, 'test-timer-1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Test Timer');
    expect(result!.type).toBe('timer');
  });

  it('debe obtener todos los overlays', () => {
    const all = getAllOverlays(db);
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some(o => o.id === 'test-timer-1')).toBeTrue();
  });

  it('debe actualizar un overlay', () => {
    const updated = updateOverlay(db, 'test-timer-1', { name: 'Updated Timer', favorite: true });
    expect(updated).toBeTrue();
    const result = getOverlay(db, 'test-timer-1');
    expect(result!.name).toBe('Updated Timer');
    expect(result!.favorite).toBeTrue();
  });

  it('debe retornar false al actualizar overlay inexistente', () => {
    const result = updateOverlay(db, 'non-existent', { name: 'Ghost' });
    expect(result).toBeFalse();
  });

  it('debe eliminar un overlay', () => {
    // Primero crear otro
    createOverlay(db, { ...sampleOverlay, id: 'test-to-delete', name: 'To Delete' });
    expect(getOverlay(db, 'test-to-delete')).not.toBeNull();

    // Eliminar manualmente
    const result = db.run('DELETE FROM overlays WHERE id = ?', ['test-to-delete']);
    expect(result.changes).toBe(1);
    expect(getOverlay(db, 'test-to-delete')).toBeNull();
  });

  it('debe serializar y deserializar datos JSON correctamente', () => {
    const complexData = { key: 'value', nested: { a: 1, b: [1, 2, 3] } };
    createOverlay(db, { ...sampleOverlay, id: 'test-json', data: complexData });
    const result = getOverlay(db, 'test-json');
    expect(result).not.toBeNull();
    expect(result!.data).toEqual(complexData);
  });

  it('debe manejar overlays sin elements', () => {
    db.run(
      'INSERT INTO overlays (id, name, type, data, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['test-no-elements', 'No Elements', 'brb', '{}', '[]', 0, new Date().toISOString(), new Date().toISOString()]
    );
    const result = getOverlay(db, 'test-no-elements');
    expect(result).not.toBeNull();
    expect(result!.elements).toEqual([]);
  });

  it('debe retornar null para overlay inexistente', () => {
    expect(getOverlay(db, 'does-not-exist')).toBeNull();
  });
});

describe('Server API - WebSocket Messages', () => {
  it('debe tener formato correcto de mensajes WS', () => {
    const msg = JSON.stringify({ type: 'show', overlayId: 'test-1', payload: {} });
    const parsed = JSON.parse(msg);
    expect(parsed).toHaveProperty('type');
    expect(parsed).toHaveProperty('overlayId');
    expect(typeof parsed.type).toBe('string');
  });

  it('debe parsear comandos de overlay correctamente', () => {
    const commands = ['show', 'hide', 'update', 'timer:start', 'timer:pause', 'timer:reset', 'alert'];
    for (const cmd of commands) {
      const msg = JSON.stringify({ type: cmd, overlayId: 'test', payload: {} });
      const parsed = JSON.parse(msg);
      expect(parsed.type).toBe(cmd);
    }
  });
});

describe('Server API - Input Validation', () => {
  // Replicate the validation logic from server/routes/overlays.ts
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

  it('debe aceptar body válido con type correcto', () => {
    expect(validateOverlayBody({ type: 'timer', name: 'Test' })).toBeNull();
    expect(validateOverlayBody({ type: 'lower-third', name: 'LT' })).toBeNull();
    expect(validateOverlayBody({ type: 'scorebug' })).toBeNull();
  });

  it('debe rechazar type inválido', () => {
    expect(validateOverlayBody({ type: 'invalid-type' })).toContain('Invalid type');
    expect(validateOverlayBody({ type: '' })).toContain('Invalid type');
    expect(validateOverlayBody({})).toContain('Invalid type');
    expect(validateOverlayBody({ type: 123 })).toContain('Invalid type');
  });

  it('debe rechazar name vacío', () => {
    expect(validateOverlayBody({ type: 'timer', name: '' })).toContain('Name must be a non-empty string');
    expect(validateOverlayBody({ type: 'timer', name: '   ' })).toContain('Name must be a non-empty string');
  });

  it('debe aceptar name undefined (optional)', () => {
    expect(validateOverlayBody({ type: 'timer' })).toBeNull();
  });

  it('debe rechazar data que no es objeto', () => {
    expect(validateOverlayBody({ type: 'timer', data: 'string' })).toContain('Data must be an object');
    expect(validateOverlayBody({ type: 'timer', data: [1, 2] })).toContain('Data must be an object');
    expect(validateOverlayBody({ type: 'timer', data: null })).toContain('Data must be an object');
  });

  it('debe aceptar data como objeto válido', () => {
    expect(validateOverlayBody({ type: 'timer', data: { minutes: 5 } })).toBeNull();
    expect(validateOverlayBody({ type: 'timer', data: {} })).toBeNull();
  });

  it('debe rechazar elements que no es array', () => {
    expect(validateOverlayBody({ type: 'timer', elements: 'not-array' })).toContain('Elements must be an array');
    expect(validateOverlayBody({ type: 'timer', elements: {} })).toContain('Elements must be an array');
  });

  it('debe rechazar tags que no es array', () => {
    expect(validateOverlayBody({ type: 'timer', tags: 'not-array' })).toContain('Tags must be an array');
  });

  it('debe aceptar todos los 15 tipos válidos', () => {
    for (const type of OVERLAY_TYPES) {
      expect(validateOverlayBody({ type })).toBeNull();
    }
  });
});

describe('Server API - Export/Import Logic', () => {
  let exportDb: Database;

  beforeAll(() => {
    exportDb = new Database(':memory:');
    exportDb.run(`
      CREATE TABLE IF NOT EXISTS overlays (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        data TEXT NOT NULL, tags TEXT DEFAULT '[]', favorite INTEGER DEFAULT 0,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      )
    `);
    try { exportDb.run(`ALTER TABLE overlays ADD COLUMN elements TEXT DEFAULT '[]'`); } catch {}
  });

  afterAll(() => {
    exportDb.close();
  });

  function createTestOverlay(overlay: OverlayConfig): void {
    exportDb.run(
      'INSERT INTO overlays (id, name, type, data, elements, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [overlay.id, overlay.name, overlay.type, JSON.stringify(overlay.data), JSON.stringify(overlay.elements || []), JSON.stringify(overlay.tags), overlay.favorite ? 1 : 0, overlay.createdAt, overlay.updatedAt]
    );
  }

  function getTestOverlay(id: string): OverlayConfig | null {
    type Row = { id: string; name: string; type: string; data: string; elements: string; tags: string; favorite: number; created_at: string; updated_at: string; };
    const row = exportDb.query('SELECT * FROM overlays WHERE id = ?').get(id) as Row | null;
    if (!row) return null;
    return {
      id: row.id, name: row.name, type: row.type as OverlayConfig['type'],
      data: JSON.parse(row.data), elements: JSON.parse(row.elements || '[]'),
      tags: JSON.parse(row.tags), favorite: row.favorite === 1,
      createdAt: row.created_at, updatedAt: row.updated_at,
    };
  }

  it('debe tener formato de export correcto', () => {
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

  it('debe importar overlays nuevos correctamente', () => {
    const newOverlays = [
      {
        id: 'imported-1', name: 'Imported Timer', type: 'timer',
        data: { minutes: 5, seconds: 0 }, elements: [], tags: ['imported'],
        favorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      },
      {
        id: 'imported-2', name: 'Imported Lower Third', type: 'lower-third',
        data: { title: 'Hello' }, elements: [], tags: [],
        favorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      },
    ];

    let imported = 0;
    for (const overlay of newOverlays) {
      const existing = getTestOverlay(overlay.id);
      if (!existing) {
        createTestOverlay(overlay);
        imported++;
      }
    }

    expect(imported).toBe(2);
    expect(getTestOverlay('imported-1')).not.toBeNull();
    expect(getTestOverlay('imported-2')).not.toBeNull();
  });

  it('debe saltar overlays existentes al importar', () => {
    const existing = getTestOverlay('imported-1');
    expect(existing).not.toBeNull();

    let imported = 0;
    let skipped = 0;

    const overlay = {
      id: 'imported-1', name: 'Imported Timer Updated', type: 'timer',
      data: {}, elements: [], tags: [], favorite: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };

    const existingCheck = getTestOverlay(overlay.id);
    if (existingCheck) {
      skipped++;
    } else {
      createTestOverlay(overlay);
      imported++;
    }

    expect(imported).toBe(0);
    expect(skipped).toBe(1);
    expect(getTestOverlay('imported-1')!.name).toBe('Imported Timer');
  });

  it('debe manejar import con tipo inválido', () => {
    const overlays = [
      { id: 'bad-1', name: 'Bad', type: 'invalid-type', data: {} },
    ];

    const errors: string[] = [];
    let imported = 0;

    for (const item of overlays) {
      if (!VALID_TYPES.has(item.type as any)) {
        errors.push(`Invalid type: ${item.type}`);
        continue;
      }
      createTestOverlay(item as any);
      imported++;
    }

    expect(imported).toBe(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('invalid-type');
  });

  it('debe limpiar datos de importación', () => {
    exportDb.run('DELETE FROM overlays WHERE id LIKE ?', ['imported-%']);
    expect(getTestOverlay('imported-1')).toBeNull();
    expect(getTestOverlay('imported-2')).toBeNull();
  });
});

describe('Server Database - Backup Logic', () => {
  const { existsSync, mkdirSync, copyFileSync, statSync, readdirSync, unlinkSync } = require('fs');
  const { join } = require('path');
  const tmpDir = join(process.cwd(), '.test-backup-tmp');

  it('debe crear directorio de backup si no existe', () => {
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir, { recursive: true });
    }
    expect(existsSync(tmpDir)).toBeTrue();
  });

  it('debe copiar archivo de base de datos', () => {
    const srcPath = join(tmpDir, 'test.db');
    const backupDir = join(tmpDir, 'backup');
    const backupPath = join(backupDir, 'store-test.db');

    // Create a test DB file
    const testDb = new Database(srcPath);
    testDb.run('CREATE TABLE test (id TEXT)');
    testDb.run('INSERT INTO test VALUES (?)', ['hello']);
    testDb.close();

    // Create backup dir and copy
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    copyFileSync(srcPath, backupPath);

    expect(existsSync(backupPath)).toBeTrue();
    expect(statSync(backupPath).size).toBeGreaterThan(0);

    // Verify backup is valid
    const backupDb = new Database(backupPath);
    const row = backupDb.query('SELECT * FROM test').get();
    expect(row).toBeDefined();
    backupDb.close();
  });

  it('debe limpiar backups antiguos (mantener últimos 5)', () => {
    const backupDir = join(tmpDir, 'backup');

    // Create 8 fake backup files
    for (let i = 0; i < 8; i++) {
      const path = join(backupDir, `store-2024-01-0${i + 1}T00-00-00.db`);
      const testDb = new Database(path);
      testDb.run('CREATE TABLE test (id TEXT)');
      testDb.close();
    }

    // Simulate cleanup: keep only last 5
    const files = readdirSync(backupDir)
      .filter((f) => f.startsWith('store-') && f.endsWith('.db'))
      .sort()
      .reverse();

    for (const file of files.slice(5)) {
      unlinkSync(join(backupDir, file));
    }

    const remaining = readdirSync(backupDir)
      .filter((f) => f.startsWith('store-') && f.endsWith('.db'));
    expect(remaining.length).toBeLessThanOrEqual(5);
  });

  it('debe limpiar archivos temporales de test', () => {
    // Clean up test directory
    const { rmSync } = require('fs');
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    expect(existsSync(tmpDir)).toBeFalse();
  });
});
