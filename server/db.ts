import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, copyFileSync, statSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { OverlayConfig } from '../src/lib/types';

interface OverlayRow {
  id: string;
  name: string;
  type: string;
  description: string;
  data: string;
  elements: string;
  tags: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

let db: Database | null = null;

/**
 * Closes the database connection gracefully.
 * Should be called during server shutdown.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Creates an automatic backup of the SQLite database before initialization.
 * Copies store.db to data/backup/store-{timestamp}.db.
 * Keeps only the last 5 backups to prevent disk bloat.
 * @param dbPath - Absolute path to the database file
 */
function backupDatabase(dbPath: string): void {
  if (!existsSync(dbPath)) return; // No backup on first run

  const backupDir = join(dbPath, '..', 'backup');
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = join(backupDir, `store-${timestamp}.db`);

  // Only backup if file has content
  const stat = statSync(dbPath);
  if (stat.size > 0) {
    copyFileSync(dbPath, backupPath);
  }

  // Keep only last 5 backups
  const files = readdirSync(backupDir)
    .filter((f: string) => f.startsWith('store-') && f.endsWith('.db'))
    .sort()
    .reverse();
  for (const file of files.slice(5)) {
    unlinkSync(join(backupDir, file));
  }
}

/**
 * Returns the singleton Database instance, creating it on first access.
 * Creates data/ directory if needed, runs backup, and initializes schema.
 * @returns The SQLite database instance
 */
export function getDb(): Database {
  if (!db) {
    const dataDir = join(import.meta.dir, '..', 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = join(dataDir, 'store.db');

    backupDatabase(dbPath);

    db = new Database(dbPath, { create: true });
    initSchema(db);
  }
  return db;
}

/**
 * Initializes the database schema with overlays and templates tables.
 * Handles migrations (e.g., adding elements column) gracefully.
 * @param database - The SQLite database to initialize
 */
function initSchema(database: Database): void {
  database.run('PRAGMA journal_mode=WAL');
  database.run('PRAGMA foreign_keys=ON');

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

  // Migration: add elements column if missing
  try {
    database.run(`ALTER TABLE overlays ADD COLUMN elements TEXT DEFAULT '[]'`);
  } catch (e) {
    const msg = (e as Error).message || String(e);
    if (!msg.includes('duplicate column')) {
      console.error('[DB] Migration error:', msg);
    }
  }

  // Migration: add description column if missing
  try {
    database.run(`ALTER TABLE overlays ADD COLUMN description TEXT DEFAULT ''`);
  } catch (e) {
    const msg = (e as Error).message || String(e);
    if (!msg.includes('duplicate column')) {
      console.error('[DB] Migration error:', msg);
    }
  }

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

/**
 * Fetches all overlays from the database, ordered by most recently updated.
 * @returns Array of all overlay configurations
 */
export function getAllOverlays(): OverlayConfig[] {
  const rows = getDb().query('SELECT * FROM overlays ORDER BY updated_at DESC').all() as OverlayRow[];
  return rows.map(rowToOverlay);
}

/**
 * Fetches a single overlay by its unique ID.
 * @param id - The overlay UUID
 * @returns The overlay configuration, or null if not found
 */
export function getOverlay(id: string): OverlayConfig | null {
  const row = getDb().query('SELECT * FROM overlays WHERE id = ?').get(id) as OverlayRow | null;
  return row ? rowToOverlay(row) : null;
}

/**
 * Inserts a new overlay into the database.
 * @param overlay - The complete overlay configuration to insert
 * @throws SQLite error if the insert fails (e.g., duplicate ID)
 */
export function createOverlay(overlay: OverlayConfig): void {
  getDb().run(
    'INSERT INTO overlays (id, name, type, description, data, elements, tags, favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [overlay.id, overlay.name, overlay.type, overlay.description || '', JSON.stringify(overlay.data), JSON.stringify(overlay.elements || []), JSON.stringify(overlay.tags), overlay.favorite ? 1 : 0, overlay.createdAt, overlay.updatedAt]
  );
}

/**
 * Updates an existing overlay by merging the provided fields.
 * Automatically updates the `updatedAt` timestamp.
 * @param id - The overlay UUID to update
 * @param overlay - Partial overlay data to merge
 * @returns true if the overlay was found and updated, false if not found
 */
export function updateOverlay(id: string, overlay: Partial<OverlayConfig>): boolean {
  const existing = getOverlay(id);
  if (!existing) return false;

  const merged = { ...existing, ...overlay, updatedAt: new Date().toISOString() };
  getDb().run(
    'UPDATE overlays SET name = ?, type = ?, description = ?, data = ?, elements = ?, tags = ?, favorite = ?, updated_at = ? WHERE id = ?',
    [merged.name, merged.type, merged.description || '', JSON.stringify(merged.data), JSON.stringify(merged.elements || []), JSON.stringify(merged.tags), merged.favorite ? 1 : 0, merged.updatedAt, id]
  );
  return true;
}

/**
 * Deletes an overlay from the database by ID.
 * @param id - The overlay UUID to delete
 * @returns true if the overlay was deleted, false if not found
 */
export function deleteOverlay(id: string): boolean {
  const result = getDb().run('DELETE FROM overlays WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Converts a raw database row into a typed OverlayConfig object.
 * Parses JSON fields (data, elements, tags) and normalizes timestamps.
 * @param row - Raw database row
 * @returns Typed overlay configuration
 */
function rowToOverlay(row: OverlayRow): OverlayConfig {
  return {
    id: row.id,
    name: row.name,
    type: row.type as OverlayConfig['type'],
    description: row.description || '',
    data: JSON.parse(row.data),
    elements: JSON.parse(row.elements || '[]'),
    tags: JSON.parse(row.tags),
    favorite: row.favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
