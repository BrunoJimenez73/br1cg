# br1cg — Sistema Local de CG/Overlays para OBS/vMix

Sistema para generar y controlar overlays HTML (CG) en OBS, vMix, Streamlabs y cualquier software que acepte Browser Source.

**Stack:** Bun + Astro + React + Tailwind + SQLite (bun:sqlite) + WebSocket nativo

---

## 📦 Requisitos

- [Bun](https://bun.sh/) >= 1.2
- Git

## 🚀 Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/BrunoJimenez73/br1cg.git
cd br1cg

# 2. Instalar dependencias
bun install

# 3. Poblar DB con datos de ejemplo
bun run db:seed

# 4. Iniciar desarrollo (servidor + astro en paralelo)
bun run dev
```

Esto arranca:
- Servidor Bun en `http://localhost:3001` (API + WS + estáticos)
- Astro dev en `http://localhost:4321` (hot reload)

## 🌐 URLs principales

| URL | Propósito |
|-----|-----------|
| `http://localhost:4321` | Astro dev (hot reload) |
| `http://localhost:3001` | Servidor Bun (API + WS + estáticos) |
| `http://localhost:3001/` | Overlay Library (home) |
| `http://localhost:3001/control` | Control Panel |
| `http://localhost:3001/editor?id=new` | Editor de overlays |
| `ws://localhost:3001/ws` | WebSocket |

## 🎬 Overlays disponibles

15 tipos de overlay:

| Tipo | Descripción | Variantes |
|------|-------------|-----------|
| `lower-third` | Nombre + título | Dropzone, Glaze, On Air, Prime, Palladium |
| `timer` | Cronómetro / cuenta regresiva | Nitrogen, Lithium, Minimal |
| `scorebug` | Marcador deportivo | Soccer, Basketball, Football, Baseball, Hockey, Tennis, Rugby, Volleyball |
| `title-card` | Título fullscreen / banner | Genérico |
| `ticker` | Crawl de texto scrolling | Prime, Headline, Juice, Dusk, Lithium |
| `alert` | Popup de notificación | Genérico |
| `webcam-border` | Frame decorativo para webcam | Minimal, Arc Raiders, Sci-Fi, Fortnite |
| `sponsor-logo` | Logo con fade in/out | Genérico |
| `brb` | Pantalla "Vuelvo enseguida" | Classic, Nursery |
| `2x-counter` | Contador de raids / donaciones | Burst, Glide |
| `money-effect` | Efecto de donación con partículas | Genérico |
| `social-looper` | Rotador de redes sociales | Sociable |
| `weather-bug` | Clima en vivo | Breeze |
| `yt-view-count` | Contador de viewers YouTube | Live |
| `driveby` | Notificación tipo drive-by | Genérico |

Además, **10 Stream Packs** temáticos con paletas coherentes (Accent, Juice, Lithium, Pyrite, Prime, Clean, Horizon, Workflow, Palladium, Stepback).

## 🔧 Comandos disponibles

```bash
bun run dev          # Servidor + Astro en paralelo
bun run dev:server   # Solo servidor (con --watch)
bun run dev:astro    # Solo Astro (hot reload)
bun run build        # Build producción (Astro → dist/)
bun run start        # Servidor producción
bun run db:seed      # Poblar DB con datos de ejemplo

# Testing
bun run test         # Tests de tipos/defaults (vitest)
bun run test:server  # Tests de servidor/DB (bun test)
bun run test:all     # Todos los tests

# Linting
bun run lint         # ESLint check
bun run lint:fix     # ESLint auto-fix
bun run format       # Prettier format
bun run format:check # Prettier check
```

## 📋 Configuración en OBS

1. Agregar fuente **Browser Source** a tu escena
2. URL: `http://localhost:3001/overlay/timer` (o cualquier tipo)
3. Ancho: 1920, Alto: 1080
4. Marcar "Control audio de OBS a través del navegador" (si aplica)
5. Usar el **Control Panel** en `http://localhost:3001/control` para mostrar/ocultar/actualizar

## 🎮 Stream Deck Integration

br1cg expone una API REST optimizada para Stream Deck.

### Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/overlays` | GET | Lista completa de overlays |
| `/api/overlays/:id` | GET | Detalle de un overlay |
| `/api/overlays` | POST | Crear nuevo overlay |
| `/api/overlays/:id` | PUT | Actualizar overlay |
| `/api/overlays/:id` | DELETE | Eliminar overlay |
| `/api/overlays/quick` | GET | Lista ligera (id, name, type, status) |
| `/api/overlays/:id/command` | POST | Enviar comando: `{"action": "show"\|"hide"\|"update"}` |
| `/api/overlays/:id/toggle` | POST | Alternar visibilidad |

### Ejemplos

```bash
# Mostrar overlay
curl -X POST http://localhost:3001/api/overlays/timer-1/command \
  -H "Content-Type: application/json" \
  -d '{"action": "show"}'

# Toggle visibilidad
curl -X POST http://localhost:3001/api/overlays/timer-1/toggle

# Listar overlays
curl http://localhost:3001/api/overlays/quick
```

## 🏗️ Arquitectura

```
Bun Server (server/index.ts)
├── Static Files (Astro build → dist/)
├── WebSocket (/ws) — rooms por overlayId
└── REST API (/api/overlays/*)
    └── SQLite (bun:sqlite) — overlay_configs + templates

Cliente Web → HTTP + WS
Overlay (OBS) ← WS (rooms) ← Control Panel
```

## 🧪 Testing

```bash
# Tests rápidos (tipos, defaults)
bun run test          # vitest — 17 tests

# Tests de servidor (SQLite, WS)
bun run test:server   # bun test — 10 tests

# Todo
bun run test:all
```

## 📚 Documentación adicional

- `AGENTS.md` — Mapa completo del proyecto y workflows para IA/agentes
- `docs/architecture.md` — Decisiones arquitectónicas
- `docs/conventions.md` — Estilo y convenciones de código
- `docs/verification.md` — Criterios de verificación
- `CHECKPOINTS.md` — Checklist de estado final correcto
- `feature_list.json` — Plan de features
- `progress/current.md` — Estado de sesión activa

## 🔧 Skills para Hermes Agent

```bash
skill_view(name='br1cg-session-start')  # Iniciar sesión de trabajo
skill_view(name='br1cg-session-end')    # Cerrar sesión
skill_view(name='br1cg-init')           # Verificar entorno
skill_view(name='br1cg-verify')         # Ejecutar init.ps1
skill_view(name='br1cg-dev')            # Desarrollo diario
skill_view(name='br1cg-new-overlay')    # Nuevo overlay scaffold
skill_view(name='br1cg-new-feature')    # Nueva feature + ticket
```

## 📄 Licencia

MIT © Bruno Jiménez
