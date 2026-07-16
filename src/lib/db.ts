import { Database } from 'bun:sqlite';
import type { OverlayConfig } from './types';

interface OverlayRow {
  id: string;
  name: string;
  type: string;
  data: string;
  tags: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    const dir = new URL('../../data/', import.meta.url);
    db = new Database(new URL('store.db', dir).pathname, { create: true });
    initSchema(db);
  }
  return db;
}

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

  database.run(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);
}

export function getAllOverlays(): OverlayConfig[] {
  const rows = getDb().query('SELECT * FROM overlays ORDER BY updated_at DESC').all() as OverlayRow[];
  return rows.map(rowToOverlay);
}

export function getOverlay(id: string): OverlayConfig | null {
  const row = getDb().query('SELECT * FROM overlays WHERE id = ?').get(id) as OverlayRow | null;
  return row ? rowToOverlay(row) : null;
}

export function createOverlay(overlay: OverlayConfig): void {
  getDb().run(
    'INSERT INTO overlays (id, name, type, data, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [overlay.id, overlay.name, overlay.type, JSON.stringify(overlay.data), JSON.stringify(overlay.tags), overlay.favorite ? 1 : 0, overlay.createdAt, overlay.updatedAt]
  );
}

export function updateOverlay(id: string, overlay: Partial<OverlayConfig>): boolean {
  const existing = getOverlay(id);
  if (!existing) return false;

  const merged = { ...existing, ...overlay, updatedAt: new Date().toISOString() };
  getDb().run(
    'UPDATE overlays SET name = ?, type = ?, data = ?, tags = ?, favorite = ?, updated_at = ? WHERE id = ?',
    [merged.name, merged.type, JSON.stringify(merged.data), JSON.stringify(merged.tags), merged.favorite ? 1 : 0, merged.updatedAt, id]
  );
  return true;
}

export function deleteOverlay(id: string): boolean {
  const result = getDb().run('DELETE FROM overlays WHERE id = ?', [id]);
  return result.changes > 0;
}

function rowToOverlay(row: OverlayRow): OverlayConfig {
  return {
    id: row.id,
    name: row.name,
    type: row.type as OverlayConfig['type'],
    data: JSON.parse(row.data),
    tags: JSON.parse(row.tags),
    favorite: row.favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
