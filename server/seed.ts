#!/usr/bin/env bun
/**
 * br1cg — Database seed script
 * Puebla la base de datos con overlays de ejemplo para desarrollo.
 *
 * Uso: bun run db:seed
 */

import { Database } from 'bun:sqlite';
import path from 'path';

const DB_PATH = path.join(import.meta.dirname, '..', 'data', 'store.db');
const db = new Database(DB_PATH);

// Crear tablas si no existen
db.run(`
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

db.run(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    category TEXT NOT NULL
  )
`);

const overlays = [
  {
    id: 'timer-1',
    name: 'Countdown 5min',
    type: 'timer',
    data: { minutes: 5, seconds: 0, mode: 'countdown', format: 'mm:ss', autoStart: false, bgColor: '#000000', textColor: '#ffffff', fontSize: '72px', showMillis: false, onComplete: 'stop' },
    tags: ['countdown', 'principal'],
  },
  {
    id: 'lower-1',
    name: 'Presentador Principal',
    type: 'lower-third',
    data: { title: 'Juan Pérez', subtitle: 'Ingeniero de Software', bgColor: '#1a1a2e', textColor: '#ffffff', accentColor: '#ff6b35', animation: 'slide-left', duration: 0, position: 'bottom-left' },
    tags: ['presentador'],
  },
  {
    id: 'lower-2',
    name: 'Invitado Especial',
    type: 'lower-third',
    data: { title: 'María García', subtitle: 'Diseñadora UX', bgColor: '#0f172a', textColor: '#ffffff', accentColor: '#3b82f6', animation: 'slide-right', duration: 0, position: 'bottom-left' },
    tags: ['invitado'],
  },
  {
    id: 'scorebug-1',
    name: 'Marcador Fútbol',
    type: 'scorebug',
    data: { sport: 'soccer', homeTeam: { name: 'HOME', abbrev: 'HOM', score: 2, color: '#3b82f6' }, awayTeam: { name: 'AWAY', abbrev: 'AWY', score: 1, color: '#ef4444' }, period: '2T', periodTime: '35:00', bgColor: '#111827', textColor: '#ffffff', accentColor: '#3b82f6', showSport: true, showTime: true },
    tags: ['deportes'],
  },
  {
    id: 'ticker-1',
    name: 'Noticias',
    type: 'ticker',
    data: { messages: ['Bienvenidos a la transmisión', 'Síguenos en redes sociales @br1cg', 'Nuevo episodio cada viernes'], speed: 80, separator: '•', bgColor: '#000000', textColor: '#ffffff', fontSize: 18, height: 40, animation: 'scroll', position: 'bottom' },
    tags: ['informativo'],
  },
  {
    id: 'alert-1',
    name: 'Alerta Genérica',
    type: 'alert',
    data: { message: '¡Nuevo mensaje!', submessage: 'Gracias por tu apoyo', icon: '🔔', duration: 5000, position: 'top', animation: 'bounce-in', bgColor: '#7c3aed', textColor: '#ffffff', accentColor: '#a78bfa', fontSize: 48 },
    tags: ['alertas'],
  },
];

const insert = db.prepare(`
  INSERT OR REPLACE INTO overlays (id, name, type, data, tags, favorite, created_at, updated_at)
  VALUES ($id, $name, $type, $data, $tags, 0, datetime('now'), datetime('now'))
`);

for (const overlay of overlays) {
  insert.run({
    $id: overlay.id,
    $name: overlay.name,
    $type: overlay.type,
    $data: JSON.stringify(overlay.data),
    $tags: JSON.stringify(overlay.tags),
  });
  console.log(`  ✓ ${overlay.id} — ${overlay.name}`);
}

console.log(`\n✅ Seed completado: ${overlays.length} overlays insertados.`);
