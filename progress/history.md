# Historial de sesiones

## 2026-07-16 — Sesión 1: Inicialización y scaffolding
- Creación del proyecto Bun + Astro + React + Tailwind
- Configuración de servidor Bun con WebSocket, API REST y estáticos
- Implementación de DB SQLite con overlay_configs
- Implementación de tipos compartidos y defaults
- Overlays funcionales: Timer, Lower Third
- Control Panel, Library, Editor funcionales
- Build exitoso: 11 páginas generadas

## 2026-07-16 — Sesión 2: Features 101-106 (Parallel Library)
- Port de 5 Lower Thirds (Dropzone, Glaze, On Air, Prime, Palladium)
- Port de 8 Scorebugs deportivos
- Port de 10 Stream Packs temáticos
- Port de 5 Tickers (Prime, Headline, Juice, Dusk, Lithium)
- Port de Countdowns, Webcam Borders, Alert, Sponsor
- Port de Widgets especiales (BRB, Efectos, Social, Weather)
- Build exitoso: 18 páginas generadas

## 2026-07-16 — Sesión 3: Feature 10 (Stream Deck + Pulido)
- Helpers WS para Stream Deck (sendOverlayCommand, toggleOverlay, getOverlayStatus)
- Endpoint GET /api/overlays/quick
- Endpoint POST /api/overlays/:id/command
- Endpoint POST /api/overlays/:id/toggle
- Documentación Stream Deck en README.md
- Todas las features completadas (1-10 core + 101-106 parallel)

## 2026-07-16 — Sesión 4: GitHub setup + Control Panel fixes
- Bug fix: Control Panel ahora dinámico (fetch de overlays desde API)
- Bug fix: Timer responde a eventos timer:start/timer:pause/timer:reset
- Control Dashboard reescrito con controles por tipo de overlay
- .gitignore ampliado (.astro/, .playwright-mcp/, data/store.db, *.png)
- Creación del repositorio GitHub: github.com/BrunoJimenez73/br1cg
- Initial commit + push (71 archivos)
- AGENTS.md actualizado con estado real y GitHub URL
- CHECKPOINTS.md marcado completo para features core + parallel

## 2026-07-19 — Sesión 10: Feature 304 — Editor Zustand store + undo/redo
- Reescrito `overlay-store.ts` con acciones atómicas (updateData, updateElement, addElement, removeElement, changeType)
- Historial undo/redo con 50 snapshots, Ctrl+Z/Ctrl+Shift+Z
- Migrado OverlayEditor.tsx: eliminados 7 useState → store
- Fix SSR: `getEditorId()` como función (window.location fuera del componente)
- `useWebSocket` ahora retorna `send()` e `isConnected()`
- Editor envía overlay:save por WS post-REST para live update
- Tests: 103/103 pasan. Build: OK.

## 2026-07-19 — Sesión 11: Feature 305 — Dashboard rewrite
- ControlDashboard reescrito con useWebSocket (sin WS raw)
- Eliminado Quick Test section hardcodeada (timer-1/lower-1)
- Delete con window.confirm() + botón Edit por overlay
- ScorebugControls: score home/away +/-/3, period selector (1H/2H/OT/FT + custom)
- TickerControls: messages textarea + speed slider
- SocialLooperControls: accounts list add/remove + rotation interval
- getControlsForType: 6 tipos (timer, lower-third, scorebug, ticker, social-looper, generic)
- Tests: 103/103 pasan. Build: OK.

## 2026-07-19 — Sesión 14: Timer bugfix (start/pause/reset no funcionaban)
- **Causa**: `OverlayRenderer.tsx` renderizaba `SharedElementRenderer` con `timer-display` estático, ignorando WS `event` messages. `Timer.tsx` nativo nunca se usaba en producción.
- **Fix 1** (`OverlayRenderer.tsx`): Importar `OVERLAY_COMPONENTS` y renderizar componente nativo (Timer, LowerThird, etc.) cuando existe, con `config` + `overlayId`. Fallback a elementos.
- **Fix 2** (`ControllerPage.tsx`): `TimerControls` ahora usa WS persistente (`sendCommand`) en vez de crear conexión nueva por clic.
- Verificación: Build ✅ 19 páginas 0 errores. Tests ✅ 188/188. init.ps1 ✅ OK.
