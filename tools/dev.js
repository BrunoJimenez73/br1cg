#!/usr/bin/env bun
/**
 * dev.js — Lanza servidor + Astro en paralelo
 *
 * Uso:
 *   bun run tools/dev.js         # Puerto por defecto (3001 server, 4321 astro)
 *   SERVER_PORT=3002 bun run tools/dev.js
 *
 * Esto evita tener que abrir dos terminales.
 */

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const ASTRO_PORT = process.env.ASTRO_PORT || 4321;

const ROOT = import.meta.dirname + "/..";

console.log(`╔══════════════════════════════════════╗`);
console.log(`║     br1cg — Dev Environment          ║`);
console.log(`╚══════════════════════════════════════╝`);
console.log(`  Server:  http://localhost:${SERVER_PORT}`);
console.log(`  Astro:   http://localhost:${ASTRO_PORT}`);
console.log(`  WS:      ws://localhost:${SERVER_PORT}/ws`);
console.log(`  Overlay: http://localhost:${SERVER_PORT}/overlay/timer`);
console.log(`  Control: http://localhost:${SERVER_PORT}/control`);
console.log(``);

// Lanzar ambos procesos en paralelo
const processes = [
  Bun.spawn(["bun", "run", "dev:server"], {
    cwd: ROOT,
    stdio: ["inherit", "inherit", "inherit"],
    env: { ...process.env, PORT: String(SERVER_PORT) },
  }),
  Bun.spawn(["bun", "run", "dev:astro"], {
    cwd: ROOT,
    stdio: ["inherit", "inherit", "inherit"],
    env: { ...process.env, ASTRO_PORT: String(ASTRO_PORT) },
  }),
];

// Si uno muere, matar al otro y salir
processes.forEach((proc) => {
  proc.exited.then((code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Proceso terminó con código ${code}`);
      processes.forEach((p) => p.kill());
      process.exit(code);
    }
  });
});

// Capturar Ctrl+C para matar ambos
process.on("SIGINT", () => {
  console.log("\n🛑 Cerrando...");
  processes.forEach((p) => p.kill());
  process.exit(0);
});

process.on("SIGTERM", () => {
  processes.forEach((p) => p.kill());
  process.exit(0);
});
