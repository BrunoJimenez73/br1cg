# br1cg — Sistema Local de CG/Overlays para OBS/vMix

Sistema para generar y controlar overlays HTML (CG) en OBS, vMix, Streamlabs y cualquier software que acepte Browser Source.

**Stack:** Bun + Astro + React + Tailwind + SQLite (bun:sqlite) + WebSocket nativo

## Estado

| Track | Features | Estado |
|-------|----------|--------|
| Core | Features 1-9 (scaffolding, server, DB, overlays, control panel, editor, library) | ✅ Completado |
| Parallel Library | Features 101-106 (lower thirds, scorebugs, stream packs, tickers, widgets) | ✅ Completado |
| Stream Deck + Polish | Feature 10 | ✅ Completado |

## Inicio rápido

```bash
# Instalar dependencias
bun install

# Iniciar desarrollo (servidor + astro hot reload)
bun run dev

# Build para producción
bun run build

# Servidor producción
bun run start
```

## URLs principales

| URL | Propósito |
|-----|-----------|
| `http://localhost:4321` | Astro dev (hot reload) |
| `http://localhost:3001` | Bun server (API + WS + estáticos) |
| `http://localhost:3001/` | Overlay Library |
| `http://localhost:3001/control` | Control Panel |
| `http://localhost:3001/editor?id=new` | Editor de overlays |
| `ws://localhost:3001/ws` | WebSocket |

## Overlays disponibles

15 tipos de overlay: lower-third, timer, scorebug, title-card, ticker, alert, webcam-border, sponsor-logo, brb, 2x-counter, money-effect, social-looper, weather-bug, yt-view-count, driveby.

Más 10 Stream Packs temáticos con paletas coherentes.

## Skills para Hermes

Cargar con `skill_view(name='br1cg-xxx')`:

- `br1cg-session-start` — Inicio de sesión
- `br1cg-session-end` — Cierre de sesión
- `br1cg-init` — Inicializar/verificar entorno
- `br1cg-verify` — Ejecutar init.ps1
- `br1cg-dev` — Comandos de desarrollo diario
- `br1cg-new-overlay` — Scaffold de nuevo overlay
- `br1cg-new-feature` — Crear ticket + feature

## Stream Deck Integration

br1cg expone una API REST optimizada para Stream Deck.

### Endpoints para Stream Deck

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/overlays/quick` | GET | Lista de overlays con estado (id, name, type, status) |
| `/api/overlays/:id/command` | POST | Enviar comando: `{ "action": "show"|"hide"|"update" }` |
| `/api/overlays/:id/toggle` | POST | Alternar visibilidad (show ↔ hide) |

### Configuración en Stream Deck

1. Instalar plugin **HTTP Request** desde Elgato Marketplace
2. Agregar botón → Seleccionar "HTTP Request"
3. Configurar:
   - **Method**: POST
   - **URL**: `http://localhost:3001/api/overlays/{OVERLAY_ID}/toggle`
   - **Headers**: `Content-Type: application/json`
   - **Body** (opcional para command): `{ "action": "show" }`

### Ejemplos de uso

**Mostrar overlay:**
```bash
curl -X POST http://localhost:3001/api/overlays/timer-1/command \
  -H "Content-Type: application/json" \
  -d '{"action": "show"}'
```

**Toggle visibilidad:**
```bash
curl -X POST http://localhost:3001/api/overlays/timer-1/toggle
```

**Obtener lista de overlays:**
```bash
curl http://localhost:3001/api/overlays/quick
```

## Documentación

Ver `AGENTS.md` para el mapa completo del proyecto y workflows.
