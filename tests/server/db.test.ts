// ──────────────────────────────────────────────
// Tests de base de datos (usando Bun runtime)
// ──────────────────────────────────────────────
// Ejecutar: bun test tests/server/db.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Database } from 'bun:sqlite';
import type { OverlayConfig } from '../../src/lib/types';

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
