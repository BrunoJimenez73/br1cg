// ──────────────────────────────────────────────
// br1cg — Seed script: Crea overlays de ejemplo
// ──────────────────────────────────────────────

import { v4 as uuid } from 'uuid';
import { createOverlay, getAllOverlays, getDb } from './db';
import { LOWER_THIRD_PRESETS, TIMER_PRESETS, TICKER_PRESETS, SCOREBUG_PRESETS } from '../src/lib/presets';
import { getDefaultElements } from '../src/lib/defaults';
import { STREAM_PACKS } from '../src/lib/pack-presets';
import type { OverlayConfig, OverlayType } from '../src/lib/types';

function createOverlayFromPreset(
  name: string,
  type: OverlayType,
  data: Record<string, unknown>,
  tags: string[] = []
): OverlayConfig {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name,
    type,
    data: data as OverlayConfig['data'],
    elements: getDefaultElements(type),
    tags,
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

function seed(): void {
  console.log('🌱 Seeding br1cg database...\n');

  // Check if already seeded
  const existing = getAllOverlays();
  if (existing.length > 0) {
    console.log(`⚠️  Database already has ${existing.length} overlays.`);
    console.log('   Run with --force to reseed.\n');
    if (!process.argv.includes('--force')) {
      return;
    }
    console.log('   --force flag detected, clearing and reseeding...\n');
    // Clear existing
    getDb().run('DELETE FROM overlays');
  }

  let count = 0;

  // ─── Lower Thirds ───
  console.log('📌 Lower Thirds...');
  for (const preset of LOWER_THIRD_PRESETS) {
    const overlay = createOverlayFromPreset(
      `LT: ${preset.name}`,
      'lower-third',
      preset.config as Record<string, unknown>,
      ['preset', 'lower-third', preset.name.toLowerCase()]
    );
    createOverlay(overlay);
    count++;
    console.log(`   ✅ ${preset.name}`);
  }

  // ─── Timers ───
  console.log('⏱️  Timers...');
  for (const preset of TIMER_PRESETS) {
    const overlay = createOverlayFromPreset(
      `Timer: ${preset.name}`,
      'timer',
      preset.config as Record<string, unknown>,
      ['preset', 'timer', preset.name.toLowerCase()]
    );
    createOverlay(overlay);
    count++;
    console.log(`   ✅ ${preset.name}`);
  }

  // ─── Tickers ───
  console.log('📰 Tickers...');
  for (const preset of TICKER_PRESETS) {
    const overlay = createOverlayFromPreset(
      `Ticker: ${preset.name}`,
      'ticker',
      preset.config as Record<string, unknown>,
      ['preset', 'ticker', preset.name.toLowerCase()]
    );
    createOverlay(overlay);
    count++;
    console.log(`   ✅ ${preset.name}`);
  }

  // ─── Scorebugs ───
  console.log('⚽ Scorebugs...');
  for (const preset of SCOREBUG_PRESETS) {
    const overlay = createOverlayFromPreset(
      `Scorebug: ${preset.name}`,
      'scorebug',
      preset.config as Record<string, unknown>,
      ['preset', 'scorebug', preset.name.toLowerCase()]
    );
    createOverlay(overlay);
    count++;
    console.log(`   ✅ ${preset.name}`);
  }

  // ─── Stream Packs (one overlay per pack as example) ───
  console.log('🎨 Stream Packs...');
  for (const [id, pack] of Object.entries(STREAM_PACKS)) {
    // Create a lower-third using the pack's colors
    const overlay = createOverlayFromPreset(
      `Pack: ${pack.name}`,
      'lower-third',
      {
        title: pack.name,
        subtitle: pack.description,
        bgColor: pack.colors.muted,
        textColor: pack.colors.primary,
        accentColor: pack.colors.accent,
        animation: 'slide-left',
        duration: 0,
        position: 'bottom-left',
      },
      ['preset', 'stream-pack', id]
    );
    createOverlay(overlay);
    count++;
    console.log(`   ✅ ${pack.name}`);
  }

  console.log(`\n🎉 Seeded ${count} overlays successfully!`);
  console.log('   Open http://localhost:3001 to see them.\n');
}

seed();
